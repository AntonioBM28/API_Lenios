import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('formatea un monto entero como pesos mexicanos sin decimales', () => {
    expect(formatCurrency(185)).toBe('$185');
  });

  it('redondea/omite decimales (maximumFractionDigits: 0)', () => {
    expect(formatCurrency(99.9)).toBe('$100');
  });

  it('formatea 0 correctamente', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('usa separador de miles para montos grandes', () => {
    expect(formatCurrency(12500)).toBe('$12,500');
  });
});
