import { describe, expect, it } from "vitest";
import { addUseCaseSchema, createProjectSchema, estimateProjectSchema } from "./validators";

describe("projects validators", () => {
  it("validates create project payload", () => {
    const payload = {
      name: "ProjectScope AI",
      description: "Platform to estimate project effort and AI token costs",
      complexity: "MEDIUM"
    };

    const parsed = createProjectSchema.parse(payload);
    expect(parsed.name).toBe(payload.name);
  });

  it("rejects create project payload with short name", () => {
    const payload = {
      name: "ab",
      description: "Platform to estimate project effort and AI token costs"
    };

    expect(() => createProjectSchema.parse(payload)).toThrow();
  });

  it("validates add use-case payload", () => {
    const payload = {
      title: "Automated roadmap generation",
      description: "Generate project phases and deliverables from project context",
      priority: "HIGH"
    };

    const parsed = addUseCaseSchema.parse(payload);
    expect(parsed.priority).toBe("HIGH");
  });

  it("rejects estimate payload without roles", () => {
    expect(() => estimateProjectSchema.parse({ roles: [] })).toThrow();
  });
});