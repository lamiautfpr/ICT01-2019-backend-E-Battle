import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
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
    description: 'Nome do game a ser criado',
    example: 'Banco de Dados 1',
  })
  @IsNotEmpty()
  @IsString()
  groups: string[];

  @ApiProperty({
    description:
      'Se o jogo vai ser jogado com as perguntas ordenadas aleatoriamente',
    example: 'true',
  })
  @IsNotEmpty()
  @IsBoolean()
  ramdom: boolean;

  @ApiProperty({
    description: 'Se o jogo vai ser jogado em modo trivia',
    example: 'true',
  })
  @IsNotEmpty()
  @IsBoolean()
  trivia: boolean;
}
