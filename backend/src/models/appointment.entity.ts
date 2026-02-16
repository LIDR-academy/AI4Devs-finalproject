import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Doctor } from './doctor.entity';
import { Slot } from './slot.entity';

export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'no_show';

@Entity('APPOINTMENTS')
@Index('IDX_APPOINTMENTS_PATIENT_STATUS', ['patientId', 'status'])
@Index('IDX_APPOINTMENTS_DOCTOR_DATE', ['doctorId', 'appointmentDate'])
@Unique('UQ_APPOINTMENTS_SLOT_ID', ['slotId'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', length: 36 })
  patientId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  patient!: User;

  @Column({ name: 'doctor_id', length: 36 })
  doctorId!: string;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'id' })
  doctor!: Doctor;

  @Column({ name: 'slot_id', length: 36 })
  slotId!: string;

  @ManyToOne(() => Slot, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'slot_id', referencedColumnName: 'id' })
  slot!: Slot;

  @Column({ name: 'appointment_date', type: 'datetime' })
  appointmentDate!: Date;

  @Column({
    type: 'enum',
    enum: ['confirmed', 'pending', 'completed', 'cancelled', 'no_show'],
    default: 'confirmed',
  })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'reminder_sent', default: false })
  reminderSent!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
