import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { GamesService } from '../games/games.service';
import { MatchDto } from './matches.dto';
import { Match } from './matches.entity';
import { MatchesService } from './matches.service';

@ApiTags('Games')
@Controller('matches')
export class MatchesController {
  constructor(
    private gamesService: GamesService,
    private matchesService: MatchesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para iniciar uma partida de um jogo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do jogo',
    required: true,
  })
  @Post('start/:id')
  async play(@Body() dto: MatchDto, @Param() params, @Request() req) {
    const game = await this.gamesService.findOneByUser(params.id, req.user);
    if (game === undefined) {
      throw new NotFoundException('Jogo não encontrado');
    }
    const match = new Match();

    match.game = game;
    match.spaces = dto.spaces;
    match.groups = dto.groups;
    match.ramdom = dto.ramdom;
    match.trivia = dto.trivia;

    return this.matchesService.create(match);
  }
}
