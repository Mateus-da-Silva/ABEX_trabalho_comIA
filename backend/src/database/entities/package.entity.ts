import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Clinic } from './clinic.entity';
import { Client } from './client.entity';
import { Service } from './service.entity';

export enum PackageStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('client_packages')
export class ClientPackage extends BaseEntity {
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

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'total_sessions' })
  totalSessions: number;

  @Column({ name: 'used_sessions', default: 0 })
  usedSessions: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ name: 'price_per_session', type: 'decimal', precision: 10, scale: 2 })
  pricePerSession: number;

  @Column({ type: 'enum', enum: PackageStatus, default: PackageStatus.ACTIVE })
  status: PackageStatus;

  @Column({ name: 'purchased_at', type: 'date' })
  purchasedAt: Date;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('package_sessions')
export class PackageSession extends BaseEntity {
  @Column({ name: 'package_id' })
  packageId: string;

  @ManyToOne(() => ClientPackage)
  @JoinColumn({ name: 'package_id' })
  package: ClientPackage;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId?: string;

  @Column({ name: 'session_number' })
  sessionNumber: number;

  // MySQL: timestamp em vez de timestamptz
  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;
}
