import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Pantry item PATCH (e2e)", () => {
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
    await prisma.receiptItem.deleteMany();
    await prisma.expirationAssessment.deleteMany();
    await prisma.pantryItem.deleteMany();
    await prisma.user.deleteMany({ where: { email: { contains: "pantry-e2e" } } });
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndCreateItem() {
    const email = `pantry-e2e-${Date.now()}-${Math.random()}@example.com`;

    const reg = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "password123" })
      .expect(201);

    const token = reg.body.accessToken as string;

    const itemRes = await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Item", quantity: 1, unit: "unit" })
      .expect(201);

    return { token, itemId: itemRes.body.id as string };
  }

  it("persists quantity, unit and pricePaid via PATCH", async () => {
    const { token, itemId } = await registerAndCreateItem();

    const patchRes = await request(app.getHttpServer())
      .patch(`/api/pantry/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3, unit: "kg", pricePaid: 4.99 })
      .expect(200);

    expect(patchRes.body.quantity).toBe(3);
    expect(patchRes.body.unit).toBe("kg");
    expect(patchRes.body.pricePaid).toBe("4.99");

    // Confirm persisted: re-fetch via list endpoint
    const listRes = await request(app.getHttpServer())
      .get("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const saved = (listRes.body as Array<Record<string, unknown>>).find(
      (i) => i.id === itemId,
    );
    expect(saved).toBeDefined();
    expect(saved!.quantity).toBe(3);
    expect(saved!.unit).toBe("kg");
    expect(saved!.pricePaid).toBe("4.99");
  });

  it("returns 404 when item does not belong to requesting user", async () => {
    const { itemId } = await registerAndCreateItem();

    // Second user
    const email2 = `pantry-e2e-other-${Date.now()}@example.com`;
    const reg2 = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: email2, password: "password123" })
      .expect(201);
    const token2 = reg2.body.accessToken as string;

    await request(app.getHttpServer())
      .patch(`/api/pantry/items/${itemId}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ quantity: 5 })
      .expect(404);
  });

  it("rejects invalid unit values", async () => {
    const { token, itemId } = await registerAndCreateItem();

    await request(app.getHttpServer())
      .patch(`/api/pantry/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ unit: "gallons" })
      .expect(400);
  });

  it("rejects negative pricePaid", async () => {
    const { token, itemId } = await registerAndCreateItem();

    await request(app.getHttpServer())
      .patch(`/api/pantry/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ pricePaid: -1 })
      .expect(400);
  });
});
