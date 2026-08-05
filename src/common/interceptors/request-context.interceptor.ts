import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export interface RequestAuditContext {
  ip: string | null;
  method: string;
  path: string;
}

/**
 * Trazabilidad y Bitácoras de Auditoría: captura metadata técnica común del
 * request (IP, método, ruta) y la adjunta a `request.auditContext`, para que
 * los controllers la reenvíen a los use cases que registran bitácora
 * (RecordAuditLogUseCase) sin que domain/application dependan de Express.
 *
 * Este interceptor SOLO sabe de HTTP — decide QUÉ metadata técnica capturar,
 * nunca QUÉ acción de negocio auditar. Esa decisión vive en cada use case.
 */
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { auditContext?: RequestAuditContext }>();

    request.auditContext = {
      ip: request.ip ?? null,
      method: request.method,
      path: request.originalUrl ?? request.url,
    };

    return next.handle();
  }
}
