import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from '../../domain/customer.entity';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/customer.repository.interface';

/**
 * Permite al admin ubicar un cliente por su ID (ej. visto en el detalle de
 * un pedido) antes de accionar una solicitud ARCO sobre él.
 */
@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(customerId: string): Promise<Customer> {
    const cliente = await this.customerRepository.findById(customerId);
    if (!cliente) {
      throw new NotFoundException(
        `Cliente con id "${customerId}" no encontrado`,
      );
    }
    return cliente;
  }
}
