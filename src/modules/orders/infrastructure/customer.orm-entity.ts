import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'clientes' })
export class CustomerOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 15 })
  telefono!: string;

  @Column({ type: 'varchar', length: 255 })
  ubicacion!: string;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamptz' })
  fechaRegistro!: Date;

  // Lógica ARCO: mientras está bloqueado, el cliente no puede generar
  // nuevos pedidos (ver CreateOrderUseCase) — es el paso intermedio antes
  // de anonimizar sus datos a solicitud suya.
  @Column({ type: 'boolean', default: false })
  bloqueado!: boolean;
}
