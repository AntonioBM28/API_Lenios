import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Transferencias de Datos: evidencia de que el cliente aceptó el Aviso de
 * Privacidad antes de que sus datos se transfirieran a WhatsApp.
 */
export class AddConsentimientoToPedidos1785875390692 implements MigrationInterface {
  name = 'AddConsentimientoToPedidos1785875390692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pedidos" ADD COLUMN "consentimiento_aceptado" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedidos" ADD COLUMN "consentimiento_fecha" timestamptz`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pedidos" DROP COLUMN "consentimiento_fecha"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedidos" DROP COLUMN "consentimiento_aceptado"`,
    );
  }
}
