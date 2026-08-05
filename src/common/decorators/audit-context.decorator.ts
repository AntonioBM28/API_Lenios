import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RequestAuditContext } from '../interceptors/request-context.interceptor';

/**
 * Extrae el RequestAuditContext (ip/método/ruta) que RequestContextInterceptor
 * adjunta al request. Los controllers que disparan acciones auditables lo
 * usan para reenviar la IP a los use cases correspondientes:
 *
 *   async create(@Body() dto: CreateOrderDto, @AuditContext() ctx: RequestAuditContext) {
 *     return this.createOrderUseCase.execute(input, ctx.ip);
 *   }
 */
export const AuditContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestAuditContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { auditContext?: RequestAuditContext }>();

    return (
      request.auditContext ?? {
        ip: request.ip ?? null,
        method: request.method,
        path: request.originalUrl ?? request.url,
      }
    );
  },
);
