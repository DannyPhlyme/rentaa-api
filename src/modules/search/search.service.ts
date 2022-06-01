import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Gadget } from 'src/database/entities/gadgets/gadget';
import { GadgetSearchBody } from 'src/interfaces/search/gadget.search.body.interface';
import { GadgetSearchResult } from 'src/interfaces/search/gadget.search.result.interface';

/**
 * @todo Log event diagnostics
 */
@Injectable()
export default class SearchService {
  // index = 'gadgets';
  // constructor(private readonly elasticSearchService: ElasticsearchService) {}
  // async indexGadget(gadget: Gadget) {
  //   return this.elasticSearchService.index<GadgetSearchBody>({
  //     index: this.index,
  //     document: {
  //       id: gadget.id,
  //       name: gadget.name,
  //       description: gadget.description,
  //     },
  //   });
  // }
  // async search(text: string) {
  //   const body = await this.elasticSearchService.search<GadgetSearchResult>({
  //     index: this.index,
  //     body: {
  //       query: {
  //         // search both through the name and the description of the gadgets
  //         multi_match: {
  //           query: text,
  //           fields: ['name', 'description'],
  //         },
  //       },
  //     },
  //   });
  //   return body.hits.hits.map((item) => item._source);
  // }
}
