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

async function createWorkOrderWithTwoTasks(
  app: INestApplication,
  accessToken: string,
  clientId: string,
): Promise<{ workOrderId: string; taskIds: string[] }> {
  const vehicleResponse = await request(app.getHttpServer())
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      licensePlate: `TK${uniquePlateSuffix()}`,
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
      entryReason: 'Task management e2e work order',
      mileage: 40000,
      initialTasks: [
        { description: 'Inspect brakes' },
        { description: 'Replace pads' },
      ],
    })
    .expect(201);

  return {
    workOrderId: workOrderResponse.body.id as string,
    taskIds: workOrderResponse.body.tasks.map((task: { id: string }) => task.id),
  };
}

describe('WorkOrderTasksController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
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

  it('POST /api/work-orders/:id/tasks on EN_PROCESO work order returns 201', async () => {
    const { workOrderId } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .post(`/api/work-orders/${workOrderId}/tasks`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ description: 'Balance tires' })
      .expect(201);

    expect(response.body.status).toBe('PENDING');
    expect(response.body.description).toBe('Balance tires');
  });

  it('POST /api/work-orders/:id/tasks on LISTA_PARA_ENTREGA work order returns 403', async () => {
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

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[1]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 75 })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/work-orders/${workOrderId}/tasks`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ description: 'Should be forbidden' })
      .expect(403);
  });

  it('PATCH task to IN_PROGRESS keeps work order EN_PROCESO', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    expect(response.body.task.status).toBe('IN_PROGRESS');
    expect(response.body.workOrder.status).toBe('EN_PROCESO');
  });

  it('PATCH task to COMPLETED without cost returns 400', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(
      Array.isArray(response.body.message)
        ? response.body.message.join(' ')
        : response.body.message,
    ).toMatch(/cost/i);
  });

  it('PATCH task to COMPLETED with cost returns 200', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 99.5, costNotes: 'Parts included' })
      .expect(200);

    expect(response.body.task.cost).toBe(99.5);
    expect(response.body.task.costNotes).toBe('Parts included');
    expect(response.body.workOrder.totalAmount).toBe(99.5);
  });

  it('completing all tasks transitions work order to LISTA_PARA_ENTREGA', async () => {
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

    const response = await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[1]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 60 })
      .expect(200);

    expect(response.body.workOrder.status).toBe('LISTA_PARA_ENTREGA');
    expect(response.body.workOrder.totalAmount).toBe(100);
  });

  it('PATCH on COMPLETED task returns 409', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 25 })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(409);
  });

  it('GET /api/work-orders/:id returns correct totalAmount', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 30 })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/api/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.totalAmount).toBe(30);
    expect(response.body.tasks[0].completedAt).toBeTruthy();
  });

  it('PATCH on ENTREGADA work order returns 403', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 10 })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[1]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 20 })
      .expect(200);

    const prisma = app.get(PrismaService);
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: 'ENTREGADA' },
    });

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(403);
  });

  it('POST /api/work-orders/:id/tasks without token returns 401', async () => {
    const { workOrderId } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    await request(app.getHttpServer())
      .post(`/api/work-orders/${workOrderId}/tasks`)
      .send({ description: 'Unauthorized task' })
      .expect(401);
  });

  it('PATCH complete response includes task and workOrder summary', async () => {
    const { workOrderId, taskIds } = await createWorkOrderWithTwoTasks(
      app,
      adminAccessToken,
      juanClientId,
    );

    const response = await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'COMPLETED', cost: 45 })
      .expect(200);

    expect(response.body.task).toEqual(
      expect.objectContaining({
        id: taskIds[0],
        status: 'COMPLETED',
        cost: 45,
      }),
    );
    expect(response.body.workOrder).toEqual(
      expect.objectContaining({
        id: workOrderId,
        status: 'EN_PROCESO',
        totalAmount: 45,
      }),
    );
    expect(response.body.workOrder.updatedAt).toBeTruthy();
  });
});
