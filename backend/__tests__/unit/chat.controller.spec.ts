// Mock the OpenAI service first, before any imports
jest.mock('../../src/utils/openai', () => ({
  aiService: {
    generateChatCompletion: jest.fn().mockImplementation((messages, model, options) => {
      const userMessage = messages.find((msg: any) => msg.role === 'user')?.content?.toLowerCase() || '';
      
      // MVP: Simple AI responses without complex function calling
      if (userMessage.includes('product') || userMessage.includes('cheese')) {
        return Promise.resolve({
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'Here are our Italian products! We have cheeses, cured meats and much more. 🇮🇹'
              }
            }
          ]
        });
      } else if (userMessage.includes('service') || userMessage.includes('tasting')) {
        return Promise.resolve({
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'We offer wine tastings and Italian cooking classes!'
              }
            }
          ]
        });
      } else {
        return Promise.resolve({
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'Hello! I\'m Sofia, your assistant for Italian products. How can I help you?'
              }
            }
          ]
        });
      }
    })
  }
}));

import { Request, Response } from 'express';
import chatController from '../../src/controllers/chat.controller';

// Mock the AgentConfigService for MVP
jest.mock('../../src/application/services/AgentConfigService', () => {
  return {
    AgentConfigService: jest.fn().mockImplementation(() => {
      return {
        getLatestConfig: jest.fn().mockResolvedValue({
          temperature: 0.7,
          maxTokens: 500,
          topP: 0.9,
          model: 'gpt-4-turbo',
          prompt: 'You are Sofia, an Italian food shop assistant. Respond in Italian.',
        }),
      };
    }),
  };
});

describe('ChatController - MVP Scope', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.MockedFunction<any>;
  let statusMock: jest.MockedFunction<any>;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    res = {
      json: jsonMock,
      status: statusMock,
    };
    
    // Set NODE_ENV to test explicitly for all tests
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/chat - MVP Basic Functionality', () => {
    it('should handle basic chat message and return AI response', async () => {
      req = {
        body: {
          messages: [
            {
              role: 'user',
              content: 'Hello, what products do you have?'
            }
          ]
        }
      };

      await chatController.processChat(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalled();
      const response = jsonMock.mock.calls[0][0];
      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toContain('Italian products');
    });

    it('should handle product-related questions', async () => {
      req = {
        body: {
          messages: [
            {
              role: 'user',
              content: 'Do you have cheese?'
            }
          ]
        }
      };

      await chatController.processChat(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalled();
      const response = jsonMock.mock.calls[0][0];
      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toMatch(/Italian products|formaggi/i);
    });

    it('should handle service-related questions', async () => {
      req = {
        body: {
          messages: [
            {
              role: 'user',
              content: 'What services do you offer?'
            }
          ]
        }
      };

      await chatController.processChat(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalled();
      const response = jsonMock.mock.calls[0][0];
      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toMatch(/wine tastings|cooking classes|degustazioni|corsi/i);
    });

    it('should handle general greetings', async () => {
      req = {
        body: {
          messages: [
            {
              role: 'user',
              content: 'Hello!'
            }
          ]
        }
      };

      await chatController.processChat(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalled();
      const response = jsonMock.mock.calls[0][0];
      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toContain('Sofia');
    });

    it('should validate required messages field', async () => {
      req = {
        body: {}
      };

      await chatController.processChat(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalled();
      const response = jsonMock.mock.calls[0][0];
      expect(response.error).toContain('Validation error');
    });

    it('should handle empty messages array', async () => {
      req = {
        body: {
          messages: []
        }
      };

      await chatController.processChat(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalled();
      const response = jsonMock.mock.calls[0][0];
      expect(response.error).toContain('No user message found');
    });

    it('should handle AI service errors gracefully', async () => {
      // Mock AI service to throw error
      const { aiService } = require('../../src/utils/openai');
      aiService.generateChatCompletion.mockRejectedValueOnce(new Error('AI service unavailable'));

      req = {
        body: {
          messages: [
            {
              role: 'user',
              content: 'Test message'
            }
          ]
        }
      };

      await chatController.processChat(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalled();
      const response = jsonMock.mock.calls[0][0];
      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message.role).toBe('assistant');
    });
  });

  // Note: Agent configuration integration is tested through functional tests
  // The important aspect is that the chat works, not the internal mock verification
}); 