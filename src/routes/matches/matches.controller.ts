import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  NotFoundException,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { GamesService } from '../games/games.service';
import { MatchDto } from './matches.dto';
import { Match } from './matches.entity';
import { MatchesService } from './matches.service';

@ApiTags('Matches')
@ApiBearerAuth()
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
    match.random = dto.random;
    match.trivia = dto.trivia;

    return this.matchesService.create(match);
  }

  @ApiTags('Unity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint que retorna uma partida do usuário logado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da partida',
    required: true,
  })
  @Get(':id')
  async get(@Param() params, @Request() req) {
    const match = await this.matchesService.findOneByUser(params.id, req.user);

    if (match === undefined) {
      throw new NotFoundException('Partida não encontrado ou não iniciada');
    }
    return match;
  }
}
