import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Notifications and settings (e2e)", () => {
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
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    await prisma.expirationAssessment.deleteMany();
    await prisma.receiptItem.deleteMany();
    await prisma.receipt.deleteMany();
    await prisma.pantryItem.deleteMany();
    await prisma.notificationPreference.deleteMany();
    await prisma.user.deleteMany({ where: { email: { contains: "notifications-e2e" } } });
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndCreateItem(daysFromNow: number) {
    const email = `notifications-e2e-${Date.now()}-${Math.random()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "password123" })
      .expect(201);

    const token = registerResponse.body.accessToken as string;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysFromNow);

    await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Item +${daysFromNow}d`,
        quantity: 1,
        unit: "unit",
        expirationDate: expirationDate.toISOString(),
      })
      .expect(201);

    return { token };
  }

  it("respects disabled and re-enabled preference with emitted events", async () => {
    const { token } = await registerAndCreateItem(3);

    await request(app.getHttpServer())
      .post("/api/notifications/events/clear")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .patch("/api/settings/notifications")
      .set("Authorization", `Bearer ${token}`)
      .send({
        expirationEnabled: false,
        priceDropEnabled: true,
        foodConsumedByOthersEnabled: true,
      })
      .expect(200);

    await request(app.getHttpServer())
      .post("/api/notifications/evaluate-expiring")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    const noEvents = await request(app.getHttpServer())
      .get("/api/notifications/events")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(noEvents.body.events).toHaveLength(0);

    await request(app.getHttpServer())
      .patch("/api/settings/notifications")
      .set("Authorization", `Bearer ${token}`)
      .send({
        expirationEnabled: true,
        priceDropEnabled: true,
        foodConsumedByOthersEnabled: true,
      })
      .expect(200);

    await request(app.getHttpServer())
      .post("/api/notifications/evaluate-expiring")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    const events = await request(app.getHttpServer())
      .get("/api/notifications/events")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(events.body.events).toHaveLength(1);
    expect(events.body.events[0].type).toBe("EXPIRING_SOON");
  });

  it("triggers only exactly-at-3-day boundary", async () => {
    const { token } = await registerAndCreateItem(4);
    await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Boundary +3d",
        quantity: 1,
        unit: "unit",
        expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(201);
    await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Boundary +2d",
        quantity: 1,
        unit: "unit",
        expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/notifications/events/clear")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    const evalResponse = await request(app.getHttpServer())
      .post("/api/notifications/evaluate-expiring")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(evalResponse.body.generated).toBe(1);

    const events = await request(app.getHttpServer())
      .get("/api/notifications/events")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(events.body.events).toHaveLength(1);
    expect(events.body.events[0].daysUntilExpiration).toBe(3);

    const secondEval = await request(app.getHttpServer())
      .post("/api/notifications/evaluate-expiring")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(secondEval.body.generated).toBe(0);
    expect(secondEval.body.suppressedByDuplicate).toBe(1);
  });
});
