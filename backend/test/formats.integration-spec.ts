import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { Book } from '../src/books/entities/book.entity';
import { CatalogEdition } from '../src/books/entities/catalog-edition.entity';
import { UserBookOverride } from '../src/books/entities/user-book-override.entity';
import { ReadingRecord } from '../src/books/entities/reading-record.entity';
import { Audience } from '../src/audiences/entities/audience.entity';
import { Format } from '../src/formats/entities/format.entity';
import { Genre } from '../src/genres/entities/genre.entity';
import { FormatsModule } from '../src/formats/formats.module';
import { AuthModule } from '../src/auth/auth.module';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';
import { seedCatalogBook } from './catalog-book-seed';

describe('Formats API (integration)', () => {
  let app: INestApplication<App>;
  let token: string;
  let userId: string;
  let readingRepo: Repository<ReadingRecord>;
  let bookRepo: Repository<Book>;
  let catalogRepo: Repository<CatalogEdition>;

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
        FormatsModule,
        TypeOrmModule.forFeature([Book, CatalogEdition, UserBookOverride, ReadingRecord]),
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
      .send({ email: 'formats@example.com' })
      .expect(201);
    token = login.body.access_token;
    userId = login.body.user.id;
    readingRepo = moduleRef.get(getRepositoryToken(ReadingRecord));
    bookRepo = moduleRef.get(getRepositoryToken(Book));
    catalogRepo = moduleRef.get(getRepositoryToken(CatalogEdition));
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/formats returns seeded defaults for new user', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/formats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(3);
    expect(res.body.map((item: { name: string }) => item.name)).toEqual([
      'Audio',
      'Ebook',
      'Físico',
    ]);
  });

  it('POST /v1/formats creates a custom format', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/formats')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Audiolibro por capítulos' })
      .expect(201);

    expect(res.body.name).toBe('Audiolibro por capítulos');
    expect(res.body.is_default).toBe(false);
  });

  it('POST /v1/formats rejects duplicate names', async () => {
    await request(app.getHttpServer())
      .post('/v1/formats')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'físico' })
      .expect(409);
  });

  it('GET /v1/formats/{id}/affected-readings returns assigned reading count', async () => {
    const list = await request(app.getHttpServer())
      .get('/v1/formats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const target = list.body.find((item: { name: string }) => item.name === 'Físico');
    expect(target).toBeDefined();

    const book = await seedCatalogBook(catalogRepo, bookRepo, readingRepo, {
      userId,
      title: 'Physical Book',
      authors: 'Author',
    });

    await readingRepo.update({ bookId: book.id }, { formatId: target.id });

    const res = await request(app.getHttpServer())
      .get(`/v1/formats/${target.id}/affected-readings`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.affected_reading_count).toBe(1);
  });

  it('DELETE /v1/formats/{id} clears format_id on assigned reading records', async () => {
    const list = await request(app.getHttpServer())
      .get('/v1/formats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const target = list.body.find((item: { name: string }) => item.name === 'Ebook');
    expect(target).toBeDefined();

    const book = await seedCatalogBook(catalogRepo, bookRepo, readingRepo, {
      userId,
      title: 'Ebook Book',
      authors: 'Author',
    });

    await readingRepo.update({ bookId: book.id }, { formatId: target.id });

    await request(app.getHttpServer())
      .delete(`/v1/formats/${target.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const updated = await readingRepo.findOneBy({ bookId: book.id });
    expect(updated?.formatId).toBeNull();
  });

  it('DELETE /v1/formats/{id} removes a format', async () => {
    const list = await request(app.getHttpServer())
      .get('/v1/formats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const target = list.body.find(
      (item: { name: string }) => item.name === 'Audiolibro por capítulos',
    );
    expect(target).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/v1/formats/${target.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const after = await request(app.getHttpServer())
      .get('/v1/formats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(after.body.some((item: { id: string }) => item.id === target.id)).toBe(false);
  });
});
