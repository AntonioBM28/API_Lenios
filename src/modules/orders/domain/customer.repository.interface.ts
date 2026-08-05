import { Customer } from './customer.entity';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CreateCustomerData {
  nombre: string;
  telefono: string;
  ubicacion: string;
}

export interface UpdateCustomerData {
  nombre?: string;
  ubicacion?: string;
}

export interface CustomerRepository {
  findByTelefono(telefono: string): Promise<Customer | null>;
  create(data: CreateCustomerData): Promise<Customer>;
  update(id: string, data: UpdateCustomerData): Promise<Customer>;
}
