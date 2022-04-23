import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './games.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}

  findByUser(userId: number): Promise<Game[] | undefined> {
    return this.gamesRepository.find({ where: { user: userId } });
  }

  create(game: Game) {
    return this.gamesRepository.save(game);
  }
}
