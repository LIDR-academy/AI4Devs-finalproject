import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogService } from '../../books/catalog/catalog.service';
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

@Injectable()
export class ImportCatalogEnrichmentService {
  private readonly logger = new Logger(ImportCatalogEnrichmentService.name);

  constructor(
    private readonly catalog: CatalogService,
    private readonly rateLimiter: CatalogRateLimiter,
    private readonly genresService: GenresService,
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
  ) {}

  async enrichBook(
    book: Book,
    genreResolutions: GenreResolutionMap = {},
  ): Promise<ImportEnrichmentResult> {
    if (book.coverImageUrl && book.genreId) {
      return { book, enrichment_failed: false };
    }

    const isbn = book.isbn13 ?? book.isbn10;
    let attempted = false;

    try {
      let lookup: CatalogIsbnLookupResult | null = null;

      if (isbn) {
        attempted = true;
        await this.rateLimiter.throttle();
        lookup = await this.catalog.lookupByIsbn(isbn);
      }

      const missingGenre = !book.genreId && !lookup?.genre;
      const missingCover = !book.coverImageUrl && !lookup?.cover_image_url;
      const canSearchByTitle = Boolean(book.title.trim() && book.authors.trim());

      if ((missingGenre || missingCover) && canSearchByTitle) {
        attempted = true;
        await this.rateLimiter.throttle();
        const byTitle = await this.catalog.lookupByTitleAuthor(
          book.title,
          book.authors,
        );
        lookup = this.mergeLookups(lookup, byTitle);
      }

      if (!lookup) {
        return { book, enrichment_failed: attempted };
      }

      let changed = false;

      if (!book.coverImageUrl && lookup.cover_image_url) {
        book.coverImageUrl = lookup.cover_image_url;
        changed = true;
      }

      if (!book.genreId && lookup.genre) {
        const genreId = await this.genresService.resolveImportedGenre(
          book.userId,
          lookup.genre,
          genreResolutions,
        );
        if (genreId) {
          const genre = await this.genresService.findOwnedById(
            book.userId,
            genreId,
          );
          if (genre) {
            book.genreId = genre.id;
            book.genreRef = genre;
            changed = true;
          }
        }
      }

      if (changed) {
        const saved = await this.booksRepo.save(book);
        return { book: saved, enrichment_failed: false };
      }

      return { book, enrichment_failed: false };
    } catch (err) {
      this.logger.warn(
        `Catalog enrichment failed for book ${book.id}: ${err instanceof Error ? err.message : err}`,
      );
      return { book, enrichment_failed: attempted };
    }
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
      order: { createdAt: 'ASC' },
    });

    const pending = books.filter((book) => !book.coverImageUrl || !book.genreId);
    let enriched = 0;
    let still_failed = 0;

    for (const book of pending) {
      const missingCover = !book.coverImageUrl;
      const missingGenre = !book.genreId;
      const result = await this.enrichBook(book);
      if (result.enrichment_failed) {
        still_failed += 1;
      } else if (
        (missingCover && result.book.coverImageUrl) ||
        (missingGenre && result.book.genreId)
      ) {
        enriched += 1;
      }
    }

    return {
      processed: pending.length,
      enriched,
      still_failed,
    };
  }
}
