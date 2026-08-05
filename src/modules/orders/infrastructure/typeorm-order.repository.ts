import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Order, OrderItem } from '../domain/order.entity';
import { EstadoPedido } from '../domain/estado-pedido';
import {
  CreateOrderData,
  OrderFilters,
  OrderRepository,
} from '../domain/order.repository.interface';
import { OrderOrmEntity } from './order.orm-entity';
import { OrderItemOrmEntity } from './order-item.orm-entity';
import { OrderMapper } from './order.mapper';

const RELATIONS = ['cliente', 'items', 'items.producto'];

@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepo: Repository<OrderOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly itemRepo: Repository<OrderItemOrmEntity>,
  ) {}

  async findAll(filters?: OrderFilters): Promise<Order[]> {
    const where: FindOptionsWhere<OrderOrmEntity> = {};
    if (filters?.estado) {
      where.estado = filters.estado;
    }

    const rows = await this.orderRepo.find({
      where,
      relations: RELATIONS,
      order: { fechaPedido: 'DESC' },
    });
    return rows.map((row) => OrderMapper.toDomain(row));
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.orderRepo.findOne({
      where: { id },
      relations: RELATIONS,
    });
    return row ? OrderMapper.toDomain(row) : null;
  }

  async create(data: CreateOrderData): Promise<Order> {
    const orderEntity = this.orderRepo.create({
      idCliente: data.cliente.id,
      total: data.total,
      estado: data.estado,
      metodoEnvio: data.metodoEnvio ?? null,
      observaciones: data.observaciones ?? null,
      consentimientoAceptado: data.consentimientoAceptado,
      consentimientoFecha: data.consentimientoFecha,
      entregaLat: data.entregaLat ?? null,
      entregaLon: data.entregaLon ?? null,
    });
    const savedOrder = await this.orderRepo.save(orderEntity);

    const itemEntities = data.items.map((item) =>
      this.itemRepo.create({
        idPedido: savedOrder.id,
        idProducto: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      }),
    );
    const savedItems = await this.itemRepo.save(itemEntities);

    // Construimos el dominio con los datos ya conocidos por el caso de uso
    // (nombre del producto ya validado) sin necesidad de otro join.
    return new Order({
      id: savedOrder.id,
      cliente: data.cliente,
      items: data.items.map(
        (item, index) =>
          new OrderItem({
            id: savedItems[index].id,
            productoId: item.productoId,
            productoNombre: item.productoNombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          }),
      ),
      total: savedOrder.total,
      estado: savedOrder.estado,
      metodoEnvio: savedOrder.metodoEnvio,
      observaciones: savedOrder.observaciones,
      consentimientoAceptado: savedOrder.consentimientoAceptado,
      consentimientoFecha: savedOrder.consentimientoFecha,
      fechaPedido: savedOrder.fechaPedido,
      entregaLat: savedOrder.entregaLat,
      entregaLon: savedOrder.entregaLon,
    });
  }

  async updateStatus(id: string, estado: EstadoPedido): Promise<Order | null> {
    const existing = await this.orderRepo.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!existing) return null;

    existing.estado = estado;
    const saved = await this.orderRepo.save(existing);
    return OrderMapper.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.orderRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
