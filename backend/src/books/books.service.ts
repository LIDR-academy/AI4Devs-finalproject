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
import { BookMetadataResolver } from './book-metadata.resolver';
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
import { OpenLibraryEnrichmentService } from './catalog/open-library-enrichment.service';
import { CatalogEditionsService } from './catalog/catalog-editions.service';
import { UserBookOverridesService } from './user-book-overrides.service';
import { AudiencesService } from '../audiences/audiences.service';
import { FormatsService } from '../formats/formats.service';
import { GenresService } from '../genres/genres.service';
import { legacySlugFromFormatName } from '../formats/formats.constants';
import { TbrService } from '../lists/tbr.service';
import { Book } from './entities/book.entity';
import { ReadingRecord } from './entities/reading-record.entity';
import { normalizeRating } from './validators/half-step-rating.validator';

const BOOK_RELATIONS = [
  'catalogEdition',
  'override',
  'genreRef',
  'readingRecord',
  'readingRecord.formatRef',
] as const;

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
    @InjectRepository(ReadingRecord)
    private readonly readingRepo: Repository<ReadingRecord>,
    private readonly catalogEditions: CatalogEditionsService,
    private readonly metadataResolver: BookMetadataResolver,
    private readonly overridesService: UserBookOverridesService,
    private readonly openLibraryEnrichment: OpenLibraryEnrichmentService,
    private readonly googleBooksClient: GoogleBooksClient,
    private readonly audiencesService: AudiencesService,
    private readonly formatsService: FormatsService,
    private readonly genresService: GenresService,
    @Inject(forwardRef(() => TbrService))
    private readonly tbrService: TbrService,
  ) {}

  async listForUser(userId: string): Promise<BookListItemDto[]> {
    const books = await this.booksRepo.find({
      where: { userId },
      relations: [...BOOK_RELATIONS],
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
      relations: [...BOOK_RELATIONS],
    });
    if (!book?.readingRecord || !book.catalogEdition) {
      throw new NotFoundException('Book not found');
    }

    const reading = book.readingRecord;
    const previousStatus = reading.status;
    const effectivePageCount = this.metadataResolver.resolveEffective(
      book.catalogEdition,
      book.override,
    ).page_count;

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
            message: 'Formato no encontrado para este usuario',
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
      if (effectivePageCount != null) {
        reading.currentPage = effectivePageCount;
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
        message: 'La fecha de fin no puede ser anterior a la de inicio',
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
      book: { id: book.id, page_count: effectivePageCount },
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
    const metadata = await this.resolveMetadata(dto);
    const catalogEdition = await this.catalogEditions.upsertFromCreateDto({
      ...dto,
      page_count: metadata.page_count ?? dto.page_count ?? null,
    });

    await this.assertNotDuplicate(userId, catalogEdition.id, dto);
    const audienceId = await this.resolveAudienceId(userId, dto.audience_id);
    const genreId = await this.resolveGenreId(userId, dto.genre_id);

    const book = this.booksRepo.create({
      userId,
      catalogEditionId: catalogEdition.id,
      genreId,
      notes: dto.notes ?? null,
      audience: dto.audience ?? null,
      audienceId,
    });

    const saved = await this.booksRepo.save(book);
    const reloaded = await this.findBookWithRelations(saved.id);

    const reading = this.readingRepo.create({
      bookId: saved.id,
      status: 'pendiente',
    });
    await this.readingRepo.save(reading);

    return {
      book: this.toBookDto(reloaded ?? saved),
      reading: { book_id: saved.id, status: 'pendiente' },
    };
  }

  private async resolveMetadata(
    dto: CreateBookDto,
  ): Promise<{ page_count: number | null }> {
    let page_count = dto.page_count ?? null;

    if (page_count) {
      return { page_count };
    }

    const existing =
      (dto.isbn_13
        ? await this.catalogEditions.findByIsbn(dto.isbn_13)
        : null) ??
      (dto.external_provider_id && dto.data_source
        ? await this.catalogEditions.findByProvider(
            dto.data_source,
            dto.external_provider_id,
          )
        : null);

    if (existing?.pageCount != null) {
      return { page_count: existing.pageCount };
    }

    if (dto.data_source === 'open_library' && dto.external_provider_id) {
      const enriched = await this.openLibraryEnrichment.enrichEdition(
        {
          title: dto.title,
          authors: dto.authors,
          cover_image_url: dto.cover_image_url ?? null,
          page_count,
          genre: null,
          isbn_13: dto.isbn_13 ?? null,
          isbn_10: dto.isbn_10 ?? null,
          data_source: 'open_library',
          external_provider_id: dto.external_provider_id,
        },
        { resolveGenre: false },
      );
      page_count = page_count ?? enriched.page_count;
    }

    if (
      dto.data_source === 'google_books' &&
      dto.external_provider_id &&
      !page_count
    ) {
      const volume = await this.googleBooksClient.getVolumeDetails(
        dto.external_provider_id,
      );
      if (volume) {
        page_count = page_count ?? volume.page_count;
      }
    }

    return { page_count };
  }

  private async assertNotDuplicate(
    userId: string,
    catalogEditionId: string,
    dto: CreateBookDto,
  ): Promise<void> {
    const byCatalog = await this.booksRepo.findOne({
      where: { userId, catalogEditionId },
    });
    if (byCatalog) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Este libro ya está en tu biblioteca',
        code: 'BOOK_DUPLICATE',
        existingBookId: byCatalog.id,
      });
    }

    if (dto.isbn_13) {
      const catalog = await this.catalogEditions.findByIsbn(dto.isbn_13);
      if (catalog && catalog.id !== catalogEditionId) {
        const byIsbn = await this.booksRepo.findOne({
          where: { userId, catalogEditionId: catalog.id },
        });
        if (byIsbn) {
          throw new ConflictException({
            statusCode: 409,
            message: 'Este libro ya está en tu biblioteca',
            code: 'BOOK_DUPLICATE',
            existingBookId: byIsbn.id,
          });
        }
      }
    }
  }

  async findOneForUser(userId: string, bookId: string): Promise<Book> {
    const book = await this.booksRepo.findOne({
      where: { id: bookId, userId },
      relations: [...BOOK_RELATIONS],
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
    if (!book.catalogEdition) {
      throw new NotFoundException('Book not found');
    }

    await this.overridesService.applyBibliographicPatch(
      bookId,
      book.catalogEdition,
      dto,
    );

    const bookUpdates: Partial<Book> = {};
    if (dto.genre_id !== undefined) {
      bookUpdates.genreId = await this.resolveGenreId(userId, dto.genre_id);
    }
    if (dto.audience !== undefined) {
      bookUpdates.audience = dto.audience;
    }
    if (dto.audience_id !== undefined) {
      bookUpdates.audienceId = await this.resolveAudienceId(
        userId,
        dto.audience_id,
      );
    }
    if (dto.notes !== undefined) {
      bookUpdates.notes = dto.notes;
    }

    if (Object.keys(bookUpdates).length > 0) {
      await this.booksRepo.update(bookId, bookUpdates);
    }

    const reloaded = await this.findBookWithRelations(bookId);
    return this.toBookDto(reloaded ?? book);
  }

  private async findBookWithRelations(bookId: string): Promise<Book | null> {
    return this.booksRepo.findOne({
      where: { id: bookId },
      relations: [...BOOK_RELATIONS],
    });
  }

  private assertPatchBookHasFields(dto: PatchBookDto): void {
    const hasField =
      dto.title !== undefined ||
      dto.authors !== undefined ||
      dto.cover_image_url !== undefined ||
      dto.page_count !== undefined ||
      dto.genre_id !== undefined ||
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
    if (!book.catalogEdition) {
      throw new Error(`Book ${book.id} is missing catalog edition relation`);
    }
    return this.metadataResolver.toBookDto(
      book,
      book.catalogEdition,
      book.override,
    );
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
        message: 'Público objetivo no encontrado para este usuario',
        code: 'AUDIENCE_NOT_FOUND',
      });
    }

    return audience.id;
  }

  private async resolveGenreId(
    userId: string,
    genreId: string | null | undefined,
  ): Promise<string | null> {
    if (genreId === undefined || genreId === null) {
      return null;
    }

    const genre = await this.genresService.findOwnedById(userId, genreId);
    if (!genre) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Género no encontrado para este usuario',
        code: 'GENRE_NOT_FOUND',
      });
    }

    return genre.id;
  }
}
