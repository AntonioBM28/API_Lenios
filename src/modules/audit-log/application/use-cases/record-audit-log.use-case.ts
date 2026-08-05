import { Inject, Injectable } from '@nestjs/common';
import {
  AUDIT_LOG_REPOSITORY,
  AuditLogRepository,
} from '../../domain/audit-log.repository.interface';
import { RecordAuditLogInput } from '../audit-log.dto';

/**
 * Caso de uso genérico para registrar una entrada de bitácora. Se inyecta
 * en los demás módulos (orders, products, business-hours, auth) para que
 * registren sus propias acciones de negocio sin acoplarse a la
 * infraestructura de persistencia de la auditoría.
 *
 * REGLA DE ORO: quien llama a `execute()` NUNCA debe pasar nombre, teléfono,
 * dirección ni ningún otro dato personal en `entidadId` o `metadata` — solo
 * IDs de referencia y datos técnicos.
 */
@Injectable()
export class RecordAuditLogUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(input: RecordAuditLogInput): Promise<void> {
    await this.auditLogRepository.create(input);
  }
}
