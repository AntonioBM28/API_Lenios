import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../../domain/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/product.repository.interface';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../../categories/domain/category.repository.interface';
import { UpdateProductInput } from '../product.dto';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(
    id: string,
    input: UpdateProductInput,
    ip: string | null,
  ): Promise<Product> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
    }

    if (input.categoriaId && input.categoriaId !== existing.categoriaId) {
      const categoria = await this.categoryRepository.findById(
        input.categoriaId,
      );
      if (!categoria) {
        throw new BadRequestException(
          `La categoría con id "${input.categoriaId}" no existe`,
        );
      }
    }

    const previousStock = existing.stock;
    const newStock = input.stock ?? existing.stock;
    const requestedDisponible = input.disponible ?? existing.disponible;
    const disponible = Product.resolveDisponibilidad(
      previousStock,
      newStock,
      requestedDisponible,
    );

    const updated = await this.productRepository.update(id, {
      ...input,
      stock: newStock,
      disponible,
    });

    if (!updated) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
    }

    // Trazabilidad: solo los NOMBRES de los campos tocados (metadata técnica),
    // nunca sus valores completos, para no arrastrar contenido libre a la bitácora.
    await this.recordAuditLogUseCase.execute({
      accion: 'PRODUCT_UPDATED',
      entidad: 'producto',
      entidadId: id,
      actor: 'admin',
      ip,
      metadata: { camposActualizados: Object.keys(input) },
    });

    return updated;
  }
}
