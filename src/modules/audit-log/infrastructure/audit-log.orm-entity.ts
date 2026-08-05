import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditAction, AuditActor } from '../domain/audit-action';

@Entity({ name: 'audit_logs' })
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  accion!: AuditAction;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entidad!: string | null;

  @Column({ name: 'entidad_id', type: 'uuid', nullable: true })
  entidadId!: string | null;

  @Column({ type: 'varchar', length: 50 })
  actor!: AuditActor;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
