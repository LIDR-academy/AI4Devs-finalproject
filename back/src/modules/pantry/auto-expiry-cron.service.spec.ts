import { AutoExpiryCronService } from "./auto-expiry-cron.service";

const NOW = new Date("2026-06-26T08:00:00.000Z");

function makeCandidate(id: string) {
  return { id, name: `Item ${id}`, expirationDate: new Date("2026-06-01"), daysExpired: 25, estimatedValueEur: 2 };
}

function makeDeps(overrides: {
  prisma?: Record<string, unknown>;
  pantry?: Record<string, unknown>;
  delivery?: Record<string, unknown>;
  users?: Record<string, unknown>;
} = {}) {
  const prisma = {
    pantryItem: { findMany: jest.fn().mockResolvedValue([]) },
    notificationPreference: { findUnique: jest.fn().mockResolvedValue({ autoExpiryEnabled: true }) },
    autoExpiryDigest: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: "digest-1" }),
      update: jest.fn().mockResolvedValue({}),
    },
    ...overrides.prisma,
  } as any;
  const pantry = {
    getExpiredCandidates: jest.fn().mockResolvedValue([]),
    autoWasteExpired: jest.fn().mockResolvedValue(0),
    ...overrides.pantry,
  } as any;
  const delivery = {
    deliverDigest: jest.fn().mockResolvedValue(undefined),
    deliverDigestSummary: jest.fn().mockResolvedValue(undefined),
    ...overrides.delivery,
  } as any;
  const users = {
    findById: jest.fn().mockResolvedValue({ id: "u1", email: "u1@example.com" }),
    ...overrides.users,
  } as any;
  return { prisma, pantry, delivery, users };
}

describe("AutoExpiryCronService.runDailyDigestPass", () => {
  it("creates a PENDING digest and delivers it for an eligible user with candidates", async () => {
    const { prisma, pantry, delivery, users } = makeDeps({
      prisma: {
        pantryItem: { findMany: jest.fn().mockResolvedValue([{ userId: "u1" }]) },
        notificationPreference: { findUnique: jest.fn().mockResolvedValue({ autoExpiryEnabled: true }) },
        autoExpiryDigest: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: "digest-1" }),
          findMany: jest.fn(),
          update: jest.fn(),
        },
      },
      pantry: { getExpiredCandidates: jest.fn().mockResolvedValue([makeCandidate("a")]) },
    });
    const service = new AutoExpiryCronService(prisma, pantry, delivery, users);

    await service.runDailyDigestPass(NOW);

    expect(prisma.autoExpiryDigest.create).toHaveBeenCalledWith({
      data: { userId: "u1", status: "PENDING", sentAt: NOW },
    });
    expect(delivery.deliverDigest).toHaveBeenCalledWith(
      "u1",
      [{ name: "Item a", daysExpired: 25 }],
      "u1@example.com",
    );
  });

  it("skips a user with auto-expiry disabled", async () => {
    const { prisma, pantry, delivery, users } = makeDeps({
      prisma: {
        pantryItem: { findMany: jest.fn().mockResolvedValue([{ userId: "u1" }]) },
        notificationPreference: { findUnique: jest.fn().mockResolvedValue({ autoExpiryEnabled: false }) },
        autoExpiryDigest: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
      },
      pantry: { getExpiredCandidates: jest.fn().mockResolvedValue([makeCandidate("a")]) },
    });
    const service = new AutoExpiryCronService(prisma, pantry, delivery, users);

    await service.runDailyDigestPass(NOW);

    expect(prisma.autoExpiryDigest.create).not.toHaveBeenCalled();
    expect(delivery.deliverDigest).not.toHaveBeenCalled();
  });

  it("does not create a second digest when one exists within the last 7 days", async () => {
    const { prisma, pantry, delivery, users } = makeDeps({
      prisma: {
        pantryItem: { findMany: jest.fn().mockResolvedValue([{ userId: "u1" }]) },
        notificationPreference: { findUnique: jest.fn().mockResolvedValue({ autoExpiryEnabled: true }) },
        autoExpiryDigest: {
          findFirst: jest.fn().mockResolvedValue({ id: "recent" }),
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
        },
      },
      pantry: { getExpiredCandidates: jest.fn().mockResolvedValue([makeCandidate("a")]) },
    });
    const service = new AutoExpiryCronService(prisma, pantry, delivery, users);

    await service.runDailyDigestPass(NOW);

    expect(prisma.autoExpiryDigest.create).not.toHaveBeenCalled();
  });

  it("isolates a per-user failure so other users still get their digest", async () => {
    const getExpiredCandidates = jest
      .fn()
      .mockRejectedValueOnce(new Error("boom for u1"))
      .mockResolvedValueOnce([makeCandidate("b")]);
    const { prisma, pantry, delivery, users } = makeDeps({
      prisma: {
        pantryItem: { findMany: jest.fn().mockResolvedValue([{ userId: "u1" }, { userId: "u2" }]) },
        notificationPreference: { findUnique: jest.fn().mockResolvedValue({ autoExpiryEnabled: true }) },
        autoExpiryDigest: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: "d" }),
          findMany: jest.fn(),
          update: jest.fn(),
        },
      },
      pantry: { getExpiredCandidates },
      users: { findById: jest.fn().mockResolvedValue({ id: "u2", email: "u2@example.com" }) },
    });
    const service = new AutoExpiryCronService(prisma, pantry, delivery, users);

    await service.runDailyDigestPass(NOW);

    expect(prisma.autoExpiryDigest.create).toHaveBeenCalledTimes(1);
    expect(delivery.deliverDigest).toHaveBeenCalledTimes(1);
  });
});

