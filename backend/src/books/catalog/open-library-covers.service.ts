import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CoverOptionDto } from '../dto/edition-covers.dto';
import {
  openLibraryCoverUrl,
  openLibraryIsbnCoverUrl,
} from './cover-utils';

interface OlEditionEntry {
  key?: string;
  title?: string;
  covers?: number[];
  isbn_13?: string[];
  isbn_10?: string[];
  publish_date?: string;
}

interface OlEditionDetail {
  title?: string;
  covers?: number[];
  isbn_13?: string[];
  isbn_10?: string[];
  publish_date?: string;
}

@Injectable()
export class OpenLibraryCoversService {
  constructor(private readonly http: HttpService) {}

  async getCovers(externalProviderId: string): Promise<CoverOptionDto[]> {
    const key = externalProviderId.startsWith('/')
      ? externalProviderId
      : `/${externalProviderId}`;

    if (key.startsWith('/works/')) {
      return this.coversFromWork(key);
    }
    if (key.startsWith('/books/')) {
      return this.coversFromEdition(key);
    }
    return [];
  }

  private async coversFromWork(workKey: string): Promise<CoverOptionDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<{ entries?: OlEditionEntry[] }>(
        `https://openlibrary.org${workKey}/editions.json`,
        { params: { limit: 30 } },
      ),
    );

    const covers: CoverOptionDto[] = [];
    for (const entry of data.entries ?? []) {
      covers.push(...this.mapEditionEntry(entry));
    }
    return covers;
  }

  private async coversFromEdition(editionKey: string): Promise<CoverOptionDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<OlEditionDetail>(`https://openlibrary.org${editionKey}.json`),
    );
    return this.mapEditionDetail(data, editionKey);
  }

  private mapEditionEntry(entry: OlEditionEntry): CoverOptionDto[] {
    const label = entry.publish_date
      ? `Edición ${entry.publish_date}`
      : entry.title ?? null;
    const out: CoverOptionDto[] = [];

    for (const coverId of entry.covers ?? []) {
      out.push({
        id: String(coverId),
        url: openLibraryCoverUrl(coverId),
        label,
      });
    }

    const isbn = entry.isbn_13?.[0] ?? entry.isbn_10?.[0];
    if (isbn && out.length === 0) {
      out.push({
        id: `isbn-${isbn.replace(/-/g, '')}`,
        url: openLibraryIsbnCoverUrl(isbn),
        label,
      });
    }

    return out;
  }

  private mapEditionDetail(
    detail: OlEditionDetail,
    editionKey: string,
  ): CoverOptionDto[] {
    const label = detail.publish_date
      ? `Edición ${detail.publish_date}`
      : detail.title ?? editionKey;
    const out: CoverOptionDto[] = [];

    for (const coverId of detail.covers ?? []) {
      out.push({
        id: String(coverId),
        url: openLibraryCoverUrl(coverId),
        label,
      });
    }

    const isbn = detail.isbn_13?.[0] ?? detail.isbn_10?.[0];
    if (isbn) {
      out.push({
        id: `isbn-${isbn.replace(/-/g, '')}`,
        url: openLibraryIsbnCoverUrl(isbn),
        label,
      });
    }

    return out;
  }
}
