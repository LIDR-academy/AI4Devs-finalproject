import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookMetadataResolver } from '../book-metadata.resolver';
import { BookCoverSearchService } from './book-cover-search.service';
import { CatalogService } from './catalog.service';
import { EditionCoversService } from './edition-covers.service';
import { Book } from '../entities/book.entity';

describe('BookCoverSearchService', () => {
  let service: BookCoverSearchService;
  let booksRepo: { findOne: jest.Mock };
  let catalogService: { search: jest.Mock };
  let editionCoversService: { getCovers: jest.Mock };

  const ownedBook = {
    id: 'book-1',
    userId: 'user-1',
    catalogEdition: {
      title: 'Fourth Wing',
      authors: 'Rebecca Yarros',
      isbn13: null,
      isbn10: null,
      coverImageUrl: null,
      pageCount: null,
      seriesName: null,
      publicationYear: null,
      catalogGenre: null,
      dataSource: 'manual',
      externalProviderId: null,
    },
    override: null,
  } as Book;

  beforeEach(async () => {
    booksRepo = { findOne: jest.fn() };
    catalogService = { search: jest.fn() };
    editionCoversService = { getCovers: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        BookCoverSearchService,
        { provide: getRepositoryToken(Book), useValue: booksRepo },
        { provide: CatalogService, useValue: catalogService },
        { provide: EditionCoversService, useValue: editionCoversService },
        BookMetadataResolver,
      ],
    }).compile();

    service = module.get(BookCoverSearchService);
  });

  it('builds default query from title and authors', () => {
    expect(
      BookCoverSearchService.buildDefaultQuery('Fourth Wing', 'Rebecca Yarros'),
    ).toBe('Fourth Wing Rebecca Yarros');
  });

  it('throws when book is not owned', async () => {
    booksRepo.findOne.mockResolvedValue(null);

    await expect(
      service.searchForBook('user-1', 'missing-book'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('searches catalog with default query and resolves covers per edition', async () => {
    booksRepo.findOne.mockResolvedValue(ownedBook);
    catalogService.search.mockResolvedValue({
      items: [
        {
          title: 'Fourth Wing',
          authors: 'Rebecca Yarros',
          data_source: 'open_library',
          external_provider_id: '/works/OL123W',
          cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
        },
        {
          title: 'Fourth Wing',
          authors: 'Rebecca Yarros',
          data_source: 'google_books',
          external_provider_id: 'vol-1',
          cover_image_url: null,
        },
      ],
      source: 'open_library',
    });
    editionCoversService.getCovers
      .mockResolvedValueOnce({
        covers: [{ id: '1', url: 'https://covers.openlibrary.org/b/id/1-L.jpg', label: null }],
        default_cover_id: '1',
      })
      .mockResolvedValueOnce({ covers: [], default_cover_id: null });

    const result = await service.searchForBook('user-1', 'book-1');

    expect(catalogService.search).toHaveBeenCalledWith(
      'Fourth Wing Rebecca Yarros',
      20,
    );
    expect(editionCoversService.getCovers).toHaveBeenNthCalledWith(
      1,
      'open_library',
      '/works/OL123W',
      'https://covers.openlibrary.org/b/id/1-L.jpg',
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].covers).toHaveLength(1);
    expect(result.query).toBe('Fourth Wing Rebecca Yarros');
    expect(result.source).toBe('open_library');
  });

  it('uses query override when provided', async () => {
    booksRepo.findOne.mockResolvedValue(ownedBook);
    catalogService.search.mockResolvedValue({ items: [], source: 'none' });

    await service.searchForBook('user-1', 'book-1', 'Fourth Wing hardcover');

    expect(catalogService.search).toHaveBeenCalledWith('Fourth Wing hardcover', 20);
  });

  it('returns empty items when catalog search has no hits', async () => {
    booksRepo.findOne.mockResolvedValue(ownedBook);
    catalogService.search.mockResolvedValue({ items: [], source: 'none' });

    const result = await service.searchForBook('user-1', 'book-1');

    expect(result.items).toEqual([]);
  });

  it('rejects queries shorter than 2 characters', () => {
    expect(() =>
      BookCoverSearchService.resolveQuery('A', '', undefined),
    ).toThrow(BadRequestException);
  });
});
