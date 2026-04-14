import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator que extrai o clinic_id (tenant) do JWT autenticado.
 * Uso: @CurrentTenant() clinicId: string
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.clinic_id;
  },
);

/**
 * Decorator que extrai o usuário completo do JWT.
 * Uso: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
