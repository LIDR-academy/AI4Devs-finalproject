import { Injectable, Logger } from '@nestjs/common';
import { parseGoodreadsCsv } from './goodreads/goodreads-csv.parser';
import { GoodreadsImportProcessor } from './goodreads/goodreads-import.processor';
import { ImportJobService } from './import-job.service';
import type { GoodreadsImportResult } from './import.types';

@Injectable()
export class ImportJobRunner {
  private readonly logger = new Logger(ImportJobRunner.name);
  private readonly runningJobIds = new Set<string>();

  constructor(
    private readonly importJobService: ImportJobService,
    private readonly goodreadsImportProcessor: GoodreadsImportProcessor,
  ) {}

  enqueue(jobId: string, userId: string): void {
    if (process.env.IMPORT_JOBS_SYNC === 'true') {
      void this.runJob(jobId, userId);
      return;
    }

    setImmediate(() => {
      void this.runJob(jobId, userId);
    });
  }

  async runJob(jobId: string, userId: string): Promise<void> {
    if (this.runningJobIds.has(jobId)) {
      return;
    }

    this.runningJobIds.add(jobId);

    try {
      await this.executeJob(jobId, userId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Import job ${jobId} failed: ${message}`);
      await this.importJobService.markFailed(jobId, message);
    } finally {
      this.runningJobIds.delete(jobId);
    }
  }

  private async executeJob(jobId: string, userId: string): Promise<void> {
    const status = await this.importJobService.getJobForUser(userId, jobId);
    if (status.status !== 'queued') {
      return;
    }

    await this.importJobService.updateProgress(jobId, {
      status: 'parsing',
      phase: 'parsing',
    });

    const csvContent = await this.importJobService.getCsvContent(userId, jobId);
    const genreResolutions = await this.importJobService.getGenreResolutions(
      userId,
      jobId,
    );
    const parsed = parseGoodreadsCsv(csvContent);
    const totalCount = parsed.mapped_rows.length;

    await this.importJobService.updateProgress(jobId, {
      status: 'importing',
      phase: 'importing',
      processedCount: 0,
      totalCount,
    });

    const importSummary = await this.goodreadsImportProcessor.processImport(
      userId,
      parsed.mapped_rows,
      parsed.mapping_warnings,
      {
        onProgress: async (progress) => {
          await this.importJobService.updateProgress(jobId, {
            status: progress.phase === 'enriching' ? 'enriching' : 'importing',
            phase: progress.phase,
            processedCount: progress.processed_count,
            totalCount: progress.total_count,
          });
        },
        genreResolutions,
      },
    );

    const result: GoodreadsImportResult = {
      ...parsed,
      imported: importSummary.imported,
      skipped_rows: importSummary.skipped_rows,
      enrichment_failed: importSummary.enrichment_failed,
      meta: {
        ...parsed.meta,
        ...importSummary.meta,
      },
    };

    await this.importJobService.markCompleted(jobId, result);
  }
}
