import { BookMetadataResolver } from './book-metadata.resolver';
import type { CatalogEdition } from './entities/catalog-edition.entity';
import type { UserBookOverride } from './entities/user-book-override.entity';

describe('BookMetadataResolver', () => {
  const resolver = new BookMetadataResolver();

  const catalog = {
    id: 'ce-1',
    title: 'Catalog Title',
    authors: 'Catalog Author',
    isbn13: '9780000000000',
    isbn10: null,
    coverImageUrl: 'https://example.com/catalog.jpg',
    pageCount: 300,
    seriesName: 'Series',
    publicationYear: 2020,
    catalogGenre: 'Fiction',
    dataSource: 'open_library' as const,
    externalProviderId: 'OL123',
  } satisfies Partial<CatalogEdition> as CatalogEdition;

  it('returns catalog values when no override exists', () => {
    const effective = resolver.resolveEffective(catalog, null);
    expect(effective.title).toBe('Catalog Title');
    expect(effective.cover_image_url).toBe('https://example.com/catalog.jpg');
    expect(effective.has_overrides).toBe(false);
  });

  it('prefers override values over catalog', () => {
    const override = {
      overriddenFields: ['title', 'cover_image_url'],
      title: 'My Title',
      authors: null,
      coverImageUrl: 'https://example.com/mine.jpg',
      pageCount: null,
      seriesName: null,
      publicationYear: null,
    } satisfies Partial<UserBookOverride> as UserBookOverride;

    const effective = resolver.resolveEffective(catalog, override);
    expect(effective.title).toBe('My Title');
    expect(effective.authors).toBe('Catalog Author');
    expect(effective.cover_image_url).toBe('https://example.com/mine.jpg');
    expect(effective.has_overrides).toBe(true);
  });

  it('supports explicit null cover override', () => {
    const override = {
      overriddenFields: ['cover_image_url'],
      title: null,
      authors: null,
      coverImageUrl: null,
      pageCount: null,
      seriesName: null,
      publicationYear: null,
    } satisfies Partial<UserBookOverride> as UserBookOverride;

    const effective = resolver.resolveEffective(catalog, override);
    expect(effective.cover_image_url).toBeNull();
  });

  it('revert-on-match: non-overridden field uses catalog even if override row exists for other fields', () => {
    const override = {
      overriddenFields: ['title'],
      title: 'Catalog Title',
      authors: null,
      coverImageUrl: null,
      pageCount: null,
      seriesName: null,
      publicationYear: null,
    } satisfies Partial<UserBookOverride> as UserBookOverride;

    const effective = resolver.resolveEffective(catalog, override);
    expect(effective.title).toBe('Catalog Title');
    expect(effective.cover_image_url).toBe('https://example.com/catalog.jpg');
  });
});
