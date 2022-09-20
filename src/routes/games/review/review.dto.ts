import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum ReviewGame {
  TOO_BAD = 1,
  BAD = 2,
  MIDDLING = 3,
  GOD = 4,
  VERY_GOOD = 5,
}

export class ReviewGamesDto {
  @ApiProperty({
    description: 'Nota do usuario para o jogo',
    enumName: 'ReviewGame',
    enum: ReviewGame,
  })
  @IsNotEmpty()
  @IsEnum(ReviewGame)
  review: number;
}
