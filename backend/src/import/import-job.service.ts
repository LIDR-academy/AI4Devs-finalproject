import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportJob, ImportJobPhase, ImportJobStatus } from './entities/import-job.entity';
import type {
  ImportJobAcceptedResponse,
  ImportJobStatusResponse,
} from './import-job.types';
import type { GoodreadsImportResult } from './import.types';
import type { GenreResolutionMap } from '../genres/genre-resolution.types';

@Injectable()
export class ImportJobService {
  constructor(
    @InjectRepository(ImportJob)
    private readonly jobsRepo: Repository<ImportJob>,
  ) {}

  async createQueuedJob(
    userId: string,
    csvContent: string,
    genreResolutions?: GenreResolutionMap,
  ): Promise<ImportJobAcceptedResponse> {
    const job = await this.jobsRepo.save(
      this.jobsRepo.create({
        userId,
        csvContent,
        genreResolutions: genreResolutions ?? null,
        status: 'queued',
        phase: 'queued',
        processedCount: 0,
        totalCount: 0,
        result: null,
        errorMessage: null,
      }),
    );

    return {
      job_id: job.id,
      status: job.status,
      phase: job.phase,
    };
  }

  async getJobForUser(
    userId: string,
    jobId: string,
  ): Promise<ImportJobStatusResponse> {
    const job = await this.jobsRepo.findOne({ where: { id: jobId, userId } });
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    return this.toStatusResponse(job);
  }

  async updateProgress(
    jobId: string,
    update: {
      status?: ImportJobStatus;
      phase?: ImportJobPhase;
      processedCount?: number;
      totalCount?: number;
    },
  ): Promise<void> {
    await this.jobsRepo.update(jobId, {
      ...(update.status !== undefined ? { status: update.status } : {}),
      ...(update.phase !== undefined ? { phase: update.phase } : {}),
      ...(update.processedCount !== undefined
        ? { processedCount: update.processedCount }
        : {}),
      ...(update.totalCount !== undefined
        ? { totalCount: update.totalCount }
        : {}),
    });
  }

  async markCompleted(
    jobId: string,
    result: GoodreadsImportResult,
  ): Promise<void> {
    await this.jobsRepo.update(jobId, {
      status: 'completed',
      phase: 'completed',
      result,
      errorMessage: null,
      processedCount: result.meta.mapped_rows,
      totalCount: result.meta.mapped_rows,
    });
  }

  async markFailed(jobId: string, errorMessage: string): Promise<void> {
    await this.jobsRepo.update(jobId, {
      status: 'failed',
      phase: 'failed',
      errorMessage,
    });
  }

  async getGenreResolutions(
    userId: string,
    jobId: string,
  ): Promise<GenreResolutionMap> {
    const job = await this.jobsRepo.findOne({
      where: { id: jobId, userId },
    });
    if (!job) {
      throw new NotFoundException('Import job not found');
    }
    return (job.genreResolutions as GenreResolutionMap | null) ?? {};
  }

  async getCsvContent(userId: string, jobId: string): Promise<string> {
    const job = await this.jobsRepo.findOne({
      where: { id: jobId, userId },
    });
    if (!job) {
      throw new NotFoundException('Import job not found');
    }
    return job.csvContent;
  }

  private toStatusResponse(job: ImportJob): ImportJobStatusResponse {
    return {
      job_id: job.id,
      status: job.status,
      phase: job.phase,
      processed_count: job.processedCount,
      total_count: job.totalCount,
      result: job.result,
      error_message: job.errorMessage,
    };
  }
}
