import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'texto de teste',
    example: 'teste@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'De preferência, coloque números, letras maiúsculas e minúsculas e caracteres para uma senha mais forte', // ou não?kkk  apenas, sla, numeros?
    example: '#1A2b3c4d5%6&7!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'Inserir um nome',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Inserir um e-mail',
    example: 'testando@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Inserir uma senha',
    example: '#1A2b3c4$d7!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Inserir uma instituição',
    example: 'Universidade Tecnológica Federal do Swagger',
  })
  @IsNotEmpty()
  @IsString()
  institution: string;

  @ApiProperty({
    description: 'Inserir uma cidade',
    example: 'Swaggernópolis',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Inserir um tipo de trabalho',
    example: 'Ensino Fundamental',
  })
  @IsNotEmpty()
  @IsString()
  workType: string;

  @ApiProperty({
    description: 'Inserir grau de formação',
    example: 'Superior completo',
  })
  @IsNotEmpty()
  @IsString()
  educationLevel: string;
}
