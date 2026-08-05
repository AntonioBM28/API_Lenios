import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea las tablas de pedidos (RF2/RF3/RF4 + Gestión de Pedidos admin):
 * clientes, pedidos, detalle_pedido.
 */
export class CreateOrdersTables1785861933703 implements MigrationInterface {
  name = 'CreateOrdersTables1785861933703';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "clientes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nombre" varchar(100) NOT NULL,
        "telefono" varchar(15) NOT NULL,
        "ubicacion" varchar(255) NOT NULL,
        "fecha_registro" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clientes_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_clientes_telefono" ON "clientes" ("telefono")`,
    );

    await queryRunner.query(`
      CREATE TABLE "pedidos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "id_cliente" uuid NOT NULL,
        "fecha_pedido" timestamptz NOT NULL DEFAULT now(),
        "total" numeric(10,2) NOT NULL,
        "estado" varchar(30) NOT NULL DEFAULT 'recibido',
        "metodo_envio" varchar(50),
        "observaciones" text,
        CONSTRAINT "PK_pedidos_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pedidos_id_cliente" FOREIGN KEY ("id_cliente")
          REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_pedidos_id_cliente" ON "pedidos" ("id_cliente")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_pedidos_estado" ON "pedidos" ("estado")`,
    );

    await queryRunner.query(`
      CREATE TABLE "detalle_pedido" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "id_pedido" uuid NOT NULL,
        "id_producto" uuid NOT NULL,
        "cantidad" integer NOT NULL,
        "precio_unitario" numeric(10,2) NOT NULL,
        "fecha" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_detalle_pedido_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_detalle_pedido_cantidad_positiva" CHECK ("cantidad" > 0),
        CONSTRAINT "FK_detalle_pedido_id_pedido" FOREIGN KEY ("id_pedido")
          REFERENCES "pedidos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_detalle_pedido_id_producto" FOREIGN KEY ("id_producto")
          REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_detalle_pedido_id_pedido" ON "detalle_pedido" ("id_pedido")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_detalle_pedido_id_producto" ON "detalle_pedido" ("id_producto")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "detalle_pedido"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pedidos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clientes"`);
  }
}
