import {
  IsString, IsEmail, IsOptional, IsDate, IsEnum,
  MinLength, MaxLength, IsPhoneNumber, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../database/entities/client.entity';

export class CreateClientDto {
  @ApiProperty({ example: 'Ana Paula Ferreira' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({ required: false, example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  phone: string;

  @ApiProperty({ required: false, example: '11999999999' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({ required: false, example: 'ana@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, example: 'Instagram' })
  @IsOptional()
  @IsString()
  howFoundUs?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  anamnesis?: Record<string, any>;
}
