/**
 * AnalyzedListingRepository — Prisma implementation of the
 * AnalyzedListingRepositoryPort. Lives in infrastructure because it
 * knows about Prisma. The domain never imports this directly.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import type {
  AnalyzedListingRepositoryPort,
  CreateAnalyzedListingInput,
  StoredAnalyzedListing,
} from '../../domain/ports/AnalyzedListingRepositoryPort';

export class AnalyzedListingRepository implements AnalyzedListingRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateAnalyzedListingInput): Promise<StoredAnalyzedListing> {
    const row = await this.prisma.analyzedListing.create({
      data: {
        processId: input.processId,
        url: input.url,
        sourceHash: input.sourceHash,
        previousHash: input.previousHash,
        diff: input.diff ? (input.diff as Prisma.InputJsonValue) : Prisma.JsonNull,
        transparencyScore: input.transparencyScore,
        scoreLabel: input.scoreLabel,
        omissions: input.omissions as unknown as Prisma.InputJsonValue,
        positiveSignals: input.positiveSignals as unknown as Prisma.InputJsonValue,
        summary: input.summary,
        declaredAddress: input.declaredAddress,
        coordinates: input.coordinates
          ? (input.coordinates.toJSON() as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        catastroMatch: input.catastroMatch
          ? (input.catastroMatch as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        redFlags: {
          create: input.redFlags.map((f) => ({
            flag: f.flag,
            severity: f.severity,
            reasoning: f.reasoning,
          })),
        },
      },
      include: { redFlags: true },
    });

    return {
      id: row.id,
      processId: row.processId,
      url: row.url,
      sourceHash: row.sourceHash,
      previousHash: row.previousHash,
      diff: row.diff as StoredAnalyzedListing['diff'],
      transparencyScore: row.transparencyScore,
      scoreLabel: row.scoreLabel,
      omissions: row.omissions,
      positiveSignals: row.positiveSignals,
      summary: row.summary,
      declaredAddress: row.declaredAddress,
      coordinates: row.coordinates,
      catastroMatch: row.catastroMatch,
      createdAt: row.createdAt,
      redFlags: row.redFlags.map((f) => ({
        id: f.id,
        flag: f.flag,
        severity: f.severity,
        reasoning: f.reasoning,
      })),
    };
  }

  async findPreviousByUrl(
    processId: string,
    url: string,
  ): Promise<StoredAnalyzedListing | null> {
    const row = await this.prisma.analyzedListing.findFirst({
      where: { processId, url },
      orderBy: { createdAt: 'desc' },
      include: { redFlags: true },
    });
    if (!row) return null;
    return this.toStored(row);
  }

  async findById(id: string, userId: string): Promise<StoredAnalyzedListing | null> {
    const row = await this.prisma.analyzedListing.findFirst({
      where: { id, process: { userId } },
      include: { redFlags: true },
    });
    if (!row) return null;
    return this.toStored(row);
  }

  private toStored(row: {
    id: string;
    processId: string;
    url: string;
    sourceHash: string;
    previousHash: string | null;
    diff: unknown;
    transparencyScore: number;
    scoreLabel: string;
    omissions: unknown;
    positiveSignals: unknown;
    summary: string | null;
    declaredAddress: string | null;
    coordinates: unknown;
    catastroMatch: unknown;
    createdAt: Date;
    redFlags: { id: string; flag: string; severity: string; reasoning: string }[];
  }): StoredAnalyzedListing {
    return {
      id: row.id,
      processId: row.processId,
      url: row.url,
      sourceHash: row.sourceHash,
      previousHash: row.previousHash,
      diff: row.diff as StoredAnalyzedListing['diff'],
      transparencyScore: row.transparencyScore,
      scoreLabel: row.scoreLabel,
      omissions: row.omissions,
      positiveSignals: row.positiveSignals,
      summary: row.summary,
      declaredAddress: row.declaredAddress,
      coordinates: row.coordinates,
      catastroMatch: row.catastroMatch,
      createdAt: row.createdAt,
      redFlags: row.redFlags,
    };
  }
}
