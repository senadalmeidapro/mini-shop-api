import {
  type DeepPartial,
  type FindOptionsWhere,
  type ObjectLiteral,
  type QueryDeepPartialEntity,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { type PaginatedResult, type QueryOptions } from './query.types.ts';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>;

  protected constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  // CREATE
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async createMany(data: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(data);

    return this.repository.save(entities);
  }

  // READ
  async findAll(options?: QueryOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(options: QueryOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findMany(options?: QueryOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findAndCount(options?: QueryOptions<T>): Promise<[T[], number]> {
    return this.repository.findAndCount(options);
  }

  async findPaginated(options: QueryOptions<T> = {}): Promise<PaginatedResult<T>> {
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.max(options.limit ?? 20, 1);

    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // EXISTS / COUNT
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    if (where === undefined) {
      return this.repository.count();
    }
    return this.repository.count({
      where,
    });
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    return this.repository.exists({
      where,
    });
  }

  // UPDATE
  async update(where: FindOptionsWhere<T>, data: DeepPartial<T>): Promise<T | null> {
    const entity = await this.repository.preload({
      where,
      ...data,
    });

    if (!entity) {
      return null;
    }

    Object.assign(entity, data);

    return this.repository.save(entity);
  }

  async updateMany(where: FindOptionsWhere<T>, data: QueryDeepPartialEntity<T>): Promise<number> {
    const result = await this.repository.update(where, data);

    return result.affected ?? 0;
  }

  // DELETE
  async delete(where: FindOptionsWhere<T>): Promise<boolean> {
    const result = await this.repository.delete(where);

    return (result.affected ?? 0) > 0;
  }

  async deleteMany(where: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repository.delete(where);

    return result.affected ?? 0;
  }

  // QUERY BUILDER
  protected queryBuilder(alias: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  // RAW TYPEORM REPOSITORY
  protected getRepository(): Repository<T> {
    return this.repository;
  }
}
