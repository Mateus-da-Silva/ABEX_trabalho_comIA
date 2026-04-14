import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  FinancialTransaction,
  TransactionType,
  TransactionStatus,
} from '../database/entities/financial.entity';
import dayjs from 'dayjs';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private transactionsRepo: Repository<FinancialTransaction>,
  ) {}

  async create(clinicId: string, data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    const tx = this.transactionsRepo.create({ ...data, clinicId });
    return this.transactionsRepo.save(tx);
  }

  async findAll(clinicId: string, filters: {
    type?: TransactionType;
    status?: TransactionStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { type, status, startDate, endDate, page = 1, limit = 30 } = filters;

    const qb = this.transactionsRepo.createQueryBuilder('ft')
      .leftJoinAndSelect('ft.client', 'client')
      .where('ft.clinic_id = :clinicId', { clinicId })
      .andWhere('ft.deleted_at IS NULL')
      .orderBy('ft.due_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (type) qb.andWhere('ft.type = :type', { type });
    if (status) qb.andWhere('ft.status = :status', { status });
    if (startDate) qb.andWhere('ft.due_date >= :startDate', { startDate });
    if (endDate) qb.andWhere('ft.due_date <= :endDate', { endDate });

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(clinicId: string, id: string): Promise<FinancialTransaction> {
    const tx = await this.transactionsRepo.findOne({
      where: { id, clinicId },
      relations: ['client'],
    });
    if (!tx) throw new NotFoundException('Transação não encontrada');
    return tx;
  }

  async markAsPaid(clinicId: string, id: string, paidAt?: Date): Promise<FinancialTransaction> {
    const tx = await this.findOne(clinicId, id);
    tx.status = TransactionStatus.PAID;
    tx.paidAt = paidAt || new Date();
    return this.transactionsRepo.save(tx);
  }

  async getCashFlow(clinicId: string, year: number, month: number) {
    const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').toDate();
    const end = dayjs(start).endOf('month').toDate();

    const transactions = await this.transactionsRepo.find({
      where: {
        clinicId,
        status: TransactionStatus.PAID,
        paidAt: Between(start, end),
      },
      order: { paidAt: 'ASC' },
    });

    const income = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.finalAmount), 0);

    const expense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.finalAmount), 0);

    return {
      income,
      expense,
      balance: income - expense,
      transactions,
    };
  }

  async getSummary(clinicId: string) {
    const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
    const monthEnd = dayjs().endOf('month').format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');

    const [receivable, payable, overdueCount] = await Promise.all([
      this.transactionsRepo
        .createQueryBuilder('ft')
        .select('SUM(ft.final_amount)', 'total')
        .where('ft.clinic_id = :clinicId', { clinicId })
        .andWhere('ft.type = :type', { type: TransactionType.INCOME })
        .andWhere('ft.status = :status', { status: TransactionStatus.PENDING })
        .andWhere('ft.due_date BETWEEN :start AND :end', { start: monthStart, end: monthEnd })
        .getRawOne(),

      this.transactionsRepo
        .createQueryBuilder('ft')
        .select('SUM(ft.final_amount)', 'total')
        .where('ft.clinic_id = :clinicId', { clinicId })
        .andWhere('ft.type = :type', { type: TransactionType.EXPENSE })
        .andWhere('ft.status = :status', { status: TransactionStatus.PENDING })
        .andWhere('ft.due_date BETWEEN :start AND :end', { start: monthStart, end: monthEnd })
        .getRawOne(),

      this.transactionsRepo.count({
        where: { clinicId, status: TransactionStatus.OVERDUE },
      }),
    ]);

    return {
      receivable: parseFloat(receivable?.total || '0'),
      payable: parseFloat(payable?.total || '0'),
      overdueCount,
    };
  }
}
