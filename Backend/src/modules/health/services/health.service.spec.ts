import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService();
  });

  describe('getHealthStatus', () => {
    it('should return status ok with timestamp, uptime and environment', () => {
      const result = service.getHealthStatus();

      expect(result.status).toBe('ok');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.environment).toBe('string');
    });
  });
});
