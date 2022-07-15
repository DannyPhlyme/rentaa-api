import { gadgetIndex } from '../../search/search-index/gadget.elastic.index';
export class ElasticSearchBody {
  size: number;
  from: number;
  query: any;

  constructor(size: number, from: number, query: any) {
    this.size = size;
    this.from = from;
    this.query = query;
  }
}

export class GadgetSearchObject {
  public static searchObject(q: any) {
    const body = this.elasticSearchBody(q);
    return { index: gadgetIndex._index, body, q };
  }

  public static elasticSearchBody(q: any): ElasticSearchBody {
    const query = {
      match: {
        url: q,
      },
    };
    return new ElasticSearchBody(10, 0, query);
  }
}
