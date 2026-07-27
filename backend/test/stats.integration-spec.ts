import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AudiencesModule } from '../src/audiences/audiences.module';
import { Audience } from '../src/audiences/entities/audience.entity';
import { FormatsModule } from '../src/formats/formats.module';
import { Format } from '../src/formats/entities/format.entity';
import { AuthModule } from '../src/auth/auth.module';
import { BooksModule } from '../src/books/books.module';
import { Book } from '../src/books/entities/book.entity';
import { ReadingRecord } from '../src/books/entities/reading-record.entity';
import { GoalsModule } from '../src/goals/goals.module';
import { AnnualReadingGoal } from '../src/goals/entities/annual-reading-goal.entity';
import { ListsModule } from '../src/lists/lists.module';
import { MonthlyTbrList } from '../src/lists/entities/monthly-tbr-list.entity';
import { TbrEntry } from '../src/lists/entities/tbr-entry.entity';
import { StatsModule } from '../src/stats/stats.module';
import type { MonthlyStatsResponseDto } from '../src/stats/dto/monthly-stats-response.dto';
import type { YearlyStatsResponseDto } from '../src/stats/dto/yearly-stats-response.dto';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';

interface SeedBook {
  title: string;
  genre?: string | null;
  pageCount?: number | null;
  status?: 'leido' | 'leyendo';
  startedOn?: string;
  finishedOn?: string;
  rating?: number;
  readFormat?: 'fisico' | 'ebook' | 'audio';
  audienceId?: string | null;
}

const FORMAT_NAME_BY_LEGACY: Record<'fisico' | 'ebook' | 'audio', string> = {
  fisico: 'Físico',
  ebook: 'Ebook',
  audio: 'Audio',
};

