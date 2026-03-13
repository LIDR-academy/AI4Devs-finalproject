import type { ConversationPhase } from '../services/address.service';

jest.mock('@adresles/prisma-db', () => {
  const mockPrisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    conversation: { findUnique: jest.fn(), update: jest.fn() },
    order: { findUnique: jest.fn(), update: jest.fn() },
    orderAddress: { create: jest.fn() },
    address: { findMany: jest.fn(), create: jest.fn() },
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

jest.mock('../services/address.service', () => {
  const actual = jest.requireActual('../services/address.service');
  return {
    ...actual,
    interpretUserIntent: jest.fn().mockImplementation(async (_phase: string, msg: string) => {
      const lower = msg.toLowerCase().trim();
      if (['sí', 'si', 'yes', 'ok'].some((w) => lower === w || lower.startsWith(w))) {
        return { type: 'CONFIRM' };
      }
      if (lower.startsWith('no') || lower === 'no') {
        return { type: 'REJECT_AND_CORRECT', correction: msg };
      }
      return { type: 'UNKNOWN' };
    }),
  };
});

describe('conversation.processor', () => {
  it('exports processResponseProcessor and conversationProcessor', async () => {
    const mod = await import('./conversation.processor');
    expect(typeof mod.conversationProcessor).toBe('function');
    expect(typeof mod.processResponseProcessor).toBe('function');
  });

  it('ConversationPhase includes WAITING_REGISTER, WAITING_REGISTER_EMAIL, WAITING_SAVE_ADDRESS and WAITING_SAVE_ADDRESS_LABEL', () => {
    const phases: ConversationPhase[] = [
      'WAITING_REGISTER',
      'WAITING_REGISTER_EMAIL',
      'WAITING_SAVE_ADDRESS',
      'WAITING_SAVE_ADDRESS_LABEL',
    ];
    expect(phases).toContain('WAITING_REGISTER');
    expect(phases).toContain('WAITING_REGISTER_EMAIL');
    expect(phases).toContain('WAITING_SAVE_ADDRESS');
    expect(phases).toContain('WAITING_SAVE_ADDRESS_LABEL');
  });
});

describe('processResponseProcessor WAITING_SAVE_ADDRESS and WAITING_SAVE_ADDRESS_LABEL', () => {
  const jobData = {
    conversationId: 'conv-1',
    orderId: 'order-1',
    userId: 'user-1',
    userMessage: '',
  };

  const baseUser = {
    id: 'user-1',
    firstName: 'Test',
    lastName: 'User',
    preferredLanguage: 'es',
    isRegistered: true,
    phone: { id: 'phone-1' },
  };

  const baseOrder = { externalOrderNumber: 'EXT-1', store: { name: 'StoreX' } };
  const confirmedPending = {
    gmapsFormatted: 'Calle Nueva 5, 28002 Madrid',
    gmapsPlaceId: null,
    latitude: null,
    longitude: null,
    street: 'Calle Nueva',
    number: '5',
    postalCode: '28002',
    city: 'Madrid',
    province: null,
    country: 'ES',
    block: null,
    staircase: null,
    floor: null,
    door: null,
    additionalInfo: null,
    couldBeBuilding: false,
    userConfirmedNoDetails: false,
  };

  beforeEach(async () => {
    const { PrismaClient } = await import('@adresles/prisma-db');
    const instance = new (PrismaClient as jest.Mock)();
    (instance.user.findUnique as jest.Mock).mockResolvedValue(baseUser);
    (instance.conversation.findUnique as jest.Mock).mockResolvedValue({ id: 'conv-1' });
    (instance.order.findUnique as jest.Mock).mockResolvedValue(baseOrder);
    (instance.address.findMany as jest.Mock).mockResolvedValue([]);
    (instance.address.create as jest.Mock).mockResolvedValue({});
    (instance.conversation.update as jest.Mock).mockResolvedValue({});
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.saveConversationState as jest.Mock).mockResolvedValue(undefined);
    (dynamo.saveMessage as jest.Mock).mockResolvedValue(undefined);
  });

  it('WAITING_SAVE_ADDRESS with CONFIRM (Sí) asks for label and transitions to WAITING_SAVE_ADDRESS_LABEL', async () => {
    const { processResponseProcessor } = await import('./conversation.processor');
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.getConversationState as jest.Mock).mockResolvedValue({
      phase: 'WAITING_SAVE_ADDRESS',
      confirmedAddress: confirmedPending,
    });

    const job = { data: { ...jobData, userMessage: 'Sí' } } as never;
    await processResponseProcessor(job);

    expect(dynamo.saveConversationState).toHaveBeenCalledWith(
      'conv-1',
      expect.objectContaining({
        phase: 'WAITING_SAVE_ADDRESS_LABEL',
        confirmedAddress: confirmedPending,
      }),
    );
  });

  it('WAITING_SAVE_ADDRESS with REJECT (No) closes conversation without creating Address', async () => {
    const { processResponseProcessor } = await import('./conversation.processor');
    const prisma = (await import('@adresles/prisma-db')).PrismaClient as jest.Mock;
    const instance = prisma.mock.results[prisma.mock.results.length - 1]?.value;
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.getConversationState as jest.Mock).mockResolvedValue({
      phase: 'WAITING_SAVE_ADDRESS',
      confirmedAddress: confirmedPending,
    });

    const job = { data: { ...jobData, userMessage: 'No' } } as never;
    await processResponseProcessor(job);

    expect(instance.address.create).not.toHaveBeenCalled();
    expect(instance.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'conv-1' },
        data: expect.objectContaining({ status: 'COMPLETED' }),
      }),
    );
  });

  it('WAITING_SAVE_ADDRESS_LABEL with alias creates Address with that label', async () => {
    const { processResponseProcessor } = await import('./conversation.processor');
    const prisma = (await import('@adresles/prisma-db')).PrismaClient as jest.Mock;
    const instance = prisma.mock.results[prisma.mock.results.length - 1]?.value;
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.getConversationState as jest.Mock).mockResolvedValue({
      phase: 'WAITING_SAVE_ADDRESS_LABEL',
      confirmedAddress: confirmedPending,
    });

    const job = { data: { ...jobData, userMessage: 'Casa' } } as never;
    await processResponseProcessor(job);

    expect(instance.address.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          label: 'Casa',
          fullAddress: confirmedPending.gmapsFormatted,
        }),
      }),
    );
  });

  it('WAITING_SAVE_ADDRESS_LABEL with empty message creates Address with "Mi dirección"', async () => {
    const { processResponseProcessor } = await import('./conversation.processor');
    const prisma = (await import('@adresles/prisma-db')).PrismaClient as jest.Mock;
    const instance = prisma.mock.results[prisma.mock.results.length - 1]?.value;
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.getConversationState as jest.Mock).mockResolvedValue({
      phase: 'WAITING_SAVE_ADDRESS_LABEL',
      confirmedAddress: confirmedPending,
    });

    const job = { data: { ...jobData, userMessage: '   ' } } as never;
    await processResponseProcessor(job);

    expect(instance.address.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          label: 'Mi dirección',
        }),
      }),
    );
  });

  it('WAITING_SAVE_ADDRESS_LABEL with long alias truncates to 80 chars', async () => {
    const { processResponseProcessor } = await import('./conversation.processor');
    const prisma = (await import('@adresles/prisma-db')).PrismaClient as jest.Mock;
    const instance = prisma.mock.results[prisma.mock.results.length - 1]?.value;
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.getConversationState as jest.Mock).mockResolvedValue({
      phase: 'WAITING_SAVE_ADDRESS_LABEL',
      confirmedAddress: confirmedPending,
    });

    const longAlias = 'A'.repeat(100);
    const job = { data: { ...jobData, userMessage: longAlias } } as never;
    await processResponseProcessor(job);

    expect(instance.address.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          label: 'A'.repeat(80),
          fullAddress: confirmedPending.gmapsFormatted,
        }),
      }),
    );
  });
});

