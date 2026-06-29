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

  it("rejects sensitive metadata and invalid transitions", () => {
    expect(() =>
      parseRobotActionInput({
        sessionId: "session-id",
        metadata: { token: "do-not-store" }
      })
    ).toThrow(/forbidden sensitive key/);
    expect(() => parseRobotActionUpdateInput({ status: "PLANNED" })).toThrow();
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
        selectedCube: { color: "red", x: 1, y: 2, w: 3, h: 4 },
        dropZoneCode: "DROP_RED_01",
        errorCode: "ZONE_UNAVAILABLE",
        ignored: "not projected"
      })
    ).toEqual(
      expect.objectContaining({
        profile: "vision-dry-run",
        dryRun: true,
        visionSource: "opencv-file",
        selectedCube: { color: "red", x: 1, y: 2, w: 3, h: 4 },
        dropZoneCode: "DROP_RED_01",
        errorCode: "ZONE_UNAVAILABLE"
      })
    );
  });
});
