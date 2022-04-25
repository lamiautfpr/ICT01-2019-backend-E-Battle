import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário a ser logado',
    example: 'teste@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário a ser logado',
    example: 'teste123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'Nome do usuário a ser criado',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'E-mail do usuário a ser criado',
    example: 'testando@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário a ser criado',
    example: '#1A2b3c4$d7!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Instituição do usuário a ser criado',
    example: 'Universidade Tecnológica Federal do Swagger',
  })
  @IsNotEmpty()
  @IsString()
  institution: string;

  @ApiProperty({
    description: 'Cidade do usuário a ser criado',
    example: 'Swaggernópolis',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Tipo de ensino do usuário a ser criado',
    example: 'Ensino Fundamental',
  })
  @IsNotEmpty()
  @IsString()
  workType: string;

  @ApiProperty({
    description: 'Formação do usuário a ser criado',
    example: 'Superior completo',
  })
  @IsNotEmpty()
  @IsString()
  educationLevel: string;
}
