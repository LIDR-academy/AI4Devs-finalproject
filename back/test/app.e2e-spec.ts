import { INestApplication } from "@nestjs/common";
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

describe("Auth (e2e)", () => {
  let app: INestApplication;
  const usersById = new Map<string, UserRecord>();
  const usersByEmail = new Map<string, UserRecord>();

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
    await app.init();
  });

  beforeEach(() => {
    usersById.clear();
    usersByEmail.clear();
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
});
