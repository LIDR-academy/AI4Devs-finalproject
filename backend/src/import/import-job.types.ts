import type { GoodreadsImportResult } from './import.types';
import type { ImportJobPhase, ImportJobStatus } from './entities/import-job.entity';

export interface ImportJobAcceptedResponse {
  job_id: string;
  status: ImportJobStatus;
  phase: ImportJobPhase;
}

export interface ImportJobStatusResponse {
  job_id: string;
  status: ImportJobStatus;
  phase: ImportJobPhase;
  processed_count: number;
  total_count: number;
  result: GoodreadsImportResult | null;
  error_message: string | null;
}

export interface GoodreadsImportProgressUpdate {
  phase: ImportJobPhase;
  processed_count: number;
  total_count: number;
}
