import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Specialty } from './specialty.entity';
import { DoctorSchedule } from './doctor-schedule.entity';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

@Entity('DOCTORS')
@Index('IDX_DOCTORS_VERIFICATION_STATUS', ['verificationStatus'])
@Index('IDX_DOCTORS_POSTAL_CODE', ['postalCode'])
@Index('IDX_DOCTORS_LOCATION', ['latitude', 'longitude'])
@Index('IDX_DOCTORS_USER_ID', ['userId'], { unique: true })
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', length: 36, unique: true })
  userId!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user!: User;

  @Column({ length: 500 })
  address!: string;

  @Column({ name: 'postalCode', length: 20 })
  postalCode!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number | null | undefined) => value,
      from: (value: string | null | undefined) => value ? parseFloat(value) : null,
    },
  })
  latitude?: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number | null | undefined) => value,
      from: (value: string | null | undefined) => value ? parseFloat(value) : null,
    },
  })
  longitude?: number;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  verificationStatus!: VerificationStatus;

  @Column({
    name: 'rating_average',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    default: 0.0,
    transformer: {
      to: (value: number | null | undefined) => value,
      from: (value: string | null | undefined) => value ? parseFloat(value) : null,
    },
  })
  ratingAverage?: number;

  @Column({
    name: 'total_reviews',
    type: 'int',
    default: 0,
  })
  totalReviews!: number;

  @Column({ name: 'verified_by', length: 36, nullable: true })
  verifiedBy?: string | null;

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verified_by', referencedColumnName: 'id' })
  verifier?: User | null;

  @Column({ name: 'verified_at', type: 'datetime', nullable: true })
  verifiedAt?: Date | null;

  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes?: string | null;

  @ManyToMany(() => Specialty, (specialty) => specialty.doctors)
  @JoinTable({
    name: 'DOCTOR_SPECIALTIES',
    joinColumn: {
      name: 'doctor_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'specialty_id',
      referencedColumnName: 'id',
    },
  })
  specialties!: Specialty[];

  @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor)
  schedules?: DoctorSchedule[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
