/**
 * Extrae y parsea JSON de la respuesta cruda de un LLM.
 *
 * Los prompts de este módulo le piden explícitamente al modelo que
 * responda "solo JSON, sin markdown" — pero los LLM no siempre obedecen al
 * pie de la letra (a veces envuelven la respuesta en \`\`\`json ... \`\`\`
 * o agregan una frase antes/después). Esta función intenta el parseo
 * directo primero y, si falla, busca el primer bloque {...} o [...] dentro
 * del texto como respaldo. Devuelve `null` si ninguna estrategia funciona
 * — quien llama decide qué hacer (reintentar, fallback, error 502, etc.).
 */
export function extractJson<T>(raw: string): T | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}
