import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClinicDto {
  @ApiProperty({ example: 'Clínica Bella Vita' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  clinicName: string;

  @ApiProperty({ example: 'bella-vita', description: 'Identificador único da clínica (sem espaços)' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug deve conter apenas letras minúsculas, números e hífens' })
  @MinLength(3)
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'maria@bellavita.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'MinhaSenha@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false, enum: ['starter', 'professional', 'business'] })
  @IsOptional()
  @IsString()
  plan?: string;
}
