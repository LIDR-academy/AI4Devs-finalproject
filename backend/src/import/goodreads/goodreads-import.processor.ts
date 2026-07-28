import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookMetadataResolver } from '../../books/book-metadata.resolver';
import { CatalogEditionsService } from '../../books/catalog/catalog-editions.service';
import { Book } from '../../books/entities/book.entity';
import { ReadingRecord } from '../../books/entities/reading-record.entity';
import { FormatsService } from '../../formats/formats.service';
import {
  buildGoodreadsDedupKey,
  buildGoodreadsDedupKeyFromLibraryBook,
} from './goodreads-dedup.util';
import { ImportCatalogEnrichmentService } from './import-catalog-enrichment.service';
import type { GoodreadsImportProgressUpdate } from '../import-job.types';
import type { GenreResolutionMap } from '../../genres/genre-resolution.types';
import type {
  GoodreadsEnrichmentFailedRow,
  GoodreadsImportProcessOptions,
  GoodreadsImportSkippedRow,
  GoodreadsImportSummary,
  GoodreadsMappedRow,
  GoodreadsMappingWarning,
} from './goodreads-import.types';

@Injectable()
export class GoodreadsImportProcessor {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
    @InjectRepository(ReadingRecord)
    private readonly readingRepo: Repository<ReadingRecord>,
    private readonly catalogEnrichment: ImportCatalogEnrichmentService,
    private readonly catalogEditions: CatalogEditionsService,
    private readonly metadataResolver: BookMetadataResolver,
    private readonly formatsService: FormatsService,
  ) {}

  async processImport(
    userId: string,
    mappedRows: GoodreadsMappedRow[],
    mappingWarnings: GoodreadsMappingWarning[],
    options?: GoodreadsImportProcessOptions,
  ): Promise<GoodreadsImportSummary> {
    const existingByKey = await this.loadExistingDedupIndex(userId);
    const batchKeys = new Set<string>();
    const imported: GoodreadsImportSummary['imported'] = [];
    const enrichment_failed: GoodreadsEnrichmentFailedRow[] = [];
    const skipped_rows: GoodreadsImportSkippedRow[] = mappingWarnings.map(
      (warning) => ({
        row_number: warning.row_number,
        code: warning.code,
        message: warning.message,
      }),
    );

    let skipped_duplicate_count = 0;
    const skipped_invalid_count = mappingWarnings.length;
    const total_count = mappedRows.length;
    let processed_count = 0;

    const reportProgress = async (
      phase: GoodreadsImportProgressUpdate['phase'],
    ) => {
      await options?.onProgress?.({
        phase,
        processed_count,
        total_count,
      });
    };

    const genreResolutions = options?.genreResolutions ?? {};

    for (const row of mappedRows) {
      const dedupKey = buildGoodreadsDedupKey(row.book);
      if (batchKeys.has(dedupKey)) {
        skipped_rows.push({
          row_number: row.row_number,
          code: 'DUPLICATE_IN_BATCH',
          message: 'Fila duplicada en el mismo archivo CSV',
        });
        skipped_duplicate_count += 1;
        processed_count += 1;
        await reportProgress('importing');
        continue;
      }

      const existingBookId = existingByKey.get(dedupKey);

      if (existingBookId) {
        skipped_rows.push({
          row_number: row.row_number,
          code: 'DUPLICATE_EXISTING',
          message: 'El libro ya existe en la biblioteca',
          existing_book_id: existingBookId,
        });
        skipped_duplicate_count += 1;
        processed_count += 1;
        await reportProgress('importing');
        continue;
      }

      await reportProgress('importing');
      const savedBook = await this.persistRow(userId, row);
      await reportProgress('enriching');
      const enrichment = await this.catalogEnrichment.enrichBook(
        savedBook,
        genreResolutions,
      );
      if (enrichment.enrichment_failed) {
        enrichment_failed.push({
          row_number: row.row_number,
          book_id: enrichment.book.id,
          code: 'ENRICHMENT_CATALOG_MISS',
          message: 'El catálogo no devolvió metadatos para enriquecer el libro',
        });
      }
      batchKeys.add(dedupKey);
      imported.push({ row_number: row.row_number, book_id: enrichment.book.id });
      processed_count += 1;
      await reportProgress('enriching');
    }

    const retriedFailures = await this.retryFailedEnrichments(
      enrichment_failed,
      reportProgress,
      genreResolutions,
    );
    enrichment_failed.length = 0;
    enrichment_failed.push(...retriedFailures);

    return {
      imported,
      skipped_rows,
      enrichment_failed,
      meta: {
        imported_count: imported.length,
        skipped_duplicate_count,
        skipped_invalid_count,
        enrichment_failed_count: enrichment_failed.length,
      },
    };
  }

  private async retryFailedEnrichments(
    failures: GoodreadsEnrichmentFailedRow[],
    reportProgress: (
      phase: GoodreadsImportProgressUpdate['phase'],
    ) => Promise<void>,
    genreResolutions: GenreResolutionMap,
  ): Promise<GoodreadsEnrichmentFailedRow[]> {
    if (failures.length === 0) {
      return [];
    }

    const stillFailed: GoodreadsEnrichmentFailedRow[] = [];

    for (const failure of failures) {
      const book = await this.booksRepo.findOne({
        where: { id: failure.book_id },
        relations: ['catalogEdition', 'override', 'genreRef'],
      });
      if (!book?.catalogEdition) {
        continue;
      }
      const effective = this.metadataResolver.resolveEffective(
        book.catalogEdition,
        book.override,
      );
      if (effective.cover_image_url && book.genreId) {
        continue;
      }

      await reportProgress('enriching');
      const enrichment = await this.catalogEnrichment.enrichBook(
        book,
        genreResolutions,
      );
      if (enrichment.enrichment_failed) {
        stillFailed.push(failure);
      }
    }

    return stillFailed;
  }

  private async loadExistingDedupIndex(
    userId: string,
  ): Promise<Map<string, string>> {
    const books = await this.booksRepo.find({
      where: { userId },
      relations: ['catalogEdition', 'override'],
    });

    const index = new Map<string, string>();
    for (const book of books) {
      if (!book.catalogEdition) {
        continue;
      }
      const effective = this.metadataResolver.resolveEffective(
        book.catalogEdition,
        book.override,
      );
      index.set(
        buildGoodreadsDedupKeyFromLibraryBook({
          isbn13: effective.isbn_13,
          title: effective.title,
          authors: effective.authors,
        }),
        book.id,
      );
    }
    return index;
  }

  private async persistRow(
    userId: string,
    row: GoodreadsMappedRow,
  ): Promise<Book> {
    const { book: bookDraft, reading_record: readingDraft } = row;

    const catalogEdition = await this.catalogEditions.upsert({
      title: bookDraft.title,
      authors: bookDraft.authors,
      isbn_13: bookDraft.isbn13,
      isbn_10: bookDraft.isbn10,
      page_count: bookDraft.page_count,
      publication_year: bookDraft.publication_year,
      data_source: bookDraft.data_source,
      external_provider_id: bookDraft.external_provider_id,
    });

    const book = this.booksRepo.create({
      userId,
      catalogEditionId: catalogEdition.id,
      genreId: null,
      notes: null,
      audience: null,
    });

    const savedBook = await this.booksRepo.save(book);
    const isFinished = readingDraft.status === 'leido';
    const pageCount = bookDraft.page_count;

    const formatId = await this.formatsService.resolveFormatIdByLegacySlug(
      userId,
      readingDraft.read_format,
    );

    const reading = this.readingRepo.create({
      bookId: savedBook.id,
      status: readingDraft.status,
      rating:
        readingDraft.rating === null ? null : String(readingDraft.rating),
      formatId,
      startedOn: readingDraft.started_on,
      finishedOn: readingDraft.finished_on,
      currentPage: isFinished && pageCount != null ? pageCount : null,
      progressPercent: isFinished && pageCount != null ? '100.00' : null,
    });

    await this.readingRepo.save(reading);
    return savedBook;
  }
}
