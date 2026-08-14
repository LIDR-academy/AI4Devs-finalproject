import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
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

describe('RemindersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let clientId: string;

  beforeAll(async () => {
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

    prisma = app.get(PrismaService);
    adminToken = (await loginAsAdmin(app)).accessToken;

    const client = await prisma.client.findFirst({
      where: { email: { not: null } },
    });
    if (!client) {
      throw new Error('Seed client with email required for reminders e2e');
    }
    clientId = client.id;
  });

  afterAll(async () => {
    await app.close();
  });

  async function createEligibleVehicle(): Promise<{
    vehicleId: string;
    licensePlate: string;
  }> {
    const licensePlate = `RM${uniquePlateSuffix()}`;
    const vehicleResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2018,
        clientId,
      })
      .expect(201);

    const vehicleId = vehicleResponse.body.id as string;

    const workOrderResponse = await request(app.getHttpServer())
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vehicleId,
        entryReason: 'Reminders e2e historical visit',
        mileage: 40000,
        initialTasks: [{ description: 'Past service' }],
      })
      .expect(201);

    const workOrderId = workOrderResponse.body.id as string;
    const taskId = workOrderResponse.body.tasks[0].id as string;

    await request(app.getHttpServer())
      .patch(`/api/work-orders/${workOrderId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED', cost: 25 })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/mark-contacted`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/delivery/ready/${workOrderId}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { deliveredAt: oldDate },
    });

    return { vehicleId, licensePlate };
  }

  it('rejects unauthenticated requests', async () => {
    await request(app.getHttpServer())
      .get('/api/reminders/eligible')
      .expect(401);
  });

  it('rejects mechanic with 403', async () => {
    const { accessToken } = await loginAsMechanic(app);
    await request(app.getHttpServer())
      .get('/api/reminders/eligible')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('lists eligible vehicles with pagination echo', async () => {
    const { licensePlate } = await createEligibleVehicle();

    const response = await request(app.getHttpServer())
      .get('/api/reminders/eligible?limit=5&offset=0')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.limit).toBe(5);
    expect(response.body.offset).toBe(0);
    expect(response.body.thresholdDays).toBeGreaterThanOrEqual(30);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.total).toBeGreaterThanOrEqual(1);

    const match = response.body.items.find(
      (item: { licensePlate: string }) => item.licensePlate === licensePlate,
    );
    expect(match).toBeDefined();
    expect(match.daysSinceVisit).toBeGreaterThanOrEqual(180);
  });

  it('supports opt-out and opt-in', async () => {
    const { vehicleId, licensePlate } = await createEligibleVehicle();

    await request(app.getHttpServer())
      .post(`/api/reminders/${vehicleId}/opt-out`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const eligibleAfter = await request(app.getHttpServer())
      .get('/api/reminders/eligible')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(
      eligibleAfter.body.items.some(
        (item: { vehicleId: string }) => item.vehicleId === vehicleId,
      ),
    ).toBe(false);

    const optedOut = await request(app.getHttpServer())
      .get('/api/reminders/opted-out')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(
      optedOut.body.items.some(
        (item: { licensePlate: string }) =>
          item.licensePlate === licensePlate,
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .post(`/api/reminders/${vehicleId}/opt-in`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const eligibleAgain = await request(app.getHttpServer())
      .get('/api/reminders/eligible')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(
      eligibleAgain.body.items.some(
        (item: { vehicleId: string }) => item.vehicleId === vehicleId,
      ),
    ).toBe(true);
  });

  it('sends reminders with partial-safe summary', async () => {
    const previousEnabled = process.env.EMAIL_ENABLED;
    process.env.EMAIL_ENABLED = 'true';

    try {
      const { vehicleId } = await createEligibleVehicle();
      const unknownId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

      const response = await request(app.getHttpServer())
        .post('/api/reminders/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ vehicleIds: [vehicleId, unknownId] })
        .expect(200);

      expect(response.body.summary.requested).toBe(2);
      expect(response.body.results).toHaveLength(2);

      const known = response.body.results.find(
        (row: { vehicleId: string }) => row.vehicleId === vehicleId,
      );
      const unknown = response.body.results.find(
        (row: { vehicleId: string }) => row.vehicleId === unknownId,
      );

      expect(['sent', 'skipped_disabled']).toContain(known.emailStatus);
      expect(unknown.emailStatus).toBe('skipped_not_eligible');

      if (known.emailStatus === 'sent') {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId },
        });
        expect(vehicle?.lastReminderSentAt).not.toBeNull();
      }
    } finally {
      if (previousEnabled === undefined) {
        delete process.env.EMAIL_ENABLED;
      } else {
        process.env.EMAIL_ENABLED = previousEnabled;
      }
    }
  });
});
