import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Clinic } from './clinic.entity';
import { User } from './user.entity';

@Entity('professionals')
export class Professional extends BaseEntity {
  @Column({ name: 'clinic_id' })
  @Index()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 100, nullable: true })
  specialty?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 200, nullable: true })
  email?: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'color', length: 7, default: '#6366f1' })
  color: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'commission_percentage', type: 'decimal', precision: 5, scale: 2, default: 30 })
  commissionPercentage: number;

  // MySQL: JSON em vez de JSONB
  @Column({ type: 'json', nullable: true, name: 'working_hours' })
  workingHours?: Record<string, {
    enabled: boolean;
    start: string;
    end: string;
    breaks?: { start: string; end: string }[];
  }>;

  // MySQL: JSON em vez de TEXT[]
  @Column({ name: 'service_ids', type: 'json', nullable: true })
  serviceIds: string[];

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'total_appointments', default: 0 })
  totalAppointments: number;

  @Column({ name: 'rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;
}
