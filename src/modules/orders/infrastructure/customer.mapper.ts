import { Customer } from '../domain/customer.entity';
import { CustomerOrmEntity } from './customer.orm-entity';

export class CustomerMapper {
  static toDomain(orm: CustomerOrmEntity): Customer {
    return new Customer({
      id: orm.id,
      nombre: orm.nombre,
      telefono: orm.telefono,
      ubicacion: orm.ubicacion,
      fechaRegistro: orm.fechaRegistro,
    });
  }
}
