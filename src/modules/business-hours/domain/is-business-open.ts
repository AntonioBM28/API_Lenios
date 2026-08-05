import { BusinessHoursConfig } from './business-hours-config.entity';
import { HorarioDia } from './horario-dia';

export interface BusinessStatus {
  abierto: boolean;
  horarioHoy?: HorarioDia;
}

/**
 * Función pura de dominio (RF6): calcula si el negocio está abierto en
 * este instante. Misma lógica que el frontend
 * (App_Lenios/src/features/business-hours/utils/businessHoursUtils.ts) —
 * el backend es ahora la fuente de verdad.
 */
export function isBusinessOpen(
  config: BusinessHoursConfig,
  now: Date = new Date(),
): BusinessStatus {
  if (config.cierreManual) {
    return { abierto: false };
  }

  const diaActual = now.getDay() as HorarioDia['dia'];
  const horarioHoy = config.horarios.find((h) => h.dia === diaActual);

  if (!horarioHoy || horarioHoy.cerrado) {
    return { abierto: false, horarioHoy };
  }

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const horaActualStr = `${hh}:${mm}`;

  const abierto =
    horaActualStr >= horarioHoy.abre && horaActualStr < horarioHoy.cierra;

  return { abierto, horarioHoy };
}
