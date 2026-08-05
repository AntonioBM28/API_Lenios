import { AuditLogEntry } from '../domain/audit-log-entry.entity';
import { AuditLogOrmEntity } from './audit-log.orm-entity';

export class AuditLogMapper {
  static toDomain(orm: AuditLogOrmEntity): AuditLogEntry {
    return new AuditLogEntry({
      id: orm.id,
      accion: orm.accion,
      entidad: orm.entidad,
      entidadId: orm.entidadId,
      actor: orm.actor,
      ip: orm.ip,
      metadata: orm.metadata,
      createdAt: orm.createdAt,
    });
  }
}
