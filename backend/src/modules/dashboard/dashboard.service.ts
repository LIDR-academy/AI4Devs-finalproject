import { prisma } from "../../lib/prisma";
import { isRecord } from "../../lib/validators";
import { projectExecutionMetadata } from "../robot/robot.metadata";

const emptyCounts = {
  red: 0,
  blue: 0,
  green: 0,
  yellow: 0,
  total: 0
};

export const getOperationalDashboard = async () => {
  const activeSession = await prisma.unloadSession.findFirst({
    where: { status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
    include: {
      truck: true,
      cubes: true,
      robotActions: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });

  if (!activeSession) {
    return {
      activeSession: null,
      counts: emptyCounts,
      lastActions: [],
      profile: null,
      dryRun: null,
      visionSource: null,
      selectedCube: null,
      dropZoneCode: null,
      lastError: null,
      visionSync: null,
      lastVisionSnapshot: null,
      lastVisionTruckCode: null,
      lastVisionCounts: null,
      lastVisionError: null,
      updatedAt: null
    };
  }

  const persistedCounts = activeSession.cubes.reduce(
    (acc, cube) => {
      acc[cube.color] += 1;
      acc.total += 1;
      return acc;
    },
    { ...emptyCounts }
  );

  const lastActions = activeSession.robotActions.map((action) => ({
    id: action.id,
    code: action.code,
    actionType: action.actionType,
    status: action.status,
    mode: action.mode,
    color: action.color,
    createdAt: action.createdAt,
    updatedAt: action.updatedAt,
    execution: projectExecutionMetadata(action.metadata)
  }));
  const latest = lastActions[0];
  const execution = latest?.execution;
  const latestVisionCube = [...activeSession.cubes]
    .filter((cube) => {
      const metadata = isRecord(cube.metadata) ? cube.metadata : {};
      return metadata.source === "opencv-file" || metadata.source === "opencv-camera";
    })
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];
  const visionMetadata = isRecord(latestVisionCube?.metadata) ? latestVisionCube.metadata : null;
  const lastVisionCounts = isRecord(visionMetadata?.counts) ? visionMetadata.counts : null;
  const counts = {
    ...persistedCounts,
    ...(lastVisionCounts ?? {})
  };
  const visionSync = visionMetadata
    ? {
        snapshotSignature:
          typeof visionMetadata.snapshotSignature === "string" ? visionMetadata.snapshotSignature : null,
        source: typeof visionMetadata.source === "string" ? visionMetadata.source : null,
        truckCode: typeof visionMetadata.truckCode === "string" ? visionMetadata.truckCode : null,
        qrDetected: typeof visionMetadata.qrDetected === "boolean" ? visionMetadata.qrDetected : null,
        qrValid: typeof visionMetadata.qrValid === "boolean" ? visionMetadata.qrValid : null,
        qrStatus: typeof visionMetadata.qrStatus === "string" ? visionMetadata.qrStatus : null,
        cameraIndex: typeof visionMetadata.cameraIndex === "number" ? visionMetadata.cameraIndex : null,
        counts: lastVisionCounts,
        syncedAt: latestVisionCube?.createdAt ?? null
      }
    : null;
  const lastError =
    execution?.errorCode || execution?.errorMessage
      ? { code: execution.errorCode, message: execution.errorMessage }
      : null;

  return {
    activeSession: {
      id: activeSession.id,
      code: activeSession.code,
      status: activeSession.status,
      truckCode: activeSession.truck.code,
      startedAt: activeSession.startedAt,
      finishedAt: activeSession.finishedAt
    },
    counts,
    lastActions,
    profile: execution?.profile ?? null,
    dryRun: execution?.dryRun ?? null,
    visionSource: execution?.visionSource ?? null,
    selectedCube: execution?.selectedCube ?? null,
    dropZoneCode: execution?.dropZoneCode ?? null,
    lastError,
    visionSync,
    lastVisionSnapshot: visionSync?.snapshotSignature ?? null,
    lastVisionTruckCode: visionSync?.truckCode ?? null,
    lastVisionCounts,
    lastVisionError:
      visionSync && visionSync.qrStatus !== "OK"
        ? { code: visionSync.qrStatus, message: "Last vision snapshot was not synced" }
        : null,
    updatedAt: latest?.updatedAt ?? activeSession.updatedAt
  };
};
