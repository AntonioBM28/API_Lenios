import { HorarioDia } from './horario-dia';

export interface BusinessHoursConfigProps {
  id: string;
  horarios: HorarioDia[];
  cierreManual: boolean;
  updatedAt: Date;
}

/**
 * Entidad de dominio BusinessHoursConfig — pura, sin decoradores de TypeORM.
 * En la práctica solo existe UNA fila para todo el negocio.
 */
export class BusinessHoursConfig {
  readonly id: string;
  horarios: HorarioDia[];
  cierreManual: boolean;
  readonly updatedAt: Date;

  constructor(props: BusinessHoursConfigProps) {
    this.id = props.id;
    this.horarios = props.horarios;
    this.cierreManual = props.cierreManual;
    this.updatedAt = props.updatedAt;
  }
}
