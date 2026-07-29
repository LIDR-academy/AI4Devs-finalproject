import { DataSourceType } from '../entities/book.entity';

export class CatalogEditionDto {
  title: string;
  authors: string;
  cover_image_url: string | null;
  page_count: number | null;
  genre: string | null;
  isbn_13: string | null;
  isbn_10: string | null;
  data_source: 'open_library' | 'google_books';
  external_provider_id: string;
  catalog_edition_id?: string;
}

export type CatalogSource = 'open_library' | 'google_books' | 'none';

export class CatalogSearchResponseDto {
  items: CatalogEditionDto[];
  source: CatalogSource;
}
