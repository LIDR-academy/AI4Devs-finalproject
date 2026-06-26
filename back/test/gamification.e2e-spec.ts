import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Gamification (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterEach(async () => {
    // Scope all cleanup to this suite's users so concurrent e2e suites are unaffected.
    const users = await prisma.user.findMany({
      where: { email: { contains: "gamification-e2e" } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    if (userIds.length > 0) {
      await prisma.userBadge.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.userPoints.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.consumptionEvent.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.pantryItem.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerUser() {
    const email = `gamification-e2e-${Date.now()}-${Math.random()}@example.com`;
    const response = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "password123" })
      .expect(201);
    return response.body.accessToken as string;
  }

  function futureDateIso(days: number): string {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  async function createItem(token: string, expirationDate: string) {
    const response = await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "E2E Milk", quantity: 1, unit: "unit", expirationDate, pricePaid: 12.5 })
      .expect(201);
    return response.body.id as string;
  }

  it("returns 401 for an unauthenticated summary request", async () => {
    await request(app.getHttpServer()).get("/api/gamification/summary").expect(401);
  });

  it("awards points and the FIRST_SAVE badge when an item is consumed before expiry", async () => {
    const token = await registerUser();
    const itemId = await createItem(token, futureDateIso(10));

    await request(app.getHttpServer())
      .post(`/api/pantry/items/${itemId}/events`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "CONSUMED" })
      .expect(201);

    const summary = await request(app.getHttpServer())
      .get("/api/gamification/summary")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // 10 base + 5 bonus (>= 3 days to spare).
    expect(summary.body.totalPoints).toBe(15);
    expect(summary.body.consumedBeforeExpiryCount).toBe(1);
    expect(summary.body.totalValueSavedEur).toBe(12.5);
    expect(summary.body.badges.map((b: { code: string }) => b.code)).toContain("FIRST_SAVE");
  });

  it("returns a points history reflecting earned points and badges", async () => {
    const token = await registerUser();
    const itemId = await createItem(token, futureDateIso(10));

    await request(app.getHttpServer())
      .post(`/api/pantry/items/${itemId}/events`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "CONSUMED" })
      .expect(201);

    const history = await request(app.getHttpServer())
      .get("/api/gamification/history")
      .query({ limit: 20, offset: 0 })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const types = history.body.events.map((e: { type: string }) => e.type);
    expect(types).toContain("POINTS_EARNED");
    expect(types).toContain("BADGE_EARNED");
    expect(history.body.total).toBeGreaterThanOrEqual(3); // +10, +5 bonus, FIRST_SAVE
  });

  it("deducts points when an item is wasted", async () => {
    const token = await registerUser();
    const itemId = await createItem(token, futureDateIso(10));

    await request(app.getHttpServer())
      .post(`/api/pantry/items/${itemId}/events`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "WASTED" })
      .expect(201);

    const summary = await request(app.getHttpServer())
      .get("/api/gamification/summary")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // Raw total is -5; the display value is clamped to 0 (FR-007).
    expect(summary.body.totalPoints).toBe(0);
    expect(summary.body.wastedCount).toBe(1);
  });
});
