import {
  Controller, Get, Post, Patch, Body, Param, Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { AppointmentStatus } from '../database/entities/appointment.entity';
import { IsEnum, IsOptional, IsString } from 'class-validator';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo agendamento' })
  create(@CurrentTenant() clinicId: string, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(clinicId, dto);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Buscar agendamentos para o calendário' })
  @ApiQuery({ name: 'start', required: true, description: 'Data início (ISO)' })
  @ApiQuery({ name: 'end', required: true, description: 'Data fim (ISO)' })
  @ApiQuery({ name: 'professionalId', required: false })
  getCalendar(
    @CurrentTenant() clinicId: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('professionalId') professionalId?: string,
  ) {
    return this.appointmentsService.getCalendar(
      clinicId,
      new Date(start),
      new Date(end),
      professionalId,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de agendamentos para o dashboard' })
  getStats(@CurrentTenant() clinicId: string) {
    return this.appointmentsService.getDashboardStats(clinicId);
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Horários disponíveis de um profissional' })
  @ApiQuery({ name: 'professionalId', required: true })
  @ApiQuery({ name: 'serviceId', required: true })
  @ApiQuery({ name: 'date', required: true, description: 'Data (YYYY-MM-DD)' })
  getAvailableSlots(
    @CurrentTenant() clinicId: string,
    @Query('professionalId') professionalId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(clinicId, professionalId, serviceId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  findOne(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.appointmentsService.findOne(clinicId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  update(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(clinicId, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do agendamento' })
  updateStatus(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: AppointmentStatus,
    @Body('notes') notes?: string,
  ) {
    return this.appointmentsService.updateStatus(clinicId, id, status, notes);
  }
}
