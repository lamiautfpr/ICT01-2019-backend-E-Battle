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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Category } from '../categories/categories.entity';
import { Language } from '../languages/languages.entity';
import { GameDto, QueryParamsDto } from './games.dto';
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
  @ApiParam({
    name: 'name, language, category, limit',
    description: 'Parametros para pesquisar um jogo sem o id (opcionais)',
    required: false,
  })
  @Get('community')
  async findByParams(@Query() queryParams: QueryParamsDto) {
    const find = await this.gamesService.findByUserParams(
      queryParams.name,
      queryParams.language,
      queryParams.category,
      queryParams.limit,
    );

    if (find.length < 1) {
      throw new NotFoundException('Nenhum jogo corresponde a este filtro');
    }

    return find;
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint que retorna um jogo do usuário logado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do jogo',
    required: true,
  })
  @Get(':id')
  async get(@Param() params, @Request() req) {
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
  @ApiParam({
    name: 'id',
    description: 'ID do jogo',
    required: true,
  })
  @Delete(':id')
  async delete(@Param() params, @Request() req) {
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
  @ApiParam({
    name: 'id',
    description: 'ID do jogo',
    required: true,
  })
  @Post('duplicate/:id')
  async duplicate(@Param() params, @Request() req) {
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
  @ApiParam({
    name: 'id',
    description: 'ID do jogo',
    required: true,
  })
  @Put(':id')
  async editGame(@Param() param, @Body() dto: GameDto, @Request() req) {
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
}
