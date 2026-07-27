import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { ReadingRecord } from '../../books/entities/reading-record.entity';
import { GoodreadsImportProcessor } from './goodreads-import.processor';
import { ImportCatalogEnrichmentService } from './import-catalog-enrichment.service';
import { FormatsService } from '../../formats/formats.service';
import type { GoodreadsMappedRow } from './goodreads-import.types';

describe('GoodreadsImportProcessor', () => {
  let processor: GoodreadsImportProcessor;
  let booksRepo: jest.Mocked<
    Pick<Repository<Book>, 'find' | 'findOne' | 'create' | 'save'>
  >;
  let readingRepo: jest.Mocked<Pick<Repository<ReadingRecord>, 'create' | 'save'>>;
  let catalogEnrichment: jest.Mocked<
    Pick<ImportCatalogEnrichmentService, 'enrichBook'>
  >;
  let formatsService: jest.Mocked<
    Pick<FormatsService, 'resolveFormatIdByLegacySlug'>
  >;

  const sampleRow: GoodreadsMappedRow = {
    row_number: 2,
    book: {
      title: 'The Hobbit',
      authors: 'J.R.R. Tolkien',
      isbn10: '0618640150',
      isbn13: '9780618640157',
      page_count: 320,
      publication_year: 1937,
      data_source: 'goodreads',
      external_provider_id: '1001',
    },
    reading_record: {
      status: 'leido',
      rating: 5,
      read_format: 'fisico',
      started_on: '2024-01-10',
      finished_on: '2024-06-15',
    },
  };

  beforeEach(async () => {
    booksRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({
        id: 'book-1',
        coverImageUrl: null,
        genreId: null,
      } as Book),
      create: jest.fn((value) => value as Book),
      save: jest.fn(async (value) => ({ ...value, id: 'book-1' }) as Book),
    };
    readingRepo = {
      create: jest.fn((value) => value as ReadingRecord),
      save: jest.fn(async (value) => value as ReadingRecord),
    };
    catalogEnrichment = {
      enrichBook: jest.fn(async (book) => ({
        book,
        enrichment_failed: false,
      })),
    };
    formatsService = {
      resolveFormatIdByLegacySlug: jest
        .fn()
        .mockResolvedValue('format-fisico'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        GoodreadsImportProcessor,
        { provide: getRepositoryToken(Book), useValue: booksRepo },
        { provide: getRepositoryToken(ReadingRecord), useValue: readingRepo },
        { provide: ImportCatalogEnrichmentService, useValue: catalogEnrichment },
        { provide: FormatsService, useValue: formatsService },
      ],
    }).compile();

    processor = moduleRef.get(GoodreadsImportProcessor);
  });

  it('imports a new mapped row', async () => {
    const result = await processor.processImport('user-1', [sampleRow], []);

    expect(result.meta.imported_count).toBe(1);
    expect(result.imported[0]).toEqual({ row_number: 2, book_id: 'book-1' });
    expect(readingRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'leido',
        currentPage: 320,
        progressPercent: '100.00',
      }),
    );
    expect(catalogEnrichment.enrichBook).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'book-1' }),
    );
    expect(result.enrichment_failed).toEqual([]);
    expect(result.meta.enrichment_failed_count).toBe(0);
  });

  it('records enrichment failures from catalog enrichment', async () => {
    catalogEnrichment.enrichBook.mockResolvedValue({
      book: { id: 'book-1' } as Book,
      enrichment_failed: true,
    });

    const result = await processor.processImport('user-1', [sampleRow], []);

    expect(catalogEnrichment.enrichBook).toHaveBeenCalledTimes(2);
    expect(result.enrichment_failed).toEqual([
      expect.objectContaining({
        row_number: 2,
        book_id: 'book-1',
        code: 'ENRICHMENT_CATALOG_MISS',
      }),
    ]);
    expect(result.meta.enrichment_failed_count).toBe(1);
  });

  it('clears enrichment failures when retry pass succeeds', async () => {
    catalogEnrichment.enrichBook
      .mockResolvedValueOnce({
        book: { id: 'book-1', coverImageUrl: null, genreId: null } as Book,
        enrichment_failed: true,
      })
      .mockResolvedValueOnce({
        book: {
          id: 'book-1',
          coverImageUrl: 'https://covers.openlibrary.org/b/id/1-L.jpg',
          genreId: 'genre-fantasia',
        } as Book,
        enrichment_failed: false,
      });

    const result = await processor.processImport('user-1', [sampleRow], []);

    expect(catalogEnrichment.enrichBook).toHaveBeenCalledTimes(2);
    expect(result.enrichment_failed).toEqual([]);
    expect(result.meta.enrichment_failed_count).toBe(0);
  });

  it('skips rows that already exist in the library', async () => {
    booksRepo.find.mockResolvedValue([
      {
        id: 'existing-1',
        isbn13: '9780618640157',
        title: 'The Hobbit',
        authors: 'J.R.R. Tolkien',
      } as Book,
    ]);

    const result = await processor.processImport('user-1', [sampleRow], []);

    expect(result.meta.imported_count).toBe(0);
    expect(result.meta.skipped_duplicate_count).toBe(1);
    expect(result.skipped_rows[0]).toMatchObject({
      code: 'DUPLICATE_EXISTING',
      existing_book_id: 'existing-1',
    });
    expect(booksRepo.save).not.toHaveBeenCalled();
  });

  it('skips duplicate rows within the same batch', async () => {
    const duplicateRow: GoodreadsMappedRow = {
      ...sampleRow,
      row_number: 3,
    };

    const result = await processor.processImport(
      'user-1',
      [sampleRow, duplicateRow],
      [],
    );

    expect(result.meta.imported_count).toBe(1);
    expect(result.meta.skipped_duplicate_count).toBe(1);
    expect(result.skipped_rows).toContainEqual(
      expect.objectContaining({
        row_number: 3,
        code: 'DUPLICATE_IN_BATCH',
      }),
    );
  });

  it('records mapping warnings as skipped invalid rows', async () => {
    const result = await processor.processImport('user-1', [], [
      {
        row_number: 4,
        code: 'MISSING_TITLE',
        message: 'Row omitted from mapped_rows because title is empty',
      },
    ]);

    expect(result.meta.skipped_invalid_count).toBe(1);
    expect(result.skipped_rows[0]?.code).toBe('MISSING_TITLE');
  });
});
