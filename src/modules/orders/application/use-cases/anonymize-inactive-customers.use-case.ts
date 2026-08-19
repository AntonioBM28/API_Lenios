import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/customer.repository.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

export interface AnonymizeInactiveCustomersResult {
  anonimizados: number;
  retentionDays: number;
}

/**
 * Ciclo de Vida y Minimización de Datos (Actividad 1, criterio BackEnd):
 * una vez que un cliente ya no tiene ningún pedido en curso y su pedido
 * más reciente rebasó el período de retención configurado, la finalidad
 * para la que se recabaron sus datos personales (procesar y entregar sus
 * pedidos) ya se cumplió — este caso de uso los anonimiza.
 *
 * No se elimina el registro del cliente ni sus pedidos (se preserva la
 * integridad referencial y el histórico del negocio: totales, reportes,
 * auditoría) — solo se sobreescriben nombre/teléfono/dirección.
 *
 * Se ejecuta automáticamente por cron (ver DataRetentionScheduler) y
 * también se expone vía un endpoint admin (`POST /orders/data-retention/run`)
 * para poder demostrar el mecanismo en vivo sin esperar el período de
 * retención completo.
 */
@Injectable()
export class AnonymizeInactiveCustomersUseCase {
  private readonly logger = new Logger(AnonymizeInactiveCustomersUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly configService: ConfigService,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(): Promise<AnonymizeInactiveCustomersResult> {
    const retentionDays =
      this.configService.get<number>('privacy.retentionDays') ?? 365;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const candidatos = await this.customerRepository.findInactiveSince(cutoff);

    for (const cliente of candidatos) {
      await this.customerRepository.anonymize(cliente.id);

      // Trazabilidad: evidencia de que se anonimizó, sin guardar el
      // nombre/teléfono/dirección originales en el log de auditoría.
      await this.recordAuditLogUseCase.execute({
        accion: 'CUSTOMER_DATA_ANONYMIZED',
        entidad: 'cliente',
        entidadId: cliente.id,
        actor: 'sistema',
        metadata: { motivo: 'retencion_expirada', retentionDays },
      });
    }

    if (candidatos.length > 0) {
      this.logger.log(`Anonimizados ${candidatos.length} cliente(s) inactivos`);
    }

    return { anonimizados: candidatos.length, retentionDays };
  }
}
