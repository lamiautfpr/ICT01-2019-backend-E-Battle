import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GameDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  language: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  category: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @ArrayMinSize(1)
  questions: QuestionDto[];
}

export class QuestionDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  // image: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  answers: string[];

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  answer: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  time: number;
}
