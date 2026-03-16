import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'medical_record_id' })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (medicalRecord) => medicalRecord.images)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @Column({ type: 'varchar', length: 500, name: 'file_path' })
  filePath: string;

  @Column({ type: 'varchar', length: 50, name: 'image_type' })
  imageType: string; // 'xray', 'ct', 'mri', 'ultrasound', etc.

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
