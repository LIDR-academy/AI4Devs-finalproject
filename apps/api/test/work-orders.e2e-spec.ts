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

async function createVehicleForWorkOrder(
  app: INestApplication,
  accessToken: string,
  clientId: string,
): Promise<string> {
  const createResponse = await request(app.getHttpServer())
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      licensePlate: `WO${uniquePlateSuffix()}`,
      brand: 'Toyota',
      model: 'Yaris',
      year: 2020,
      clientId,
    })
    .expect(201);

  return createResponse.body.id as string;
}

describe('WorkOrdersController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let mechanicAccessToken: string;
  let juanClientId: string;
  let mechanicUserId: string;

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

    const mechanicsResponse = await request(app.getHttpServer())
      .get('/api/work-orders/mechanics')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    mechanicUserId = mechanicsResponse.body[0].id as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/work-orders/mechanics as MECHANIC returns active mechanics only', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/work-orders/mechanics')
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fullName: 'Workshop Mechanic',
        }),
      ]),
    );
    expect(
      response.body.some(
        (mechanic: { fullName: string }) =>
          mechanic.fullName === 'Inactive User',
      ),
    ).toBe(false);
  });

  it('GET /api/work-orders/active?vehicleId= valid returns null or active', async () => {
    const vehicleId = await createVehicleForWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .get('/api/work-orders/active')
      .query({ vehicleId })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual({ activeWorkOrder: null });
  });

  it('GET /api/work-orders/active missing vehicleId returns 400', async () => {
    await request(app.getHttpServer())
      .get('/api/work-orders/active')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(400);
  });

  it('POST /api/work-orders valid as ADMIN returns 201 with tasks', async () => {
    const vehicleId = await createVehicleForWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'Routine maintenance check',
        mileage: 45000,
        initialTasks: [{ description: 'Inspect brakes' }],
      })
      .expect(201);

    expect(response.body.status).toBe('EN_PROCESO');
    expect(response.body.tasks.length).toBeGreaterThanOrEqual(1);
    expect(response.body.vehicle).toEqual(
      expect.objectContaining({ brand: 'Toyota' }),
    );
    expect(response.body.owner).toEqual(
      expect.objectContaining({ nationalId: '1-2345-6789' }),
    );
  });

  it('POST /api/work-orders valid as MECHANIC returns 201', async () => {
    const vehicleId = await createVehicleForWorkOrder(
      app,
      mechanicAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'Engine noise diagnosis',
        mileage: 62000,
        assignedMechanicId: mechanicUserId,
        initialTasks: [{ description: 'Listen for engine noise' }],
      })
      .expect(201);

    expect(response.body.assignedMechanicId).toBe(mechanicUserId);
  });

  it('POST /api/work-orders no initial tasks returns 400', async () => {
    const vehicleId = await createVehicleForWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'Missing tasks',
        mileage: 10000,
        initialTasks: [],
      })
      .expect(400);
  });

  it('POST /api/work-orders unknown vehicle returns 404', async () => {
    await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId: '00000000-0000-4000-8000-000000000099',
        entryReason: 'Unknown vehicle visit',
        mileage: 10000,
        initialTasks: [{ description: 'General inspection' }],
      })
      .expect(404);
  });

  it('POST /api/work-orders second active for same vehicle returns 409 with activeWorkOrderId', async () => {
    const vehicleId = await createVehicleForWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const firstResponse = await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'First active work order',
        mileage: 30000,
        initialTasks: [{ description: 'Oil change' }],
      })
      .expect(201);

    const firstWorkOrderId = firstResponse.body.id as string;

    const conflictResponse = await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'Duplicate active work order',
        mileage: 31000,
        initialTasks: [{ description: 'Tire rotation' }],
      })
      .expect(409);

    expect(conflictResponse.body.message).toBe(
      'Vehicle already has an active work order',
    );
    expect(conflictResponse.body.activeWorkOrderId).toBe(firstWorkOrderId);
  });

  it('POST /api/work-orders invalid mechanic returns 400', async () => {
    const vehicleId = await createVehicleForWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const adminProfile = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'Invalid mechanic assignment',
        mileage: 20000,
        assignedMechanicId: adminProfile.body.id,
        initialTasks: [{ description: 'Check alignment' }],
      })
      .expect(400);
  });

  it('GET /api/work-orders/:id after create returns tasks', async () => {
    const vehicleId = await createVehicleForWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const createResponse = await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'Detail endpoint test',
        mileage: 15000,
        initialTasks: [
          { description: 'Replace filter' },
          { description: 'Top up fluids' },
        ],
      })
      .expect(201);

    const workOrderId = createResponse.body.id as string;

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(detailResponse.body.tasks).toHaveLength(2);
    expect(detailResponse.body.tasks[0].sortOrder).toBe(0);
    expect(detailResponse.body.tasks[1].sortOrder).toBe(1);
  });

  it('GET /api/work-orders/:id unknown returns 404', async () => {
    await request(app.getHttpServer())
      .get('/api/work-orders/00000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });

  it('GET /api/vehicles/:id/history after create includes visit', async () => {
    const vehicleId = await createVehicleForWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const createResponse = await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'History integration test',
        mileage: 88000,
        initialTasks: [{ description: 'Battery test' }],
      })
      .expect(201);

    const historyResponse = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(historyResponse.body.visits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workOrderId: createResponse.body.id,
          status: 'EN_PROCESO',
          entryReason: 'History integration test',
          ownerAtVisit: expect.objectContaining({
            nationalId: '1-2345-6789',
          }),
        }),
      ]),
    );
  });

  it('POST /api/work-orders without token returns 401', async () => {
    await request(app.getHttpServer())
      .post('/api/work-orders')
      .send({
        vehicleId: '00000000-0000-4000-8000-000000000001',
        entryReason: 'Unauthorized create',
        mileage: 1000,
        initialTasks: [{ description: 'Unauthorized task' }],
      })
      .expect(401);
  });
});
