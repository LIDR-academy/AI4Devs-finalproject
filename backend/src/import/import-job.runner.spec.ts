import { readFileSync } from 'fs';
import { join } from 'path';
import { ImportJobRunner } from './import-job.runner';
import { ImportJobService } from './import-job.service';
import { GoodreadsImportProcessor } from './goodreads/goodreads-import.processor';

describe('ImportJobRunner', () => {
  let importJobService: jest.Mocked<
    Pick<
      ImportJobService,
      | 'getJobForUser'
      | 'getCsvContent'
      | 'getGenreResolutions'
      | 'updateProgress'
      | 'markCompleted'
      | 'markFailed'
    >
  >;
  let processor: jest.Mocked<Pick<GoodreadsImportProcessor, 'processImport'>>;
  let runner: ImportJobRunner;

  beforeEach(() => {
    importJobService = {
      getJobForUser: jest.fn(),
      getCsvContent: jest.fn(),
      getGenreResolutions: jest.fn().mockResolvedValue({}),
      updateProgress: jest.fn(),
      markCompleted: jest.fn(),
      markFailed: jest.fn(),
    };
    processor = { processImport: jest.fn() };
    runner = new ImportJobRunner(
      importJobService as unknown as ImportJobService,
      processor as unknown as GoodreadsImportProcessor,
    );
  });

  it('runs parse import and enrichment phases', async () => {
    importJobService.getJobForUser.mockResolvedValue({
      job_id: 'job-1',
      status: 'queued',
      phase: 'queued',
      processed_count: 0,
      total_count: 0,
      result: null,
      error_message: null,
    });
    importJobService.getCsvContent.mockResolvedValue(
      readFileSync(
        join(__dirname, '../../test/fixtures/goodreads_library_export.min.csv'),
        'utf8',
      ),
    );
    processor.processImport.mockResolvedValue({
      imported: [{ row_number: 2, book_id: 'book-1' }],
      skipped_rows: [],
      enrichment_failed: [],
      meta: {
        imported_count: 1,
        skipped_duplicate_count: 0,
        skipped_invalid_count: 0,
        enrichment_failed_count: 0,
      },
    });

    await runner.runJob('job-1', 'user-1');

    expect(importJobService.updateProgress).toHaveBeenCalledWith(
      'job-1',
      expect.objectContaining({ phase: 'parsing' }),
    );
    expect(processor.processImport).toHaveBeenCalled();
    expect(importJobService.markCompleted).toHaveBeenCalledWith(
      'job-1',
      expect.objectContaining({
        meta: expect.objectContaining({ imported_count: 1 }),
      }),
    );
  });
});
