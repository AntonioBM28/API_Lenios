import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../domain/customer.entity';
import {
  CreateCustomerData,
  CustomerRepository,
  UpdateCustomerData,
} from '../domain/customer.repository.interface';
import { CustomerOrmEntity } from './customer.orm-entity';
import { CustomerMapper } from './customer.mapper';

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
}
