import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { SmartSearchMenuUseCase } from '../application/use-cases/smart-search-menu.use-case';
import { ChefSuggestionUseCase } from '../application/use-cases/chef-suggestion.use-case';
import { SmartSearchDto } from './dto/smart-search.dto';
import { SmartSearchResponseDto } from './dto/smart-search-response.dto';
import { ChefSuggestionResponseDto } from './dto/chef-suggestion-response.dto';

/**
 * Endpoints públicos (sin AdminGuard) del criterio "Uso de Inteligencia
 * Artificial": ambos usan Groq (LLM gratuito) para generar contenido a
 * partir del catálogo REAL del negocio, nunca inventan productos.
 */
@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(
    private readonly smartSearchMenuUseCase: SmartSearchMenuUseCase,
    private readonly chefSuggestionUseCase: ChefSuggestionUseCase,
  ) {}

  @Post('smart-search')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiOperation({
    summary: 'Buscador inteligente del menú (IA)',
    description:
      'El cliente describe en lenguaje natural lo que se le antoja; Groq elige, del catálogo ' +
      'real y disponible, los productos que mejor coinciden, con una razón breve para cada uno. ' +
      'Limitado a 10 búsquedas por minuto por IP para proteger el tier gratuito de Groq.',
  })
  @ApiResponse({ status: 200, type: SmartSearchResponseDto, isArray: true })
  @ApiResponse({ status: 400, description: 'query inválida (muy corta, muy larga o vacía)' })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas búsquedas — intenta de nuevo en un momento',
  })
  @ApiResponse({
    status: 502,
    description: 'El servicio de IA no está disponible en este momento',
  })
  async smartSearch(
    @Body() dto: SmartSearchDto,
  ): Promise<SmartSearchResponseDto[]> {
    const matches = await this.smartSearchMenuUseCase.execute(dto.query);
    return matches.map((m) => ({ productoId: m.productoId, razon: m.razon }));
  }

  @Get('chef-suggestion')
  @ApiOperation({
    summary: 'Sugerencia del Chef (IA)',
    description:
      'Combinación destacada de productos disponibles, redactada por IA. Se cachea en el ' +
      'servidor por día (ver ChefSuggestionUseCase) — no genera una llamada nueva a Groq en ' +
      'cada visita al sitio. Si Groq falla, responde con un texto de respaldo genérico pero ' +
      'sigue referenciando productos reales — nunca rompe la carga del Home.',
  })
  @ApiResponse({ status: 200, type: ChefSuggestionResponseDto })
  async chefSuggestion(): Promise<ChefSuggestionResponseDto> {
    return this.chefSuggestionUseCase.execute();
  }
}
