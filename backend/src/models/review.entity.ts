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
import { Appointment } from './appointment.entity';
import { Doctor } from './doctor.entity';
import { User } from './user.entity';

export type ReviewModerationStatus = 'pending' | 'approved' | 'rejected';

@Entity('REVIEWS')
@Index('UQ_REVIEWS_APPOINTMENT_ID', ['appointmentId'], { unique: true })
@Index('IDX_REVIEWS_DOCTOR_ID', ['doctorId'])
@Index('IDX_REVIEWS_MODERATION_STATUS', ['moderationStatus'])
@Index('IDX_REVIEWS_CREATED_AT', ['createdAt'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'appointment_id', length: 36, unique: true })
  appointmentId!: string;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id', referencedColumnName: 'id' })
  appointment!: Appointment;

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

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text' })
  comment!: string;

  @Column({
    name: 'moderation_status',
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  moderationStatus!: ReviewModerationStatus;

  @Column({ name: 'moderated_by', length: 36, nullable: true })
  moderatedBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'moderated_by', referencedColumnName: 'id' })
  moderator?: User;

  @Column({ name: 'moderated_at', type: 'datetime', nullable: true })
  moderatedAt?: Date;

  @Column({ name: 'moderation_notes', type: 'text', nullable: true })
  moderationNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
