export const AI_TEXT_GENERATOR = Symbol('AI_TEXT_GENERATOR');

/**
 * Patrón: Strategy (igual que TokenIssuer en auth y Geocoder en orders).
 *
 * Puerto de generación de texto por IA. Implementado en infrastructure/
 * contra Groq (API gratuita compatible con OpenAI, sin tarjeta). Los
 * casos de uso (SmartSearchMenuUseCase, ChefSuggestionUseCase) dependen
 * solo de esta interfaz, nunca del SDK de Groq directamente — se podría
 * cambiar de proveedor (otro LLM compatible con OpenAI, por ejemplo) sin
 * tocar la lógica de negocio.
 */
export interface AiTextGenerator {
  /**
   * Envía `prompt` al modelo y devuelve el texto de respuesta crudo (sin
   * parsear). Quien llama es responsable de indicarle al modelo en el
   * propio prompt el formato esperado (ej. "responde solo con JSON") y de
   * parsear/validar el resultado — este puerto no asume ninguna estructura.
   */
  complete(prompt: string): Promise<string>;
}
