import { NotificationService } from './NotificationService';

// Simple test that just verifies the service can be instantiated
describe('NotificationService', () => {
  it('should create instance with vapid key', () => {
    const service = new NotificationService('test-key');
    expect(service).toBeDefined();
  });

  it('should have isSupported method', () => {
    const service = new NotificationService('test-key');
    expect(typeof service.isSupported).toBe('function');
  });

  it('should have subscribe method', () => {
    const service = new NotificationService('test-key');
    expect(typeof service.subscribe).toBe('function');
  });

  it('should have unsubscribe method', () => {
    const service = new NotificationService('test-key');
    expect(typeof service.unsubscribe).toBe('function');
  });

  it('should have getSubscriptionStatus method', () => {
    const service = new NotificationService('test-key');
    expect(typeof service.getSubscriptionStatus).toBe('function');
  });
});
