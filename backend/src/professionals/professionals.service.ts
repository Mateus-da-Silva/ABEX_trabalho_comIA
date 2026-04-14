import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from '../database/entities/professional.entity';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(Professional)
    private professionalsRepo: Repository<Professional>,
  ) {}

  async create(clinicId: string, data: Partial<Professional>): Promise<Professional> {
    const professional = this.professionalsRepo.create({ ...data, clinicId });
    return this.professionalsRepo.save(professional);
  }

  async findAll(clinicId: string): Promise<Professional[]> {
    return this.professionalsRepo.find({
      where: { clinicId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(clinicId: string, id: string): Promise<Professional> {
    const professional = await this.professionalsRepo.findOne({ where: { id, clinicId } });
    if (!professional) throw new NotFoundException('Profissional não encontrado');
    return professional;
  }

  async update(clinicId: string, id: string, data: Partial<Professional>): Promise<Professional> {
    await this.findOne(clinicId, id);
    await this.professionalsRepo.update({ id, clinicId }, data);
    return this.findOne(clinicId, id);
  }

  async remove(clinicId: string, id: string): Promise<void> {
    const professional = await this.findOne(clinicId, id);
    await this.professionalsRepo.softRemove(professional);
  }
}
