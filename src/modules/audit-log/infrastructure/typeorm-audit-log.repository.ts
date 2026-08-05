import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  AuditLogFilters,
  AuditLogListResult,
  AuditLogRepository,
  CreateAuditLogData,
} from '../domain/audit-log.repository.interface';
import { AuditLogOrmEntity } from './audit-log.orm-entity';
import { AuditLogMapper } from './audit-log.mapper';

@Injectable()
export class TypeOrmAuditLogRepository implements AuditLogRepository {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repo: Repository<AuditLogOrmEntity>,
  ) {}

  async create(data: CreateAuditLogData) {
    const entity = this.repo.create({
      accion: data.accion,
      entidad: data.entidad ?? null,
      entidadId: data.entidadId ?? null,
      actor: data.actor,
      ip: data.ip ?? null,
      metadata: data.metadata ?? null,
    });
    const saved = await this.repo.save(entity);
    return AuditLogMapper.toDomain(saved);
  }

  async findAll(filters?: AuditLogFilters): Promise<AuditLogListResult> {
    const where: FindOptionsWhere<AuditLogOrmEntity> = {};

    if (filters?.accion) {
      where.accion = filters.accion;
    }
    if (filters?.entidad) {
      where.entidad = filters.entidad;
    }
    if (filters?.desde && filters?.hasta) {
      where.createdAt = Between(filters.desde, filters.hasta);
    } else if (filters?.desde) {
      where.createdAt = MoreThanOrEqual(filters.desde);
    } else if (filters?.hasta) {
      where.createdAt = LessThanOrEqual(filters.hasta);
    }

    const [rows, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
    });

    return { items: rows.map((row) => AuditLogMapper.toDomain(row)), total };
  }
}
