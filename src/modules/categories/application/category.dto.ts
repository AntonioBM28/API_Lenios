/**
 * DTOs de la capa de aplicación — independientes de HTTP.
 * Las DTOs de presentation/ (con class-validator) mapean hacia estos.
 */
export interface CreateCategoryInput {
  nombre: string;
  descripcion?: string | null;
}

export interface UpdateCategoryInput {
  nombre?: string;
  descripcion?: string | null;
}
