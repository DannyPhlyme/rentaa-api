import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { User } from 'src/database/entities/auth/user';
import { JwtAuthGuard } from '../auth/helper/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import { DEFAULT_UUID } from '../../config/config';

/**
 * The Review controller class. Responsible for handling incoming review
 * requests and returning responses to the client
 *
 * @class
 */
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Leave review controller method
   *
   * @param request
   * @param createReviewDto
   * @param revieweeId
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() request,
    @Query(
      'revieweeID',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    revieweeId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return await this.reviewsService.create(
      <User>request.user,
      revieweeId,
      JSON.parse(JSON.stringify(createReviewDto)),
    );
  }

  /**
   * Find all reviews controller method
   *
   * @param request
   * @param page
   * @param limit
   * @param revieweeId
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  // @ApiQuery({
  //   name: 'reviweeID',
  //   required: false,
  // })
  async findAll(
    @Request() request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 2,
    @Query(
      'revieweeID',
      new DefaultValuePipe(DEFAULT_UUID),
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    revieweeId: string,
  ) {
    limit = limit > 2 ? 2 : limit; // can't exceed 2 items per page
    return await this.reviewsService.findAll(
      <User>request.user,
      {
        limit,
        page,
        paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
        route: 'http://localhost:3000/api/v1/reviews',
      },
      revieweeId != DEFAULT_UUID ? revieweeId : null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    return await this.reviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return await this.reviewsService.update(
      id,
      JSON.parse(JSON.stringify(updateReviewDto)),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    return this.reviewsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/restore')
  async restore(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    return await this.reviewsService.restore(id);
  }
}
