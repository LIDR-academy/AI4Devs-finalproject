import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Checklist } from './checklist.entity';

/**
 * Snapshot de una versión del checklist (historial).
 * Se crea al actualizar una fase o al completar el checklist.
 */
@Entity('checklist_versions')
export class ChecklistVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'checklist_id' })
  checklistId: string;

  @ManyToOne(() => Checklist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklist_id' })
  checklist: Checklist;

  @Column({ type: 'int', name: 'version_number' })
  versionNumber: number;

  /** Fase que motivó esta versión (preInduction, preIncision, postProcedure) o 'completed' */
  @Column({ type: 'varchar', length: 20, name: 'phase_updated', nullable: true })
  phaseUpdated: string | null;

  @Column({ type: 'jsonb', name: 'checklist_data_snapshot' })
  checklistDataSnapshot: Checklist['checklistData'];

  @Column({ type: 'boolean', name: 'pre_induction_complete', default: false })
  preInductionComplete: boolean;

  @Column({ type: 'boolean', name: 'pre_incision_complete', default: false })
  preIncisionComplete: boolean;

  @Column({ type: 'boolean', name: 'post_procedure_complete', default: false })
  postProcedureComplete: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at_snapshot' })
  completedAtSnapshot: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
