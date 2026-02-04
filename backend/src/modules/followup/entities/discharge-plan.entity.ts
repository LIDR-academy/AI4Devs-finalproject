import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Surgery } from '../../planning/entities/surgery.entity';

@Entity('discharge_plans')
export class DischargePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'surgery_id', unique: true })
  surgeryId: string;

  @OneToOne(() => Surgery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surgery_id' })
  surgery: Surgery;

  @Column({ type: 'text', nullable: true, name: 'surgery_summary' })
  surgerySummary: string;

  @Column({ type: 'text', nullable: true, name: 'instructions' })
  instructions: string;

  @Column({ type: 'jsonb', nullable: true, name: 'custom_instructions' })
  customInstructions: {
    title: string;
    content: string;
  }[];

  @Column({ type: 'jsonb', nullable: true, name: 'medications_at_discharge' })
  medicationsAtDischarge: {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    indications?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true, name: 'follow_up_appointments' })
  followUpAppointments: {
    date: string;
    type: string;
    notes?: string;
  }[];

  @Column({ type: 'varchar', length: 50, default: 'draft', name: 'status' })
  status: 'draft' | 'finalized';

  @Column({ type: 'uuid', nullable: true, name: 'generated_by' })
  generatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
