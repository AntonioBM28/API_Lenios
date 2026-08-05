import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AdminTokenPayload } from '../../domain/admin-token-payload';

/**
 * Protege rutas administrativas validando el JWT de sesión emitido por
 * POST /auth/admin/login. Sin estado de sesión en base de datos: la
 * validez del token depende únicamente de la firma y su expiración.
 *
 * Dos fallos distintos, dos códigos distintos (401 vs 403):
 *  - 401 Unauthorized: no sabemos quién eres (token ausente, con firma
 *    inválida o expirado) — falla de AUTENTICACIÓN.
 *  - 403 Forbidden: sabemos quién eres (el token es válido) pero tu rol
 *    no tiene permiso sobre este recurso — falla de AUTORIZACIÓN.
 *    Hoy el login solo emite tokens con role: 'admin', así que este caso
 *    no ocurre en el flujo normal — pero el guard lo valida explícitamente
 *    (defensa en profundidad) en vez de asumir que "firma válida" implica
 *    "rol correcto", que es justo el error común que colapsa 401 y 403
 *    en un solo código.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    let payload: AdminTokenPayload;
    try {
      payload = this.jwtService.verify<AdminTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    if (payload.role !== 'admin') {
      throw new ForbiddenException(
        'Tu sesión no tiene permisos para acceder a este recurso',
      );
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
