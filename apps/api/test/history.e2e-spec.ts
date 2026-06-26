import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { execSync } from 'child_process';
import 'dotenv/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

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

  return { accessToken: response.body.accessToken as string };
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

  return { accessToken: response.body.accessToken as string };
}

async function createVehicleWithWorkOrder(
  app: INestApplication,
  accessToken: string,
  clientId: string,
  options?: { entryReason?: string; completeTasks?: boolean },
): Promise<{ vehicleId: string; workOrderId: string; taskIds: string[] }> {
  const vehicleResponse = await request(app.getHttpServer())
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      licensePlate: `HS${uniquePlateSuffix()}`,
      brand: 'Toyota',
      model: 'Yaris',
      year: 2021,
      clientId,
    })
    .expect(201);

  const workOrderResponse = await request(app.getHttpServer())
    .post('/api/work-orders')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      vehicleId: vehicleResponse.body.id,
      entryReason: options?.entryReason ?? 'History e2e visit',
      mileage: 52000,
      initialTasks: [{ description: 'Inspection' }],
    })
    .expect(201);

  const workOrderId = workOrderResponse.body.id as string;
  const taskIds = workOrderResponse.body.tasks.map(
    (task: { id: string }) => task.id,
  );

  if (options?.completeTasks) {
    for (const taskId of taskIds) {
      await request(app.getHttpServer())
        .patch(`/api/work-orders/${workOrderId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'COMPLETED', cost: 75 })
        .expect(200);
    }
  }

  return {
    vehicleId: vehicleResponse.body.id as string,
    workOrderId,
    taskIds,
  };
}

describe('History endpoints (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let mechanicAccessToken: string;
  let juanClientId: string;
  let mariaClientId: string;

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
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    ({ accessToken: adminAccessToken } = await loginAsAdmin(app));
    ({ accessToken: mechanicAccessToken } = await loginAsMechanic(app));

    const prisma = app.get(PrismaService);
    const juan = await prisma.client.findUnique({
      where: { nationalId: '1-2345-6789' },
    });
    const maria = await prisma.client.findUnique({
      where: { nationalId: '2-3456-7890' },
    });

    juanClientId = juan!.id;
    mariaClientId = maria!.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/vehicles/:id/history as MECHANIC returns full contract', async () => {
    const { vehicleId } = await createVehicleWithWorkOrder(
      app,
      mechanicAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        vehicleId,
        licensePlate: expect.any(String),
        vehicleLabel: expect.any(String),
        currentOwner: expect.objectContaining({ id: juanClientId }),
        visits: expect.any(Array),
        total: expect.any(Number),
      }),
    );
  });

  it('GET /api/vehicles/:id/history as ADMIN returns 200', async () => {
    const { vehicleId } = await createVehicleWithWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });

  it('GET /api/vehicles/:id/history unknown id returns 404', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/vehicles/00000000-0000-4000-8000-000000000099/history')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Vehicle not found');
  });

  it('GET /api/vehicles/:id/history without token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/vehicles/00000000-0000-4000-8000-000000000001/history')
      .expect(401);
  });

  it('visits include EN_PROCESO and ENTREGADA in timeline', async () => {
    const { vehicleId, workOrderId } = await createVehicleWithWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
      { completeTasks: true },
    );

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        vehicleId,
        entryReason: 'Follow-up visit after delivery',
        mileage: 53000,
        initialTasks: [{ description: 'Post-delivery check' }],
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const statuses = response.body.visits.map(
      (visit: { status: string }) => visit.status,
    );

    expect(statuses).toContain('ENTREGADA');
    expect(statuses).toContain('EN_PROCESO');
    expect(response.body.visits[0].statusLabel).toBe('En proceso');
  });

  it('visit includes tasks[].diagnosis from US-007', async () => {
    const { vehicleId, workOrderId, taskIds } = await createVehicleWithWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[0]}/technical-notes`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ diagnosis: 'History diagnosis note' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const visit = response.body.visits.find(
      (item: { workOrderId: string }) => item.workOrderId === workOrderId,
    );

    expect(visit.tasks[0]).toEqual(
      expect.objectContaining({
        id: taskIds[0],
        diagnosis: 'History diagnosis note',
      }),
    );
  });

  it('ownerAtVisit matches ownerClientId snapshot after ownership change (D3)', async () => {
    const { vehicleId, workOrderId } = await createVehicleWithWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const prisma = app.get(PrismaService);
    const now = new Date();

    await prisma.vehicleOwnership.updateMany({
      where: { vehicleId, validTo: null },
      data: { validTo: now },
    });

    await prisma.vehicleOwnership.create({
      data: {
        vehicleId,
        clientId: mariaClientId,
        validFrom: now,
        validTo: null,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const visit = response.body.visits.find(
      (item: { workOrderId: string }) => item.workOrderId === workOrderId,
    );

    expect(response.body.currentOwner.id).toBe(mariaClientId);
    expect(visit.ownerAtVisit.id).toBe(juanClientId);
    expect(visit.ownerAtVisit.id).not.toBe(mariaClientId);
  });

  it('GET /api/clients/:id returns vehicles with lastVisitAt', async () => {
    const { vehicleId } = await createVehicleWithWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .get(`/api/clients/${juanClientId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const vehicle = response.body.vehicles.find(
      (item: { id: string }) => item.id === vehicleId,
    );

    expect(vehicle).toEqual(
      expect.objectContaining({
        id: vehicleId,
        licensePlate: expect.any(String),
        lastVisitAt: expect.any(String),
        lastVisitStatus: 'EN_PROCESO',
      }),
    );
  });

  it('GET /api/clients/:id unknown returns 404', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/clients/00000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Client not found');
  });

  it('after deliver, history shows deliveredAt', async () => {
    const { vehicleId, workOrderId, taskIds } = await createVehicleWithWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
      { completeTasks: true },
    );

    const deliverResponse = await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const historyResponse = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const visit = historyResponse.body.visits.find(
      (item: { workOrderId: string }) => item.workOrderId === workOrderId,
    );

    expect(visit.status).toBe('ENTREGADA');
    expect(visit.deliveredAt).toBe(deliverResponse.body.deliveredAt);
  });

  it('total matches visits.length', async () => {
    const { vehicleId } = await createVehicleWithWorkOrder(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.total).toBe(response.body.visits.length);
  });
});
