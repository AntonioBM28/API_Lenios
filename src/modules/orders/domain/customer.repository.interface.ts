import { Customer } from './customer.entity';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

// Valores con los que se sobreescriben nombre/teléfono/dirección al
// anonimizar un cliente (ver AnonymizeInactiveCustomersUseCase). No se
// borra el registro — se preserva la integridad referencial con sus
// pedidos históricos — solo se destruyen los datos personales.
export const ANONYMIZED_CUSTOMER_NAME = 'Cliente eliminado';
export const ANONYMIZED_CUSTOMER_PHONE = '0000000000';
export const ANONYMIZED_CUSTOMER_LOCATION =
  'Dirección eliminada por política de retención';

export interface CreateCustomerData {
  nombre: string;
  telefono: string;
  ubicacion: string;
}

export interface UpdateCustomerData {
  nombre?: string;
  ubicacion?: string;
}

/**
 * Patrón: Repository.
 */
export interface CustomerRepository {
  findByTelefono(telefono: string): Promise<Customer | null>;
  findById(id: string): Promise<Customer | null>;
  create(data: CreateCustomerData): Promise<Customer>;
  update(id: string, data: UpdateCustomerData): Promise<Customer>;

  /**
   * Clientes elegibles para anonimización: ya no tienen ningún pedido en
   * un estado activo (recibido/en_preparacion/en_camino) — es decir, no
   * hay una relación de servicio en curso — y su pedido más reciente es
   * anterior a `cutoff`. Excluye clientes ya anonimizados.
   */
  findInactiveSince(cutoff: Date): Promise<Customer[]>;

  /** Sobreescribe nombre/teléfono/ubicación con los valores ANONYMIZED_*. */
  anonymize(id: string): Promise<void>;

  /**
   * Lógica ARCO — paso 1: bloquea al cliente. Mientras está bloqueado no
   * puede generar nuevos pedidos (ver CreateOrderUseCase), lo que detiene
   * de inmediato la recolección de más datos suyos mientras se procesa su
   * solicitud (Oposición) o se verifica su identidad antes del paso 2
   * (anonimizar/eliminar).
   */
  block(id: string): Promise<void>;

  /** Revierte block() — por ejemplo si la solicitud se identifica/cancela. */
  unblock(id: string): Promise<void>;
}
