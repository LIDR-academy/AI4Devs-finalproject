import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { BooksModule } from '../src/books/books.module';
import { Audience } from '../src/audiences/entities/audience.entity';
import { Format } from '../src/formats/entities/format.entity';
import { Genre } from '../src/genres/entities/genre.entity';
import { Book } from '../src/books/entities/book.entity';
import { CatalogEdition } from '../src/books/entities/catalog-edition.entity';
import { UserBookOverride } from '../src/books/entities/user-book-override.entity';
import { ReadingRecord } from '../src/books/entities/reading-record.entity';
import { GoalsModule } from '../src/goals/goals.module';
import { AnnualReadingGoal } from '../src/goals/entities/annual-reading-goal.entity';
import { GoalsService } from '../src/goals/goals.service';
import { ListsModule } from '../src/lists/lists.module';
import { MonthlyTbrList } from '../src/lists/entities/monthly-tbr-list.entity';
import { TbrEntry } from '../src/lists/entities/tbr-entry.entity';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';

describe('Goals API (integration)', () => {
  let app: INestApplication<App>;
  let token: string;
  let bookId: string;
  const year = new Date().getUTCFullYear();

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
            CatalogEdition,
            UserBookOverride,
            ReadingRecord,
            AnnualReadingGoal,
            MonthlyTbrList,
            TbrEntry,
            Audience,
            Format,
            Genre,
          ],
          synchronize: true,
        }),
        UsersModule,
        AuthModule,
        BooksModule,
        ListsModule,
        GoalsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/v1/auth/dev-login')
      .send({ email: 'goals@example.com' })
      .expect(201);
    token = login.body.access_token;

    const bookRes = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'The Left Hand of Darkness',
        authors: 'Ursula K. Le Guin',
        data_source: 'manual',
      })
      .expect(201);
    bookId = bookRes.body.book.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/goals/{year} returns null goal when unset', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.goal).toBeNull();
    expect(res.body.books_read).toBe(0);
    expect(res.body.progress_percent).toBeNull();
    expect(res.body.forecast).toBeNull();
  });

  it('PUT /v1/goals/{year} creates goal', async () => {
    const res = await request(app.getHttpServer())
      .put(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ target_book_count: 50 })
      .expect(200);

    expect(res.body.goal.target_book_count).toBe(50);
    expect(res.body.year).toBe(year);
  });

  it('PUT rejects invalid target_book_count', async () => {
    await request(app.getHttpServer())
      .put(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ target_book_count: 0 })
      .expect(400);
  });

  it('PUT updates existing goal', async () => {
    const res = await request(app.getHttpServer())
      .put(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ target_book_count: 30 })
      .expect(200);

    expect(res.body.goal.target_book_count).toBe(30);
  });

  it('counts books_read for leido in year', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'leido',
        started_on: `${year}-03-01`,
        finished_on: `${year}-03-15`,
      })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.books_read).toBe(1);
    expect(res.body.progress_percent).toBe(3);
  });

  it('returns forecast when sufficient data', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.forecast).not.toBeNull();
    expect(res.body.forecast).toMatchObject({
      projected_year_end_count: expect.any(Number),
      on_track: expect.any(Boolean),
      pace_books_per_week: expect.any(Number),
      required_books_per_week: expect.any(Number),
      status: expect.stringMatching(/^(ahead|on_track|behind)$/),
    });
  });

  it('decrements books_read when status reverts from leido', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'leyendo',
        started_on: `${year}-03-01`,
      })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.books_read).toBe(0);
    expect(res.body.progress_percent).toBe(0);
  });

  it('moves count when finished_on changes across UTC years', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'leido',
        started_on: `${year}-06-01`,
        finished_on: `${year}-06-15`,
      })
      .expect(200);

    const beforeMove = await request(app.getHttpServer())
      .get(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(beforeMove.body.books_read).toBe(1);

    const priorYear = year - 1;
    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        finished_on: `${priorYear}-12-31`,
        started_on: `${priorYear}-12-01`,
      })
      .expect(200);

    const currentYearRes = await request(app.getHttpServer())
      .get(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(currentYearRes.body.books_read).toBe(0);

    const priorYearRes = await request(app.getHttpServer())
      .get(`/v1/goals/${priorYear}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(priorYearRes.body.books_read).toBe(1);
  });

  it('does not increment goal year when leido finished_on is outside that year', async () => {
    const otherBook = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Dune',
        authors: 'Frank Herbert',
        data_source: 'manual',
      })
      .expect(201);

    const priorYear = year - 1;
    await request(app.getHttpServer())
      .patch(`/v1/books/${otherBook.body.book.id}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'leido', finished_on: `${priorYear}-11-01` })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/v1/goals/${year}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.books_read).toBe(0);
  });

  it('GET rejects invalid year', async () => {
    await request(app.getHttpServer())
      .get('/v1/goals/1800')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get(`/v1/goals/${year}`).expect(401);
  });

  describe('GoalsService.computeForecast', () => {
    let goalsService: GoalsService;

    beforeAll(() => {
      goalsService = app.get(GoalsService);
    });

    it('returns null with insufficient elapsed days', () => {
      const forecast = goalsService.computeForecast(
        2026,
        1,
        50,
        '2026-01-01',
        new Date('2026-01-05T12:00:00Z'),
      );
      expect(forecast).toBeNull();
    });

    it('returns null with zero books read', () => {
      const forecast = goalsService.computeForecast(2026, 0, 50, null);
      expect(forecast).toBeNull();
    });
  });
});
