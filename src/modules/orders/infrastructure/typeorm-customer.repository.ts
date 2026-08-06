import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../domain/customer.entity';
import {
  ANONYMIZED_CUSTOMER_LOCATION,
  ANONYMIZED_CUSTOMER_NAME,
  ANONYMIZED_CUSTOMER_PHONE,
  CreateCustomerData,
  CustomerRepository,
  UpdateCustomerData,
} from '../domain/customer.repository.interface';
import { CustomerOrmEntity } from './customer.orm-entity';
import { CustomerMapper } from './customer.mapper';

// Estados de pedido que indican una relación de servicio todavía activa
// con el cliente — mientras exista uno así, no se anonimiza.
const ESTADOS_ACTIVOS = ['recibido', 'en_preparacion', 'en_camino'];

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repo: Repository<CustomerOrmEntity>,
  ) {}

  async findByTelefono(telefono: string): Promise<Customer | null> {
    const row = await this.repo.findOne({ where: { telefono } });
    return row ? CustomerMapper.toDomain(row) : null;
  }

  async create(data: CreateCustomerData): Promise<Customer> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    return CustomerMapper.toDomain(saved);
  }

  async update(id: string, data: UpdateCustomerData): Promise<Customer> {
    const existing = await this.repo.findOneOrFail({ where: { id } });
    Object.assign(existing, data);
    const saved = await this.repo.save(existing);
    return CustomerMapper.toDomain(saved);
  }

  async findInactiveSince(cutoff: Date): Promise<Customer[]> {
    const rows = await this.repo
      .createQueryBuilder('c')
      .where('c.nombre != :anonimizado', {
        anonimizado: ANONYMIZED_CUSTOMER_NAME,
      })
      // Debe tener al menos un pedido (un cliente sin pedidos no tiene
      // "finalidad cumplida" que anonimizar — probablemente es un
      // registro huérfano o de prueba, se deja fuera a propósito).
      .andWhere('EXISTS (SELECT 1 FROM pedidos p WHERE p.id_cliente = c.id)')
      // Sin ningún pedido en curso (relación de servicio activa).
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM pedidos p
          WHERE p.id_cliente = c.id AND p.estado IN (:...activos)
        )`,
        { activos: ESTADOS_ACTIVOS },
      )
      // Su pedido más reciente ya está fuera del período de retención.
      .andWhere(
        `(SELECT MAX(p.fecha_pedido) FROM pedidos p WHERE p.id_cliente = c.id) < :cutoff`,
        { cutoff },
      )
      .getMany();

    return rows.map((row) => CustomerMapper.toDomain(row));
  }

  async anonymize(id: string): Promise<void> {
    await this.repo.update(id, {
      nombre: ANONYMIZED_CUSTOMER_NAME,
      telefono: ANONYMIZED_CUSTOMER_PHONE,
      ubicacion: ANONYMIZED_CUSTOMER_LOCATION,
    });
  }
}
