/**
 * DTOs de la capa de aplicación — independientes de HTTP.
 * Las DTOs de presentation/ (con class-validator) mapean hacia estos.
 */
export interface CreateProductInput {
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string | null;
  categoriaId: string;
  disponible?: boolean;
  stock?: number;
  destacado?: boolean;
}

export interface UpdateProductInput {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  imagenUrl?: string | null;
  categoriaId?: string;
  disponible?: boolean;
  stock?: number;
  destacado?: boolean;
}

export interface UpdateStockInput {
  stock: number;
}

export interface ListProductsFilters {
  categoriaId?: string;
  disponible?: boolean;
}
