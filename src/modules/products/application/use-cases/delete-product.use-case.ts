import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/product.repository.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(id: string, ip: string | null): Promise<void> {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
    }

    await this.recordAuditLogUseCase.execute({
      accion: 'PRODUCT_DELETED',
      entidad: 'producto',
      entidadId: id,
      actor: 'admin',
      ip,
    });
  }
}
