import { describe, expect, it } from "vitest";
import { parseRobotActionInput, parseRobotActionUpdateInput } from "./robot.validators";
import { mergeRobotMetadataForTransition, projectExecutionMetadata, sanitizeRobotMetadata } from "./robot.metadata";

describe("robot action dry-run contract", () => {
  it("keeps the Entrega 2 payload compatible", () => {
    const input = parseRobotActionInput({
      sessionId: "session-id",
      actionType: "PICK_AND_DROP",
      status: "SUCCESS",
      mode: "simulation",
      color: "red",
      metadata: { dryRun: true, commandPreview: "POSE 1 2 3 0" }
    });
    expect(input.status).toBe("SUCCESS");
    expect(input.metadata).toMatchObject({
      profile: "simulation",
      dryRun: true,
      commandPreview: "POSE 1 2 3 0"
    });
  });

  it("accepts and normalizes safe vision dry-run metadata", () => {
    const input = parseRobotActionInput({
      sessionId: "session-id",
      status: "PLANNED",
      mode: "simulation",
      color: "blue",
      metadata: {
        runId: "run-001",
        profile: "vision-dry-run",
        dryRun: true,
        source: "opencv-file",
        selectedCube: { color: "blue", x: 10, y: 20, w: 30, h: 40, confidence: 0.91 },
        dropZoneCode: "DROP_BLUE_01",
        positionOrder: 1,
        releaseConfirmed: false,
        statePersisted: false,
        calibrationVersion: "cal-v1"
      }
    });
    expect(input.metadata).toMatchObject({
      runId: "run-001",
      profile: "vision-dry-run",
      serialOpened: false,
      hardwareMovement: false,
      dropZoneCode: "DROP_BLUE_01"
    });
  });

  it("accepts hardware pick/drop metadata from Edge sync", () => {
    const input = parseRobotActionInput({
      sessionId: "session-id",
      actionType: "PICK_AND_DROP",
      status: "SUCCESS",
      mode: "hardware",
      color: "red",
      metadata: {
        runId: "run-hw-001",
        dryRun: false,
        profile: "hardware",
        truckCode: "TRUCK-001",
        selectedCube: { color: "red", x: 80, y: 80, w: 20, h: 20, confidence: 0.9 },
        selectedCubeColor: "red",
        selectedCubeCenter: { x: 90, y: 90 },
        selectedCubeBoundingBox: { x: 80, y: 80, w: 20, h: 20 },
        pickupPositionCm: { x: 5.4, y: 2.1 },
        pickupOffset: { x: 5, y: 0, z: 0 },
        pickupTargetBase: { x: 39.44, y: -183.88, z: 138 },
        pickupTarget: { x: 44.44, y: -183.88, z: 138 },
        pickupSafe: { x: 44.44, y: -183.88, z: 150 },
        dropZoneCode: "DROP_RED_01",
        dropZonePose: { x: 1, y: -1, z: 81 },
        positionOrder: 1,
        commandsPreview: ["POSE 124 -83 212 0", "POSE 44 -184 138 1"],
        firmwareResponses: [
          {
            step: "cube_target_pick",
            commandSent: "POSE 44 -184 138 1",
            firmwareResponse: "DONE",
            success: true,
            postStepDelaySeconds: 0.8,
            elapsedMs: 12.3
          }
        ],
        serialOpened: true,
        hardwareMovement: true,
        suctionActivated: true,
        pickupExecuted: true,
        dropExecuted: true,
        releaseConfirmed: true,
        occupiedPersisted: true,
        homographyUsed: true,
        visualCalibrationUsed: true,
        visualCalibrationVersion: "pickup-robot-local-2026-07-04",
        movementDelaySeconds: 0.8,
        pickupHoldSeconds: 1.2,
        releaseHoldSeconds: 0.5
      }
    });

    expect(input.metadata).toMatchObject({
      profile: "hardware",
      dryRun: false,
      runId: "run-hw-001",
      dropZoneCode: "DROP_RED_01",
      serialOpened: true,
      hardwareMovement: true,
      releaseConfirmed: true
    });
  });

  it("accepts later multi-cube hardware action metadata with retries and physical confirmation", () => {
    const input = parseRobotActionInput({
      sessionId: "session-id",
      actionType: "PICK_AND_DROP",
      status: "SUCCESS",
      mode: "hardware",
      color: "green",
      metadata: {
        multiCubeRunId: "multi-run-001",
        sequenceNumber: 5,
        totalPlannedCubes: 6,
        truckCode: "TRUCK-001",
        snapshotSignature: "sig-after-yellow",
        selectedCube: { color: "green", x: 40, y: 90, w: 20, h: 20, confidence: 0.8 },
        selectedCubeColor: "green",
        selectedCubeCenter: { x: 50, y: 100 },
        selectedCubeBoundingBox: { x: 40, y: 90, w: 20, h: 20 },
        pickupPositionCm: { x: 4.2, y: 6.1 },
        pickupOffset: { x: 0, y: 0, z: -2 },
        pickupTargetBase: { x: 39.44, y: -183.88, z: 138 },
        pickupTarget: { x: 39.44, y: -183.88, z: 136 },
        pickupSafe: { x: 39.44, y: -183.88, z: 150 },
        dropZoneCode: "DROP_GREEN_01",
        dropZonePose: { x: 1, y: -1, z: 81 },
        positionOrder: 1,
        firmwareResponses: [
          ...Array.from({ length: 24 }, (_, index) => ({
            attempt: index < 8 ? 1 : index < 16 ? 2 : 3,
            step: `step-${index}`,
            commandSent: `POSE ${39 + index} -184 136 1`,
            firmwareResponse: "DONE",
            success: true,
            postStepDelaySeconds: 0.8,
            elapsedMs: 10.4 + index
          }))
        ],
        firmwareResponseCount: 36,
        firmwareResponsesTruncated: true,
        commandExecutionStatus: "SUCCESS",
        physicalConfirmation: {
          enabled: true,
          status: "CONFIRMED",
          method: "post_drop_vision_count_delta",
          selectedCubeColor: "green",
          totalBefore: 2,
          totalAfter: 1,
          colorBefore: 1,
          colorAfter: 0,
          expectedTotalAfter: 1,
          expectedColorAfter: 0,
          snapshotBeforeSignature: "sig-before",
          snapshotAfterSignature: "sig-after",
          attempts: [
            { attempt: 1, pickZ: 138, totalBefore: 2, totalAfter: 2, colorBefore: 1, colorAfter: 1, status: "FAILED" },
            { attempt: 2, pickZ: 136, totalBefore: 2, totalAfter: 1, colorBefore: 1, colorAfter: 0, status: "CONFIRMED" }
          ]
        },
        backendSyncStatus: "SKIPPED",
        finalPickZUsed: 136,
        retryEnabled: true,
        maxAttempts: 3,
        zStep: -2,
        minPickZ: 132,
        occupiedPersisted: true,
        diagnosticTrace: "x".repeat(40_000)
      }
    });

    expect(input.metadata).toMatchObject({
      multiCubeRunId: "multi-run-001",
      sequenceNumber: 5,
      physicalConfirmation: expect.objectContaining({ status: "CONFIRMED" }),
      finalPickZUsed: 136
    });
  });

  it("sanitizes firmware responses with real null characters before persistence", () => {
    const input = parseRobotActionInput({
      sessionId: "session-id",
      actionType: "PICK_AND_DROP",
      status: "SUCCESS",
      mode: "hardware",
      color: "red",
      metadata: {
        profile: "hardware",
        dryRun: false,
        selectedCube: { color: "red", x: 80, y: 80, w: 20, h: 20 },
        firmwareResponses: [
          {
            step: "cube_target_pick",
            commandSent: "POSE 44 -184 138 1",
            firmwareResponse: "UU\u0001\u0007\u0000DONE",
            success: true
          }
        ]
      }
    });

    const firmware = (input.metadata?.firmwareResponses as Record<string, unknown>[])[0];
    expect(firmware.firmwareResponse).toBe("UU<0x01><0x07><0x00>DONE");
    expect(firmware.firmwareResponseSanitized).toBe(true);
    expect(firmware.firmwareResponseRawLength).toBe(9);
    expect(firmware.firmwareResponseHadControlChars).toBe(true);
    expect(firmware.firmwareResponseControlCharCount).toBe(3);
    expect(input.metadata?.metadataSanitized).toBe(true);
    expect(JSON.stringify(input.metadata)).not.toContain("\u0000");
  });

  it("sanitizes nested control characters while preserving unicode text", () => {
    const sanitized = sanitizeRobotMetadata({
      message: "acción física confirmada",
      "raw\u0000key": "value",
      nested: { firmwareResponse: "OK\u0000DONE", note: "línea\ncon tab\tválida" }
    });

    expect(sanitized.message).toBe("acción física confirmada");
    expect(sanitized["raw<0x00>key"]).toBe("value");
    expect((sanitized.nested as Record<string, unknown>).firmwareResponse).toBe("OK<0x00>DONE");
    expect((sanitized.nested as Record<string, unknown>).note).toBe("línea\ncon tab\tválida");
    expect(sanitized.metadataSanitized).toBe(true);
    expect(sanitized.sanitizedFields).toContain("metadata.nested.firmwareResponse");
  });

  it("accepts multi-cube metadata with sanitized attempts and firmware responses", () => {
    const input = parseRobotActionInput({
      sessionId: "session-id",
      actionType: "PICK_AND_DROP",
      status: "SUCCESS",
      mode: "hardware",
      color: "blue",
      metadata: {
        multiCubeRunId: "multi-run-001",
        sequenceNumber: 2,
        totalPlannedCubes: 6,
        selectedCube: { color: "blue", x: 40, y: 90, w: 20, h: 20, confidence: 0.9 },
        selectedCubeColor: "blue",
        attempts: [{ attempt: 1, pickZ: 138, diagnostic: "raw\u0000byte" }],
        firmwareResponses: [{ attempt: 1, firmwareResponse: "UU\u0000DONE", success: true }],
        physicalConfirmation: { enabled: true, status: "CONFIRMED" },
        backendSyncStatus: "SKIPPED",
        finalPickZUsed: 138
      }
    });

    expect(input.metadata).toMatchObject({
      multiCubeRunId: "multi-run-001",
      sequenceNumber: 2,
      physicalConfirmation: { enabled: true, status: "CONFIRMED" },
      finalPickZUsed: 138,
      metadataSanitized: true
    });
    expect(JSON.stringify(input.metadata)).not.toContain("\u0000");
  });

  it("rejects unsupported FAILED action status as a clear validation error", () => {
    expect(() =>
      parseRobotActionInput({
        sessionId: "session-id",
        status: "FAILED",
        mode: "hardware",
        metadata: { multiCubeRunId: "multi-run-001" }
      })
    ).toThrow(/status must be one of: PLANNED, SUCCESS, ERROR/);
  });

  it("rejects sensitive metadata and invalid transitions", () => {
    expect(() =>
      parseRobotActionInput({
        sessionId: "session-id",
        metadata: { token: "do-not-store" }
      })
    ).toThrow(/forbidden sensitive key/);
    expect(() => parseRobotActionUpdateInput({ status: "PLANNED" })).toThrow();
    expect(() =>
      parseRobotActionInput({
        sessionId: "session-id",
        metadata: { pickupTarget: { x: Number.NaN, y: 1, z: 2 } }
      })
    ).toThrow(/finite numbers/);
  });

  it("redacts credentials from errorMessage", () => {
    const input = parseRobotActionInput({
      sessionId: "session-id",
      status: "ERROR",
      metadata: {
        errorCode: "BACKEND_REJECTED",
        errorMessage: "Bearer abc123 password=hunter2 at http://user:pass@example.test"
      }
    });
    expect(input.metadata?.errorMessage).toBe(
      "Bearer [redacted] password=[redacted] at http://[redacted]@example.test"
    );
  });

  it("keeps plan identity immutable during the terminal transition", () => {
    expect(() =>
      mergeRobotMetadataForTransition(
        { runId: "run-1", dropZoneCode: "DROP_RED_01", dryRun: true },
        { runId: "run-2" },
        "simulation"
      )
    ).toThrow(/cannot change/);
    expect(() =>
      mergeRobotMetadataForTransition(
        { selectedCube: { color: "red", x: 1, y: 2 } },
        { selectedCube: { y: 2, x: 1, color: "red" } },
        "simulation"
      )
    ).not.toThrow();
  });

  it("projects the additive dashboard fields without exposing arbitrary metadata", () => {
    expect(
      projectExecutionMetadata({
        profile: "vision-dry-run",
        dryRun: true,
        source: "opencv-file",
        snapshotSignature: "sig-001",
        selectedCube: { color: "red", x: 1, y: 2, w: 3, h: 4 },
        selectedCubeCenter: { x: 2.5, y: 4 },
        selectedCubeBoundingBox: { x: 1, y: 2, w: 3, h: 4 },
        dropZoneCode: "DROP_RED_01",
        dropZonePose: { x: 1, y: 2, z: 3 },
        sequencePreview: ["ready_to_take"],
        commandsPreview: ["POSE 1 2 3 0"],
        multiCubeRunId: "multi-run-001",
        sequenceNumber: 5,
        totalPlannedCubes: 6,
        commandExecutionStatus: "SUCCESS",
        backendSyncStatus: "SUCCESS",
        backendSyncErrorDetails: { errorCode: "BACKEND_SYNC_FAILED", correlationId: "corr-001" },
        physicalConfirmation: { status: "CONFIRMED" },
        finalPickZUsed: 136,
        errorCode: "ZONE_UNAVAILABLE",
        ignored: "not projected"
      })
    ).toEqual(
      expect.objectContaining({
        profile: "vision-dry-run",
        dryRun: true,
        visionSource: "opencv-file",
        snapshotSignature: "sig-001",
        selectedCube: { color: "red", x: 1, y: 2, w: 3, h: 4 },
        selectedCubeCenter: { x: 2.5, y: 4 },
        selectedCubeBoundingBox: { x: 1, y: 2, w: 3, h: 4 },
        dropZoneCode: "DROP_RED_01",
        dropZonePose: { x: 1, y: 2, z: 3 },
        sequencePreview: ["ready_to_take"],
        commandsPreview: ["POSE 1 2 3 0"],
        multiCubeRunId: "multi-run-001",
        sequenceNumber: 5,
        totalPlannedCubes: 6,
        commandExecutionStatus: "SUCCESS",
        backendSyncStatus: "SUCCESS",
        backendSyncErrorDetails: { errorCode: "BACKEND_SYNC_FAILED", correlationId: "corr-001" },
        physicalConfirmation: { status: "CONFIRMED" },
        finalPickZUsed: 136,
        errorCode: "ZONE_UNAVAILABLE"
      })
    );
  });
});
