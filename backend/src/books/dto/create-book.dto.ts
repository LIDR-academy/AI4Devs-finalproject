import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { AudienceType } from '../entities/book.entity';
export class CreateBookDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  authors: string;

  @IsOptional()
  @IsString()
  isbn_13?: string | null;

  @IsOptional()
  @IsString()
  isbn_10?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  cover_image_url?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  page_count?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  genre_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  series_name?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(2100)
  publication_year?: number | null;

  @IsEnum(['open_library', 'google_books', 'goodreads', 'manual'])
  data_source: 'open_library' | 'google_books' | 'goodreads' | 'manual';

  @IsOptional()
  @IsString()
  @MaxLength(128)
  external_provider_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  notes?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsEnum(['young_adult', 'new_adult', 'adult'])
  audience?: AudienceType | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  audience_id?: string | null;
}
