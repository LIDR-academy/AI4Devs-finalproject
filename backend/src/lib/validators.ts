import { HttpError } from "./http-error";

export const cubeColors = ["red", "blue", "green", "yellow"] as const;
export const sessionStatuses = ["IN_PROGRESS", "COMPLETED", "ERROR"] as const;
export const robotActionStatuses = ["PLANNED", "SUCCESS", "ERROR"] as const;
export const executionModes = ["simulation", "hardware"] as const;
export const robotActionTypes = ["PICK_AND_DROP"] as const;

export type CubeColorValue = (typeof cubeColors)[number];
export type SessionStatusValue = (typeof sessionStatuses)[number];
export type RobotActionStatusValue = (typeof robotActionStatuses)[number];
export type ExecutionModeValue = (typeof executionModes)[number];
export type RobotActionTypeValue = (typeof robotActionTypes)[number];

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const assertRecord = (value: unknown, name: string): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new HttpError(400, `${name} must be an object`);
  }
  return value;
};

export const requireString = (value: unknown, name: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `${name} is required`);
  }
  return value.trim();
};

export const optionalString = (value: unknown, name: string, maxLength?: number) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `${name} must be a string`);
  }
  const trimmed = value.trim();
  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new HttpError(400, `${name} must be at most ${maxLength} characters`);
  }
  return trimmed;
};

export const optionalNumber = (value: unknown, name: string): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new HttpError(400, `${name} must be a number`);
  }
  return value;
};

export const optionalInteger = (value: unknown, name: string): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new HttpError(400, `${name} must be an integer`);
  }
  return value;
};

export const oneOf = <T extends readonly string[]>(value: unknown, name: string, allowed: T): T[number] => {
  const text = requireString(value, name);
  if (!allowed.includes(text)) {
    throw new HttpError(400, `${name} must be one of: ${allowed.join(", ")}`);
  }
  return text;
};

export const optionalOneOf = <T extends readonly string[]>(
  value: unknown,
  name: string,
  allowed: T
): T[number] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return oneOf(value, name, allowed);
};

export const validateTruckCode = (value: unknown) => {
  const truckCode = requireString(value, "truckCode").toUpperCase();
  if (!/^TRUCK-[A-Z0-9][A-Z0-9_-]*$/.test(truckCode)) {
    throw new HttpError(400, "truckCode must use format TRUCK-*");
  }
  return truckCode;
};
