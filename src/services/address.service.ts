import { In } from 'typeorm';
import type { z } from 'zod';

import { AddressRepository } from '../repositories/address.repository.ts';
import { addressSchema } from '../schema/address.schema.ts';
import type { QueryOptions } from '../database/query.types.ts';
import type { Address } from '../entities/Address.ts';

type AddressInput = z.infer<typeof addressSchema>;

export class AddressService {
  private readonly address: AddressRepository;

  constructor() {
    this.address = new AddressRepository();
  }

  async createAddress(data: AddressInput) {
    return this.address.create(data);
  }

  async createAddresss(data: AddressInput[]) {
    return this.address.createMany(data);
  }

  async getAddress(id: number) {
    return this.address.findOne({ where: { id } });
  }

  async getAddresss(option: QueryOptions<Address>) {
    return this.address.findPaginated(option);
  }

  async updateAddress(id: number, data: Partial<AddressInput>) {
    return this.address.update({ id }, data);
  }

  async updateAddresss(ids: number[], data: Partial<AddressInput>) {
    return this.address.updateMany({ id: In(ids) }, data);
  }

  async deleteAddress(id: number) {
    return this.address.delete({ id });
  }

  async deleteAddresss(ids: number[]) {
    return this.address.deleteMany({ id: In(ids) });
  }
}
