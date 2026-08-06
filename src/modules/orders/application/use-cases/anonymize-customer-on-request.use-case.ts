import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/customer.repository.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

/**
 * Lógica ARCO — paso 2 de 2, a solicitud del cliente (distinto de
 * AnonymizeInactiveCustomersUseCase, que es automático y por período de
 * retención). Reutiliza el mismo mecanismo de anonimización a nivel de
 * repositorio (sobreescribe nombre/teléfono/ubicación, preserva el
 * histórico de pedidos), pero exige que el cliente ya esté bloqueado
 * (block() ejecutado primero) — así el flujo de dos pasos que pide el
 * criterio ("bloquear y posteriormente eliminar/anonimizar") queda
 * reforzado por el propio backend, no solo por convención del admin.
 */
@Injectable()
export class AnonymizeCustomerOnRequestUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(customerId: string, ip: string | null): Promise<void> {
    const cliente = await this.customerRepository.findById(customerId);
    if (!cliente) {
      throw new NotFoundException(
        `Cliente con id "${customerId}" no encontrado`,
      );
    }

    if (!cliente.bloqueado) {
      throw new BadRequestException(
        'El cliente debe estar bloqueado (paso 1 de ARCO) antes de anonimizar sus datos',
      );
    }

    await this.customerRepository.anonymize(customerId);

    // No se elimina el registro (se preserva integridad referencial con
    // pedidos históricos) — solo se destruyen nombre/teléfono/dirección.
    await this.recordAuditLogUseCase.execute({
      accion: 'CUSTOMER_DATA_ANONYMIZED',
      entidad: 'cliente',
      entidadId: customerId,
      actor: 'admin',
      ip,
      metadata: { motivo: 'solicitud_arco' },
    });
  }
}
