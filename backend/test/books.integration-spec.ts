import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
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
import { ListsModule } from '../src/lists/lists.module';
import { MonthlyTbrList } from '../src/lists/entities/monthly-tbr-list.entity';
import { TbrEntry } from '../src/lists/entities/tbr-entry.entity';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('Books API (integration)', () => {
  let app: INestApplication<App>;
  let token: string;
  let otherToken: string;
  let bookId: string;

  beforeAll(async () => {
    jest.setTimeout(30000);
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Book, ReadingRecord, MonthlyTbrList, TbrEntry, Audience, Format],
          synchronize: true,
        }),
        UsersModule,
        AuthModule,
        AudiencesModule,
        FormatsModule,
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
      .send({ email: 'test@example.com' })
      .expect(201);

    token = login.body.access_token;

    const otherLogin = await request(app.getHttpServer())
      .post('/v1/auth/dev-login')
      .send({ email: 'other@example.com' })
      .expect(201);

    otherToken = otherLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/books creates book and pendiente reading record', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'The Left Hand of Darkness',
        authors: 'Ursula K. Le Guin',
        data_source: 'open_library',
        external_provider_id: 'OL82563W',
        page_count: 304,
        genre: 'Science fiction',
      })
      .expect(201);

    expect(res.body.book.title).toBe('The Left Hand of Darkness');
    expect(res.body.reading.status).toBe('pendiente');
    expect(res.body.reading.book_id).toBe(res.body.book.id);
    bookId = res.body.book.id;
  });

  it('GET /v1/books includes reading metadata fields', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const item = res.body.find((b: { id: string }) => b.id === bookId);
    expect(item).toBeDefined();
    expect(item.reading_status).toBe('pendiente');
    expect(item).toHaveProperty('started_on');
    expect(item).toHaveProperty('finished_on');
    expect(item).toHaveProperty('rating');
    expect(item).toHaveProperty('format_id');
    expect(item).toHaveProperty('read_format');
  });

  it('PATCH pendiente→leyendo sets started_on', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'leyendo' })
      .expect(200);

    expect(res.body.reading.status).toBe('leyendo');
    expect(res.body.reading.started_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.body.meta?.openCompletionModal).toBeUndefined();
  });

  it('PATCH leyendo→leido returns openCompletionModal and finished_on', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'leido' })
      .expect(200);

    expect(res.body.reading.status).toBe('leido');
    expect(res.body.reading.finished_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.body.reading.current_page).toBe(304);
    expect(res.body.meta.openCompletionModal).toBe(true);
  });

  it('PATCH rejects finish date before start date', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        started_on: '2026-05-20',
        finished_on: '2026-05-01',
      })
      .expect(422);

    expect(res.body.code).toBe('FINISHED_BEFORE_STARTED');
  });

  it('PATCH returns 404 for book owned by another user', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ status: 'leyendo' })
      .expect(404);
  });

  it('PATCH leido without TBR entry omits tbrAutoCompleted', async () => {
    const fresh = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Neuromancer',
        authors: 'William Gibson',
        data_source: 'manual',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${fresh.body.book.id}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'leido' })
      .expect(200);

    expect(res.body.meta?.tbrAutoCompleted).toBeUndefined();
  });

  it('PATCH leido with book in current-month TBR sets tbrAutoCompleted', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'pendiente' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/v1/tbr/${year}/${month}/entries`)
      .set('Authorization', `Bearer ${token}`)
      .send({ book_id: bookId })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'leido' })
      .expect(200);

    expect(res.body.meta.tbrAutoCompleted).toBe(true);

    const tbr = await request(app.getHttpServer())
      .get(`/v1/tbr/${year}/${month}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const entry = tbr.body.entries.find(
      (e: { book_id: string }) => e.book_id === bookId,
    );
    expect(entry?.completed).toBe(true);
  });

  it('POST /v1/books accepts optional audience_id', async () => {
    const audiences = await request(app.getHttpServer())
      .get('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const audienceId = audiences.body[0].id as string;

    const res = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Audience ID Test Book',
        authors: 'Test Author',
        data_source: 'manual',
        audience_id: audienceId,
      })
      .expect(201);

    expect(res.body.book.audience_id).toBe(audienceId);
  });

  it('POST /v1/books rejects foreign audience_id', async () => {
    const otherAudiences = await request(app.getHttpServer())
      .get('/v1/audiences')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);

    const foreignAudienceId = otherAudiences.body[0].id as string;

    const res = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Foreign Audience Book',
        authors: 'Test Author',
        data_source: 'manual',
        audience_id: foreignAudienceId,
      })
      .expect(400);

    expect(res.body.code).toBe('AUDIENCE_NOT_FOUND');
  });

  it('PATCH /v1/books/{bookId} updates audience_id', async () => {
    const audiences = await request(app.getHttpServer())
      .get('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const audienceId = audiences.body[1].id as string;

    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ audience_id: audienceId })
      .expect(200);

    expect(res.body.audience_id).toBe(audienceId);

    const list = await request(app.getHttpServer())
      .get('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const item = list.body.find((b: { id: string }) => b.id === bookId);
    expect(item.audience_id).toBe(audienceId);
  });

  it('PATCH /v1/books/{bookId} clears audience_id with null', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ audience_id: null })
      .expect(200);

    expect(res.body.audience_id).toBeNull();
  });

  it('POST /v1/books accepts optional audience', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Audience Test Book',
        authors: 'Test Author',
        data_source: 'manual',
        audience: 'young_adult',
      })
      .expect(201);

    expect(res.body.book.audience).toBe('young_adult');
  });

  it('PATCH /v1/books/{bookId} updates audience', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ audience: 'adult' })
      .expect(200);

    expect(res.body.audience).toBe('adult');

    const list = await request(app.getHttpServer())
      .get('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const item = list.body.find((b: { id: string }) => b.id === bookId);
    expect(item.audience).toBe('adult');
  });

  it('PATCH /v1/books/{bookId} clears audience with null', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ audience: null })
      .expect(200);

    expect(res.body.audience).toBeNull();
  });

  it('POST /v1/books creates manual book with full metadata', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Manual Title',
        authors: 'Manual Author',
        data_source: 'manual',
        cover_image_url: 'https://example.com/cover.jpg',
        page_count: 200,
        genre: 'Fantasy',
        series_name: 'Manual Series',
        publication_year: 2020,
        audience: 'new_adult',
        notes: 'Signed copy',
      })
      .expect(201);

    expect(res.body.book.data_source).toBe('manual');
    expect(res.body.book.title).toBe('Manual Title');
    expect(res.body.book.page_count).toBe(200);
    expect(res.body.book.genre).toBe('Fantasy');
    expect(res.body.book.series_name).toBe('Manual Series');
    expect(res.body.book.publication_year).toBe(2020);
    expect(res.body.book.notes).toBe('Signed copy');
    expect(res.body.reading.status).toBe('pendiente');
  });

  it('PATCH /v1/books/{bookId} updates multiple metadata fields', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Title',
        authors: 'Updated Author',
        page_count: 350,
        genre: 'Speculative fiction',
        series_name: 'Hainish Cycle',
        publication_year: 1969,
        notes: 'Library edition',
      })
      .expect(200);

    expect(res.body.title).toBe('Updated Title');
    expect(res.body.authors).toBe('Updated Author');
    expect(res.body.page_count).toBe(350);
    expect(res.body.genre).toBe('Speculative fiction');
    expect(res.body.series_name).toBe('Hainish Cycle');
    expect(res.body.publication_year).toBe(1969);
    expect(res.body.notes).toBe('Library edition');
  });

  it('PATCH /v1/books/{bookId} rejects empty body', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
  });

  it('PATCH /v1/books/{bookId} rejects negative page_count', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ page_count: -1 })
      .expect(400);
  });

  it('PATCH /v1/books/{bookId} returns 404 for book owned by another user', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hijacked' })
      .expect(404);
  });

  it('PATCH reading-record sets format_id', async () => {
    const formats = await request(app.getHttpServer())
      .get('/v1/formats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const target = formats.body.find((f: { name: string }) => f.name === 'Ebook');

    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ format_id: target.id })
      .expect(200);

    expect(res.body.reading.format_id).toBe(target.id);
    expect(res.body.reading.read_format).toBe('ebook');
  });

  it('PATCH reading-record clears format_id with null', async () => {
    const formats = await request(app.getHttpServer())
      .get('/v1/formats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const target = formats.body.find((f: { name: string }) => f.name === 'Físico');

    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ format_id: target.id })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ format_id: null })
      .expect(200);

    expect(res.body.reading.format_id).toBeNull();
    expect(res.body.reading.read_format).toBeNull();
  });

  it('PATCH reading-record rejects foreign format_id', async () => {
    const otherFormats = await request(app.getHttpServer())
      .get('/v1/formats')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);
    const foreignFormatId = otherFormats.body[0].id as string;

    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ format_id: foreignFormatId })
      .expect(400);

    expect(res.body.code).toBe('FORMAT_NOT_FOUND');
  });

  it('POST /v1/books creates reading record without read_format', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Format Default Test',
        authors: 'Author',
        data_source: 'manual',
      })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const item = list.body.find(
      (b: { id: string }) => b.id === res.body.book.id,
    );
    expect(item.read_format).toBeNull();
  });

  it('PATCH reading-record accepts half-star rating', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3.5 })
      .expect(200);

    expect(res.body.reading.rating).toBe(3.5);
  });

  it('PATCH reading-record rejects invalid half-star rating', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/books/${bookId}/reading-record`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3.3 })
      .expect(400);
  });

  it('GET /v1/books returns half-star rating', async () => {
    const list = await request(app.getHttpServer())
      .get('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const item = list.body.find((b: { id: string }) => b.id === bookId);
    expect(item.rating).toBe(3.5);
  });
});
