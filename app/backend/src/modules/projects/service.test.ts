import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./repository", () => ({
  getProjectForEstimation: vi.fn(),
  upsertEstimation: vi.fn(),
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  listProjects: vi.fn(),
  projectExists: vi.fn(),
  createUseCase: vi.fn()
}));

import * as repository from "./repository";
import { generateEstimate } from "./service";

const mockedRepository = vi.mocked(repository);

describe("projects service generateEstimate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws 404 when project does not exist", async () => {
    mockedRepository.getProjectForEstimation.mockResolvedValueOnce(null as never);

    await expect(generateEstimate("missing-project", { roles: ["backend-developer"] })).rejects.toMatchObject({
      message: "Project not found",
      statusCode: 404
    });
  });

  it("throws 400 when project has no use cases", async () => {
    mockedRepository.getProjectForEstimation.mockResolvedValueOnce({
      id: "project-1",
      name: "Project 1",
      description: "desc",
      complexity: "MEDIUM",
      useCases: []
    } as never);

    await expect(generateEstimate("project-1", { roles: ["backend-developer"] })).rejects.toMatchObject({
      message: "At least one use case is required to run estimation",
      statusCode: 400
    });
  });

  it("uses fallback mode and persists estimation when Azure is disabled", async () => {
    mockedRepository.getProjectForEstimation.mockResolvedValueOnce({
      id: "project-2",
      name: "Project 2",
      description: "desc",
      complexity: "MEDIUM",
      useCases: [
        {
          id: "uc-1",
          title: "Use case",
          description: "Use case description",
          priority: "HIGH"
        }
      ]
    } as never);

    mockedRepository.upsertEstimation.mockResolvedValueOnce({ id: "estimation-1" } as never);

    const result = await generateEstimate("project-2", {
      roles: ["backend-developer", "frontend-developer"],
      model: "gpt-4o-mini"
    });

    expect(result).toEqual({ id: "estimation-1" });
    expect(mockedRepository.upsertEstimation).toHaveBeenCalledTimes(1);

    const payload = mockedRepository.upsertEstimation.mock.calls[0]?.[0];
    expect(payload.projectId).toBe("project-2");
    expect(payload.phases.length).toBeGreaterThanOrEqual(3);
    expect(payload.assumptions).toContain("Generation mode: heuristic fallback");
    expect(payload.token.tokens).toBeGreaterThan(0);
  });
});