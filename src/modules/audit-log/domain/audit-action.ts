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
  | 'WHATSAPP_TRANSFER'
  | 'DELIVERY_GEOCODED'
  | 'CUSTOMER_DATA_ANONYMIZED'
  | 'CUSTOMER_ARCO_BLOCKED'
  | 'CUSTOMER_ARCO_UNBLOCKED'
  | 'ORDER_REJECTED_BLOCKED_CUSTOMER';

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
  'DELIVERY_GEOCODED',
  'CUSTOMER_DATA_ANONYMIZED',
  'CUSTOMER_ARCO_BLOCKED',
  'CUSTOMER_ARCO_UNBLOCKED',
  'ORDER_REJECTED_BLOCKED_CUSTOMER',
];

/**
 * 'sistema' cubre acciones automáticas sin intervención humana directa
 * (ej. el cron de retención de datos) — a diferencia de 'admin' (acción
 * de un operador autenticado) y 'publico' (acción de un cliente anónimo).
 */
export type AuditActor = 'admin' | 'publico' | 'sistema';

export const AUDIT_ACTORS: AuditActor[] = ['admin', 'publico', 'sistema'];
