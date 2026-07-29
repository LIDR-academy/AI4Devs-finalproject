import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { ReadingRecord } from '../books/entities/reading-record.entity';
import type {
  AnnualGoalResponseDto,
  GoalForecastDto,
  GoalForecastStatus,
} from './dto/goal-response.dto';
import { AnnualReadingGoal } from './entities/annual-reading-goal.entity';

const MS_PER_DAY = 86_400_000;

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(AnnualReadingGoal)
    private readonly goalRepo: Repository<AnnualReadingGoal>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(ReadingRecord)
    private readonly readingRepo: Repository<ReadingRecord>,
  ) {}

  async getGoalWithProgress(
    userId: string,
    year: number,
  ): Promise<AnnualGoalResponseDto> {
    const goal = await this.goalRepo.findOne({ where: { userId, year } });
    const booksRead = await this.countBooksReadInYear(userId, year);
    const progressPercent =
      goal !== null
        ? Math.round((booksRead / goal.targetBookCount) * 100)
        : null;
    const forecast =
      goal !== null
        ? this.computeForecast(
            year,
            booksRead,
            goal.targetBookCount,
            await this.getFirstFinishedOnInYear(userId, year),
          )
        : null;

    return {
      year,
      goal: goal ? this.toGoalDto(goal) : null,
      books_read: booksRead,
      progress_percent: progressPercent,
      forecast,
    };
  }

  async upsertGoal(
    userId: string,
    year: number,
    targetBookCount: number,
  ): Promise<AnnualGoalResponseDto> {
    let goal = await this.goalRepo.findOne({ where: { userId, year } });
    if (goal) {
      goal.targetBookCount = targetBookCount;
    } else {
      goal = this.goalRepo.create({
        userId,
        year,
        targetBookCount,
      });
    }
    await this.goalRepo.save(goal);
    return this.getGoalWithProgress(userId, year);
  }

  async countBooksReadInYear(userId: string, year: number): Promise<number> {
    const { yearStart, yearEnd } = this.yearBounds(year);
    return this.readingRepo
      .createQueryBuilder('rr')
      .innerJoin(Book, 'b', 'b.id = rr.bookId')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :yearStart', { yearStart })
      .andWhere('rr.finishedOn < :yearEnd', { yearEnd })
      .getCount();
  }

  computeForecast(
    year: number,
    booksRead: number,
    target: number,
    firstFinishedOn: string | null,
    now: Date = new Date(),
  ): GoalForecastDto | null {
    if (booksRead < 1) {
      return null;
    }

    const periodStart = this.forecastPeriodStart(year, firstFinishedOn);
    const todayUtc = this.utcDateOnly(now);
    const daysElapsed = this.inclusiveDaysBetween(periodStart, todayUtc);
    if (daysElapsed < 7) {
      return null;
    }

    const daysInYear = this.isLeapYear(year) ? 366 : 365;
    const projected = Math.round((booksRead / daysElapsed) * daysInYear);
    const pace = Math.round((booksRead / daysElapsed) * 7 * 10) / 10;

    const yearEnd = this.utcDateOnly(new Date(Date.UTC(year, 11, 31)));
    const daysRemaining = Math.max(
      0,
      this.inclusiveDaysBetween(todayUtc, yearEnd) - 1,
    );
    const weeksRemaining = Math.max(daysRemaining / 7, 1 / 7);
    const booksRemaining = Math.max(0, target - booksRead);
    const required =
      booksRemaining === 0
        ? 0
        : Math.round((booksRemaining / weeksRemaining) * 10) / 10;

    const onTrack = projected >= target;
    const status = this.forecastStatus(projected, target);

    return {
      projected_year_end_count: projected,
      on_track: onTrack,
      pace_books_per_week: pace,
      required_books_per_week: required,
      status,
    };
  }

  private forecastStatus(
    projected: number,
    target: number,
  ): GoalForecastStatus {
    if (projected > target * 1.1) {
      return 'ahead';
    }
    if (projected < target) {
      return 'behind';
    }
    return 'on_track';
  }

  private async getFirstFinishedOnInYear(
    userId: string,
    year: number,
  ): Promise<string | null> {
    const { yearStart, yearEnd } = this.yearBounds(year);
    const row = await this.readingRepo
      .createQueryBuilder('rr')
      .select('MIN(rr.finishedOn)', 'minDate')
      .innerJoin(Book, 'b', 'b.id = rr.bookId')
      .where('b.userId = :userId', { userId })
      .andWhere('rr.status = :status', { status: 'leido' })
      .andWhere('rr.finishedOn >= :yearStart', { yearStart })
      .andWhere('rr.finishedOn < :yearEnd', { yearEnd })
      .getRawOne<{ minDate: string | null }>();
    return row?.minDate ?? null;
  }

  private yearBounds(year: number): { yearStart: string; yearEnd: string } {
    return {
      yearStart: `${year}-01-01`,
      yearEnd: `${year + 1}-01-01`,
    };
  }

  private forecastPeriodStart(
    year: number,
    firstFinishedOn: string | null,
  ): Date {
    const jan1 = this.utcDateOnly(new Date(Date.UTC(year, 0, 1)));
    if (!firstFinishedOn) {
      return jan1;
    }
    const first = this.utcDateOnly(new Date(`${firstFinishedOn}T00:00:00Z`));
    return first > jan1 ? first : jan1;
  }

  private utcDateOnly(d: Date): Date {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
  }

  private inclusiveDaysBetween(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return Math.floor(diff / MS_PER_DAY) + 1;
  }

  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  private toGoalDto(goal: AnnualReadingGoal) {
    return {
      id: goal.id,
      target_book_count: goal.targetBookCount,
      created_at: goal.createdAt.toISOString(),
      updated_at: goal.updatedAt.toISOString(),
    };
  }

  static validateYear(year: number): void {
    if (!Number.isInteger(year) || year < 1970 || year > 2100) {
      throw new BadRequestException('year must be between 1970 and 2100');
    }
  }
}
