import { Order } from '../domain/order.entity';
import { EstadoPedido } from '../domain/estado-pedido';

/**
 * DTOs de la capa de aplicación — independientes de HTTP.
 * Las DTOs de presentation/ (con class-validator) mapean hacia estos.
 */
export interface CreateOrderClienteInput {
  nombre: string;
  telefono: string;
  ubicacion: string;
}

export interface CreateOrderItemInput {
  productoId: string;
  cantidad: number;
}

export interface CreateOrderInput {
  cliente: CreateOrderClienteInput;
  items: CreateOrderItemInput[];
  metodoEnvio?: string;
  observaciones?: string;
  consentimientoAceptado: boolean;
  /** Coordenadas fijadas a mano por el cliente en el mapa (MapPicker, opcional). */
  entregaLat?: number;
  entregaLon?: number;
}

export interface CreateOrderResult {
  order: Order;
  mensajeWhatsapp: string;
  whatsappUrl: string;
}

export interface ListOrdersFilters {
  estado?: EstadoPedido;
}
