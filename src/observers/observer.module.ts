import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gadget } from 'src/database/entities/gadgets/gadget';
import { SearchService } from '../modules/search/search.service';
import { GadgetElasticIndex } from '../modules/search/constant/gadget.elastic';
import { GadgetSubscriber } from './subscribers/gadget.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Gadget])],
  providers: [
    {
      provide: 'SearchServiceInterface',
      useClass: SearchService,
    },
    GadgetElasticIndex,
    GadgetSubscriber,
  ],
  controllers: [],
  exports: [],
})
export class ObserverModule {}
