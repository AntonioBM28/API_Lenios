import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../domain/order.entity';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../../domain/order.repository.interface';
import { ListOrdersFilters } from '../order.dto';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(filters: ListOrdersFilters): Promise<Order[]> {
    return this.orderRepository.findAll(filters);
  }
}
