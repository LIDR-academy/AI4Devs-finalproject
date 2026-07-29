import { Injectable } from '@nestjs/common';
import {
  type CanonicalGenre,
  GENRE_NORMALIZATION_MAP,
} from './genre-normalizer.map';

@Injectable()
export class GenreNormalizerService {
  private readonly orderedRules: Array<[CanonicalGenre, string[]]> = [
    ['Ciencia ficción', GENRE_NORMALIZATION_MAP['Ciencia ficción']],
    ['Fantasía', GENRE_NORMALIZATION_MAP['Fantasía']],
    ['Thriller', GENRE_NORMALIZATION_MAP.Thriller],
    ['Romance', GENRE_NORMALIZATION_MAP.Romance],
    ['Histórica', GENRE_NORMALIZATION_MAP['Histórica']],
    ['No ficción', GENRE_NORMALIZATION_MAP['No ficción']],
    ['Ficción', GENRE_NORMALIZATION_MAP['Ficción']],
  ];

  normalize(rawGenre?: string | null): CanonicalGenre | null {
    if (!rawGenre) {
      return null;
    }

    const normalizedInput = this.normalizeText(rawGenre);
    if (!normalizedInput) {
      return null;
    }

    for (const [canonical, keywords] of this.orderedRules) {
      if (keywords.some((keyword) => normalizedInput.includes(this.normalizeText(keyword)))) {
        return canonical;
      }
    }

    return null;
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
