export interface CustomerProps {
  id: string;
  nombre: string;
  telefono: string;
  ubicacion: string;
  fechaRegistro: Date;
}

/**
 * Entidad de dominio Customer — pura, sin decoradores de TypeORM.
 */
export class Customer {
  readonly id: string;
  nombre: string;
  telefono: string;
  ubicacion: string;
  readonly fechaRegistro: Date;

  constructor(props: CustomerProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.telefono = props.telefono;
    this.ubicacion = props.ubicacion;
    this.fechaRegistro = props.fechaRegistro;
  }
}
