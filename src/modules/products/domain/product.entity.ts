/**
 * Entidad de dominio Product — pura, sin decoradores de TypeORM ni NestJS.
 */
export interface ProductProps {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string | null;
  categoriaId: string;
  disponible: boolean;
  stock: number;
  destacado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  readonly id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string | null;
  categoriaId: string;
  disponible: boolean;
  stock: number;
  destacado: boolean;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion;
    this.precio = props.precio;
    this.imagenUrl = props.imagenUrl;
    this.categoriaId = props.categoriaId;
    this.disponible = props.disponible;
    this.stock = props.stock;
    this.destacado = props.destacado;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Regla de negocio del catálogo: la disponibilidad se recalcula
   * automáticamente cuando el stock cruza el límite de 0.
   * - Si el nuevo stock es 0 (o negativo), el producto deja de estar disponible.
   * - Si el stock pasa de 0 a positivo, el producto vuelve a estar disponible.
   * - En cualquier otro caso, se respeta la disponibilidad solicitada
   *   (permite que el admin marque "agotado por hoy" sin tocar el stock).
   */
  static resolveDisponibilidad(
    previousStock: number,
    newStock: number,
    requestedDisponible: boolean,
  ): boolean {
    if (newStock <= 0) return false;
    if (previousStock <= 0 && newStock > 0) return true;
    return requestedDisponible;
  }
}
