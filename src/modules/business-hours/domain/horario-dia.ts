/**
 * Un día de la semana dentro del horario del negocio.
 * dia: 0 = Domingo ... 6 = Sábado (mismo criterio que Date.getDay()).
 */
export interface HorarioDia {
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  abre: string; // Formato "HH:mm"
  cierra: string; // Formato "HH:mm"
  cerrado: boolean;
}

/**
 * Horario por defecto usado para auto-inicializar la configuración
 * cuando todavía no existe ninguna fila en configuracion_horario.
 * Mismo horario que el mock ya usado por el frontend
 * (App_Lenios/src/features/business-hours/services/mockBusinessHoursService.ts).
 */
export const DEFAULT_HORARIOS: HorarioDia[] = [
  { dia: 0, abre: '13:00', cierra: '21:00', cerrado: false },
  { dia: 1, abre: '08:00', cierra: '18:00', cerrado: true },
  { dia: 2, abre: '13:00', cierra: '21:00', cerrado: false },
  { dia: 3, abre: '13:00', cierra: '21:00', cerrado: false },
  { dia: 4, abre: '13:00', cierra: '21:00', cerrado: false },
  { dia: 5, abre: '13:00', cierra: '22:00', cerrado: false },
  { dia: 6, abre: '13:00', cierra: '22:00', cerrado: false },
];
