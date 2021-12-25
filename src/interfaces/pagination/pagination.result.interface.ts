export interface PaginationResult<PaginationEntity> {
  result: PaginationEntity[];
  total: number;
  previous?: string;
  next?: string;
}
