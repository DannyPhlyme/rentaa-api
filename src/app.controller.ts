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
}
