import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Dashboard endpoints (e2e)", () => {
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
    await prisma.consumptionEvent.deleteMany();
    await prisma.expirationAssessment.deleteMany();
    await prisma.receiptItem.deleteMany();
    await prisma.receipt.deleteMany();
    await prisma.pantryItem.deleteMany();
    await prisma.user.deleteMany({ where: { email: { contains: "dashboard-e2e" } } });
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndSeedItems() {
    const email = `dashboard-e2e-${Date.now()}-${Math.random()}@example.com`;

    const reg = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "password123" })
      .expect(201);

    const token = reg.body.accessToken as string;

    async function createItem(name: string, days: number) {
      const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const created = await request(app.getHttpServer())
        .post("/api/pantry/items")
        .set("Authorization", `Bearer ${token}`)
        .send({ name, quantity: 1, unit: "unit", expirationDate })
        .expect(201);
      return created.body.id as string;
    }

    const itemA = await createItem("Milk", 1);
    const itemB = await createItem("Yogurt", 2);
    const itemC = await createItem("Rice", 7);

    return { token, itemA, itemB, itemC };
  }

  it("returns summary counts and deterministic use-next ordering", async () => {
    const { token } = await registerAndSeedItems();

    const summary = await request(app.getHttpServer())
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(summary.body.activeItems).toBe(3);
    expect(summary.body.expiringSoonItems).toBe(2);

    const useNext = await request(app.getHttpServer())
      .get("/api/dashboard/use-next")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(useNext.body.items).toHaveLength(3);
    expect(useNext.body.items[0].name).toBe("Milk");
    expect(useNext.body.items[1].name).toBe("Yogurt");
  });

  it("updates summary and use-next after consume and waste events", async () => {
    const { token, itemA, itemB } = await registerAndSeedItems();

    await request(app.getHttpServer())
      .post(`/api/pantry/items/${itemA}/events`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "CONSUMED" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/pantry/items/${itemB}/events`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "WASTED" })
      .expect(201);

    const summary = await request(app.getHttpServer())
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(summary.body.activeItems).toBe(1);

    const useNext = await request(app.getHttpServer())
      .get("/api/dashboard/use-next")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(useNext.body.items).toHaveLength(1);
    expect(useNext.body.items[0].name).toBe("Rice");
  });
});
