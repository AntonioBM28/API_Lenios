import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega "destacado" a productos — usado por la sección "Sabores Destacados"
 * del Home y editable desde el panel admin. Faltaba en el modelo original
 * (detectado al integrar con el frontend, que ya lo esperaba en `Producto`).
 * Marca con datos de ejemplo los mismos productos que el mock del frontend
 * usaba como destacados, para no perder esa demo al conectar el backend real.
 */
export class AddDestacadoToProductos1785865586900 implements MigrationInterface {
  name = 'AddDestacadoToProductos1785865586900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" ADD COLUMN "destacado" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `UPDATE "productos" SET "destacado" = true WHERE "nombre" IN (
        'Leño Sabor Salchicha',
        'Leño de Carne Ahumada',
        'Leño BBQ Texas',
        'Leño Sabor Arrachera'
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "destacado"`);
  }
}
