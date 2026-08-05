import { AuditAction, AuditActor } from './audit-action';

export interface AuditLogEntryProps {
  id: string;
  accion: AuditAction;
  entidad: string | null;
  entidadId: string | null;
  actor: AuditActor;
  ip: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Entidad de dominio AuditLogEntry — pura, sin decoradores de TypeORM.
 *
 * REGLA DE ORO: esta entidad NUNCA debe cargar datos personales (nombre,
 * teléfono, dirección, etc.) — solo IDs de referencia (`entidadId`) y
 * metadata técnica no personal. Es responsabilidad de cada use case que
 * llama a RecordAuditLogUseCase respetar esto (ver comentarios en cada
 * punto de integración).
 */
export class AuditLogEntry {
  readonly id: string;
  readonly accion: AuditAction;
  readonly entidad: string | null;
  readonly entidadId: string | null;
  readonly actor: AuditActor;
  readonly ip: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt: Date;

  constructor(props: AuditLogEntryProps) {
    this.id = props.id;
    this.accion = props.accion;
    this.entidad = props.entidad;
    this.entidadId = props.entidadId;
    this.actor = props.actor;
    this.ip = props.ip;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt;
  }
}
