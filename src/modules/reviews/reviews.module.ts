import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/auth/user';
import { Review } from '../../database/entities/reviews/review';
import { Profile } from '../../database/entities/auth/profile';

@Module({
  imports: [TypeOrmModule.forFeature([User, Review, Profile])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