describe("AutoExpiryCronService.runAutoResolvePass", () => {
  it("auto-wastes still-stale items and marks the digest AUTO_RESOLVED after the grace", async () => {
    const { prisma, pantry, delivery, users } = makeDeps({
      prisma: {
        autoExpiryDigest: {
          findMany: jest.fn().mockResolvedValue([{ id: "d1", userId: "u1" }]),
          update: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn(),
          create: jest.fn(),
        },
        pantryItem: { findMany: jest.fn() },
        notificationPreference: { findUnique: jest.fn() },
      },
      pantry: { autoWasteExpired: jest.fn().mockResolvedValue(2) },
    });
    const service = new AutoExpiryCronService(prisma, pantry, delivery, users);

    await service.runAutoResolvePass(NOW);

    expect(pantry.autoWasteExpired).toHaveBeenCalledWith("u1", NOW);
    expect(prisma.autoExpiryDigest.update).toHaveBeenCalledWith({
      where: { id: "d1" },
      data: { status: "AUTO_RESOLVED", resolvedAt: NOW },
    });
    expect(delivery.deliverDigestSummary).toHaveBeenCalledWith("u1", 2, "u1@example.com");
  });

  it("does nothing when no PENDING digest is past the 7-day grace", async () => {
    const { prisma, pantry, delivery, users } = makeDeps({
      prisma: {
        autoExpiryDigest: {
          findMany: jest.fn().mockResolvedValue([]),
          update: jest.fn(),
          findFirst: jest.fn(),
          create: jest.fn(),
        },
        pantryItem: { findMany: jest.fn() },
        notificationPreference: { findUnique: jest.fn() },
      },
    });
    const service = new AutoExpiryCronService(prisma, pantry, delivery, users);

    await service.runAutoResolvePass(NOW);

    expect(pantry.autoWasteExpired).not.toHaveBeenCalled();
    expect(delivery.deliverDigestSummary).not.toHaveBeenCalled();
  });

  it("isolates a per-digest failure so other digests still resolve", async () => {
    const autoWasteExpired = jest
      .fn()
      .mockRejectedValueOnce(new Error("boom for d1"))
      .mockResolvedValueOnce(1);
    const { prisma, pantry, delivery, users } = makeDeps({
      prisma: {
        autoExpiryDigest: {
          findMany: jest.fn().mockResolvedValue([
            { id: "d1", userId: "u1" },
            { id: "d2", userId: "u2" },
          ]),
          update: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn(),
          create: jest.fn(),
        },
        pantryItem: { findMany: jest.fn() },
        notificationPreference: { findUnique: jest.fn() },
      },
      pantry: { autoWasteExpired },
    });
    const service = new AutoExpiryCronService(prisma, pantry, delivery, users);

    await service.runAutoResolvePass(NOW);

    expect(prisma.autoExpiryDigest.update).toHaveBeenCalledTimes(1);
    expect(prisma.autoExpiryDigest.update).toHaveBeenCalledWith({
      where: { id: "d2" },
      data: { status: "AUTO_RESOLVED", resolvedAt: NOW },
    });
  });
});
