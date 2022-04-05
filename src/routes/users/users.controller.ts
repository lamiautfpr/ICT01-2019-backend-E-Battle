import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApproveUserDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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
