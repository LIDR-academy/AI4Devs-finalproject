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
          role: 'MECHANIC',
        }),
      ]),
    );
    expect(
      response.body.some(
        (mechanic: { fullName: string }) =>
          mechanic.fullName === 'Inactive User',
      ),
    ).toBe(false);
    expect(
      response.body.some(
        (mechanic: { email?: string; fullName: string; role: string }) =>
          mechanic.fullName === 'Workshop Admin',
      ),
    ).toBe(false);
  });

  it('GET /api/work-orders/mechanics includes ADMIN with canActAsMechanic', async () => {
    const createAdmin = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Assignable Admin',
        email: `assignable.admin.${Date.now()}@taller.com`,
        password: 'AssignableAdmin1',
        role: 'ADMIN',
        canActAsMechanic: true,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/work-orders/mechanics')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createAdmin.body.id,
          fullName: 'Assignable Admin',
          role: 'ADMIN',
        }),
        expect.objectContaining({
          fullName: 'Workshop Mechanic',
          role: 'MECHANIC',
        }),
      ]),
    );
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

  it('GET /api/work-orders/in-progress returns paginated shape for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/work-orders/in-progress')
      .query({ limit: 5, offset: 0 })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: expect.any(Number),
        limit: 5,
        offset: 0,
      }),
    );
  });

  it('GET /api/work-orders/in-progress as mechanic returns only assigned work orders', async () => {
    const meResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .expect(200);

    const loggedInMechanicId = meResponse.body.id as string;

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
        entryReason: 'In-progress list visibility check',
        assignedMechanicId: loggedInMechanicId,
        initialTasks: [{ description: 'Inspect' }],
      })
      .expect(201);

    const workOrderId = createResponse.body.id as string;

    const mechanicList = await request(app.getHttpServer())
      .get('/api/work-orders/in-progress')
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .expect(200);

    expect(
      mechanicList.body.items.some(
        (item: { id: string }) => item.id === workOrderId,
      ),
    ).toBe(true);
  });

  it('GET /api/work-orders/in-progress without token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/work-orders/in-progress')
      .expect(401);
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

  it('POST /api/work-orders assigns ADMIN with canActAsMechanic and detail includes assignedMechanic', async () => {
    const createAdmin = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Detail Assign Admin',
        email: `detail.assign.admin.${Date.now()}@taller.com`,
        password: 'DetailAssignAdmin1',
        role: 'ADMIN',
        canActAsMechanic: true,
      })
      .expect(201);

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
        entryReason: 'Assigned to floor admin',
        mileage: 21000,
        assignedMechanicId: createAdmin.body.id,
        initialTasks: [{ description: 'Road test' }],
      })
      .expect(201);

    expect(createResponse.body.assignedMechanicId).toBe(createAdmin.body.id);
    expect(createResponse.body.assignedMechanic).toEqual(
      expect.objectContaining({
        id: createAdmin.body.id,
        fullName: 'Detail Assign Admin',
        role: 'ADMIN',
      }),
    );

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/work-orders/${createResponse.body.id as string}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(detailResponse.body.assignedMechanic).toEqual(
      expect.objectContaining({
        id: createAdmin.body.id,
        fullName: 'Detail Assign Admin',
        role: 'ADMIN',
      }),
    );
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

  it('POST /api/work-orders without mileage returns 201 with mileage null', async () => {
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
        entryReason: 'Vehicle towed in without readable odometer',
        initialTasks: [{ description: 'Electrical diagnosis' }],
      })
      .expect(201);

    expect(response.body.mileage).toBeNull();
  });

  it('PATCH /api/work-orders/:id/mileage updates mileage on EN_PROCESO', async () => {
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
        entryReason: 'No odometer at intake',
        initialTasks: [{ description: 'General inspection' }],
      })
      .expect(201);

    const workOrderId = createResponse.body.id as string;

    const patchResponse = await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/mileage`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ mileage: 85400 })
      .expect(200);

    expect(patchResponse.body.mileage).toBe(85400);

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(detailResponse.body.mileage).toBe(85400);
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

  it('US-D9 THIRD_PARTY intake without owner + link-owner', async () => {
    const suffix = Date.now().toString().slice(-6);
    const vehicleResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: `D9${suffix}`,
        brand: 'Nissan',
        model: 'Versa',
        year: 2018,
      })
      .expect(201);

    const vehicleId = vehicleResponse.body.id as string;

    const createResponse = await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'External shop referral diagnosis',
        intakeMode: 'THIRD_PARTY',
        broughtByName: 'Carlos Jiménez',
        broughtByPhone: '88881234',
        initialTasks: [{ description: 'Scanner OBD' }],
      })
      .expect(201);

    expect(createResponse.body.ownerClientId).toBeNull();
    expect(createResponse.body.owner).toBeNull();
    expect(createResponse.body.intakeMode).toBe('THIRD_PARTY');
    expect(createResponse.body.broughtByName).toBe('Carlos Jiménez');

    const historyResponse = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(historyResponse.body.currentOwner).toBeNull();
    expect(historyResponse.body.visits[0].ownerAtVisit).toBeNull();
    expect(historyResponse.body.visits[0].broughtByName).toBe('Carlos Jiménez');

    const linkResponse = await request(app.getHttpServer())
      .patch(`/api/work-orders/${createResponse.body.id}/link-owner`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ clientId: juanClientId })
      .expect(200);

    expect(linkResponse.body.ownerClientId).toBe(juanClientId);
    expect(linkResponse.body.broughtByName).toBe('Carlos Jiménez');
    expect(linkResponse.body.vehicleOwnerUnchanged).toBe(false);
  });
});
