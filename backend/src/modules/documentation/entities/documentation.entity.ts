import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Surgery } from '../../planning/entities/surgery.entity';

export enum DocumentationStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Entity('documentations')
export class Documentation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'surgery_id' })
  surgeryId: string;

  @ManyToOne(() => Surgery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surgery_id' })
  surgery: Surgery;

  @Column({ type: 'text', nullable: true, name: 'preoperative_notes' })
  preoperativeNotes: string;

  @Column({ type: 'text', nullable: true, name: 'intraoperative_notes' })
  intraoperativeNotes: string;

  @Column({ type: 'text', nullable: true, name: 'postoperative_notes' })
  postoperativeNotes: string;

  @Column({ type: 'jsonb', nullable: true, name: 'procedure_details' })
  procedureDetails: {
    startTime?: string;
    endTime?: string;
    duration?: number; // minutos
    anesthesiaType?: string;
    complications?: string[];
    bloodLoss?: number; // ml
    vitalSigns?: {
      time: string;
      heartRate?: number;
      bloodPressure?: string;
      temperature?: number;
      oxygenSaturation?: number;
    }[];
    medications?: {
      name: string;
      dosage: string;
      time: string;
    }[];
  };

  @Column({
    type: 'enum',
    enum: DocumentationStatus,
    default: DocumentationStatus.DRAFT,
    name: 'status',
  })
  status: DocumentationStatus;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true, name: 'last_modified_by' })
  lastModifiedBy: string;

  @Column({ type: 'jsonb', nullable: true, name: 'change_history' })
  changeHistory: {
    timestamp: string;
    userId: string;
    field: string;
    oldValue?: string;
    newValue?: string;
  }[];

  @Column({ type: 'timestamp', nullable: true, name: 'last_saved_at' })
  lastSavedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
