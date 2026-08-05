import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { LoginAdminUseCase } from '../application/use-cases/login-admin.use-case';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginAdminResponseDto } from './dto/login-admin-response.dto';
import { AuditContext } from '../../../common/decorators/audit-context.decorator';
import { RequestAuditContext } from '../../../common/interceptors/request-context.interceptor';

@ApiTags('Auth')
@Controller('auth/admin')
export class AuthController {
  constructor(private readonly loginAdminUseCase: LoginAdminUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiOperation({
    summary: 'Valida el código de acceso del admin y emite un token de sesión',
    description:
      'Acceso de un único operador (sin usuarios ni roles). Máximo 5 intentos por ' +
      'minuto por IP para dificultar fuerza bruta sobre el PIN.',
  })
  @ApiResponse({ status: 200, type: LoginAdminResponseDto })
  @ApiResponse({ status: 401, description: 'Código incorrecto' })
  @ApiResponse({
    status: 429,
    description: 'Demasiados intentos, intenta de nuevo en un minuto',
  })
  async login(
    @Body() dto: LoginAdminDto,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<LoginAdminResponseDto> {
    return this.loginAdminUseCase.execute(dto.code, ctx.ip);
  }
}
