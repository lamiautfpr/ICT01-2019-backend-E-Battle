import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './matches.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
