import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminGuard } from '../../modules/auth/presentation/guards/admin.guard';

/**
 * Decorador compuesto para endpoints administrativos protegidos por
 * AdminGuard. Reemplaza el trío repetido
 * `@UseGuards(AdminGuard) @ApiBearerAuth() @ApiResponse(401) @ApiResponse(403)`
 * que antes se repetía a mano (con 401 y 403 casi siempre olvidados) en
 * cada endpoint protegido de products/categories/orders/business-hours/audit-log.
 *
 * Uso:
 *   @Post()
 *   @AdminProtected()
 *   @ApiOperation({ summary: '...' })
 *   async create(...) { ... }
 */
export function AdminProtected(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    UseGuards(AdminGuard),
    ApiBearerAuth(),
    ApiResponse({
      status: 401,
      description: 'Token no proporcionado, inválido o expirado',
    }),
    ApiResponse({
      status: 403,
      description: 'Token válido pero sin permisos suficientes',
    }),
  );
}
