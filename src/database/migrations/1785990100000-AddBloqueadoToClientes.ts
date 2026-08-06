import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Lógica ARCO (Actividad 1, criterio BackEnd): antes de eliminar/anonimizar
 * los datos de un cliente a solicitud suya (derecho de Cancelación/
 * Oposición), el sistema primero lo "bloquea" — deja de aceptar nuevos
 * pedidos a su nombre mientras se verifica y procesa la solicitud — y solo
 * después, en un segundo paso explícito, se anonimizan sus datos
 * (ver AnonymizeCustomerOnRequestUseCase). `bloqueado` es el estado
 * intermedio que hace posible ese flujo de dos pasos.
 */
export class AddBloqueadoToClientes1785990100000
  implements MigrationInterface
{
  name = 'AddBloqueadoToClientes1785990100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clientes" ADD COLUMN "bloqueado" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN "bloqueado"`);
  }
}
