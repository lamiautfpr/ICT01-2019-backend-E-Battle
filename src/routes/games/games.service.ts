import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Game } from './games.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}

  find(id: number): Promise<Game | undefined> {
    return this.gamesRepository.findOne(id, {
      relations: ['language', 'category'],
    });
  }

  findByUser(userId: number): Promise<Game[] | undefined> {
    return this.gamesRepository.find({
      where: { user: userId },
      relations: ['language', 'category'],
    });
  }

  findByUserParams(
    name?: string,
    languageId?: number,
    categoryId?: number,
    limit = 5,
  ): Promise<Game[] | undefined> {
    return this.gamesRepository.find({
      where: {
        name: ILike(`%${name ?? ''}`),
        ...(languageId ? { languageId } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      relations: ['language', 'category'],
      take: limit,
    });
  }

  findOneByUser(id: number, userId: number): Promise<Game | undefined> {
    return this.gamesRepository.findOne({
      where: { id: id, user: userId },
      relations: ['language', 'category'],
    });
  }

  create(game: Game) {
    return this.gamesRepository.save(game);
  }

  async delete(game: Game) {
    return ((await this.gamesRepository.softDelete(game)).affected ?? 0) > 0;
  }

  set(game: Game) {
    return this.gamesRepository.save(game);
  }
}
