import { getOpenAIResponse } from '../../services/OpenAIService';
import OpenAI from '../../config/openai';

jest.mock('../../config/openai', () => ({
  beta: {
    threads: {
      create: jest.fn(),
      messages: {
        create: jest.fn(),
        list: jest.fn(),
      },
      runs: {
        createAndPoll: jest.fn(),
      },
    },
  },
}));

describe('OpenAIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new thread if threadId is not provided', async () => {
    const mockThreadId = 'new-thread-id';
    (OpenAI.beta.threads.create as jest.Mock).mockResolvedValue({ id: mockThreadId });
    (OpenAI.beta.threads.runs.createAndPoll as jest.Mock).mockResolvedValue({ status: 'completed', thread_id: mockThreadId });
    (OpenAI.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: [{ type: 'text', text: { value: '```json\n{"title":"Test Title","trip_properties":{},"user_response":"Test Response","itinerary":{}}\n```' } }],
        },
      ],
    });

    const result = await getOpenAIResponse('', 'Test prompt');

    expect(OpenAI.beta.threads.create).toHaveBeenCalled();
    expect(result.threadId).toBe(mockThreadId);
  });

  it('should use existing threadId if provided', async () => {
    const existingThreadId = 'existing-thread-id';
    (OpenAI.beta.threads.runs.createAndPoll as jest.Mock).mockResolvedValue({ status: 'completed', thread_id: existingThreadId });
    (OpenAI.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: [{ type: 'text', text: { value: '```json\n{"title":"Test Title","trip_properties":{},"user_response":"Test Response","itinerary":{}}\n```' } }],
        },
      ],
    });

    const result = await getOpenAIResponse(existingThreadId, 'Test prompt');

    expect(OpenAI.beta.threads.create).not.toHaveBeenCalled();
    expect(result.threadId).toBe(existingThreadId);
  });
});