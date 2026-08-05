import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ProductOrmEntity } from './infrastructure/product.orm-entity';
import { TypeOrmProductRepository } from './infrastructure/typeorm-product.repository';
import { PRODUCT_REPOSITORY } from './domain/product.repository.interface';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { UpdateStockUseCase } from './application/use-cases/update-stock.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { ProductsController } from './presentation/products.controller';

/**
 * ProductsModule – Módulo de Productos
 *
 * Gestiona el catálogo de productos de Leños Rellenos (RF1, RF5).
 * Importa CategoriesModule para validar categoriaId al crear/actualizar productos.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProductOrmEntity]),
    CategoriesModule,
    AuditLogModule,
  ],
  controllers: [ProductsController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: TypeOrmProductRepository },
    ListProductsUseCase,
    GetProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    UpdateStockUseCase,
    DeleteProductUseCase,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
