import {
  type FindOptionsOrder,
  type FindOptionsRelations,
  type FindOptionsSelect,
  type FindOptionsWhere,
} from 'typeorm';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface QueryOptions<T extends object> extends PaginationOptions {
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];

  order?: FindOptionsOrder<T>;

  relations?: FindOptionsRelations<T>;

  select?: FindOptionsSelect<T>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
