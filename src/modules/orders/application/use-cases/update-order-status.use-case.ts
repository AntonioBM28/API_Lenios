import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order } from '../../domain/order.entity';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../../domain/order.repository.interface';
import { ESTADOS_PEDIDO, EstadoPedido } from '../../domain/estado-pedido';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(
    id: string,
    estado: EstadoPedido,
    ip: string | null,
  ): Promise<Order> {
    if (!ESTADOS_PEDIDO.includes(estado)) {
      throw new BadRequestException(
        `Estado "${estado}" inválido. Debe ser uno de: ${ESTADOS_PEDIDO.join(', ')}`,
      );
    }

    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Pedido con id "${id}" no encontrado`);
    }
    const estadoAnterior = existing.estado;

    const updated = await this.orderRepository.updateStatus(id, estado);
    if (!updated) {
      throw new NotFoundException(`Pedido con id "${id}" no encontrado`);
    }

    // Trazabilidad: solo IDs y el estado (dato técnico, no personal).
    await this.recordAuditLogUseCase.execute({
      accion: 'ORDER_STATUS_UPDATED',
      entidad: 'pedido',
      entidadId: id,
      actor: 'admin',
      ip,
      metadata: { estadoAnterior, estadoNuevo: estado },
    });

    return updated;
  }
}
