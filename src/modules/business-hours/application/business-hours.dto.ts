import { HorarioDia } from '../domain/horario-dia';

/**
 * DTOs de la capa de aplicación — independientes de HTTP.
 * Las DTOs de presentation/ (con class-validator) mapean hacia estos.
 * `cerrado` es opcional en el input (por defecto false) igual que en el
 * tipo `HorarioDia` del frontend; el dominio siempre lo trae explícito.
 */
export interface HorarioDiaInput extends Omit<HorarioDia, 'cerrado'> {
  cerrado?: boolean;
}

export interface UpdateBusinessHoursInput {
  horarios?: HorarioDiaInput[];
  cierreManual?: boolean;
}
