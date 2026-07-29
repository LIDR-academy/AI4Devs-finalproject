import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AudiencesModule } from '../src/audiences/audiences.module';
import { Audience } from '../src/audiences/entities/audience.entity';
import { Format } from '../src/formats/entities/format.entity';
import { Genre } from '../src/genres/entities/genre.entity';
import { AuthModule } from '../src/auth/auth.module';
import { Book } from '../src/books/entities/book.entity';
import { CatalogEdition } from '../src/books/entities/catalog-edition.entity';
import { UserBookOverride } from '../src/books/entities/user-book-override.entity';
import { ReadingRecord } from '../src/books/entities/reading-record.entity';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';
import { seedCatalogBook } from './catalog-book-seed';

describe('Audiences API (integration)', () => {
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
        AudiencesModule,
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
      .send({ email: 'audiences@example.com' })
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

  it('GET /v1/audiences returns seeded defaults for new user', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(3);
    expect(res.body.map((item: { name: string }) => item.name)).toEqual([
      'Adulto',
      'Infantil',
      'Juvenil',
    ]);
  });

  it('POST /v1/audiences creates a custom audience', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Young Adult' })
      .expect(201);

    expect(res.body.name).toBe('Young Adult');
    expect(res.body.is_default).toBe(false);
  });

  it('POST /v1/audiences rejects duplicate names', async () => {
    await request(app.getHttpServer())
      .post('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'adulto' })
      .expect(409);
  });

  it('GET /v1/audiences/{id}/affected-books returns assigned book count', async () => {
    const list = await request(app.getHttpServer())
      .get('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const target = list.body.find((item: { name: string }) => item.name === 'Adulto');
    expect(target).toBeDefined();

    await seedCatalogBook(catalogRepo, bookRepo, readingRepo, {
      userId,
      title: 'Assigned Book',
      authors: 'Author',
      audienceId: target.id,
    });

    const res = await request(app.getHttpServer())
      .get(`/v1/audiences/${target.id}/affected-books`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.affected_book_count).toBe(1);
  });

  it('DELETE /v1/audiences/{id} clears audience_id on assigned books', async () => {
    const list = await request(app.getHttpServer())
      .get('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const target = list.body.find((item: { name: string }) => item.name === 'Juvenil');
    expect(target).toBeDefined();

    const book = await seedCatalogBook(catalogRepo, bookRepo, readingRepo, {
      userId,
      title: 'Juvenil Book',
      authors: 'Author',
      audienceId: target.id,
    });

    await request(app.getHttpServer())
      .delete(`/v1/audiences/${target.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const updated = await bookRepo.findOneBy({ id: book.id });
    expect(updated?.audienceId).toBeNull();
  });

  it('DELETE /v1/audiences/{id} removes an audience', async () => {
    const list = await request(app.getHttpServer())
      .get('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const target = list.body.find((item: { name: string }) => item.name === 'Young Adult');
    expect(target).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/v1/audiences/${target.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const after = await request(app.getHttpServer())
      .get('/v1/audiences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(after.body.some((item: { id: string }) => item.id === target.id)).toBe(false);
  });
});
