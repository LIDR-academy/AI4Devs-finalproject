import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CatalogEditionsService } from './catalog-editions.service';
import { CatalogEdition } from '../entities/catalog-edition.entity';

describe('CatalogEditionsService', () => {
  let service: CatalogEditionsService;
  const catalogRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CatalogEditionsService,
        { provide: getRepositoryToken(CatalogEdition), useValue: catalogRepo },
      ],
    }).compile();
    service = module.get(CatalogEditionsService);
  });

  it('reuses existing edition by ISBN on upsert', async () => {
    const existing = {
      id: 'ce-1',
      isbn13: '9780000000000',
      title: 'Shared',
      authors: 'Author',
      coverImageUrl: null,
      pageCount: null,
      catalogGenre: null,
      isbn10: null,
      dataSource: 'open_library',
      externalProviderId: 'OL1',
    } as CatalogEdition;

    catalogRepo.findOne.mockResolvedValueOnce(existing);
    catalogRepo.save.mockImplementation(async (value) => ({
      ...existing,
      ...value,
    }));

    const result = await service.upsert({
      title: 'Shared',
      authors: 'Author',
      isbn_13: '9780000000000',
      data_source: 'open_library',
      external_provider_id: 'OL1',
      cover_image_url: 'https://example.com/cover.jpg',
    });

    expect(result.id).toBe('ce-1');
    expect(catalogRepo.create).not.toHaveBeenCalled();
    expect(catalogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        coverImageUrl: 'https://example.com/cover.jpg',
      }),
    );
  });

  it('creates edition when no dedup key matches', async () => {
    catalogRepo.findOne.mockResolvedValue(null);
    catalogRepo.create.mockImplementation((value) => value);
    catalogRepo.save.mockImplementation(async (value) => ({
      id: 'ce-new',
      ...value,
    }));

    const result = await service.upsert({
      title: 'New Book',
      authors: 'Author',
      data_source: 'manual',
    });

    expect(result.id).toBe('ce-new');
    expect(catalogRepo.create).toHaveBeenCalled();
  });

  it('finds by provider identity', async () => {
    catalogRepo.findOne.mockResolvedValue({ id: 'ce-gb' } as CatalogEdition);
    const result = await service.findByProvider('google_books', 'vol-1');
    expect(result?.id).toBe('ce-gb');
    expect(catalogRepo.findOne).toHaveBeenCalledWith({
      where: { dataSource: 'google_books', externalProviderId: 'vol-1' },
    });
  });

  it('findBestByTitleAuthor prefers another edition with cover for same title/author', async () => {
    catalogRepo.find.mockResolvedValue([
      {
        id: 'ce-es',
        title: 'Hamnet',
        authors: "Maggie O'Farrell",
        coverImageUrl: null,
        catalogGenre: null,
        isbn13: '9788417977580',
      },
      {
        id: 'ce-seed',
        title: 'Hamnet',
        authors: "Maggie O'Farrell",
        coverImageUrl: 'https://covers.openlibrary.org/b/id/10713474-L.jpg',
        catalogGenre: 'Fiction, historical',
        isbn13: '9781984898876',
      },
    ] as CatalogEdition[]);

    const result = await service.findBestByTitleAuthor(
      'Hamnet',
      "Maggie O'Farrell",
    );

    expect(result?.id).toBe('ce-seed');
    expect(result?.coverImageUrl).toContain('10713474');
  });

  it('findBestByTitleAuthor matches normalized title and author text', async () => {
    catalogRepo.find.mockResolvedValue([
      {
        id: 'ce-1',
        title: 'Hamnet',
        authors: "O'Farrell, Maggie",
        coverImageUrl: 'https://example.com/a.jpg',
        catalogGenre: 'Fiction',
      },
    ] as CatalogEdition[]);

    const result = await service.findBestByTitleAuthor(
      '  hamnet  ',
      "Maggie O'Farrell",
    );

    expect(result?.id).toBe('ce-1');
  });

  it('findBestByTitleAuthor returns null when no title/author match', async () => {
    catalogRepo.find.mockResolvedValue([
      {
        id: 'ce-other',
        title: 'Hamnet',
        authors: 'Someone Else',
        coverImageUrl: 'https://example.com/a.jpg',
      },
    ] as CatalogEdition[]);

    const result = await service.findBestByTitleAuthor(
      'Hamnet',
      "Maggie O'Farrell",
    );

    expect(result).toBeNull();
  });
});
