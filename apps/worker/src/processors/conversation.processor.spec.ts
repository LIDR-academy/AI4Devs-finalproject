import type { ConversationPhase } from '../services/address.service';
import type { ILLMService } from '../llm/llm.interface';

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

// ─── Mock del servicio LLM ────────────────────────────────────────────────────
// Simula el mismo comportamiento que el MockLLMService pero como jest.fn()
// para poder verificar llamadas e inyectar respuestas específicas por test.

const mockLLMService: jest.Mocked<ILLMService> = {
  generateMessage: jest.fn().mockResolvedValue('[MOCK] Hola, necesitamos tu dirección.'),
  extractAddress: jest.fn().mockResolvedValue({
    isComplete: false,
    missingFields: [],
    couldBeBuilding: false,
    address: null,
  }),
  interpretIntent: jest.fn().mockImplementation(async (_phase: string, msg: string) => {
    const lower = msg.toLowerCase().trim();
    if (['sí', 'si', 'yes', 'ok'].some((w) => lower === w || lower.startsWith(w + ' '))) {
      return { type: 'CONFIRM' };
    }
    if (lower.startsWith('no') || lower === 'no') {
      return { type: 'REJECT_AND_CORRECT', correction: msg };
    }
    return { type: 'UNKNOWN' };
  }),
};

// Inyectar el mock del servicio LLM antes de que los tests se ejecuten
beforeAll(async () => {
  const { setLLMService } = await import('./conversation.processor');
  setLLMService(mockLLMService);
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

describe('conversationProcessor INFORMATION journey', () => {
  const jobData = {
    conversationId: 'conv-info-1',
    orderId: 'order-info-1',
    userId: 'user-info-1',
    conversationType: 'INFORMATION' as const,
    context: undefined,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const { PrismaClient } = await import('@adresles/prisma-db');
    const instance = new (PrismaClient as jest.Mock)();
    (instance.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-info-1',
      firstName: 'Carmen',
      lastName: 'Martínez',
      preferredLanguage: 'es',
      isRegistered: false,
      phone: { id: 'phone-1' },
    });
    (instance.order.findUnique as jest.Mock).mockResolvedValue({
      externalOrderId: 'EXT-12345',
      store: { name: 'ModaMujer Outlet' },
      orderAddress: { fullAddress: 'Calle Mayor 1, 3º A, 28001 Madrid' },
    });
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.saveMessage as jest.Mock).mockResolvedValue(undefined);
    (dynamo.saveConversationState as jest.Mock).mockResolvedValue(undefined);
  });

  it('sends first message with first name only in greeting (no last name)', async () => {
    const { conversationProcessor } = await import('./conversation.processor');
    const dynamo = await import('../dynamodb/dynamodb.service');
    const job = { data: jobData } as never;
    await conversationProcessor(job);
    expect(dynamo.saveMessage).toHaveBeenCalledWith(
      'conv-info-1',
      'assistant',
      expect.stringContaining('**Carmen**'),
    );
    const message = (dynamo.saveMessage as jest.Mock).mock.calls.find(
      (c: unknown[]) => c[0] === 'conv-info-1' && c[1] === 'assistant',
    )?.[2];
    expect(message).not.toMatch(/Hola Carmen Martínez/);
  });

  it('sends first message with "Cliente" when firstName is null', async () => {
    const { PrismaClient } = await import('@adresles/prisma-db');
    const instance = new (PrismaClient as jest.Mock)();
    (instance.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-info-1',
      firstName: null,
      lastName: 'Martínez',
      preferredLanguage: 'es',
      isRegistered: false,
      phone: { id: 'phone-1' },
    });
    const { conversationProcessor } = await import('./conversation.processor');
    const dynamo = await import('../dynamodb/dynamodb.service');
    const job = { data: jobData } as never;
    await conversationProcessor(job);
    const message = (dynamo.saveMessage as jest.Mock).mock.calls.find(
      (c: unknown[]) => c[0] === 'conv-info-1' && c[1] === 'assistant',
    )?.[2];
    expect(message).toContain('**Cliente**');
  });

  it('sends first message with order number from externalOrderId (not N/A)', async () => {
    const { conversationProcessor } = await import('./conversation.processor');
    const dynamo = await import('../dynamodb/dynamodb.service');
    const job = { data: jobData } as never;
    await conversationProcessor(job);
    const message = (dynamo.saveMessage as jest.Mock).mock.calls.find(
      (c: unknown[]) => c[0] === 'conv-info-1' && c[1] === 'assistant',
    )?.[2];
    expect(message).toContain('#EXT-12345');
    expect(message).not.toContain('#N/A');
  });

  it('sends first message with delivery address when order has orderAddress', async () => {
    const { conversationProcessor } = await import('./conversation.processor');
    const dynamo = await import('../dynamodb/dynamodb.service');
    const job = { data: jobData } as never;
    await conversationProcessor(job);
    const message = (dynamo.saveMessage as jest.Mock).mock.calls.find(
      (c: unknown[]) => c[0] === 'conv-info-1' && c[1] === 'assistant',
    )?.[2];
    expect(message).toContain('📍 **Dirección de entrega:**');
    expect(message).toContain('Calle Mayor 1, 3º A, 28001 Madrid');
  });

  it('sends first message with neutral address text when order has no orderAddress', async () => {
    const { PrismaClient } = await import('@adresles/prisma-db');
    const instance = new (PrismaClient as jest.Mock)();
    (instance.order.findUnique as jest.Mock).mockResolvedValue({
      externalOrderId: 'EXT-999',
      store: { name: 'Tienda Y' },
      orderAddress: null,
    });
    const { conversationProcessor } = await import('./conversation.processor');
    const dynamo = await import('../dynamodb/dynamodb.service');
    const job = { data: jobData } as never;
    await conversationProcessor(job);
    const message = (dynamo.saveMessage as jest.Mock).mock.calls.find(
      (c: unknown[]) => c[0] === 'conv-info-1' && c[1] === 'assistant',
    )?.[2];
    expect(message).toContain('La dirección de entrega que indicaste ha sido registrada correctamente.');
  });

  it('loads order with include store and orderAddress', async () => {
    const { PrismaClient } = await import('@adresles/prisma-db');
    const instance = new (PrismaClient as jest.Mock)();
    const { conversationProcessor } = await import('./conversation.processor');
    const job = { data: jobData } as never;
    await conversationProcessor(job);
    expect(instance.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-info-1' },
        include: { store: true, orderAddress: true },
      }),
    );
  });
});

