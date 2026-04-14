import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfessionalsService } from './professionals.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles, UserRole } from '../common/decorators/roles.decorator';

@ApiTags('professionals')
@ApiBearerAuth()
@Controller('professionals')
export class ProfessionalsController {
  constructor(private professionalsService: ProfessionalsService) {}

  @Post()
  @Roles(UserRole.CLINIC_OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cadastrar profissional' })
  create(@CurrentTenant() clinicId: string, @Body() data: any) {
    return this.professionalsService.create(clinicId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar profissionais ativos' })
  findAll(@CurrentTenant() clinicId: string) {
    return this.professionalsService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar profissional por ID' })
  findOne(@CurrentTenant() clinicId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.findOne(clinicId, id);
  }

  @Put(':id')
  @Roles(UserRole.CLINIC_OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar profissional' })
  update(@CurrentTenant() clinicId: string, @Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    return this.professionalsService.update(clinicId, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.CLINIC_OWNER)
  @ApiOperation({ summary: 'Remover profissional' })
  remove(@CurrentTenant() clinicId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.remove(clinicId, id);
  }
}
