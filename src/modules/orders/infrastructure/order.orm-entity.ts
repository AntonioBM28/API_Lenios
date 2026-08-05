import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerOrmEntity } from './customer.orm-entity';
import { OrderItemOrmEntity } from './order-item.orm-entity';
import { EstadoPedido } from '../domain/estado-pedido';

const NUMERIC_TRANSFORMER = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity({ name: 'pedidos' })
export class OrderOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_cliente', type: 'uuid' })
  idCliente!: string;

  @ManyToOne(() => CustomerOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_cliente' })
  cliente?: CustomerOrmEntity;

  @CreateDateColumn({ name: 'fecha_pedido', type: 'timestamptz' })
  fechaPedido!: Date;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: NUMERIC_TRANSFORMER,
  })
  total!: number;

  @Column({ type: 'varchar', length: 30, default: 'recibido' })
  estado!: EstadoPedido;

  @Column({ name: 'metodo_envio', type: 'varchar', length: 50, nullable: true })
  metodoEnvio!: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @Column({ name: 'consentimiento_aceptado', type: 'boolean', default: false })
  consentimientoAceptado!: boolean;

  @Column({ name: 'consentimiento_fecha', type: 'timestamptz', nullable: true })
  consentimientoFecha!: Date | null;

  @OneToMany(() => OrderItemOrmEntity, (item) => item.pedido)
  items?: OrderItemOrmEntity[];
}
