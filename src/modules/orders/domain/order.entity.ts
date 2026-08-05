import { Customer } from './customer.entity';
import { EstadoPedido } from './estado-pedido';

export interface OrderItemProps {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
}

/**
 * Línea de un pedido. `precioUnitario` es una copia del precio del producto
 * al momento del pedido (no se referencia dinámicamente) para no alterar
 * pedidos históricos si el precio del producto cambia después.
 */
export class OrderItem {
  readonly id: string;
  readonly productoId: string;
  readonly productoNombre: string;
  readonly cantidad: number;
  readonly precioUnitario: number;

  constructor(props: OrderItemProps) {
    this.id = props.id;
    this.productoId = props.productoId;
    this.productoNombre = props.productoNombre;
    this.cantidad = props.cantidad;
    this.precioUnitario = props.precioUnitario;
  }

  get subtotal(): number {
    return this.cantidad * this.precioUnitario;
  }
}

export interface OrderProps {
  id: string;
  cliente: Customer;
  items: OrderItem[];
  total: number;
  estado: EstadoPedido;
  metodoEnvio: string | null;
  observaciones: string | null;
  consentimientoAceptado: boolean;
  consentimientoFecha: Date | null;
  fechaPedido: Date;
}

/**
 * Entidad de dominio Order — pura, sin decoradores de TypeORM.
 *
 * `consentimientoAceptado`/`consentimientoFecha` son evidencia de que el
 * cliente aceptó explícitamente el Aviso de Privacidad antes de que sus
 * datos se transfirieran a WhatsApp (Transferencias de Datos) — se validan
 * y persisten en CreateOrderUseCase, nunca se infieren después.
 */
export class Order {
  readonly id: string;
  readonly cliente: Customer;
  readonly items: OrderItem[];
  readonly total: number;
  estado: EstadoPedido;
  readonly metodoEnvio: string | null;
  readonly observaciones: string | null;
  readonly consentimientoAceptado: boolean;
  readonly consentimientoFecha: Date | null;
  readonly fechaPedido: Date;

  constructor(props: OrderProps) {
    this.id = props.id;
    this.cliente = props.cliente;
    this.items = props.items;
    this.total = props.total;
    this.estado = props.estado;
    this.metodoEnvio = props.metodoEnvio;
    this.observaciones = props.observaciones;
    this.consentimientoAceptado = props.consentimientoAceptado;
    this.consentimientoFecha = props.consentimientoFecha;
    this.fechaPedido = props.fechaPedido;
  }
}