describe('Stats API (integration)', () => {
  let app: INestApplication<App>;
  let token: string;

  async function login(email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/dev-login')
      .send({ email })
      .expect(201);
    return (res.body as { access_token: string }).access_token;
  }

  async function seedBook(authToken: string, book: SeedBook): Promise<void> {
    const createRes = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: book.title,
        authors: 'Test Author',
        data_source: 'manual',
        genre: book.genre ?? null,
        page_count: book.pageCount ?? null,
      })
      .expect(201);
    const bookId = (createRes.body as { book: { id: string } }).book.id;

    if (book.audienceId !== undefined) {
      await request(app.getHttpServer())
        .patch(`/v1/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ audience_id: book.audienceId })
        .expect(200);
    }

    const status = book.status ?? 'leido';
    const patch: Record<string, unknown> = {
      status,
      started_on: book.startedOn ?? '2025-01-01',
    };
    if (status === 'leido') {
      patch.finished_on = book.finishedOn ?? '2025-06-10';
    }
    if (book.rating !== undefined) {
      patch.rating = book.rating;
    }
    if (book.readFormat !== undefined) {
      const formatsRes = await request(app.getHttpServer())
        .get('/v1/formats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const format = (formatsRes.body as Array<{ id: string; name: string }>).find(
        (item) => item.name === FORMAT_NAME_BY_LEGACY[book.readFormat!],
      );
      patch.format_id = format?.id ?? null;
    }

    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(patch)
      .expect(200);
  }

  function getStats(authToken: string, year: number, month: number) {
    return request(app.getHttpServer())
      .get(`/v1/stats/${year}/${month}`)
      .set('Authorization', `Bearer ${authToken}`);
  }

  function getYearStats(authToken: string, year: number) {
    return request(app.getHttpServer())
      .get('/v1/stats')
      .query({ period: 'year', year })
      .set('Authorization', `Bearer ${authToken}`);
  }

  async function fetchStats(
    authToken: string,
    year: number,
    month: number,
  ): Promise<MonthlyStatsResponseDto> {
    const res = await getStats(authToken, year, month).expect(200);
    return res.body as MonthlyStatsResponseDto;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            User,
            Book,
            ReadingRecord,
            Audience,
            Format,
            AnnualReadingGoal,
            MonthlyTbrList,
            TbrEntry,
          ],
          synchronize: true,
        }),
        UsersModule,
        AuthModule,
        AudiencesModule,
        FormatsModule,
        BooksModule,
        ListsModule,
        GoalsModule,
        StatsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    token = await login('stats@example.com');

    const audiencesRes = await request(app.getHttpServer())
      .get('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const audiences = audiencesRes.body as Array<{ id: string; name: string }>;
    const juvenil = audiences.find((item) => item.name === 'Juvenil');
    const adulto = audiences.find((item) => item.name === 'Adulto');
    expect(juvenil).toBeDefined();
    expect(adulto).toBeDefined();

    await seedBook(token, {
      title: 'Fantasy A',
      genre: 'Fantasy',
      pageCount: 300,
      finishedOn: '2025-06-10',
      rating: 5,
      readFormat: 'fisico',
      audienceId: juvenil!.id,
    });
    await seedBook(token, {
      title: 'Fantasy B',
      genre: 'Fantasy',
      pageCount: 320,
      finishedOn: '2025-06-20',
      rating: 4,
      readFormat: 'fisico',
      audienceId: juvenil!.id,
    });
    await seedBook(token, {
      title: 'Sci-Fi C',
      genre: 'Sci-Fi',
      pageCount: 400,
      finishedOn: '2025-06-15',
      readFormat: 'ebook',
      audienceId: adulto!.id,
    });
    await seedBook(token, {
      title: 'No genre D',
      genre: null,
      pageCount: null,
      finishedOn: '2025-06-05',
      rating: 3,
    });
    // Boundary + exclusion books for user A
    await seedBook(token, {
      title: 'Prev month last day',
      genre: 'Fantasy',
      pageCount: 100,
      finishedOn: '2025-05-31',
      readFormat: 'fisico',
    });
    await seedBook(token, {
      title: 'Next month first day',
      genre: 'Fantasy',
      pageCount: 100,
      finishedOn: '2025-07-01',
      readFormat: 'fisico',
    });
    await seedBook(token, {
      title: 'Still reading',
      genre: 'Fantasy',
      pageCount: 999,
      status: 'leyendo',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns books_in_period ordered by finished_on then title', async () => {
    const body = await fetchStats(token, 2025, 6);
    expect(body.books_in_period).toHaveLength(4);
    expect(body.books_in_period.map((book) => book.title)).toEqual([
      'No genre D',
      'Fantasy A',
      'Sci-Fi C',
      'Fantasy B',
    ]);
    expect(body.books_in_period.every((book) => book.authors === 'Test Author')).toBe(
      true,
    );
    expect(
      body.books_in_period.every((book) => typeof book.id === 'string'),
    ).toBe(true);
  });

  it('returns empty books_in_period for an empty month', async () => {
    const body = await fetchStats(token, 2025, 2);
    expect(body.books_in_period).toEqual([]);
  });

  it('isolates books_in_period per user', async () => {
    const otherToken = await login('stats-other-gallery@example.com');
    await seedBook(otherToken, {
      title: 'Other gallery book',
      finishedOn: '2025-06-12',
    });

    const otherBody = await fetchStats(otherToken, 2025, 6);
    expect(otherBody.books_in_period).toHaveLength(1);
    expect(otherBody.books_in_period[0].title).toBe('Other gallery book');

    const mineBody = await fetchStats(token, 2025, 6);
    expect(mineBody.books_in_period).toHaveLength(4);
  });

  it('returns books_in_period for year mode', async () => {
    const res = await getYearStats(token, 2025).expect(200);
    const body = res.body as YearlyStatsResponseDto;
    expect(body.books_in_period).toHaveLength(6);
    expect(body.books_in_period[0].finished_on).toBe('2025-05-31');
    expect(body.books_in_period.at(-1)?.finished_on).toBe('2025-07-01');
  });

  it('returns at least three insights for a populated month', async () => {
    const body = await fetchStats(token, 2025, 6);
    expect(body.insights.length).toBeGreaterThanOrEqual(3);
    expect(body.insights.some((insight) => insight.kind === 'volume_delta')).toBe(
      true,
    );
    expect(body.insights.some((insight) => insight.kind === 'genre_trend')).toBe(
      true,
    );
  });

  it('returns volume delta with percentage increase vs previous month', async () => {
    const body = await fetchStats(token, 2025, 6);
    const volume = body.insights.find((insight) => insight.kind === 'volume_delta');
    expect(volume).toBeDefined();
    expect(volume?.data?.currentCount).toBe(4);
    expect(volume?.data?.previousCount).toBe(1);
    expect(volume?.data?.deltaPercent).toBe(300);
  });

  it('returns empty insights for an empty month', async () => {
    const body = await fetchStats(token, 2025, 2);
    expect(body.insights).toEqual([]);
  });

  it('aggregates books and pages read for the month (US-05 scenario 1)', async () => {
    const body = await fetchStats(token, 2025, 6);
    expect(body.year).toBe(2025);
    expect(body.month).toBe(6);
    expect(body.books_read).toBe(4);
    // 300 + 320 + 400 + 0 (null page count) = 1020
    expect(body.pages_read).toBe(1020);
  });

  it('averages rating over rated books only', async () => {
    const body = await fetchStats(token, 2025, 6);
    // (5 + 4 + 3) / 3 = 4
    expect(body.average_rating).toBe(4);
  });

  it('averages half-star ratings correctly', async () => {
    const halfStar = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Half Star A',
        authors: 'Author',
        data_source: 'manual',
        page_count: 200,
        genre: 'Fantasy',
      })
      .expect(201);

    const halfStarId = halfStar.body.book.id;
    await request(app.getHttpServer())
      .patch(`/v1/books/${halfStarId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'leido',
        finished_on: '2023-03-15',
        rating: 3.5,
      })
      .expect(200);

    const wholeStar = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Whole Star B',
        authors: 'Author',
        data_source: 'manual',
        page_count: 100,
        genre: 'Fantasy',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/v1/books/${wholeStar.body.book.id}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'leido',
        finished_on: '2023-03-20',
        rating: 4,
      })
      .expect(200);

    const body = await fetchStats(token, 2023, 3);
    expect(body.average_rating).toBe(3.75);
  });

  it('returns genre distribution with null bucketed as unknown, ordered by count desc (US-05 scenario 2)', async () => {
    const body = await fetchStats(token, 2025, 6);
    expect(body.genre_distribution[0]).toEqual({
      genre: 'Fantasy',
      count: 2,
    });
    const byGenre = Object.fromEntries(
      body.genre_distribution.map((g) => [g.genre, g.count]),
    );
    expect(byGenre).toEqual({ Fantasy: 2, 'Sci-Fi': 1, unknown: 1 });
  });

  it('returns monthly breakdown with twelve buckets for the year', async () => {
    const body = await fetchStats(token, 2025, 6);
    expect(body.monthly_breakdown).toHaveLength(12);
    const june = body.monthly_breakdown.find((entry) => entry.month === 6);
    expect(june).toEqual({ month: 6, books_read: 4, pages_read: 1020 });
    const february = body.monthly_breakdown.find((entry) => entry.month === 2);
    expect(february).toEqual({ month: 2, books_read: 0, pages_read: 0 });
  });

  it('returns yearly breakdown with per-year totals', async () => {
    const res = await getYearStats(token, 2025).expect(200);
    const body = res.body as YearlyStatsResponseDto;
    const byYear = Object.fromEntries(
      body.yearly_breakdown.map((entry) => [entry.year, entry.books_read]),
    );
    expect(byYear[2025]).toBe(6);
    expect(byYear[2023]).toBe(2);
  });

  it('returns format distribution and predominant format', async () => {
    const body = await fetchStats(token, 2025, 6);
    const byFormat = Object.fromEntries(
      body.format_distribution.map((f) => [f.format, f.count]),
    );
    expect(byFormat).toEqual({ fisico: 2, ebook: 1, unknown: 1 });
    expect(body.predominant_format).toBe('fisico');
  });

  it('returns audience distribution with null audience_id bucketed as unknown', async () => {
    const body = await fetchStats(token, 2025, 6);
    const byAudience = Object.fromEntries(
      body.audience_distribution.map((a) => [a.audience, a.count]),
    );
    expect(byAudience).toEqual({
      Juvenil: 2,
      Adulto: 1,
      unknown: 1,
    });
  });

  it('returns rating distribution for rated books only', async () => {
    const body = await fetchStats(token, 2025, 6);
    const byRating = Object.fromEntries(
      body.rating_distribution.map((r) => [r.rating, r.count]),
    );
    expect(byRating).toEqual({ 3: 1, 4: 1, 5: 1 });
  });

  it('excludes books finished on the last day of the previous month', async () => {
    const body = await fetchStats(token, 2025, 5);
    expect(body.books_read).toBe(1);
  });

  it('excludes books finished on the first day of the next month', async () => {
    const body = await fetchStats(token, 2025, 7);
    expect(body.books_read).toBe(1);
  });

  it('returns a zeroed payload for an empty month', async () => {
    const body = await fetchStats(token, 2025, 2);
    expect(body).toMatchObject({
      books_read: 0,
      pages_read: 0,
      average_rating: null,
      predominant_format: null,
      genre_distribution: [],
      format_distribution: [],
      audience_distribution: [],
      rating_distribution: [],
      books_in_period: [],
      insights: [],
    });
    expect(body.monthly_breakdown).toHaveLength(12);
    const february = body.monthly_breakdown.find((entry) => entry.month === 2);
    expect(february).toEqual({ month: 2, books_read: 0, pages_read: 0 });
  });

  it('isolates statistics per user', async () => {
    const otherToken = await login('stats-other@example.com');
    await seedBook(otherToken, {
      title: 'Other user book',
      genre: 'Mystery',
      pageCount: 111,
      finishedOn: '2025-06-12',
      rating: 2,
      readFormat: 'audio',
    });

    const otherBody = await fetchStats(otherToken, 2025, 6);
    expect(otherBody.books_read).toBe(1);
    expect(otherBody.pages_read).toBe(111);

    const mineBody = await fetchStats(token, 2025, 6);
    expect(mineBody.books_read).toBe(4);
  });

  it('rejects an invalid month', async () => {
    await getStats(token, 2025, 13).expect(400);
  });

  it('rejects an invalid year', async () => {
    await getStats(token, 1800, 6).expect(400);
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/v1/stats/2025/6').expect(401);
  });

  it('aggregates books and pages read for the full year', async () => {
    const res = await getYearStats(token, 2025).expect(200);
    const body = res.body as YearlyStatsResponseDto;
    expect(body.year).toBe(2025);
    // June (4) + May boundary (1) + July boundary (1) = 6 books in 2025
    expect(body.books_read).toBe(6);
    expect(body.pages_read).toBe(1220);
  });

  it('returns a zeroed payload for an empty year', async () => {
    const res = await getYearStats(token, 2024).expect(200);
    expect(res.body).toMatchObject({
      year: 2024,
      books_read: 0,
      pages_read: 0,
      average_rating: null,
      predominant_format: null,
      genre_distribution: [],
      format_distribution: [],
      audience_distribution: [],
      rating_distribution: [],
      books_in_period: [],
      insights: [],
    });
    const breakdown = (res.body as YearlyStatsResponseDto).yearly_breakdown;
    expect(breakdown.find((entry) => entry.year === 2024)).toBeUndefined();
  });

  it('rejects year query without authentication', async () => {
    await request(app.getHttpServer())
      .get('/v1/stats')
      .query({ period: 'year', year: 2025 })
      .expect(401);
  });

  it('rejects invalid year in query endpoint', async () => {
    await getYearStats(token, 1800).expect(400);
  });
});
