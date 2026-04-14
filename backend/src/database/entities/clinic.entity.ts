import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum ClinicPlan {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
}

export enum ClinicStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

@Entity('clinics')
export class Clinic extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ name: 'cnpj', length: 18, nullable: true })
  cnpj?: string;

  @Column({ name: 'owner_name', length: 150 })
  ownerName: string;

  @Column({ name: 'owner_email', length: 200 })
  ownerEmail: string;

  @Column({ name: 'owner_phone', length: 20 })
  ownerPhone: string;

  @Column({ length: 200, nullable: true })
  address?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 2, nullable: true })
  state?: string;

  @Column({ name: 'zip_code', length: 9, nullable: true })
  zipCode?: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl?: string;

  @Column({ name: 'primary_color', length: 7, default: '#6366f1' })
  primaryColor: string;

  @Column({ type: 'enum', enum: ClinicPlan, default: ClinicPlan.STARTER })
  plan: ClinicPlan;

  @Column({ type: 'enum', enum: ClinicStatus, default: ClinicStatus.TRIAL })
  status: ClinicStatus;

  @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
  trialEndsAt?: Date;

  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId?: string;

  // MySQL: JSON em vez de JSONB (funciona igual, sem índices GIN)
  @Column({ type: 'json', nullable: true })
  settings?: Record<string, any>;

  @Column({ name: 'max_professionals', default: 1 })
  maxProfessionals: number;

  @Column({ name: 'timezone', length: 60, default: 'America/Sao_Paulo' })
  timezone: string;
}
