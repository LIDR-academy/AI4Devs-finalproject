import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CoverOptionDto } from '../dto/edition-covers.dto';
import { normalizeCoverUrl } from './cover-utils';

const SIZE_LABELS: Record<string, string> = {
  smallThumbnail: 'Miniatura',
  thumbnail: 'Pequeña',
  small: 'Mediana (S)',
  medium: 'Mediana',
  large: 'Grande',
  extraLarge: 'Extra grande',
};

@Injectable()
export class GoogleBooksCoversService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getCovers(volumeId: string): Promise<CoverOptionDto[]> {
    const apiKey = this.config.get<string>('GOOGLE_BOOKS_API_KEY');
    const params: Record<string, string> = {};
    if (apiKey) params.key = apiKey;

    const { data } = await firstValueFrom(
      this.http.get<{
        id?: string;
        volumeInfo?: { imageLinks?: Record<string, string> };
        error?: { message?: string };
      }>(`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(volumeId)}`, {
        params,
      }),
    );

    if (data.error) {
      throw new Error(data.error.message ?? 'Google Books API error');
    }

    const links = data.volumeInfo?.imageLinks ?? {};
    const covers: CoverOptionDto[] = [];
    let index = 0;

    for (const [size, url] of Object.entries(links)) {
      if (!url) continue;
      const normalized = normalizeCoverUrl(url);
      covers.push({
        id: `${volumeId}-${size}`,
        url: normalized,
        label: SIZE_LABELS[size] ?? size,
      });
      index += 1;
    }

    if (covers.length === 0 && data.id) {
      return [];
    }

    return covers;
  }
}
