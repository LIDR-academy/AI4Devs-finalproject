import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Slot } from './slot.entity';

@Entity('DOCTOR_SCHEDULES')
@Index('IDX_DOCTOR_SCHEDULES_DOCTOR_DAY', ['doctorId', 'dayOfWeek'])
@Index('IDX_DOCTOR_SCHEDULES_IS_ACTIVE', ['isActive'])
@Index('IDX_DOCTOR_SCHEDULES_DELETED_AT', ['deletedAt'])
export class DoctorSchedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'doctor_id', length: 36 })
  doctorId!: string;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'id' })
  doctor!: Doctor;

  @Column({ name: 'dayOfWeek', type: 'tinyint' })
  dayOfWeek!: number;

  @Column({ name: 'startTime', type: 'time' })
  startTime!: string;

  @Column({ name: 'endTime', type: 'time' })
  endTime!: string;

  @Column({ name: 'slotDurationMinutes', type: 'int', default: 30 })
  slotDurationMinutes!: number;

  @Column({ name: 'breakDurationMinutes', type: 'int', default: 0 })
  breakDurationMinutes!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => Slot, (slot) => slot.schedule)
  slots?: Slot[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
