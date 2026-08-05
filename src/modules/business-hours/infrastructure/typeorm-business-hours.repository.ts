import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessHoursConfig } from '../domain/business-hours-config.entity';
import { DEFAULT_HORARIOS } from '../domain/horario-dia';
import {
  BusinessHoursRepository,
  UpdateBusinessHoursData,
} from '../domain/business-hours.repository.interface';
import { BusinessHoursConfigOrmEntity } from './business-hours-config.orm-entity';
import { BusinessHoursMapper } from './business-hours.mapper';

/**
 * Solo existe UNA fila de configuración para todo el negocio. Se fuerza
 * a nivel de aplicación (siempre se opera sobre la primera fila encontrada).
 */
@Injectable()
export class TypeOrmBusinessHoursRepository implements BusinessHoursRepository {
  constructor(
    @InjectRepository(BusinessHoursConfigOrmEntity)
    private readonly repo: Repository<BusinessHoursConfigOrmEntity>,
  ) {}

  async getConfig(): Promise<BusinessHoursConfig> {
    const existing = await this.repo.find({ take: 1 });
    if (existing.length > 0) {
      return BusinessHoursMapper.toDomain(existing[0]);
    }

    // Auto-inicialización lazy: si no hay ninguna fila (ej. la migración de
    // seed no corrió aún), se crea una con el horario por defecto.
    const created = this.repo.create({
      horarios: DEFAULT_HORARIOS,
      cierreManual: false,
    });
    const saved = await this.repo.save(created);
    return BusinessHoursMapper.toDomain(saved);
  }

  async updateConfig(
    data: UpdateBusinessHoursData,
  ): Promise<BusinessHoursConfig> {
    const existing = await this.repo.find({ take: 1 });
    const entity =
      existing[0] ??
      this.repo.create({ horarios: DEFAULT_HORARIOS, cierreManual: false });

    if (data.horarios !== undefined) {
      entity.horarios = data.horarios;
    }
    if (data.cierreManual !== undefined) {
      entity.cierreManual = data.cierreManual;
    }

    const saved = await this.repo.save(entity);
    return BusinessHoursMapper.toDomain(saved);
  }
}
