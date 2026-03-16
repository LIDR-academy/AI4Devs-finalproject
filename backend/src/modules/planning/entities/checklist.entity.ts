import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Surgery } from './surgery.entity';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  checkedBy?: string; // userId
  checkedAt?: Date;
  notes?: string;
}

export interface ChecklistPhase {
  name: string;
  items: ChecklistItem[];
  completed: boolean;
  completedBy?: string; // userId
  completedAt?: Date;
}

@Entity('checklists')
export class Checklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'surgery_id', unique: true })
  surgeryId: string;

  @OneToOne(() => Surgery, (surgery) => surgery.checklist)
  @JoinColumn({ name: 'surgery_id' })
  surgery: Surgery;

  @Column({ type: 'boolean', default: false, name: 'pre_induction_complete' })
  preInductionComplete: boolean;

  @Column({ type: 'boolean', default: false, name: 'pre_incision_complete' })
  preIncisionComplete: boolean;

  @Column({ type: 'boolean', default: false, name: 'post_procedure_complete' })
  postProcedureComplete: boolean;

  @Column({ type: 'jsonb', name: 'checklist_data' })
  checklistData: {
    preInduction?: ChecklistPhase;
    preIncision?: ChecklistPhase;
    postProcedure?: ChecklistPhase;
  };

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
