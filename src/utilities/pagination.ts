import { PaginationResult } from 'src/interfaces/pagination/pagination.result.interface';

export class Pagination<PaginationEntity> {
  public result: PaginationEntity[];
  public page_total: number;
  public total: number;

  constructor(paginationResult: PaginationResult<PaginationEntity>) {
    this.result = paginationResult.result;
    this.page_total = paginationResult.result.length;
    this.total = paginationResult.total;
  }
}
