import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { DoctorSchedule } from './doctor-schedule.entity';

@Entity('SLOTS')
@Index('IDX_SLOTS_DOCTOR_START', ['doctorId', 'startTime'])
@Index('IDX_SLOTS_AVAILABILITY', ['isAvailable', 'lockedUntil'])
@Index('IDX_SLOTS_SCHEDULE_ID', ['scheduleId'])
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'doctor_id', length: 36 })
  doctorId!: string;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'id' })
  doctor!: Doctor;

  @Column({ name: 'schedule_id', length: 36, nullable: true })
  scheduleId?: string;

  @ManyToOne(() => DoctorSchedule, (schedule) => schedule.slots, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'schedule_id', referencedColumnName: 'id' })
  schedule?: DoctorSchedule | null;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime!: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime!: Date;

  @Column({ name: 'is_available', default: true })
  isAvailable!: boolean;

  @Column({ name: 'locked_by', length: 36, nullable: true })
  lockedBy?: string;

  @Column({ name: 'locked_until', type: 'datetime', nullable: true })
  lockedUntil?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
