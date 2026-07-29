import { Injectable } from '@nestjs/common';
import { CatalogService } from '../../books/catalog/catalog.service';
import { CatalogRateLimiter } from '../../books/catalog/catalog-rate-limiter.service';
import { GenresService } from '../../genres/genres.service';
import { parseGoodreadsCsv } from './goodreads-csv.parser';
import type { GoodreadsMappedRow } from './goodreads-import.types';

export interface UnresolvedImportGenre {
  raw_genre: string;
  book_count: number;
}

export interface GoodreadsImportPreviewResult {
  unresolved_genres: UnresolvedImportGenre[];
  meta: {
    mapped_rows: number;
    warnings: number;
  };
}

@Injectable()
export class GoodreadsGenrePreviewService {
  constructor(
    private readonly catalog: CatalogService,
    private readonly rateLimiter: CatalogRateLimiter,
    private readonly genresService: GenresService,
  ) {}

  async preview(userId: string, csvContent: string): Promise<GoodreadsImportPreviewResult> {
    const parsed = parseGoodreadsCsv(csvContent);
    const counts = new Map<string, number>();

    for (const row of parsed.mapped_rows) {
      const rawGenre = await this.lookupCatalogGenre(row);
      const match = await this.genresService.matchRawGenre(userId, rawGenre);
      if (match.status === 'unresolved') {
        counts.set(match.raw_genre, (counts.get(match.raw_genre) ?? 0) + 1);
      }
    }

    return {
      unresolved_genres: [...counts.entries()]
        .map(([raw_genre, book_count]) => ({ raw_genre, book_count }))
        .sort((left, right) => left.raw_genre.localeCompare(right.raw_genre, 'es')),
      meta: {
        mapped_rows: parsed.mapped_rows.length,
        warnings: parsed.mapping_warnings.length,
      },
    };
  }

  private async lookupCatalogGenre(row: GoodreadsMappedRow): Promise<string | null> {
    const isbn = row.book.isbn13 ?? row.book.isbn10;
    try {
      if (isbn) {
        await this.rateLimiter.throttle();
        const lookup = await this.catalog.lookupByIsbn(isbn);
        if (lookup?.genre) {
          return lookup.genre;
        }
      }

      if (row.book.title.trim() && row.book.authors.trim()) {
        await this.rateLimiter.throttle();
        const lookup = await this.catalog.lookupByTitleAuthor(
          row.book.title,
          row.book.authors,
        );
        return lookup?.genre ?? null;
      }
    } catch {
      return null;
    }

    return null;
  }
}
