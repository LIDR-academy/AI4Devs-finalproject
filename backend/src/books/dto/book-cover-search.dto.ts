import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import type { CatalogSource } from './catalog-edition.dto';
import { CoverOptionDto } from './edition-covers.dto';

export class BookCoverSearchQueryDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  q?: string;
}

export class BookCoverSearchEditionDto {
  title: string;
  authors: string;
  data_source: 'open_library' | 'google_books';
  external_provider_id: string;
  cover_image_url: string | null;
  covers: CoverOptionDto[];
  default_cover_id: string | null;
}

export class BookCoverSearchResponseDto {
  query: string;
  source: CatalogSource;
  items: BookCoverSearchEditionDto[];
}
