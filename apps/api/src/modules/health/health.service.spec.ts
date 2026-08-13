import { PrismaService } from '../../prisma/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  let prisma: {
    $queryRaw: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn(),
    };
    healthService = new HealthService(prisma as unknown as PrismaService);
  });

  describe('getLiveStatus', () => {
    it('returns ok without querying the database', () => {
      const result = healthService.getLiveStatus();

      expect(result).toEqual({ status: 'ok' });
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('getReadyStatus', () => {
    it('returns ok when the database responds', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await healthService.getReadyStatus();

      expect(result).toEqual({
        status: 'ok',
        checks: { database: 'up' },
      });
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('returns error when the database query rejects', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

      const result = await healthService.getReadyStatus();

      expect(result).toEqual({
        status: 'error',
        checks: { database: 'down' },
      });
      expect(result).not.toHaveProperty('message');
      expect(JSON.stringify(result)).not.toContain('connection refused');
    });

    it('returns error when the database check times out', async () => {
      jest.useFakeTimers();
      prisma.$queryRaw.mockImplementation(
        () =>
          new Promise(() => {
            /* never resolves */
          }),
      );

      const readyPromise = healthService.getReadyStatus();
      await jest.advanceTimersByTimeAsync(2500);
      const result = await readyPromise;

      expect(result).toEqual({
        status: 'error',
        checks: { database: 'down' },
      });

      jest.useRealTimers();
    });
  });
});
