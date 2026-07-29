import { Injectable } from '@nestjs/common';
import {
  type CanonicalGenre,
  GENRE_NORMALIZATION_MAP,
} from '../books/genre-normalizer.map';

export type UserGenreRef = {
  id: string;
  name: string;
};

export type GenreMatchStatus = 'matched' | 'unresolved' | 'empty';

export type GenreMatchResult =
  | { status: 'matched'; genre_id: string; genre_name: string; raw_genre: string }
  | { status: 'unresolved'; raw_genre: string }
  | { status: 'empty'; raw_genre: null };

@Injectable()
export class GenreMatcherService {
  private readonly orderedCanonicals: CanonicalGenre[] = [
    'Ciencia ficción',
    'Fantasía',
    'Thriller',
    'Romance',
    'Histórica',
    'Ficción',
    'No ficción',
  ];

  match(rawGenre: string | null | undefined, userGenres: UserGenreRef[]): GenreMatchResult {
    const trimmed = rawGenre?.trim();
    if (!trimmed) {
      return { status: 'empty', raw_genre: null };
    }

    const normalizedInput = this.normalizeText(trimmed);
    if (!normalizedInput) {
      return { status: 'empty', raw_genre: null };
    }

    for (const genre of userGenres) {
      if (this.normalizeText(genre.name) === normalizedInput) {
        return {
          status: 'matched',
          genre_id: genre.id,
          genre_name: genre.name,
          raw_genre: trimmed,
        };
      }
    }

    const keywordRules = this.buildKeywordRules(userGenres);
    for (const rule of keywordRules) {
      if (
        rule.keywords.some((keyword) =>
          normalizedInput.includes(this.normalizeText(keyword)),
        )
      ) {
        return {
          status: 'matched',
          genre_id: rule.genre.id,
          genre_name: rule.genre.name,
          raw_genre: trimmed,
        };
      }
    }

    return { status: 'unresolved', raw_genre: trimmed };
  }

  matchMany(
    rawGenres: Array<string | null | undefined>,
    userGenres: UserGenreRef[],
  ): GenreMatchResult[] {
    const cache = new Map<string, GenreMatchResult>();

    return rawGenres.map((raw) => {
      const key = raw?.trim() ?? '';
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      const result = this.match(raw, userGenres);
      cache.set(key, result);
      return result;
    });
  }

  private buildKeywordRules(
    userGenres: UserGenreRef[],
  ): Array<{ genre: UserGenreRef; keywords: string[] }> {
    const rules: Array<{ genre: UserGenreRef; keywords: string[] }> = [];

    for (const genre of userGenres) {
      const normalizedName = this.normalizeText(genre.name);
      for (const canonical of this.orderedCanonicals) {
        if (this.normalizeText(canonical) !== normalizedName) {
          continue;
        }
        rules.push({
          genre,
          keywords: GENRE_NORMALIZATION_MAP[canonical],
        });
        break;
      }
    }

    return rules.sort(
      (left, right) =>
        this.longestKeywordLength(right.keywords) -
        this.longestKeywordLength(left.keywords),
    );
  }

  private longestKeywordLength(keywords: string[]): number {
    return keywords.reduce(
      (max, keyword) => Math.max(max, this.normalizeText(keyword).length),
      0,
    );
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
