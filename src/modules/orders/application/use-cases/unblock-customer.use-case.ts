import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/customer.repository.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

/**
 * Lógica ARCO: revierte block() — por ejemplo si al verificar la identidad
 * del solicitante no coincide con el titular de los datos, o si el cliente
 * se retracta de su solicitud antes de llegar al paso de anonimización.
 */
@Injectable()
export class UnblockCustomerUseCase {
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

    await this.customerRepository.unblock(customerId);

    await this.recordAuditLogUseCase.execute({
      accion: 'CUSTOMER_ARCO_UNBLOCKED',
      entidad: 'cliente',
      entidadId: customerId,
      actor: 'admin',
      ip,
    });
  }
}
