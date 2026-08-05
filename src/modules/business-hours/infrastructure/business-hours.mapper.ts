import { BusinessHoursConfig } from '../domain/business-hours-config.entity';
import { BusinessHoursConfigOrmEntity } from './business-hours-config.orm-entity';

export class BusinessHoursMapper {
  static toDomain(orm: BusinessHoursConfigOrmEntity): BusinessHoursConfig {
    return new BusinessHoursConfig({
      id: orm.id,
      horarios: orm.horarios,
      cierreManual: orm.cierreManual,
      updatedAt: orm.updatedAt,
    });
  }
}
