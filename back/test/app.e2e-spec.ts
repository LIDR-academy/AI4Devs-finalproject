import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { randomUUID } from "node:crypto";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";
import request from "supertest";

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

describe("Auth (e2e)", () => {
  let app: INestApplication;
  const usersById = new Map<string, UserRecord>();
  const usersByEmail = new Map<string, UserRecord>();
  const pantryItemsById = new Map<string, PantryRecord>();

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
        async ({
          data,
        }: {
          data: { email: string; password: string };
        }): Promise<UserRecord> => {
          const now = new Date();
          const createdUser: UserRecord = {
            id: randomUUID(),
            email: data.email,
            password: data.password,
            createdAt: now,
            updatedAt: now,
          };
          usersById.set(createdUser.id, createdUser);
          usersByEmail.set(createdUser.email, createdUser);
          return createdUser;
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
        }): Promise<PantryRecord> => {
          const now = new Date();
          const createdItem: PantryRecord = {
            id: randomUUID(),
            userId: data.userId,
            name: data.name,
            quantity: data.quantity,
            unit: data.unit,
            expirationDate: data.expirationDate,
            createdAt: now,
            updatedAt: now,
          };
          pantryItemsById.set(createdItem.id, createdItem);
          return createdItem;
        },
      ),
      findMany: jest.fn(
        async ({ where }: { where: { userId: string } }): Promise<PantryRecord[]> => {
          return [...pantryItemsById.values()]
            .filter((item) => item.userId === where.userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
  });

  afterAll(async () => {
    await app.close();
  });

  it("register/login/me happy path", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "User@Example.com", password: "password123" })
      .expect(201);

    expect(registerResponse.body.accessToken).toBeDefined();
    expect(registerResponse.body.user.email).toBe("user@example.com");

    const loginResponse = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "password123" })
      .expect(201);

    expect(loginResponse.body.accessToken).toBeDefined();

    const meResponse = await request(app.getHttpServer())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(meResponse.body.id).toBe(registerResponse.body.user.id);
    expect(meResponse.body.email).toBe("user@example.com");
  });

  it("returns 409 for duplicate email", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "duplicate@example.com", password: "password123" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "DUPLICATE@example.com", password: "password123" })
      .expect(409);
  });

  it("returns 401 for invalid credentials", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "valid@example.com", password: "password123" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "valid@example.com", password: "wrong-pass" })
      .expect(401);
  });

  it("returns 401 when token is missing", async () => {
    await request(app.getHttpServer()).get("/api/auth/me").expect(401);
  });

  it("creates pantry item and returns it in list", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "pantry@example.com", password: "password123" })
      .expect(201);

    const token = registerResponse.body.accessToken as string;

    await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Greek Yogurt",
        quantity: 2,
        unit: "unit",
        expirationDate: "2026-12-30",
      })
      .expect(201);

    const listResponse = await request(app.getHttpServer())
      .get("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].name).toBe("Greek Yogurt");
    expect(listResponse.body[0].quantity).toBe(2);
    expect(listResponse.body[0].unit).toBe("unit");
  });

  it("returns 400 for invalid pantry payload", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "invalid-pantry@example.com", password: "password123" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${registerResponse.body.accessToken as string}`)
      .send({ name: "", quantity: 0, unit: "" })
      .expect(400);

    await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${registerResponse.body.accessToken as string}`)
      .send({ name: "Milk", quantity: 1, unit: "invalid-unit" })
      .expect(400);
  });

  it("returns 401 for pantry routes when token is missing", async () => {
    await request(app.getHttpServer()).post("/api/pantry/items").send({
      name: "Milk",
      quantity: 1,
      unit: "l",
    }).expect(401);

    await request(app.getHttpServer()).get("/api/pantry/items").expect(401);
  });
});
