import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { User } from '../database/entities/user.entity';
import { Clinic, ClinicStatus } from '../database/entities/clinic.entity';
import { UserRole } from '../common/decorators/roles.decorator';
import { RegisterClinicDto } from './dto/register-clinic.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: UserRole;
  clinic_id: string; // tenant
  clinic_slug: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: Partial<User>;
  clinic: Partial<Clinic>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Clinic)
    private clinicsRepo: Repository<Clinic>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  /**
   * Registro de nova clínica (onboarding SaaS)
   * Cria a clínica + usuário owner em uma transação
   */
  async registerClinic(dto: RegisterClinicDto): Promise<AuthTokens> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar se slug já existe
      const slugExists = await this.clinicsRepo.findOne({
        where: { slug: dto.slug },
      });
      if (slugExists) {
        throw new ConflictException('Este identificador de clínica já está em uso');
      }

      // Verificar se email já existe
      const emailExists = await this.usersRepo.findOne({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException('Este e-mail já está cadastrado');
      }

      // Criar clínica
      const clinic = this.clinicsRepo.create({
        name: dto.clinicName,
        slug: dto.slug,
        ownerName: dto.name,
        ownerEmail: dto.email,
        ownerPhone: dto.phone,
        plan: dto.plan || 'starter' as any,
        status: ClinicStatus.TRIAL,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias trial
      });

      const savedClinic = await queryRunner.manager.save(clinic);

      // Criar usuário owner
      const user = this.usersRepo.create({
        name: dto.name,
        email: dto.email,
        password: dto.password,
        phone: dto.phone,
        role: UserRole.CLINIC_OWNER,
        clinicId: savedClinic.id,
        emailVerifiedAt: new Date(), // verificação simplificada no trial
      });

      const savedUser = await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return this.generateTokens(savedUser, savedClinic);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Login com email e senha
   */
  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      relations: ['clinic'],
    });

    if (!user || !(await user.validatePassword(dto.password))) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada. Entre em contato com o suporte');
    }

    // Atualizar último login
    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });

    return this.generateTokens(user, user.clinic);
  }

  /**
   * Refresh de token JWT
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET') + '_refresh',
      });

      const user = await this.usersRepo.findOne({
        where: { id: payload.sub },
        relations: ['clinic'],
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token inválido');
      }

      return this.generateTokens(user, user.clinic);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  /**
   * Perfil do usuário autenticado
   */
  async getProfile(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['clinic'],
      select: ['id', 'name', 'email', 'phone', 'role', 'avatarUrl', 'preferences', 'createdAt'],
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  private generateTokens(user: User, clinic: Clinic): AuthTokens {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clinic_id: clinic?.id,
      clinic_slug: clinic?.slug,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET') + '_refresh',
      expiresIn: '30d',
    });

    const { password, refreshToken: _rt, ...safeUser } = user as any;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 7 * 24 * 60 * 60, // 7 dias em segundos
      user: safeUser,
      clinic: clinic
        ? {
            id: clinic.id,
            name: clinic.name,
            slug: clinic.slug,
            plan: clinic.plan,
            status: clinic.status,
            logoUrl: clinic.logoUrl,
            primaryColor: clinic.primaryColor,
          }
        : null,
    };
  }
}
