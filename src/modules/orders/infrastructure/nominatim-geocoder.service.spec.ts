import { NominatimGeocoderService } from './nominatim-geocoder.service';

describe('NominatimGeocoderService', () => {
  let service: NominatimGeocoderService;
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    service = new NominatimGeocoderService();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('devuelve lat/lon cuando Nominatim encuentra la dirección', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ lat: '19.4326', lon: '-99.1332' }]),
    } as Response);

    const result = await service.geocode('Av. Siempre Viva 742, Col. Centro');

    expect(result).toEqual({ lat: 19.4326, lon: -99.1332 });
    // Verifica que sí se hizo una llamada HTTP real a Nominatim (no un stub local)
    const calledUrl = fetchSpy.mock.calls[0][0] as URL;
    expect(calledUrl.toString()).toContain('nominatim.openstreetmap.org/search');
    expect(calledUrl.toString()).toContain('Siempre');
  });

  it('devuelve null cuando Nominatim no encuentra coincidencias', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as unknown as Response);

    const result = await service.geocode('dirección inexistente xyz123');

    expect(result).toBeNull();
  });

  it('devuelve null (best-effort) cuando Nominatim responde con error HTTP', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 503 } as Response);

    const result = await service.geocode('Av. Siempre Viva 742');

    expect(result).toBeNull();
  });

  it('devuelve null (best-effort) cuando la llamada de red falla o hace timeout', async () => {
    fetchSpy.mockRejectedValue(new Error('network error'));

    const result = await service.geocode('Av. Siempre Viva 742');

    expect(result).toBeNull();
  });
});
