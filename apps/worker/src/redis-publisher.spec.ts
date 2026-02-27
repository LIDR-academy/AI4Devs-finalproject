const mockPublish = jest.fn().mockResolvedValue(1);

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    publish: mockPublish,
    on: jest.fn(),
  })),
}));

import { publishConversationUpdate, publishConversationComplete } from './redis-publisher';

describe('redis-publisher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('publishConversationUpdate()', () => {
    it('publica en el canal correcto con el payload JSON esperado', async () => {
      const conversationId = 'conv-123';
      const role = 'assistant';
      const content = 'Hola, ¿cuál es tu dirección?';

      await publishConversationUpdate(conversationId, role, content);

      expect(mockPublish).toHaveBeenCalledTimes(1);
      const [channel, payload] = mockPublish.mock.calls[0];
      expect(channel).toBe(`conversation:${conversationId}:update`);

      const parsed = JSON.parse(payload);
      expect(parsed.role).toBe(role);
      expect(parsed.content).toBe(content);
      expect(typeof parsed.timestamp).toBe('string');
      expect(() => new Date(parsed.timestamp)).not.toThrow();
    });

    it('el timestamp está en formato ISO 8601', async () => {
      await publishConversationUpdate('conv-abc', 'assistant', 'Mensaje');
      const payload = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('publishConversationComplete()', () => {
    it('publica el evento conversation:complete con status COMPLETED', async () => {
      await publishConversationComplete('conv-123', 'COMPLETED');

      expect(mockPublish).toHaveBeenCalledTimes(1);
      const [channel, payload] = mockPublish.mock.calls[0];
      expect(channel).toBe('conversation:conv-123:update');

      const parsed = JSON.parse(payload);
      expect(parsed.event).toBe('conversation:complete');
      expect(parsed.status).toBe('COMPLETED');
    });

    it('publica el evento conversation:complete con status ESCALATED', async () => {
      await publishConversationComplete('conv-456', 'ESCALATED');

      const [channel, payload] = mockPublish.mock.calls[0];
      expect(channel).toBe('conversation:conv-456:update');
      const parsed = JSON.parse(payload);
      expect(parsed.event).toBe('conversation:complete');
      expect(parsed.status).toBe('ESCALATED');
    });

    it('publica el evento conversation:complete con status TIMEOUT', async () => {
      await publishConversationComplete('conv-789', 'TIMEOUT');

      const parsed = JSON.parse(mockPublish.mock.calls[0][1]);
      expect(parsed.status).toBe('TIMEOUT');
    });
  });
});
