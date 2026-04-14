import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindManyOptions } from 'typeorm';
import { Client, ClientStatus } from '../database/entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

export interface ClientFilters {
  search?: string;
  status?: ClientStatus;
  page?: number;
  limit?: number;
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepo: Repository<Client>,
  ) {}

  async create(clinicId: string, dto: CreateClientDto): Promise<Client> {
    // Verificar duplicata por CPF dentro da mesma clínica
    if (dto.cpf) {
      const existing = await this.clientsRepo.findOne({
        where: { clinicId, cpf: dto.cpf },
      });
      if (existing) {
        throw new ConflictException('Já existe um cliente com este CPF nesta clínica');
      }
    }

    const client = this.clientsRepo.create({
      ...dto,
      clinicId,
      firstVisitAt: new Date(),
    });

    return this.clientsRepo.save(client);
  }

  async findAll(clinicId: string, filters: ClientFilters = {}) {
    const { search, status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { clinicId };
    if (status) where.status = status;
    if (search) where.name = ILike(`%${search}%`);

    const [data, total] = await this.clientsRepo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(clinicId: string, id: string): Promise<Client> {
    const client = await this.clientsRepo.findOne({ where: { id, clinicId } });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async update(clinicId: string, id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(clinicId, id);
    Object.assign(client, dto);
    return this.clientsRepo.save(client);
  }

  async remove(clinicId: string, id: string): Promise<void> {
    const client = await this.findOne(clinicId, id);
    await this.clientsRepo.softRemove(client);
  }

  async getStats(clinicId: string) {
    const total = await this.clientsRepo.count({ where: { clinicId } });

    const newThisMonth = await this.clientsRepo
      .createQueryBuilder('c')
      .where('c.clinic_id = :clinicId', { clinicId })
      .andWhere("YEAR(c.created_at) = YEAR(NOW()) AND MONTH(c.created_at) = MONTH(NOW())")
      .getCount();

    const topClients = await this.clientsRepo.find({
      where: { clinicId },
      order: { totalSpent: 'DESC' },
      take: 5,
      select: ['id', 'name', 'totalSpent', 'totalVisits', 'lastVisitAt'],
    });

    return { total, newThisMonth, topClients };
  }

  async getHistory(clinicId: string, clientId: string) {
    // Busca histórico de atendimentos do cliente
    // (relacionamento com appointments resolvido via JOIN)
    const client = await this.clientsRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('appointments', 'a', 'a.client_id = c.id AND a.clinic_id = :clinicId', { clinicId })
      .where('c.id = :clientId', { clientId })
      .andWhere('c.clinic_id = :clinicId', { clinicId })
      .getOne();

    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }
}
