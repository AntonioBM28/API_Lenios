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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../../auth/presentation/guards/admin.guard';
import { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from '../application/use-cases/list-orders.use-case';
import { GetOrderByIdUseCase } from '../application/use-cases/get-order-by-id.use-case';
import { UpdateOrderStatusUseCase } from '../application/use-cases/update-order-status.use-case';
import { DeleteOrderUseCase } from '../application/use-cases/delete-order.use-case';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { CreateOrderResponseDto } from './dto/create-order-response.dto';
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
      },
      ctx.ip,
    );
    return CreateOrderResponseDto.fromResult(result);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
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
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
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
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
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
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
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
}
