/**
 * AnalyzeListingUseCase (T037, T037b, T037e, T037f).
 * Orchestrates: fetch → location resolve (parallel) → LLM analyze → catastro cross-ref → persist.
 * Emits progress events (T037e) and returns processSummary (T037b).
 * Parallelises fetch + location with Promise.all (T037f).
 */
import { prisma } from '../../infrastructure/prisma/client';
import type { CheerioAdapter, ParsedListingHtml } from '../../adapters/cheerio/CheerioAdapter';
import type { ListingAnalyzerPort } from '../ports/ListingAnalyzerPort';
import type { LocationResolverPort } from '../ports/LocationResolverPort';
import type { CatastroPort } from '../ports/CatastroPort';
import type { MiraTuZonaAdapter } from '../../adapters/miratuzona/MiraTuZonaAdapter';
import { AutoAttachService } from './AutoAttachService';
import { SnapshotHash } from '../value-objects/SnapshotHash';
import { RedFlags } from '../value-objects/RedFlags';

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
    redFlags: unknown[];
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
    private readonly miratuzona: MiraTuZonaAdapter,
    private readonly autoAttach: AutoAttachService,
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

    emit('resolving_location');
    const [coordinates, analysis, catastroMatch] = await Promise.all([
      this.locationResolver
        .resolveLocation({
          url: parsed.url,
          declaredAddress: parsed.declaredAddress,
        })
        .catch(() => null),
      Promise.resolve().then(() => {
        emit('analyzing');
        return this.analyzer.analyze(parsed.text, parsed.url);
      }),
      Promise.resolve().then(async () => {
        emit('cross_referencing_cadastro');
        return coordinates
          ? this.catastro.lookup(coordinates, parsed.declaredAddress)
          : Promise.resolve(null);
      }),
    ]);

    // Auto-attach to active process (FR-014)
    const { processId, isNewProcess, propertyPrice } = await this.autoAttach.attach({
      userId: input.userId,
      listingUrl: input.url,
      propertyPrice: parsed.price ?? null,
    });

    // Hash for diff (FR-022)
    const canonical = `${parsed.url}|${parsed.text}|${parsed.price}|${parsed.squareMeters}`;
    const currentHash = SnapshotHash.compute(canonical);
    const previous = await prisma.analyzedListing.findFirst({
      where: { processId, url: input.url },
      orderBy: { createdAt: 'desc' },
    });
    const diff =
      previous && !previous.sourceHash.equals(currentHash)
        ? { changedAt: new Date().toISOString() }
        : null;

    // Persist (FR-011: no HTML/text stored; only analysis results)
    const stored = await prisma.analyzedListing.create({
      data: {
        processId,
        url: input.url,
        sourceHash: currentHash.value,
        previousHash: previous?.sourceHash ?? null,
        diff: diff ?? undefined,
        transparencyScore: analysis.transparencyScore.value,
        scoreLabel: analysis.transparencyScore.label,
        omissions: analysis.omissions,
        positiveSignals: analysis.positiveSignals,
        summary: analysis.summary,
        declaredAddress: parsed.declaredAddress ?? null,
        coordinates: coordinates ? coordinates.toJSON() : null,
        catastroMatch: catastroMatch ?? undefined,
        redFlags: {
          create: analysis.redFlags.items.map((f) => ({
            flag: f.flag,
            severity: f.severity,
            reasoning: f.reasoning,
          })),
        },
      },
      include: { redFlags: true },
    });

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
        propertyPrice: propertyPrice ? Number(propertyPrice) : null,
        currentStage: 'PRE_ARRAS',
        isNewProcess,
      },
    };
  }

  async getById(id: string, userId: string): Promise<unknown | null> {
    const listing = await prisma.analyzedListing.findFirst({
      where: { id, process: { userId } },
      include: { redFlags: true },
    });
    return listing;
  }
}
