import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { cubeCode, dateCode, sessionCode } from "../../lib/code-generator";
import type { CubeInput } from "./sessions.validators";

const includeSession = {
  truck: true,
  cubes: {
    orderBy: { createdAt: "asc" as const }
  },
  robotActions: {
    orderBy: { createdAt: "desc" as const }
  }
};

export const mapSession = (session: Prisma.UnloadSessionGetPayload<{ include: typeof includeSession }>) => ({
  id: session.id,
  code: session.code,
  status: session.status,
  truckCode: session.truck.code,
  startedAt: session.startedAt,
  finishedAt: session.finishedAt,
  cubes: session.cubes.map((cube) => ({
    id: cube.id,
    code: cube.code,
    color: cube.color,
    confidence: cube.confidence,
    x: cube.x,
    y: cube.y,
    w: cube.w,
    h: cube.h,
    detectedAt: cube.detectedAt
  })),
  robotActions: session.robotActions.map((action) => ({
    id: action.id,
    code: action.code,
    actionType: action.actionType,
    status: action.status,
    mode: action.mode,
    color: action.color,
    metadata: action.metadata,
    createdAt: action.createdAt,
    updatedAt: action.updatedAt
  }))
});

export const startSession = async (truckCode: string) => {
  const today = dateCode();
  const countForDay = await prisma.unloadSession.count({
    where: {
      code: {
        startsWith: `UNLOAD-${today}-`
      }
    }
  });

  const truck = await prisma.truck.upsert({
    where: { code: truckCode },
    update: {},
    create: { code: truckCode }
  });

  const session = await prisma.unloadSession.create({
    data: {
      code: sessionCode(countForDay),
      status: "IN_PROGRESS",
      truckId: truck.id
    },
    include: includeSession
  });

  return mapSession(session);
};

export const listSessions = async () => {
  const sessions = await prisma.unloadSession.findMany({
    orderBy: { startedAt: "desc" },
    include: includeSession
  });

  return sessions.map(mapSession);
};

export const getSessionById = async (id: string) => {
  const session = await prisma.unloadSession.findUnique({
    where: { id },
    include: includeSession
  });

  if (!session) {
    throw new HttpError(404, "Session not found");
  }

  return mapSession(session);
};

export const addCubesToSession = async (sessionId: string, cubes: CubeInput[]) => {
  const session = await prisma.unloadSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    throw new HttpError(404, "Session not found");
  }

  const currentCount = await prisma.detectedCube.count({
    where: { sessionId }
  });

  await prisma.detectedCube.createMany({
    data: cubes.map((cube, index) => ({
      code: cubeCode(currentCount + index),
      sessionId,
      color: cube.color,
      confidence: cube.confidence,
      x: cube.x,
      y: cube.y,
      w: cube.w,
      h: cube.h,
      metadata: (cube.metadata ?? { source: "simulation" }) as Prisma.InputJsonObject
    }))
  });

  return getSessionById(sessionId);
};

export const finishSession = async (id: string, status: "COMPLETED" | "ERROR") => {
  const current = await prisma.unloadSession.findUnique({ where: { id } });
  if (!current) throw new HttpError(404, "Session not found");
  if (current.status === status) return getSessionById(id);
  if (current.status !== "IN_PROGRESS") {
    throw new HttpError(409, `Session cannot transition from ${current.status} to ${status}`);
  }
  await prisma.unloadSession.update({
    where: { id },
    data: { status, finishedAt: new Date() }
  });
  return getSessionById(id);
};
