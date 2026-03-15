import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Surgery } from '../../planning/entities/surgery.entity';

@Entity('postop_evolutions')
export class PostopEvolution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'surgery_id' })
  surgeryId: string;

  @ManyToOne(() => Surgery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surgery_id' })
  surgery: Surgery;

  @Column({ type: 'date', name: 'evolution_date' })
  evolutionDate: Date;

  @Column({ type: 'text', nullable: true, name: 'clinical_notes' })
  clinicalNotes: string;

  @Column({ type: 'jsonb', nullable: true, name: 'vital_signs' })
  vitalSigns: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    oxygenSaturation?: number;
    recordedAt?: string;
  };

  @Column({ type: 'boolean', default: false, name: 'has_complications' })
  hasComplications: boolean;

  @Column({ type: 'text', nullable: true, name: 'complications_notes' })
  complicationsNotes: string;

  @Column({ type: 'jsonb', nullable: true, name: 'medications' })
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    route?: string;
  }[];

  @Column({ type: 'uuid', nullable: true, name: 'recorded_by' })
  recordedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
