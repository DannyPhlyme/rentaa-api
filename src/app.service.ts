import { HttpException, Injectable } from '@nestjs/common';
import { CategoriesService } from './modules/categories/categories.service';

@Injectable()
export class AppService {
  constructor(private categoriesService: CategoriesService) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Homepage service method
   */
  public async index() {
    try {
      return await this.categoriesService.findAll({
        limit: null,
        page: null,
      });
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
