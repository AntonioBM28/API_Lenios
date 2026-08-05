/**
 * Acciones auditables sobre datos personales/recursos sensibles.
 * Lista cerrada intencionalmente (varchar(50) en BD) — cualquier acción
 * nueva que se quiera auditar debe agregarse aquí explícitamente.
 */
export type AuditAction =
  | 'ADMIN_LOGIN_SUCCESS'
  | 'ADMIN_LOGIN_FAILED'
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_UPDATED'
  | 'ORDER_DELETED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'BUSINESS_HOURS_UPDATED'
  | 'WHATSAPP_TRANSFER';

export const AUDIT_ACTIONS: AuditAction[] = [
  'ADMIN_LOGIN_SUCCESS',
  'ADMIN_LOGIN_FAILED',
  'ORDER_CREATED',
  'ORDER_STATUS_UPDATED',
  'ORDER_DELETED',
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_DELETED',
  'BUSINESS_HOURS_UPDATED',
  'WHATSAPP_TRANSFER',
];

/**
 * No hay usuarios individuales (acceso simple de un único operador admin +
 * clientes anónimos del sitio público) — solo estos dos roles posibles.
 */
export type AuditActor = 'admin' | 'publico';

export const AUDIT_ACTORS: AuditActor[] = ['admin', 'publico'];
