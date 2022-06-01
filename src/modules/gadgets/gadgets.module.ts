import { Module } from '@nestjs/common';
import { GadgetsService } from './gadgets.service';
import { GadgetsController } from './gadgets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../database/entities/gadgets/category';
import { Gadget } from '../../database/entities/gadgets/gadget';
import { GadgetPhoto } from '../../database/entities/gadgets/gadget-photo';
import { User } from '../../database/entities/auth/user';
// import { SearchModule } from '../search/search.module';
import SearchService from '../search/search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Gadget, GadgetPhoto, User]),
    // SearchModule,
  ],
  controllers: [GadgetsController],
  providers: [GadgetsService, SearchService],
})
export class GadgetsModule {}
