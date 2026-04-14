import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles, UserRole } from '../common/decorators/roles.decorator';

@ApiTags('services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @Roles(UserRole.CLINIC_OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Criar serviço/procedimento' })
  create(@CurrentTenant() clinicId: string, @Body() data: any) {
    return this.servicesService.create(clinicId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar serviços da clínica' })
  findAll(@CurrentTenant() clinicId: string) {
    return this.servicesService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  findOne(@CurrentTenant() clinicId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findOne(clinicId, id);
  }

  @Put(':id')
  @Roles(UserRole.CLINIC_OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar serviço' })
  update(@CurrentTenant() clinicId: string, @Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    return this.servicesService.update(clinicId, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.CLINIC_OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Remover serviço' })
  remove(@CurrentTenant() clinicId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.remove(clinicId, id);
  }
}
