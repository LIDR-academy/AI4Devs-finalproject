import { Injectable } from '@nestjs/common';
import type { BookDto } from './dto/book-response.dto';
import { Book } from './entities/book.entity';
import { CatalogEdition } from './entities/catalog-edition.entity';
import {
  OverridableBookField,
  UserBookOverride,
} from './entities/user-book-override.entity';

export interface EffectiveBookMetadata {
  title: string;
  authors: string;
  isbn_13: string | null;
  isbn_10: string | null;
  cover_image_url: string | null;
  page_count: number | null;
  series_name: string | null;
  publication_year: number | null;
  data_source: CatalogEdition['dataSource'];
  external_provider_id: string | null;
  has_overrides: boolean;
}

@Injectable()
export class BookMetadataResolver {
  resolveEffective(
    catalog: CatalogEdition,
    override?: UserBookOverride | null,
  ): EffectiveBookMetadata {
    return {
      title: this.effectiveField(catalog, override, 'title', catalog.title),
      authors: this.effectiveField(catalog, override, 'authors', catalog.authors),
      isbn_13: catalog.isbn13,
      isbn_10: catalog.isbn10,
      cover_image_url: this.effectiveField(
        catalog,
        override,
        'cover_image_url',
        catalog.coverImageUrl,
      ),
      page_count: this.effectiveField(
        catalog,
        override,
        'page_count',
        catalog.pageCount,
      ),
      series_name: this.effectiveField(
        catalog,
        override,
        'series_name',
        catalog.seriesName,
      ),
      publication_year: this.effectiveField(
        catalog,
        override,
        'publication_year',
        catalog.publicationYear,
      ),
      data_source: catalog.dataSource,
      external_provider_id: catalog.externalProviderId,
      has_overrides: (override?.overriddenFields?.length ?? 0) > 0,
    };
  }

  toBookDto(
    book: Book,
    catalog: CatalogEdition,
    override?: UserBookOverride | null,
  ): BookDto {
    const effective = this.resolveEffective(catalog, override);
    return {
      id: book.id,
      user_id: book.userId,
      catalog_edition_id: catalog.id,
      ...effective,
      genre: book.genreRef?.name ?? null,
      genre_id: book.genreId,
      notes: book.notes,
      audience: book.audience,
      audience_id: book.audienceId,
      created_at: book.createdAt.toISOString(),
      updated_at: book.updatedAt.toISOString(),
    };
  }

  isFieldOverridden(
    override: UserBookOverride | null | undefined,
    field: OverridableBookField,
  ): boolean {
    return override?.overriddenFields?.includes(field) ?? false;
  }

  effectiveField<T>(
    _catalog: CatalogEdition,
    override: UserBookOverride | null | undefined,
    field: OverridableBookField,
    catalogValue: T,
  ): T {
    if (!this.isFieldOverridden(override, field)) {
      return catalogValue;
    }
    const overrideValue = this.readOverrideValue(override!, field);
    return (overrideValue ?? null) as T;
  }

  readOverrideValue(
    override: UserBookOverride,
    field: OverridableBookField,
  ): string | number | null {
    switch (field) {
      case 'title':
        return override.title;
      case 'authors':
        return override.authors;
      case 'cover_image_url':
        return override.coverImageUrl;
      case 'page_count':
        return override.pageCount;
      case 'series_name':
        return override.seriesName;
      case 'publication_year':
        return override.publicationYear;
      default:
        return null;
    }
  }

  static effectiveSql(
    field: OverridableBookField,
    catalogColumn: string,
    overrideAlias = 'ubo',
    catalogAlias = 'ce',
    dialect: 'postgres' | 'sqlite' = 'postgres',
  ): string {
    const isOverridden =
      dialect === 'postgres'
        ? `${overrideAlias}.overridden_fields::jsonb ? '${field}'`
        : `instr(${overrideAlias}.overridden_fields, '"${field}"') > 0`;
    return `CASE WHEN ${isOverridden} THEN ${overrideAlias}.${catalogColumn} ELSE ${catalogAlias}.${catalogColumn} END`;
  }
}
