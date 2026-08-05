import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/product.repository.interface';
import { ListProductsFilters } from '../product.dto';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(filters: ListProductsFilters): Promise<Product[]> {
    return this.productRepository.findAll(filters);
  }
}
