import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '../../database/entities/gadgets/category';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Gadget } from '../../database/entities/gadgets/gadget';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectRepository(Gadget)
    private gadgetRepository: Repository<Gadget>,
  ) {}

  /**
   * Create category service method. This method creates a new category
   *
   * @param createCategoryDto
   * @returns
   */
  public async create(createCategoryDto: CreateCategoryDto) {
    try {
      const { name, description } = createCategoryDto;

      let category: Category = await this.categoryRepository.findOne({
        where: {
          name,
        },
      });

      if (category)
        throw new HttpException(
          'Category already exists',
          HttpStatus.BAD_REQUEST,
        );

      category = this.categoryRepository.create({
        name,
        description,
      });
      category = await this.categoryRepository.save(category);

      return {
        item: category,
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
   * Find categories service method. This method finds all categories
   *
   * @param options
   * @returns
   */
  public async findAll(options: IPaginationOptions) {
    try {
      options.limit = !options.limit ? 3 : options.limit;
      options.page = !options.page ? 1 : options.page;

      return paginate(this.categoryRepository, options, {});
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
   * Find a single category service method. This method finds
   * a single category
   *
   * @param id unique id of the category to be found
   * @returns
   * @todo Find a category by name since a category's name is unique
   */
  public async findOne(id: string) {
    try {
      const category: Category = await this.categoryRepository.findOne(id);

      if (!category)
        throw new HttpException(
          'Category does not exist',
          HttpStatus.NOT_FOUND,
        );

      return {
        item: category,
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
   * Find all gadgets that belongs to a category A.K.A Browse Category
   *
   * @param id unique id of the category
   * @param options
   * @returns
   */
  public async findGadgetsByCategory(id: string, options: IPaginationOptions) {
    const category: Category = await this.categoryRepository.findOne(id);

    if (!category)
      throw new HttpException('Category does not exist', HttpStatus.NOT_FOUND);

    return paginate(this.gadgetRepository, options, {
      relations: ['photos', 'user'],
      where: {
        category,
      },
    });
  }

  /**
   * Update a category service method. This method updates a category
   *
   * @param id unique id of the category to be updated
   * @param updateCategoryDto
   * @returns
   * @todo Fix params error for update method
   */
  public async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      let category: Category = await this.categoryRepository.findOne(id);

      if (!category)
        throw new HttpException(
          'Category does not exist',
          HttpStatus.NOT_FOUND,
        );

      await this.categoryRepository.update(id, updateCategoryDto);

      category = await this.categoryRepository.findOne(id);

      return {
        item: category,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Delete category service method. This method deletes a category
   *
   * @param id unique id of the category to be deleted
   */
  public async remove(id: string) {
    try {
      let category: Category = await this.categoryRepository.findOne(id);

      if (!category)
        throw new HttpException(
          'Category does not exist',
          HttpStatus.NOT_FOUND,
        );

      await this.categoryRepository.softDelete(id);

      category = await this.categoryRepository.findOne({
        where: {
          id,
        },
        withDeleted: true,
      });

      return {
        success: true,
        item: category,
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
   * Restore category service method. This method restores a deleted
   * category
   *
   * @param id unique if of the category to be restored
   * @returns
   */
  public async restore(id: string) {
    try {
      let category: Category = await this.categoryRepository.findOne({
        where: {
          id,
        },
        withDeleted: true,
      });

      if (!category)
        throw new HttpException(
          'Category does not exist',
          HttpStatus.NOT_FOUND,
        );

      await this.categoryRepository.restore(id); // restore category

      category = await this.categoryRepository.findOne({ id });

      return {
        success: true,
        item: category,
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
