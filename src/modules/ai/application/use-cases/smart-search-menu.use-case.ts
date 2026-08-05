import { BadGatewayException, Inject, Injectable, Logger } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../products/domain/product.repository.interface';
import {
  AI_TEXT_GENERATOR,
  AiTextGenerator,
} from '../../domain/ai-text-generator.interface';
import { extractJson } from '../extract-json.util';

export interface SmartSearchMatch {
  productoId: string;
  razon: string;
}

interface RawMatch {
  productoId?: unknown;
  razon?: unknown;
}

const MAX_RESULTS = 6;

/**
 * Buscador inteligente del menú: el cliente describe en lenguaje natural
 * lo que se le antoja ("algo picante y barato") y este caso de uso le pide
 * a Groq que elija, del catálogo REAL disponible, los productos que mejor
 * coincidan — con una razón corta para mostrar en el frontend.
 *
 * Defensa contra alucinaciones: el modelo solo ve los productos realmente
 * disponibles (con sus IDs reales) y, aun así, cualquier ID que devuelva
 * que NO esté en ese catálogo se descarta antes de responder al cliente
 * — nunca confiamos ciegamente en que el LLM solo usó los IDs que le dimos.
 */
@Injectable()
export class SmartSearchMenuUseCase {
  private readonly logger = new Logger(SmartSearchMenuUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(AI_TEXT_GENERATOR)
    private readonly aiTextGenerator: AiTextGenerator,
  ) {}

  async execute(query: string): Promise<SmartSearchMatch[]> {
    const productos = await this.productRepository.findAll({
      disponible: true,
    });

    if (productos.length === 0) return [];

    const catalogo = productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
    }));

    const prompt = this.buildPrompt(query, catalogo);

    let raw: string;
    try {
      raw = await this.aiTextGenerator.complete(prompt);
    } catch (error) {
      this.logger.warn(
        `Búsqueda inteligente falló al llamar a Groq: ${(error as Error).message}`,
      );
      throw new BadGatewayException(
        'El buscador inteligente no está disponible en este momento. Intenta de nuevo en unos segundos.',
      );
    }

    const parsed = extractJson<RawMatch[]>(raw);
    if (!parsed || !Array.isArray(parsed)) {
      this.logger.warn(
        `Búsqueda inteligente: respuesta de Groq no fue JSON válido: ${raw.slice(0, 200)}`,
      );
      throw new BadGatewayException(
        'El buscador inteligente no pudo procesar tu búsqueda. Intenta reformularla.',
      );
    }

    const idsValidos = new Set(productos.map((p) => p.id));

    return parsed
      .filter(
        (m): m is { productoId: string; razon: string } =>
          typeof m.productoId === 'string' &&
          typeof m.razon === 'string' &&
          idsValidos.has(m.productoId),
      )
      .slice(0, MAX_RESULTS);
  }

  private buildPrompt(
    query: string,
    catalogo: Array<{
      id: string;
      nombre: string;
      descripcion: string;
      precio: number;
    }>,
  ): string {
    return `Eres el asistente del menú de "Leños Rellenos", un negocio de comida artesanal (leños de pan rellenos).

Un cliente describió lo que se le antoja: "${query}"

Este es el catálogo REAL disponible (JSON, no inventes productos fuera de esta lista):
${JSON.stringify(catalogo)}

Devuelve SOLO un array JSON (sin texto adicional, sin markdown, sin \`\`\`) con los productos que mejor coincidan, ordenados del más al menos relevante, máximo 6 resultados. Cada elemento debe tener exactamente esta forma:
[{"productoId": "<id exacto del catálogo>", "razon": "<explicación breve de 6-12 palabras en español, tono amigable>"}]

Si NINGÚN producto coincide razonablemente con lo que pidió el cliente, devuelve un array vacío: []`;
  }
}
