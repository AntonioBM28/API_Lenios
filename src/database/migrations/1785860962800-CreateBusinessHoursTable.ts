import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla configuracion_horario (RF6) y la inicializa con una única
 * fila usando el horario por defecto (mismo horario que el mock ya usado
 * por el frontend): Lunes cerrado, resto 13:00–21:00, Viernes/Sábado hasta
 * las 22:00. Esta fila hace de "seed" para poder probar la API de inmediato.
 *
 * Se usa jsonb para "horarios" porque es una estructura pequeña de un solo
 * dueño (el negocio), sin necesidad de queries relacionales sobre los días —
 * evita una tabla horario_dias con joins innecesarios para este caso.
 */
export class CreateBusinessHoursTable1785860962800 implements MigrationInterface {
  name = 'CreateBusinessHoursTable1785860962800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "configuracion_horario" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "horarios" jsonb NOT NULL,
        "cierre_manual" boolean NOT NULL DEFAULT false,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_configuracion_horario_id" PRIMARY KEY ("id")
      )
    `);

    const horariosPorDefecto = JSON.stringify([
      { dia: 0, abre: '13:00', cierra: '21:00', cerrado: false },
      { dia: 1, abre: '08:00', cierra: '18:00', cerrado: true },
      { dia: 2, abre: '13:00', cierra: '21:00', cerrado: false },
      { dia: 3, abre: '13:00', cierra: '21:00', cerrado: false },
      { dia: 4, abre: '13:00', cierra: '21:00', cerrado: false },
      { dia: 5, abre: '13:00', cierra: '22:00', cerrado: false },
      { dia: 6, abre: '13:00', cierra: '22:00', cerrado: false },
    ]);

    await queryRunner.query(
      `INSERT INTO "configuracion_horario" ("horarios", "cierre_manual") VALUES ($1, false)`,
      [horariosPorDefecto],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "configuracion_horario"`);
  }
}
