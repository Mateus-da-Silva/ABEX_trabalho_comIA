import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Client } from '../database/entities/client.entity';
import dayjs from 'dayjs';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(Client)
    private clientsRepo: Repository<Client>,
  ) {}

  /** Clientes sem visita há X dias */
  async getInactiveClients(clinicId: string, inactiveDays = 60): Promise<Client[]> {
    const cutoffDate = dayjs().subtract(inactiveDays, 'day').toDate();
    return this.clientsRepo.find({
      where: {
        clinicId,
        status: 'active' as any,
        lastVisitAt: LessThan(cutoffDate),
      },
      order: { lastVisitAt: 'ASC' },
      select: ['id', 'name', 'phone', 'whatsapp', 'email', 'lastVisitAt', 'totalSpent'],
    });
  }

  /** Aniversariantes do mês */
  async getBirthdayClients(clinicId: string, month?: number): Promise<Client[]> {
    const targetMonth = month || dayjs().month() + 1;
    return this.clientsRepo
      .createQueryBuilder('c')
      .where('c.clinic_id = :clinicId', { clinicId })
      .andWhere('c.status = :status', { status: 'active' })
      .andWhere('MONTH(c.birth_date) = :month', { month: targetMonth })
      .andWhere('c.birth_date IS NOT NULL')
      .select(['c.id', 'c.name', 'c.phone', 'c.whatsapp', 'c.birthDate'])
      .getMany();
  }

  /** Clientes VIP (maior gasto) */
  async getVipClients(clinicId: string, limit = 20): Promise<Client[]> {
    return this.clientsRepo.find({
      where: { clinicId, status: 'active' as any },
      order: { totalSpent: 'DESC' },
      take: limit,
      select: ['id', 'name', 'phone', 'whatsapp', 'totalSpent', 'totalVisits'],
    });
  }

  /** Clientes que ainda não retornaram depois de X dias de uma visita */
  async getReturnReminders(clinicId: string, daysSinceVisit = 30): Promise<Client[]> {
    const cutoffDate = dayjs().subtract(daysSinceVisit, 'day').toDate();
    const windowStart = dayjs().subtract(daysSinceVisit + 7, 'day').toDate();

    return this.clientsRepo
      .createQueryBuilder('c')
      .where('c.clinic_id = :clinicId', { clinicId })
      .andWhere('c.status = :status', { status: 'active' })
      .andWhere('c.last_visit_at BETWEEN :windowStart AND :cutoffDate', {
        windowStart,
        cutoffDate,
      })
      .select(['c.id', 'c.name', 'c.phone', 'c.whatsapp', 'c.lastVisitAt'])
      .getMany();
  }
}
