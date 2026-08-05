import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Sanitize } from '../../../../common/decorators/sanitize.decorator';

export class SmartSearchDto {
  @ApiProperty({ example: 'algo picante y barato para compartir' })
  @Sanitize()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  query!: string;
}
