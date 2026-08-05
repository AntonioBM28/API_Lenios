import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductOrmEntity } from '../../products/infrastructure/product.orm-entity';
import { OrderOrmEntity } from './order.orm-entity';

const NUMERIC_TRANSFORMER = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity({ name: 'detalle_pedido' })
export class OrderItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_pedido', type: 'uuid' })
  idPedido!: string;

  @ManyToOne(() => OrderOrmEntity, (pedido) => pedido.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pedido' })
  pedido?: OrderOrmEntity;

  @Column({ name: 'id_producto', type: 'uuid' })
  idProducto!: string;

  @ManyToOne(() => ProductOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_producto' })
  producto?: ProductOrmEntity;

  @Column({ type: 'integer' })
  cantidad!: number;

  @Column({
    name: 'precio_unitario',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: NUMERIC_TRANSFORMER,
  })
  precioUnitario!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha!: Date;
}
