import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: {
    getLiveStatus: jest.Mock;
    getReadyStatus: jest.Mock;
  };
  let res: {
    status: jest.Mock;
    json: jest.Mock;
  };

  beforeEach(() => {
    healthService = {
      getLiveStatus: jest.fn(),
      getReadyStatus: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    controller = new HealthController(
      healthService as unknown as HealthService,
    );
  });

  describe('getLive', () => {
    it('returns live ok status', () => {
      healthService.getLiveStatus.mockReturnValue({ status: 'ok' });

      expect(controller.getLive()).toEqual({ status: 'ok' });
      expect(healthService.getLiveStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('getReady', () => {
    it('responds 200 when ready', async () => {
      const body = { status: 'ok', checks: { database: 'up' } };
      healthService.getReadyStatus.mockResolvedValue(body);

      await controller.getReady(res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(body);
    });

    it('responds 503 with probe body when not ready', async () => {
      const body = { status: 'error', checks: { database: 'down' } };
      healthService.getReadyStatus.mockResolvedValue(body);

      await controller.getReady(res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(res.json).toHaveBeenCalledWith(body);
    });
  });
});
