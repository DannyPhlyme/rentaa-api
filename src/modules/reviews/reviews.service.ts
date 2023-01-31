import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../../database/entities/auth/user';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../../database/entities/reviews/review';
import { Profile } from '../../database/entities/auth/profile';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Avatar } from 'src/database/entities/auth/avatar';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,

    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    @InjectRepository(Avatar)
    private avatarRepository: Repository<Avatar>,
  ) {}

  /**
   * @todo look into profile showing null in db
   * Leave review service method. This method creates a new review
   *
   * @param createReviewDto
   * @returns
   */
  public async create(
    user: User,
    revieweeId: string,
    createReviewDto: CreateReviewDto,
  ) {
    try {
      const { reviewer, review } = createReviewDto;

      if (user.id == revieweeId)
        throw new HttpException(
          'You can not review yourself',
          HttpStatus.BAD_REQUEST,
        );

      const reviewee: User = await this.userRepository.findOne({
        relations: ['profile'],
        where: {
          id: revieweeId,
        },
      });

      if (!reviewee)
        throw new HttpException(
          'The user you are trying to review does not exist',
          HttpStatus.BAD_REQUEST,
        );

      let profile: Profile = reviewee.profile;

      if (!profile)
        throw new HttpException(
          'The user you are trying to review does not exist',
          HttpStatus.BAD_REQUEST,
        );

      const avatarId: string = user.profile.avatarId;

      const userReview: Review = this.reviewRepository.create({
        review,
        reviewer,
        avatarId,
        profile,
      });

      await this.profileRepository.save(profile);

      await this.reviewRepository.save(userReview);

      profile = await this.profileRepository.findOne({
        relations: ['reviews'],
        where: {
          id: profile.id,
        },
      });

      return {
        item: profile,
        message: 'Thank you for leaving a review',
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Find reviews service method.
   *
   * @param user
   * @param options
   * @param revieweeId
   * @returns
   */
  public async findAll(
    user: User,
    options: IPaginationOptions,
    revieweeId?: string | null,
  ) {
    try {
      if (!user)
        throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);

      user = await this.userRepository.findOne({
        relations: ['profile'],
        where: {
          id: user.id,
        },
      });
      let profile: Profile = user.profile;

      if (!revieweeId) {
        const getReviews: Review[] = await this.reviewRepository.find({
          where: {
            profile,
          },
        });

        const reviews = getReviews;
        for await (const [index, review] of reviews.entries()) {
          const avatar = await this.avatarRepository.findOne({
            id: review.avatarId,
          });

          review.avatarId = avatar.key;
          console.log(review);
        }

        return reviews;
      } else {
        user = await this.userRepository.findOne({
          relations: ['profile'],
          where: {
            id: revieweeId,
          },
        });

        if (!user)
          throw new HttpException(
            'The user you are trying to review does not exist',
            HttpStatus.BAD_REQUEST,
          );

        profile = user.profile;

        const getReviews: Review[] = await this.reviewRepository.find({
          where: {
            profile,
          },
        });

        const reviews = getReviews;
        for await (const [index, review] of reviews.entries()) {
          const avatar = await this.avatarRepository.findOne({
            id: review.avatarId,
          });

          review.avatarId = avatar.key;
        }

        return reviews;
      }
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Find a single review service method.
   *
   * @param id
   * @returns
   */
  public async findOne(id: string) {
    try {
      const review: Review = await this.reviewRepository.findOne({
        relations: ['profile'],
        where: {
          id,
        },
      });

      if (!review)
        throw new HttpException('Review does not exist', HttpStatus.NOT_FOUND);

      return {
        item: review,
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Update a review service mehtod.
   *
   * @param id
   * @param updateReviewDto
   * @returns
   */
  public async update(id: string, updateReviewDto: UpdateReviewDto) {
    try {
      let review: Review = await this.reviewRepository.findOne(id);

      if (!review)
        throw new HttpException('Review does not exist', HttpStatus.NOT_FOUND);

      await this.reviewRepository.update({ id }, updateReviewDto);

      review = await this.reviewRepository.findOne({
        relations: ['profile'],
        where: {
          id,
        },
      });

      return {
        item: review,
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Delete review service method.
   *
   * @param id
   * @returns
   */
  public async remove(id: string) {
    try {
      let review: Review = await this.reviewRepository.findOne(id);

      if (!review)
        throw new HttpException('Review does not exist', HttpStatus.NOT_FOUND);

      await this.reviewRepository.softDelete(id);

      review = await this.reviewRepository.findOne({
        where: {
          id,
        },
        withDeleted: true,
      });

      return {
        success: true,
        item: review,
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Restore review service method.
   *
   * @param id
   * @returns
   */
  public async restore(id: string) {
    try {
      let review: Review = await this.reviewRepository.findOne({
        where: {
          id,
        },
        withDeleted: true,
      });

      if (!review)
        throw new HttpException('Review does not exist', HttpStatus.NOT_FOUND);

      await this.reviewRepository.restore(id); // restore review

      review = await this.reviewRepository.findOne({ id });

      return {
        success: true,
        item: review,
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }
}
