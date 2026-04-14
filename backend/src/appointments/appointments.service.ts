import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';

import { Appointment, AppointmentStatus } from '../database/entities/appointment.entity';
import { Service } from '../database/entities/service.entity';
import { Professional } from '../database/entities/professional.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepo: Repository<Appointment>,
    @InjectRepository(Service)
    private servicesRepo: Repository<Service>,
    @InjectRepository(Professional)
    private professionalsRepo: Repository<Professional>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(clinicId: string, dto: CreateAppointmentDto): Promise<Appointment> {
    // Buscar serviço para calcular duração e preço
    const service = await this.servicesRepo.findOne({
      where: { id: dto.serviceId, clinicId },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    // Buscar profissional
    const professional = await this.professionalsRepo.findOne({
      where: { id: dto.professionalId, clinicId, isActive: true },
    });
    if (!professional) throw new NotFoundException('Profissional não encontrado');

    const startAt = dayjs(dto.startAt);
    const durationMinutes = dto.durationMinutes || service.durationMinutes;
    const endAt = startAt.add(durationMinutes, 'minute');

    // Verificar conflito de horário para o mesmo profissional
    const conflict = await this.checkConflict(
      clinicId,
      dto.professionalId,
      startAt.toDate(),
      endAt.toDate(),
    );

    if (conflict) {
      throw new ConflictException(
        `Profissional já tem um agendamento neste horário: ${dayjs(conflict.startAt).format('HH:mm')} - ${dayjs(conflict.endAt).format('HH:mm')}`,
      );
    }

    const discount = dto.discount || 0;
    const finalPrice = service.price - discount;

    const appointment = this.appointmentsRepo.create({
      ...dto,
      clinicId,
      startAt: startAt.toDate(),
      endAt: endAt.toDate(),
      durationMinutes,
      price: service.price,
      discount,
      finalPrice,
      status: AppointmentStatus.SCHEDULED,
    });

    const saved = await this.appointmentsRepo.save(appointment);

    // Emitir evento para notificações (WhatsApp, email)
    this.eventEmitter.emit('appointment.created', {
      appointmentId: saved.id,
      clinicId,
      clientId: dto.clientId,
    });

    return saved;
  }

  /**
   * Retorna agendamentos para a agenda visual (calendário)
   */
  async getCalendar(
    clinicId: string,
    startDate: Date,
    endDate: Date,
    professionalId?: string,
  ) {
    const where: any = {
      clinicId,
      startAt: Between(startDate, endDate),
      status: Not(In([AppointmentStatus.CANCELLED])),
    };

    if (professionalId) where.professionalId = professionalId;

    const appointments = await this.appointmentsRepo.find({
      where,
      relations: ['client', 'service', 'professional'],
      order: { startAt: 'ASC' },
    });

    // Formatar para o calendário
    return appointments.map((apt) => ({
      id: apt.id,
      title: apt.client?.name,
      start: apt.startAt,
      end: apt.endAt,
      status: apt.status,
      service: apt.service?.name,
      professional: apt.professional?.name,
      professionalColor: apt.professional?.color,
      serviceColor: apt.service?.color,
      price: apt.finalPrice,
      notes: apt.notes,
    }));
  }

  async findOne(clinicId: string, id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepo.findOne({
      where: { id, clinicId },
      relations: ['client', 'service', 'professional'],
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    return appointment;
  }

  async updateStatus(
    clinicId: string,
    id: string,
    status: AppointmentStatus,
    notes?: string,
  ) {
    const appointment = await this.findOne(clinicId, id);

    appointment.status = status;
    if (notes) appointment.clientNotes = notes;

    if (status === AppointmentStatus.CONFIRMED) {
      appointment.confirmedAt = new Date();
    }
    if (status === AppointmentStatus.CANCELLED) {
      appointment.cancelledAt = new Date();
      appointment.cancellationReason = notes;
    }
    if (status === AppointmentStatus.COMPLETED) {
      // Atualizar totais do cliente
      this.eventEmitter.emit('appointment.completed', {
        appointmentId: id,
        clinicId,
        clientId: appointment.clientId,
        value: appointment.finalPrice,
        professionalId: appointment.professionalId,
        commissionPercentage: appointment.professional?.commissionPercentage,
      });
    }

    return this.appointmentsRepo.save(appointment);
  }

  async update(clinicId: string, id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(clinicId, id);
    Object.assign(appointment, dto);
    return this.appointmentsRepo.save(appointment);
  }

  /**
   * Verificar disponibilidade de um profissional num horário
   */
  async getAvailableSlots(
    clinicId: string,
    professionalId: string,
    serviceId: string,
    date: string,
  ) {
    const service = await this.servicesRepo.findOne({
      where: { id: serviceId, clinicId },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const professional = await this.professionalsRepo.findOne({
      where: { id: professionalId, clinicId },
    });
    if (!professional) throw new NotFoundException('Profissional não encontrado');

    const dayOfWeek = dayjs(date).day();
    const workingHours = professional.workingHours?.[dayOfWeek];

    if (!workingHours?.enabled) {
      return { date, slots: [], message: 'Profissional não trabalha neste dia' };
    }

    const dayStart = dayjs(`${date} ${workingHours.start}`);
    const dayEnd = dayjs(`${date} ${workingHours.end}`);
    const duration = service.durationMinutes;

    // Buscar agendamentos do dia
    const existingAppointments = await this.appointmentsRepo.find({
      where: {
        clinicId,
        professionalId,
        startAt: Between(dayStart.toDate(), dayEnd.toDate()),
        status: Not(In([AppointmentStatus.CANCELLED])),
      },
      order: { startAt: 'ASC' },
    });

    // Gerar slots disponíveis
    const slots: { time: string; available: boolean }[] = [];
    let current = dayStart;

    while (current.add(duration, 'minute').isBefore(dayEnd) || current.add(duration, 'minute').isSame(dayEnd)) {
      const slotEnd = current.add(duration, 'minute');

      const isBooked = existingAppointments.some((apt) => {
        const aptStart = dayjs(apt.startAt);
        const aptEnd = dayjs(apt.endAt);
        return current.isBefore(aptEnd) && slotEnd.isAfter(aptStart);
      });

      const isBreak = workingHours.breaks?.some((b) => {
        const breakStart = dayjs(`${date} ${b.start}`);
        const breakEnd = dayjs(`${date} ${b.end}`);
        return current.isBefore(breakEnd) && slotEnd.isAfter(breakStart);
      });

      slots.push({
        time: current.format('HH:mm'),
        available: !isBooked && !isBreak,
      });

      current = current.add(30, 'minute'); // Intervalos de 30 min
    }

    return { date, slots };
  }

  async getDashboardStats(clinicId: string) {
    const today = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();
    const monthStart = dayjs().startOf('month').toDate();
    const monthEnd = dayjs().endOf('month').toDate();

    const [
      todayCount,
      monthCount,
      completedMonth,
      cancelledMonth,
      revenue,
    ] = await Promise.all([
      this.appointmentsRepo.count({
        where: { clinicId, startAt: Between(today, todayEnd), status: Not(AppointmentStatus.CANCELLED) },
      }),
      this.appointmentsRepo.count({
        where: { clinicId, startAt: Between(monthStart, monthEnd) },
      }),
      this.appointmentsRepo.count({
        where: { clinicId, startAt: Between(monthStart, monthEnd), status: AppointmentStatus.COMPLETED },
      }),
      this.appointmentsRepo.count({
        where: { clinicId, startAt: Between(monthStart, monthEnd), status: AppointmentStatus.CANCELLED },
      }),
      this.appointmentsRepo
        .createQueryBuilder('a')
        .select('SUM(a.final_price)', 'total')
        .where('a.clinic_id = :clinicId', { clinicId })
        .andWhere('a.start_at BETWEEN :start AND :end', { start: monthStart, end: monthEnd })
        .andWhere('a.status = :status', { status: AppointmentStatus.COMPLETED })
        .getRawOne(),
    ]);

    const absenceRate = monthCount > 0
      ? ((cancelledMonth / monthCount) * 100).toFixed(1)
      : '0';

    return {
      today: todayCount,
      month: monthCount,
      completedMonth,
      cancelledMonth,
      absenceRate: `${absenceRate}%`,
      monthRevenue: parseFloat(revenue?.total || '0'),
    };
  }

  private async checkConflict(
    clinicId: string,
    professionalId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ): Promise<Appointment | null> {
    const qb = this.appointmentsRepo
      .createQueryBuilder('a')
      .where('a.clinic_id = :clinicId', { clinicId })
      .andWhere('a.professional_id = :professionalId', { professionalId })
      .andWhere('a.status NOT IN (:...statuses)', {
        statuses: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
      })
      .andWhere('a.start_at < :endAt', { endAt })
      .andWhere('a.end_at > :startAt', { startAt });

    if (excludeId) qb.andWhere('a.id != :excludeId', { excludeId });

    return qb.getOne();
  }
}
