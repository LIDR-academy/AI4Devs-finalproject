import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";
import { MercadonaService } from "../src/integrations/mercadona/mercadona.service";

describe("Insights price comparison (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let mercadonaService: MercadonaService;

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
    mercadonaService = app.get(MercadonaService);
  });

  afterEach(async () => {
    await prisma.receiptItem.deleteMany();
    await prisma.receipt.deleteMany();
    await prisma.priceCatalogItem.deleteMany({
      where: {
        normalizedName: {
          startsWith: "e2e ",
        },
      },
    });
    await prisma.user.deleteMany({ where: { email: { contains: "insights-e2e" } } });
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerUser() {
    const email = `insights-e2e-${Date.now()}-${Math.random()}@example.com`;

    const response = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "password123" })
      .expect(201);

    return response.body.accessToken as string;
  }

  it("returns latest matched catalog value", async () => {
    const token = await registerUser();

    await prisma.priceCatalogItem.create({
      data: {
        normalizedName: "e2e whole milk",
        category: "Dairy",
        sourceLabel: "Catalog old",
        referencePriceEur: "1.79",
        currencyCode: "EUR",
        effectiveDate: new Date("2026-01-01"),
      },
    });

    await prisma.priceCatalogItem.create({
      data: {
        normalizedName: "e2e whole milk",
        category: "Dairy",
        sourceLabel: "Catalog latest",
        referencePriceEur: "1.99",
        currencyCode: "EUR",
        effectiveDate: new Date("2026-06-01"),
      },
    });

    const response = await request(app.getHttpServer())
      .get("/api/insights/price-comparison")
      .query({ normalizedName: "E2E Whole Milk" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.found).toBe(true);
    expect(response.body.reference.referencePriceEur).toBe("1.99");
    expect(response.body.reference.sourceLabel).toBe("Catalog latest");
  });

  it("returns explicit unavailable state when no match exists", async () => {
    const token = await registerUser();

    jest.spyOn(mercadonaService, "searchProduct").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/api/insights/price-comparison")
      .query({ normalizedName: "No Match Product" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.found).toBe(false);
    expect(response.body.reference).toBeNull();
    expect(response.body.unavailableReason).toBe("NO_REFERENCE_DATA");
  });

  // ── T018: Mercadona E2E ──────────────────────────────────────────────────

  it("returns 401 for unauthenticated request", async () => {
    await request(app.getHttpServer())
      .get("/api/insights/price-comparison")
      .query({ normalizedName: "leche" })
      .expect(401);
  });

  it("returns 400 when normalizedName query param is missing", async () => {
    const token = await registerUser();

    await request(app.getHttpServer())
      .get("/api/insights/price-comparison")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });

  it("returns mercadona.found: true when Mercadona returns a live result", async () => {
    const token = await registerUser();

    jest.spyOn(mercadonaService, "searchProduct").mockResolvedValue({
      productName: "Leche entera Hacendado 1L",
      priceEur: "0.72",
      unit: "l",
      fetchedAt: new Date("2026-06-26T10:00:00.000Z"),
      source: "MERCADONA_LIVE",
    });

    const response = await request(app.getHttpServer())
      .get("/api/insights/price-comparison")
      .query({ normalizedName: "leche" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.mercadona.found).toBe(true);
    expect(response.body.mercadona.productName).toBe("Leche entera Hacendado 1L");
    expect(response.body.mercadona.priceEur).toBe("0.72");
    expect(response.body.mercadona.source).toBe("MERCADONA_LIVE");
    expect(response.body.found).toBe(true);
  });

  it("returns mercadona.found: false and falls back to static catalog when Mercadona returns null", async () => {
    const token = await registerUser();

    jest.spyOn(mercadonaService, "searchProduct").mockResolvedValue(null);

    await prisma.priceCatalogItem.create({
      data: {
        normalizedName: "e2e leche",
        category: "Dairy",
        sourceLabel: "Catalog v1",
        referencePriceEur: "0.75",
        currencyCode: "EUR",
        effectiveDate: new Date("2026-01-01"),
      },
    });

    const response = await request(app.getHttpServer())
      .get("/api/insights/price-comparison")
      .query({ normalizedName: "E2E Leche" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.mercadona.found).toBe(false);
    expect(response.body.found).toBe(true);
    expect(response.body.reference.referencePriceEur).toBe("0.75");
    expect(response.body.unavailableReason).toBeNull();
  });

  it("returns found: false and NO_REFERENCE_DATA when both Mercadona and catalog have nothing", async () => {
    const token = await registerUser();

    jest.spyOn(mercadonaService, "searchProduct").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/api/insights/price-comparison")
      .query({ normalizedName: "carne de dragon" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.found).toBe(false);
    expect(response.body.mercadona.found).toBe(false);
    expect(response.body.reference).toBeNull();
    expect(response.body.unavailableReason).toBe("NO_REFERENCE_DATA");
    expect(response.body.delta).toBeNull();
  });

  it("returns 200 with mercadona.found: false when Mercadona service throws (timeout / network error)", async () => {
    const token = await registerUser();

    jest
      .spyOn(mercadonaService, "searchProduct")
      .mockRejectedValue(new Error("AbortError: timeout"));

    const response = await request(app.getHttpServer())
      .get("/api/insights/price-comparison")
      .query({ normalizedName: "leche" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.mercadona.found).toBe(false);
    expect(response.body.mercadona.priceEur).toBeNull();
    expect(response.body.delta).toBeNull();
  });
});
