import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from '../database/entities/clinic.entity';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private clinicsRepo: Repository<Clinic>,
  ) {}

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.clinicsRepo.findOne({ where: { id } });
    if (!clinic) throw new NotFoundException('Clínica não encontrada');
    return clinic;
  }

  async findBySlug(slug: string): Promise<Clinic> {
    const clinic = await this.clinicsRepo.findOne({ where: { slug } });
    if (!clinic) throw new NotFoundException('Clínica não encontrada');
    return clinic;
  }

  async update(id: string, data: Partial<Clinic>): Promise<Clinic> {
    await this.clinicsRepo.update(id, data);
    return this.findOne(id);
  }

  async findAll(): Promise<Clinic[]> {
    return this.clinicsRepo.find({ order: { createdAt: 'DESC' } });
  }
}
