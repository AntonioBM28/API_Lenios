import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HorarioDia } from '../domain/horario-dia';

@Entity({ name: 'configuracion_horario' })
export class BusinessHoursConfigOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'jsonb' })
  horarios!: HorarioDia[];

  @Column({ name: 'cierre_manual', type: 'boolean', default: false })
  cierreManual!: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
