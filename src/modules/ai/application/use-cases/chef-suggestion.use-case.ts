import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../products/domain/product.repository.interface';
import { Product } from '../../../products/domain/product.entity';
import {
  AI_TEXT_GENERATOR,
  AiTextGenerator,
} from '../../domain/ai-text-generator.interface';
import { extractJson } from '../extract-json.util';

export interface ChefSuggestionResult {
  titulo: string;
  descripcion: string;
  productoIds: string[];
}

interface RawSuggestion {
  titulo?: unknown;
  descripcion?: unknown;
}

const FALLBACK_TITULO = 'Sugerencia del Chef';
const FALLBACK_DESCRIPCION =
  'Prueba nuestros favoritos de siempre — ¡nunca fallan!';

/**
 * "Sugerencia del Chef": tarjeta destacada del Home donde Groq redacta una
 * combinación llamativa de productos REALES y disponibles del catálogo.
 *
 * Es una feature decorativa (no crítica para el checkout), así que es
 * deliberadamente best-effort en dos frentes:
 *  - Si Groq falla o responde algo que no se puede parsear, se cae a un
 *    texto genérico pero SIEMPRE referenciando productos reales — nunca
 *    rompe la carga del Home.
 *  - Se cachea en memoria por día (`cache.fecha`) para no llamar a Groq en
 *    cada visita al Home — el catálogo de un negocio pequeño no cambia
 *    tan seguido como para justificar una llamada por request.
 */
@Injectable()
export class ChefSuggestionUseCase {
  private readonly logger = new Logger(ChefSuggestionUseCase.name);
  private cache: { fecha: string; resultado: ChefSuggestionResult } | null =
    null;

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(AI_TEXT_GENERATOR)
    private readonly aiTextGenerator: AiTextGenerator,
  ) {}

  async execute(): Promise<ChefSuggestionResult> {
    const hoy = new Date().toISOString().slice(0, 10);
    if (this.cache?.fecha === hoy) {
      return this.cache.resultado;
    }

    const productos = await this.productRepository.findAll({
      disponible: true,
    });

    if (productos.length === 0) {
      const resultado: ChefSuggestionResult = {
        titulo: FALLBACK_TITULO,
        descripcion: FALLBACK_DESCRIPCION,
        productoIds: [],
      };
      this.cache = { fecha: hoy, resultado };
      return resultado;
    }

    const elegidos = this.elegirProductos(productos);
    const resultado = await this.generarSugerencia(elegidos);

    this.cache = { fecha: hoy, resultado };
    return resultado;
  }

  /**
   * Elige 2-3 productos disponibles para combinar. Prioriza los marcados
   * como `destacado` (ya son la selección editorial del admin); si no hay
   * suficientes, usa el catálogo disponible completo. La elección es
   * determinista por día del mes (no random puro) para que no cambie
   * entre requests dentro del mismo día si el caché en memoria se pierde
   * (ej. reinicio del proceso en Render).
   */
  private elegirProductos(productos: Product[]): Product[] {
    const destacados = productos.filter((p) => p.destacado);
    const base = destacados.length >= 2 ? destacados : productos;

    const start = new Date().getDate() % base.length;
    const seleccionados = [base[start], base[(start + 1) % base.length]];
    if (base.length > 2) {
      seleccionados.push(base[(start + 2) % base.length]);
    }

    // Catálogos muy chicos (1-2 productos) pueden generar duplicados al
    // dar la vuelta con el módulo — se deduplican por id.
    return Array.from(new Map(seleccionados.map((p) => [p.id, p])).values());
  }

  private async generarSugerencia(
    productos: Product[],
  ): Promise<ChefSuggestionResult> {
    const productoIds = productos.map((p) => p.id);
    const prompt = this.buildPrompt(productos);

    try {
      const raw = await this.aiTextGenerator.complete(prompt);
      const parsed = extractJson<RawSuggestion>(raw);

      if (
        parsed &&
        typeof parsed.titulo === 'string' &&
        typeof parsed.descripcion === 'string'
      ) {
        return { titulo: parsed.titulo, descripcion: parsed.descripcion, productoIds };
      }

      this.logger.warn(
        `Sugerencia del chef: respuesta de Groq no fue JSON válido: ${raw.slice(0, 200)}`,
      );
    } catch (error) {
      this.logger.warn(
        `Sugerencia del chef falló al llamar a Groq: ${(error as Error).message}`,
      );
    }

    return {
      titulo: FALLBACK_TITULO,
      descripcion: FALLBACK_DESCRIPCION,
      productoIds,
    };
  }

  private buildPrompt(productos: Product[]): string {
    const catalogo = productos.map((p) => ({
      nombre: p.nombre,
      descripcion: p.descripcion,
    }));

    return `Eres el chef de "Leños Rellenos", un negocio de comida artesanal (leños de pan rellenos).

Arma una "Sugerencia del Chef" del día combinando ÚNICAMENTE estos productos reales:
${JSON.stringify(catalogo)}

Devuelve SOLO un objeto JSON (sin texto adicional, sin markdown, sin \`\`\`) con esta forma exacta:
{"titulo": "<título corto y llamativo, máx 6 palabras>", "descripcion": "<1-2 frases vendiendo la combinación, tono cálido y artesanal, máx 200 caracteres>"}`;
  }
}
