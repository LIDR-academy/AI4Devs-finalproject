import { Prisma } from "@prisma/client";
import { dateCode, sessionCode } from "../../lib/code-generator";
import { prisma } from "../../lib/prisma";
import type { VisionSnapshotSyncInput } from "./vision.validators";

const emptyCounts = {
  red: 0,
  blue: 0,
  green: 0,
  yellow: 0,
  total: 0
};

const safeCodePart = (value: string) =>
  value.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "snapshot";

const deterministicCubeCode = (snapshotSignature: string, index: number) => {
  return `VISION-${safeCodePart(snapshotSignature)}-${String(index + 1).padStart(3, "0")}`;
};

const visionCubeWhere = (sessionId: string) => ({
  sessionId,
  OR: [
    { metadata: { path: ["source"], equals: "opencv-file" } },
    { metadata: { path: ["source"], equals: "opencv-camera" } }
  ]
});

const countsFromDetections = (detections: VisionSnapshotSyncInput["detections"]) =>
  detections.reduce(
    (acc, detection) => {
      acc[detection.color] += 1;
      acc.total += 1;
      return acc;
    },
    { ...emptyCounts }
  );

const findOrCreateActiveSession = async (truckCode: string) => {
  const existing = await prisma.unloadSession.findFirst({
    where: {
      status: "IN_PROGRESS",
      truck: { code: truckCode }
    },
    orderBy: { startedAt: "desc" },
    include: { truck: true }
  });
  if (existing) {
    return existing;
  }

  const today = dateCode();
  const countForDay = await prisma.unloadSession.count({
    where: { code: { startsWith: `UNLOAD-${today}-` } }
  });
  const truck = await prisma.truck.upsert({
    where: { code: truckCode },
    update: {},
    create: { code: truckCode }
  });
  return prisma.unloadSession.create({
    data: {
      code: sessionCode(countForDay),
      status: "IN_PROGRESS",
      truckId: truck.id
    },
    include: { truck: true }
  });
};

export const syncVisionSnapshot = async (input: VisionSnapshotSyncInput) => {
  const session = await findOrCreateActiveSession(input.truckCode);
  const counts = countsFromDetections(input.detections);
  const detectedAt = input.timestamp ? new Date(input.timestamp) : new Date();
  const existingSnapshot = await prisma.detectedCube.findFirst({
    where: {
      sessionId: session.id,
      metadata: {
        path: ["snapshotSignature"],
        equals: input.snapshotSignature
      }
    }
  });
  if (existingSnapshot) {
    return {
      sessionId: session.id,
      sessionCode: session.code,
      truckCode: session.truck.code,
      snapshotSignature: input.snapshotSignature,
      counts,
      detectionsReceived: input.detections.length,
      detectionsRegistered: 0,
      replaced: 0,
      duplicated: input.detections.length,
      ignored: input.detections.length,
      alreadyProcessed: true,
      status: "already_processed"
    };
  }

  const metadataBase: Record<string, unknown> = {
    ...(input.metadata ?? {}),
    runId: input.runId,
    snapshotSignature: input.snapshotSignature,
    source: input.source,
    truckCode: input.truckCode,
    qrDetected: input.qrDetected,
    qrValid: input.qrValid,
    qrStatus: input.qrStatus,
    cameraIndex: input.cameraIndex ?? null,
    counts
  };

  const data = input.detections.map((detection, index) => ({
    code: deterministicCubeCode(input.snapshotSignature, index),
    sessionId: session.id,
    color: detection.color,
    confidence: detection.confidence,
    x: detection.x,
    y: detection.y,
    w: detection.w,
    h: detection.h,
    detectedAt,
    metadata: {
      ...metadataBase,
      detectionIndex: index,
      detection: detection.metadata ?? {}
    } as Prisma.InputJsonObject
  }));

  const result = await prisma.$transaction(async (transaction) => {
    const deleted = await transaction.detectedCube.deleteMany({
      where: visionCubeWhere(session.id)
    });
    const created = data.length
      ? await transaction.detectedCube.createMany({ data, skipDuplicates: true })
      : { count: 0 };
    return { deleted: deleted.count, created: created.count };
  });

  const duplicated = data.length - result.created;
  return {
    sessionId: session.id,
    sessionCode: session.code,
    truckCode: session.truck.code,
    snapshotSignature: input.snapshotSignature,
    counts,
    detectionsReceived: data.length,
    detectionsRegistered: result.created,
    replaced: result.deleted,
    duplicated,
    ignored: duplicated,
    alreadyProcessed: false,
    status: "synced"
  };
};
