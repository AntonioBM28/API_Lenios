import { Injectable, Logger } from '@nestjs/common';
import { Geocoder, GeocodeResult } from '../domain/geocoder.interface';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const REQUEST_TIMEOUT_MS = 5000;

interface NominatimResult {
  lat: string;
  lon: string;
}

/**
 * Adaptador de Geocoder contra Nominatim, la API pública de búsqueda de
 * OpenStreetMap (sin API key). Es una llamada HTTP saliente real a un
 * servicio de terceros, no una simulación.
 *
 * Nominatim exige un User-Agent identificable en su política de uso
 * (https://operations.osmfoundation.org/policies/nominatim/) — no se debe
 * quitar ese header ni llamar en bucle (1 req/seg máx, aquí solo se llama
 * una vez por pedido creado).
 */
@Injectable()
export class NominatimGeocoderService implements Geocoder {
  private readonly logger = new Logger(NominatimGeocoderService.name);

  async geocode(direccion: string): Promise<GeocodeResult | null> {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('q', direccion);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'mx');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'LenosRellenos-CaseStudy/1.0 (proyecto escolar, sin fines comerciales)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(
          `Nominatim respondió ${response.status}; se omite geocodificación`,
        );
        return null;
      }

      const results = (await response.json()) as NominatimResult[];
      if (results.length === 0) {
        return null;
      }

      const [{ lat, lon }] = results;
      const parsed: GeocodeResult = { lat: parseFloat(lat), lon: parseFloat(lon) };
      if (Number.isNaN(parsed.lat) || Number.isNaN(parsed.lon)) {
        return null;
      }
      return parsed;
    } catch (error) {
      // Best-effort: timeout, DNS, red caída, JSON inválido, etc. Nunca debe
      // tumbar la creación del pedido — solo se registra para diagnóstico.
      this.logger.warn(
        `No se pudo geocodificar la dirección: ${(error as Error).message}`,
      );
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
