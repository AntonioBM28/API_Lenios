import { Order } from './order.entity';
import { formatCurrency } from './format-currency';

/**
 * Arma el mensaje de texto para WhatsApp con los detalles del pedido.
 * Función pura (RF3/RF4) — misma lógica que ya existía en el frontend
 * (App_Lenios/src/features/cart/utils/whatsapp.ts); el backend es ahora
 * la fuente de verdad del formato del mensaje.
 */
export function buildWhatsappMessage(order: Order): string {
  const lineas: string[] = [];

  lineas.push('¡Hola! 👋 Nuevo pedido.');
  lineas.push(`Cliente: ${order.cliente.nombre}`);
  lineas.push(`Dirección: ${order.cliente.ubicacion}`);
  lineas.push(`Teléfono: ${order.cliente.telefono}`);
  lineas.push('Detalle:');

  order.items.forEach((item) => {
    lineas.push(`- ${item.cantidad}x ${item.productoNombre}`);
  });

  lineas.push(`Total: ${formatCurrency(order.total)}`);

  return encodeURIComponent(lineas.join('\n'));
}
