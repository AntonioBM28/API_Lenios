import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../../domain/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/product.repository.interface';
import { UpdateStockInput } from '../product.dto';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

/**
 * Caso de uso dedicado al ajuste rápido de stock (panel admin).
 * Aplica la regla de disponibilidad automática de Product.resolveDisponibilidad.
 */
@Injectable()
export class UpdateStockUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(
    id: string,
    input: UpdateStockInput,
    ip: string | null,
  ): Promise<Product> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
    }

    const disponible = Product.resolveDisponibilidad(
      existing.stock,
      input.stock,
      existing.disponible,
    );

    const updated = await this.productRepository.update(id, {
      stock: input.stock,
      disponible,
    });

    if (!updated) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
    }

    await this.recordAuditLogUseCase.execute({
      accion: 'PRODUCT_UPDATED',
      entidad: 'producto',
      entidadId: id,
      actor: 'admin',
      ip,
      metadata: { stockAnterior: existing.stock, stockNuevo: input.stock },
    });

    return updated;
  }
}
