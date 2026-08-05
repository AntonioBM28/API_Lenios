import { Product } from './product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductFilters {
  categoriaId?: string;
  disponible?: boolean;
}

export interface CreateProductData {
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string | null;
  categoriaId: string;
  disponible: boolean;
  stock: number;
  destacado: boolean;
}

export interface UpdateProductData {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  imagenUrl?: string | null;
  categoriaId?: string;
  disponible?: boolean;
  stock?: number;
  destacado?: boolean;
}

/**
 * Patrón: Repository.
 * Puerto de persistencia para Product. Implementado en infrastructure/
 * (TypeOrmProductRepository) e inyectado vía el token PRODUCT_REPOSITORY.
 */
export interface ProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}
