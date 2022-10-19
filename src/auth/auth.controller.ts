import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    description: 'Endpoint para login do usuário',
  })
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({
    description: 'Endpoint para verificar login do usuário',
  })
  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @HttpCode(200)
  verify(@Request() req) {
    delete req.user.status;
    return req.user;
  }

  @ApiOperation({
    description: 'Endpoint para registro do usúarios',
  })
  @Post('register')
  @HttpCode(200)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
