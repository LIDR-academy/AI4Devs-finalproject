import { ImportJobRunner } from './import-job.runner';
import { ImportJobService } from './import-job.service';
import { GoodreadsImportProcessor } from './goodreads/goodreads-import.processor';

describe('ImportJobRunner', () => {
  let importJobService: jest.Mocked<
    Pick<
      ImportJobService,
      | 'getJobForUser'
      | 'getCsvContent'
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

  it('marks job failed when processing throws', async () => {
    importJobService.getJobForUser.mockResolvedValue({
      job_id: 'job-1',
      status: 'queued',
      phase: 'queued',
      processed_count: 0,
      total_count: 0,
      result: null,
      error_message: null,
    });
    importJobService.getCsvContent.mockRejectedValue(new Error('parse failed'));

    await runner.runJob('job-1', 'user-1');

    expect(importJobService.markFailed).toHaveBeenCalledWith(
      'job-1',
      'parse failed',
    );
  });
});
