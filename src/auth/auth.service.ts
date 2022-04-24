import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/routes/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/routes/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou senha incorreto');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email ou senha incorreto');
    }

    if (user.status == 0) {
      throw new ForbiddenException('Usuário ainda não foi aprovado');
    }

    return this.signToken(user.id, user.email);
  }

  async register(dto: RegisterDto) {
    const user = new User();

    user.name = dto.name;
    user.email = dto.email;
    user.password = await bcrypt.hash(dto.password, 10);
    user.institution = dto.institution;
    user.city = dto.city;
    user.educationLevel = dto.educationLevel;
    user.workType = dto.workType;

    if (!this.usersService.create(user)) {
      throw new InternalServerErrorException('Erro ao criar o usuário');
    }

    return {
      status: 'success',
      msg: 'Usuário criado com sucesso, aguarde a aprovação para acessar o sistema',
    };
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
