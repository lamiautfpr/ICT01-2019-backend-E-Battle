import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Category } from '../categories/categories.entity';
import { Language } from '../languages/languages.entity';
import { GameDto } from './games.dto';
import { Game, Question } from './games.entity';
import { GamesService } from './games.service';

@ApiTags('Games')
@ApiBearerAuth()
@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  getAll(@Request() req) {
    return this.gamesService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() dto: GameDto, @Request() req) {
    const game = new Game();

    const l = new Language();
    l.id = dto.language;
    game.language = l;
    const c = new Category();
    c.id = dto.category;
    game.category = c;
    game.name = dto.name;
    game.user = req.user;
    game.questions = dto.questions.map(q => {
      const question = new Question();
      question.text = q.text;
      // question.image = q.image;
      question.answers = q.answers;
      question.answer = q.answer;
      question.time = q.time;
      return question;
    });

    return this.gamesService.create(game);
  }
}
