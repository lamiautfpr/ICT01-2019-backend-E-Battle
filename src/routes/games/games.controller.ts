import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Category } from '../categories/categories.entity';
import { Language } from '../languages/languages.entity';
import { GameDto, IdDto, QueryParamsDto, VisibilityGameDto } from './games.dto';
import { Game, Question } from './games.entity';
import { GamesService } from './games.service';

@ApiTags('Games')
@ApiBearerAuth()
@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para listar os jogos do usuário logado',
  })
  @Get('')
  getAll(@Request() req) {
    return this.gamesService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para pesquisar jogos por parametros',
  })
  @Get('community')
  findByParams(@Query() queryParams: QueryParamsDto) {
    return this.gamesService.findByUserParams(
      queryParams.name,
      queryParams.language,
      queryParams.category,
      queryParams.limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint que retorna um jogo do usuário logado',
  })
  @Get(':id')
  async get(@Param() params: IdDto, @Request() req) {
    const game = await this.gamesService.findOneByUser(params.id, req.user);
    if (game === undefined) {
      throw new NotFoundException('Jogo não encontrado');
    }
    return game;
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para criar um jogo para o usuário logado',
  })
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

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para excluir um jogo do usuário logado',
  })
  @Delete(':id')
  async delete(@Param() params: IdDto, @Request() req) {
    const game = new Game();
    game.id = params.id;
    game.user = req.user;

    if (!(await this.gamesService.delete(game))) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este jogo',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para duplicar um jogo do usuario logado',
  })
  @Post('duplicate/:id')
  async duplicate(@Param() params: IdDto, @Request() req) {
    const game = await this.gamesService.find(params.id);
    if (game === undefined) {
      throw new NotFoundException('Jogo não encontrado');
    }
    game.user = req.user.id;
    game.id = 0;
    const duplicateGame = await this.gamesService.create(game);
    return this.gamesService.find(duplicateGame.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para editar um jogo do usuario logado',
  })
  @Put(':id')
  async editGame(@Param() param: IdDto, @Body() dto: GameDto, @Request() req) {
    const game = await this.gamesService.findOneByUser(param.id, req.user);

    if (game === undefined) {
      throw new NotFoundException('Jogo não encontrado');
    }

    game.name = dto.name;
    game.user = req.user.id;
    game.language.id = dto.language;
    game.category.id = dto.category;
    game.questions = dto.questions;

    return this.gamesService.set(game);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para editar a visibilidade de um jogo',
  })
  @Post('visibility/:id')
  async setVisibility(
    @Param() params: IdDto,
    @Body() dto: VisibilityGameDto,
    @Request() req,
  ) {
    const game = await this.gamesService.findOneByUser(params.id, req.user);

    if (game === undefined) {
      throw new NotFoundException('Jogo não encontrado');
    }

    game.visibility = dto.visibility;

    return this.gamesService.set(game);
  }
}
