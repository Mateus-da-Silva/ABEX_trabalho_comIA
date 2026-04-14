import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'maria@bellavita.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MinhaSenha@123' })
  @IsString()
  @MinLength(6)
  password: string;
}
