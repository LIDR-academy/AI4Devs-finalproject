import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';

@Entity('lab_results')
export class LabResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'medical_record_id' })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (medicalRecord) => medicalRecord.labResults)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @Column({ type: 'varchar', length: 100, name: 'test_name' })
  testName: string;

  @Column({ type: 'jsonb' })
  results: Record<string, any>;

  @Column({ type: 'date', name: 'test_date' })
  testDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
