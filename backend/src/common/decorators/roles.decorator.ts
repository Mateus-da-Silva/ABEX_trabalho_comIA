import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',   // Dono da plataforma SaaS
  CLINIC_OWNER = 'clinic_owner', // Dono da clínica
  MANAGER = 'manager',           // Gerente
  RECEPTIONIST = 'receptionist', // Recepcionista
  PROFESSIONAL = 'professional', // Profissional / Esteticista
  FINANCIAL = 'financial',       // Financeiro
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
