import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Clinic } from './clinic.entity';

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export enum Gender {
  FEMALE = 'female',
  MALE = 'male',
  OTHER = 'other',
  NOT_INFORMED = 'not_informed',
}

@Entity('clients')
export class Client extends BaseEntity {
  @Column({ name: 'clinic_id' })
  @Index()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 14, nullable: true })
  cpf?: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'enum', enum: Gender, default: Gender.NOT_INFORMED })
  gender: Gender;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'whatsapp', length: 20, nullable: true })
  whatsapp?: string;

  @Column({ length: 200, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 2, nullable: true })
  state?: string;

  @Column({ length: 9, nullable: true, name: 'zip_code' })
  zipCode?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'how_found_us', length: 100, nullable: true })
  howFoundUs?: string;

  @Column({ name: 'referred_by_id', nullable: true })
  referredById?: string;

  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.ACTIVE })
  status: ClientStatus;

  @Column({ name: 'first_visit_at', type: 'date', nullable: true })
  firstVisitAt?: Date;

  @Column({ name: 'last_visit_at', type: 'date', nullable: true })
  lastVisitAt?: Date;

  @Column({ name: 'total_spent', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ name: 'total_visits', default: 0 })
  totalVisits: number;

  // MySQL: JSON (equivalente ao JSONB do Postgres)
  @Column({ type: 'json', nullable: true })
  anamnesis?: {
    allergies?: string;
    medications?: string;
    skinType?: string;
    skinConditions?: string[];
    pregnancyStatus?: boolean;
    healthIssues?: string;
    previousTreatments?: string;
    contraindications?: string;
    observations?: string;
    signedAt?: string;
  };

  // MySQL não tem arrays nativos — armazena como JSON
  @Column({ name: 'photo_urls', type: 'json', nullable: true })
  photoUrls: string[];

  @Column({ name: 'loyalty_points', default: 0 })
  loyaltyPoints: number;
}
