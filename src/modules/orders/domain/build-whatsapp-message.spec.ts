import { buildWhatsappMessage } from './build-whatsapp-message';
import { Order, OrderItem } from './order.entity';
import { Customer } from './customer.entity';

function makeOrder(): Order {
  const cliente = new Customer({
    id: 'cust-1',
    nombre: 'Ana Pérez',
    telefono: '4181234567',
    ubicacion: 'Av. Siempre Viva 123',
    fechaRegistro: new Date('2026-01-01'),
  });

  const items = [
    new OrderItem({
      id: 'item-1',
      productoId: 'prod-1',
      productoNombre: 'Leño Relleno de Queso',
      cantidad: 2,
      precioUnitario: 90,
    }),
  ];

  return new Order({
    id: 'order-1',
    cliente,
    items,
    total: 180,
    estado: 'recibido',
    metodoEnvio: null,
    observaciones: null,
    consentimientoAceptado: true,
    consentimientoFecha: new Date('2026-01-01'),
    fechaPedido: new Date('2026-01-01'),
  });
}

describe('buildWhatsappMessage', () => {
  it('incluye los datos del cliente y del pedido, URL-encoded', () => {
    const message = buildWhatsappMessage(makeOrder());
    const decoded = decodeURIComponent(message);

    expect(decoded).toContain('Cliente: Ana Pérez');
    expect(decoded).toContain('Dirección: Av. Siempre Viva 123');
    expect(decoded).toContain('Teléfono: 4181234567');
    expect(decoded).toContain('2x Leño Relleno de Queso');
    expect(decoded).toContain('Total: $180');
  });

  it('el resultado está URL-encoded (sin saltos de línea crudos)', () => {
    const message = buildWhatsappMessage(makeOrder());
    expect(message).not.toContain('\n');
    expect(message).toContain('%0A');
  });

  it('nunca incluye datos personales fuera de nombre/dirección/teléfono ya autorizados', () => {
    // Regresión simple: el mensaje no debe filtrar el id interno del cliente
    const message = buildWhatsappMessage(makeOrder());
    expect(decodeURIComponent(message)).not.toContain('cust-1');
  });
});
