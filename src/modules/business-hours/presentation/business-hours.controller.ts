import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../../auth/presentation/guards/admin.guard';
import { GetBusinessStatusUseCase } from '../application/use-cases/get-business-status.use-case';
import { GetBusinessHoursConfigUseCase } from '../application/use-cases/get-business-hours-config.use-case';
import { UpdateBusinessHoursConfigUseCase } from '../application/use-cases/update-business-hours-config.use-case';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';
import { BusinessHoursConfigResponseDto } from './dto/business-hours-config-response.dto';
import { BusinessStatusResponseDto } from './dto/business-status-response.dto';
import { AuditContext } from '../../../common/decorators/audit-context.decorator';
import { RequestAuditContext } from '../../../common/interceptors/request-context.interceptor';

@ApiTags('Business Hours')
@Controller('business-hours')
export class BusinessHoursController {
  constructor(
    private readonly getBusinessStatusUseCase: GetBusinessStatusUseCase,
    private readonly getBusinessHoursConfigUseCase: GetBusinessHoursConfigUseCase,
    private readonly updateBusinessHoursConfigUseCase: UpdateBusinessHoursConfigUseCase,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Estado actual del negocio (RF6)',
    description:
      'Calcula si el negocio está abierto ahora mismo según el horario semanal y el ' +
      'cierre manual. Usado por el BusinessStatusBadge del sitio público.',
  })
  @ApiResponse({ status: 200, type: BusinessStatusResponseDto })
  async getStatus(): Promise<BusinessStatusResponseDto> {
    const status = await this.getBusinessStatusUseCase.execute();
    return BusinessStatusResponseDto.fromDomain(status);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtiene la configuración completa de horarios',
    description: 'Usado para poblar el formulario admin de edición de horario.',
  })
  @ApiResponse({ status: 200, type: BusinessHoursConfigResponseDto })
  async getConfig(): Promise<BusinessHoursConfigResponseDto> {
    const config = await this.getBusinessHoursConfigUseCase.execute();
    return BusinessHoursConfigResponseDto.fromDomain(config);
  }

  @Put()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualiza el horario semanal y/o el cierre manual',
  })
  @ApiResponse({ status: 200, type: BusinessHoursConfigResponseDto })
  @ApiResponse({
    status: 400,
    description: 'horarios inválido (formato o días duplicados/faltantes)',
  })
  async update(
    @Body() dto: UpdateBusinessHoursDto,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<BusinessHoursConfigResponseDto> {
    const config = await this.updateBusinessHoursConfigUseCase.execute(
      dto,
      ctx.ip,
    );
    return BusinessHoursConfigResponseDto.fromDomain(config);
  }
}
