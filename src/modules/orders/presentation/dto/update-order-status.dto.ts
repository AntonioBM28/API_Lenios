import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ESTADOS_PEDIDO, EstadoPedido } from '../../domain/estado-pedido';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ESTADOS_PEDIDO, example: 'en_preparacion' })
  @IsIn(ESTADOS_PEDIDO, {
    message: `El estado debe ser uno de los siguientes: ${ESTADOS_PEDIDO.join(', ')}`,
  })
  estado!: EstadoPedido;
}
