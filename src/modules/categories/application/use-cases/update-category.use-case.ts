import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '../../domain/category.entity';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../domain/category.repository.interface';
import { UpdateCategoryInput } from '../category.dto';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(id: string, input: UpdateCategoryInput): Promise<Category> {
    const updated = await this.categoryRepository.update(id, input);
    if (!updated) {
      throw new NotFoundException(`Categoría con id "${id}" no encontrada`);
    }
    return updated;
  }
}
