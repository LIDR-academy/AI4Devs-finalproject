import { Genre } from '../entities/genre.entity';

export interface GenreResponseDto {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function toGenreResponse(genre: Genre): GenreResponseDto {
  return {
    id: genre.id,
    name: genre.name,
    is_default: genre.isDefault,
    created_at: genre.createdAt.toISOString(),
    updated_at: genre.updatedAt.toISOString(),
  };
}
