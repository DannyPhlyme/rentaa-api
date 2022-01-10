import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../database/entities/gadgets/category';
import { Gadget } from '../../database/entities/gadgets/gadget';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Gadget])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
