import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GameDto {
  @ApiProperty({
    description: 'ID da linguagem a ser utilizada pelo game a ser criado',
    example: '1',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  language: number;

  @ApiProperty({
    description: 'ID da categoria a ser utilizada pelo game a ser criado',
    example: '1',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  category: number;

  @ApiProperty({
    description: 'Nome do game a ser criado',
    example: 'Banco de Dados 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Lista de questões do game a ser criado',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @ArrayMinSize(1)
  questions: QuestionDto[];
}

export class QuestionDto {
  @ApiProperty({
    description: 'Texto da pergunta a ser criada',
    example: 'Quanto é 1+1?',
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  // image: string;

  @ApiProperty({
    description: 'Possíveis respostas a serem criadas para a pergunta',
    example: '["2", "3", "4", "5"]',
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  answers: string[];

  @ApiProperty({
    description: 'Index da resposta correta em relação à lista de respostas',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  answer: number;

  @ApiProperty({
    description: 'Tempo em segundos para responder a pergunta',
    example: 60,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  time: number;
}

export class QueryParamsDto {
  @ApiProperty({
    description: 'Nome do jogo/jogos que vão ser pesquisados',
    example: 'Game',
    required: false,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Id da linguagem que os jogos da busca vão ter',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  language: number;

  @ApiProperty({
    description: 'Id da categoria que os jogos da busca vão ter',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  category: number;

  @ApiProperty({
    description: 'Limite de jogos que serão pesquisados (por padrão é 5)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  limit: number;
}
export class idDto{
  @ApiProperty({
    name: 'id',
    description: 'ID do jogo',
    required: true,
  })
  @IsNumberString()
  id: number;
}