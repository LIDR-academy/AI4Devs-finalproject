import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
@Index('IDX_AUDIT_LOGS_USER_ID', ['userId'])
@Index('IDX_AUDIT_LOGS_ENTITY', ['entityType', 'entityId'])
@Index('IDX_AUDIT_LOGS_TIMESTAMP', ['timestamp'])
@Index('IDX_AUDIT_LOGS_ACTION_TIMESTAMP', ['action', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  action!: string;

  @Column({ length: 50 })
  entityType!: string;

  @Column({ length: 36 })
  entityId!: string;

  @Column({ length: 36, nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ length: 45 })
  ipAddress!: string;

  @Column({ name: 'old_values', type: 'text', nullable: true })
  oldValues?: string;

  @Column({ name: 'new_values', type: 'text', nullable: true })
  newValues?: string;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp!: Date;
}
