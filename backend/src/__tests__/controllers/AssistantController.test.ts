import { AssistantController } from '../../controllers/AssistantController';
import { getOpenAIResponse } from '../../services/OpenAIService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/OpenAIService');

describe('AssistantController', () => {
  let assistantController: AssistantController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    assistantController = new AssistantController();
    mockRequest = {
      body: { threadId: 'test-thread-id', prompt: 'Test prompt' },
    };
    mockResponse = {
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should call getOpenAIResponse and return the response', async () => {
    const mockOpenAIResponse = {
      threadId: 'test-thread-id',
      message: 'Test response',
      title: 'Test Title',
      properties: {},
      itinerary: {},
    };
    (getOpenAIResponse as jest.Mock).mockResolvedValue(mockOpenAIResponse);

    await assistantController.getResponse(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(getOpenAIResponse).toHaveBeenCalledWith('test-thread-id', 'Test prompt');
    expect(mockResponse.json).toHaveBeenCalledWith({ response: mockOpenAIResponse });
  });

  it('should call next with error if getOpenAIResponse throws', async () => {
    const mockError = new Error('Test error');
    (getOpenAIResponse as jest.Mock).mockRejectedValue(mockError);

    await assistantController.getResponse(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(mockError);
  });
});