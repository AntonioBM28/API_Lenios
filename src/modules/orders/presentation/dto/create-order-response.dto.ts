import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderResult } from '../../application/order.dto';
import { OrderResponseDto } from './order-response.dto';

export class CreateOrderResponseDto {
  @ApiProperty({ type: OrderResponseDto })
  pedido!: OrderResponseDto;

  @ApiProperty({
    description:
      'Mensaje de WhatsApp ya codificado con encodeURIComponent, listo para usar en la URL',
    example: '%C2%A1Hola!%20%F0%9F%91%8B%20Nuevo%20pedido....',
  })
  mensajeWhatsapp!: string;

  @ApiProperty({
    description: 'URL final de wa.me lista para abrir/redirigir',
    example: 'https://wa.me/5215500000000?text=...',
  })
  whatsappUrl!: string;

  static fromResult(result: CreateOrderResult): CreateOrderResponseDto {
    const dto = new CreateOrderResponseDto();
    dto.pedido = OrderResponseDto.fromDomain(result.order);
    dto.mensajeWhatsapp = result.mensajeWhatsapp;
    dto.whatsappUrl = result.whatsappUrl;
    return dto;
  }
}
