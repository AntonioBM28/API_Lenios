import { Customer } from './customer.entity';
import { Order } from './order.entity';
import { EstadoPedido } from './estado-pedido';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface CreateOrderItemData {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CreateOrderData {
  cliente: Customer;
  items: CreateOrderItemData[];
  total: number;
  estado: EstadoPedido;
  metodoEnvio?: string | null;
  observaciones?: string | null;
  consentimientoAceptado: boolean;
  consentimientoFecha: Date;
  entregaLat?: number | null;
  entregaLon?: number | null;
}

export interface OrderFilters {
  estado?: EstadoPedido;
}

/**
 * Patrón: Repository.
 * Puerto de persistencia para Order — abstrae el acceso a datos del
 * caso de uso (application/). La implementación concreta con TypeORM
 * vive en infrastructure/typeorm-order.repository.ts y se inyecta aquí
 * mediante el token ORDER_REPOSITORY (inyección de dependencias nativa
 * de NestJS, ver providers en orders.module.ts). El dominio y los casos
 * de uso solo conocen esta interfaz, nunca TypeORM directamente.
 */
export interface OrderRepository {
  findAll(filters?: OrderFilters): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  create(data: CreateOrderData): Promise<Order>;
  updateStatus(id: string, estado: EstadoPedido): Promise<Order | null>;
  delete(id: string): Promise<boolean>;
}
