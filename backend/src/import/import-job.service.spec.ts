import { ImportJobService } from './import-job.service';
import { ImportJob } from './entities/import-job.entity';
import { Repository } from 'typeorm';

describe('ImportJobService', () => {
  let jobsRepo: jest.Mocked<
    Pick<
      Repository<ImportJob>,
      'save' | 'findOne' | 'update' | 'create'
    >
  >;
  let service: ImportJobService;

  beforeEach(() => {
    jobsRepo = {
      create: jest.fn((value) => value as ImportJob),
      save: jest.fn(async (value) => ({
        ...(value as ImportJob),
        id: 'job-1',
      })),
      findOne: jest.fn(),
      update: jest.fn(async () => undefined),
    };
    service = new ImportJobService(jobsRepo as unknown as Repository<ImportJob>);
  });

  it('creates a queued job', async () => {
    const accepted = await service.createQueuedJob('user-1', 'title,author');

    expect(accepted).toEqual({
      job_id: 'job-1',
      status: 'queued',
      phase: 'queued',
    });
  });

  it('returns job status for owner', async () => {
    jobsRepo.findOne.mockResolvedValue({
      id: 'job-1',
      userId: 'user-1',
      status: 'enriching',
      phase: 'enriching',
      processedCount: 2,
      totalCount: 5,
      result: null,
      errorMessage: null,
    } as ImportJob);

    const status = await service.getJobForUser('user-1', 'job-1');

    expect(status.processed_count).toBe(2);
    expect(status.total_count).toBe(5);
    expect(status.phase).toBe('enriching');
  });
});
