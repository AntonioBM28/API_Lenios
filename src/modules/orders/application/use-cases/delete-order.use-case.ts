import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../../domain/order.repository.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

@Injectable()
export class DeleteOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(id: string, ip: string | null): Promise<void> {
    const deleted = await this.orderRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Pedido con id "${id}" no encontrado`);
    }

    await this.recordAuditLogUseCase.execute({
      accion: 'ORDER_DELETED',
      entidad: 'pedido',
      entidadId: id,
      actor: 'admin',
      ip,
    });
  }
}
