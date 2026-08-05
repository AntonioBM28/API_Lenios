import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryOrmEntity } from './infrastructure/category.orm-entity';
import { TypeOrmCategoryRepository } from './infrastructure/typeorm-category.repository';
import { CATEGORY_REPOSITORY } from './domain/category.repository.interface';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { CategoriesController } from './presentation/categories.controller';

/**
 * CategoriesModule – Módulo de Categorías
 *
 * Gestiona las categorías del menú de Leños Rellenos
 * (ej: "Clásicos", "Especiales", "Bebidas").
 *
 * Exporta CATEGORY_REPOSITORY para que ProductsModule pueda validar
 * la existencia de una categoría al crear/actualizar un producto.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CategoryOrmEntity])],
  controllers: [CategoriesController],
  providers: [
    { provide: CATEGORY_REPOSITORY, useClass: TypeOrmCategoryRepository },
    ListCategoriesUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
