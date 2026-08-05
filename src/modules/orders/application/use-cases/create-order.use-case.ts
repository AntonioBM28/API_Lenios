import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../../domain/order.repository.interface';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/customer.repository.interface';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../products/domain/product.repository.interface';
import { CreateOrderItemData } from '../../domain/order.repository.interface';
import { buildWhatsappMessage } from '../../domain/build-whatsapp-message';
import { GEOCODER, Geocoder } from '../../domain/geocoder.interface';
import { CreateOrderInput, CreateOrderResult } from '../order.dto';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(GEOCODER)
    private readonly geocoder: Geocoder,
    private readonly configService: ConfigService,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(
    input: CreateOrderInput,
    ip: string | null,
  ): Promise<CreateOrderResult> {
    // 0. Consentimiento explícito (Transferencias de Datos): el backend
    // también lo exige — las validaciones del frontend (checkbox) no
    // sustituyen a las del backend.
    if (!input.consentimientoAceptado) {
      throw new BadRequestException(
        'Debes aceptar el Aviso de Privacidad para poder crear el pedido',
      );
    }

    // 1. Buscar o crear cliente por teléfono
    let cliente = await this.customerRepository.findByTelefono(
      input.cliente.telefono,
    );
    if (!cliente) {
      cliente = await this.customerRepository.create({
        nombre: input.cliente.nombre,
        telefono: input.cliente.telefono,
        ubicacion: input.cliente.ubicacion,
      });
    } else if (
      cliente.nombre !== input.cliente.nombre ||
      cliente.ubicacion !== input.cliente.ubicacion
    ) {
      cliente = await this.customerRepository.update(cliente.id, {
        nombre: input.cliente.nombre,
        ubicacion: input.cliente.ubicacion,
      });
    }

    // 2. Validar disponibilidad/stock de cada item contra el catálogo real
    const errores: string[] = [];
    const itemsData: CreateOrderItemData[] = [];

    for (const item of input.items) {
      const producto = await this.productRepository.findById(item.productoId);

      if (!producto) {
        errores.push(`El producto con id "${item.productoId}" no existe`);
        continue;
      }
      if (!producto.disponible) {
        errores.push(`"${producto.nombre}" no está disponible actualmente`);
        continue;
      }
      if (producto.stock < item.cantidad) {
        errores.push(
          `"${producto.nombre}" no tiene stock suficiente (disponible: ${producto.stock}, solicitado: ${item.cantidad})`,
        );
        continue;
      }

      itemsData.push({
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
      });
    }

    if (errores.length > 0) {
      throw new BadRequestException(errores);
    }

    // 3. Calcular total
    const total = itemsData.reduce(
      (acc, i) => acc + i.cantidad * i.precioUnitario,
      0,
    );

    // TODO: descontar el stock automáticamente al crear el pedido. Por ahora
    // el stock lo sigue ajustando el admin manualmente desde Control de Stock,
    // tal como se decidió en el frontend; descontar automático es una mejora
    // futura a evaluar con el negocio.

    // 3.5 Geocodificar la dirección de entrega (Web Services de Terceros).
    // Best-effort: si Nominatim falla, no responde a tiempo o no encuentra
    // la dirección, seguimos con lat/lon en null — nunca bloqueamos el
    // checkout por un servicio externo caído.
    let coords: { lat: number; lon: number } | null = null;
    try {
      coords = await this.geocoder.geocode(input.cliente.ubicacion);
    } catch (error) {
      this.logger.warn(
        `Geocodificación falló inesperadamente: ${(error as Error).message}`,
      );
    }

    // 4. Crear pedido con estado inicial 'recibido' + evidencia de consentimiento
    const consentimientoFecha = new Date();
    const order = await this.orderRepository.create({
      cliente,
      items: itemsData,
      total,
      estado: 'recibido',
      metodoEnvio: input.metodoEnvio ?? null,
      observaciones: input.observaciones ?? null,
      consentimientoAceptado: true,
      consentimientoFecha,
      entregaLat: coords?.lat ?? null,
      entregaLon: coords?.lon ?? null,
    });

    // Trazabilidad: alta del pedido. Actor 'publico' (lo crea el cliente
    // desde el checkout, sin sesión admin). Solo IDs, nunca datos personales.
    await this.recordAuditLogUseCase.execute({
      accion: 'ORDER_CREATED',
      entidad: 'pedido',
      entidadId: order.id,
      actor: 'publico',
      ip,
    });

    // Evidencia de la llamada al servicio de terceros (Nominatim): se
    // registra tanto si hubo match como si no, para poder auditar el
    // comportamiento de la integración sin exponer la dirección real.
    await this.recordAuditLogUseCase.execute({
      accion: 'DELIVERY_GEOCODED',
      entidad: 'pedido',
      entidadId: order.id,
      actor: 'publico',
      ip,
      metadata: { geocodificado: coords !== null, proveedor: 'nominatim' },
    });

    // 5. Mensaje de WhatsApp + URL final
    const mensajeWhatsapp = buildWhatsappMessage(order);
    const numeroNegocio = this.configService.get<string>(
      'whatsapp.businessNumber',
    );
    const whatsappUrl = `https://wa.me/${numeroNegocio}?text=${mensajeWhatsapp}`;

    // Transferencias de Datos: evidencia concreta de que los datos del
    // pedido se transfirieron (vía el cliente) a un tercero (WhatsApp).
    await this.recordAuditLogUseCase.execute({
      accion: 'WHATSAPP_TRANSFER',
      entidad: 'pedido',
      entidadId: order.id,
      actor: 'publico',
      ip,
      metadata: { canal: 'whatsapp' },
    });

    return { order, mensajeWhatsapp, whatsappUrl };
  }
}
