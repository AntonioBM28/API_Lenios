import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Web Services de Terceros: columnas para guardar el resultado (opcional)
 * de geocodificar la dirección de entrega vía Nominatim (OpenStreetMap) al
 * crear el pedido. Nullable porque la geocodificación es best-effort — un
 * pedido válido puede no tener coordenadas si el servicio externo falló o
 * no encontró la dirección.
 */
export class AddEntregaCoordenadasToPedidos1785890000000
  implements MigrationInterface
{
  name = 'AddEntregaCoordenadasToPedidos1785890000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pedidos" ADD COLUMN "entrega_lat" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedidos" ADD COLUMN "entrega_lon" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "entrega_lon"`);
    await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "entrega_lat"`);
  }
}
