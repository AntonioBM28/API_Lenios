import { Transform } from 'class-transformer';

/**
 * Elimina cualquier markup HTML de un string, dejando solo texto plano.
 *
 * Ninguno de los campos de texto libre de esta API (nombre, dirección,
 * observaciones, descripción de producto, etc.) debe aceptar HTML — se
 * guardan y se muestran siempre como texto (panel admin en React, que ya
 * escapa por defecto, o el mensaje de WhatsApp, que es texto plano). Por
 * eso el enfoque es "quitar todo", no "permitir una lista blanca de
 * etiquetas": es la opción más simple y más segura para este caso de uso.
 *
 * Estrategia en dos pasos:
 *  1. Elimina bloques completos de <script>...</script> y <style>...</style>
 *     (etiqueta + contenido interno) — su contenido nunca es texto legítimo
 *     que valga la pena conservar.
 *  2. Elimina cualquier otra etiqueta suelta (<img>, <b>, <a href=...>,
 *     etc.), conservando el texto que quede entre ellas.
 *
 * Nota deliberada: se implementa con una función propia (regex) en vez de
 * una librería como `sanitize-html` porque esa librería depende de
 * `htmlparser2`, que en sus versiones recientes se distribuye como ESM
 * puro y rompe a Jest (CommonJS) sin configuración adicional de
 * transformIgnorePatterns/babel — una complejidad de tooling injustificada
 * para el caso simple que necesitamos aquí (texto plano, no HTML real).
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<(script|style)\b[^<]*(?:(?!<\/\1\s*>)<[^<]*)*<\/\1\s*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Validación de Datos: sanitiza campos de texto libre entrantes ANTES de
 * validarlos. Complementa, no reemplaza, la validación de class-validator
 * (@IsString, @MinLength...): la sanitización limpia el valor, la
 * validación decide si el resultado limpio es aceptable.
 *
 * Se ejecuta como parte del `transform: true` del ValidationPipe global
 * (main.ts): Nest corre `plainToInstance` — que aplica este @Transform —
 * ANTES de correr los validadores, así que @MinLength/@IsNotEmpty etc. ya
 * ven el valor sanitizado (ej. un input que era solo `<script>...</script>`
 * queda vacío después de sanitizar, y por lo tanto falla @MinLength como
 * se espera, no lo esquiva).
 */
export function Sanitize(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    return stripHtml(value);
  });
}
