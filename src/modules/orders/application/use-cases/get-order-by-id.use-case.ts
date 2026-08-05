import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/order.entity';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../../domain/order.repository.interface';

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Pedido con id "${id}" no encontrado`);
    }
    return order;
  }
}
