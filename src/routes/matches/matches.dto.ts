import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MatchDto {
  @ApiProperty({
    description: 'Numero de espaços que o tabuleiro terá',
    example: '40',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  spaces: number;

  @ApiProperty({
    description: 'Lista de grupos',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  @ArrayMinSize(1)
  groups: GroupDto[];

  @ApiProperty({
    description:
      'Se o jogo vai ser jogado com as perguntas ordenadas aleatoriamente',
    example: 'true',
  })
  @IsNotEmpty()
  @IsBoolean()
  random: boolean;

  @ApiProperty({
    description: 'Se o jogo vai ser jogado em modo trivia',
    example: 'false',
  })
  @IsNotEmpty()
  @IsBoolean()
  trivia: boolean;
}

export class GroupDto {
  @ApiProperty({
    description: 'Nome do grupo',
    example: 'Grupo 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Nome dos jogadores do grupo, valor pode ser null para vazio',
    example: '["Hugo", "Guilherme", "Fernando"]',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  players: string[];
}
