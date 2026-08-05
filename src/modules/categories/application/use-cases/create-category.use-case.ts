import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../../domain/category.entity';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../domain/category.repository.interface';
import { CreateCategoryInput } from '../category.dto';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    return this.categoryRepository.create({
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
    });
  }
}
