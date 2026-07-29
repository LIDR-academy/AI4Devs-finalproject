import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookMetadataResolver } from '../../books/book-metadata.resolver';
import { CatalogService } from '../../books/catalog/catalog.service';
import { CatalogEditionsService } from '../../books/catalog/catalog-editions.service';
import type { CatalogIsbnLookupResult } from '../../books/catalog/catalog-isbn-lookup.types';
import { CatalogRateLimiter } from '../../books/catalog/catalog-rate-limiter.service';
import { Book } from '../../books/entities/book.entity';
import { GenresService } from '../../genres/genres.service';
import type { GenreResolutionMap } from '../../genres/genre-resolution.types';

export interface ImportEnrichmentResult {
  book: Book;
  enrichment_failed: boolean;
}

export interface ReenrichPendingSummary {
  processed: number;
  enriched: number;
  still_failed: number;
}

const BOOK_ENRICHMENT_RELATIONS = [
  'catalogEdition',
  'override',
  'genreRef',
] as const;

@Injectable()
export class ImportCatalogEnrichmentService {
  private readonly logger = new Logger(ImportCatalogEnrichmentService.name);

  constructor(
    private readonly catalog: CatalogService,
    private readonly catalogEditions: CatalogEditionsService,
    private readonly rateLimiter: CatalogRateLimiter,
    private readonly genresService: GenresService,
    private readonly metadataResolver: BookMetadataResolver,
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
  ) {}

  async enrichBook(
    book: Book,
    genreResolutions: GenreResolutionMap = {},
  ): Promise<ImportEnrichmentResult> {
    const loaded = await this.loadBook(book.id);
    if (!loaded?.catalogEdition) {
      return { book: loaded ?? book, enrichment_failed: false };
    }

    const effective = this.metadataResolver.resolveEffective(
      loaded.catalogEdition,
      loaded.override,
    );

    if (effective.cover_image_url && loaded.genreId) {
      return { book: loaded, enrichment_failed: false };
    }

    const isbn = effective.isbn_13 ?? effective.isbn_10;
    let attempted = false;

    try {
      let lookup: CatalogIsbnLookupResult | null = null;

      if (isbn) {
        attempted = true;
        await this.rateLimiter.throttle();
        lookup = await this.catalog.lookupByIsbn(isbn);
      }

      const missingGenre = !loaded.genreId && !lookup?.genre;
      const missingCover = !effective.cover_image_url && !lookup?.cover_image_url;
      const canSearchByTitle = Boolean(
        effective.title.trim() && effective.authors.trim(),
      );

      if ((missingGenre || missingCover) && canSearchByTitle) {
        const localSibling = await this.catalogEditions.findBestByTitleAuthor(
          effective.title,
          effective.authors,
        );
        if (localSibling?.coverImageUrl || localSibling?.catalogGenre) {
          lookup = this.mergeLookups(lookup, {
            cover_image_url: localSibling.coverImageUrl,
            genre: localSibling.catalogGenre,
          });
        }
      }

      const stillMissingGenre = !loaded.genreId && !lookup?.genre;
      const stillMissingCover =
        !effective.cover_image_url && !lookup?.cover_image_url;

      if ((stillMissingGenre || stillMissingCover) && canSearchByTitle) {
        attempted = true;
        await this.rateLimiter.throttle();
        const byTitle = await this.catalog.lookupByTitleAuthor(
          effective.title,
          effective.authors,
        );
        lookup = this.mergeLookups(lookup, byTitle);
      }

      if (!lookup) {
        return { book: loaded, enrichment_failed: attempted };
      }

      let changed = false;

      if (!effective.cover_image_url && lookup.cover_image_url) {
        await this.catalogEditions.upsert({
          title: loaded.catalogEdition.title,
          authors: loaded.catalogEdition.authors,
          isbn_13: loaded.catalogEdition.isbn13,
          isbn_10: loaded.catalogEdition.isbn10,
          cover_image_url: lookup.cover_image_url,
          page_count: loaded.catalogEdition.pageCount,
          series_name: loaded.catalogEdition.seriesName,
          publication_year: loaded.catalogEdition.publicationYear,
          catalog_genre: lookup.genre ?? loaded.catalogEdition.catalogGenre,
          data_source: loaded.catalogEdition.dataSource,
          external_provider_id: loaded.catalogEdition.externalProviderId,
        });
        changed = true;
      }

      if (!loaded.genreId && lookup.genre) {
        const genreId = await this.genresService.resolveImportedGenre(
          loaded.userId,
          lookup.genre,
          genreResolutions,
        );
        if (genreId) {
          const genre = await this.genresService.findOwnedById(
            loaded.userId,
            genreId,
          );
          if (genre) {
            loaded.genreId = genre.id;
            loaded.genreRef = genre;
            changed = true;
          }
        }
      }

      if (changed) {
        const saved = await this.booksRepo.save(loaded);
        const reloaded = await this.loadBook(saved.id);
        return { book: reloaded ?? saved, enrichment_failed: false };
      }

      return { book: loaded, enrichment_failed: false };
    } catch (err) {
      this.logger.warn(
        `Catalog enrichment failed for book ${book.id}: ${err instanceof Error ? err.message : err}`,
      );
      return { book: loaded, enrichment_failed: attempted };
    }
  }

  private async loadBook(bookId: string): Promise<Book | null> {
    return this.booksRepo.findOne({
      where: { id: bookId },
      relations: [...BOOK_ENRICHMENT_RELATIONS],
    });
  }

  private mergeLookups(
    primary: CatalogIsbnLookupResult | null,
    secondary: CatalogIsbnLookupResult | null,
  ): CatalogIsbnLookupResult | null {
    if (!primary) {
      return secondary;
    }
    if (!secondary) {
      return primary;
    }

    return {
      cover_image_url: primary.cover_image_url ?? secondary.cover_image_url,
      genre: primary.genre ?? secondary.genre,
    };
  }

  async reenrichIncompleteBooks(userId: string): Promise<ReenrichPendingSummary> {
    const books = await this.booksRepo.find({
      where: { userId },
      relations: [...BOOK_ENRICHMENT_RELATIONS],
      order: { createdAt: 'ASC' },
    });

    const pending = books.filter((book) => {
      if (!book.catalogEdition) {
        return true;
      }
      const effective = this.metadataResolver.resolveEffective(
        book.catalogEdition,
        book.override,
      );
      return !effective.cover_image_url || !book.genreId;
    });

    let enriched = 0;
    let still_failed = 0;

    for (const book of pending) {
      const effective = book.catalogEdition
        ? this.metadataResolver.resolveEffective(book.catalogEdition, book.override)
        : null;
      const missingCover = !effective?.cover_image_url;
      const missingGenre = !book.genreId;
      const result = await this.enrichBook(book);
      if (result.enrichment_failed) {
        still_failed += 1;
      } else {
        const reloaded = await this.loadBook(result.book.id);
        const afterEffective = reloaded?.catalogEdition
          ? this.metadataResolver.resolveEffective(
              reloaded.catalogEdition,
              reloaded.override,
            )
          : null;
        if (
          (missingCover && afterEffective?.cover_image_url) ||
          (missingGenre && reloaded?.genreId)
        ) {
          enriched += 1;
        }
      }
    }

    return {
      processed: pending.length,
      enriched,
      still_failed,
    };
  }
}
