import { extractJson } from './extract-json.util';

describe('extractJson', () => {
  it('parsea JSON directo', () => {
    expect(extractJson<{ a: number }>('{"a": 1}')).toEqual({ a: 1 });
  });

  it('quita fences de markdown ```json ... ```', () => {
    expect(extractJson<{ a: number }>('```json\n{"a": 1}\n```')).toEqual({
      a: 1,
    });
  });

  it('extrae el primer bloque JSON si hay texto alrededor', () => {
    expect(extractJson<{ a: number }>('Aquí está: {"a": 1} gracias')).toEqual(
      { a: 1 },
    );
  });

  it('parsea arrays', () => {
    expect(extractJson<number[]>('[1,2,3]')).toEqual([1, 2, 3]);
  });

  it('devuelve null si no hay JSON válido', () => {
    expect(extractJson('esto no es json')).toBeNull();
  });
});
