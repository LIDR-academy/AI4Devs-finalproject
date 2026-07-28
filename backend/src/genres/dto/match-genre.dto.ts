import { GenreMatchResult } from './genre-matcher.service';

import { IsArray, IsString, MaxLength, MinLength } from 'class-validator';

export class MatchGenreDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  raw_genre: string;
}

export class MatchGenresBatchDto {
  @IsArray()
  @IsString({ each: true })
  raw_genres: string[];
}

export class GenreMatchResponseDto {
  status: 'matched' | 'unresolved' | 'empty';
  raw_genre: string | null;
  genre_id?: string;
  genre_name?: string;
}

export class GenreMatchBatchResponseDto {
  results: GenreMatchResponseDto[];
}

export function toGenreMatchResponse(result: GenreMatchResult): GenreMatchResponseDto {
  if (result.status === 'matched') {
    return {
      status: 'matched',
      raw_genre: result.raw_genre,
      genre_id: result.genre_id,
      genre_name: result.genre_name,
    };
  }

  if (result.status === 'unresolved') {
    return {
      status: 'unresolved',
      raw_genre: result.raw_genre,
    };
  }

  return {
    status: 'empty',
    raw_genre: null,
  };
}
