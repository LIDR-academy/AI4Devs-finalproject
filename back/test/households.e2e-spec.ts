import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Households endpoints (e2e)", () => {
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
    await prisma.householdInvitation.deleteMany();
    await prisma.householdMember.deleteMany();
    await prisma.household.deleteMany();
    await prisma.user.deleteMany({ where: { email: { contains: "hh-e2e" } } });
  });

  afterAll(async () => {
    await app.close();
  });

  async function register(suffix: string) {
    const email = `hh-e2e-${suffix}-${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "password123" })
      .expect(201);
    return { token: res.body.accessToken as string, email, userId: res.body.user.id as string };
  }

  async function createHousehold(token: string, name = "Test House") {
    const res = await request(app.getHttpServer())
      .post("/api/households")
      .set("Authorization", `Bearer ${token}`)
      .send({ name })
      .expect(201);
    return res.body as { id: string; name: string; role: string; memberCount: number };
  }

  // ── CREATE HOUSEHOLD ──────────────────────────────────────────────────────

  it("POST /api/households — creates household and assigns OWNER role", async () => {
    const { token } = await register("owner");
    const hh = await createHousehold(token);

    expect(hh.role).toBe("OWNER");
    expect(hh.memberCount).toBe(1);
  });

  it("POST /api/households — rejects second household for same user", async () => {
    const { token } = await register("owner-dup");
    await createHousehold(token);

    await request(app.getHttpServer())
      .post("/api/households")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Another House" })
      .expect(409);
  });

  it("POST /api/households — requires auth", async () => {
    await request(app.getHttpServer())
      .post("/api/households")
      .send({ name: "X" })
      .expect(401);
  });

  // ── GET MY HOUSEHOLD ─────────────────────────────────────────────────────

  it("GET /api/households/mine — returns { household: null } when user has no household", async () => {
    const { token } = await register("no-hh");
    const res = await request(app.getHttpServer())
      .get("/api/households/mine")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.household).toBeNull();
  });

  it("GET /api/households/mine — returns household data after creation", async () => {
    const { token } = await register("with-hh");
    await createHousehold(token, "My House");

    const res = await request(app.getHttpServer())
      .get("/api/households/mine")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.household.name).toBe("My House");
    expect(res.body.household.role).toBe("OWNER");
  });

  // ── INVITE + ACCEPT FLOW ─────────────────────────────────────────────────

  it("full invite → accept flow creates membership and updates invitation status", async () => {
    const userA = await register("inv-owner");
    const userB = await register("inv-member");
    const hh = await createHousehold(userA.token);

    // Create invitation
    const invRes = await request(app.getHttpServer())
      .post(`/api/households/${hh.id}/invitations`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ inviteeEmail: userB.email })
      .expect(201);

    const invitationId = invRes.body.id as string;
    expect(invRes.body.status).toBe("PENDING");
    expect(invRes.body.inviteeEmail).toBe(userB.email);

    // User B sees pending invitation
    const pendingRes = await request(app.getHttpServer())
      .get("/api/invitations/pending")
      .set("Authorization", `Bearer ${userB.token}`)
      .expect(200);

    expect(pendingRes.body).toHaveLength(1);
    expect(pendingRes.body[0].id).toBe(invitationId);

    // User B accepts
    const acceptRes = await request(app.getHttpServer())
      .post(`/api/invitations/${invitationId}/accept`)
      .set("Authorization", `Bearer ${userB.token}`)
      .expect(201);

    expect(acceptRes.body.role).toBe("MEMBER");
    expect(acceptRes.body.householdId).toBe(hh.id);

    // Members list reflects both users
    const membersRes = await request(app.getHttpServer())
      .get(`/api/households/${hh.id}/members`)
      .set("Authorization", `Bearer ${userA.token}`)
      .expect(200);

    expect(membersRes.body).toHaveLength(2);
    const emails = (membersRes.body as Array<{ email: string }>).map((m) => m.email);
    expect(emails).toContain(userA.email);
    expect(emails).toContain(userB.email);
  });

  // ── SHARED PANTRY VISIBILITY ─────────────────────────────────────────────

  it("pantry list shows items from all household members after joining", async () => {
    const userA = await register("pantry-a");
    const userB = await register("pantry-b");
    const hh = await createHousehold(userA.token);

    // User A creates a pantry item
    await request(app.getHttpServer())
      .post("/api/pantry/items")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ name: "Shared Milk", quantity: 1, unit: "unit" })
      .expect(201);

    // User B hasn't joined yet — does NOT see User A's item
    const beforeAccept = await request(app.getHttpServer())
      .get("/api/pantry/items")
      .set("Authorization", `Bearer ${userB.token}`)
      .expect(200);
    expect((beforeAccept.body as Array<unknown>)).toHaveLength(0);

    // Invite and accept
    const invRes = await request(app.getHttpServer())
      .post(`/api/households/${hh.id}/invitations`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ inviteeEmail: userB.email })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/invitations/${invRes.body.id}/accept`)
      .set("Authorization", `Bearer ${userB.token}`)
      .expect(201);

    // User B now sees User A's item
    const afterAccept = await request(app.getHttpServer())
      .get("/api/pantry/items")
      .set("Authorization", `Bearer ${userB.token}`)
      .expect(200);

    const names = (afterAccept.body as Array<{ name: string }>).map((i) => i.name);
    expect(names).toContain("Shared Milk");
  });

  // ── ACCESS CONTROL ───────────────────────────────────────────────────────

  it("non-member cannot list members of a household", async () => {
    const userA = await register("acl-a");
    const userX = await register("acl-x");
    const hh = await createHousehold(userA.token);

    await request(app.getHttpServer())
      .get(`/api/households/${hh.id}/members`)
      .set("Authorization", `Bearer ${userX.token}`)
      .expect(403);
  });

  it("non-owner cannot create invitation", async () => {
    const userA = await register("acl-invite-a");
    const userB = await register("acl-invite-b");
    const userC = await register("acl-invite-c");
    const hh = await createHousehold(userA.token);

    // Invite and accept userB
    const invRes = await request(app.getHttpServer())
      .post(`/api/households/${hh.id}/invitations`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ inviteeEmail: userB.email })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/invitations/${invRes.body.id}/accept`)
      .set("Authorization", `Bearer ${userB.token}`)
      .expect(201);

    // UserB (MEMBER) tries to invite UserC — must be forbidden
    await request(app.getHttpServer())
      .post(`/api/households/${hh.id}/invitations`)
      .set("Authorization", `Bearer ${userB.token}`)
      .send({ inviteeEmail: userC.email })
      .expect(403);
  });

  it("cannot accept invitation with wrong user", async () => {
    const userA = await register("accept-a");
    const userB = await register("accept-b");
    const userC = await register("accept-c");
    const hh = await createHousehold(userA.token);

    const invRes = await request(app.getHttpServer())
      .post(`/api/households/${hh.id}/invitations`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ inviteeEmail: userB.email })
      .expect(201);

    // UserC tries to accept UserB's invitation
    await request(app.getHttpServer())
      .post(`/api/invitations/${invRes.body.id}/accept`)
      .set("Authorization", `Bearer ${userC.token}`)
      .expect(403);
  });

  it("rejects duplicate PENDING invitation for same email", async () => {
    const userA = await register("dup-inv-a");
    const userB = await register("dup-inv-b");
    const hh = await createHousehold(userA.token);

    await request(app.getHttpServer())
      .post(`/api/households/${hh.id}/invitations`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ inviteeEmail: userB.email })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/households/${hh.id}/invitations`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ inviteeEmail: userB.email })
      .expect(409);
  });

  it("rejects invitation to unregistered email", async () => {
    const userA = await register("unreg-a");
    const hh = await createHousehold(userA.token);

    await request(app.getHttpServer())
      .post(`/api/households/${hh.id}/invitations`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ inviteeEmail: "ghost@example.com" })
      .expect(404);
  });

  it("rejects invalid inviteeEmail payload", async () => {
    const userA = await register("invalid-email");
    const hh = await createHousehold(userA.token);

    await request(app.getHttpServer())
      .post(`/api/households/${hh.id}/invitations`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ inviteeEmail: "not-an-email" })
      .expect(400);
  });
});
