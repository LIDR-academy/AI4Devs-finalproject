import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CatalogEditionDto } from '../dto/catalog-edition.dto';
import { CreateBookDto } from '../dto/create-book.dto';
import {
  CatalogEdition,
  CatalogDataSourceType,
} from '../entities/catalog-edition.entity';

export interface CatalogEditionUpsertInput {
  title: string;
  authors: string;
  isbn_13?: string | null;
  isbn_10?: string | null;
  cover_image_url?: string | null;
  page_count?: number | null;
  series_name?: string | null;
  publication_year?: number | null;
  catalog_genre?: string | null;
  data_source: CatalogDataSourceType;
  external_provider_id?: string | null;
}

@Injectable()
export class CatalogEditionsService {
  constructor(
    @InjectRepository(CatalogEdition)
    private readonly catalogRepo: Repository<CatalogEdition>,
  ) {}

  async findByIsbn(isbn: string): Promise<CatalogEdition | null> {
    const normalized = isbn.replace(/-/g, '').trim();
    if (!normalized) {
      return null;
    }
    return this.catalogRepo.findOne({
      where: [{ isbn13: normalized }, { isbn10: normalized }],
    });
  }

  async findByProvider(
    dataSource: CatalogDataSourceType,
    externalProviderId: string,
  ): Promise<CatalogEdition | null> {
    if (!externalProviderId.trim()) {
      return null;
    }
    return this.catalogRepo.findOne({
      where: { dataSource, externalProviderId },
    });
  }

  async upsertFromCreateDto(dto: CreateBookDto): Promise<CatalogEdition> {
    return this.upsert({
      title: dto.title,
      authors: dto.authors,
      isbn_13: dto.isbn_13 ?? null,
      isbn_10: dto.isbn_10 ?? null,
      cover_image_url: dto.cover_image_url ?? null,
      page_count: dto.page_count ?? null,
      series_name: dto.series_name ?? null,
      publication_year: dto.publication_year ?? null,
      data_source: dto.data_source,
      external_provider_id: dto.external_provider_id ?? null,
    });
  }

  async upsertFromCatalogEdition(
    edition: CatalogEditionDto,
    pageCount?: number | null,
  ): Promise<CatalogEdition> {
    return this.upsert({
      title: edition.title,
      authors: edition.authors,
      isbn_13: edition.isbn_13,
      isbn_10: edition.isbn_10,
      cover_image_url: edition.cover_image_url,
      page_count: pageCount ?? edition.page_count,
      data_source: edition.data_source,
      external_provider_id: edition.external_provider_id,
      catalog_genre: edition.genre,
    });
  }

  async upsert(input: CatalogEditionUpsertInput): Promise<CatalogEdition> {
    const existing = await this.findExisting(input);
    if (existing) {
      return this.mergeMissingFields(existing, input);
    }

    const created = this.catalogRepo.create({
      title: input.title,
      authors: input.authors,
      isbn13: input.isbn_13 ?? null,
      isbn10: input.isbn_10 ?? null,
      coverImageUrl: input.cover_image_url ?? null,
      pageCount: input.page_count ?? null,
      seriesName: input.series_name ?? null,
      publicationYear: input.publication_year ?? null,
      catalogGenre: input.catalog_genre ?? null,
      dataSource: input.data_source,
      externalProviderId: input.external_provider_id ?? null,
    });
    return this.catalogRepo.save(created);
  }

