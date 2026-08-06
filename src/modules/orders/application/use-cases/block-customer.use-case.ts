import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/customer.repository.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

/**
 * Lógica ARCO (Actividad 1, criterio BackEnd) — paso 1 de 2.
 *
 * Un cliente ejercita su derecho de Cancelación/Oposición (vía el canal
 * documentado en el Aviso de Privacidad: WhatsApp o correo). El admin
 * verifica la solicitud y la registra aquí: el cliente queda bloqueado de
 * inmediato — no podrá generar nuevos pedidos (ver CreateOrderUseCase) — lo
 * que detiene la recolección de más datos suyos mientras se procesa la
 * solicitud. El paso 2 (anonimizar/eliminar) es una acción explícita
 * separada (ver AnonymizeCustomerOnRequestUseCase), nunca automática, para
 * dar oportunidad de verificar identidad o que el cliente se retracte.
 */
@Injectable()
export class BlockCustomerUseCase {
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

    await this.customerRepository.block(customerId);

    // Trazabilidad: solo el ID del cliente, nunca su nombre/teléfono/dirección.
    await this.recordAuditLogUseCase.execute({
      accion: 'CUSTOMER_ARCO_BLOCKED',
      entidad: 'cliente',
      entidadId: customerId,
      actor: 'admin',
      ip,
      metadata: { motivo: 'solicitud_arco' },
    });
  }
}
