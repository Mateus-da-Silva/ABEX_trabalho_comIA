import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from '../database/entities/appointment.entity';
import { Service } from '../database/entities/service.entity';
import { Professional } from '../database/entities/professional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Service, Professional])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
