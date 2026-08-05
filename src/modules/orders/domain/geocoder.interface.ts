export const GEOCODER = Symbol('GEOCODER');

export interface GeocodeResult {
  lat: number;
  lon: number;
}

/**
 * Patrón: Strategy (igual que TokenIssuer en el módulo auth).
 *
 * Puerto de geocodificación — traduce una dirección de texto libre a
 * coordenadas (lat/lon). Implementado en infrastructure/ contra la API
 * pública de Nominatim (OpenStreetMap): el servicio de terceros real que
 * cumple "Web Services de Terceros" del caso de estudio (alternativa sin
 * costo a una API de mapas de pago).
 *
 * CreateOrderUseCase depende solo de esta interfaz. La geocodificación es
 * best-effort: si la API externa falla, no responde a tiempo o no
 * encuentra la dirección, el adaptador devuelve null y el pedido se crea
 * igual — nunca bloquea el checkout por un problema de un tercero.
 */
export interface Geocoder {
  geocode(direccion: string): Promise<GeocodeResult | null>;
}
