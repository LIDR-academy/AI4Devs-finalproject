import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ExpirationMethod } from "@prisma/client";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

interface UserRecord {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PantryRecord {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface ExpirationAssessmentRecord {
  id: string;
  pantryItemId: string;
  suggestedExpirationDate: Date;
  confidence: number;
  method: ExpirationMethod;
  userConfirmed: boolean;
  confirmedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

describe("Expiration (e2e)", () => {
  let app: INestApplication;

  const usersById = new Map<string, UserRecord>();
  const usersByEmail = new Map<string, UserRecord>();
  const pantryItemsById = new Map<string, PantryRecord>();
  const assessmentsByPantryItemId = new Map<string, ExpirationAssessmentRecord>();

  const prismaMock = {
    $connect: jest.fn().mockResolvedValue(undefined),
    user: {
      findUnique: jest.fn(
        async ({ where }: { where: { id?: string; email?: string } }) => {
          if (where.id) {
            return usersById.get(where.id) ?? null;
          }

          if (where.email) {
            return usersByEmail.get(where.email) ?? null;
          }

          return null;
        },
      ),
      create: jest.fn(
        async ({ data }: { data: { email: string; password: string } }) => {
          const now = new Date();
          const created: UserRecord = {
            id: randomUUID(),
            email: data.email,
            password: data.password,
            createdAt: now,
            updatedAt: now,
          };

          usersById.set(created.id, created);
          usersByEmail.set(created.email, created);
          return created;
        },
      ),
    },
    pantryItem: {
      create: jest.fn(
        async ({
          data,
        }: {
          data: {
            userId: string;
            name: string;
            quantity: number;
            unit: string;
            expirationDate: Date | null;
          };
        }) => {
          const now = new Date();
          const created: PantryRecord = {
            id: randomUUID(),
            userId: data.userId,
            name: data.name,
            quantity: data.quantity,
            unit: data.unit,
            expirationDate: data.expirationDate,
            createdAt: now,
            updatedAt: now,
          };

          pantryItemsById.set(created.id, created);
          return created;
        },
      ),
      findMany: jest.fn(
        async ({ where }: { where: { userId: string } }) => {
          return [...pantryItemsById.values()].filter(
            (item) => item.userId === where.userId,
          );
        },
      ),
      findFirst: jest.fn(
        async ({ where }: { where: { id: string; userId: string } }) => {
          const item = pantryItemsById.get(where.id);
          if (!item || item.userId !== where.userId) {
            return null;
          }

          return item;
        },
      ),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        return pantryItemsById.get(where.id) ?? null;
      }),
      update: jest.fn(
        async ({ where, data }: { where: { id: string }; data: { expirationDate: Date } }) => {
          const current = pantryItemsById.get(where.id);
          if (!current) {
            throw new Error("Pantry item not found");
          }

          const updated: PantryRecord = {
            ...current,
            expirationDate: data.expirationDate,
            updatedAt: new Date(),
          };
          pantryItemsById.set(where.id, updated);
          return updated;
        },
      ),
    },
    expirationAssessment: {
      upsert: jest.fn(
        async ({
          where,
          create,
          update,
        }: {
          where: { pantryItemId: string };
          create: {
            pantryItemId: string;
            suggestedExpirationDate: Date;
            confidence: string;
            method: ExpirationMethod;
            userConfirmed: boolean;
            confirmedByUserId?: string | null;
          };
          update: {
            suggestedExpirationDate: Date;
            confidence: string;
            method: ExpirationMethod;
            userConfirmed: boolean;
            confirmedByUserId?: string | null;
          };
        }) => {
          const now = new Date();
          const existing = assessmentsByPantryItemId.get(where.pantryItemId);

          if (!existing) {
            const created: ExpirationAssessmentRecord = {
              id: randomUUID(),
              pantryItemId: create.pantryItemId,
              suggestedExpirationDate: create.suggestedExpirationDate,
              confidence: Number(create.confidence),
              method: create.method,
              userConfirmed: create.userConfirmed,
              confirmedByUserId: create.confirmedByUserId ?? null,
              createdAt: now,
              updatedAt: now,
            };
            assessmentsByPantryItemId.set(where.pantryItemId, created);
            return created;
          }

          const updated: ExpirationAssessmentRecord = {
            ...existing,
            suggestedExpirationDate: update.suggestedExpirationDate,
            confidence: Number(update.confidence),
            method: update.method,
            userConfirmed: update.userConfirmed,
            confirmedByUserId: update.confirmedByUserId ?? null,
            updatedAt: now,
          };
          assessmentsByPantryItemId.set(where.pantryItemId, updated);
          return updated;
        },
      ),
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

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
  });

  beforeEach(() => {
    usersById.clear();
    usersByEmail.clear();
    pantryItemsById.clear();
    assessmentsByPantryItemId.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it("estimates expiration and allows manual override", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "expiration@example.com", password: "password123" })
      .expect(201);

    const token = registerResponse.body.accessToken as string;

    const createItemResponse = await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Greek Yogurt",
        quantity: 1,
        unit: "unit",
      })
      .expect(201);

    const itemId = createItemResponse.body.id as string;

    const estimateResponse = await request(app.getHttpServer())
      .post(`/api/pantry/items/${itemId}/estimate-expiration`)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(estimateResponse.body.method).toBe("RULE_BASED_SPAIN");
    expect(estimateResponse.body.lowConfidence).toBe(false);
    expect(estimateResponse.body.confidence).toBeGreaterThan(0.6);

    const overrideDate = "2026-12-31T00:00:00.000Z";

    const overrideResponse = await request(app.getHttpServer())
      .patch(`/api/pantry/items/${itemId}/expiration`)
      .set("Authorization", `Bearer ${token}`)
      .send({ expirationDate: overrideDate })
      .expect(200);

    expect(overrideResponse.body.assessment.method).toBe("MANUAL_OVERRIDE");
    expect(overrideResponse.body.assessment.userConfirmed).toBe(true);
    expect(overrideResponse.body.expirationDate).toBe(overrideDate);
  });

  it("returns low confidence for unknown products", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "low-confidence@example.com", password: "password123" })
      .expect(201);

    const token = registerResponse.body.accessToken as string;

    const createItemResponse = await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Mystery Ingredient 42",
        quantity: 1,
        unit: "unit",
      })
      .expect(201);

    const estimateResponse = await request(app.getHttpServer())
      .post(`/api/pantry/items/${createItemResponse.body.id as string}/estimate-expiration`)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(estimateResponse.body.lowConfidence).toBe(true);
    expect(estimateResponse.body.confidence).toBeLessThan(0.6);
  });
});
