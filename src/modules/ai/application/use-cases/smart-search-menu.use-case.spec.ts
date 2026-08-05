import { BadGatewayException } from '@nestjs/common';
import { SmartSearchMenuUseCase } from './smart-search-menu.use-case';
import { Product, ProductProps } from '../../../products/domain/product.entity';
import { ProductRepository } from '../../../products/domain/product.repository.interface';
import { AiTextGenerator } from '../../domain/ai-text-generator.interface';

function makeProduct(overrides: Partial<ProductProps> = {}): Product {
  return new Product({
    id: 'prod-1',
    nombre: 'Leño de Salchicha',
    descripcion: 'Con jalapeños',
    precio: 90,
    imagenUrl: null,
    categoriaId: 'cat-1',
    disponible: true,
    stock: 10,
    destacado: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

describe('SmartSearchMenuUseCase', () => {
  let productRepository: jest.Mocked<Pick<ProductRepository, 'findAll'>>;
  let aiTextGenerator: jest.Mocked<AiTextGenerator>;
  let useCase: SmartSearchMenuUseCase;

  beforeEach(() => {
    productRepository = { findAll: jest.fn() };
    aiTextGenerator = { complete: jest.fn() };
    useCase = new SmartSearchMenuUseCase(
      productRepository as unknown as ProductRepository,
      aiTextGenerator,
    );
  });

  it('devuelve [] si no hay productos disponibles (no llama a Groq)', async () => {
    productRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute('algo picante');

    expect(result).toEqual([]);
    expect(aiTextGenerator.complete).not.toHaveBeenCalled();
  });

  it('devuelve los matches cuyo id existe en el catálogo real', async () => {
    productRepository.findAll.mockResolvedValue([makeProduct({ id: 'prod-1' })]);
    aiTextGenerator.complete.mockResolvedValue(
      JSON.stringify([{ productoId: 'prod-1', razon: 'tiene jalapeños' }]),
    );

    const result = await useCase.execute('algo picante');

    expect(result).toEqual([{ productoId: 'prod-1', razon: 'tiene jalapeños' }]);
  });

  it('descarta ids alucinados que no existen en el catálogo real', async () => {
    productRepository.findAll.mockResolvedValue([makeProduct({ id: 'prod-1' })]);
    aiTextGenerator.complete.mockResolvedValue(
      JSON.stringify([
        { productoId: 'prod-1', razon: 'real' },
        { productoId: 'prod-inventado', razon: 'no debería aparecer' },
      ]),
    );

    const result = await useCase.execute('algo');

    expect(result).toEqual([{ productoId: 'prod-1', razon: 'real' }]);
  });

  it('lanza BadGatewayException si Groq falla', async () => {
    productRepository.findAll.mockResolvedValue([makeProduct()]);
    aiTextGenerator.complete.mockRejectedValue(new Error('timeout'));

    await expect(useCase.execute('algo')).rejects.toThrow(BadGatewayException);
  });

  it('lanza BadGatewayException si la respuesta no es JSON válido', async () => {
    productRepository.findAll.mockResolvedValue([makeProduct()]);
    aiTextGenerator.complete.mockResolvedValue('esto no es json');

    await expect(useCase.execute('algo')).rejects.toThrow(BadGatewayException);
  });
});
