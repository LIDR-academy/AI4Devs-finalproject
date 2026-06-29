import { prisma } from "../../lib/prisma";
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
      updatedAt: null
    };
  }

  const counts = activeSession.cubes.reduce(
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
    updatedAt: latest?.updatedAt ?? activeSession.updatedAt
  };
};
