import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { TransactionType, TransactionStatus } from '../database/entities/financial.entity';

@ApiTags('financial')
@ApiBearerAuth()
@Roles(UserRole.CLINIC_OWNER, UserRole.MANAGER, UserRole.FINANCIAL)
@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Post()
  @ApiOperation({ summary: 'Criar lançamento financeiro' })
  create(@CurrentTenant() clinicId: string, @Body() data: any) {
    return this.financialService.create(clinicId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lançamentos financeiros' })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  findAll(
    @CurrentTenant() clinicId: string,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.financialService.findAll(clinicId, { type, status, startDate, endDate, page, limit });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo financeiro do mês' })
  getSummary(@CurrentTenant() clinicId: string) {
    return this.financialService.getSummary(clinicId);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Fluxo de caixa por mês' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  getCashFlow(
    @CurrentTenant() clinicId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.financialService.getCashFlow(clinicId, year, month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar lançamento por ID' })
  findOne(@CurrentTenant() clinicId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.financialService.findOne(clinicId, id);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Marcar lançamento como pago/recebido' })
  markAsPaid(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('paidAt') paidAt?: string,
  ) {
    return this.financialService.markAsPaid(clinicId, id, paidAt ? new Date(paidAt) : undefined);
  }
}
