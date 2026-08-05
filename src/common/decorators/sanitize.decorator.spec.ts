import { plainToInstance } from 'class-transformer';
import { Sanitize } from './sanitize.decorator';

class SanitizeTestDto {
  @Sanitize()
  texto!: string;

  @Sanitize()
  opcional?: string;

  sinSanitizar!: string;
}

describe('Sanitize decorator', () => {
  it('elimina etiquetas <script> junto con su contenido', () => {
    const dto = plainToInstance(SanitizeTestDto, {
      texto: '<script>alert("xss")</script>Juan Pérez',
      sinSanitizar: 'x',
    });

    // sanitize-html trata <script>/<style> como "non-text tags" por defecto:
    // no solo quita la etiqueta, descarta también su contenido interno.
    expect(dto.texto).toBe('Juan Pérez');
    expect(dto.texto).not.toContain('script');
    expect(dto.texto).not.toContain('alert');
  });

  it('elimina atributos de eventos inline (ej. onerror en <img>)', () => {
    const dto = plainToInstance(SanitizeTestDto, {
      texto: '<img src=x onerror="alert(1)">Av. Siempre Viva 742',
      sinSanitizar: 'x',
    });

    expect(dto.texto).toBe('Av. Siempre Viva 742');
    expect(dto.texto).not.toContain('onerror');
  });

  it('no toca texto plano normal (con acentos/ñ)', () => {
    const dto = plainToInstance(SanitizeTestDto, {
      texto: 'Tocar el timbre, no hay número visible — depto. 4B',
      sinSanitizar: 'x',
    });

    expect(dto.texto).toBe('Tocar el timbre, no hay número visible — depto. 4B');
  });

  it('recorta espacios en blanco al inicio/final', () => {
    const dto = plainToInstance(SanitizeTestDto, {
      texto: '   Juan Pérez   ',
      sinSanitizar: 'x',
    });

    expect(dto.texto).toBe('Juan Pérez');
  });

  it('deja pasar undefined en campos opcionales sin fallar', () => {
    const dto = plainToInstance(SanitizeTestDto, {
      texto: 'ok',
      sinSanitizar: 'x',
    });

    expect(dto.opcional).toBeUndefined();
  });
});
