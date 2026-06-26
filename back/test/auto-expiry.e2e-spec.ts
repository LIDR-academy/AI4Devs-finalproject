import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";
import { AutoExpiryCronService } from "../src/modules/pantry/auto-expiry-cron.service";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("Auto-expiry (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cron: AutoExpiryCronService;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    cron = app.get(AutoExpiryCronService);
  });

  afterEach(async () => {
    const users = await prisma.user.findMany({
      where: { email: { contains: "auto-expiry-e2e" } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    if (userIds.length > 0) {
      await prisma.autoExpiryDigest.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.consumptionEvent.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.pantryItem.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.notificationLog.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.notificationPreference.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerUser() {
    const email = `auto-expiry-e2e-${Date.now()}-${Math.random()}@example.com`;
    const response = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "password123" })
      .expect(201);
    return { token: response.body.accessToken as string, email };
  }

  async function createExpiredItem(token: string, daysExpired: number) {
    const expirationDate = new Date(Date.now() - daysExpired * DAY_MS).toISOString();
    const response = await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "E2E Stale Yogurt", quantity: 1, unit: "unit", expirationDate, pricePaid: 3 })
      .expect(201);
    return response.body.id as string;
  }

  it("surfaces a long-expired item as a candidate via the endpoint", async () => {
    const { token } = await registerUser();
    await createExpiredItem(token, 20);

    const response = await request(app.getHttpServer())
      .get("/api/pantry/items/expired-candidates")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].daysExpired).toBeGreaterThanOrEqual(15);
  });

  it("creates a PENDING digest on the daily pass, then auto-wastes after the grace", async () => {
    const { token } = await registerUser();
    const itemId = await createExpiredItem(token, 20);
    const userId = (await prisma.pantryItem.findUnique({ where: { id: itemId } }))!.userId;

    // Daily pass creates a pending digest.
    await cron.runDailyDigestPass(new Date());
    const pending = await prisma.autoExpiryDigest.findFirst({ where: { userId, status: "PENDING" } });
    expect(pending).not.toBeNull();

    // Before the grace elapses, the auto-resolve pass does nothing.
    await cron.runAutoResolvePass(new Date());
    expect(await prisma.pantryItem.findUnique({ where: { id: itemId } })).not.toBeNull();

    // After the 7-day grace, the item is auto-wasted and the digest is resolved.
    const afterGrace = new Date(Date.now() + 8 * DAY_MS);
    await cron.runAutoResolvePass(afterGrace);

    expect(await prisma.pantryItem.findUnique({ where: { id: itemId } })).toBeNull();
    const wasteEvent = await prisma.consumptionEvent.findFirst({
      where: { userId, type: "WASTED", method: "AUTO_EXPIRED" },
    });
    expect(wasteEvent).not.toBeNull();
    const resolved = await prisma.autoExpiryDigest.findFirst({ where: { userId } });
    expect(resolved?.status).toBe("AUTO_RESOLVED");
  });

  it("does not create a digest for a user with auto-expiry disabled", async () => {
    const { token } = await registerUser();
    const itemId = await createExpiredItem(token, 20);
    const userId = (await prisma.pantryItem.findUnique({ where: { id: itemId } }))!.userId;

    await request(app.getHttpServer())
      .patch("/api/settings/auto-expiry")
      .set("Authorization", `Bearer ${token}`)
      .send({ enabled: false })
      .expect(200);

    await cron.runDailyDigestPass(new Date());

    const digest = await prisma.autoExpiryDigest.findFirst({ where: { userId } });
    expect(digest).toBeNull();
  });
});
