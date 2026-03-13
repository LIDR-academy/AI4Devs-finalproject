import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { MockConversationsController } from './mock-conversations.controller';
import { MockConversationsService } from './mock-conversations.service';
import { MockSseService } from './mock-sse.service';

const mockConversationsService = {
  replyToConversation: jest.fn(),
  getConversationHistory: jest.fn(),
};

const mockSseService = {
  subscribe: jest.fn(),
};

describe('MockConversationsController', () => {
  let controller: MockConversationsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockConversationsController],
      providers: [
        { provide: MockConversationsService, useValue: mockConversationsService },
        { provide: MockSseService, useValue: mockSseService },
      ],
    }).compile();

    controller = module.get<MockConversationsController>(MockConversationsController);
  });

  describe('events()', () => {
    it('delegates to sseService.subscribe() with the correct conversationId', () => {
      const conversationId = 'conv-test-123';
      const fakeObservable = of({ data: '{"role":"assistant"}' } as MessageEvent);
      mockSseService.subscribe.mockReturnValue(fakeObservable);

      const result = controller.events(conversationId);

      expect(mockSseService.subscribe).toHaveBeenCalledWith(conversationId);
      expect(result).toBe(fakeObservable);
    });

    it('returns the Observable from sseService without modification', () => {
      const conversationId = 'conv-abc';
      const fakeObservable = of({ data: 'payload' } as MessageEvent);
      mockSseService.subscribe.mockReturnValue(fakeObservable);

      const result = controller.events(conversationId);

      expect(result).toBe(fakeObservable);
    });
  });

  describe('reply()', () => {
    it('calls replyToConversation with correct params', async () => {
      const conversationId = 'conv-111';
      mockConversationsService.replyToConversation.mockResolvedValue({ queued: true });

      await controller.reply(conversationId, { message: 'Hola' });

      expect(mockConversationsService.replyToConversation).toHaveBeenCalledWith(conversationId, 'Hola');
    });
  });

  describe('history()', () => {
    it('calls getConversationHistory with correct conversationId', async () => {
      const conversationId = 'conv-222';
      mockConversationsService.getConversationHistory.mockResolvedValue([]);

      await controller.history(conversationId);

      expect(mockConversationsService.getConversationHistory).toHaveBeenCalledWith(conversationId);
    });
  });
});
