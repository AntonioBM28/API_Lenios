import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Product } from '../domain/product.entity';
import {
  CreateProductData,
  ProductFilters,
  ProductRepository,
  UpdateProductData,
} from '../domain/product.repository.interface';
import { ProductOrmEntity } from './product.orm-entity';
import { ProductMapper } from './product.mapper';

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const where: FindOptionsWhere<ProductOrmEntity> = {};
    if (filters?.categoriaId) {
      where.categoriaId = filters.categoriaId;
    }
    if (filters?.disponible !== undefined) {
      where.disponible = filters.disponible;
    }

    const rows = await this.repo.find({ where, order: { createdAt: 'DESC' } });
    return rows.map((row) => ProductMapper.toDomain(row));
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? ProductMapper.toDomain(row) : null;
  }

  async create(data: CreateProductData): Promise<Product> {
    const entity = this.repo.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      imagenUrl: data.imagenUrl ?? null,
      categoriaId: data.categoriaId,
      disponible: data.disponible,
      stock: data.stock,
      destacado: data.destacado,
    });
    const saved = await this.repo.save(entity);
    return ProductMapper.toDomain(saved);
  }

  async update(id: string, data: UpdateProductData): Promise<Product | null> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;
    Object.assign(existing, data);
    const saved = await this.repo.save(existing);
    return ProductMapper.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
