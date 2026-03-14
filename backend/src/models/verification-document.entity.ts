import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Doctor } from './doctor.entity';

export type VerificationDocumentType = 'cedula' | 'diploma' | 'other';
export type VerificationDocumentStatus = 'pending' | 'approved' | 'rejected';

@Entity('VERIFICATION_DOCUMENTS')
@Index('IDX_VERIF_DOCS_DOCTOR_ID', ['doctorId'])
@Index('IDX_VERIF_DOCS_STATUS', ['status'])
@Index('IDX_VERIF_DOCS_CREATED_AT', ['createdAt'])
@Index('IDX_VERIF_DOCS_DOCTOR_STATUS', ['doctorId', 'status'])
export class VerificationDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'doctor_id', length: 36 })
  doctorId!: string;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'id' })
  doctor!: Doctor;

  @Column({ name: 'file_path', length: 500 })
  filePath!: string;

  @Column({ name: 'original_filename', length: 255 })
  originalFilename!: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType!: string;

  @Column({ name: 'file_size_bytes', type: 'bigint' })
  fileSizeBytes!: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: ['cedula', 'diploma', 'other'],
    default: 'cedula',
  })
  documentType!: VerificationDocumentType;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status!: VerificationDocumentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
