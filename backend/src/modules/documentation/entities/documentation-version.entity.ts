import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Documentation } from './documentation.entity';

/**
 * Snapshot de una versión de la documentación intraoperatoria.
 * Se crea en cada update o updateField para permitir historial versionado.
 */
@Entity('documentation_versions')
export class DocumentationVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'documentation_id' })
  documentationId: string;

  @ManyToOne(() => Documentation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentation_id' })
  documentation: Documentation;

  @Column({ type: 'int', name: 'version_number' })
  versionNumber: number;

  @Column({ type: 'text', nullable: true, name: 'preoperative_notes' })
  preoperativeNotes: string | null;

  @Column({ type: 'text', nullable: true, name: 'intraoperative_notes' })
  intraoperativeNotes: string | null;

  @Column({ type: 'text', nullable: true, name: 'postoperative_notes' })
  postoperativeNotes: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'procedure_details' })
  procedureDetails: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 20, name: 'status_snapshot', default: 'draft' })
  statusSnapshot: string;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
