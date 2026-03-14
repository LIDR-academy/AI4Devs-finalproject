import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('APPOINTMENT_HISTORY')
@Index('IDX_APPOINTMENT_HISTORY_APPOINTMENT', ['appointmentId'])
export class AppointmentHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'appointment_id', length: 36 })
  appointmentId!: string;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id', referencedColumnName: 'id' })
  appointment!: Appointment;

  @Column({ name: 'old_status', length: 50, nullable: true })
  oldStatus?: string;

  @Column({ name: 'new_status', length: 50 })
  newStatus!: string;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason?: string;

  @Column({ name: 'changed_by', length: 36, nullable: true })
  changedBy?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt!: Date;
}
