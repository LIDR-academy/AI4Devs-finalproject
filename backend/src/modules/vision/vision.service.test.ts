import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    unloadSession: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn()
    },
    truck: {
      upsert: vi.fn()
    },
    detectedCube: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

import { prisma } from "../../lib/prisma";
import { syncVisionSnapshot } from "./vision.service";

const mockedPrisma = prisma as unknown as {
  unloadSession: {
    findFirst: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  truck: { upsert: ReturnType<typeof vi.fn> };
  detectedCube: {
    findFirst: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

const payload = {
  runId: "run-001",
  snapshotSignature: "sig-001",
  timestamp: "2026-07-04T12:00:00.000Z",
  source: "opencv-camera" as const,
  truckCode: "TRUCK-001",
  qrDetected: true,
  qrValid: true,
  qrStatus: "OK" as const,
  cameraIndex: 1,
  detections: [
    { color: "red" as const, x: 10, y: 20, w: 30, h: 30, confidence: 0.9 },
    { color: "blue" as const, x: 50, y: 20, w: 30, h: 30, confidence: 0.8 }
  ]
};

describe("vision snapshot sync service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPrisma.unloadSession.findFirst.mockResolvedValue({
      id: "session-1",
      code: "UNLOAD-20260704-001",
      truck: { code: "TRUCK-001" }
    });
    mockedPrisma.detectedCube.findFirst.mockResolvedValue(null);
    mockedPrisma.$transaction.mockImplementation(async (callback) => callback(mockedPrisma));
  });

  it("replaces previous vision cubes with the current snapshot state", async () => {
    mockedPrisma.detectedCube.deleteMany.mockResolvedValue({ count: 6 });
    mockedPrisma.detectedCube.createMany.mockResolvedValue({ count: 2 });

    const result = await syncVisionSnapshot(payload);

    expect(mockedPrisma.detectedCube.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sessionId: "session-1" })
      })
    );
    expect(mockedPrisma.detectedCube.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skipDuplicates: true,
        data: expect.arrayContaining([
          expect.objectContaining({ code: "VISION-sig-001-001", color: "red" }),
          expect.objectContaining({ code: "VISION-sig-001-002", color: "blue" })
        ])
      })
    );
    expect(result.detectionsRegistered).toBe(2);
    expect(result.replaced).toBe(6);
    expect(result.duplicated).toBe(0);
    expect(result.alreadyProcessed).toBe(false);
  });

  it("does not write when the snapshot signature was already processed", async () => {
    mockedPrisma.detectedCube.findFirst.mockResolvedValue({ id: "cube-1" });

    const result = await syncVisionSnapshot(payload);

    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    expect(result.detectionsRegistered).toBe(0);
    expect(result.duplicated).toBe(2);
    expect(result.ignored).toBe(2);
    expect(result.alreadyProcessed).toBe(true);
    expect(result.status).toBe("already_processed");
  });

  it("new snapshots replace prior vision state instead of accumulating counts", async () => {
    mockedPrisma.detectedCube.deleteMany.mockResolvedValue({ count: 200 });
    mockedPrisma.detectedCube.createMany.mockResolvedValue({ count: 2 });

    const result = await syncVisionSnapshot({ ...payload, snapshotSignature: "sig-002" });

    expect(result.replaced).toBe(200);
    expect(result.detectionsRegistered).toBe(2);
    expect(result.counts).toMatchObject({ red: 1, blue: 1, total: 2 });
    expect(result.status).toBe("synced");
  });
});
