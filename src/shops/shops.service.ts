import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { PaginationDto, PaginatedResult, buildPaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shop: Repository<Shop>,

    @InjectRepository(User)
    private readonly user: Repository<User>,
  ) {}

  private async promoteToSupplier(userId: string) {
    await this.user.update({ id: userId, role: UserRole.USER }, { role: UserRole.SUPPLIER });
  }

  private async demoteFromSupplier(userId: string) {
    await this.user.update({ id: userId, role: UserRole.SUPPLIER }, { role: UserRole.USER });
  }

  async create(ownerId: string, dto: CreateShopDto) {
    const existing = await this.shop.findOneBy({ ownerId });
    if (existing) {
      throw new ConflictException('You already own a shop');
    }

    const slugTaken = await this.shop.findOneBy({ slug: dto.slug });
    if (slugTaken) {
      throw new ConflictException('This shop slug is already in use');
    }

    const shop = this.shop.create({ ...dto, ownerId });
    const saved = await this.shop.save(shop);
    await this.promoteToSupplier(ownerId);
    return saved;
  }

  async findMyShop(ownerId: string) {
    const shop = await this.shop.findOneBy({ ownerId });
    if (!shop) throw new NotFoundException('You do not have a shop yet');
    return shop;
  }

  async findAll(pagination: PaginationDto = {}): Promise<PaginatedResult<Shop>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.shop.findAndCount({
      relations: { owner: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    const shop = await this.shop.findOne({
      where: { id },
      relations: { owner: true, products: true },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async update(id: string, ownerId: string, dto: UpdateShopDto, admin = false) {
    const shop = await this.shop.findOneBy({ id });
    if (!shop) throw new NotFoundException('Shop not found');

    if (!admin && shop.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this shop');
    }

    if (dto.slug) {
      const slugTaken = await this.shop.findOneBy({ slug: dto.slug });
      if (slugTaken && slugTaken.id !== id) {
        throw new ConflictException('This shop slug is already in use');
      }
    }

    await this.shop.update(id, dto);
    return await this.shop.findOneBy({ id });
  }

  async remove(id: string, ownerId: string, admin = false) {
    const shop = await this.shop.findOneBy({ id });
    if (!shop) throw new NotFoundException('Shop not found');

    if (!admin && shop.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this shop');
    }

    const shopOwnerId = shop.ownerId;
    const result = await this.shop.delete(id);

    if (result.affected) {
      await this.demoteFromSupplier(shopOwnerId);
    }

    return result;
  }

  async findByOwner(ownerId: string) {
    return await this.shop.findOneBy({ ownerId });
  }
}
