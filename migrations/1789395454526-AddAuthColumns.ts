import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthColumns1789395454526 implements MigrationInterface {
  name = 'AddAuthColumns1789395454526';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "refresh_token" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "reset_password_token" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "reset_password_expires" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "reset_password_expires"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "reset_password_token"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refresh_token"`);
  }
}
