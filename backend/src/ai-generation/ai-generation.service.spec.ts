import { AssetType, BusinessProfile, BusinessProfileStatus, Prisma } from '@prisma/client';
import { AiGenerationService } from './ai-generation.service';
import { ContextBuilder } from './context-builder';
import { LLMGateway, LlmRequest, LlmResponse, MVP_ASSET_TYPES } from './asset-types';
import { PromptBuilder } from './prompt-builder';
import { PrismaService } from '../prisma/prisma.service';

function profile(): BusinessProfile {
  return {
    id: 'profile-id',
    businessId: 'business-id',
    businessName: 'Canonical Cafe',
    category: 'Cafe',
    services: ['Coffee'],
    products: ['Pastries'],
    targetAudience: 'People nearby',
    tone: 'Friendly',
    style: 'Direct',
    location: 'Madrid',
    phone: null,
    website: null,
    gdprConsent: true,
    status: BusinessProfileStatus.APPROVED,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

function prismaMock() {
  const generationCreate = jest.fn().mockResolvedValue({ id: 'generation-id' });
  const transaction = {
    asset: { upsert: jest.fn().mockResolvedValue({ id: 'asset-id' }) },
    aIGeneration: { create: generationCreate },
  } as unknown as Prisma.TransactionClient;
  const prisma = {
    $transaction: jest.fn(async (callback: (client: Prisma.TransactionClient) => Promise<unknown>) => callback(transaction)),
  } as unknown as PrismaService;
  return { prisma, transaction, generationCreate };
}

class RecordingGateway implements LLMGateway {
  requests: LlmRequest[] = [];

  async complete(request: LlmRequest): Promise<LlmResponse> {
    this.requests.push(request);
    return {
      title: request.assetType,
      content: request.assetType === AssetType.FAQ ? 'Q: What?\\nA: This.' : `Only ${request.context.businessName}`,
      tokensUsed: 3,
    };
  }
}

describe('AiGenerationService', () => {
  it('persists complete metadata and snapshots for every successful generation', async () => {
    const gateway = new RecordingGateway();
    const { prisma, generationCreate } = prismaMock();
    const service = new AiGenerationService(prisma, gateway, new ContextBuilder(), new PromptBuilder());

    await expect(service.generateAll(profile(), 'user-id')).resolves.toHaveLength(5);

    expect(gateway.requests.map((request) => request.assetType)).toEqual([...MVP_ASSET_TYPES]);
    expect(gateway.requests).toHaveLength(5);
    for (const request of gateway.requests) {
      expect(request.context).toEqual(expect.objectContaining({ businessName: 'Canonical Cafe' }));
      expect(request.prompt).toContain('Canonical business profile');
    }

    for (const call of generationCreate.mock.calls) {
      expect(call[0].data).toEqual(expect.objectContaining({
        assetType: expect.any(String),
        promptSnapshot: expect.stringContaining('Canonical business profile'),
        contextSnapshot: expect.stringContaining('Canonical Cafe'),
        responseSnapshot: expect.any(String),
        status: 'SUCCEEDED',
        promptVersion: 'v1',
        contextVersion: 'v1',
        modelUsed: 'mock-deterministic-v1',
        temperature: 0.2,
        tokensUsed: 3,
        completedAt: expect.any(Date),
      }));
    }
  });

  it('records failed attempts and creates no assets when one output is invalid', async () => {
    const gateway: LLMGateway = {
      complete: jest.fn(async (request: LlmRequest): Promise<LlmResponse> => {
        if (request.assetType === AssetType.FAQ) {
          return { title: 'FAQ', content: 'invalid FAQ', tokensUsed: 2 };
        }
        return { title: request.assetType, content: 'Valid content', tokensUsed: 2 };
      }),
    };
    const { prisma, transaction, generationCreate } = prismaMock();
    const service = new AiGenerationService(prisma, gateway, new ContextBuilder(), new PromptBuilder());

    await expect(service.generateAll(profile(), 'user-id')).rejects.toThrow('FAQ');

    expect(transaction.asset.upsert).not.toHaveBeenCalled();
    expect(generationCreate).toHaveBeenCalledTimes(5);
    expect(generationCreate.mock.calls.filter(([call]) => call.data.status === 'FAILED')).toHaveLength(1);
    expect(generationCreate.mock.calls.filter(([call]) => call.data.status === 'SUCCEEDED')).toHaveLength(4);
    const failedCall = generationCreate.mock.calls.find(([call]) => call.data.status === 'FAILED');
    expect(failedCall?.[0].data).toEqual(expect.objectContaining({
      assetType: AssetType.FAQ,
      contextSnapshot: expect.stringContaining('Canonical Cafe'),
      responseSnapshot: expect.stringContaining('FAQ response'),
      status: 'FAILED',
      promptVersion: 'v1',
      contextVersion: 'v1',
      modelUsed: 'mock-deterministic-v1',
    }));
    expect(failedCall?.[0].data).not.toHaveProperty('assetId');
    expect(failedCall?.[0].data).not.toHaveProperty('tokensUsed');
  });
});
