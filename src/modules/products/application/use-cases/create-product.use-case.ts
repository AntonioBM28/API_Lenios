import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/product.repository.interface';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../../categories/domain/category.repository.interface';
import { CreateProductInput } from '../product.dto';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(
    input: CreateProductInput,
    ip: string | null,
  ): Promise<Product> {
    const categoria = await this.categoryRepository.findById(input.categoriaId);
    if (!categoria) {
      throw new BadRequestException(
        `La categoría con id "${input.categoriaId}" no existe`,
      );
    }

    const stock = input.stock ?? 0;
    const requestedDisponible = input.disponible ?? true;
    const disponible = Product.resolveDisponibilidad(
      stock,
      stock,
      requestedDisponible,
    );

    const created = await this.productRepository.create({
      nombre: input.nombre,
      descripcion: input.descripcion,
      precio: input.precio,
      imagenUrl: input.imagenUrl ?? null,
      categoriaId: input.categoriaId,
      disponible,
      stock,
      destacado: input.destacado ?? false,
    });

    await this.recordAuditLogUseCase.execute({
      accion: 'PRODUCT_CREATED',
      entidad: 'producto',
      entidadId: created.id,
      actor: 'admin',
      ip,
    });

    return created;
  }
}
