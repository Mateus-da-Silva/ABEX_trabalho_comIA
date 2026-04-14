import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('marketing')
@ApiBearerAuth()
@Controller('marketing')
export class MarketingController {
  constructor(private marketingService: MarketingService) {}

  @Get('inactive-clients')
  @ApiOperation({ summary: 'Clientes inativos (candidatos a reativação)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Dias sem visita (padrão: 60)' })
  getInactiveClients(
    @CurrentTenant() clinicId: string,
    @Query('days') days?: number,
  ) {
    return this.marketingService.getInactiveClients(clinicId, days);
  }

  @Get('birthdays')
  @ApiOperation({ summary: 'Aniversariantes do mês' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  getBirthdays(
    @CurrentTenant() clinicId: string,
    @Query('month') month?: number,
  ) {
    return this.marketingService.getBirthdayClients(clinicId, month);
  }

  @Get('vip-clients')
  @ApiOperation({ summary: 'Clientes VIP (maior faturamento)' })
  getVipClients(@CurrentTenant() clinicId: string) {
    return this.marketingService.getVipClients(clinicId);
  }

  @Get('return-reminders')
  @ApiOperation({ summary: 'Clientes para lembrete de retorno' })
  getReturnReminders(@CurrentTenant() clinicId: string) {
    return this.marketingService.getReturnReminders(clinicId);
  }
}
