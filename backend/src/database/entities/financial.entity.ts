import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Clinic } from './clinic.entity';
import { Client } from './client.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer',
  BOLETO = 'boleto',
  PACKAGE = 'package',
  COURTESY = 'courtesy',
}

export enum TransactionCategory {
  SERVICE_PAYMENT = 'service_payment',
  PACKAGE_SALE = 'package_sale',
  PRODUCT_SALE = 'product_sale',
  OTHER_INCOME = 'other_income',
  RENT = 'rent',
  SALARY = 'salary',
  COMMISSION = 'commission',
  SUPPLIES = 'supplies',
  EQUIPMENT = 'equipment',
  MARKETING = 'marketing',
  UTILITIES = 'utilities',
  TAXES = 'taxes',
  OTHER_EXPENSE = 'other_expense',
}

@Entity('financial_transactions')
@Index(['clinicId', 'dueDate'])
@Index(['clinicId', 'type', 'status'])
export class FinancialTransaction extends BaseEntity {
  @Column({ name: 'clinic_id' })
  @Index()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ name: 'client_id', nullable: true })
  clientId?: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client?: Client;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId?: string;

  @Column({ name: 'package_id', nullable: true })
  packageId?: string;

  @Column({ name: 'professional_id', nullable: true })
  professionalId?: string;

  @Column({ length: 200 })
  description: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionCategory })
  category: TransactionCategory;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'discount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true, name: 'payment_method' })
  paymentMethod?: PaymentMethod;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  // MySQL: timestamp em vez de timestamptz
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ name: 'installments', default: 1 })
  installments: number;

  @Column({ name: 'installment_number', default: 1 })
  installmentNumber: number;

  @Column({ name: 'pix_key', length: 150, nullable: true })
  pixKey?: string;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'external_payment_id', length: 200, nullable: true })
  externalPaymentId?: string;
}
