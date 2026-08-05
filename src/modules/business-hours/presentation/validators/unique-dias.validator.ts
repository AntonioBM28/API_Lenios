import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { HorarioDiaDto } from '../dto/horario-dia.dto';

/**
 * Valida que `horarios` tenga exactamente 7 entradas, una por cada día
 * de la semana (0-6), sin días duplicados ni faltantes.
 */
@ValidatorConstraint({ name: 'uniqueDias', async: false })
export class UniqueDiasConstraint implements ValidatorConstraintInterface {
  validate(horarios: HorarioDiaDto[]): boolean {
    if (!Array.isArray(horarios) || horarios.length !== 7) {
      return false;
    }
    const dias = new Set(horarios.map((h) => h.dia));
    if (dias.size !== 7) {
      return false;
    }
    return [0, 1, 2, 3, 4, 5, 6].every((dia) =>
      dias.has(dia as 0 | 1 | 2 | 3 | 4 | 5 | 6),
    );
  }

  defaultMessage(): string {
    return 'horarios debe contener exactamente 7 entradas, una por cada día (0-6), sin días duplicados ni faltantes';
  }
}
