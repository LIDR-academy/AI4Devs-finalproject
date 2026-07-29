import { BadRequestException, Injectable } from '@nestjs/common';
import {
  EditionCoversResponseDto,
} from '../dto/edition-covers.dto';
import { finalizeCovers } from './cover-utils';
import { GoogleBooksCoversService } from './google-books-covers.service';
import { OpenLibraryCoversService } from './open-library-covers.service';

@Injectable()
export class EditionCoversService {
  constructor(
    private readonly openLibraryCovers: OpenLibraryCoversService,
    private readonly googleBooksCovers: GoogleBooksCoversService,
  ) {}

  async getCovers(
    dataSource: 'open_library' | 'google_books',
    externalProviderId: string,
    hintCoverUrl?: string,
  ): Promise<EditionCoversResponseDto> {
    if (!externalProviderId?.trim()) {
      throw new BadRequestException('external_provider_id is required');
    }

    let raw: import('../dto/edition-covers.dto').CoverOptionDto[] = [];

    if (dataSource === 'open_library') {
      raw = await this.openLibraryCovers.getCovers(externalProviderId);
    } else if (dataSource === 'google_books') {
      raw = await this.googleBooksCovers.getCovers(externalProviderId);
    }

    if (hintCoverUrl?.trim()) {
      const hintNorm = hintCoverUrl.replace(/^http:/, 'https://');
      const already = raw.some((c) => c.url.replace(/^http:/, 'https://') === hintNorm);
      if (!already) {
        const idMatch = hintNorm.match(/\/b\/id\/(\d+)/);
        raw.unshift({
          id: idMatch?.[1] ?? `hint-${raw.length}`,
          url: hintNorm,
          label: 'Portada de búsqueda',
        });
      }
    }

    return finalizeCovers(raw, hintCoverUrl);
  }
}
