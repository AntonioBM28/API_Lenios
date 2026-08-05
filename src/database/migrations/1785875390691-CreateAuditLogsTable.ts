import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Trazabilidad y Bitácoras de Auditoría: tabla audit_logs.
 *
 * REGLA DE ORO (aplicada a nivel de aplicación, no de esquema): esta tabla
 * NUNCA debe recibir nombre, teléfono, dirección ni ningún otro dato
 * personal directamente — solo IDs de referencia (`entidad_id`) y metadata
 * técnica no personal (ej. cambios de estado, canal de transferencia).
 */
export class CreateAuditLogsTable1785875390691 implements MigrationInterface {
  name = 'CreateAuditLogsTable1785875390691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "accion" varchar(50) NOT NULL,
        "entidad" varchar(50),
        "entidad_id" uuid,
        "actor" varchar(50) NOT NULL,
        "ip" varchar(45),
        "metadata" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_accion" ON "audit_logs" ("accion")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_entidad" ON "audit_logs" ("entidad")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
  }
}
