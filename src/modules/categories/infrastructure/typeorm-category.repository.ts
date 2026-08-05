import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../domain/category.entity';
import {
  CategoryRepository,
  CreateCategoryData,
  UpdateCategoryData,
} from '../domain/category.repository.interface';
import { CategoryOrmEntity } from './category.orm-entity';
import { CategoryMapper } from './category.mapper';

@Injectable()
export class TypeOrmCategoryRepository implements CategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  async findAll(): Promise<Category[]> {
    const rows = await this.repo.find({ order: { nombre: 'ASC' } });
    return rows.map((row) => CategoryMapper.toDomain(row));
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? CategoryMapper.toDomain(row) : null;
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const entity = this.repo.create({
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
    });
    const saved = await this.repo.save(entity);
    return CategoryMapper.toDomain(saved);
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category | null> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;
    Object.assign(existing, data);
    const saved = await this.repo.save(existing);
    return CategoryMapper.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === '23503') {
        throw new ConflictException(
          'No se puede eliminar la categoría porque tiene productos asociados',
        );
      }
      throw error;
    }
  }
}