describe('processResponseProcessor offerSaveAddress — dirección ya en libreta', () => {
  const jobData = {
    conversationId: 'conv-1',
    orderId: 'order-1',
    userId: 'user-1',
    userMessage: 'Sí',
  };

  const baseUser = {
    id: 'user-1',
    firstName: 'Test',
    lastName: 'User',
    preferredLanguage: 'es',
    isRegistered: true,
    phone: { id: 'phone-1' },
  };

  const baseOrder = { externalOrderNumber: 'EXT-1', store: { name: 'StoreX' } };
  const confirmedPending = {
    gmapsFormatted: 'Calle Nueva 5, 28002 Madrid',
    gmapsPlaceId: null,
    latitude: null,
    longitude: null,
    street: 'Calle Nueva',
    number: '5',
    postalCode: '28002',
    city: 'Madrid',
    province: null,
    country: 'ES',
    block: null,
    staircase: null,
    floor: null,
    door: null,
    additionalInfo: null,
    couldBeBuilding: false,
    userConfirmedNoDetails: false,
  };

  beforeEach(async () => {
    const { PrismaClient } = await import('@adresles/prisma-db');
    const instance = new (PrismaClient as jest.Mock)();
    (instance.user.findUnique as jest.Mock).mockResolvedValue(baseUser);
    (instance.conversation.findUnique as jest.Mock).mockResolvedValue({ id: 'conv-1' });
    (instance.order.findUnique as jest.Mock).mockResolvedValue(baseOrder);
    (instance.conversation.update as jest.Mock).mockResolvedValue({});
    (instance.address.create as jest.Mock).mockClear();
    (instance.address.findMany as jest.Mock).mockClear();
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.saveConversationState as jest.Mock).mockClear();
    (dynamo.saveConversationState as jest.Mock).mockResolvedValue(undefined);
    (dynamo.saveMessage as jest.Mock).mockResolvedValue(undefined);
  });

  it('offerSaveAddress when address already in libreta closes conversation without offering', async () => {
    const { processResponseProcessor } = await import('./conversation.processor');
    const prisma = (await import('@adresles/prisma-db')).PrismaClient as jest.Mock;
    const instance = prisma.mock.results[prisma.mock.results.length - 1]?.value;
    const dynamo = await import('../dynamodb/dynamodb.service');

    (instance.address.findMany as jest.Mock).mockResolvedValue([
      { fullAddress: 'Calle Nueva 5, 28002 Madrid', isDeleted: false },
    ]);
    (dynamo.getConversationState as jest.Mock).mockResolvedValue({
      phase: 'WAITING_CONFIRMATION',
      pendingAddress: confirmedPending,
    });

    const job = { data: jobData } as never;
    await processResponseProcessor(job);

    expect(instance.address.create).not.toHaveBeenCalled();
    expect(dynamo.saveConversationState).not.toHaveBeenCalledWith(
      'conv-1',
      expect.objectContaining({ phase: 'WAITING_SAVE_ADDRESS' }),
    );
    expect(instance.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'conv-1' },
        data: expect.objectContaining({ status: 'COMPLETED' }),
      }),
    );
  });
});
