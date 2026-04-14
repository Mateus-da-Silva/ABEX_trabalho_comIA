import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Clinic } from './clinic.entity';

export enum StockMovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
  ADJUSTMENT = 'adjustment',
  WASTE = 'waste',
}

@Entity('stock_products')
export class StockProduct extends BaseEntity {
  @Column({ name: 'clinic_id' })
  @Index()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 50, nullable: true })
  brand?: string;

  @Column({ length: 50, nullable: true })
  sku?: string;

  @Column({ length: 20, nullable: true })
  unit?: string;

  @Column({ name: 'current_quantity', type: 'decimal', precision: 10, scale: 3, default: 0 })
  currentQuantity: number;

  @Column({ name: 'min_quantity', type: 'decimal', precision: 10, scale: 3, default: 0 })
  minQuantity: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitCost: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ name: 'category', length: 80, nullable: true })
  category?: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'location', length: 100, nullable: true })
  location?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;
}

@Entity('stock_movements')
export class StockMovement extends BaseEntity {
  @Column({ name: 'clinic_id' })
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => StockProduct)
  @JoinColumn({ name: 'product_id' })
  product: StockProduct;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId?: string;

  @Column({ name: 'service_id', nullable: true })
  serviceId?: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ length: 200, nullable: true })
  reason?: string;

  @Column({ name: 'quantity_before', type: 'decimal', precision: 10, scale: 3 })
  quantityBefore: number;

  @Column({ name: 'quantity_after', type: 'decimal', precision: 10, scale: 3 })
  quantityAfter: number;
}
