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

export class PatchBookDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  authors?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsUrl()
  @MaxLength(2048)
  cover_image_url?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  @Min(0)
  page_count?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  genre_id?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(255)
  series_name?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  @Min(1000)
  @Max(2100)
  publication_year?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsEnum(['young_adult', 'new_adult', 'adult'])
  audience?: AudienceType | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  audience_id?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(10000)
  notes?: string | null;
}
