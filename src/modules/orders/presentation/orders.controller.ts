import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminProtected } from '../../../common/decorators/admin-protected.decorator';
import { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from '../application/use-cases/list-orders.use-case';
import { GetOrderByIdUseCase } from '../application/use-cases/get-order-by-id.use-case';
import { UpdateOrderStatusUseCase } from '../application/use-cases/update-order-status.use-case';
import { DeleteOrderUseCase } from '../application/use-cases/delete-order.use-case';
import { AnonymizeInactiveCustomersUseCase } from '../application/use-cases/anonymize-inactive-customers.use-case';
import { GetCustomerByIdUseCase } from '../application/use-cases/get-customer-by-id.use-case';
import { BlockCustomerUseCase } from '../application/use-cases/block-customer.use-case';
import { UnblockCustomerUseCase } from '../application/use-cases/unblock-customer.use-case';
import { AnonymizeCustomerOnRequestUseCase } from '../application/use-cases/anonymize-customer-on-request.use-case';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { CreateOrderResponseDto } from './dto/create-order-response.dto';
import { DataRetentionResponseDto } from './dto/data-retention-response.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { AuditContext } from '../../../common/decorators/audit-context.decorator';
import { RequestAuditContext } from '../../../common/interceptors/request-context.interceptor';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly anonymizeInactiveCustomersUseCase: AnonymizeInactiveCustomersUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly blockCustomerUseCase: BlockCustomerUseCase,
    private readonly unblockCustomerUseCase: UnblockCustomerUseCase,
    private readonly anonymizeCustomerOnRequestUseCase: AnonymizeCustomerOnRequestUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crea un pedido (RF3/RF4)',
    description:
      'Busca o crea el cliente por teléfono, valida disponibilidad/stock de cada producto, ' +
      'crea el pedido y genera el mensaje + URL de WhatsApp listos para redirigir al cliente.',
  })
  @ApiResponse({ status: 201, type: CreateOrderResponseDto })
  @ApiResponse({
    status: 400,
    description:
      'Uno o más productos no existen, no están disponibles o no tienen stock suficiente',
  })
  async create(
    @Body() dto: CreateOrderDto,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<CreateOrderResponseDto> {
    // La presentación habla "direccion" (igual que la respuesta y el frontend);
    // el dominio/aplicación hablan "ubicacion" (igual que la columna en clientes).
    const result = await this.createOrderUseCase.execute(
      {
        cliente: {
          nombre: dto.cliente.nombre,
          telefono: dto.cliente.telefono,
          ubicacion: dto.cliente.direccion,
        },
        items: dto.items,
        metodoEnvio: dto.metodoEnvio,
        observaciones: dto.observaciones,
        consentimientoAceptado: dto.consentimientoAceptado,
        entregaLat: dto.entregaLat,
        entregaLon: dto.entregaLon,
      },
      ctx.ip,
    );
    return CreateOrderResponseDto.fromResult(result);
  }

  @Get()
  @AdminProtected()
  @ApiOperation({ summary: 'Lista pedidos para el panel admin' })
  @ApiResponse({ status: 200, type: OrderResponseDto, isArray: true })
  async findAll(
    @Query() query: ListOrdersQueryDto,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.listOrdersUseCase.execute({
      estado: query.estado,
    });
    return orders.map((order) => OrderResponseDto.fromDomain(order));
  }

  @Get(':id')
  @AdminProtected()
  @ApiOperation({ summary: 'Detalle completo de un pedido' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    const order = await this.getOrderByIdUseCase.execute(id);
    return OrderResponseDto.fromDomain(order);
  }

  @Patch(':id/status')
  @AdminProtected()
  @ApiOperation({ summary: 'Actualiza el estado de un pedido' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<OrderResponseDto> {
    const order = await this.updateOrderStatusUseCase.execute(
      id,
      dto.estado,
      ctx.ip,
    );
    return OrderResponseDto.fromDomain(order);
  }

  @Delete(':id')
  @AdminProtected()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un pedido' })
  @ApiResponse({ status: 204, description: 'Pedido eliminado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<void> {
    await this.deleteOrderUseCase.execute(id, ctx.ip);
  }

  @Post('data-retention/run')
  @AdminProtected()
  @ApiOperation({
    summary: 'Dispara manualmente la limpieza de datos por retención (IA no; automatización de privacidad)',
    description:
      'Anonimiza clientes sin pedidos activos cuyo pedido más reciente rebasó el período de ' +
      'retención (DATA_RETENTION_DAYS, 365 días por defecto). Corre automáticamente todos los ' +
      'días vía cron (ver DataRetentionScheduler) — este endpoint solo permite demostrar/forzar ' +
      'el mecanismo sin esperar el período completo.',
  })
  @ApiResponse({ status: 200, type: DataRetentionResponseDto })
  async runDataRetention(): Promise<DataRetentionResponseDto> {
    const result = await this.anonymizeInactiveCustomersUseCase.execute();
    return DataRetentionResponseDto.fromResult(result);
  }

  // ── Lógica ARCO (Actividad 1, criterio BackEnd) ──────────────────────────
  // El cliente ejerce sus derechos ARCO por el canal documentado en el
  // Aviso de Privacidad (WhatsApp/correo). El admin verifica la solicitud y
  // la accede aquí: primero bloquea (detiene nuevos pedidos de inmediato),
  // y solo después, en una segunda llamada explícita, anonimiza los datos.

  @Get('customers/:id')
  @AdminProtected()
  @ApiOperation({
    summary: 'Consulta un cliente por ID (lógica ARCO)',
    description:
      'Ubica al cliente titular de una solicitud ARCO — el id se obtiene del ' +
      'campo "clienteId" en el detalle de cualquiera de sus pedidos.',
  })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findCustomer(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CustomerResponseDto> {
    const cliente = await this.getCustomerByIdUseCase.execute(id);
    return CustomerResponseDto.fromDomain(cliente);
  }

  @Post('customers/:id/block')
  @AdminProtected()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'ARCO paso 1: bloquea a un cliente',
    description:
      'A partir de este momento el cliente no puede generar nuevos pedidos ' +
      '(ver POST /orders) mientras se resuelve su solicitud de Cancelación/Oposición.',
  })
  @ApiResponse({ status: 204, description: 'Cliente bloqueado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async blockCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<void> {
    await this.blockCustomerUseCase.execute(id, ctx.ip);
  }

  @Post('customers/:id/unblock')
  @AdminProtected()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Revierte el bloqueo ARCO de un cliente',
    description:
      'Por ejemplo si no se pudo verificar la identidad del solicitante, o ' +
      'el cliente se retracta antes del paso de anonimización.',
  })
  @ApiResponse({ status: 204, description: 'Cliente desbloqueado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async unblockCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<void> {
    await this.unblockCustomerUseCase.execute(id, ctx.ip);
  }

  @Post('customers/:id/anonymize')
  @AdminProtected()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'ARCO paso 2: anonimiza los datos de un cliente a su solicitud',
    description:
      'Sobreescribe nombre/teléfono/dirección (no borra el registro — se ' +
      'preserva la integridad referencial con su histórico de pedidos). ' +
      'Requiere que el cliente ya esté bloqueado (paso 1).',
  })
  @ApiResponse({ status: 204, description: 'Cliente anonimizado' })
  @ApiResponse({ status: 400, description: 'El cliente no está bloqueado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async anonymizeCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<void> {
    await this.anonymizeCustomerOnRequestUseCase.execute(id, ctx.ip);
  }
}
