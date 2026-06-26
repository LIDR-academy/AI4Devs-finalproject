import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { execSync } from 'child_process';
import 'dotenv/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

async function loginAsAdmin(
  app: INestApplication,
): Promise<{ accessToken: string }> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      email: 'admin@taller.com',
      password: 'AdminPass123',
    });

  return {
    accessToken: response.body.accessToken as string,
  };
}

async function loginAsMechanic(
  app: INestApplication,
): Promise<{ accessToken: string }> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      email: 'mechanic@taller.com',
      password: 'MechanicPass123',
    });

  return {
    accessToken: response.body.accessToken as string,
  };
}

describe('ClientsController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let mechanicAccessToken: string;

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
    execSync('npx prisma db seed', {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const adminSession = await loginAsAdmin(app);
    adminAccessToken = adminSession.accessToken;

    const mechanicSession = await loginAsMechanic(app);
    mechanicAccessToken = mechanicSession.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/clients/search?q=Juan as ADMIN returns items array', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: 'Juan' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fullName: 'Juan Pérez' }),
      ]),
    );
    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/clients/search?nationalId=1-2345-6789 returns match', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ nationalId: '1-2345-6789' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].nationalId).toBe('1-2345-6789');
  });

  it('GET /api/clients/search without params returns 400', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/clients/search')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(400);

    expect(response.body.message).toBe(
      'At least one search parameter is required',
    );
  });

  it('GET /api/clients/search?q=a returns empty items', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: 'a' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual({ items: [], total: 0 });
  });

  it('GET /api/clients/:id valid returns 200', async () => {
    const searchResponse = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: 'Juan' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const clientId = searchResponse.body.items[0].id as string;

    const response = await request(app.getHttpServer())
      .get(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.id).toBe(clientId);
    expect(response.body.fullName).toBe('Juan Pérez');
    expect(response.body.vehicles).toEqual(expect.any(Array));
  });

  it('GET /api/clients/:id unknown returns 404', async () => {
    await request(app.getHttpServer())
      .get(`/api/clients/00000000-0000-4000-8000-000000000099`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });

  it('POST /api/clients valid as MECHANIC returns 201', async () => {
    const suffix = Date.now();
    const response = await request(app.getHttpServer())
      .post('/api/clients')
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .send({
        fullName: 'E2E Mechanic Client',
        nationalId: `9-${suffix}-0001`,
        phone: '66665555',
        email: `mechanic.client.${suffix}@email.com`,
      })
      .expect(201);

    expect(response.body.fullName).toBe('E2E Mechanic Client');
    expect(response.body.id).toBeDefined();
  });

  it('POST /api/clients valid as ADMIN returns 201', async () => {
    const suffix = Date.now();
    const response = await request(app.getHttpServer())
      .post('/api/clients')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'E2E Admin Client',
        nationalId: `8-${suffix}-0002`,
        phone: '55554444',
      })
      .expect(201);

    expect(response.body.fullName).toBe('E2E Admin Client');
  });

  it('POST /api/clients duplicate nationalId returns 409 with existingClient', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/clients')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Duplicate Juan',
        nationalId: '1-2345-6789',
      })
      .expect(409);

    expect(response.body.message).toBe(
      'Client with this national ID already exists',
    );
    expect(response.body.existingClient).toEqual(
      expect.objectContaining({
        fullName: 'Juan Pérez',
        nationalId: '1-2345-6789',
      }),
    );
  });

  it('POST /api/clients missing fullName returns 400', async () => {
    await request(app.getHttpServer())
      .post('/api/clients')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        nationalId: '7-7777-7777',
      })
      .expect(400);
  });

  it('GET /api/clients/search without token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: 'Juan' })
      .expect(401);
  });

  it('create then search by name shows new client', async () => {
    const suffix = Date.now();
    const fullName = `Searchable Client ${suffix}`;

    await request(app.getHttpServer())
      .post('/api/clients')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName,
        nationalId: `6-${suffix}-0003`,
      })
      .expect(201);

    const searchResponse = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: fullName })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(searchResponse.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ fullName })]),
    );
  });

  it('PATCH /api/clients/:id updates client as MECHANIC', async () => {
    const searchResponse = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: 'Juan' })
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .expect(200);

    const clientId = searchResponse.body.items[0].id as string;

    const response = await request(app.getHttpServer())
      .patch(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .send({
        fullName: 'Juan Pérez Actualizado',
        phone: '88881234',
        email: 'juan.updated@email.com',
      })
      .expect(200);

    expect(response.body.fullName).toBe('Juan Pérez Actualizado');
    expect(response.body.nationalId).toBe('1-2345-6789');
    expect(response.body.phone).toBe('88881234');
  });

  it('PATCH /api/clients/:id unknown returns 404', async () => {
    await request(app.getHttpServer())
      .patch(`/api/clients/00000000-0000-4000-8000-000000000099`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Missing Client',
      })
      .expect(404);
  });

  it('PATCH /api/clients/:id missing fullName returns 400', async () => {
    const searchResponse = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: 'María' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const clientId = searchResponse.body.items[0].id as string;

    await request(app.getHttpServer())
      .patch(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        phone: '77776666',
      })
      .expect(400);
  });
});
