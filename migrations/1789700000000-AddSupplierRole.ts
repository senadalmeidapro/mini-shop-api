import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupplierRole1789700000000 implements MigrationInterface {
  name = 'AddSupplierRole1789700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."user_role_enum" ADD VALUE IF NOT EXISTS 'supplier'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "user" SET "role" = 'user' WHERE "role" = 'supplier'`);
  }
}
