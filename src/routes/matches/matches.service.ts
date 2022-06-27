import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './matches.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
  ) {}

  findOneByUser(id: number, userId: number): Promise<Match | undefined> {
    return this.matchesRepository.findOne({
      where: {
        id: id,
        game: {
          user: userId,
        },
      },
      relations: ['game'],
    });
  }

  create(match: Match) {
    return this.matchesRepository.save(match);
  }
}
