/**
 * Payload mínimo del JWT de sesión del admin. Sin datos personales:
 * el negocio tiene un único operador y no existe un modelo de usuarios.
 */
export interface AdminTokenPayload {
  role: 'admin';
}
