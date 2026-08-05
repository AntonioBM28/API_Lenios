import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({
    example: 25,
    minimum: 0,
    description: 'Nuevo valor absoluto de stock',
  })
  @IsInt()
  @Min(0)
  stock!: number;
}
