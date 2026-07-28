import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { GoodreadsImportResult } from '../import.types';

export type ImportJobStatus =
  | 'queued'
  | 'parsing'
  | 'importing'
  | 'enriching'
  | 'completed'
  | 'failed';

export type ImportJobPhase = ImportJobStatus;

@Entity('import_jobs')
export class ImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20, default: 'queued' })
  status: ImportJobStatus;

  @Column({ type: 'varchar', length: 20, default: 'queued' })
  phase: ImportJobPhase;

  @Column({ name: 'processed_count', type: 'integer', default: 0 })
  processedCount: number;

  @Column({ name: 'total_count', type: 'integer', default: 0 })
  totalCount: number;

  @Column({ name: 'csv_content', type: 'text' })
  csvContent: string;

  @Column({ name: 'genre_resolutions', type: 'json', nullable: true })
  genreResolutions: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  result: GoodreadsImportResult | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
