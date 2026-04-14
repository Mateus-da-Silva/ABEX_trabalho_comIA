import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('packages')
@ApiBearerAuth()
@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Post()
  @ApiOperation({ summary: 'Vender pacote de sessões para um cliente' })
  create(@CurrentTenant() clinicId: string, @Body() data: any) {
    return this.packagesService.create(clinicId, data);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Listar pacotes de um cliente' })
  findByClient(
    @CurrentTenant() clinicId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.packagesService.findAllByClient(clinicId, clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um pacote' })
  findOne(@CurrentTenant() clinicId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.findOne(clinicId, id);
  }

  @Get(':id/sessions')
  @ApiOperation({ summary: 'Sessões de um pacote' })
  getSessions(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.getSessions(id);
  }

  @Post(':id/use-session')
  @ApiOperation({ summary: 'Registrar uso de uma sessão do pacote' })
  useSession(
    @CurrentTenant() clinicId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('appointmentId') appointmentId: string,
  ) {
    return this.packagesService.useSession(clinicId, id, appointmentId);
  }
}
