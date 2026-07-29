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
import { ListsModule } from '../src/lists/lists.module';
import { MonthlyTbrList } from '../src/lists/entities/monthly-tbr-list.entity';
import { TbrEntry } from '../src/lists/entities/tbr-entry.entity';
import { TbrService } from '../src/lists/tbr.service';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';

describe('TBR API (integration)', () => {
  let app: INestApplication<App>;
  let token: string;
  let otherToken: string;
  let bookId: string;
  const year = 2026;
  const month = 6;

  beforeAll(async () => {
    jest.setTimeout(30000);
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Book, CatalogEdition, UserBookOverride, ReadingRecord, MonthlyTbrList, TbrEntry, Audience, Format, Genre],
          synchronize: true,
        }),
        UsersModule,
        AuthModule,
        BooksModule,
        ListsModule,
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
      .send({ email: 'tbr@example.com' })
      .expect(201);
    token = login.body.access_token;

    const otherLogin = await request(app.getHttpServer())
      .post('/v1/auth/dev-login')
      .send({ email: 'tbr-other@example.com' })
      .expect(201);
    otherToken = otherLogin.body.access_token;

    const bookRes = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Dune',
        authors: 'Frank Herbert',
        data_source: 'manual',
      })
      .expect(201);
    bookId = bookRes.body.book.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/tbr/{year}/{month} creates list on first access', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/tbr/${year}/${month}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.list.year).toBe(year);
    expect(res.body.list.month).toBe(month);
    expect(res.body.entries).toEqual([]);
  });

  it('GET is idempotent for same month', async () => {
    const first = await request(app.getHttpServer())
      .get(`/v1/tbr/${year}/${month}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const second = await request(app.getHttpServer())
      .get(`/v1/tbr/${year}/${month}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(second.body.list.id).toBe(first.body.list.id);
  });

  it('POST entry adds book to TBR', async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/tbr/${year}/${month}/entries`)
      .set('Authorization', `Bearer ${token}`)
      .send({ book_id: bookId })
      .expect(201);

    expect(res.body.book_id).toBe(bookId);
    expect(res.body.completed).toBe(false);
    expect(res.body.book.title).toBe('Dune');
  });

  it('POST duplicate returns 409', async () => {
    await request(app.getHttpServer())
      .post(`/v1/tbr/${year}/${month}/entries`)
      .set('Authorization', `Bearer ${token}`)
      .send({ book_id: bookId })
      .expect(409);
  });

  it('DELETE entry removes from list', async () => {
    const list = await request(app.getHttpServer())
      .get(`/v1/tbr/${year}/${month}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const entryId = list.body.entries[0].id;

    await request(app.getHttpServer())
      .delete(`/v1/tbr/${year}/${month}/entries/${entryId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const after = await request(app.getHttpServer())
      .get(`/v1/tbr/${year}/${month}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(after.body.entries).toHaveLength(0);
  });

  it('returns 404 for other user entry delete', async () => {
    await request(app.getHttpServer())
      .post(`/v1/tbr/${year}/${month}/entries`)
      .set('Authorization', `Bearer ${token}`)
      .send({ book_id: bookId })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get(`/v1/tbr/${year}/${month}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/v1/tbr/${year}/${month}/entries/${list.body.entries[0].id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
  });

  it('POST entry rejects non-pending book with 422', async () => {
    const readingBook = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Reading Now',
        authors: 'Author',
        data_source: 'manual',
      })
      .expect(201);

    const readingId = readingBook.body.book.id;

    await request(app.getHttpServer())
      .patch(`/v1/books/${readingId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'leyendo' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .post(`/v1/tbr/${year}/${month}/entries`)
      .set('Authorization', `Bearer ${token}`)
      .send({ book_id: readingId })
      .expect(422);

    expect(res.body.code).toBe('TBR_BOOK_NOT_PENDING');
  });

  it('auto-create job skips when list already exists', async () => {
    const tbrService = app.get(TbrService);
    const created = await tbrService.autoCreateForUpcomingMonth(
      (
        await request(app.getHttpServer())
          .post('/v1/auth/dev-login')
          .send({ email: 'tbr@example.com' })
      ).body.user.id,
    );
    expect(created).toBe(false);
  });
});
