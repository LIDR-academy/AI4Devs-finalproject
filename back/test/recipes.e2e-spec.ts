import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";
import { ThemealdbService } from "../src/integrations/themealdb/themealdb.service";

describe("Recipes (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let themealdbService: ThemealdbService;

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
    themealdbService = app.get(ThemealdbService);
  });

  afterEach(async () => {
    await prisma.consumptionEvent.deleteMany();
    await prisma.pantryItem.deleteMany();
    await prisma.user.deleteMany({ where: { email: { contains: "recipes-e2e" } } });
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndAddChicken() {
    const email = `recipes-e2e-${Date.now()}-${Math.random()}@example.com`;

    const reg = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "password123" })
      .expect(201);

    const token = reg.body.accessToken as string;

    const itemRes = await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Chicken", quantity: 1, unit: "unit" })
      .expect(201);

    return { token, itemId: itemRes.body.id as string };
  }

  // ── GET /api/recipes ────────────────────────────────────────────────────────

  describe("GET /api/recipes", () => {
    it("returns 401 without a token", async () => {
      await request(app.getHttpServer()).get("/api/recipes").expect(401);
    });

    it("returns 200 with an array of suggestions when pantry has items", async () => {
      const { token } = await registerAndAddChicken();

      jest.spyOn(themealdbService, "searchByIngredient").mockResolvedValue([
        { idMeal: "m1", strMeal: "Chicken Handi", strMealThumb: "https://example.com/m1.jpg" },
      ]);

      const res = await request(app.getHttpServer())
        .get("/api/recipes")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty("recipes");
      expect(Array.isArray(res.body.recipes)).toBe(true);
      expect(res.body.recipes.length).toBeGreaterThan(0);
      expect(res.body.recipes[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        matchedIngredients: expect.any(Array),
        matchScore: expect.any(Number),
      });
    });

    it("returns 200 with empty array and no suggestions for empty pantry", async () => {
      const email = `recipes-e2e-empty-${Date.now()}@example.com`;
      const reg = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({ email, password: "password123" })
        .expect(201);
      const token = reg.body.accessToken as string;

      const res = await request(app.getHttpServer())
        .get("/api/recipes")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.recipes).toEqual([]);
    });

    it("returns 503 when TheMealDB is unavailable", async () => {
      const { token } = await registerAndAddChicken();

      jest.spyOn(themealdbService, "searchByIngredient").mockRejectedValue(
        new Error("Network error"),
      );

      await request(app.getHttpServer())
        .get("/api/recipes")
        .set("Authorization", `Bearer ${token}`)
        .expect(503);
    });
  });

  // ── POST /api/recipes/:mealId/cook ──────────────────────────────────────────

  describe("POST /api/recipes/:mealId/cook", () => {
    it("returns 401 without a token", async () => {
      await request(app.getHttpServer())
        .post("/api/recipes/m1/cook")
        .send({ pantryItemIds: ["item-1"] })
        .expect(401);
    });

    it("returns 201 and creates consumption events for valid pantry items", async () => {
      const { token, itemId } = await registerAndAddChicken();

      const res = await request(app.getHttpServer())
        .post("/api/recipes/m1/cook")
        .set("Authorization", `Bearer ${token}`)
        .send({ pantryItemIds: [itemId] })
        .expect(201);

      expect(res.body).toMatchObject({
        consumedCount: 1,
        events: [{ id: expect.any(String) }],
      });

      // pantryItemId is nulled by onDelete:SetNull after the item is deleted.
      // Verify via the event ID returned in the response.
      const eventId = res.body.events[0].id as string;
      const event = await prisma.consumptionEvent.findUnique({ where: { id: eventId } });
      expect(event).not.toBeNull();
      expect(event!.type).toBe("CONSUMED");
    });

    it("returns 404 for a pantry item that does not belong to the user", async () => {
      const { token } = await registerAndAddChicken();

      await request(app.getHttpServer())
        .post("/api/recipes/m1/cook")
        .set("Authorization", `Bearer ${token}`)
        .send({ pantryItemIds: ["non-existent-id"] })
        .expect(404);
    });

    it("returns 400 when pantryItemIds is empty", async () => {
      const { token } = await registerAndAddChicken();

      await request(app.getHttpServer())
        .post("/api/recipes/m1/cook")
        .set("Authorization", `Bearer ${token}`)
        .send({ pantryItemIds: [] })
        .expect(400);
    });
  });
});
