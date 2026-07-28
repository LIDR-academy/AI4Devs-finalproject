import { Injectable, Logger } from '@nestjs/common';
import {
  CatalogEditionDto,
  CatalogSearchResponseDto,
} from '../dto/catalog-edition.dto';
import { GenreNormalizerService } from '../genre-normalizer.service';
import type { CatalogIsbnLookupResult } from './catalog-isbn-lookup.types';
import { OpenLibraryEnrichmentService } from './open-library-enrichment.service';
import { isTransientCatalogError } from './catalog-error.util';
import { retryWithBackoff } from './retry-with-backoff.util';
import { GoogleBooksClient } from './google-books.client';
import { OpenLibraryClient } from './open-library.client';

const GENRE_LOOKUP_TIMEOUT_MS = 3000;
const CATALOG_SEARCH_RETRY = {
  maxAttempts: 3,
  baseDelayMs: 200,
  rateLimitBaseDelayMs: 2500,
  rateLimitMaxAttempts: 5,
  isRetryable: isTransientCatalogError,
} as const;

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly openLibrary: OpenLibraryClient,
    private readonly googleBooks: GoogleBooksClient,
    private readonly openLibraryEnrichment: OpenLibraryEnrichmentService,
    private readonly genreNormalizer: GenreNormalizerService,
  ) {}

  async search(query: string, limit: number): Promise<CatalogSearchResponseDto> {
    try {
      const olItems = await this.openLibrary.search(query, limit);
      if (olItems.length > 0) {
        const enriched = await Promise.all(
          olItems.map((item) => this.fillMissingGenre(item)),
        );
        const items = enriched.map((item) => this.normalizeEditionGenre(item));
        return { items, source: 'open_library' };
      }
      this.logger.debug(`Open Library returned 0 hits for "${query}"`);
    } catch (err) {
      this.logger.warn(
        `Open Library failed for "${query}": ${err instanceof Error ? err.message : err}`,
      );
    }

    try {
      const gbItems = await this.googleBooks.search(query, limit);
      if (gbItems.length > 0) {
        return {
          items: gbItems.map((item) => this.normalizeEditionGenre(item)),
          source: 'google_books',
        };
      }
    } catch (err) {
      this.logger.warn(
        `Google Books fallback failed for "${query}": ${err instanceof Error ? err.message : err}`,
      );
    }

    return { items: [], source: 'none' };
  }

  async lookupByIsbn(isbn: string): Promise<CatalogIsbnLookupResult | null> {
    const normalized = isbn.replace(/-/g, '').trim();
    if (!normalized) {
      return null;
    }

    const query = `isbn:${normalized}`;
    const [olEdition, gbEdition] = await Promise.all([
      this.searchProvider(this.openLibrary, query),
      this.searchProvider(this.googleBooks, query),
    ]);

    if (!olEdition && !gbEdition) {
      return null;
    }

    return this.mergeProviderLookups(olEdition, gbEdition);
  }

  async lookupByTitleAuthor(
    title: string,
    authors: string,
  ): Promise<CatalogIsbnLookupResult | null> {
    const trimmedTitle = title.trim();
    const trimmedAuthors = authors.trim();
    if (!trimmedTitle || !trimmedAuthors) {
      return null;
    }

    const query = `${trimmedTitle} ${trimmedAuthors}`;
    const [olEdition, gbEdition] = await Promise.all([
      this.searchProvider(this.openLibrary, query),
      this.searchProvider(this.googleBooks, query),
    ]);

    return this.mergeProviderLookups(olEdition, gbEdition);
  }

  async resolveMissingGenre(
    edition: Pick<
      CatalogEditionDto,
      | 'genre'
      | 'isbn_13'
      | 'isbn_10'
      | 'data_source'
      | 'external_provider_id'
    >,
  ): Promise<string | null> {
    const enriched = await this.fillMissingGenre({
      title: '',
      authors: '',
      cover_image_url: null,
      page_count: null,
      ...edition,
    });
    return this.genreNormalizer.normalize(enriched.genre);
  }

  /** @deprecated Use resolveMissingGenre */
  async resolveMissingGenreFromGoogleBooks(
    edition: Pick<
      CatalogEditionDto,
      'genre' | 'isbn_13' | 'isbn_10' | 'data_source'
    >,
  ): Promise<string | null> {
    return this.resolveMissingGenre({
      ...edition,
      external_provider_id: '',
    });
  }

  private async mergeProviderLookups(
    olEdition: CatalogEditionDto | null,
    gbEdition: CatalogEditionDto | null,
  ): Promise<CatalogIsbnLookupResult | null> {
    if (!olEdition && !gbEdition) {
      return null;
    }

    let genre = this.genreNormalizer.normalize(gbEdition?.genre ?? olEdition?.genre);
    if (!genre && olEdition) {
      const enriched = await this.fillMissingGenre(olEdition);
      genre = this.genreNormalizer.normalize(enriched.genre);
    }

    return {
      cover_image_url:
        olEdition?.cover_image_url ?? gbEdition?.cover_image_url ?? null,
      genre,
    };
  }

  private async fillMissingGenre(
    edition: CatalogEditionDto,
  ): Promise<CatalogEditionDto> {
    const afterGoogleBooks = await this.fillGenreFromGoogleBooksIfMissing(edition);
    if (afterGoogleBooks.genre || afterGoogleBooks.data_source !== 'open_library') {
      return afterGoogleBooks;
    }

    if (!afterGoogleBooks.external_provider_id) {
      return afterGoogleBooks;
    }

    const genre = await this.lookupGenreFromOpenLibraryWork(
      afterGoogleBooks.external_provider_id,
    );
    if (!genre) {
      return afterGoogleBooks;
    }

    return { ...afterGoogleBooks, genre };
  }

  private normalizeEditionGenre(edition: CatalogEditionDto): CatalogEditionDto {
    return edition;
  }

  private async fillGenreFromGoogleBooksIfMissing(
    edition: CatalogEditionDto,
  ): Promise<CatalogEditionDto> {
    if (edition.data_source === 'google_books' || edition.genre) {
      return edition;
    }

    const isbn = edition.isbn_13 ?? edition.isbn_10;
    if (!isbn) {
      return edition;
    }

    const genre = await this.lookupGenreFromGoogleBooks(isbn);
    if (!genre) {
      return edition;
    }

    return { ...edition, genre };
  }

  private async lookupGenreFromGoogleBooks(isbn: string): Promise<string | null> {
    try {
      return await retryWithBackoff(
        async () => {
          const lookup = this.googleBooks.lookupGenreByIsbn(isbn);
          const timeout = new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), GENRE_LOOKUP_TIMEOUT_MS);
          });
          const genre = await Promise.race([lookup, timeout]);
          return genre ?? null;
        },
        CATALOG_SEARCH_RETRY,
      );
    } catch (err) {
      this.logger.warn(
        `Google Books genre lookup failed for ISBN "${isbn}": ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }

  private async lookupGenreFromOpenLibraryWork(
    externalProviderId: string,
  ): Promise<string | null> {
    try {
      return await retryWithBackoff(
        async () => {
          const lookup =
            this.openLibraryEnrichment.lookupGenreFromProviderId(externalProviderId);
          const timeout = new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), GENRE_LOOKUP_TIMEOUT_MS);
          });
          const genre = await Promise.race([lookup, timeout]);
          return genre ?? null;
        },
        CATALOG_SEARCH_RETRY,
      );
    } catch (err) {
      this.logger.warn(
        `Open Library work genre lookup failed for "${externalProviderId}": ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }

  private async searchProvider(
    provider: { search: (query: string, limit: number) => Promise<CatalogEditionDto[]> },
    query: string,
  ): Promise<CatalogEditionDto | null> {
    try {
      const items = await retryWithBackoff(
        () => provider.search(query, 1),
        CATALOG_SEARCH_RETRY,
      );
      return items[0] ?? null;
    } catch (err) {
      this.logger.warn(
        `Catalog provider failed for "${query}": ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }
}
