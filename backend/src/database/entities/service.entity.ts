import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Clinic } from './clinic.entity';

export enum ServiceCategory {
  FACIAL = 'facial',
  CORPORAL = 'corporal',
  LASER = 'laser',
  MASSAGEM = 'massagem',
  ESTETICA_AVANCADA = 'estetica_avancada',
  DEPILACAO = 'depilacao',
  UNHA = 'unha',
  MAQUIAGEM = 'maquiagem',
  OUTROS = 'outros',
}

@Entity('services')
export class Service extends BaseEntity {
  @Column({ name: 'clinic_id' })
  @Index()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ServiceCategory, default: ServiceCategory.OUTROS })
  category: ServiceCategory;

  @Column({ name: 'duration_minutes', default: 60 })
  durationMinutes: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ name: 'commission_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionPercentage: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // MySQL: JSON em vez de TEXT[]
  @Column({ name: 'requires_equipment', type: 'json', nullable: true })
  requiresEquipment: string[];

  @Column({ name: 'color', length: 7, default: '#6366f1' })
  color: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ name: 'max_sessions_package', nullable: true })
  maxSessionsPackage?: number;

  @Column({ type: 'text', nullable: true, name: 'post_care_instructions' })
  postCareInstructions?: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
