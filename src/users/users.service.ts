import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AddressDto } from './dto/create-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,

    @InjectRepository(Address)
    private readonly address: Repository<Address>,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.user.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    dto.password = await bcrypt.hash(dto.password, 10);
    const user = this.user.create(dto);
    return await this.user.save(user);
  }

  async findAll() {
    return await this.user.find();
  }

  async findOne(id: string) {
    const user = await this.user.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.user.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    await this.user.update(id, dto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const existing = await this.user.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    return await this.user.delete(id);
  }

  async addAddress(id: string, dto: AddressDto) {
    const existing = await this.user.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const address = this.address.create({ ...dto, user: existing });
    return await this.address.save(address);
  }

  async getUserAdressess(userId: string) {
    return await this.address.findBy({ userId });
  }

  async updateAddress(addressId: string, dto: AddressDto) {
    const existing = await this.address.findOneBy({ id: addressId });
    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    await this.address.update(addressId, dto);
    return await this.address.findOneBy({ id: addressId });
  }

  async deleteAddress(addressId: string) {
    const existing = await this.address.findOneBy({ id: addressId });
    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    return await this.address.delete(addressId);
  }
}
