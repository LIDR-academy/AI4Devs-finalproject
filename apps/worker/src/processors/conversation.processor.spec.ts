import type { ConversationPhase } from '../services/address.service';

jest.mock('@adresles/prisma-db', () => {
  const mockPrisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    conversation: { findUnique: jest.fn(), update: jest.fn() },
    order: { findUnique: jest.fn(), update: jest.fn() },
    orderAddress: { create: jest.fn() },
    address: { findMany: jest.fn() },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('../redis-publisher', () => ({
  publishConversationUpdate: jest.fn().mockResolvedValue(undefined),
  publishConversationComplete: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../dynamodb/dynamodb.service', () => ({
  saveMessage: jest.fn().mockResolvedValue(undefined),
  getMessages: jest.fn().mockResolvedValue([]),
  saveConversationState: jest.fn().mockResolvedValue(undefined),
  getConversationState: jest.fn().mockResolvedValue(null),
}));

describe('conversation.processor', () => {
  it('exports processResponseProcessor and conversationProcessor', async () => {
    const mod = await import('./conversation.processor');
    expect(typeof mod.conversationProcessor).toBe('function');
    expect(typeof mod.processResponseProcessor).toBe('function');
  });

  it('ConversationPhase includes WAITING_REGISTER and WAITING_REGISTER_EMAIL and WAITING_SAVE_ADDRESS', () => {
    const phases: ConversationPhase[] = [
      'WAITING_REGISTER',
      'WAITING_REGISTER_EMAIL',
      'WAITING_SAVE_ADDRESS',
    ];
    expect(phases).toContain('WAITING_REGISTER');
    expect(phases).toContain('WAITING_REGISTER_EMAIL');
    expect(phases).toContain('WAITING_SAVE_ADDRESS');
  });
});
