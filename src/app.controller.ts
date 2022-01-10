import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { CategoriesService } from './modules/categories/categories.service';

@Controller()
export class AppController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/index')
  index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 2,
  ) {
    return this.categoriesService.findAll({
      limit,
      page,
      paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
      route: 'http://localhost:3000/api/v1/categories',
    });
  }
}
