import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea las tablas del catálogo (categorias, productos) con sus constraints.
 * Requerido por el módulo products/categories (RF1, RF5).
 */
export class CreateCatalogTables1785859302333 implements MigrationInterface {
  name = 'CreateCatalogTables1785859302333';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // gen_random_uuid() está disponible por defecto en Postgres 13+ (pgcrypto),
    // se asegura la extensión por si el proyecto usa una versión más antigua.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "categorias" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nombre" varchar(100) NOT NULL,
        "descripcion" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categorias_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "productos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nombre" varchar(100) NOT NULL,
        "descripcion" text NOT NULL,
        "precio" numeric(10,2) NOT NULL,
        "imagen_url" varchar(255),
        "categoria_id" uuid NOT NULL,
        "disponible" boolean NOT NULL DEFAULT true,
        "stock" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_productos_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_productos_precio_positivo" CHECK ("precio" > 0),
        CONSTRAINT "CHK_productos_stock_no_negativo" CHECK ("stock" >= 0),
        CONSTRAINT "FK_productos_categoria_id" FOREIGN KEY ("categoria_id")
          REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_productos_categoria_id" ON "productos" ("categoria_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_productos_categoria_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "productos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categorias"`);
  }
}
