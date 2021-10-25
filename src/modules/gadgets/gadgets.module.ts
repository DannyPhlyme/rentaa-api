import { Module } from '@nestjs/common';
import { GadgetsService } from './gadgets.service';
import { GadgetsController } from './gadgets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../entities/gadgets/category.entity';
import { Gadget } from '../../entities/gadgets/gadget.entity';
import { GadgetPhoto } from '../../entities/gadgets/gadget-photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Gadget, GadgetPhoto])],
  controllers: [GadgetsController],
  providers: [GadgetsService],
})
export class GadgetsModule {}
