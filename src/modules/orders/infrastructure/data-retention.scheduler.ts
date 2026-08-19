import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnonymizeInactiveCustomersUseCase } from '../application/use-cases/anonymize-inactive-customers.use-case';

/**
 * Dispara AnonymizeInactiveCustomersUseCase una vez al día sin
 * intervención humana — es el "proceso automático de borrado/
 * anonimización" que pide la lista de cotejo de la Actividad 1
 * (criterio BackEnd "Ciclo de Vida y Minimización de Datos").
 *
 * Corre a las 3am (baja actividad) para no competir con tráfico real.
 */
@Injectable()
export class DataRetentionScheduler {
  private readonly logger = new Logger(DataRetentionScheduler.name);

  constructor(
    private readonly anonymizeInactiveCustomersUseCase: AnonymizeInactiveCustomersUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron(): Promise<void> {
    this.logger.log('Ejecutando limpieza automática de datos (retención)...');
    const resultado = await this.anonymizeInactiveCustomersUseCase.execute();
    this.logger.log(
      `Limpieza automática completada: ${resultado.anonimizados} cliente(s) anonimizados.`,
    );
  }
}
