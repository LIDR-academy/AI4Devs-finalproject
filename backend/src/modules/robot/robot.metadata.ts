import { HttpError } from "../../lib/http-error";
import { cubeColors, isRecord } from "../../lib/validators";
import { isDeepStrictEqual } from "node:util";

const MAX_METADATA_BYTES = 32_768;
const MAX_ERROR_MESSAGE_LENGTH = 500;
const sensitiveKeyPattern = /(authorization|credential|password|secret|token|api[_-]?key)/i;
const profiles = ["simulation", "vision-dry-run", "hardware"] as const;
const visionSources = ["simulation", "edge-simulation", "opencv-file", "opencv-camera"] as const;

const assertNoSensitiveKeys = (value: unknown, path = "metadata"): void => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSensitiveKeys(item, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (sensitiveKeyPattern.test(key)) {
      throw new HttpError(400, `${path} contains a forbidden sensitive key`);
    }
    assertNoSensitiveKeys(child, `${path}.${key}`);
  }
};

const assertJsonSafe = (value: unknown, path = "metadata"): void => {
  if (value === undefined) {
    throw new HttpError(400, `${path} must not contain undefined values`);
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new HttpError(400, `${path} must contain only finite numbers`);
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertJsonSafe(item, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    assertJsonSafe(child, `${path}.${key}`);
  }
};

const optionalString = (value: unknown, field: string, maxLength = 120): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new HttpError(400, `metadata.${field} must be a non-empty string of at most ${maxLength} characters`);
  }
  return value.trim();
};

const optionalBoolean = (value: unknown, field: string): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "boolean") {
    throw new HttpError(400, `metadata.${field} must be a boolean`);
  }
  return value;
};

const optionalPositiveInteger = (value: unknown, field: string): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new HttpError(400, `metadata.${field} must be a positive integer`);
  }
  return Number(value);
};

const parseSelectedCube = (value: unknown): Record<string, unknown> | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) throw new HttpError(400, "metadata.selectedCube must be an object");
  if (typeof value.color !== "string" || !cubeColors.includes(value.color as (typeof cubeColors)[number])) {
    throw new HttpError(400, `metadata.selectedCube.color must be one of: ${cubeColors.join(", ")}`);
  }

  const selectedCube: Record<string, unknown> = { color: value.color };
  for (const field of ["x", "y", "w", "h"] as const) {
    if (value[field] !== undefined) {
      if (!Number.isInteger(value[field])) {
        throw new HttpError(400, `metadata.selectedCube.${field} must be an integer`);
      }
      selectedCube[field] = value[field];
    }
  }
  if (value.confidence !== undefined && value.confidence !== null) {
    if (typeof value.confidence !== "number" || value.confidence < 0 || value.confidence > 1) {
      throw new HttpError(400, "metadata.selectedCube.confidence must be between 0 and 1");
    }
    selectedCube.confidence = value.confidence;
  }
  return selectedCube;
};

const sanitizeErrorMessage = (value: string) =>
  value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\bBearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/:\/\/[^/\s:@]+:[^/\s@]+@/g, "://[redacted]@")
    .replace(/\b(token|password|secret|api[_-]?key)\s*[=:]\s*\S+/gi, "$1=[redacted]");

export type ExecutionMode = "simulation" | "hardware";

