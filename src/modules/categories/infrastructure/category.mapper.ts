import { Category } from '../domain/category.entity';
import { CategoryOrmEntity } from './category.orm-entity';

export class CategoryMapper {
  static toDomain(orm: CategoryOrmEntity): Category {
    return new Category({
      id: orm.id,
      nombre: orm.nombre,
      descripcion: orm.descripcion,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }
}
