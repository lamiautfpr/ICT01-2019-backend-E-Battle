import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { User } from './user.entity';
import { ApproveUserDto, editUserDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Endpoint para resgatar dados do usuário logado',
  })
  @Get('logged')
  async getLogged(@Request() req) {
    return req.user;
  }

  @ApiOperation({
    description: 'Endpoint para alterar os dados dos usuários',
  })
  @UseGuards(JwtAuthGuard)
  @Put('edit')
  setLoggedUser(@Body() dto: editUserDto, @Request() req) {
    const user = new User();

    user.id = req.user.id;
    user.name = dto.name;
    user.institution = dto.institution;
    user.city = dto.city;
    user.workType = dto.workType;
    user.educationLevel = dto.educationLevel;

    this.usersService.set(user);
  }

  @ApiTags('Development')
  @ApiOperation({
    summary: 'APENAS PARA TESTES E DESENVOLVIMENTO',
    description:
      'Endpoint apenas para testes e desenvolvimento, não implemente esse endpoint em nenhum sistema(Incluindo sites)\n\nMostra todos os usúarios cadastrados no banco de dados',
  })
  @Get('all')
  getAll() {
    return this.usersService.findAll();
  }

  @ApiTags('Development')
  @ApiOperation({
    summary: 'APENAS PARA TESTES E DESENVOLVIMENTO',
    description:
      "Endpoint apenas para testes e desenvolvimento, não implemente esse endpoint em nenhum sistema(Incluindo sites)\n\nAltera o status de um usuário, \n\npasse 'PENDING' ou 0 para pendente e 'APPROVED' ou 1 para aprovado",
  })
  @Post('approve')
  approve(@Body() dto: ApproveUserDto) {
    return this.usersService.update(dto.id, dto.status);
  }
}
