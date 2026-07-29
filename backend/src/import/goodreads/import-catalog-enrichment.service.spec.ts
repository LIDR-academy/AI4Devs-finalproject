import { ImportCatalogEnrichmentService } from './import-catalog-enrichment.service';
import { BookMetadataResolver } from '../../books/book-metadata.resolver';
import { Book } from '../../books/entities/book.entity';
import { CatalogEdition } from '../../books/entities/catalog-edition.entity';
import { CatalogService } from '../../books/catalog/catalog.service';
import { CatalogEditionsService } from '../../books/catalog/catalog-editions.service';
import { CatalogRateLimiter } from '../../books/catalog/catalog-rate-limiter.service';
import { GenresService } from '../../genres/genres.service';
import { Repository } from 'typeorm';

describe('ImportCatalogEnrichmentService', () => {
  let catalog: jest.Mocked<
    Pick<CatalogService, 'lookupByIsbn' | 'lookupByTitleAuthor'>
  >;
  let catalogEditions: jest.Mocked<
    Pick<CatalogEditionsService, 'upsert' | 'findBestByTitleAuthor'>
  >;
  let rateLimiter: jest.Mocked<Pick<CatalogRateLimiter, 'throttle'>>;
  let genresService: jest.Mocked<
    Pick<GenresService, 'resolveImportedGenre' | 'findOwnedById'>
  >;
  let booksRepo: jest.Mocked<Pick<Repository<Book>, 'save' | 'find' | 'findOne'>>;
  let service: ImportCatalogEnrichmentService;
  const metadataResolver = new BookMetadataResolver();

  const genreIdByName: Record<string, string> = {
    Fantasy: 'genre-fantasy',
    Fiction: 'genre-fiction',
    Romance: 'genre-romance',
    'New Genre': 'genre-new',
    Fantasía: 'genre-fantasia',
  };

  const catalogEdition = (): CatalogEdition =>
    ({
      id: 'ce-1',
      title: 'The Hobbit',
      authors: 'J.R.R. Tolkien',
      isbn13: '9780618640157',
      isbn10: '0618640150',
      coverImageUrl: null,
      pageCount: 300,
      seriesName: null,
      publicationYear: null,
      catalogGenre: null,
      dataSource: 'goodreads',
      externalProviderId: null,
    }) as CatalogEdition;

  const baseBook = (): Book =>
    ({
      id: 'book-1',
      userId: 'user-1',
      catalogEditionId: 'ce-1',
      catalogEdition: catalogEdition(),
      override: null,
      genreId: null,
      audience: null,
    }) as Book;

  beforeEach(() => {
    catalog = {
      lookupByIsbn: jest.fn(),
      lookupByTitleAuthor: jest.fn(),
    };
    catalogEditions = {
      upsert: jest.fn(async (input) => ({
        ...catalogEdition(),
        coverImageUrl: input.cover_image_url ?? null,
        catalogGenre: input.catalog_genre ?? null,
      })),
      findBestByTitleAuthor: jest.fn().mockResolvedValue(null),
    };
    rateLimiter = { throttle: jest.fn().mockResolvedValue(undefined) };
    genresService = {
      resolveImportedGenre: jest.fn(async (_userId, rawGenre) => {
        if (!rawGenre) return null;
        return genreIdByName[rawGenre] ?? null;
      }),
      findOwnedById: jest.fn(async (_userId, genreId) => ({
        id: genreId,
        name: Object.entries(genreIdByName).find(([, id]) => id === genreId)?.[0] ?? 'Unknown',
        userId: 'user-1',
        isDefault: false,
      })),
    };
    booksRepo = {
      save: jest.fn(async (book) => {
        booksRepo.findOne.mockResolvedValue(book);
        return book;
      }),
      find: jest.fn(),
      findOne: jest.fn(async () => baseBook()),
    };
    service = new ImportCatalogEnrichmentService(
      catalog as unknown as CatalogService,
      catalogEditions as unknown as CatalogEditionsService,
      rateLimiter as unknown as CatalogRateLimiter,
      genresService as unknown as GenresService,
      metadataResolver,
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
    expect(catalogEditions.upsert).toHaveBeenCalled();
    expect(booksRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
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

    const edition = {
      ...catalogEdition(),
      isbn13: null,
      isbn10: null,
    } as CatalogEdition;
    const book = {
      ...baseBook(),
      catalogEdition: edition,
    } as Book;
    booksRepo.findOne.mockResolvedValue(book);

    const result = await service.enrichBook(book);

    expect(catalog.lookupByIsbn).not.toHaveBeenCalled();
    expect(catalog.lookupByTitleAuthor).toHaveBeenCalledWith(
      'The Hobbit',
      'J.R.R. Tolkien',
    );
    expect(result.enrichment_failed).toBe(false);
    expect(catalogEditions.upsert).toHaveBeenCalled();
  });

  it('enriches cover from another local edition of the same title when ISBN miss lacks cover', async () => {
    catalog.lookupByIsbn.mockResolvedValue({
      cover_image_url: null,
      genre: null,
    });
    catalogEditions.findBestByTitleAuthor.mockResolvedValue({
      id: 'ce-seed',
      title: 'Hamnet',
      authors: "Maggie O'Farrell",
      coverImageUrl: 'https://covers.openlibrary.org/b/id/10713474-L.jpg',
      catalogGenre: 'Fiction, historical',
      isbn13: '9781984898876',
      isbn10: null,
      pageCount: 320,
      seriesName: null,
      publicationYear: 2021,
      dataSource: 'open_library',
      externalProviderId: 'OL32047852M',
    } as CatalogEdition);

    const edition = {
      ...catalogEdition(),
      title: 'Hamnet',
      authors: "Maggie O'Farrell",
      isbn13: '9788417977580',
      isbn10: '8417977589',
      coverImageUrl: null,
      dataSource: 'goodreads',
    } as CatalogEdition;
    const book = {
      ...baseBook(),
      catalogEdition: edition,
    } as Book;
    booksRepo.findOne.mockResolvedValue(book);

    const result = await service.enrichBook(book);

    expect(catalog.lookupByIsbn).toHaveBeenCalledWith('9788417977580');
    expect(catalogEditions.findBestByTitleAuthor).toHaveBeenCalledWith(
      'Hamnet',
      "Maggie O'Farrell",
    );
    expect(catalog.lookupByTitleAuthor).not.toHaveBeenCalled();
    expect(rateLimiter.throttle).toHaveBeenCalledTimes(1);
    expect(catalogEditions.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        isbn_13: '9788417977580',
        cover_image_url: 'https://covers.openlibrary.org/b/id/10713474-L.jpg',
      }),
    );
    expect(result.enrichment_failed).toBe(false);
  });

  it('skips catalog lookup when book is already complete', async () => {
    const edition = {
      ...catalogEdition(),
      coverImageUrl: 'https://example.com/cover.jpg',
    } as CatalogEdition;
    const book = {
      ...baseBook(),
      catalogEdition: edition,
      genreId: 'genre-fantasy',
    } as Book;
    booksRepo.findOne.mockResolvedValue(book);

    const result = await service.enrichBook(book);

    expect(catalog.lookupByIsbn).not.toHaveBeenCalled();
    expect(catalog.lookupByTitleAuthor).not.toHaveBeenCalled();
    expect(booksRepo.save).not.toHaveBeenCalled();
    expect(result).toEqual({ book, enrichment_failed: false });
  });

  it('marks enrichment_failed when catalog returns no metadata', async () => {
    catalog.lookupByTitleAuthor.mockResolvedValue(null);

    const edition = {
      ...catalogEdition(),
      isbn13: null,
      isbn10: null,
    } as CatalogEdition;
    const book = {
      ...baseBook(),
      catalogEdition: edition,
    } as Book;
    booksRepo.findOne.mockResolvedValue(book);

    const result = await service.enrichBook(book);

    expect(result.enrichment_failed).toBe(true);
    expect(booksRepo.save).not.toHaveBeenCalled();
  });
});