  async searchLocal(query: string, limit: number): Promise<CatalogEdition[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const isbnCandidate = trimmed.replace(/-/g, '');
    if (/^\d{10}(\d{3})?$/.test(isbnCandidate)) {
      const byIsbn = await this.findByIsbn(isbnCandidate);
      return byIsbn ? [byIsbn] : [];
    }

    const pattern = `%${trimmed}%`;
    return this.catalogRepo.find({
      where: [
        { title: ILike(pattern) },
        { authors: ILike(pattern) },
        { isbn13: ILike(pattern) },
      ],
      take: limit,
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Finds the best local catalog row for the same work across editions:
   * match by normalized title + author tokens, prefer rows with cover/genre.
   */
  async findBestByTitleAuthor(
    title: string,
    authors: string,
  ): Promise<CatalogEdition | null> {
    const titleNorm = normalizeCatalogMatchText(title);
    const authorsNorm = normalizeCatalogMatchText(authors);
    if (!titleNorm || !authorsNorm) {
      return null;
    }

    const titlePattern = `%${escapeILikePattern(title.trim())}%`;
    const candidates = await this.catalogRepo.find({
      where: { title: ILike(titlePattern) },
      take: 40,
      order: { updatedAt: 'DESC' },
    });

    const matches = candidates.filter((candidate) => {
      const candidateTitle = normalizeCatalogMatchText(candidate.title);
      if (
        candidateTitle !== titleNorm &&
        !candidateTitle.includes(titleNorm) &&
        !titleNorm.includes(candidateTitle)
      ) {
        return false;
      }
      return authorTokensOverlap(candidate.authors, authors);
    });

    if (matches.length === 0) {
      return null;
    }

    matches.sort((a, b) => scoreTitleAuthorCandidate(b) - scoreTitleAuthorCandidate(a));
    return matches[0] ?? null;
  }

  toCatalogEditionDto(edition: CatalogEdition): CatalogEditionDto {
    return {
      title: edition.title,
      authors: edition.authors,
      cover_image_url: edition.coverImageUrl,
      page_count: edition.pageCount,
      genre: edition.catalogGenre,
      isbn_13: edition.isbn13,
      isbn_10: edition.isbn10,
      data_source:
        edition.dataSource === 'google_books' ? 'google_books' : 'open_library',
      external_provider_id: edition.externalProviderId ?? '',
      catalog_edition_id: edition.id,
    };
  }

  private async findExisting(
    input: CatalogEditionUpsertInput,
  ): Promise<CatalogEdition | null> {
    if (input.isbn_13) {
      const byIsbn = await this.findByIsbn(input.isbn_13);
      if (byIsbn) {
        return byIsbn;
      }
    }

    if (input.data_source && input.external_provider_id) {
      const byProvider = await this.findByProvider(
        input.data_source,
        input.external_provider_id,
      );
      if (byProvider) {
        return byProvider;
      }
    }

    return null;
  }

  private async mergeMissingFields(
    existing: CatalogEdition,
    input: CatalogEditionUpsertInput,
  ): Promise<CatalogEdition> {
    let changed = false;

    if (!existing.coverImageUrl && input.cover_image_url) {
      existing.coverImageUrl = input.cover_image_url;
      changed = true;
    }
    if (existing.pageCount == null && input.page_count != null) {
      existing.pageCount = input.page_count;
      changed = true;
    }
    if (!existing.catalogGenre && input.catalog_genre) {
      existing.catalogGenre = input.catalog_genre;
      changed = true;
    }
    if (!existing.isbn13 && input.isbn_13) {
      existing.isbn13 = input.isbn_13;
      changed = true;
    }
    if (!existing.isbn10 && input.isbn_10) {
      existing.isbn10 = input.isbn_10;
      changed = true;
    }

    return changed ? this.catalogRepo.save(existing) : existing;
  }
}

export function normalizeCatalogMatchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeILikePattern(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

function authorTokensOverlap(candidateAuthors: string, queryAuthors: string): boolean {
  const candidateTokens = new Set(
    normalizeCatalogMatchText(candidateAuthors).split(' ').filter(Boolean),
  );
  const queryTokens = normalizeCatalogMatchText(queryAuthors)
    .split(' ')
    .filter(Boolean);
  if (candidateTokens.size === 0 || queryTokens.length === 0) {
    return false;
  }
  const overlap = queryTokens.filter((token) => candidateTokens.has(token)).length;
  return overlap >= Math.min(queryTokens.length, 2) || overlap === queryTokens.length;
}

function scoreTitleAuthorCandidate(edition: CatalogEdition): number {
  let score = 0;
  if (edition.coverImageUrl) {
    score += 100;
  }
  if (edition.catalogGenre) {
    score += 20;
  }
  if (edition.isbn13) {
    score += 5;
  }
  if (edition.pageCount != null) {
    score += 2;
  }
  return score;
}
