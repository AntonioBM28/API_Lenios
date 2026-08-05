import { BusinessHoursConfig } from './business-hours-config.entity';
import { HorarioDia } from './horario-dia';

export const BUSINESS_HOURS_REPOSITORY = Symbol('BUSINESS_HOURS_REPOSITORY');

export interface UpdateBusinessHoursData {
  horarios?: HorarioDia[];
  cierreManual?: boolean;
}

/**
 * Puerto de persistencia para BusinessHoursConfig. Implementado en infrastructure/.
 * getConfig() siempre devuelve una configuración: si no existe ninguna fila,
 * la implementación debe auto-inicializar con DEFAULT_HORARIOS.
 */
export interface BusinessHoursRepository {
  getConfig(): Promise<BusinessHoursConfig>;
  updateConfig(data: UpdateBusinessHoursData): Promise<BusinessHoursConfig>;
}
