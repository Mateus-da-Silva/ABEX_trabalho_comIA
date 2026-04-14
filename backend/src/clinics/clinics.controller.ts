import { Controller, Get, Patch, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('clinics')
@ApiBearerAuth()
@Controller('clinics')
export class ClinicsController {
  constructor(private clinicsService: ClinicsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Dados da clínica atual' })
  getMyClinic(@CurrentTenant() clinicId: string) {
    return this.clinicsService.findOne(clinicId);
  }

  @Patch('me')
  @Roles(UserRole.CLINIC_OWNER)
  @ApiOperation({ summary: 'Atualizar dados da clínica' })
  updateMyClinic(@CurrentTenant() clinicId: string, @Body() data: any) {
    return this.clinicsService.update(clinicId, data);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Super Admin] Listar todas as clínicas' })
  findAll() {
    return this.clinicsService.findAll();
  }
}
