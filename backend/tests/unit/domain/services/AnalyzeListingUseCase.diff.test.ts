import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzeListingUseCase } from '../../../../src/domain/services/AnalyzeListingUseCase';
import type { CheerioAdapter } from '../../../../src/adapters/cheerio/CheerioAdapter';
import type { ParsedListingHtml } from '../../../../src/domain/value-objects/ParsedListingHtml';
import type { ListingAnalyzerPort } from '../../../../src/domain/ports/ListingAnalyzerPort';
import type { LocationResolverPort } from '../../../../src/domain/ports/LocationResolverPort';
import type { CatastroPort } from '../../../../src/domain/ports/CatastroPort';
import type {
  AnalyzedListingRepositoryPort,
  StoredAnalyzedListing,
} from '../../../../src/domain/ports/AnalyzedListingRepositoryPort';
import type { ChecklistRepositoryPort } from '../../../../src/domain/ports/ChecklistRepositoryPort';
import { AutoAttachService } from '../../../../src/domain/services/AutoAttachService';
import { TransparencyScore } from '../../../../src/domain/value-objects/TransparencyScore';
import { SnapshotHash } from '../../../../src/domain/value-objects/SnapshotHash';

const currentCanonical = 'https://www.idealista.com/inmueble/12345/|piso acogedor. sin cee. 200.000€|200000|78';
const currentHash = SnapshotHash.compute(currentCanonical).value;
const oldHash = 'b'.repeat(64);

const baseStored: StoredAnalyzedListing = {
  id: 'listing-id',
  processId: 'process-id',
  url: 'https://www.idealista.com/inmueble/12345/',
  sourceHash: 'hash-1',
  previousHash: null,
  diff: null,
  price: null,
  squareMeters: null,
  transparencyScore: 60,
  scoreLabel: 'media',
  omissions: [],
  positiveSignals: [],
  summary: null,
  declaredAddress: null,
  coordinates: null,
  catastroMatch: null,
  createdAt: new Date('2026-07-09'),
  redFlags: [],
};

function makeDeps(overrides: {
  repository?: Partial<AnalyzedListingRepositoryPort>;
  previous?: StoredAnalyzedListing | null;
  cheerio?: Partial<CheerioAdapter>;
} = {}) {
  const cheerio = {
    fetch: vi.fn(async (_url: string): Promise<ParsedListingHtml> => ({
      url: 'https://www.idealista.com/inmueble/12345/',
      html: '<html></html>',
      text: 'Piso acogedor. Sin CEE. 200.000€',
      declaredAddress: 'CL EJEMPLO 123',
      price: 200000,
      squareMeters: 78,
    })),
    ...overrides.cheerio,
  } as unknown as CheerioAdapter;
  const analyzer = {
    analyze: vi.fn(async () => ({
      transparencyScore: TransparencyScore.create(60),
      omissions: [],
      positiveSignals: [],
      summary: null,
      redFlags: { items: [] },
    })),
  } as unknown as ListingAnalyzerPort;
  const locationResolver = {
    resolveLocation: vi.fn(async () => null),
  } as unknown as LocationResolverPort;
  const catastro = { lookup: vi.fn(async () => null) } as unknown as CatastroPort;
  const autoAttach = {
    attach: vi.fn(async () => ({
      processId: 'process-id',
      isNewProcess: true,
      propertyPrice: 200000,
    })),
    setSourceListingIfMissing: vi.fn().mockResolvedValue(undefined),
  } as unknown as AutoAttachService;
  const checklistRepo = {
    ensureForProcess: vi.fn(async () => null),
  } as unknown as ChecklistRepositoryPort;

  const repository: AnalyzedListingRepositoryPort = {
    create: vi.fn(async (input) => ({
      ...baseStored,
      ...input,
      redFlags: input.redFlags.map((f: { flag: string; severity: string; reasoning: string }) => ({ id: 'new', ...f })),
      id: 'new-listing',
    })) as unknown as AnalyzedListingRepositoryPort['create'],
    findPreviousByUrl: vi.fn(async () => overrides.previous ?? null),
    findById: vi.fn(async () => null),
    ...overrides.repository,
  };

  const useCase = new AnalyzeListingUseCase(
    cheerio, analyzer, locationResolver, catastro, autoAttach, repository, checklistRepo,
  );

  return { useCase, repository };
}

