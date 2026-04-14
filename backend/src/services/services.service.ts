import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../database/entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepo: Repository<Service>,
  ) {}

  async create(clinicId: string, data: Partial<Service>): Promise<Service> {
    const service = this.servicesRepo.create({ ...data, clinicId });
    return this.servicesRepo.save(service);
  }

  async findAll(clinicId: string): Promise<Service[]> {
    return this.servicesRepo.find({
      where: { clinicId, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(clinicId: string, id: string): Promise<Service> {
    const service = await this.servicesRepo.findOne({ where: { id, clinicId } });
    if (!service) throw new NotFoundException('Serviço não encontrado');
    return service;
  }

  async update(clinicId: string, id: string, data: Partial<Service>): Promise<Service> {
    await this.findOne(clinicId, id);
    await this.servicesRepo.update({ id, clinicId }, data);
    return this.findOne(clinicId, id);
  }

  async remove(clinicId: string, id: string): Promise<void> {
    const service = await this.findOne(clinicId, id);
    await this.servicesRepo.softRemove(service);
  }
}
