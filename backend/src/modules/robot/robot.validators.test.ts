import { describe, expect, it } from "vitest";
import { parseRobotActionInput, parseRobotActionUpdateInput } from "./robot.validators";
import { mergeRobotMetadataForTransition, projectExecutionMetadata } from "./robot.metadata";

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
        errorCode: "ZONE_UNAVAILABLE"
      })
    );
  });
});
