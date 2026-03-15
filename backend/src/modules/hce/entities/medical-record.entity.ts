import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { LabResult } from './lab-result.entity';
import { Image } from './image.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.medicalRecords)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'text', nullable: true, name: 'medical_history' })
  medicalHistory: string;

  @Column({ type: 'text', nullable: true, name: 'family_history' })
  familyHistory: string;

  @Column({ type: 'text', nullable: true, name: 'current_condition' })
  currentCondition: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => LabResult, (labResult) => labResult.medicalRecord)
  labResults: LabResult[];

  @OneToMany(() => Image, (image) => image.medicalRecord)
  images: Image[];
}
