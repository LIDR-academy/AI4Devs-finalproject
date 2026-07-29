import { describe, it, expect, vi } from 'vitest';
import { AnalyzeListingUseCase } from '../../../../src/domain/services/AnalyzeListingUseCase';
import type { ListingFetchPort } from '../../../../src/domain/ports/ListingFetchPort';
import type { ListingAnalyzerPort } from '../../../../src/domain/ports/ListingAnalyzerPort';
import type { LocationResolverPort } from '../../../../src/domain/ports/LocationResolverPort';
import type { CatastroPort } from '../../../../src/domain/ports/CatastroPort';
import type { AnalyzedListingRepositoryPort } from '../../../../src/domain/ports/AnalyzedListingRepositoryPort';
import type { ChecklistRepositoryPort } from '../../../../src/domain/ports/ChecklistRepositoryPort';
import { AutoAttachService } from '../../../../src/domain/services/AutoAttachService';
import { Coordinates } from '../../../../src/domain/value-objects/Coordinates';
import { TransparencyScore } from '../../../../src/domain/value-objects/TransparencyScore';
import { RedFlags } from '../../../../src/domain/value-objects/RedFlags';

function mockFetcher(): ListingFetchPort {
  return {
    fetch: vi.fn().mockResolvedValue({
      url: 'https://example.com/piso',
      html: '<html></html>',
      text: 'Piso en centro, 80m², 200.000€',
      price: 200000,
      squareMeters: 80,
      declaredAddress: 'Calle Test 1, Madrid',
    }),
  };
}

function mockAnalyzer(): ListingAnalyzerPort {
  return {
    analyze: vi.fn().mockResolvedValue({
      transparencyScore: TransparencyScore.create(62),
      redFlags: RedFlags.empty(),
      omissions: [],
      positiveSignals: [],
      summary: 'Análisis de prueba',
    }),
  };
}

function mockLocationResolver(): LocationResolverPort {
  return {
    resolveLocation: vi.fn().mockResolvedValue(
      Coordinates.create(40.4168, -3.7038, 'geocoded', 0.9),
    ),
  };
}

function mockCatastro(): CatastroPort {
  return {
    lookup: vi.fn().mockResolvedValue({
      cadastralReference: '9876543VK4797N',
      squareMeters: 78,
      constructionYear: 1972,
    }),
  };
}

const ANY_DATE = new Date('2024-01-01');

function mockRepository(): AnalyzedListingRepositoryPort {
  return {
    create: vi.fn().mockImplementation(async (input) => ({
      id: 'list-result',
      processId: input.processId,
      url: input.url,
      sourceHash: input.sourceHash,
      previousHash: input.previousHash,
      diff: input.diff,
      price: input.price,
      squareMeters: input.squareMeters,
      transparencyScore: input.transparencyScore,
      scoreLabel: input.scoreLabel,
      omissions: input.omissions,
      positiveSignals: input.positiveSignals,
      summary: input.summary,
      declaredAddress: input.declaredAddress,
      coordinates: input.coordinates,
      catastroMatch: input.catastroMatch,
      redFlags: input.redFlags.map((f: { flag: string; severity: string; reasoning: string }, i: number) => ({ id: `rf-${i}`, ...f })),
      createdAt: ANY_DATE,
    })),
    findById: vi.fn().mockResolvedValue(null),
    findPreviousByUrl: vi.fn().mockResolvedValue(null),
  };
}

function mockChecklistRepository(): ChecklistRepositoryPort {
  return {
    ensureForProcess: vi.fn().mockResolvedValue({ id: 'chk-1', items: [], processId: 'proc-1', templateName: 'compra' }),
    findByProcessId: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null),
    toggleItem: vi.fn().mockResolvedValue(null),
  };
}

function mockAutoAttach(overrides: { newProcess?: boolean; processId?: string } = {}): AutoAttachService {
  return {
    attach: vi.fn().mockResolvedValue({
      processId: overrides.processId ?? 'proc-1',
      isNewProcess: overrides.newProcess ?? true,
      propertyPrice: 200000,
    }),
    setSourceListingIfMissing: vi.fn().mockResolvedValue(undefined),
  } as unknown as AutoAttachService;
}

