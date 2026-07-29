import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { Audience } from '../src/audiences/entities/audience.entity';
import { AuthModule } from '../src/auth/auth.module';
import { Book } from '../src/books/entities/book.entity';
import { CatalogEdition } from '../src/books/entities/catalog-edition.entity';
import { UserBookOverride } from '../src/books/entities/user-book-override.entity';
import { ReadingRecord } from '../src/books/entities/reading-record.entity';
import { Format } from '../src/formats/entities/format.entity';
import { Genre } from '../src/genres/entities/genre.entity';
import { GenresModule } from '../src/genres/genres.module';
import { DEFAULT_GENRE_NAMES } from '../src/genres/genres.constants';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';
import { seedCatalogBook } from './catalog-book-seed';

describe('Genres API (integration)', () => {
  let app: INestApplication<App>;
  let token: string;
  let userId: string;
  let bookRepo: Repository<Book>;
  let catalogRepo: Repository<CatalogEdition>;
  let readingRepo: Repository<ReadingRecord>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Book, CatalogEdition, UserBookOverride, ReadingRecord, Audience, Format, Genre],
          synchronize: true,
        }),
        UsersModule,
        AuthModule,
        GenresModule,
        TypeOrmModule.forFeature([Book, CatalogEdition, ReadingRecord]),
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
      .send({ email: 'genres@example.com' })
      .expect(201);
    token = login.body.access_token;
    userId = login.body.user.id;
    bookRepo = moduleRef.get(getRepositoryToken(Book));
    catalogRepo = moduleRef.get(getRepositoryToken(CatalogEdition));
    readingRepo = moduleRef.get(getRepositoryToken(ReadingRecord));
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/genres returns seeded defaults for new user', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/genres')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(DEFAULT_GENRE_NAMES.length);
    expect(res.body.map((item: { name: string }) => item.name).sort()).toEqual(
      [...DEFAULT_GENRE_NAMES].sort(),
    );
  });

  it('POST /v1/genres creates a custom genre', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/genres')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Misterio' })
      .expect(201);

    expect(res.body.name).toBe('Misterio');
    expect(res.body.is_default).toBe(false);
  });

  it('POST /v1/genres rejects duplicate names', async () => {
    await request(app.getHttpServer())
      .post('/v1/genres')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'fantasía' })
      .expect(409);
  });

  it('POST /v1/genres rejects empty name', async () => {
    await request(app.getHttpServer())
      .post('/v1/genres')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '   ' })
      .expect(400);
  });

  it('GET /v1/genres/{id}/affected-books returns book count', async () => {
    const created = await request(app.getHttpServer())
      .post('/v1/genres')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Count Preview Genre' })
      .expect(201);

    await seedCatalogBook(catalogRepo, bookRepo, readingRepo, {
      userId,
      title: 'Count Book',
      authors: 'Author',
      genreId: created.body.id,
    });

    const res = await request(app.getHttpServer())
      .get(`/v1/genres/${created.body.id}/affected-books`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({ affected_book_count: 1 });
  });

  it('GET /v1/genres/{id}/affected-books returns zero when unused', async () => {
    const created = await request(app.getHttpServer())
      .post('/v1/genres')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unused Genre' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/v1/genres/${created.body.id}/affected-books`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({ affected_book_count: 0 });
  });

  it('POST /v1/genres/match resolves owned genre via synonym', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/genres/match')
      .set('Authorization', `Bearer ${token}`)
      .send({ raw_genre: 'Fantasy fiction' })
      .expect(201);

    expect(res.body.status).toBe('matched');
    expect(res.body.genre_name).toBe('Fantasía');
    expect(res.body.genre_id).toBeDefined();
  });

  it('POST /v1/genres/match returns unresolved for unknown genre', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/genres/match')
      .set('Authorization', `Bearer ${token}`)
      .send({ raw_genre: 'Cooking' })
      .expect(201);

    expect(res.body).toEqual({
      status: 'unresolved',
      raw_genre: 'Cooking',
    });
  });

  it('DELETE /v1/genres/{id} removes genre and clears books.genre_id', async () => {
    const list = await request(app.getHttpServer())
      .get('/v1/genres')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const target = list.body.find((item: { name: string }) => item.name === 'Misterio');
    expect(target).toBeDefined();

    const book = await seedCatalogBook(catalogRepo, bookRepo, readingRepo, {
      userId,
      title: 'Genre Book',
      authors: 'Author',
      genreId: target.id,
    });

    await request(app.getHttpServer())
      .delete(`/v1/genres/${target.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const after = await request(app.getHttpServer())
      .get('/v1/genres')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(after.body.find((item: { id: string }) => item.id === target.id)).toBeUndefined();

    const reloaded = await bookRepo.findOne({ where: { id: book.id } });
    expect(reloaded?.genreId).toBeNull();
  });
});
