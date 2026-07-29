import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TbrEntry } from './tbr-entry.entity';

@Entity('monthly_tbr_lists')
@Unique(['userId', 'year', 'month'])
export class MonthlyTbrList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'smallint' })
  year: number;

  @Column({ type: 'smallint' })
  month: number;

  @Column({ name: 'list_status', type: 'varchar', length: 20, default: 'active' })
  listStatus: string;

  @Column({ name: 'auto_created', type: 'boolean', default: false })
  autoCreated: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TbrEntry, (entry) => entry.monthlyTbr)
  entries: TbrEntry[];
}
