import { AuditLogEntry } from './audit-log-entry.entity';
import { AuditAction, AuditActor } from './audit-action';

export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');

export interface CreateAuditLogData {
  accion: AuditAction;
  entidad?: string | null;
  entidadId?: string | null;
  actor: AuditActor;
  ip?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AuditLogFilters {
  accion?: AuditAction;
  entidad?: string;
  desde?: Date;
  hasta?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogListResult {
  items: AuditLogEntry[];
  total: number;
}

/**
 * Puerto de persistencia para AuditLogEntry. Implementado en infrastructure/.
 * Solo lectura (findAll) y escritura de altas (create) — la bitácora nunca
 * se edita ni se borra desde la aplicación.
 */
export interface AuditLogRepository {
  create(data: CreateAuditLogData): Promise<AuditLogEntry>;
  findAll(filters?: AuditLogFilters): Promise<AuditLogListResult>;
}
