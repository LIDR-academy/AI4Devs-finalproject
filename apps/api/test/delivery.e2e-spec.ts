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

async function createReadyWorkOrder(
  app: INestApplication,
  accessToken: string,
  clientId: string,
  options?: { mileage?: number | null },
): Promise<{ workOrderId: string; vehicleId: string; taskIds: string[] }> {
  const vehicleResponse = await request(app.getHttpServer())
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      licensePlate: `DL${uniquePlateSuffix()}`,
      brand: 'Honda',
      model: 'Civic',
      year: 2019,
      clientId,
    })
    .expect(201);

  const workOrderPayload: Record<string, unknown> = {
    vehicleId: vehicleResponse.body.id,
    entryReason: 'Delivery panel e2e work order',
    initialTasks: [
      { description: 'Oil change' },
      { description: 'Filter replacement' },
    ],
  };

  if (options?.mileage !== undefined) {
    workOrderPayload.mileage = options.mileage;
  } else {
    workOrderPayload.mileage = 50000;
  }

  const workOrderResponse = await request(app.getHttpServer())
    .post('/api/work-orders')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(workOrderPayload)
    .expect(201);

  const workOrderId = workOrderResponse.body.id as string;
  const taskIds = workOrderResponse.body.tasks.map(
    (task: { id: string }) => task.id,
  );

  for (const taskId of taskIds) {
    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'COMPLETED', cost: 40 })
      .expect(200);
  }

  return {
    workOrderId,
    vehicleId: vehicleResponse.body.id as string,
    taskIds,
  };
}

describe('DeliveryController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let mechanicAccessToken: string;
  let juanClientId: string;
  let carlosClientId: string;

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

    adminAccessToken = (await loginAsAdmin(app)).accessToken;
    mechanicAccessToken = (await loginAsMechanic(app)).accessToken;

    const clientSearch = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: 'Juan' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    juanClientId = clientSearch.body.items[0].id as string;

    const carlosSearch = await request(app.getHttpServer())
      .get('/api/clients/search')
      .query({ q: 'Carlos' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    carlosClientId = carlosSearch.body.items[0].id as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/delivery/ready as ADMIN returns items with ownerPhone', async () => {
    await createReadyWorkOrder(app, adminAccessToken, juanClientId);

    const response = await request(app.getHttpServer())
      .get('/api/delivery/ready')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.total).toBeGreaterThan(0);
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        workOrderId: expect.any(String),
        ownerPhone: expect.anything(),
        totalAmount: expect.any(Number),
        elapsedLabel: expect.any(String),
      }),
    );
    expect(response.body.items[0]).toHaveProperty('ownerPhone');
  });

  it('GET /api/delivery/ready as MECHANIC returns 403', async () => {
    await request(app.getHttpServer())
      .get('/api/delivery/ready')
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .expect(403);
  });

  it('GET /api/delivery/ready without token returns 401', async () => {
    await request(app.getHttpServer()).get('/api/delivery/ready').expect(401);
  });

  it('GET /api/delivery/ready/:id returns detail with tasks and total', async () => {
    const { workOrderId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .get(`/api/delivery/ready/${workOrderId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.tasks).toHaveLength(2);
    expect(response.body.totalAmount).toBe(80);
    expect(response.body.owner.phone).toBeTruthy();
  });

  it('GET /api/delivery/ready/:id for EN_PROCESO work order returns 404', async () => {
    const vehicleResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        licensePlate: `EP${uniquePlateSuffix()}`,
        brand: 'Mazda',
        model: '3',
        year: 2018,
        clientId: juanClientId,
      })
      .expect(201);

    const workOrderResponse = await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId: vehicleResponse.body.id,
        entryReason: 'Still in progress',
        mileage: 30000,
        initialTasks: [{ description: 'Pending task' }],
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/delivery/ready/${workOrderResponse.body.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });

  it('PATCH /api/delivery/ready/:id/deliver as ADMIN marks ENTREGADA', async () => {
    const { workOrderId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        workOrderId,
        status: 'ENTREGADA',
        deliveredAt: expect.any(String),
      }),
    );
  });

  it('PATCH /api/delivery/ready/:id/deliver as MECHANIC returns 403', async () => {
    const { workOrderId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .expect(403);
  });

  it('PATCH /api/delivery/ready/:id/deliver twice returns 409', async () => {
    const { workOrderId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(409);

    expect(response.body.message).toBe('Work order is already delivered');
  });

  it('after deliver, work order is absent from ready list', async () => {
    const { workOrderId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/api/delivery/ready')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(
      response.body.items.some(
        (item: { workOrderId: string }) => item.workOrderId === workOrderId,
      ),
    ).toBe(false);
  });

  it('after deliver, new work order can be created for same vehicle', async () => {
    const { workOrderId, vehicleId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const activeResponse = await request(app.getHttpServer())
      .get(`/api/work-orders/active?vehicleId=${vehicleId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(activeResponse.body.activeWorkOrder).toBeNull();

    await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'New visit after delivery',
        mileage: 51000,
        initialTasks: [{ description: 'Follow-up inspection' }],
      })
      .expect(201);
  });

  it('PATCH deliver with optional mileage persists mileage on ENTREGADA', async () => {
    const { workOrderId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
      { mileage: null },
    );

    const deliverResponse = await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ mileage: 125000 })
      .expect(200);

    expect(deliverResponse.body.status).toBe('ENTREGADA');
    expect(deliverResponse.body.mileage).toBe(125000);
  });

  it('list item for client without phone returns ownerPhone null', async () => {
    const { workOrderId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      carlosClientId,
    );

    const response = await request(app.getHttpServer())
      .get('/api/delivery/ready')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const item = response.body.items.find(
      (entry: { workOrderId: string }) => entry.workOrderId === workOrderId,
    );

    expect(item).toEqual(
      expect.objectContaining({
        ownerPhone: null,
        ownerPhoneDisplay: null,
      }),
    );
  });

  it('PATCH mark-contacted transitions to OWNER_CONTACTED and stays on list', async () => {
    const { workOrderId, vehicleId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const contactResponse = await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/mark-contacted`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(contactResponse.body).toEqual(
      expect.objectContaining({
        workOrderId,
        status: 'OWNER_CONTACTED',
        ownerContactedAt: expect.any(String),
        ownerContactedBy: expect.objectContaining({
          fullName: expect.any(String),
        }),
      }),
    );

    const listResponse = await request(app.getHttpServer())
      .get('/api/delivery/ready')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(listResponse.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workOrderId,
          status: 'OWNER_CONTACTED',
        }),
      ]),
    );

    await request(app.getHttpServer())
      .get(`/api/delivery/ready/${workOrderId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'Should conflict while OWNER_CONTACTED',
        mileage: 52000,
        initialTasks: [{ description: 'Blocked task' }],
      })
      .expect(409);

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });

  it('PATCH mark-contacted twice returns 409', async () => {
    const { workOrderId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/mark-contacted`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/mark-contacted`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(409);

    expect(response.body.message).toBe('Owner already contacted');
  });

  it('PATCH mark-contacted as MECHANIC returns 403', async () => {
    const { workOrderId } = await createReadyWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/mark-contacted`)
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .expect(403);
  });
});
