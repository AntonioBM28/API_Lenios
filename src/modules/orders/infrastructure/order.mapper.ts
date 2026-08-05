import { Order, OrderItem } from '../domain/order.entity';
import { OrderOrmEntity } from './order.orm-entity';
import { CustomerMapper } from './customer.mapper';

export class OrderMapper {
  /**
   * Requiere que `orm` haya sido cargado con las relaciones
   * `cliente`, `items` e `items.producto` (el repositorio siempre las carga).
   */
  static toDomain(orm: OrderOrmEntity): Order {
    const items = (orm.items ?? []).map(
      (item) =>
        new OrderItem({
          id: item.id,
          productoId: item.idProducto,
          productoNombre: item.producto!.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        }),
    );

    return new Order({
      id: orm.id,
      cliente: CustomerMapper.toDomain(orm.cliente!),
      items,
      total: orm.total,
      estado: orm.estado,
      metodoEnvio: orm.metodoEnvio,
      observaciones: orm.observaciones,
      consentimientoAceptado: orm.consentimientoAceptado,
      consentimientoFecha: orm.consentimientoFecha,
      fechaPedido: orm.fechaPedido,
    });
  }
}
