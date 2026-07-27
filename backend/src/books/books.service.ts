import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BookCreatedResponseDto,
  BookDto,
  BookListItemDto,
} from './dto/book-response.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { PatchBookDto } from './dto/patch-book.dto';
import { PatchReadingRecordDto } from './dto/patch-reading-record.dto';
import {
  PatchSideEffectsMetaDto,
  ReadingRecordPatchedResponseDto,
  ReadingRecordResourceDto,
} from './dto/reading-record-response.dto';
import { GoogleBooksClient } from './catalog/google-books.client';
import { CatalogService } from './catalog/catalog.service';
import { OpenLibraryEnrichmentService } from './catalog/open-library-enrichment.service';
import { GenreNormalizerService } from './genre-normalizer.service';
import { AudiencesService } from '../audiences/audiences.service';
import { FormatsService } from '../formats/formats.service';
import { legacySlugFromFormatName } from '../formats/formats.constants';
import { TbrService } from '../lists/tbr.service';
import { Book } from './entities/book.entity';
import { ReadingRecord } from './entities/reading-record.entity';
import { normalizeRating } from './validators/half-step-rating.validator';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
    @InjectRepository(ReadingRecord)
    private readonly readingRepo: Repository<ReadingRecord>,
    private readonly openLibraryEnrichment: OpenLibraryEnrichmentService,
    private readonly googleBooksClient: GoogleBooksClient,
    private readonly catalogService: CatalogService,
    private readonly genreNormalizer: GenreNormalizerService,
    private readonly audiencesService: AudiencesService,
    private readonly formatsService: FormatsService,
    @Inject(forwardRef(() => TbrService))
    private readonly tbrService: TbrService,
  ) {}

  async listForUser(userId: string): Promise<BookListItemDto[]> {
    const books = await this.booksRepo.find({
      where: { userId },
      relations: ['readingRecord', 'readingRecord.formatRef'],
      order: { createdAt: 'DESC' },
    });
    return books.map((b) => ({
      ...this.toBookDto(b),
      reading_status: b.readingRecord?.status ?? 'pendiente',
      started_on: b.readingRecord?.startedOn ?? null,
      finished_on: b.readingRecord?.finishedOn ?? null,
      rating: normalizeRating(b.readingRecord?.rating),
      format_id: b.readingRecord?.formatId ?? null,
      read_format: legacySlugFromFormatName(b.readingRecord?.formatRef?.name),
    }));
  }

  async patchReadingRecord(
    userId: string,
    bookId: string,
    dto: PatchReadingRecordDto,
  ): Promise<ReadingRecordPatchedResponseDto> {
    this.assertPatchHasFields(dto);

    const book = await this.booksRepo.findOne({
      where: { id: bookId, userId },
      relations: ['readingRecord', 'readingRecord.formatRef'],
    });
    if (!book?.readingRecord) {
      throw new NotFoundException('Book not found');
    }

    const reading = book.readingRecord;
    const previousStatus = reading.status;

    if (dto.status !== undefined) {
      reading.status = dto.status;
    }
    if (dto.started_on !== undefined) {
      reading.startedOn = dto.started_on;
    }
    if (dto.finished_on !== undefined) {
      reading.finishedOn = dto.finished_on;
    }
    if (dto.rating !== undefined) {
      reading.rating = dto.rating === null ? null : String(dto.rating);
    }
    if (dto.format_id !== undefined) {
      if (dto.format_id === null) {
        reading.formatId = null;
      } else {
        const format = await this.formatsService.findOwnedById(userId, dto.format_id);
        if (!format) {
          throw new BadRequestException({
            statusCode: 400,
            message: 'Format not found for this user',
            code: 'FORMAT_NOT_FOUND',
          });
        }
        reading.formatId = format.id;
      }
      reading.formatRef = null;
    }

    const today = this.utcToday();

    if (
      reading.status === 'leyendo' &&
      previousStatus !== 'leyendo' &&
      dto.started_on === undefined
    ) {
      reading.startedOn = today;
    }

    if (
      reading.status === 'leido' &&
      previousStatus !== 'leido' &&
      dto.finished_on === undefined
    ) {
      reading.finishedOn = today;
    }

    if (reading.status === 'leido' && previousStatus !== 'leido') {
      if (book.pageCount != null) {
        reading.currentPage = book.pageCount;
        reading.progressPercent = '100.00';
      }
    }

    if (
      reading.startedOn &&
      reading.finishedOn &&
      reading.finishedOn < reading.startedOn
    ) {
      throw new UnprocessableEntityException({
        statusCode: 422,
        message: 'Finish date cannot be before start date',
        code: 'FINISHED_BEFORE_STARTED',
      });
    }

    await this.readingRepo.save(reading);

    const reloaded = await this.readingRepo.findOne({
      where: { bookId: reading.bookId },
      relations: ['formatRef'],
    });
    const readingForResponse = reloaded ?? reading;

    const meta: PatchSideEffectsMetaDto = {};
    if (reading.status === 'leido' && previousStatus !== 'leido') {
      meta.openCompletionModal = true;
      try {
        const tbrCompleted =
          await this.tbrService.markCompletedIfInActiveMonthTbr(
            userId,
            bookId,
            reading.finishedOn,
          );
        if (tbrCompleted) {
          meta.tbrAutoCompleted = true;
        }
      } catch (err) {
        this.logger.warn(
          `TBR auto-complete failed for book ${bookId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const hasMeta = meta.openCompletionModal || meta.tbrAutoCompleted;

    return {
      reading: this.toReadingRecordResource(readingForResponse),
      book: { id: book.id, page_count: book.pageCount },
      ...(hasMeta ? { meta } : {}),
    };
  }

  private assertPatchHasFields(dto: PatchReadingRecordDto): void {
    const hasField =
      dto.status !== undefined ||
      dto.started_on !== undefined ||
      dto.finished_on !== undefined ||
      dto.rating !== undefined ||
      dto.format_id !== undefined;
    if (!hasField) {
      throw new BadRequestException('At least one field must be provided');
    }
  }

  private utcToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toReadingRecordResource(
    reading: ReadingRecord,
  ): ReadingRecordResourceDto {
    return {
      book_id: reading.bookId,
      status: reading.status,
      current_page: reading.currentPage,
      progress_percent: reading.progressPercent,
      rating: normalizeRating(reading.rating),
      format_id: reading.formatId,
      read_format: legacySlugFromFormatName(reading.formatRef?.name),
      started_on: reading.startedOn,
      finished_on: reading.finishedOn,
      updated_at: reading.updatedAt.toISOString(),
    };
  }

  async create(userId: string, dto: CreateBookDto): Promise<BookCreatedResponseDto> {
    await this.assertNotDuplicate(userId, dto);
    const audienceId = await this.resolveAudienceId(userId, dto.audience_id);
    const metadata = await this.resolveMetadata(dto);

    const book = this.booksRepo.create({
      userId,
      title: dto.title,
      authors: dto.authors,
      isbn13: dto.isbn_13 ?? null,
      isbn10: dto.isbn_10 ?? null,
      coverImageUrl: dto.cover_image_url ?? null,
      pageCount: metadata.page_count,
      genre: metadata.genre,
      seriesName: dto.series_name ?? null,
      publicationYear: dto.publication_year ?? null,
      dataSource: dto.data_source,
      externalProviderId: dto.external_provider_id ?? null,
      notes: dto.notes ?? null,
      audience: dto.audience ?? null,
      audienceId,
    });

    const saved = await this.booksRepo.save(book);

    const reading = this.readingRepo.create({
      bookId: saved.id,
      status: 'pendiente',
    });
    await this.readingRepo.save(reading);

    return {
      book: this.toBookDto(saved),
      reading: { book_id: saved.id, status: 'pendiente' },
    };
  }

  private async resolveMetadata(
    dto: CreateBookDto,
  ): Promise<{ genre: string | null; page_count: number | null }> {
    let genre = dto.genre ?? null;
    let page_count = dto.page_count ?? null;

    if (genre && page_count) {
      return { genre, page_count };
    }

    if (dto.data_source === 'open_library' && dto.external_provider_id) {
      const enriched = await this.openLibraryEnrichment.enrichEdition(
        {
          title: dto.title,
          authors: dto.authors,
          cover_image_url: dto.cover_image_url ?? null,
          page_count,
          genre,
          isbn_13: dto.isbn_13 ?? null,
          isbn_10: dto.isbn_10 ?? null,
          data_source: 'open_library',
          external_provider_id: dto.external_provider_id,
        },
        { resolveGenre: false },
      );
      page_count = page_count ?? enriched.page_count;
    }

    if (!genre && dto.data_source === 'open_library') {
      genre = await this.catalogService.resolveMissingGenre({
        genre,
        isbn_13: dto.isbn_13 ?? null,
        isbn_10: dto.isbn_10 ?? null,
        data_source: 'open_library',
        external_provider_id: dto.external_provider_id ?? '',
      });
    }

    if (
      dto.data_source === 'google_books' &&
      dto.external_provider_id &&
      (!genre || !page_count)
    ) {
      const volume = await this.googleBooksClient.getVolumeDetails(
        dto.external_provider_id,
      );
      if (volume) {
        genre = genre ?? this.genreNormalizer.normalize(volume.genre);
        page_count = page_count ?? volume.page_count;
      }
    }

    return { genre, page_count };
  }

  private async assertNotDuplicate(
    userId: string,
    dto: CreateBookDto,
  ): Promise<void> {
    if (dto.isbn_13) {
      const byIsbn = await this.booksRepo.findOne({
        where: { userId, isbn13: dto.isbn_13 },
      });
      if (byIsbn) {
        throw new ConflictException({
          statusCode: 409,
          message: 'Book already exists in your library',
          code: 'BOOK_DUPLICATE',
          existingBookId: byIsbn.id,
        });
      }
    }

    if (dto.data_source && dto.external_provider_id) {
      const byExternal = await this.booksRepo.findOne({
        where: {
          userId,
          dataSource: dto.data_source,
          externalProviderId: dto.external_provider_id,
        },
      });
      if (byExternal) {
        throw new ConflictException({
          statusCode: 409,
          message: 'Book already exists in your library',
          code: 'BOOK_DUPLICATE',
          existingBookId: byExternal.id,
        });
      }
    }
  }

  async findOneForUser(userId: string, bookId: string): Promise<Book> {
    const book = await this.booksRepo.findOne({
      where: { id: bookId, userId },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async update(
    userId: string,
    bookId: string,
    dto: PatchBookDto,
  ): Promise<BookDto> {
    this.assertPatchBookHasFields(dto);

    const book = await this.findOneForUser(userId, bookId);

    if (dto.title !== undefined) {
      book.title = dto.title;
    }
    if (dto.authors !== undefined) {
      book.authors = dto.authors;
    }
    if (dto.cover_image_url !== undefined) {
      book.coverImageUrl = dto.cover_image_url;
    }
    if (dto.page_count !== undefined) {
      book.pageCount = dto.page_count;
    }
    if (dto.genre !== undefined) {
      book.genre = dto.genre;
    }
    if (dto.series_name !== undefined) {
      book.seriesName = dto.series_name;
    }
    if (dto.publication_year !== undefined) {
      book.publicationYear = dto.publication_year;
    }
    if (dto.audience !== undefined) {
      book.audience = dto.audience;
    }
    if (dto.audience_id !== undefined) {
      book.audienceId = await this.resolveAudienceId(userId, dto.audience_id);
    }
    if (dto.notes !== undefined) {
      book.notes = dto.notes;
    }

    const saved = await this.booksRepo.save(book);
    return this.toBookDto(saved);
  }

  private assertPatchBookHasFields(dto: PatchBookDto): void {
    const hasField =
      dto.title !== undefined ||
      dto.authors !== undefined ||
      dto.cover_image_url !== undefined ||
      dto.page_count !== undefined ||
      dto.genre !== undefined ||
      dto.series_name !== undefined ||
      dto.publication_year !== undefined ||
      dto.audience !== undefined ||
      dto.audience_id !== undefined ||
      dto.notes !== undefined;
    if (!hasField) {
      throw new BadRequestException('At least one field is required');
    }
  }

  toBookDto(book: Book): BookDto {
    return {
      id: book.id,
      user_id: book.userId,
      title: book.title,
      authors: book.authors,
      isbn_13: book.isbn13,
      isbn_10: book.isbn10,
      cover_image_url: book.coverImageUrl,
      page_count: book.pageCount,
      genre: book.genre,
      series_name: book.seriesName,
      publication_year: book.publicationYear,
      data_source: book.dataSource,
      external_provider_id: book.externalProviderId,
      notes: book.notes,
      audience: book.audience,
      audience_id: book.audienceId,
      created_at: book.createdAt.toISOString(),
      updated_at: book.updatedAt.toISOString(),
    };
  }

  private async resolveAudienceId(
    userId: string,
    audienceId: string | null | undefined,
  ): Promise<string | null> {
    if (audienceId === undefined || audienceId === null) {
      return null;
    }

    const audience = await this.audiencesService.findOwnedById(userId, audienceId);
    if (!audience) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Audience not found for this user',
        code: 'AUDIENCE_NOT_FOUND',
      });
    }

    return audience.id;
  }
}
