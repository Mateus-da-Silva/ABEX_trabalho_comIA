import { Controller, Get, Post, Put, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { StockMovementType } from '../database/entities/stock.entity';

@ApiTags('stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Post('products')
  @Roles(UserRole.CLINIC_OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cadastrar produto no estoque' })
  createProduct(@CurrentTenant() clinicId: string, @Body() data: any) {
    return this.stockService.createProduct(clinicId, data);
  }

  @Get('products')
  @ApiOperation({ summary: 'Listar produtos do estoque' })
  findAll(@CurrentTenant() clinicId: string) {
    return this.stockService.findAllProducts(clinicId);
  }

  @Get('products/low-stock')
  @ApiOperation({ summary: 'Produtos com estoque abaixo do mínimo' })
  getLowStock(@CurrentTenant() clinicId: string) {
    return this.stockService.getLowStock(clinicId);
  }

  @Put('products/:id')
  @Roles(UserRole.CLINIC_OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar produto' })
  update(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: any,
  ) {
    return this.stockService.updateProduct(clinicId, id, data);
  }

  @Post('products/:id/entry')
  @ApiOperation({ summary: 'Registrar entrada de estoque' })
  addEntry(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: any,
  ) {
    return this.stockService.addMovement(clinicId, id, StockMovementType.ENTRY, data.quantity, data);
  }

  @Post('products/:id/exit')
  @ApiOperation({ summary: 'Registrar saída de estoque' })
  addExit(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: any,
  ) {
    return this.stockService.addMovement(clinicId, id, StockMovementType.EXIT, data.quantity, data);
  }

  @Get('products/:id/movements')
  @ApiOperation({ summary: 'Histórico de movimentações de um produto' })
  getMovements(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stockService.getMovements(clinicId, id);
  }
}
