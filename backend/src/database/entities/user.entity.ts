import { Entity, Column, ManyToOne, JoinColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { BaseEntity } from './base.entity';
import { Clinic } from './clinic.entity';
import { UserRole } from '../../common/decorators/roles.decorator';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'clinic_id', nullable: true })
  clinicId?: string;

  @ManyToOne(() => Clinic, { nullable: true })
  @JoinColumn({ name: 'clinic_id' })
  clinic?: Clinic;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 200 })
  @Index()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.RECEPTIONIST,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  // MySQL: JSON em vez de JSONB
  @Column({ type: 'json', nullable: true })
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: Record<string, boolean>;
  };

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}
