import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CatalogEditionDto } from '../dto/catalog-edition.dto';
import { CatalogProvider } from './catalog-provider.interface';
import { isTransientCatalogError } from './catalog-error.util';

interface GoogleVolume {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    pageCount?: number;
    categories?: string[];
    industryIdentifiers?: { type?: string; identifier?: string }[];
    publishedDate?: string;
  };
}

@Injectable()
export class GoogleBooksClient implements CatalogProvider {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async search(query: string, limit: number): Promise<CatalogEditionDto[]> {
    const apiKey = this.config.get<string>('GOOGLE_BOOKS_API_KEY');
    const params: Record<string, string | number> = {
      q: query,
      maxResults: limit,
      printType: 'books',
    };
    if (apiKey) {
      params.key = apiKey;
    }

    const { data } = await firstValueFrom(
      this.http.get<{ items?: GoogleVolume[]; error?: { message?: string } }>(
        'https://www.googleapis.com/books/v1/volumes',
        { params },
      ),
    );

    if (data.error) {
      throw new Error(data.error.message ?? 'Google Books API error');
    }

    return (data.items ?? [])
      .filter((item) => item.id && item.volumeInfo?.title)
      .map((item) => this.mapVolume(item));
  }

  async getVolumeDetails(volumeId: string): Promise<CatalogEditionDto | null> {
    const apiKey = this.config.get<string>('GOOGLE_BOOKS_API_KEY');
    const params: Record<string, string> = {};
    if (apiKey) params.key = apiKey;

    try {
      const { data } = await firstValueFrom(
        this.http.get<GoogleVolume>(
          `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(volumeId)}`,
          { params },
        ),
      );
      if (!data.id || !data.volumeInfo?.title) return null;
      return this.mapVolume(data);
    } catch {
      return null;
    }
  }

  private mapVolume(item: GoogleVolume): CatalogEditionDto {
    const info = item.volumeInfo!;
    const ids = info.industryIdentifiers ?? [];
    const isbn13 =
      ids.find((i) => i.type === 'ISBN_13')?.identifier?.replace(/-/g, '') ??
      null;
    const isbn10 =
      ids.find((i) => i.type === 'ISBN_10')?.identifier?.replace(/-/g, '') ??
      null;
    return {
      title: info.title!,
      authors: (info.authors ?? ['Unknown']).join(', '),
      cover_image_url:
        info.imageLinks?.thumbnail?.replace('http:', 'https:') ??
        info.imageLinks?.smallThumbnail?.replace('http:', 'https:') ??
        null,
      page_count: info.pageCount ?? null,
      genre: this.pickCategory(info.categories),
      isbn_13: isbn13,
      isbn_10: isbn10,
      data_source: 'google_books',
      external_provider_id: item.id!,
    };
  }

  private pickCategory(categories?: string[]): string | null {
    if (!categories?.length) return null;
    const fiction = categories.find((c) => /fiction/i.test(c));
    return fiction ?? categories[0];
  }

  async lookupGenreByIsbn(isbn: string): Promise<string | null> {
    const normalized = isbn.replace(/-/g, '').trim();
    if (!normalized) {
      return null;
    }

    try {
      const items = await this.search(`isbn:${normalized}`, 1);
      return items[0]?.genre ?? null;
    } catch (err) {
      if (isTransientCatalogError(err)) {
        throw err;
      }
      return null;
    }
  }
}
