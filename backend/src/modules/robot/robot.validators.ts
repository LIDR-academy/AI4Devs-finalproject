import {
  assertRecord,
  cubeColors,
  executionModes,
  optionalOneOf,
  robotActionStatuses,
  robotActionTypes
} from "../../lib/validators";
import { HttpError } from "../../lib/http-error";

export type RobotActionInput = {
  sessionId: string;
  actionType: "PICK_AND_DROP";
  status: "PLANNED" | "SUCCESS" | "ERROR";
  mode: "simulation" | "hardware";
  color?: "red" | "blue" | "green" | "yellow";
  metadata?: Record<string, unknown>;
};

export const parseRobotActionInput = (body: unknown): RobotActionInput => {
  const input = assertRecord(body, "body");
  const sessionId = typeof input.sessionId === "string" ? input.sessionId.trim() : "";

  if (!sessionId) {
    throw new HttpError(400, "sessionId is required");
  }

  return {
    sessionId,
    actionType: optionalOneOf(input.actionType, "actionType", robotActionTypes) ?? "PICK_AND_DROP",
    status: optionalOneOf(input.status, "status", robotActionStatuses) ?? "SUCCESS",
    mode: optionalOneOf(input.mode, "mode", executionModes) ?? "simulation",
    color: optionalOneOf(input.color, "color", cubeColors),
    metadata: input.metadata === undefined ? { source: "simulation" } : assertRecord(input.metadata, "metadata")
  };
};
