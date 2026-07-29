import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { Audience } from '../src/audiences/entities/audience.entity';
import { Format } from '../src/formats/entities/format.entity';
import { Genre } from '../src/genres/entities/genre.entity';
import { Book } from '../src/books/entities/book.entity';
import { CatalogEdition } from '../src/books/entities/catalog-edition.entity';
import { UserBookOverride } from '../src/books/entities/user-book-override.entity';
import { ReadingRecord } from '../src/books/entities/reading-record.entity';
import { ImportJob } from '../src/import/entities/import-job.entity';
import { ImportCatalogEnrichmentService } from '../src/import/goodreads/import-catalog-enrichment.service';
import { ImportModule } from '../src/import/import.module';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const minFixturePath = join(
  __dirname,
  'fixtures',
  'goodreads_library_export.min.csv',
);

async function waitForCompletedJob(
  app: INestApplication<App>,
  token: string,
  jobId: string,
) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const res = await request(app.getHttpServer())
      .get(`/v1/import/jobs/${jobId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = res.body as { status: string };
    if (body.status === 'completed' || body.status === 'failed') {
      return res.body;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error('Import job did not complete in time');
}

describe('Import API (integration)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    process.env.IMPORT_JOBS_SYNC = 'true';
    process.env.CATALOG_MIN_INTERVAL_MS = '0';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Book, CatalogEdition, UserBookOverride, ReadingRecord, ImportJob, Audience, Format, Genre],
          synchronize: true,
        }),
        UsersModule,
        AuthModule,
        ImportModule,
      ],
    })
      .overrideProvider(ImportCatalogEnrichmentService)
      .useValue({
        enrichBook: jest.fn(async (book: Book) => ({
          book,
          enrichment_failed: false,
        })),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/v1/auth/dev-login')
      .send({ email: 'import@example.com' })
      .expect(201);
    token = (loginRes.body as { access_token: string }).access_token;
  });

  afterAll(async () => {
    delete process.env.IMPORT_JOBS_SYNC;
    delete process.env.CATALOG_MIN_INTERVAL_MS;
    if (app) {
      await app.close();
    }
  });

  it('re-importing the same CSV is idempotent', async () => {
    const csv = readFileSync(minFixturePath);

    const firstPost = await request(app.getHttpServer())
      .post('/v1/import/goodreads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', csv, 'goodreads_library_export.min.csv')
      .expect(202);

    const firstJobId = (firstPost.body as { job_id: string }).job_id;
    const firstBody = (await waitForCompletedJob(app, token, firstJobId)) as {
      result: {
        meta: {
          imported_count: number;
          skipped_invalid_count: number;
        };
      };
    };

    expect(firstBody.result.meta.imported_count).toBe(5);
    expect(firstBody.result.meta.skipped_invalid_count).toBe(1);

    const secondPost = await request(app.getHttpServer())
      .post('/v1/import/goodreads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', csv, 'goodreads_library_export.min.csv')
      .expect(202);

    const secondJobId = (secondPost.body as { job_id: string }).job_id;
    const secondBody = (await waitForCompletedJob(app, token, secondJobId)) as {
      result: {
        meta: {
          imported_count: number;
          skipped_duplicate_count: number;
        };
        skipped_rows: Array<{ code: string }>;
      };
    };

    expect(secondBody.result.meta.imported_count).toBe(0);
    expect(secondBody.result.meta.skipped_duplicate_count).toBe(5);
    expect(
      secondBody.result.skipped_rows.filter(
        (row) => row.code === 'DUPLICATE_EXISTING',
      ),
    ).toHaveLength(5);
  });

  it('returns job progress while processing', async () => {
    const csv = readFileSync(minFixturePath);

    const postRes = await request(app.getHttpServer())
      .post('/v1/import/goodreads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', csv, 'goodreads_library_export.min.csv')
      .expect(202);

    const jobId = (postRes.body as { job_id: string }).job_id;
    const job = (await waitForCompletedJob(app, token, jobId)) as {
      status: string;
      processed_count: number;
      total_count: number;
      result: { meta: { mapped_rows: number } };
    };

    expect(job.status).toBe('completed');
    expect(job.total_count).toBe(5);
    expect(job.processed_count).toBe(5);
    expect(job.result.meta.mapped_rows).toBe(5);
  });

  it('requires authentication', async () => {
    const csv = readFileSync(minFixturePath);
    await request(app.getHttpServer())
      .post('/v1/import/goodreads')
      .attach('file', csv, 'goodreads_library_export.csv')
      .expect(401);
  });

  it('rejects requests without a file', async () => {
    await request(app.getHttpServer())
      .post('/v1/import/goodreads')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
