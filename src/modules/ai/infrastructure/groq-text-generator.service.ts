import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Groq } from 'groq-sdk';
import { AiTextGenerator } from '../domain/ai-text-generator.interface';

// Modelo gratuito servido por Groq (gpt-oss de OpenAI corriendo en el
// hardware LPU de Groq). Sin costo en el tier gratuito de Groq.
const MODEL = 'openai/gpt-oss-120b';
const MAX_COMPLETION_TOKENS = 1024;

/**
 * Adaptador de AiTextGenerator contra Groq (https://groq.com), API de
 * inferencia LLM compatible con el formato de OpenAI. Tier gratuito sin
 * tarjeta — ver GROQ_API_KEY en .env.example.
 *
 * No hay `response_format: json_object` aquí a propósito: no todos los
 * modelos/versiones de la API de Groq lo soportan de forma consistente,
 * así que en vez de depender de eso, el prompt le pide explícitamente al
 * modelo que responda solo con JSON, y quien llama a `complete()`
 * (SmartSearchMenuUseCase, ChefSuggestionUseCase) hace el parseo de forma
 * defensiva (ver stripJsonFences en esos casos de uso).
 */
@Injectable()
export class GroqTextGeneratorService implements AiTextGenerator {
  private readonly logger = new Logger(GroqTextGeneratorService.name);
  private readonly client: Groq;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.groqApiKey');
    this.client = new Groq({ apiKey });
  }

  async complete(prompt: string): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
      });

      return completion.choices[0]?.message?.content ?? '';
    } catch (error) {
      this.logger.error(
        `Groq falló: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
