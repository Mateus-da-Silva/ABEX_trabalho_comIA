import { IsUUID, IsDateString, IsOptional, IsNumber, Min, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentOrigin } from '../../database/entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsUUID()
  professionalId: string;

  @ApiProperty({ example: '2024-03-15T10:00:00' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ required: false, description: 'Sobrescreve duração do serviço' })
  @IsOptional()
  @IsNumber()
  @Min(15)
  durationMinutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  packageSessionId?: string;

  @ApiProperty({ required: false, enum: AppointmentOrigin })
  @IsOptional()
  @IsEnum(AppointmentOrigin)
  origin?: AppointmentOrigin;
}
