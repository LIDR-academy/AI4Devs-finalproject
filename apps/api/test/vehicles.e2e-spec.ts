import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { execSync } from 'child_process';
import 'dotenv/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

function uniquePlateSuffix(): string {
  return String(Date.now()).slice(-6);
}

async function loginAsAdmin(
  app: INestApplication,
): Promise<{ accessToken: string }> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      email: 'admin@taller.com',
      password: 'AdminPass123',
    })
    .expect(200);

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
    })
    .expect(200);

  return {
    accessToken: response.body.accessToken as string,
  };
}

describe('VehiclesController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let mechanicAccessToken: string;
  let juanClientId: string;

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

    const clientSearch = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: 'Juan' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    juanClientId = clientSearch.body.items[0].id as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/vehicles/search?q=AB as ADMIN returns items array', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/vehicles/search')
      .query({ q: 'AB' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ licensePlate: 'ABC123' }),
      ]),
    );
    expect(response.body.items[0].currentOwner).toEqual(
      expect.objectContaining({ fullName: 'Juan Pérez' }),
    );
  });

  it('GET /api/vehicles/search?licensePlate=ABC123 returns match', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/vehicles/search')
      .query({ licensePlate: 'ABC123' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].licensePlate).toBe('ABC123');
  });

  it('GET /api/vehicles/search without params returns 400', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/vehicles/search')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(400);

    expect(response.body.message).toBe(
      'At least one search parameter is required',
    );
  });

  it('GET /api/vehicles/search?q=A returns empty items', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/vehicles/search')
      .query({ q: 'A' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual({ items: [], total: 0 });
  });

  it('GET /api/vehicles/:id valid returns currentOwner', async () => {
    const searchResponse = await request(app.getHttpServer())
      .get('/api/vehicles/search')
      .query({ licensePlate: 'ABC123' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const vehicleId = searchResponse.body.items[0].id as string;

    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.currentOwner.fullName).toBe('Juan Pérez');
  });

  it('GET /api/vehicles/:id unknown returns 404', async () => {
    await request(app.getHttpServer())
      .get(`/api/vehicles/00000000-0000-4000-8000-000000000099`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });

  it('GET /api/vehicles/:id/history returns empty visits for a new vehicle', async () => {
    const suffix = uniquePlateSuffix();
    const createResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: `HIST${suffix}`,
        brand: 'Toyota',
        model: 'Yaris',
        year: 2015,
        clientId: juanClientId,
      })
      .expect(201);

    const vehicleId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        vehicleId,
        visits: [],
        total: 0,
      }),
    );
  });

  it('POST /api/vehicles valid as MECHANIC returns 201 with normalized plate', async () => {
    const suffix = uniquePlateSuffix();
    const response = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .send({
        licensePlate: `mech ${suffix}`,
        brand: 'Mazda',
        model: '3',
        year: 2021,
        clientId: juanClientId,
      })
      .expect(201);

    expect(response.body.licensePlate).toBe(`MECH${suffix}`.toUpperCase());
    expect(response.body.currentOwner.id).toBe(juanClientId);
  });

  it('POST /api/vehicles valid as ADMIN returns 201', async () => {
    const suffix = uniquePlateSuffix();
    const response = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: `ADM${suffix}`,
        brand: 'Kia',
        model: 'Rio',
        year: 2019,
        color: 'Rojo',
        clientId: juanClientId,
      })
      .expect(201);

    expect(response.body.brand).toBe('Kia');
  });

  it('POST /api/vehicles duplicate plate returns 409 with existingVehicle', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2018,
        clientId: juanClientId,
      })
      .expect(409);

    expect(response.body.message).toBe(
      'Vehicle with this license plate already exists',
    );
    expect(response.body.existingVehicle).toEqual(
      expect.objectContaining({
        licensePlate: 'ABC123',
        brand: 'Toyota',
      }),
    );
  });

  it('POST /api/vehicles unknown clientId returns 404', async () => {
    await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: 'UNK9999',
        brand: 'Ford',
        model: 'Focus',
        year: 2017,
        clientId: '00000000-0000-4000-8000-000000000099',
      })
      .expect(404);
  });

  it('POST /api/vehicles invalid year returns 400', async () => {
    await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: 'BADYEAR1',
        brand: 'Ford',
        model: 'Focus',
        year: 1800,
        clientId: juanClientId,
      })
      .expect(400);
  });

  it('POST /api/vehicles without clientId returns 201 with currentOwner null (US-D9)', async () => {
    const suffix = uniquePlateSuffix();
    const response = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: `OWN${suffix}`,
        brand: 'Suzuki',
        model: 'Swift',
        year: 2016,
      })
      .expect(201);

    expect(response.body.currentOwner).toBeNull();
  });

  it('GET /api/vehicles/search without token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/vehicles/search')
      .query({ q: 'AB' })
      .expect(401);
  });

  it('create vehicle then search by plate shows new vehicle', async () => {
    const plate = `SRCH${uniquePlateSuffix()}`;

    await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: plate,
        brand: 'Hyundai',
        model: 'Elantra',
        year: 2023,
        clientId: juanClientId,
      })
      .expect(201);

    const searchResponse = await request(app.getHttpServer())
      .get('/api/vehicles/search')
      .query({ licensePlate: plate })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(searchResponse.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ licensePlate: plate.toUpperCase() }),
      ]),
    );
  });

  it('create vehicle then GET history returns empty visits contract', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: `HIST${uniquePlateSuffix()}`,
        brand: 'Suzuki',
        model: 'Swift',
        year: 2020,
        clientId: juanClientId,
      })
      .expect(201);

    const vehicleId = createResponse.body.id as string;

    const historyResponse = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(historyResponse.body).toEqual(
      expect.objectContaining({
        vehicleId,
        visits: [],
        total: 0,
      }),
    );
  });

  it('PATCH /api/vehicles/:id updates vehicle data', async () => {
    const suffix = uniquePlateSuffix();
    const createResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: `PATCH${suffix}`,
        brand: 'Ford',
        model: 'Focus',
        year: 2017,
        clientId: juanClientId,
      })
      .expect(201);

    const vehicleId = createResponse.body.id as string;
    const newPlate = `FIX${suffix}`;

    const response = await request(app.getHttpServer())
      .patch(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: newPlate,
        brand: 'Ford',
        model: 'Focus',
        year: 2018,
        color: 'Azul',
      })
      .expect(200);

    expect(response.body.licensePlate).toBe(newPlate.toUpperCase());
    expect(response.body.year).toBe(2018);
    expect(response.body.color).toBe('Azul');
  });

  it('PATCH /api/vehicles/:id duplicate plate returns 409', async () => {
    const suffix = uniquePlateSuffix();
    const createResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: `DUPA${suffix}`,
        brand: 'Kia',
        model: 'Rio',
        year: 2019,
        clientId: juanClientId,
      })
      .expect(201);

    const vehicleId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: 'ABC123',
        brand: 'Kia',
        model: 'Rio',
        year: 2019,
      })
      .expect(409);
  });

  it('DELETE /api/vehicles/:id removes vehicle without work orders', async () => {
    const suffix = uniquePlateSuffix();
    const plate = `DEL${suffix}`;

    const createResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: plate,
        brand: 'Mitsubishi',
        model: 'Lancer',
        year: 2015,
        clientId: juanClientId,
      })
      .expect(201);

    const vehicleId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });
});
