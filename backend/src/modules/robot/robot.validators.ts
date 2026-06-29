import {
  assertRecord,
  cubeColors,
  executionModes,
  optionalOneOf,
  robotActionStatuses,
  robotActionTypes
} from "../../lib/validators";
import { HttpError } from "../../lib/http-error";
import { normalizeRobotMetadata } from "./robot.metadata";

export type RobotActionInput = {
  sessionId: string;
  actionType: "PICK_AND_DROP";
  status: "PLANNED" | "SUCCESS" | "ERROR";
  mode: "simulation" | "hardware";
  color?: "red" | "blue" | "green" | "yellow";
  metadata?: Record<string, unknown>;
};

export type RobotActionUpdateInput = {
  status: "SUCCESS" | "ERROR";
  metadata: Record<string, unknown>;
};

export const parseRobotActionInput = (body: unknown): RobotActionInput => {
  const input = assertRecord(body, "body");
  const sessionId = typeof input.sessionId === "string" ? input.sessionId.trim() : "";

  if (!sessionId) {
    throw new HttpError(400, "sessionId is required");
  }

  const mode = optionalOneOf(input.mode, "mode", executionModes) ?? "simulation";
  const rawMetadata =
    input.metadata === undefined
      ? { dryRun: true, source: "simulation" }
      : assertRecord(input.metadata, "metadata");

  return {
    sessionId,
    actionType: optionalOneOf(input.actionType, "actionType", robotActionTypes) ?? "PICK_AND_DROP",
    status: optionalOneOf(input.status, "status", robotActionStatuses) ?? "SUCCESS",
    mode,
    color: optionalOneOf(input.color, "color", cubeColors),
    metadata: normalizeRobotMetadata(rawMetadata, mode)
  };
};

export const parseRobotActionUpdateInput = (body: unknown): RobotActionUpdateInput => {
  const input = assertRecord(body, "body");
  const status = optionalOneOf(input.status, "status", ["SUCCESS", "ERROR"] as const);
  if (!status) {
    throw new HttpError(400, "status is required");
  }
  return {
    status,
    metadata: input.metadata === undefined ? {} : assertRecord(input.metadata, "metadata")
  };
};
