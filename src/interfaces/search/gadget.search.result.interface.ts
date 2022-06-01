import { GadgetSearchBody } from './gadget.search.body.interface';

export interface GadgetSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: GadgetSearchBody;
    }>;
  };
}
