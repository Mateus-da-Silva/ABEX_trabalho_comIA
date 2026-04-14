import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientPackage, PackageSession, PackageStatus } from '../database/entities/package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(ClientPackage)
    private packagesRepo: Repository<ClientPackage>,
    @InjectRepository(PackageSession)
    private sessionsRepo: Repository<PackageSession>,
  ) {}

  async create(clinicId: string, data: Partial<ClientPackage>): Promise<ClientPackage> {
    const pkg = this.packagesRepo.create({ ...data, clinicId });
    const saved = await this.packagesRepo.save(pkg);

    // Criar sessões individuais
    const sessions = Array.from({ length: saved.totalSessions }, (_, i) =>
      this.sessionsRepo.create({ packageId: saved.id, sessionNumber: i + 1 }),
    );
    await this.sessionsRepo.save(sessions);

    return saved;
  }

  async findAllByClient(clinicId: string, clientId: string): Promise<ClientPackage[]> {
    return this.packagesRepo.find({
      where: { clinicId, clientId },
      relations: ['service'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(clinicId: string, id: string): Promise<ClientPackage> {
    const pkg = await this.packagesRepo.findOne({
      where: { id, clinicId },
      relations: ['service', 'client'],
    });
    if (!pkg) throw new NotFoundException('Pacote não encontrado');
    return pkg;
  }

  async useSession(clinicId: string, packageId: string, appointmentId: string): Promise<PackageSession> {
    const pkg = await this.findOne(clinicId, packageId);

    if (pkg.status !== PackageStatus.ACTIVE) {
      throw new BadRequestException('Este pacote não está ativo');
    }
    if (pkg.usedSessions >= pkg.totalSessions) {
      throw new BadRequestException('Todas as sessões deste pacote já foram utilizadas');
    }

    // Marcar sessão como usada
    const session = await this.sessionsRepo.findOne({
      where: { packageId, completedAt: undefined },
      order: { sessionNumber: 'ASC' },
    });

    if (session) {
      session.completedAt = new Date();
      session.appointmentId = appointmentId;
      await this.sessionsRepo.save(session);
    }

    // Incrementar contador
    pkg.usedSessions += 1;
    if (pkg.usedSessions >= pkg.totalSessions) {
      pkg.status = PackageStatus.COMPLETED;
    }
    await this.packagesRepo.save(pkg);

    return session!;
  }

  async getSessions(packageId: string): Promise<PackageSession[]> {
    return this.sessionsRepo.find({
      where: { packageId },
      order: { sessionNumber: 'ASC' },
    });
  }
}
