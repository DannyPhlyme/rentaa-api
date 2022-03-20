import {
  Controller,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/helper/jwt-auth.guard';
import { DEFAULT_UUID } from '../../config/config';

/**
 * The Category controller class. Responsible for handling incoming category
 * requests and returning responses to the client
 *
 * @class
 */
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // /**
  //  * Create category controller method
  //  *
  //  * @param createCategoryDto
  //  * @returns
  //  */
  // @Post()
  // async create(@Body() createCategoryDto: CreateCategoryDto) {
  //   return await this.categoriesService.create(createCategoryDto);
  // }

  /**
   * Find all categories controller method
   *
   * @param page
   * @param limit
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    limit = limit > 10 ? 10 : limit; // can't exceed 2 items per page
    return await this.categoriesService.findAll({
      limit,
      page,
      paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
      route: 'http://localhost:3000/api/v1/categories',
    });
  }

  /**
   * Find one category controller method
   *
   * @param id unique id of the category
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', new DefaultValuePipe(DEFAULT_UUID), new ParseUUIDPipe({}))
    id: string,
  ) {
    return await this.categoriesService.findOne(id);
  }

  /**
   * Find gadgets by category controller method
   *
   * @param id unique id of the category
   * @param page
   * @param limit
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/gadgets')
  async findGadgetsByCategory(
    @Param('id', new DefaultValuePipe(DEFAULT_UUID), new ParseUUIDPipe({}))
    id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit = 6,
  ) {
    limit = limit > 6 ? 6 : limit; // can't exceed 2 items per page
    return await this.categoriesService.findGadgetsByCategory(id, {
      limit,
      page,
      paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
      route: `http://localhost:3000/api/v1/categories/${id}/gadgets`,
    });
  }

  // /**
  //  * Update category controller method
  //  *
  //  * @param id unique id of the category
  //  * @param updateCategoryDto
  //  * @returns
  //  */
  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateCategoryDto: UpdateCategoryDto,
  // ) {
  //   return await this.categoriesService.update(id, updateCategoryDto);
  // }

  // /**
  //  * Delete category controller method
  //  *
  //  * @param id id of the unique category
  //  * @returns
  //  */
  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return await this.categoriesService.remove(id);
  // }

  // /**
  //  * Restore category controller method
  //  *
  //  * @param id umique id of the gadget
  //  * @returns
  //  */
  // @Delete(':id/restore')
  // async restore(@Param('id') id: string) {
  //   return await this.categoriesService.restore(id);
  // }
}
