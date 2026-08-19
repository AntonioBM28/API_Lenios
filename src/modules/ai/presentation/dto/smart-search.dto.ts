import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Sanitize } from '../../../../common/decorators/sanitize.decorator';

/**
 * CONVENCIÓN DEL PROYECTO — class-validator:
 * ─────────────────────────────────────────────────────────────────────────────
 * Todo decorador de class-validator en los DTOs de `presentation/dto/` DEBE
 * incluir su propio mensaje en español en el parámetro `{ message: '...' }`.
 * Nunca dejar el mensaje por defecto (en inglés/técnico) — ese mensaje llega
 * tal cual al usuario final a través del sistema de toasts del frontend.
 *
 * Formato recomendado: claro, cercano y sin jerga técnica.
 *   ✅ "La búsqueda debe tener al menos 3 caracteres"
 *   ❌ "query must be longer than or equal to 3 characters"
 *
 * Ver también: el exceptionFactory en main.ts une todos los mensajes con "; "
 * y los devuelve siempre como un string limpio en `message`.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export class SmartSearchDto {
  @ApiProperty({ example: 'algo picante y barato para compartir' })
  @Sanitize()
  @IsString({ message: 'La búsqueda debe ser texto' })
  @MinLength(3, { message: 'La búsqueda debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'La búsqueda no puede superar los 200 caracteres' })
  query!: string;
}
