import { ApiOAuth2, ApiProperty } from '@nestjs/swagger';
import { IsEnum, isNotEmpty, IsNotEmpty, isNumber, IsNumber, isPositive, IsPositive, IsString } from 'class-validator';

export enum UserStatus {
  PENDING = 0,
  APPROVED = 1,
}

export class ApproveUserDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  id: number;

  @ApiProperty({
    description: 'Novo status do usuário',
    enumName: 'UserStatus',
    enum: UserStatus,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: number;
}

export class editUserDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João da Silva',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Instituição onde o usuário trabalha',
    example: 'Colégio Estadual de Exemplo',
  })
  @IsNotEmpty()
  @IsString()
  institution: string;

  @ApiProperty({
    description: 'Cidade onde o usuário está',
    example: 'Exemplolândia do Sul',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Tipo de trabalho do professor',
    example: 'Aulas para o Ensino Fundamental',
  })
  @IsNotEmpty()
  @IsString()
  workType: string;

  @ApiProperty({
    description: 'Nível de escolaridade do professor',
    example: 'Mestre',
  })
  @IsNotEmpty()
  @IsString()
  educationLevel: string;
}