describe('conversationProcessor GET_ADDRESS journey', () => {
  const jobData = {
    conversationId: 'conv-get-1',
    orderId: 'order-get-1',
    userId: 'user-get-1',
    conversationType: 'GET_ADDRESS' as const,
    context: undefined,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockLLMService.generateMessage.mockResolvedValue('[MOCK] ¿Cuál es tu dirección de entrega para el pedido #MM-01001-OUT?');
    const { PrismaClient } = await import('@adresles/prisma-db');
    const instance = new (PrismaClient as jest.Mock)();
    (instance.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-get-1',
      firstName: 'Laura',
      lastName: 'Gómez',
      preferredLanguage: 'es',
      isRegistered: false,
      phone: { id: 'phone-get-1' },
    });
    (instance.order.findUnique as jest.Mock).mockResolvedValue({
      externalOrderId: 'MM-01001-OUT',
      store: { name: 'ModaMujer Outlet' },
      orderAddress: null,
    });
    (instance.address.findMany as jest.Mock).mockResolvedValue([]);
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.saveMessage as jest.Mock).mockResolvedValue(undefined);
    (dynamo.saveConversationState as jest.Mock).mockResolvedValue(undefined);
  });

  it('usa externalOrderId en el prompt al LLM (nunca N/A)', async () => {
    const { conversationProcessor } = await import('./conversation.processor');
    const dynamo = await import('../dynamodb/dynamodb.service');
    const job = { data: jobData } as never;
    await conversationProcessor(job);

    const userPromptCall = (dynamo.saveMessage as jest.Mock).mock.calls.find(
      (c: unknown[]) => c[0] === 'conv-get-1' && c[1] === 'user',
    );
    expect(userPromptCall).toBeDefined();
    const userPrompt = userPromptCall?.[2] as string;
    expect(userPrompt).toContain('MM-01001-OUT');
    expect(userPrompt).not.toContain('N/A');
  });

  it('el LLM recibe generateMessage cuando no hay dirección ecommerce ni dirección guardada', async () => {
    const { conversationProcessor } = await import('./conversation.processor');
    const job = { data: jobData } as never;
    await conversationProcessor(job);

    expect(mockLLMService.generateMessage).toHaveBeenCalledTimes(1);
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

  const baseOrder = {
    externalOrderId: 'EXT-1',
    store: { name: 'StoreX' },
    orderAddress: null as { fullAddress: string } | null,
  };
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
    jest.clearAllMocks();
    // Restaurar la implementación del mock LLM tras clearAllMocks
    mockLLMService.interpretIntent.mockImplementation(async (_phase: string, msg: string) => {
      const lower = msg.toLowerCase().trim();
      if (['sí', 'si', 'yes', 'ok'].some((w) => lower === w || lower.startsWith(w + ' '))) {
        return { type: 'CONFIRM' };
      }
      if (lower.startsWith('no') || lower === 'no') {
        return { type: 'REJECT_AND_CORRECT', correction: msg };
      }
      return { type: 'UNKNOWN' };
    });
    mockLLMService.generateMessage.mockResolvedValue('[MOCK] Hola, necesitamos tu dirección.');
    mockLLMService.extractAddress.mockResolvedValue({
      isComplete: false,
      missingFields: [],
      couldBeBuilding: false,
      address: null,
    });

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

  const baseOrder = {
    externalOrderId: 'EXT-1',
    store: { name: 'StoreX' },
    orderAddress: null as { fullAddress: string } | null,
  };
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
    jest.clearAllMocks();
    // Restaurar la implementación del mock LLM tras clearAllMocks
    mockLLMService.interpretIntent.mockImplementation(async (_phase: string, msg: string) => {
      const lower = msg.toLowerCase().trim();
      if (['sí', 'si', 'yes', 'ok'].some((w) => lower === w || lower.startsWith(w + ' '))) {
        return { type: 'CONFIRM' };
      }
      if (lower.startsWith('no') || lower === 'no') {
        return { type: 'REJECT_AND_CORRECT', correction: msg };
      }
      return { type: 'UNKNOWN' };
    });

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

describe('processResponseProcessor — persistencia única del mensaje de usuario', () => {
  const jobData = {
    conversationId: 'conv-1',
    orderId: 'order-1',
    userId: 'user-1',
    userMessage: 'Calle Mayor 1, Madrid',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const { PrismaClient } = await import('@adresles/prisma-db');
    const instance = new (PrismaClient as jest.Mock)();
    (instance.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      firstName: 'Test',
      lastName: 'User',
      preferredLanguage: 'es',
      isRegistered: false,
      phone: { id: 'phone-1' },
    });
    (instance.conversation.findUnique as jest.Mock).mockResolvedValue({ id: 'conv-1' });
    (instance.order.findUnique as jest.Mock).mockResolvedValue({
      externalOrderId: 'EXT-1',
      store: { name: 'StoreX' },
      orderAddress: null,
    });
    const dynamo = await import('../dynamodb/dynamodb.service');
    (dynamo.getConversationState as jest.Mock).mockResolvedValue({
      phase: 'WAITING_ADDRESS',
      failedAttempts: 0,
    });
    (dynamo.getMessages as jest.Mock).mockResolvedValue([
      { role: 'assistant', content: '¿Cuál es tu dirección?' },
      { role: 'user', content: jobData.userMessage },
    ]);
    (dynamo.saveMessage as jest.Mock).mockResolvedValue(undefined);
    (dynamo.saveConversationState as jest.Mock).mockResolvedValue(undefined);
    mockLLMService.extractAddress.mockResolvedValue({
      isComplete: false,
      missingFields: ['city'],
      couldBeBuilding: false,
      address: null,
    });
  });

  it('no llama a saveMessage con rol user (solo la API persiste el mensaje del reply)', async () => {
    const { processResponseProcessor } = await import('./conversation.processor');
    const dynamo = await import('../dynamodb/dynamodb.service');

    const job = { data: jobData } as never;
    await processResponseProcessor(job);

    const userCalls = (dynamo.saveMessage as jest.Mock).mock.calls.filter(
      (call: unknown[]) => call[1] === 'user',
    );
    expect(userCalls).toHaveLength(0);
  });
});
