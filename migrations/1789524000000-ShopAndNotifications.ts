import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShopAndNotifications1789524000000 implements MigrationInterface {
  name = 'ShopAndNotifications1789524000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shop" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "logo_url" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c5551b51f1e3dbb3f1bb5c7d0e5" UNIQUE ("owner_id"), CONSTRAINT "UQ_d4e3c2a1b2c1e35d42c22a0b2d1" UNIQUE ("slug"), CONSTRAINT "PK_c6f2f0c2a7b1e2d3c4d5e6f7a8b9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop" ADD CONSTRAINT "FK_shop_owner" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum" AS ENUM('new_order', 'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled', 'low_stock', 'payment_succeeded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" "public"."notification_type_enum" NOT NULL, "title" character varying(255) NOT NULL, "message" text NOT NULL, "data" jsonb, "read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0a21d4f5d6c7e8f9a0b1c2d3e4f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_notification_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(`ALTER TABLE "product" ADD "shop_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_product_shop" FOREIGN KEY ("shop_id") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "low_stock_threshold" integer NOT NULL DEFAULT 5`,
    );

    await queryRunner.query(`ALTER TABLE "order" ADD "shipping_address" jsonb`);
    await queryRunner.query(`ALTER TABLE "order" ADD "tracking_number" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "order" ADD "estimated_delivery" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "order" ADD "shipped_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "order" ADD "delivered_at" TIMESTAMP`);

    await queryRunner.query(`ALTER TYPE "public"."order_status_enum" ADD VALUE 'confirmed'`);
    await queryRunner.query(`ALTER TYPE "public"."order_status_enum" ADD VALUE 'shipped'`);
    await queryRunner.query(`ALTER TYPE "public"."order_status_enum" ADD VALUE 'delivered'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "delivered_at"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "shipped_at"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "estimated_delivery"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "tracking_number"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "shipping_address"`);

    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "low_stock_threshold"`);
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_shop"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "shop_id"`);

    await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_notification_user"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);

    await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_shop_owner"`);
    await queryRunner.query(`DROP TABLE "shop"`);
  }
}
