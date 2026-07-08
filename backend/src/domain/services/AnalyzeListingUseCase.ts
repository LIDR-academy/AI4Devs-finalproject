/**
 * AnalyzeListingUseCase (T037, T037b, T037e, T037f).
 * Orchestrates: fetch → location resolve (parallel) → LLM analyze → catastro cross-ref → persist.
 * Emits progress events (T037e) and returns processSummary (T037b).
 * Parallelises fetch + location with Promise.all (T037f).
 *
 * Hexagonal: depends on the AnalyzedListingRepositoryPort (defined in
 * domain/ports/), NOT on Prisma. The Prisma implementation lives in
 * infrastructure/repositories/.
 */
import type { CheerioAdapter, ParsedListingHtml } from '../../adapters/cheerio/CheerioAdapter';
import type { ListingAnalyzerPort } from '../ports/ListingAnalyzerPort';
import type { LocationResolverPort } from '../ports/LocationResolverPort';
import type { CatastroPort } from '../ports/CatastroPort';
import type {
  AnalyzedListingRepositoryPort,
  StoredAnalyzedListing,
} from '../ports/AnalyzedListingRepositoryPort';
import type { ChecklistRepositoryPort } from '../ports/ChecklistRepositoryPort';
import { AutoAttachService } from './AutoAttachService';
import { SnapshotHash } from '../value-objects/SnapshotHash';
import { Coordinates } from '../value-objects/Coordinates';

export interface AnalyzeListingInput {
  url: string;
  sessionId: string;
  userId: string;
  manualText?: string;
  onProgress?: (event: string, payload?: unknown) => void;
}

export interface AnalyzeListingResult {
  listing: {
    id: string;
    url: string;
    transparencyScore: number;
    scoreLabel: string;
    redFlags: { id: string; flag: string; severity: string; reasoning: string }[];
    summary: string | null;
    declaredAddress: string | null;
    coordinates: unknown;
    catastroMatch: unknown;
    createdAt: string;
  };
  processSummary: {
    processId: string;
    propertyPrice: number | null;
    currentStage: string;
    isNewProcess: boolean;
  };
}

export class AnalyzeListingUseCase {
  constructor(
    private readonly cheerio: CheerioAdapter,
    private readonly analyzer: ListingAnalyzerPort,
    private readonly locationResolver: LocationResolverPort,
    private readonly catastro: CatastroPort,
    private readonly autoAttach: AutoAttachService,
    private readonly repository: AnalyzedListingRepositoryPort,
    private readonly checklistRepository: ChecklistRepositoryPort,
  ) {}

  async execute(input: AnalyzeListingInput): Promise<AnalyzeListingResult> {
    const emit = (event: string, payload?: unknown): void => {
      input.onProgress?.(event, payload);
    };

    emit('fetching_html');
    const parsed: ParsedListingHtml = input.manualText
      ? {
          url: input.url,
          html: '',
          text: input.manualText,
          declaredAddress: undefined,
        }
      : await this.cheerio.fetch(input.url);

    const [coordinates, analysis] = await Promise.all([
      this.resolveLocationSafe(parsed, emit),
      Promise.resolve().then(() => {
        emit('analyzing');
        return this.analyzer.analyze(parsed.text, parsed.url);
      }),
    ]);

    emit('cross_referencing_cadastro');
    const catastroResult = coordinates
      ? await this.tryCatastro(coordinates, parsed.declaredAddress)
      : null;

    const { processId, isNewProcess, propertyPrice } = await this.autoAttach.attach({
      userId: input.userId,
      listingUrl: input.url,
      propertyPrice: parsed.price ?? null,
    });

    // FR-024: auto-attach a default Checklist (21 items across 6 stages)
    // to the process. Idempotent — if one already exists, this is a no-op.
    await this.checklistRepository.ensureForProcess(processId);

    const canonical = `${parsed.url}|${parsed.text}|${parsed.price}|${parsed.squareMeters}`;
    const currentHash = SnapshotHash.compute(canonical);
    const previous = await this.repository.findPreviousByUrl(processId, input.url);
    const diff =
      previous && previous.sourceHash !== currentHash.value
        ? { changedAt: new Date().toISOString() }
        : null;

    const stored = await this.repository.create({
      processId,
      url: input.url,
      sourceHash: currentHash.value,
      previousHash: previous?.sourceHash ?? null,
      diff,
      transparencyScore: analysis.transparencyScore.value,
      scoreLabel: analysis.transparencyScore.label,
      omissions: analysis.omissions,
      positiveSignals: analysis.positiveSignals,
      summary: analysis.summary,
      declaredAddress: parsed.declaredAddress ?? null,
      coordinates,
      catastroMatch: catastroResult,
      redFlags: analysis.redFlags.items,
    });

    return this.toResult(stored, processId, isNewProcess, propertyPrice);
  }

  async getById(id: string, userId: string): Promise<StoredAnalyzedListing | null> {
    return this.repository.findById(id, userId);
  }

  private toResult(
    stored: StoredAnalyzedListing,
    processId: string,
    isNewProcess: boolean,
    propertyPrice: number | null,
  ): AnalyzeListingResult {
    return {
      listing: {
        id: stored.id,
        url: stored.url,
        transparencyScore: stored.transparencyScore,
        scoreLabel: stored.scoreLabel,
        redFlags: stored.redFlags,
        summary: stored.summary,
        declaredAddress: stored.declaredAddress,
        coordinates: stored.coordinates,
        catastroMatch: stored.catastroMatch,
        createdAt: stored.createdAt.toISOString(),
      },
      processSummary: {
        processId,
        propertyPrice,
        currentStage: 'PRE_ARRAS',
        isNewProcess,
      },
    };
  }

  private async resolveLocationSafe(
    parsed: ParsedListingHtml,
    emit: (event: string) => void,
  ): Promise<Coordinates | null> {
    emit('resolving_location');
    try {
      return await this.locationResolver.resolveLocation({
        url: parsed.url,
        declaredAddress: parsed.declaredAddress,
      });
    } catch {
      return null;
    }
  }

  private async tryCatastro(
    coordinates: Coordinates,
    declaredAddress?: string,
  ): Promise<Awaited<ReturnType<CatastroPort['lookup']>> | null> {
    try {
      return await this.catastro.lookup(coordinates, declaredAddress);
    } catch {
      return null;
    }
  }
}
