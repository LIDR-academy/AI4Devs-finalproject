import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { execSync } from 'child_process';
import 'dotenv/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('MetricsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters';
    process.env.JWT_ACCESS_TTL = '15m';
    process.env.JWT_REFRESH_TTL = '7d';
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';

    execSync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/metrics returns Prometheus exposition without auth', async () => {
    const response = await request(app.getHttpServer()).get('/api/metrics');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.text).toContain('mecatrack_');
  });

  it('records HTTP RED metrics after traffic', async () => {
    await request(app.getHttpServer()).get('/api/health/live').expect(200);

    const response = await request(app.getHttpServer()).get('/api/metrics');

    expect(response.status).toBe(200);
    expect(response.text).toContain('mecatrack_http_requests_total');
    expect(response.text).toContain('route="/api/health/live"');
    expect(response.text).toContain('status_code="200"');
  });

  it('does not create high-cardinality labels for unknown UUID paths', async () => {
    const unknownId = '550e8400-e29b-41d4-a716-446655440000';
    await request(app.getHttpServer())
      .get(`/api/does-not-exist/${unknownId}`)
      .expect(404);

    const response = await request(app.getHttpServer()).get('/api/metrics');

    expect(response.text).not.toContain(unknownId);
    expect(response.text).toContain('route="unmatched"');
  });
});
