import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Insights price comparison (e2e)", () => {
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
    await prisma.receipt.deleteMany();
    await prisma.priceCatalogItem.deleteMany({
      where: {
        normalizedName: {
          startsWith: "e2e ",
        },
      },
    });
    await prisma.user.deleteMany({ where: { email: { contains: "insights-e2e" } } });
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

    const response = await request(app.getHttpServer())
      .get("/api/insights/price-comparison")
      .query({ normalizedName: "No Match Product" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.found).toBe(false);
    expect(response.body.reference).toBeNull();
    expect(response.body.unavailableReason).toBe("NO_REFERENCE_DATA");
  });
});
