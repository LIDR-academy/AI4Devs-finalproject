import { ImportCatalogEnrichmentService } from './import-catalog-enrichment.service';
import { Book } from '../../books/entities/book.entity';
import { CatalogService } from '../../books/catalog/catalog.service';
import { CatalogRateLimiter } from '../../books/catalog/catalog-rate-limiter.service';
import { GenresService } from '../../genres/genres.service';
import { Repository } from 'typeorm';

describe('ImportCatalogEnrichmentService', () => {
  let catalog: jest.Mocked<
    Pick<CatalogService, 'lookupByIsbn' | 'lookupByTitleAuthor'>
  >;
  let rateLimiter: jest.Mocked<Pick<CatalogRateLimiter, 'throttle'>>;
  let genresService: jest.Mocked<Pick<GenresService, 'findOrCreateByName'>>;
  let booksRepo: jest.Mocked<Pick<Repository<Book>, 'save' | 'find'>>;
  let service: ImportCatalogEnrichmentService;

  const genreIdByName: Record<string, string> = {
    Fantasy: 'genre-fantasy',
    Fiction: 'genre-fiction',
    Romance: 'genre-romance',
    'New Genre': 'genre-new',
    Fantasía: 'genre-fantasia',
  };

  const baseBook = (): Book =>
    ({
      id: 'book-1',
      userId: 'user-1',
      title: 'The Hobbit',
      authors: 'J.R.R. Tolkien',
      isbn13: '9780618640157',
      isbn10: '0618640150',
      coverImageUrl: null,
      genreId: null,
      audience: null,
    }) as Book;

  beforeEach(() => {
    catalog = {
      lookupByIsbn: jest.fn(),
      lookupByTitleAuthor: jest.fn(),
    };
    rateLimiter = { throttle: jest.fn().mockResolvedValue(undefined) };
    genresService = {
      findOrCreateByName: jest.fn(async (_userId, name) => ({
        id: genreIdByName[name] ?? `genre-${name.toLowerCase()}`,
        name,
        userId: 'user-1',
        isDefault: false,
      })),
    };
    booksRepo = {
      save: jest.fn(async (book) => book),
      find: jest.fn(),
    };
    service = new ImportCatalogEnrichmentService(
      catalog as unknown as CatalogService,
      rateLimiter as unknown as CatalogRateLimiter,
      genresService as unknown as GenresService,
      booksRepo as unknown as Repository<Book>,
    );
  });

  it('fills missing cover and genre from ISBN catalog lookup', async () => {
    catalog.lookupByIsbn.mockResolvedValue({
      cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
      genre: 'Fantasy',
    });

    const result = await service.enrichBook(baseBook());

    expect(catalog.lookupByIsbn).toHaveBeenCalledWith('9780618640157');
    expect(catalog.lookupByTitleAuthor).not.toHaveBeenCalled();
    expect(booksRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        coverImageUrl: 'https://covers.openlibrary.org/b/id/1-L.jpg',
        genreId: 'genre-fantasy',
      }),
    );
    expect(result.enrichment_failed).toBe(false);
    expect(result.book.genreId).toBe('genre-fantasy');
  });

  it('uses title+author lookup when no ISBN is present', async () => {
    catalog.lookupByTitleAuthor.mockResolvedValue({
      cover_image_url: 'https://covers.openlibrary.org/b/id/2-L.jpg',
      genre: 'Fiction',
    });

    const book = {
      ...baseBook(),
      isbn13: null,
      isbn10: null,
    } as Book;

    const result = await service.enrichBook(book);

    expect(catalog.lookupByIsbn).not.toHaveBeenCalled();
    expect(catalog.lookupByTitleAuthor).toHaveBeenCalledWith(
      'The Hobbit',
      'J.R.R. Tolkien',
    );
    expect(result.enrichment_failed).toBe(false);
    expect(result.book.coverImageUrl).toBe(
      'https://covers.openlibrary.org/b/id/2-L.jpg',
    );
  });

  it('falls back to title+author when ISBN lookup returns no genre', async () => {
    catalog.lookupByIsbn.mockResolvedValue({
      cover_image_url: null,
      genre: null,
    });
    catalog.lookupByTitleAuthor.mockResolvedValue({
      cover_image_url: 'https://covers.openlibrary.org/b/id/3-L.jpg',
      genre: 'Romance',
    });

    const result = await service.enrichBook(baseBook());

    expect(catalog.lookupByIsbn).toHaveBeenCalledWith('9780618640157');
    expect(catalog.lookupByTitleAuthor).toHaveBeenCalledWith(
      'The Hobbit',
      'J.R.R. Tolkien',
    );
    expect(result.book.genreId).toBe('genre-romance');
    expect(result.book.coverImageUrl).toBe(
      'https://covers.openlibrary.org/b/id/3-L.jpg',
    );
  });

  it('still calls title+author when ISBN lookup fills genre but not cover', async () => {
    catalog.lookupByIsbn.mockResolvedValue({
      cover_image_url: null,
      genre: 'Fantasy',
    });
    catalog.lookupByTitleAuthor.mockResolvedValue({
      cover_image_url: 'https://covers.openlibrary.org/b/id/9-L.jpg',
      genre: null,
    });

    const result = await service.enrichBook(baseBook());

    expect(catalog.lookupByTitleAuthor).toHaveBeenCalled();
    expect(result.book.genreId).toBe('genre-fantasy');
    expect(result.book.coverImageUrl).toBe(
      'https://covers.openlibrary.org/b/id/9-L.jpg',
    );
  });

  it('does not call title+author when ISBN lookup already fills genre and cover', async () => {
    catalog.lookupByIsbn.mockResolvedValue({
      cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
      genre: 'Fantasy',
    });

    await service.enrichBook(baseBook());

    expect(catalog.lookupByTitleAuthor).not.toHaveBeenCalled();
  });

  it('skips catalog lookup when book is already complete', async () => {
    const book = {
      ...baseBook(),
      coverImageUrl: 'https://example.com/cover.jpg',
      genreId: 'genre-fantasy',
    } as Book;

    const result = await service.enrichBook(book);

    expect(catalog.lookupByIsbn).not.toHaveBeenCalled();
    expect(catalog.lookupByTitleAuthor).not.toHaveBeenCalled();
    expect(booksRepo.save).not.toHaveBeenCalled();
    expect(result).toEqual({ book, enrichment_failed: false });
  });

  it('does not overwrite existing cover or genre', async () => {
    catalog.lookupByIsbn.mockResolvedValue({
      cover_image_url: 'https://new-cover.jpg',
      genre: 'New Genre',
    });

    const book = {
      ...baseBook(),
      coverImageUrl: 'https://existing-cover.jpg',
    } as Book;

    await service.enrichBook(book);

    expect(booksRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        coverImageUrl: 'https://existing-cover.jpg',
        genreId: 'genre-new',
      }),
    );
  });

  it('marks enrichment_failed when catalog returns no metadata', async () => {
    catalog.lookupByTitleAuthor.mockResolvedValue(null);

    const book = {
      ...baseBook(),
      isbn13: null,
      isbn10: null,
    } as Book;

    const result = await service.enrichBook(book);

    expect(result.enrichment_failed).toBe(true);
    expect(booksRepo.save).not.toHaveBeenCalled();
  });

  it('continues when catalog lookup throws', async () => {
    catalog.lookupByIsbn.mockRejectedValue(new Error('timeout'));

    const book = baseBook();
    const result = await service.enrichBook(book);

    expect(result.book).toBe(book);
    expect(result.enrichment_failed).toBe(true);
    expect(booksRepo.save).not.toHaveBeenCalled();
  });

  it('reenriches incomplete books for a user', async () => {
    booksRepo.find = jest.fn().mockResolvedValue([
      {
        id: 'book-1',
        userId: 'user-1',
        title: 'The Hobbit',
        authors: 'J.R.R. Tolkien',
        coverImageUrl: null,
        genreId: null,
        isbn13: '9780618640157',
      },
      {
        id: 'book-2',
        coverImageUrl: 'https://example.com/cover.jpg',
        genreId: 'genre-fantasia',
      },
    ]);
    catalog.lookupByIsbn.mockResolvedValue({
      cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
      genre: 'Fantasía',
    });

    const summary = await service.reenrichIncompleteBooks('user-1');

    expect(summary).toEqual({
      processed: 1,
      enriched: 1,
      still_failed: 0,
    });
    expect(catalog.lookupByIsbn).toHaveBeenCalledTimes(1);
  });
});
