import { Product } from '../domain/product.entity';
import { ProductOrmEntity } from './product.orm-entity';

export class ProductMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    return new Product({
      id: orm.id,
      nombre: orm.nombre,
      descripcion: orm.descripcion,
      precio: orm.precio,
      imagenUrl: orm.imagenUrl,
      categoriaId: orm.categoriaId,
      disponible: orm.disponible,
      stock: orm.stock,
      destacado: orm.destacado,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }
}
