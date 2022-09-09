import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  createReview(review: Review) {
    return this.reviewsRepository.save(review);
  }

  findReview(gameId: number, userId: number): Promise<Review | undefined> {
    return this.reviewsRepository.findOne({
      where: { game: gameId, user: userId },
    });
  }

  async deleteReview(review: number) {
    return ((await this.reviewsRepository.delete(review)).affected ?? 0) > 0;
  }
}
