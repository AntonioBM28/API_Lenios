/**
 * Entidad de dominio Category — pura, sin decoradores de TypeORM ni NestJS.
 */
export interface CategoryProps {
  id: string;
  nombre: string;
  descripcion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  readonly id: string;
  nombre: string;
  descripcion: string | null;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
