import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { CatalogEdition } from '../books/entities/catalog-edition.entity';
import { UserBookOverride } from '../books/entities/user-book-override.entity';
import { BookMetadataResolver } from '../books/book-metadata.resolver';
import { ReadingRecord } from '../books/entities/reading-record.entity';
import { Audience } from '../audiences/entities/audience.entity';
import { Format } from '../formats/entities/format.entity';
import { Genre } from '../genres/entities/genre.entity';
import type {
  AudienceCountDto,
  FormatCountDto,
  GenreCountDto,
  MonthlyStatsResponseDto,
  MonthBucketDto,
  PeriodBookSummaryDto,
  RatingCountDto,
  YearBucketDto,
} from './dto/monthly-stats-response.dto';
import type { YearlyStatsResponseDto } from './dto/yearly-stats-response.dto';
import {
  generateStatsInsights,
  monthBaselineLabel,
  monthlyScopeKey,
  previousMonth,
  yearBaselineLabel,
  yearlyScopeKey,
} from './stats-insights';

const UNKNOWN_BUCKET = 'unknown';

interface AggregateRow {
  booksRead: string | number | null;
  pagesRead: string | number | null;
  avgRating: string | number | null;
}

interface DistributionRow {
  key: string | null;
  count: string | number | null;
}

interface TimeBucketRow {
  bucket: string | number | null;
  booksRead: string | number | null;
  pagesRead: string | number | null;
}

interface PeriodBookRow {
  id: string;
  title: string;
  authors: string;
  coverImageUrl: string | null;
  finishedOn: string;
}

