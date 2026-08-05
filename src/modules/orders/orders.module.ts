import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CustomerOrmEntity } from './infrastructure/customer.orm-entity';
import { OrderOrmEntity } from './infrastructure/order.orm-entity';
import { OrderItemOrmEntity } from './infrastructure/order-item.orm-entity';
import { TypeOrmCustomerRepository } from './infrastructure/typeorm-customer.repository';
import { TypeOrmOrderRepository } from './infrastructure/typeorm-order.repository';
import { CUSTOMER_REPOSITORY } from './domain/customer.repository.interface';
import { ORDER_REPOSITORY } from './domain/order.repository.interface';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from './application/use-cases/list-orders.use-case';
import { GetOrderByIdUseCase } from './application/use-cases/get-order-by-id.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { DeleteOrderUseCase } from './application/use-cases/delete-order.use-case';
import { OrdersController } from './presentation/orders.controller';

/**
 * OrdersModule – Módulo de Pedidos (RF2/RF3/RF4 + Gestión de Pedidos admin)
 *
 * Importa ProductsModule para validar disponibilidad/stock contra el
 * catálogo real (PRODUCT_REPOSITORY) al crear un pedido.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderOrmEntity,
      OrderItemOrmEntity,
      CustomerOrmEntity,
    ]),
    ProductsModule,
    AuditLogModule,
  ],
  controllers: [OrdersController],
  providers: [
    { provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: TypeOrmCustomerRepository },
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderByIdUseCase,
    UpdateOrderStatusUseCase,
    DeleteOrderUseCase,
  ],
  exports: [ORDER_REPOSITORY, CUSTOMER_REPOSITORY],
})
export class OrdersModule {}
