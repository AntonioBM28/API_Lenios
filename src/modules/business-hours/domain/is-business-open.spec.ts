import { isBusinessOpen } from './is-business-open';
import { BusinessHoursConfig } from './business-hours-config.entity';
import { DEFAULT_HORARIOS } from './horario-dia';

function makeConfig(
  overrides: Partial<{ cierreManual: boolean }> = {},
): BusinessHoursConfig {
  return new BusinessHoursConfig({
    id: 'config-1',
    horarios: DEFAULT_HORARIOS,
    cierreManual: overrides.cierreManual ?? false,
    updatedAt: new Date('2026-01-01'),
  });
}

describe('isBusinessOpen', () => {
  it('devuelve cerrado si hay cierre manual, sin importar el horario', () => {
    const config = makeConfig({ cierreManual: true });
    const martesEnHorario = new Date('2026-08-04T15:00:00'); // martes, dentro de horario

    const status = isBusinessOpen(config, martesEnHorario);

    expect(status.abierto).toBe(false);
  });

  it('devuelve cerrado en un día marcado como "cerrado" en el horario', () => {
    const config = makeConfig();
    // DEFAULT_HORARIOS: lunes (dia: 1) está cerrado
    const lunes = new Date('2026-08-03T15:00:00');

    const status = isBusinessOpen(config, lunes);

    expect(status.abierto).toBe(false);
    expect(status.horarioHoy?.cerrado).toBe(true);
  });

  it('devuelve abierto dentro del rango de horario del día', () => {
    const config = makeConfig();
    // DEFAULT_HORARIOS: martes (dia: 2) abre 13:00, cierra 21:00
    const martesEnHorario = new Date('2026-08-04T15:00:00');

    const status = isBusinessOpen(config, martesEnHorario);

    expect(status.abierto).toBe(true);
  });

  it('devuelve cerrado fuera del rango de horario del día (antes de abrir)', () => {
    const config = makeConfig();
    const martesTemprano = new Date('2026-08-04T08:00:00');

    const status = isBusinessOpen(config, martesTemprano);

    expect(status.abierto).toBe(false);
  });

  it('devuelve cerrado exactamente en la hora de cierre (límite exclusivo)', () => {
    const config = makeConfig();
    const martesCierre = new Date('2026-08-04T21:00:00');

    const status = isBusinessOpen(config, martesCierre);

    expect(status.abierto).toBe(false);
  });
});