describe('AnalyzeListingUseCase — diff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('without previous analysis, diff is null', async () => {
    const { useCase, repository } = makeDeps({ previous: null });
    await useCase.execute({
      url: 'https://www.idealista.com/inmueble/12345/',
      sessionId: 'sess-1',
      userId: 'user-1',
    });
    const createCall = (repository.create as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(createCall.diff).toBeNull();
  });

  it('with same hash previous, new listing has diff.unchanged=true and empty arrays', async () => {
    const previous: StoredAnalyzedListing = {
      ...baseStored,
      sourceHash: currentHash,
      url: 'https://www.idealista.com/inmueble/12345/',
    };
    const { useCase, repository } = makeDeps({ previous });
    await useCase.execute({
      url: 'https://www.idealista.com/inmueble/12345/',
      sessionId: 'sess-1',
      userId: 'user-1',
    });
    const createCall = (repository.create as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(createCall.diff).toBeTruthy();
    expect((createCall.diff as { unchanged: boolean }).unchanged).toBe(true);
    expect((createCall.diff as { addedRedFlags: unknown[] }).addedRedFlags).toEqual([]);
    expect((createCall.diff as { removedRedFlags: unknown[] }).removedRedFlags).toEqual([]);
  });

  it('with different hash and price change, diff has priceDelta and removedRedFlags', async () => {
    const previous: StoredAnalyzedListing = {
      ...baseStored,
      sourceHash: oldHash,
      transparencyScore: 60,
      redFlags: [{ id: 'f1', flag: 'euphemistic_language', severity: 'low', reasoning: 'old' }],
    };
    const { useCase, repository } = makeDeps({ previous });
    await useCase.execute({
      url: 'https://www.idealista.com/inmueble/12345/',
      sessionId: 'sess-1',
      userId: 'user-1',
    });
    const createCall = (repository.create as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    const diff = createCall.diff as {
      unchanged: boolean;
      addedRedFlags: { flag: string }[];
      removedRedFlags: { flag: string }[];
    };
    expect(diff.unchanged).toBe(false);
    expect(diff.addedRedFlags).toHaveLength(0);
    expect(diff.removedRedFlags.map((f) => f.flag)).toEqual(['euphemistic_language']);
  });

  it('always creates a new AnalyzedListing even when unchanged', async () => {
    const previous: StoredAnalyzedListing = { ...baseStored, sourceHash: currentHash };
    const { useCase, repository } = makeDeps({ previous });
    await useCase.execute({
      url: 'https://www.idealista.com/inmueble/12345/',
      sessionId: 'sess-1',
      userId: 'user-1',
    });
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it('computes priceDelta and squareMetersDelta from previous stored values', async () => {
    const previous: StoredAnalyzedListing = {
      ...baseStored,
      sourceHash: oldHash,
      price: 180000,
      squareMeters: 75,
      redFlags: [],
    };
    const cheerio = {
      fetch: vi.fn(async (_url: string): Promise<ParsedListingHtml> => ({
        url: 'https://www.idealista.com/inmueble/12345/',
        html: '<html></html>',
        text: 'Piso reformado. Sin CEE. 220.000€',
        declaredAddress: 'CL EJEMPLO 123',
        price: 220000,
        squareMeters: 78,
      })),
    } as unknown as CheerioAdapter;
    const { useCase, repository } = makeDeps({ previous, cheerio });
    await useCase.execute({
      url: 'https://www.idealista.com/inmueble/12345/',
      sessionId: 'sess-1',
      userId: 'user-1',
    });
    const createCall = (repository.create as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    const diff = createCall.diff as {
      unchanged: boolean;
      priceDelta: number;
      squareMetersDelta: number;
    };
    expect(diff.unchanged).toBe(false);
    expect(diff.priceDelta).toBe(40000);
    expect(diff.squareMetersDelta).toBe(3);
  });
});
