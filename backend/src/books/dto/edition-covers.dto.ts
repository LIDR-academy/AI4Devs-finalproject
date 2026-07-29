import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class EditionCoversQueryDto {
  @IsEnum(['open_library', 'google_books'])
  data_source: 'open_library' | 'google_books';

  @IsString()
  @MaxLength(256)
  external_provider_id: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  hint_cover_url?: string;
}

export class CoverOptionDto {
  id: string;
  url: string;
  label: string | null;
}

export class EditionCoversResponseDto {
  covers: CoverOptionDto[];
  default_cover_id: string | null;
}
