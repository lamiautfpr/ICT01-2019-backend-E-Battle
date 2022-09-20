import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { IdDto } from '../games.dto';
import { GamesService } from '../games.service';
import { ReviewGamesDto } from './review.dto';
import { Review } from './review.entity';
import { ReviewsService } from './review.service';

@ApiTags('Games')
@ApiBearerAuth()
@Controller('games')
export class ReviewsController {
  constructor(
    private reviewService: ReviewsService,
    private gamesService: GamesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para avaliar um jogo',
  })
  @Post('review/:id')
  async addReview(
    @Param() params: IdDto,
    @Body() dto: ReviewGamesDto,
    @Request() req,
  ) {
    const game = await this.gamesService.findOneByUser(params.id, req.user);
    if (!game) {
      throw new NotFoundException('Jogo não encontrado');
    }

    const rev = await this.reviewService.findReview(params.id, req.user);
    if (rev) {
      this.reviewService.deleteReview(rev.id);
    }

    const review = new Review();
    review.user = req.user.id;
    review.game = params.id;
    review.score = dto.review;

    return this.reviewService.createReview(review);
  }
}
