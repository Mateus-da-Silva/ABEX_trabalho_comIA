import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Clinic } from './clinic.entity';
import { Client } from './client.entity';
import { Service } from './service.entity';
import { Professional } from './professional.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

export enum AppointmentOrigin {
  MANUAL = 'manual',
  ONLINE = 'online',
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  PHONE = 'phone',
}

@Entity('appointments')
@Index(['clinicId', 'startAt'])
@Index(['clinicId', 'professionalId', 'startAt'])
export class Appointment extends BaseEntity {
  @Column({ name: 'clinic_id' })
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'service_id' })
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'professional_id' })
  professionalId: string;

  @ManyToOne(() => Professional)
  @JoinColumn({ name: 'professional_id' })
  professional: Professional;

  @Column({ name: 'package_session_id', nullable: true })
  packageSessionId?: string;

  // MySQL: timestamp em vez de timestamptz
  @Column({ name: 'start_at', type: 'timestamp' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamp' })
  endAt: Date;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Column({ type: 'enum', enum: AppointmentOrigin, default: AppointmentOrigin.MANUAL })
  origin: AppointmentOrigin;

  @Column({ name: 'room', length: 50, nullable: true })
  room?: string;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'discount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'final_price', type: 'decimal', precision: 10, scale: 2 })
  finalPrice: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'client_notes', type: 'text', nullable: true })
  clientNotes?: string;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'reminder_sent', default: false })
  reminderSent: boolean;

  @Column({ name: 'rating', nullable: true })
  rating?: number;

  @Column({ name: 'commission_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  commissionValue?: number;
}
