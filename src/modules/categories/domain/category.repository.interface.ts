import { Category } from './category.entity';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface CreateCategoryData {
  nombre: string;
  descripcion?: string | null;
}

export interface UpdateCategoryData {
  nombre?: string;
  descripcion?: string | null;
}

/**
 * Puerto de persistencia para Category. Implementado en infrastructure/.
 */
export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(data: CreateCategoryData): Promise<Category>;
  update(id: string, data: UpdateCategoryData): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
}
