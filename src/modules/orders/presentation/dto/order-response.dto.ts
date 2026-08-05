import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../domain/order.entity';
import { EstadoPedido } from '../../domain/estado-pedido';

export class OrderItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  productoId!: string;

  @ApiProperty({ example: 'Leño Sabor Salchicha' })
  nombre!: string;

  @ApiProperty({ example: 2 })
  cantidad!: number;

  @ApiProperty({ example: 185 })
  precioUnitario!: number;
}

/**
 * Forma de respuesta alineada 1:1 con el tipo `Pedido` del frontend admin
 * (App_Lenios/src/shared/types/index.ts) para que la integración futura
 * del panel admin sea directa.
 */
export class OrderResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  cliente!: string;

  @ApiProperty({ example: '5512345678' })
  telefono!: string;

  @ApiProperty({ example: 'Av. Siempre Viva 742, Col. Centro' })
  direccion!: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: 460 })
  total!: number;

  @ApiProperty({ example: 'recibido' })
  estado!: EstadoPedido;

  @ApiProperty({ example: '2026-08-04T16:35:36.435Z' })
  fecha!: string;

  static fromDomain(order: Order): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = order.id;
    dto.cliente = order.cliente.nombre;
    dto.telefono = order.cliente.telefono;
    dto.direccion = order.cliente.ubicacion;
    dto.items = order.items.map((item) => {
      const itemDto = new OrderItemResponseDto();
      itemDto.productoId = item.productoId;
      itemDto.nombre = item.productoNombre;
      itemDto.cantidad = item.cantidad;
      itemDto.precioUnitario = item.precioUnitario;
      return itemDto;
    });
    dto.total = order.total;
    dto.estado = order.estado;
    dto.fecha = order.fechaPedido.toISOString();
    return dto;
  }
}
