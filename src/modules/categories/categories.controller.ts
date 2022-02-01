import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 2,
  ) {
    limit = limit > 2 ? 2 : limit; // can't exceed 2 items per page
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
  @Get(':id')
  async findOne(@Param('id') id: string) {
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
  @Get(':id/gadgets')
  async findGadgetsByCategory(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 2,
  ) {
    limit = limit > 2 ? 2 : limit; // can't exceed 2 items per page
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