export const normalizeRobotMetadata = (
  raw: Record<string, unknown>,
  mode: ExecutionMode
): Record<string, unknown> => {
  assertJsonSafe(raw);
  assertNoSensitiveKeys(raw);
  if (Buffer.byteLength(JSON.stringify(raw), "utf8") > MAX_METADATA_BYTES) {
    throw new HttpError(400, `metadata must not exceed ${MAX_METADATA_BYTES} bytes`);
  }

  const profile = optionalString(raw.profile, "profile");
  if (profile && !profiles.includes(profile as (typeof profiles)[number])) {
    throw new HttpError(400, `metadata.profile must be one of: ${profiles.join(", ")}`);
  }
  const source = optionalString(raw.source, "source");
  if (source && !visionSources.includes(source as (typeof visionSources)[number])) {
    throw new HttpError(400, `metadata.source must be one of: ${visionSources.join(", ")}`);
  }

  const normalized: Record<string, unknown> = { ...raw };
  normalized.profile = profile ?? (mode === "simulation" ? "simulation" : "hardware");
  normalized.dryRun = mode === "simulation" ? true : (optionalBoolean(raw.dryRun, "dryRun") ?? false);

  const runId = optionalString(raw.runId, "runId");
  const dropZoneCode = optionalString(raw.dropZoneCode, "dropZoneCode");
  const configVersion = optionalString(raw.configVersion, "configVersion");
  const calibrationVersion = optionalString(raw.calibrationVersion, "calibrationVersion");
  const errorCode = optionalString(raw.errorCode, "errorCode");
  const errorMessage = optionalString(raw.errorMessage, "errorMessage", MAX_ERROR_MESSAGE_LENGTH);
  const selectedCube = parseSelectedCube(raw.selectedCube);
  const positionOrder = optionalPositiveInteger(raw.positionOrder, "positionOrder");

  Object.assign(normalized, {
    ...(runId ? { runId } : {}),
    ...(source ? { source } : {}),
    ...(selectedCube ? { selectedCube } : {}),
    ...(dropZoneCode ? { dropZoneCode } : {}),
    ...(positionOrder ? { positionOrder } : {}),
    ...(configVersion ? { configVersion } : {}),
    ...(calibrationVersion ? { calibrationVersion } : {}),
    ...(errorCode ? { errorCode } : {}),
    ...(errorMessage ? { errorMessage: sanitizeErrorMessage(errorMessage) } : {})
  });

  for (const field of ["releaseConfirmed", "statePersisted", "serialOpened", "hardwareMovement"] as const) {
    const value = optionalBoolean(raw[field], field);
    if (value !== undefined) normalized[field] = value;
  }

  if (normalized.profile === "vision-dry-run") {
    if (mode !== "simulation") {
      throw new HttpError(400, "vision-dry-run actions must use mode=simulation");
    }
    normalized.dryRun = true;
    normalized.serialOpened = false;
    normalized.hardwareMovement = false;
  }
  return normalized;
};

export const mergeRobotMetadataForTransition = (
  current: Record<string, unknown>,
  patch: Record<string, unknown>,
  mode: ExecutionMode
) => {
  const immutableFields = [
    "runId",
    "profile",
    "source",
    "selectedCube",
    "dropZoneCode",
    "positionOrder",
    "configVersion",
    "calibrationVersion"
  ];
  for (const field of immutableFields) {
    if (
      field in current &&
      field in patch &&
      !isDeepStrictEqual(current[field], patch[field])
    ) {
      throw new HttpError(409, `metadata.${field} cannot change during an action transition`);
    }
  }
  return normalizeRobotMetadata({ ...current, ...patch }, mode);
};

export const projectExecutionMetadata = (raw: unknown) => {
  const metadata = isRecord(raw) ? raw : {};
  return {
    runId: typeof metadata.runId === "string" ? metadata.runId : null,
    snapshotSignature: typeof metadata.snapshotSignature === "string" ? metadata.snapshotSignature : null,
    truckCode: typeof metadata.truckCode === "string" ? metadata.truckCode : null,
    profile: typeof metadata.profile === "string" ? metadata.profile : null,
    dryRun: typeof metadata.dryRun === "boolean" ? metadata.dryRun : null,
    visionSource: typeof metadata.source === "string" ? metadata.source : null,
    selectedCube: isRecord(metadata.selectedCube) ? metadata.selectedCube : null,
    selectedCubeColor:
      typeof metadata.selectedCubeColor === "string" ? metadata.selectedCubeColor : null,
    selectedCubeCenter: isRecord(metadata.selectedCubeCenter) ? metadata.selectedCubeCenter : null,
    selectedCubeBoundingBox:
      isRecord(metadata.selectedCubeBoundingBox) ? metadata.selectedCubeBoundingBox : null,
    dropZoneCode: typeof metadata.dropZoneCode === "string" ? metadata.dropZoneCode : null,
    dropZonePose: isRecord(metadata.dropZonePose) ? metadata.dropZonePose : null,
    positionOrder: typeof metadata.positionOrder === "number" ? metadata.positionOrder : null,
    sequencePreview: Array.isArray(metadata.sequencePreview) ? metadata.sequencePreview : [],
    commandsPreview: Array.isArray(metadata.commandsPreview) ? metadata.commandsPreview : [],
    releaseConfirmed: typeof metadata.releaseConfirmed === "boolean" ? metadata.releaseConfirmed : null,
    statePersisted: typeof metadata.statePersisted === "boolean" ? metadata.statePersisted : null,
    configVersion: typeof metadata.configVersion === "string" ? metadata.configVersion : null,
    calibrationVersion:
      typeof metadata.calibrationVersion === "string" ? metadata.calibrationVersion : null,
    errorCode: typeof metadata.errorCode === "string" ? metadata.errorCode : null,
    errorMessage: typeof metadata.errorMessage === "string" ? metadata.errorMessage : null
  };
};
