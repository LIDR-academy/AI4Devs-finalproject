import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AudiencesModule } from '../src/audiences/audiences.module';
import { Audience } from '../src/audiences/entities/audience.entity';
import { AuthModule } from '../src/auth/auth.module';
import { CatalogService } from '../src/books/catalog/catalog.service';
import { EditionCoversService } from '../src/books/catalog/edition-covers.service';
import { BooksModule } from '../src/books/books.module';
import { Book } from '../src/books/entities/book.entity';
import { CatalogEdition } from '../src/books/entities/catalog-edition.entity';
import { UserBookOverride } from '../src/books/entities/user-book-override.entity';
import { ReadingRecord } from '../src/books/entities/reading-record.entity';
import { FormatsModule } from '../src/formats/formats.module';
import { Format } from '../src/formats/entities/format.entity';
import { Genre } from '../src/genres/entities/genre.entity';
import { ListsModule } from '../src/lists/lists.module';
import { MonthlyTbrList } from '../src/lists/entities/monthly-tbr-list.entity';
import { TbrEntry } from '../src/lists/entities/tbr-entry.entity';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';

describe('Book cover search API (integration)', () => {
  let app: INestApplication<App>;
  let token: string;
  let otherToken: string;
  let bookId: string;

  const catalogService = {
    search: jest.fn(),
  };
  const editionCoversService = {
    getCovers: jest.fn(),
  };

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
        AudiencesModule,
        FormatsModule,
        BooksModule,
        ListsModule,
      ],
    })
      .overrideProvider(CatalogService)
      .useValue(catalogService)
      .overrideProvider(EditionCoversService)
      .useValue(editionCoversService)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/v1/auth/dev-login')
      .send({ email: 'cover-search@example.com' })
      .expect(201);
    token = login.body.access_token;

    const otherLogin = await request(app.getHttpServer())
      .post('/v1/auth/dev-login')
      .send({ email: 'cover-search-other@example.com' })
      .expect(201);
    otherToken = otherLogin.body.access_token;

    const createRes = await request(app.getHttpServer())
      .post('/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Fourth Wing',
        authors: 'Rebecca Yarros',
        data_source: 'manual',
      })
      .expect(201);
    bookId = createRes.body.book.id;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/books/{bookId}/cover-search returns editions with covers', async () => {
    catalogService.search.mockResolvedValue({
      items: [
        {
          title: 'Fourth Wing',
          authors: 'Rebecca Yarros',
          data_source: 'open_library',
          external_provider_id: '/works/OL123W',
          cover_image_url: 'https://covers.openlibrary.org/b/id/1-L.jpg',
          page_count: null,
          genre: null,
          isbn_13: null,
          isbn_10: null,
        },
      ],
      source: 'open_library',
    });
    editionCoversService.getCovers.mockResolvedValue({
      covers: [{ id: '1', url: 'https://covers.openlibrary.org/b/id/1-L.jpg', label: null }],
      default_cover_id: '1',
    });

    const res = await request(app.getHttpServer())
      .get(`/v1/books/${bookId}/cover-search`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.query).toBe('Fourth Wing Rebecca Yarros');
    expect(res.body.source).toBe('open_library');
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].covers).toHaveLength(1);
    expect(catalogService.search).toHaveBeenCalledWith('Fourth Wing Rebecca Yarros', 20);
  });

  it('GET /v1/books/{bookId}/cover-search accepts optional q', async () => {
    catalogService.search.mockResolvedValue({ items: [], source: 'none' });

    await request(app.getHttpServer())
      .get(`/v1/books/${bookId}/cover-search`)
      .query({ q: 'Fourth Wing special edition' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(catalogService.search).toHaveBeenCalledWith(
      'Fourth Wing special edition',
      20,
    );
  });

  it('GET /v1/books/{bookId}/cover-search returns empty list when no covers', async () => {
    catalogService.search.mockResolvedValue({
      items: [
        {
          title: 'Fourth Wing',
          authors: 'Rebecca Yarros',
          data_source: 'google_books',
          external_provider_id: 'vol-empty',
          cover_image_url: null,
          page_count: null,
          genre: null,
          isbn_13: null,
          isbn_10: null,
        },
      ],
      source: 'google_books',
    });
    editionCoversService.getCovers.mockResolvedValue({
      covers: [],
      default_cover_id: null,
    });

    const res = await request(app.getHttpServer())
      .get(`/v1/books/${bookId}/cover-search`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.items).toEqual([]);
  });

  it('GET /v1/books/{bookId}/cover-search returns 404 for another user book', async () => {
    await request(app.getHttpServer())
      .get(`/v1/books/${bookId}/cover-search`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    expect(catalogService.search).not.toHaveBeenCalled();
  });

  it('GET /v1/books/{bookId}/cover-search requires authentication', async () => {
    await request(app.getHttpServer())
      .get(`/v1/books/${bookId}/cover-search`)
      .expect(401);
  });
});