describe('AnalyzeListingUseCase', () => {
  it('orquesta fetch → analyze → catastro → persistencia', async () => {
    const fetcher = mockFetcher();
    const analyzer = mockAnalyzer();
    const locationResolver = mockLocationResolver();
    const catastro = mockCatastro();
    const autoAttach = mockAutoAttach();
    const repository = mockRepository();
    const checklistRepo = mockChecklistRepository();

    const useCase = new AnalyzeListingUseCase(
      fetcher, analyzer, locationResolver, catastro,
      autoAttach, repository, checklistRepo,
    );

    const result = await useCase.execute({
      url: 'https://example.com/piso',
      sessionId: 'session-1',
      userId: 'user-1',
    });

    expect(fetcher.fetch).toHaveBeenCalledWith('https://example.com/piso');
    expect(analyzer.analyze).toHaveBeenCalled();
    expect(locationResolver.resolveLocation).toHaveBeenCalled();
    expect(catastro.lookup).toHaveBeenCalled();
    expect(checklistRepo.ensureForProcess).toHaveBeenCalled();

    expect(result.listing).toBeDefined();
    expect(result.listing.id).toBe('list-result');
    expect(result.listing.transparencyScore).toBe(62);
    expect(result.processSummary).toBeDefined();
    expect(result.processSummary.isNewProcess).toBe(true);
  });

  it('emite eventos de progreso en orden', async () => {
    const events: string[] = [];

    const useCase = new AnalyzeListingUseCase(
      mockFetcher(),
      mockAnalyzer(),
      mockLocationResolver(),
      mockCatastro(),
      mockAutoAttach(),
      mockRepository(),
      mockChecklistRepository(),
    );

    await useCase.execute({
      url: 'https://example.com/piso',
      sessionId: 'session-1',
      userId: 'user-1',
      onProgress: (event) => { events.push(event); },
    });

    expect(events).toContain('fetching_html');
    expect(events).toContain('analyzing');
    expect(events).toContain('resolving_location');
    expect(events).toContain('cross_referencing_cadastro');
  });

  it('continúa sin datos catastrales si Catastro falla', async () => {
    const catastro = {
      lookup: vi.fn().mockRejectedValue(new Error('Catastro down')),
    } as unknown as CatastroPort;

    const useCase = new AnalyzeListingUseCase(
      mockFetcher(),
      mockAnalyzer(),
      mockLocationResolver(),
      catastro,
      mockAutoAttach(),
      mockRepository(),
      mockChecklistRepository(),
    );

    const result = await useCase.execute({
      url: 'https://example.com/piso',
      sessionId: 'session-1',
      userId: 'user-1',
    });

    expect(result.listing).toBeDefined();
    expect(result.listing.catastroMatch).toBeNull();
  });

  it('continúa sin coordenadas si locationResolver falla', async () => {
    const locationResolver = {
      resolveLocation: vi.fn().mockRejectedValue(new Error('Geocoding down')),
    } as unknown as LocationResolverPort;

    const useCase = new AnalyzeListingUseCase(
      mockFetcher(),
      mockAnalyzer(),
      locationResolver,
      mockCatastro(),
      mockAutoAttach(),
      mockRepository(),
      mockChecklistRepository(),
    );

    const result = await useCase.execute({
      url: 'https://example.com/piso',
      sessionId: 'session-1',
      userId: 'user-1',
    });

    expect(result.listing).toBeDefined();
    expect(result.listing.coordinates).toBeNull();
  });

  it('usa manualText cuando se proporciona, sin llamar al fetcher', async () => {
    const fetcher = mockFetcher();

    const useCase = new AnalyzeListingUseCase(
      fetcher,
      mockAnalyzer(),
      mockLocationResolver(),
      mockCatastro(),
      mockAutoAttach(),
      mockRepository(),
      mockChecklistRepository(),
    );

    await useCase.execute({
      url: 'manual://text-only',
      sessionId: 'session-1',
      userId: 'user-1',
      manualText: 'Ático reformado. 100m². Certificación energética B.',
    });

    expect(fetcher.fetch).not.toHaveBeenCalled();
  });
});
