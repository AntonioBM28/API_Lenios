import { Module } from '@nestjs/common';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { ProductsModule } from '../products/products.module';
import { AI_TEXT_GENERATOR } from './domain/ai-text-generator.interface';
import { GroqTextGeneratorService } from './infrastructure/groq-text-generator.service';
import { SmartSearchMenuUseCase } from './application/use-cases/smart-search-menu.use-case';
import { ChefSuggestionUseCase } from './application/use-cases/chef-suggestion.use-case';
import { AiController } from './presentation/ai.controller';

/**
 * AiModule — Criterio 8 (Uso de Inteligencia Artificial).
 *
 * Dos features públicas sobre el catálogo real (nunca inventan productos):
 *  - Buscador inteligente del menú (POST /ai/smart-search)
 *  - Sugerencia del Chef (GET /ai/chef-suggestion), cacheada por día
 *
 * Importa ProductsModule para leer el catálogo real vía PRODUCT_REPOSITORY
 * — este módulo nunca escribe productos, solo los lee para dárselos de
 * contexto a Groq (evita que el modelo "invente" productos que no existen).
 */
@Module({
  imports: [
    ProductsModule,
    // Instancia propia de ThrottlerModule (mismo patrón que AuthModule):
    // protege /ai/smart-search de abuso que agotaría el tier gratuito de Groq.
    ThrottlerModule.forRoot([{ ttl: seconds(60), limit: 10 }]),
  ],
  controllers: [AiController],
  providers: [
    { provide: AI_TEXT_GENERATOR, useClass: GroqTextGeneratorService },
    SmartSearchMenuUseCase,
    ChefSuggestionUseCase,
  ],
})
export class AiModule {}
