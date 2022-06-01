import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './matches.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), GamesModule],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
