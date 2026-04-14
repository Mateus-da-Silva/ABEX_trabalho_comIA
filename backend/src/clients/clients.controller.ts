import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/decorators/roles.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo cliente' })
  create(@CurrentTenant() clinicId: string, @Body() dto: CreateClientDto) {
    return this.clientsService.create(clinicId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes da clínica' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentTenant() clinicId: string,
    @Query('search') search?: string,
    @Query('status') status?: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.clientsService.findAll(clinicId, { search, status, page, limit });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de clientes' })
  getStats(@CurrentTenant() clinicId: string) {
    return this.clientsService.getStats(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  findOne(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientsService.findOne(clinicId, id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Histórico de atendimentos do cliente' })
  getHistory(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientsService.getHistory(clinicId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados do cliente' })
  update(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(clinicId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.CLINIC_OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Remover cliente (soft delete)' })
  remove(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientsService.remove(clinicId, id);
  }
}
