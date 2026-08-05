/**
 * Formatea un monto como Pesos Mexicanos (MXN).
 * Misma implementación que App_Lenios/src/shared/utils/index.ts para que
 * el mensaje de WhatsApp generado por el backend sea idéntico al que
 * generaba el frontend.
 * Ejemplo: formatCurrency(185) → "$185"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
