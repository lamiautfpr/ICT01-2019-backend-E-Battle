import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { ReviewsService } from './review.service';
import { ReviewsController } from './review.controller';
import { GamesModule } from '../games.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), GamesModule],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewModule {}
