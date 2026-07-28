import { CatalogService } from './catalog.service';
import { CatalogEditionDto } from '../dto/catalog-edition.dto';

describe('CatalogService', () => {
  const olEdition: CatalogEditionDto = {
    title: 'Test',
    authors: 'Author',
    cover_image_url: null,
    page_count: 100,
    genre: 'Fiction',
    isbn_13: '9780618640157',
    isbn_10: null,
    data_source: 'open_library',
    external_provider_id: '/works/OL1W',
  };

  let openLibrary: { search: jest.Mock };
  let googleBooks: { search: jest.Mock; lookupGenreByIsbn: jest.Mock };
  let openLibraryEnrichment: { lookupGenreFromProviderId: jest.Mock };
  let genreNormalizer: { normalize: jest.Mock };
  let catalogEditions: {
    searchLocal: jest.Mock;
    toCatalogEditionDto: jest.Mock;
    upsertFromCatalogEdition: jest.Mock;
    findByIsbn: jest.Mock;
    findBestByTitleAuthor: jest.Mock;
    upsert: jest.Mock;
  };
  let service: CatalogService;

  beforeEach(() => {
    openLibrary = { search: jest.fn() };
    googleBooks = { search: jest.fn(), lookupGenreByIsbn: jest.fn() };
    openLibraryEnrichment = { lookupGenreFromProviderId: jest.fn() };
    genreNormalizer = {
      normalize: jest
        .fn()
        .mockImplementation((value: string | null | undefined) => value ?? null),
    };
    catalogEditions = {
      searchLocal: jest.fn().mockResolvedValue([]),
      toCatalogEditionDto: jest.fn((edition) => ({
        title: edition.title ?? olEdition.title,
        authors: edition.authors ?? olEdition.authors,
        cover_image_url: edition.coverImageUrl ?? olEdition.cover_image_url,
        page_count: edition.pageCount ?? olEdition.page_count,
        genre: edition.catalogGenre ?? edition.genre ?? null,
        isbn_13: edition.isbn13 ?? olEdition.isbn_13,
        isbn_10: edition.isbn10 ?? olEdition.isbn_10,
        data_source: edition.dataSource === 'google_books' ? 'google_books' : 'open_library',
        external_provider_id: edition.externalProviderId ?? olEdition.external_provider_id,
        catalog_edition_id: edition.id ?? 'ce-1',
      })),
      upsertFromCatalogEdition: jest.fn().mockImplementation(async (edition) => ({
        id: 'ce-1',
        title: edition.title,
        authors: edition.authors,
        coverImageUrl: edition.cover_image_url,
        pageCount: edition.page_count,
        catalogGenre: edition.genre,
        isbn13: edition.isbn_13,
        isbn10: edition.isbn_10,
        dataSource: edition.data_source,
        externalProviderId: edition.external_provider_id,
      })),
      findByIsbn: jest.fn().mockResolvedValue(null),
      findBestByTitleAuthor: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({ id: 'ce-1' }),
    };
    service = new CatalogService(
      openLibrary as never,
      googleBooks as never,
      openLibraryEnrichment as never,
      genreNormalizer as never,
      catalogEditions as never,
    );
  });

  it('returns Open Library results without Google Books genre lookup when genre exists', async () => {
    openLibrary.search.mockResolvedValue([olEdition]);

    const result = await service.search('le guin', 20);

    expect(result.source).toBe('open_library');
    expect(result.items).toHaveLength(1);
    expect(googleBooks.search).not.toHaveBeenCalled();
    expect(googleBooks.lookupGenreByIsbn).not.toHaveBeenCalled();
    expect(result.items[0]?.genre).toBe('Fiction');
  });

  it('fills genre from Google Books when Open Library search omits subject', async () => {
    openLibrary.search.mockResolvedValue([
      { ...olEdition, genre: null },
    ]);
    googleBooks.lookupGenreByIsbn.mockResolvedValue('Science Fiction');

    const result = await service.search('le guin', 20);

    expect(googleBooks.lookupGenreByIsbn).toHaveBeenCalledWith('9780618640157');
    expect(result.items[0]?.genre).toBe('Science Fiction');
  });

  it('keeps genre null when Google Books genre lookup misses', async () => {
    openLibrary.search.mockResolvedValue([
      { ...olEdition, genre: null },
    ]);
    googleBooks.lookupGenreByIsbn.mockResolvedValue(null);
    openLibraryEnrichment.lookupGenreFromProviderId.mockResolvedValue(null);

    const result = await service.search('le guin', 20);

    expect(googleBooks.lookupGenreByIsbn).toHaveBeenCalledWith('9780618640157');
    expect(openLibraryEnrichment.lookupGenreFromProviderId).toHaveBeenCalledWith(
      '/works/OL1W',
    );
    expect(result.items[0]?.genre).toBeNull();
  });

  it('fills genre from Open Library work when Google Books misses', async () => {
    openLibrary.search.mockResolvedValue([
      { ...olEdition, genre: null },
    ]);
    googleBooks.lookupGenreByIsbn.mockResolvedValue(null);
    openLibraryEnrichment.lookupGenreFromProviderId.mockResolvedValue(
      'Science fiction',
    );

    const result = await service.search('le guin', 20);

    expect(googleBooks.lookupGenreByIsbn).toHaveBeenCalledWith('9780618640157');
    expect(openLibraryEnrichment.lookupGenreFromProviderId).toHaveBeenCalledWith(
      '/works/OL1W',
    );
    expect(result.items[0]?.genre).toBe('Science fiction');
  });

  it('does not call Open Library work lookup when Google Books fills genre', async () => {
    openLibrary.search.mockResolvedValue([
      { ...olEdition, genre: null },
    ]);
    googleBooks.lookupGenreByIsbn.mockResolvedValue('Fantasy');

    const result = await service.search('le guin', 20);

    expect(openLibraryEnrichment.lookupGenreFromProviderId).not.toHaveBeenCalled();
    expect(result.items[0]?.genre).toBe('Fantasy');
  });

  it('keeps raw genre from catalog providers', async () => {
    openLibrary.search.mockResolvedValue([{ ...olEdition, genre: 'Cooking' }]);

    const result = await service.search('cooking', 10);

    expect(result.items[0]?.genre).toBe('Cooking');
  });

  it('falls back to Google Books when Open Library is empty', async () => {
    openLibrary.search.mockResolvedValue([]);
    googleBooks.search.mockResolvedValue([
      { ...olEdition, data_source: 'google_books', external_provider_id: 'vol1' },
    ]);

    const result = await service.search('unknown', 20);

    expect(openLibrary.search).toHaveBeenCalledTimes(1);
    expect(googleBooks.search).toHaveBeenCalledTimes(1);
    expect(googleBooks.lookupGenreByIsbn).not.toHaveBeenCalled();
    expect(result.source).toBe('google_books');
    expect(result.items).toHaveLength(1);
  });

  it('falls back to Google Books when Open Library throws', async () => {
    openLibrary.search.mockRejectedValue(new Error('timeout'));
    googleBooks.search.mockResolvedValue([]);

    const result = await service.search('query', 10);

    expect(googleBooks.search).toHaveBeenCalledTimes(1);
    expect(result.source).toBe('none');
    expect(result.items).toEqual([]);
  });

  it('returns empty when both providers return no items', async () => {
    openLibrary.search.mockResolvedValue([]);
    googleBooks.search.mockResolvedValue([]);

    const result = await service.search('nothing', 20);

    expect(result.source).toBe('none');
    expect(result.items).toEqual([]);
  });

  describe('lookupByIsbn', () => {
    it('prefers Open Library cover and uses Google Books genre', async () => {
      openLibrary.search.mockResolvedValue([
        {
          ...olEdition,
          cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
        },
      ]);
      googleBooks.search.mockResolvedValue([
        {
          ...olEdition,
          data_source: 'google_books',
          external_provider_id: 'vol1',
          genre: 'Science Fiction',
          cover_image_url: 'https://books.google.com/cover.jpg',
        },
      ]);

      const result = await service.lookupByIsbn('978-0618640157');

      expect(openLibrary.search).toHaveBeenCalledWith('isbn:9780618640157', 1);
      expect(googleBooks.search).toHaveBeenCalledWith('isbn:9780618640157', 1);
      expect(result).toEqual({
        cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
        genre: 'Science Fiction',
      });
    });

    it('fills genre via Open Library work when Google Books misses', async () => {
      openLibrary.search.mockResolvedValue([
        {
          ...olEdition,
          genre: null,
          cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
        },
      ]);
      googleBooks.search.mockResolvedValue([]);
      googleBooks.lookupGenreByIsbn.mockResolvedValue(null);
      openLibraryEnrichment.lookupGenreFromProviderId.mockResolvedValue(
        'Historical fiction',
      );

      const result = await service.lookupByIsbn('9780618640157');

      expect(googleBooks.lookupGenreByIsbn).toHaveBeenCalledWith('9780618640157');
      expect(openLibraryEnrichment.lookupGenreFromProviderId).toHaveBeenCalledWith(
        '/works/OL1W',
      );
      expect(result).toEqual({
        cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
        genre: 'Historical fiction',
      });
    });

    it('fills genre via Google Books when Open Library has no subject', async () => {
      openLibrary.search.mockResolvedValue([
        {
          ...olEdition,
          genre: null,
          cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
        },
      ]);
      googleBooks.search.mockResolvedValue([]);
      googleBooks.lookupGenreByIsbn.mockResolvedValue('Fantasy');

      const result = await service.lookupByIsbn('9780618640157');

      expect(googleBooks.lookupGenreByIsbn).toHaveBeenCalledWith('9780618640157');
      expect(result).toEqual({
        cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
        genre: 'Fantasy',
      });
    });

    it('falls back to Google Books cover when Open Library has none', async () => {
      openLibrary.search.mockResolvedValue([
        { ...olEdition, cover_image_url: null },
      ]);
      googleBooks.search.mockResolvedValue([
        {
          ...olEdition,
          data_source: 'google_books',
          external_provider_id: 'vol1',
          cover_image_url: 'https://books.google.com/cover.jpg',
        },
      ]);

      const result = await service.lookupByIsbn('0618640150');

      expect(result?.cover_image_url).toBe('https://books.google.com/cover.jpg');
    });

    it('returns null when both providers miss', async () => {
      openLibrary.search.mockResolvedValue([]);
      googleBooks.search.mockResolvedValue([]);

      const result = await service.lookupByIsbn('0000000000');

      expect(result).toBeNull();
    });

    it('returns null for blank ISBN', async () => {
      const result = await service.lookupByIsbn('  ');

      expect(result).toBeNull();
      expect(openLibrary.search).not.toHaveBeenCalled();
    });
  });

  describe('lookupByTitleAuthor', () => {
    it('returns local catalog match before calling external providers', async () => {
      catalogEditions.findBestByTitleAuthor.mockResolvedValue({
        id: 'ce-seed',
        title: 'Hamnet',
        authors: "Maggie O'Farrell",
        coverImageUrl: 'https://covers.openlibrary.org/b/id/10713474-L.jpg',
        catalogGenre: 'Fiction, historical',
      });
      genreNormalizer.normalize.mockReturnValue('Histórica');

      const result = await service.lookupByTitleAuthor(
        'Hamnet',
        "Maggie O'Farrell",
      );

      expect(catalogEditions.findBestByTitleAuthor).toHaveBeenCalledWith(
        'Hamnet',
        "Maggie O'Farrell",
      );
      expect(openLibrary.search).not.toHaveBeenCalled();
      expect(googleBooks.search).not.toHaveBeenCalled();
      expect(result).toEqual({
        cover_image_url: 'https://covers.openlibrary.org/b/id/10713474-L.jpg',
        genre: 'Histórica',
      });
    });

    it('queries both providers with title and author text', async () => {
      openLibrary.search.mockResolvedValue([
        {
          ...olEdition,
          cover_image_url: 'https://covers.openlibrary.org/b/id/3-L.jpg',
        },
      ]);
      googleBooks.search.mockResolvedValue([
        {
          ...olEdition,
          data_source: 'google_books',
          external_provider_id: 'vol2',
          genre: 'Fantasy',
        },
      ]);

      const result = await service.lookupByTitleAuthor(
        'The Hobbit',
        'J.R.R. Tolkien',
      );

      expect(openLibrary.search).toHaveBeenCalledWith(
        'The Hobbit J.R.R. Tolkien',
        1,
      );
      expect(googleBooks.search).toHaveBeenCalledWith(
        'The Hobbit J.R.R. Tolkien',
        1,
      );
      expect(result).toEqual({
        cover_image_url: 'https://covers.openlibrary.org/b/id/3-L.jpg',
        genre: 'Fantasy',
      });
    });

    it('returns null for blank title or author', async () => {
      expect(await service.lookupByTitleAuthor('  ', 'Author')).toBeNull();
      expect(await service.lookupByTitleAuthor('Title', '  ')).toBeNull();
      expect(openLibrary.search).not.toHaveBeenCalled();
    });
  });
});
