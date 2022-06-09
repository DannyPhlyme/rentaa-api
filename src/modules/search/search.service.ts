import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchServiceInterface } from '../../interfaces/search/search.interface';
import { ConfigSearch } from '../../config/search/config.serach';

/**
 * @todo Log event diagnostics
 */
@Injectable()
export class SearchService
  extends ElasticsearchService
  implements SearchServiceInterface<any>
{
  constructor() {
    super(ConfigSearch.searchConfig(process.env.ELASTIC_SEARCH_URL));
  }

  public async insertIndex(bulkData: any): Promise<any> {
    try {
      const response = await this.bulk(bulkData);
      return response;
    } catch(error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async updateIndex(updateData: any): Promise<any> {
    try {
      const response = await this.update(updateData);
      return response;
    } catch(error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  public async searchIndex(searchData: any): Promise<any> {
    try {
      const response = await this.search(searchData);
      return response.hits.hits;
    } catch(error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  public async deleteIndex(indexData: any): Promise<any> {
    try {
      const response = await this.indices.delete(indexData);
      return response;
    } catch(error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deleteDocument(indexData: any): Promise<any> {
    try {
      const response = await this.delete(indexData);
      return response;
    } catch(error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
