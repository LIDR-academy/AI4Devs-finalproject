import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { BookMetadataResolver } from '../books/book-metadata.resolver';
import {
  MonthlyTbrListDto,
  MonthlyTbrResponseDto,
  TbrEntryDto,
} from './dto/tbr-response.dto';
import { MonthlyTbrList } from './entities/monthly-tbr-list.entity';
import { TbrEntry } from './entities/tbr-entry.entity';

@Injectable()
export class TbrService {
  constructor(
    @InjectRepository(MonthlyTbrList)
    private readonly listRepo: Repository<MonthlyTbrList>,
    @InjectRepository(TbrEntry)
    private readonly entryRepo: Repository<TbrEntry>,
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
    private readonly metadataResolver: BookMetadataResolver,
  ) {}

  async getOrCreateMonthlyTbr(
    userId: string,
    year: number,
    month: number,
    options?: { autoCreated?: boolean },
  ): Promise<MonthlyTbrResponseDto> {
    this.assertValidMonth(year, month);

    let list = await this.listRepo.findOne({
      where: { userId, year, month },
    });

    if (!list) {
      list = this.listRepo.create({
        userId,
        year,
        month,
        listStatus: 'active',
        autoCreated: options?.autoCreated ?? false,
      });
      try {
        list = await this.listRepo.save(list);
      } catch {
        list = await this.listRepo.findOneOrFail({
          where: { userId, year, month },
        });
      }
    }

    const entries = await this.entryRepo.find({
      where: { monthlyTbrId: list.id },
      relations: [
        'book',
        'book.catalogEdition',
        'book.override',
        'book.readingRecord',
      ],
      order: { sortOrder: 'ASC' },
    });

    return {
      list: this.toListDto(list),
      entries: entries.map((e) => this.toEntryDto(e)),
    };
  }

  async addEntry(
    userId: string,
    year: number,
    month: number,
    bookId: string,
  ): Promise<TbrEntryDto> {
    this.assertValidMonth(year, month);

    const book = await this.booksRepo.findOne({
      where: { id: bookId, userId },
      relations: ['readingRecord', 'catalogEdition', 'override'],
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const status = book.readingRecord?.status ?? 'pendiente';
    if (status !== 'pendiente') {
      throw new UnprocessableEntityException({
        statusCode: 422,
            message: 'Solo se pueden añadir libros pendientes a la lista TBR',
        code: 'TBR_BOOK_NOT_PENDING',
      });
    }

    const { list } = await this.getOrCreateMonthlyTbr(userId, year, month);

    const existing = await this.entryRepo.findOne({
      where: { monthlyTbrId: list.id, bookId },
      relations: ['book', 'book.readingRecord'],
    });
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Este libro ya está en esta lista TBR',
        code: 'TBR_ENTRY_DUPLICATE',
      });
    }

    const maxSort = await this.entryRepo
      .createQueryBuilder('e')
      .select('MAX(e.sort_order)', 'max')
      .where('e.monthly_tbr_id = :listId', { listId: list.id })
      .getRawOne<{ max: number | null }>();

    const entry = this.entryRepo.create({
      monthlyTbrId: list.id,
      bookId,
      sortOrder: (maxSort?.max ?? 0) + 1,
      completed: false,
    });
    const saved = await this.entryRepo.save(entry);
    saved.book = book;

    return this.toEntryDto(saved);
  }

  async removeEntry(
    userId: string,
    year: number,
    month: number,
    entryId: string,
  ): Promise<void> {
    this.assertValidMonth(year, month);

    const list = await this.listRepo.findOne({
      where: { userId, year, month },
    });
    if (!list) {
      throw new NotFoundException('TBR entry not found');
    }

    const entry = await this.entryRepo.findOne({
      where: { id: entryId, monthlyTbrId: list.id },
    });
    if (!entry) {
      throw new NotFoundException('TBR entry not found');
    }

    await this.entryRepo.remove(entry);
  }

  async markCompletedIfInActiveMonthTbr(
    userId: string,
    bookId: string,
    finishedOn: string | null,
  ): Promise<boolean> {
    const referenceDate = finishedOn ?? this.utcToday();
    const { year, month } = this.parseYearMonth(referenceDate);

    const list = await this.listRepo.findOne({
      where: { userId, year, month },
    });
    if (!list) {
      return false;
    }

    const entry = await this.entryRepo.findOne({
      where: { monthlyTbrId: list.id, bookId, completed: false },
    });
    if (!entry) {
      return false;
    }

    entry.completed = true;
    entry.completedAt = new Date().toISOString();
    await this.entryRepo.save(entry);
    return true;
  }

  async autoCreateForUpcomingMonth(userId: string): Promise<boolean> {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (tomorrow.getUTCDate() !== 1) {
      return false;
    }

    const year = tomorrow.getUTCFullYear();
    const month = tomorrow.getUTCMonth() + 1;

    const existing = await this.listRepo.findOne({
      where: { userId, year, month },
    });
    if (existing) {
      return false;
    }

    await this.getOrCreateMonthlyTbr(userId, year, month, {
      autoCreated: true,
    });
    return true;
  }

  async runAutoCreateJobForAllUsers(): Promise<number> {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (tomorrow.getUTCDate() !== 1) {
      return 0;
    }

    const users = await this.listRepo.manager.query<{ id: string }[]>(
      `SELECT id FROM users`,
    );

    let created = 0;
    for (const user of users) {
      const didCreate = await this.autoCreateForUpcomingMonth(user.id);
      if (didCreate) {
        created += 1;
      }
    }
    return created;
  }

  private assertValidMonth(year: number, month: number): void {
    if (year < 1970 || year > 2100 || month < 1 || month > 12) {
      throw new BadRequestException('Invalid year or month');
    }
  }

  private parseYearMonth(isoDate: string): { year: number; month: number } {
    const [yearStr, monthStr] = isoDate.split('-');
    return { year: Number(yearStr), month: Number(monthStr) };
  }

  private utcToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toListDto(list: MonthlyTbrList): MonthlyTbrListDto {
    return {
      id: list.id,
      year: list.year,
      month: list.month,
      auto_created: list.autoCreated,
      created_at: list.createdAt.toISOString(),
      updated_at: list.updatedAt.toISOString(),
    };
  }

  private toEntryDto(entry: TbrEntry): TbrEntryDto {
    const status = entry.book?.readingRecord?.status ?? 'pendiente';
    const catalog = entry.book?.catalogEdition;
    const effective = catalog
      ? this.metadataResolver.resolveEffective(catalog, entry.book.override)
      : null;
    return {
      id: entry.id,
      book_id: entry.bookId,
      sort_order: entry.sortOrder,
      completed: entry.completed,
      completed_at: entry.completedAt,
      added_at: entry.addedAt.toISOString(),
      book: {
        id: entry.book.id,
        title: effective?.title ?? '',
        authors: effective?.authors ?? '',
        cover_image_url: effective?.cover_image_url ?? null,
        reading_status: status,
      },
    };
  }
}
