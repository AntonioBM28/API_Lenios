import { ChefSuggestionUseCase } from './chef-suggestion.use-case';
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

describe('ChefSuggestionUseCase', () => {
  let productRepository: jest.Mocked<Pick<ProductRepository, 'findAll'>>;
  let aiTextGenerator: jest.Mocked<AiTextGenerator>;
  let useCase: ChefSuggestionUseCase;

  beforeEach(() => {
    productRepository = { findAll: jest.fn() };
    aiTextGenerator = { complete: jest.fn() };
    useCase = new ChefSuggestionUseCase(
      productRepository as unknown as ProductRepository,
      aiTextGenerator,
    );
  });

  it('devuelve fallback con productoIds vacío si no hay productos disponibles', async () => {
    productRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.productoIds).toEqual([]);
    expect(result.titulo).toBeTruthy();
    expect(aiTextGenerator.complete).not.toHaveBeenCalled();
  });

  it('devuelve la sugerencia generada por Groq referenciando productos reales', async () => {
    const productos = [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2' })];
    productRepository.findAll.mockResolvedValue(productos);
    aiTextGenerator.complete.mockResolvedValue(
      JSON.stringify({ titulo: 'Dúo Picante', descripcion: 'Rico y picoso' }),
    );

    const result = await useCase.execute();

    expect(result.titulo).toBe('Dúo Picante');
    expect(result.descripcion).toBe('Rico y picoso');
    expect(result.productoIds.length).toBeGreaterThan(0);
    result.productoIds.forEach((id) => {
      expect(productos.map((p) => p.id)).toContain(id);
    });
  });

  it('cae a un fallback genérico si Groq falla, pero sigue referenciando productos reales', async () => {
    const productos = [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2' })];
    productRepository.findAll.mockResolvedValue(productos);
    aiTextGenerator.complete.mockRejectedValue(new Error('timeout'));

    const result = await useCase.execute();

    expect(result.titulo).toBe('Sugerencia del Chef');
    expect(result.productoIds.length).toBeGreaterThan(0);
  });

  it('cachea el resultado del día — no vuelve a llamar a Groq en la segunda ejecución', async () => {
    const productos = [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2' })];
    productRepository.findAll.mockResolvedValue(productos);
    aiTextGenerator.complete.mockResolvedValue(
      JSON.stringify({ titulo: 'Dúo Picante', descripcion: 'Rico y picoso' }),
    );

    await useCase.execute();
    await useCase.execute();

    expect(aiTextGenerator.complete).toHaveBeenCalledTimes(1);
  });
});
