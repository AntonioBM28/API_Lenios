import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ESTADOS_PEDIDO, EstadoPedido } from '../../domain/estado-pedido';

export class ListOrdersQueryDto {
  @ApiPropertyOptional({
    enum: ESTADOS_PEDIDO,
    description: 'Filtra pedidos por estado',
  })
  @IsOptional()
  @IsIn(ESTADOS_PEDIDO)
  estado?: EstadoPedido;
}
