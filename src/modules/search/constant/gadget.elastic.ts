import { Inject, Injectable } from '@nestjs/common';
import { Gadget } from '../../../database/entities/gadgets/gadget';
import { SearchServiceInterface } from '../../../interfaces/search/search.interface';
import { gadgetIndex } from '../search-index/gadget.elastic.index';

/**
 * Helps in inserting and updating the gadget document in the gadget elasticsearch index.
 * @class
 */
@Injectable()
export class GadgetElasticIndex {
  constructor(
    @Inject('SearchServiceInterface')
    private readonly searchService: SearchServiceInterface<any>,
  ) {}

  public async insertGadgetDocument(gadget: Gadget): Promise<any> {
    const data = this.gadgetDocument(gadget);
    return await this.searchService.insertIndex(data);
  }

  public async updateGadgetDocument(gadget: Gadget): Promise<any> {
    const data = this.gadgetDocument(gadget);
    await this.deleteGadgetDocument(gadget.id);
    return await this.searchService.insertIndex(data);
  }

  public async deleteGadgetDocument(gadgetId: string): Promise<any> {
    const data = {
      index: gadgetIndex._index,
      type: gadgetIndex._type,
      id: gadgetId,
    };

    return await this.searchService.deleteDocument(data);
  }

  /**
   * Utility methods
   */
  
  private bulkIndex(gadgetId: string): any {
    return {
      _index: gadgetIndex._index,
      _type: gadgetIndex._type,
      _id: gadgetId,
    };
  }

  private gadgetDocument({
    id,
    name,
    description,
  }: {
    id: string;
    name: string;
    description: string;
  }): any {
    const bulk = [];
    bulk.push({
      index: this.bulkIndex(id),
    });

    bulk.push({ id, name, description });

    return {
      body: bulk,
      index: gadgetIndex._index,
      type: gadgetIndex._type,
    };
  }
}
