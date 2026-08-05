import { AuditAction, AuditActor } from '../domain/audit-action';

/**
 * DTOs de la capa de aplicación — independientes de HTTP.
 */
export interface RecordAuditLogInput {
  accion: AuditAction;
  entidad?: string | null;
  entidadId?: string | null;
  actor: AuditActor;
  ip?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ListAuditLogsFilters {
  accion?: AuditAction;
  entidad?: string;
  desde?: Date;
  hasta?: Date;
  limit?: number;
  offset?: number;
}
