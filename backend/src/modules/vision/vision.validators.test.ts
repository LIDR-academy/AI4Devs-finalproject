import { describe, expect, it } from "vitest";
import { parseVisionSnapshotSyncInput } from "./vision.validators";

const validPayload = {
  runId: "run-001",
  snapshotSignature: "sig-001",
  timestamp: "2026-07-04T12:00:00.000Z",
  source: "opencv-camera",
  truckCode: "TRUCK-001",
  qrDetected: true,
  qrValid: true,
  qrStatus: "OK",
  cameraIndex: 1,
  detections: [
    { color: "red", x: 10, y: 20, w: 30, h: 30, confidence: 0.9 }
  ]
};

describe("vision snapshot sync validators", () => {
  it("accepts a valid QR-gated vision snapshot", () => {
    const input = parseVisionSnapshotSyncInput(validPayload);

    expect(input.truckCode).toBe("TRUCK-001");
    expect(input.source).toBe("opencv-camera");
    expect(input.detections).toHaveLength(1);
  });

  it("rejects snapshots without QR before sync", () => {
    expect(() =>
      parseVisionSnapshotSyncInput({
        ...validPayload,
        qrDetected: false,
        qrValid: false,
        qrStatus: "QR_NOT_DETECTED"
      })
    ).toThrow(/QR_NOT_DETECTED/);
  });

  it("rejects invalid QR snapshots before sync", () => {
    expect(() =>
      parseVisionSnapshotSyncInput({
        ...validPayload,
        truckCode: "TRUCK-001",
        qrValid: false,
        qrStatus: "QR_INVALID"
      })
    ).toThrow(/QR_INVALID/);
  });

  it("rejects unsafe snapshot signatures", () => {
    expect(() =>
      parseVisionSnapshotSyncInput({
        ...validPayload,
        snapshotSignature: "../bad"
      })
    ).toThrow(/snapshotSignature/);
  });
});
