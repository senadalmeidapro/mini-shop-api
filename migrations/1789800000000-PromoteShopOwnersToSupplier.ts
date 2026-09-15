import { MigrationInterface, QueryRunner } from 'typeorm';

export class PromoteShopOwnersToSupplier1789800000000 implements MigrationInterface {
  name = 'PromoteShopOwnersToSupplier1789800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "user" SET "role" = 'supplier' WHERE "role" = 'user' AND EXISTS (SELECT 1 FROM "shop" WHERE "shop"."owner_id" = "user"."id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "user" SET "role" = 'user' WHERE "role" = 'supplier'`);
  }
}