interface PeriodAggregate {
  books_read: number;
  pages_read: number;
  average_rating: number | null;
  genre_distribution: GenreCountDto[];
  format_distribution: FormatCountDto[];
  predominant_format: string | null;
  audience_distribution: AudienceCountDto[];
  rating_distribution: RatingCountDto[];
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(ReadingRecord)
    private readonly readingRepo: Repository<ReadingRecord>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  async getMonthlyStats(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyStatsResponseDto> {
    const { periodStart, periodEnd } = StatsService.monthBounds(year, month);
    const previous = previousMonth(year, month);
    const previousBounds = StatsService.monthBounds(
      previous.year,
      previous.month,
    );
    const [aggregate, monthlyBreakdown, booksInPeriod, previousBooksRead] =
      await Promise.all([
        this.aggregateStats(userId, periodStart, periodEnd),
        this.monthlyBreakdown(userId, year),
        this.booksInPeriod(userId, periodStart, periodEnd),
        this.countBooksInPeriod(
          userId,
          previousBounds.periodStart,
          previousBounds.periodEnd,
        ),
      ]);

    const insights = generateStatsInsights({
      scopeKey: monthlyScopeKey(year, month),
      periodMode: 'month',
      year,
      month,
      booksRead: aggregate.books_read,
      pagesRead: aggregate.pages_read,
      averageRating: aggregate.average_rating,
      genreDistribution: aggregate.genre_distribution,
      formatDistribution: aggregate.format_distribution,
      predominantFormat: aggregate.predominant_format,
      previousBooksRead,
      baselineLabel: monthBaselineLabel(previous.year, previous.month),
    });

    return {
      year,
      month,
      ...aggregate,
      monthly_breakdown: monthlyBreakdown,
      books_in_period: booksInPeriod,
      insights,
    };
  }

  async getYearlyStats(
    userId: string,
    year: number,
  ): Promise<YearlyStatsResponseDto> {
    const { periodStart, periodEnd } = StatsService.yearBounds(year);
    const previousYear = year - 1;
    const previousBounds = StatsService.yearBounds(previousYear);
    const [aggregate, yearlyBreakdown, booksInPeriod, previousBooksRead] =
      await Promise.all([
        this.aggregateStats(userId, periodStart, periodEnd),
        this.yearlyBreakdown(userId, year),
        this.booksInPeriod(userId, periodStart, periodEnd),
        this.countBooksInPeriod(
          userId,
          previousBounds.periodStart,
          previousBounds.periodEnd,
        ),
      ]);

    const insights = generateStatsInsights({
      scopeKey: yearlyScopeKey(year),
      periodMode: 'year',
      year,
      booksRead: aggregate.books_read,
      pagesRead: aggregate.pages_read,
      averageRating: aggregate.average_rating,
      genreDistribution: aggregate.genre_distribution,
      formatDistribution: aggregate.format_distribution,
      predominantFormat: aggregate.predominant_format,
      previousBooksRead,
      baselineLabel: yearBaselineLabel(previousYear),
    });

    return {
      year,
      ...aggregate,
      yearly_breakdown: yearlyBreakdown,
      books_in_period: booksInPeriod,
      insights,
    };
  }

  private effectivePageCountSql(): string {
    const dialect = this.isPostgres() ? 'postgres' : 'sqlite';
    const isOverridden =
      dialect === 'postgres'
        ? `ubo.overridden_fields::jsonb ? 'page_count'`
        : `instr(ubo.overridden_fields, '"page_count"') > 0`;
    return `COALESCE(CASE WHEN ${isOverridden} THEN ubo.page_count ELSE ce.page_count END, 0)`;
  }

  private sqlDialect(): 'postgres' | 'sqlite' {
    return this.isPostgres() ? 'postgres' : 'sqlite';
  }

  private joinEffectiveBibliographic(
    qb: ReturnType<Repository<ReadingRecord>['createQueryBuilder']>,
  ) {
    return qb
      .innerJoin(Book, 'b', 'b.id = rr.bookId')
      .innerJoin(CatalogEdition, 'ce', 'ce.id = b.catalogEditionId')
      .leftJoin(UserBookOverride, 'ubo', 'ubo.userBookId = b.id');
  }

  private async aggregateStats(
    userId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<PeriodAggregate> {
    const pageCountExpr = this.effectivePageCountSql();
    const totals = await this.joinEffectiveBibliographic(
      this.readingRepo.createQueryBuilder('rr'),
    )
      .select('COUNT(*)', 'booksRead')
      .addSelect(`COALESCE(SUM(${pageCountExpr}), 0)`, 'pagesRead')
      .addSelect('AVG(rr.rating)', 'avgRating')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :periodStart', { periodStart })
      .andWhere('rr.finishedOn < :periodEnd', { periodEnd })
      .getRawOne<AggregateRow>();

    const genreDistribution: GenreCountDto[] =
      await this.genreDistribution(userId, periodStart, periodEnd);

    const formatDistribution: FormatCountDto[] =
      await this.formatDistribution(userId, periodStart, periodEnd);

    const audienceDistribution: AudienceCountDto[] =
      await this.audienceDistribution(userId, periodStart, periodEnd);

    const ratingDistribution: RatingCountDto[] =
      await this.ratingDistribution(userId, periodStart, periodEnd);

    return {
      books_read: StatsService.toInt(totals?.booksRead),
      pages_read: StatsService.toInt(totals?.pagesRead),
      average_rating: StatsService.roundAverage(totals?.avgRating),
      genre_distribution: genreDistribution,
      format_distribution: formatDistribution,
      predominant_format:
        StatsService.pickPredominantFormat(formatDistribution),
      audience_distribution: audienceDistribution,
      rating_distribution: ratingDistribution,
    };
  }

  private async genreDistribution(
    userId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<GenreCountDto[]> {
    const rows = await this.readingRepo
      .createQueryBuilder('rr')
      .innerJoin(Book, 'b', 'b.id = rr.bookId')
      .leftJoin(Genre, 'g', 'g.id = b.genreId')
      .select('COALESCE(g.name, :unknown)', 'key')
      .addSelect('COUNT(*)', 'count')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :periodStart', { periodStart })
      .andWhere('rr.finishedOn < :periodEnd', { periodEnd })
      .groupBy('COALESCE(g.name, :unknown)')
      .orderBy('COUNT(*)', 'DESC')
      .setParameter('unknown', UNKNOWN_BUCKET)
      .getRawMany<DistributionRow>();

    return rows.map((row) => ({
      genre: row.key ?? UNKNOWN_BUCKET,
      count: StatsService.toInt(row.count),
    }));
  }

  private async formatDistribution(
    userId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<FormatCountDto[]> {
    const rows = await this.readingRepo
      .createQueryBuilder('rr')
      .innerJoin(Book, 'b', 'b.id = rr.bookId')
      .leftJoin(Format, 'f', 'f.id = rr.formatId')
      .select('COALESCE(f.name, :unknown)', 'key')
      .addSelect('COUNT(*)', 'count')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :periodStart', { periodStart })
      .andWhere('rr.finishedOn < :periodEnd', { periodEnd })
      .groupBy('COALESCE(f.name, :unknown)')
      .orderBy('COUNT(*)', 'DESC')
      .setParameter('unknown', UNKNOWN_BUCKET)
      .getRawMany<DistributionRow>();

    return rows.map((row) => ({
      format: StatsService.formatDistributionKey(row.key),
      count: StatsService.toInt(row.count),
    }));
  }

  private async audienceDistribution(
    userId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<AudienceCountDto[]> {
    const rows = await this.readingRepo
      .createQueryBuilder('rr')
      .innerJoin(Book, 'b', 'b.id = rr.bookId')
      .leftJoin(Audience, 'a', 'a.id = b.audienceId')
      .select('COALESCE(a.name, :unknown)', 'key')
      .addSelect('COUNT(*)', 'count')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :periodStart', { periodStart })
      .andWhere('rr.finishedOn < :periodEnd', { periodEnd })
      .groupBy('COALESCE(a.name, :unknown)')
      .orderBy('COUNT(*)', 'DESC')
      .setParameter('unknown', UNKNOWN_BUCKET)
      .getRawMany<DistributionRow>();

    return rows.map((row) => ({
      audience: StatsService.audienceDistributionKey(row.key),
      count: StatsService.toInt(row.count),
    }));
  }

  private async distribution(
    userId: string,
    periodStart: string,
    periodEnd: string,
    column: string,
  ): Promise<Array<{ label: string; count: number }>> {
    const rows = await this.readingRepo
      .createQueryBuilder('rr')
      .innerJoin(Book, 'b', 'b.id = rr.bookId')
      .select(`COALESCE(${column}, :unknown)`, 'key')
      .addSelect('COUNT(*)', 'count')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :periodStart', { periodStart })
      .andWhere('rr.finishedOn < :periodEnd', { periodEnd })
      .groupBy(`COALESCE(${column}, :unknown)`)
      .orderBy('COUNT(*)', 'DESC')
      .setParameter('unknown', UNKNOWN_BUCKET)
      .getRawMany<DistributionRow>();

    return rows.map((row) => ({
      label: row.key ?? UNKNOWN_BUCKET,
      count: StatsService.toInt(row.count),
    }));
  }

  private async ratingDistribution(
    userId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<RatingCountDto[]> {
    const rows = await this.readingRepo
      .createQueryBuilder('rr')
      .innerJoin(Book, 'b', 'b.id = rr.bookId')
      .select('rr.rating', 'key')
      .addSelect('COUNT(*)', 'count')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :periodStart', { periodStart })
      .andWhere('rr.finishedOn < :periodEnd', { periodEnd })
      .andWhere('rr.rating IS NOT NULL')
      .groupBy('rr.rating')
      .orderBy('rr.rating', 'ASC')
      .getRawMany<DistributionRow>();

    return rows.map((row) => ({
      rating: StatsService.roundAverage(row.key) ?? 0,
      count: StatsService.toInt(row.count),
    }));
  }

  private async booksInPeriod(
    userId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<PeriodBookSummaryDto[]> {
    const titleExpr = BookMetadataResolver.effectiveSql(
      'title',
      'title',
      'ubo',
      'ce',
      this.sqlDialect(),
    );
    const authorsExpr = BookMetadataResolver.effectiveSql(
      'authors',
      'authors',
      'ubo',
      'ce',
      this.sqlDialect(),
    );
    const coverExpr = BookMetadataResolver.effectiveSql(
      'cover_image_url',
      'cover_image_url',
      'ubo',
      'ce',
      this.sqlDialect(),
    );

    const rows = await this.joinEffectiveBibliographic(
      this.readingRepo.createQueryBuilder('rr'),
    )
      .select('b.id', 'id')
      .addSelect(titleExpr, 'title')
      .addSelect(authorsExpr, 'authors')
      .addSelect(coverExpr, 'coverImageUrl')
      .addSelect('rr.finishedOn', 'finishedOn')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :periodStart', { periodStart })
      .andWhere('rr.finishedOn < :periodEnd', { periodEnd })
      .orderBy('rr.finishedOn', 'ASC')
      .addOrderBy(titleExpr, 'ASC')
      .getRawMany<PeriodBookRow>();

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      authors: row.authors,
      cover_image_url: row.coverImageUrl ?? null,
      finished_on: row.finishedOn,
    }));
  }

  private async countBooksInPeriod(
    userId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<number> {
    const row = await this.readingRepo
      .createQueryBuilder('rr')
      .innerJoin(Book, 'b', 'b.id = rr.bookId')
      .select('COUNT(*)', 'booksRead')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :periodStart', { periodStart })
      .andWhere('rr.finishedOn < :periodEnd', { periodEnd })
      .getRawOne<AggregateRow>();

    return StatsService.toInt(row?.booksRead);
  }

  private isPostgres(): boolean {
    return this.readingRepo.manager.connection.options.type === 'postgres';
  }

  private monthBucketExpression(): string {
    return this.isPostgres()
      ? 'EXTRACT(MONTH FROM rr.finishedOn)'
      : 'CAST(SUBSTR(rr.finishedOn, 6, 2) AS INTEGER)';
  }

  private yearBucketExpression(): string {
    return this.isPostgres()
      ? 'EXTRACT(YEAR FROM rr.finishedOn)'
      : 'CAST(SUBSTR(rr.finishedOn, 1, 4) AS INTEGER)';
  }

  private async monthlyBreakdown(
    userId: string,
    year: number,
  ): Promise<MonthBucketDto[]> {
    const { periodStart, periodEnd } = StatsService.yearBounds(year);
    const pageCountExpr = this.effectivePageCountSql();
    const monthExpr = this.monthBucketExpression();
    const rows = await this.joinEffectiveBibliographic(
      this.readingRepo.createQueryBuilder('rr'),
    )
      .select(monthExpr, 'bucket')
      .addSelect('COUNT(*)', 'booksRead')
      .addSelect(`COALESCE(SUM(${pageCountExpr}), 0)`, 'pagesRead')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :periodStart', { periodStart })
      .andWhere('rr.finishedOn < :periodEnd', { periodEnd })
      .groupBy('bucket')
      .orderBy('bucket', 'ASC')
      .getRawMany<TimeBucketRow>();

    const byMonth = new Map(
      rows.map((row) => [
        StatsService.toInt(row.bucket),
        {
          books_read: StatsService.toInt(row.booksRead),
          pages_read: StatsService.toInt(row.pagesRead),
        },
      ]),
    );

    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const bucket = byMonth.get(month);
      return {
        month,
        books_read: bucket?.books_read ?? 0,
        pages_read: bucket?.pages_read ?? 0,
      };
    });
  }

  private async yearlyBreakdown(
    userId: string,
    upToYear: number,
  ): Promise<YearBucketDto[]> {
    const pageCountExpr = this.effectivePageCountSql();
    const yearExpr = this.yearBucketExpression();
    const rows = await this.joinEffectiveBibliographic(
      this.readingRepo.createQueryBuilder('rr'),
    )
      .select(yearExpr, 'bucket')
      .addSelect('COUNT(*)', 'booksRead')
      .addSelect(`COALESCE(SUM(${pageCountExpr}), 0)`, 'pagesRead')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere(`${yearExpr} <= :upToYear`, {
        upToYear,
      })
      .groupBy('bucket')
      .orderBy('bucket', 'ASC')
      .getRawMany<TimeBucketRow>();

    const buckets = rows
      .map((row) => ({
        year: StatsService.toInt(row.bucket),
        books_read: StatsService.toInt(row.booksRead),
        pages_read: StatsService.toInt(row.pagesRead),
      }))
      .filter((entry) => entry.year >= 1970);

    if (buckets.length <= 15) {
      return buckets;
    }

    return buckets.slice(-15);
  }

  static monthBounds(
    year: number,
    month: number,
  ): { periodStart: string; periodEnd: string } {
    const mm = String(month).padStart(2, '0');
    const periodStart = `${year}-${mm}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const periodEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
    return { periodStart, periodEnd };
  }

  static yearBounds(year: number): { periodStart: string; periodEnd: string } {
    return {
      periodStart: `${year}-01-01`,
      periodEnd: `${year + 1}-01-01`,
    };
  }

  static validateYear(year: number): void {
    if (!Number.isInteger(year) || year < 1970 || year > 2100) {
      throw new BadRequestException('year must be between 1970 and 2100');
    }
  }

  static validate(year: number, month: number): void {
    StatsService.validateYear(year);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('month must be between 1 and 12');
    }
  }

  static audienceDistributionKey(
    audienceName: string | null | undefined,
  ): string {
    if (!audienceName || audienceName === UNKNOWN_BUCKET) {
      return UNKNOWN_BUCKET;
    }
    return audienceName;
  }

  static formatDistributionKey(
    formatName: string | null | undefined,
  ): string {
    if (!formatName || formatName === UNKNOWN_BUCKET) {
      return UNKNOWN_BUCKET;
    }
    return formatName;
  }

  static toInt(value: string | number | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
  }

  static roundAverage(
    value: string | number | null | undefined,
  ): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return Math.round(parsed * 100) / 100;
  }

  static pickPredominantFormat(distribution: FormatCountDto[]): string | null {
    const candidates = distribution.filter(
      (entry) => entry.format !== UNKNOWN_BUCKET && entry.count > 0,
    );
    if (candidates.length === 0) {
      return null;
    }
    candidates.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.format.localeCompare(b.format, 'es', { sensitivity: 'base' });
    });
    return candidates[0].format;
  }
}
