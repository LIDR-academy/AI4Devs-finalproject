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

async function createWorkOrderWithTwoTasks(
  app: INestApplication,
  accessToken: string,
  clientId: string,
): Promise<{
  workOrderId: string;
  vehicleId: string;
  taskIds: string[];
}> {
  const vehicleResponse = await request(app.getHttpServer())
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      licensePlate: `TN${uniquePlateSuffix()}`,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      clientId,
    })
    .expect(201);

  const workOrderResponse = await request(app.getHttpServer())
    .post('/api/work-orders')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      vehicleId: vehicleResponse.body.id,
      entryReason: 'Technical notes e2e work order',
      mileage: 42000,
      initialTasks: [
        { description: 'Inspect brakes' },
        { description: 'Replace pads' },
      ],
    })
    .expect(201);

  return {
    workOrderId: workOrderResponse.body.id as string,
    vehicleId: vehicleResponse.body.id as string,
    taskIds: workOrderResponse.body.tasks.map((task: { id: string }) => task.id),
  };
}

describe('WorkOrderTechnicalNotesController (e2e)', () => {
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

  it('PATCH task technical notes on PENDING task returns 200', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[0]}/technical-notes`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        diagnosis: 'Worn brake pads',
        repairPerformed: 'Replaced front pads',
        partsUsed: 'Pad kit',
        additionalNotes: 'Customer approved',
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: taskIds[0],
        status: 'PENDING',
        diagnosis: 'Worn brake pads',
        repairPerformed: 'Replaced front pads',
        partsUsed: 'Pad kit',
        additionalNotes: 'Customer approved',
      }),
    );
  });

  it('PATCH task technical notes on COMPLETED task returns 403', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 50 })
      .expect(200);

    const response = await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[0]}/technical-notes`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ diagnosis: 'Should fail' })
      .expect(403);

    expect(response.body.message).toBe(
      'Cannot edit technical notes on a completed task',
    );
  });

  it('PATCH visit notes on EN_PROCESO work order returns 200', async () => {
    const { workOrderId } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/visit-notes`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        visitDiagnosis: 'General brake inspection',
        visitRepairSummary: 'Pads replaced',
        visitPartsUsed: 'Pads and fluid',
        visitAdditionalNotes: 'Recommend rotor check next visit',
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: workOrderId,
        status: 'EN_PROCESO',
        visitDiagnosis: 'General brake inspection',
        visitRepairSummary: 'Pads replaced',
        visitPartsUsed: 'Pads and fluid',
        visitAdditionalNotes: 'Recommend rotor check next visit',
      }),
    );
  });

  it('PATCH visit notes on LISTA_PARA_ENTREGA work order returns 403', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 40 })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[1]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 60 })
      .expect(200);

    const response = await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/visit-notes`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ visitDiagnosis: 'Should fail' })
      .expect(403);

    expect(response.body.message).toBe('Work order is not editable');
  });

  it('GET /api/work-orders/:id includes visit and task technical fields', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[0]}/technical-notes`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ diagnosis: 'Noise when braking' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/visit-notes`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ visitDiagnosis: 'Brake system check' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/api/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.visitDiagnosis).toBe('Brake system check');
    expect(response.body.tasks[0].diagnosis).toBe('Noise when braking');
    expect(response.body.tasks[0]).toEqual(
      expect.objectContaining({
        repairPerformed: null,
        partsUsed: null,
        additionalNotes: null,
      }),
    );
  });

  it('GET /api/vehicles/:id/history includes visitNotes and task technical data', async () => {
    const { workOrderId, vehicleId, taskIds } =
      await createWorkOrderWithTwoTasks(app, adminAccessToken, juanClientId);

    await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[0]}/technical-notes`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        diagnosis: 'Pad wear',
        repairPerformed: 'Pads replaced',
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/visit-notes`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ visitRepairSummary: 'Brake service completed' })
      .expect(200);

    const historyResponse = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const visit = historyResponse.body.visits.find(
      (item: { workOrderId: string }) => item.workOrderId === workOrderId,
    );

    expect(visit.visitNotes.visitRepairSummary).toBe('Brake service completed');
    expect(visit.tasks[0]).toEqual(
      expect.objectContaining({
        diagnosis: 'Pad wear',
        repairPerformed: 'Pads replaced',
      }),
    );
  });

  it('completing task without technical notes still returns 200', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 35 })
      .expect(200);

    expect(response.body.task.status).toBe('COMPLETED');
    expect(response.body.task.diagnosis).toBeNull();
  });

  it('saved notes remain visible in history after completing tasks', async () => {
    const { workOrderId, vehicleId, taskIds } =
      await createWorkOrderWithTwoTasks(app, adminAccessToken, juanClientId);

    await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[0]}/technical-notes`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ diagnosis: 'Persistent diagnosis note' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/visit-notes`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ visitDiagnosis: 'Persistent visit diagnosis' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 25 })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[1]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 35 })
      .expect(200);

    const prisma = app.get(PrismaService);
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: 'ENTREGADA' },
    });

    const historyResponse = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const visit = historyResponse.body.visits.find(
      (item: { workOrderId: string }) => item.workOrderId === workOrderId,
    );

    expect(visit.status).toBe('ENTREGADA');
    expect(visit.visitNotes.visitDiagnosis).toBe('Persistent visit diagnosis');
    expect(visit.tasks[0].diagnosis).toBe('Persistent diagnosis note');
  });

  it('PATCH technical notes without token returns 401', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[0]}/technical-notes`,
      )
      .send({ diagnosis: 'Unauthorized' })
      .expect(401);
  });

  it('PATCH technical notes as MECHANIC returns 200', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[1]}/technical-notes`,
      )
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .send({ diagnosis: 'Mechanic diagnosis note' })
      .expect(200);

    expect(response.body.diagnosis).toBe('Mechanic diagnosis note');
  });

  it('PATCH task technical notes does not change task status or cost', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[0]}/technical-notes`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ diagnosis: 'In progress diagnosis' })
      .expect(200);

    expect(response.body.status).toBe('IN_PROGRESS');
    expect(response.body.cost).toBeUndefined();
  });

  it('PATCH task technical notes with field over 5000 chars returns 400', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(
        `/api/work-orders/${workOrderId}/tasks/${taskIds[0]}/technical-notes`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ diagnosis: 'x'.repeat(5001) })
      .expect(400);

    expect(response.body.statusCode).toBe(400);
  });
});
