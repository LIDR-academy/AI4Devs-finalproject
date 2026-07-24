import { HttpError } from "../../lib/http-error";
import {
  assertRecord,
  cubeColors,
  optionalInteger,
  optionalNumber,
  optionalString,
  oneOf,
  validateTruckCode
} from "../../lib/validators";

const visionSources = ["opencv-file", "opencv-camera"] as const;

export type VisionDetectionInput = {
  color: "red" | "blue" | "green" | "yellow";
  confidence?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  metadata?: Record<string, unknown>;
};

export type VisionSnapshotSyncInput = {
  runId?: string;
  snapshotSignature: string;
  timestamp?: string;
  source: "opencv-file" | "opencv-camera";
  truckCode: string;
  qrDetected: boolean;
  qrValid: boolean;
  qrStatus: "OK" | "QR_NOT_DETECTED" | "QR_INVALID";
  cameraIndex?: number;
  counts?: Record<string, unknown>;
  detections: VisionDetectionInput[];
  metadata?: Record<string, unknown>;
};

const requireBoolean = (value: unknown, name: string) => {
  if (typeof value !== "boolean") {
    throw new HttpError(400, `${name} must be a boolean`);
  }
  return value;
};

const optionalIsoString = (value: unknown, name: string) => {
  const text = optionalString(value, name, 80);
  if (!text) return undefined;
  if (Number.isNaN(Date.parse(text))) {
    throw new HttpError(400, `${name} must be an ISO timestamp`);
  }
  return text;
};

const parseSnapshotSignature = (value: unknown) => {
  const signature = optionalString(value, "snapshotSignature", 160);
  if (!signature || !/^[A-Za-z0-9_-]+$/.test(signature)) {
    throw new HttpError(400, "snapshotSignature must be a safe non-empty identifier");
  }
  return signature;
};

export const parseVisionSnapshotSyncInput = (body: unknown): VisionSnapshotSyncInput => {
  const input = assertRecord(body, "body");
  const rawDetections = input.detections;
  if (!Array.isArray(rawDetections)) {
    throw new HttpError(400, "detections must be an array");
  }

  const qrDetected = requireBoolean(input.qrDetected, "qrDetected");
  const qrValid = requireBoolean(input.qrValid, "qrValid");
  const qrStatus = oneOf(input.qrStatus, "qrStatus", ["OK", "QR_NOT_DETECTED", "QR_INVALID"] as const);
  if (!qrDetected) {
    throw new HttpError(400, "QR_NOT_DETECTED");
  }
  if (!qrValid || qrStatus !== "OK") {
    throw new HttpError(400, "QR_INVALID");
  }

  return {
    runId: optionalString(input.runId, "runId", 120),
    snapshotSignature: parseSnapshotSignature(input.snapshotSignature),
    timestamp: optionalIsoString(input.timestamp, "timestamp"),
    source: oneOf(input.source, "source", visionSources),
    truckCode: validateTruckCode(input.truckCode),
    qrDetected,
    qrValid,
    qrStatus,
    cameraIndex: optionalInteger(input.cameraIndex, "cameraIndex"),
    counts: assertRecord(input.counts ?? {}, "counts"),
    metadata: input.metadata === undefined ? undefined : assertRecord(input.metadata, "metadata"),
    detections: rawDetections.map((rawDetection, index) => {
      const detection = assertRecord(rawDetection, `detections[${index}]`);
      return {
        color: oneOf(detection.color, `detections[${index}].color`, cubeColors),
        confidence: optionalNumber(detection.confidence, `detections[${index}].confidence`),
        x: optionalInteger(detection.x, `detections[${index}].x`),
        y: optionalInteger(detection.y, `detections[${index}].y`),
        w: optionalInteger(detection.w, `detections[${index}].w`),
        h: optionalInteger(detection.h, `detections[${index}].h`),
        metadata:
          detection.metadata === undefined
            ? undefined
            : assertRecord(detection.metadata, `detections[${index}].metadata`)
      };
    })
  };
};
