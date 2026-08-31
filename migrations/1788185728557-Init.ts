import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1788185728557 implements MigrationInterface {
  name = 'Init1788185728557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "product_id" uuid NOT NULL, "rating" integer, "comment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_f091e86a234693a49084b4c2c8" UNIQUE ("user_id"), CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cart_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bd94725aa84f8cf37632bcde997" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "postal_code"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total_amount"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "zip" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "order" ADD "total" numeric(12,2) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "product" ADD "category_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "full_name" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "user" ADD "token" character varying`);
    await queryRunner.query(`ALTER TABLE "payment" ADD "transaction_id" character varying`);
    await queryRunner.query(
      `ALTER TABLE "address" DROP CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "address" DROP CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5"`,
    );
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "address" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "address" ADD CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "user_id" uuid`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "street"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "street" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "city" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "country" character varying(255)`);
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_f5221735ace059250daac9d9803"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_e9674a6053adbaa1057848cddfa"`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd"`);
    await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "PK_1031171c13130102495201e3e20"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "order" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "order" ADD "user_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('pending', 'cancelled', 'completed')`,
    );
    await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum" USING "status"::"text"::"public"."order_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pending'`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90"`,
    );
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "order_id"`);
    await queryRunner.query(`ALTER TABLE "order_item" ADD "order_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "product_id"`);
    await queryRunner.query(`ALTER TABLE "order_item" ADD "product_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "PK_bebc9158e480b949565b4dc7a82"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "name" character varying(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying NOT NULL`);
    await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab"`,
    );
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "REL_f5221735ace059250daac9d980"`,
    );
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "order_id"`);
    await queryRunner.query(`ALTER TABLE "payment" ADD "order_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "UQ_f5221735ace059250daac9d9803" UNIQUE ("order_id")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."payment_status_enum" RENAME TO "payment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'succeeded', 'failed', 'cancelled')`,
    );
    await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "status" TYPE "public"."payment_status_enum" USING "status"::"text"::"public"."payment_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "status" SET DEFAULT 'pending'`);
    await queryRunner.query(`DROP TYPE "public"."payment_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payment_method_enum" RENAME TO "payment_method_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_method_enum" AS ENUM('card', 'paypal', 'crypto')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "method" TYPE "public"."payment_method_enum" USING "method"::"text"::"public"."payment_method_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payment_method_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "address" ADD CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_e9674a6053adbaa1057848cddfa" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_81446f2ee100305f42645d4d6c2" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_26b533e15b5f2334c96339a1f08" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart" ADD CONSTRAINT "FK_f091e86a234693a49084b4c2c86" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" ADD CONSTRAINT "FK_b6b2a4f1f533d89d218e70db941" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" ADD CONSTRAINT "FK_67a2e8406e01ffa24ff9026944e" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_f5221735ace059250daac9d9803" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_f5221735ace059250daac9d9803"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" DROP CONSTRAINT "FK_67a2e8406e01ffa24ff9026944e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" DROP CONSTRAINT "FK_b6b2a4f1f533d89d218e70db941"`,
    );
    await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_f091e86a234693a49084b4c2c86"`);
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_26b533e15b5f2334c96339a1f08"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_81446f2ee100305f42645d4d6c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_e9674a6053adbaa1057848cddfa"`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd"`);
    await queryRunner.query(
      `ALTER TABLE "address" DROP CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_method_enum_old" AS ENUM('card', 'paypal', 'stripe')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "method" TYPE "public"."payment_method_enum_old" USING "method"::"text"::"public"."payment_method_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payment_method_enum_old" RENAME TO "payment_method_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_status_enum_old" AS ENUM('pending', 'canceled', 'completed')`,
    );
    await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "status" TYPE "public"."payment_status_enum_old" USING "status"::"text"::"public"."payment_status_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "status" SET DEFAULT 'pending'`);
    await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payment_status_enum_old" RENAME TO "payment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "UQ_f5221735ace059250daac9d9803"`,
    );
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "order_id"`);
    await queryRunner.query(`ALTER TABLE "payment" ADD "order_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "REL_f5221735ace059250daac9d980" UNIQUE ("order_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab"`,
    );
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "payment" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum_old" AS ENUM('user', 'manager', 'admin')`,
    );
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "name" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "PK_bebc9158e480b949565b4dc7a82"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "product_id"`);
    await queryRunner.query(`ALTER TABLE "order_item" ADD "product_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "order_id"`);
    await queryRunner.query(`ALTER TABLE "order_item" ADD "order_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90"`,
    );
    await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "order_item" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum_old" AS ENUM('pending', 'canceled', 'completed')`,
    );
    await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum_old" USING "status"::"text"::"public"."order_status_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pending'`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."order_status_enum_old" RENAME TO "order_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "order" ADD "user_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "PK_1031171c13130102495201e3e20"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "order" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_e9674a6053adbaa1057848cddfa" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_f5221735ace059250daac9d9803" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "country" character varying(100) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "city" character varying(100) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "street"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "street" character varying(225) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "user_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "address" DROP CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5"`,
    );
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "address" ADD CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "address" ADD CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "transaction_id"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "token"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "full_name"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "category_id"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total"`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "zip"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "product" ADD "isActive" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "order" ADD "total_amount" numeric(12,2) NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "address" ADD "postal_code" character varying(6) NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "cart_item"`);
    await queryRunner.query(`DROP TABLE "cart"`);
    await queryRunner.query(`DROP TABLE "review"`);
    await queryRunner.query(`DROP TABLE "category"`);
  }
}
