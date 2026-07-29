import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { Audience } from '../src/audiences/entities/audience.entity';
import { Book } from '../src/books/entities/book.entity';
import { CatalogEdition } from '../src/books/entities/catalog-edition.entity';
import { UserBookOverride } from '../src/books/entities/user-book-override.entity';
import { ReadingRecord } from '../src/books/entities/reading-record.entity';
import { Format } from '../src/formats/entities/format.entity';
import { Genre } from '../src/genres/entities/genre.entity';
import { UserProfile } from '../src/preferences/entities/user-profile.entity';
import { PreferencesModule } from '../src/preferences/preferences.module';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';

describe('Preferences API (integration)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, UserProfile, Book, CatalogEdition, UserBookOverride, ReadingRecord, Audience, Format, Genre],
          synchronize: true,
        }),
        UsersModule,
        AuthModule,
        PreferencesModule,
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
      .send({ email: 'prefs@example.com' })
      .expect(201);
    token = login.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/me/preferences returns veranda by default', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/me/preferences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({ theme_palette_id: 'veranda' });
  });

  it('PATCH /v1/me/preferences persists palette choice', async () => {
    await request(app.getHttpServer())
      .patch('/v1/me/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme_palette_id: 'strawberry' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/v1/me/preferences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({ theme_palette_id: 'strawberry' });
  });

  it('PATCH /v1/me/preferences rejects unknown palette', async () => {
    await request(app.getHttpServer())
      .patch('/v1/me/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme_palette_id: 'neon-rainbow' })
      .expect(400);
  });
});
