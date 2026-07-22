import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../auth/session-store", () => ({
  authSessionStore: {
    isAssignedToProject: vi.fn(),
    getAssignedProjectIds: vi.fn(),
    getOrCreate: vi.fn(),
    assignProject: vi.fn(),
    unassignProject: vi.fn(),
    listProjectAssignments: vi.fn(),
    listUsers: vi.fn(),
    setUserRole: vi.fn(),
    createTeam: vi.fn(),
    listTeams: vi.fn(),
    addTeamMember: vi.fn()
  }
}));

vi.mock("./repository", () => ({
  getProjectForEstimation: vi.fn(),
  getProjectForEstimationUnscoped: vi.fn(),
  createEstimationVersion: vi.fn(),
  getProjectById: vi.fn(),
  getProjectByIdUnscoped: vi.fn(),
  getProjectEstimationByVersion: vi.fn(),
  createProject: vi.fn(),
  listProjects: vi.fn(),
  projectExists: vi.fn(),
  createUseCase: vi.fn(),
  ensureDefaultAgentRoles: vi.fn(),
  listActiveAgentRoles: vi.fn(),
  listUseCasesByProject: vi.fn(),
  listAgentRoles: vi.fn(),
  createAgentRole: vi.fn(),
  updateAgentRole: vi.fn(),
  deleteAgentRole: vi.fn(),
  getAgentRoleById: vi.fn()
}));

import * as repository from "./repository";
import { authSessionStore } from "../auth/session-store";
import { addUseCase, generateEstimate } from "./service";

const mockedRepository = vi.mocked(repository);
const mockedSessionStore = vi.mocked(authSessionStore);

describe("projects service generateEstimate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws 404 when project does not exist", async () => {
    mockedRepository.getProjectForEstimationUnscoped.mockResolvedValueOnce(null as never);

    await expect(generateEstimate("local-dev-actor", "SUPERADMIN", "missing-project", { roles: ["backend-developer"] })).rejects.toMatchObject({
      message: "Project not found",
      statusCode: 404
    });
  });

  it("throws 400 when project has no use cases", async () => {
    mockedRepository.listActiveAgentRoles.mockResolvedValueOnce([
      { key: "backend-developer", name: "Backend Developer", isActive: true }
    ] as never);

    mockedRepository.getProjectForEstimationUnscoped.mockResolvedValueOnce({
      id: "project-1",
      name: "Project 1",
      description: "desc",
      complexity: "MEDIUM",
      useCases: []
    } as never);

    await expect(generateEstimate("local-dev-actor", "SUPERADMIN", "project-1", { roles: ["backend-developer"] })).rejects.toMatchObject({
      message: "At least one use case is required to run estimation",
      statusCode: 400
    });
  });

  it("throws 400 when selected roles are empty or blank", async () => {
    mockedRepository.listActiveAgentRoles.mockResolvedValueOnce([
      { key: "backend-developer", name: "Backend Developer", isActive: true }
    ] as never);

    mockedRepository.getProjectForEstimationUnscoped.mockResolvedValueOnce({
      id: "project-blank-roles",
      name: "Project blank roles",
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

    await expect(generateEstimate("local-dev-actor", "SUPERADMIN", "project-blank-roles", { roles: ["   "] })).rejects.toMatchObject({
      message: "At least one valid role is required",
      statusCode: 400
    });
  });

  it("uses fallback mode and persists estimation when Azure is disabled", async () => {
    mockedRepository.listActiveAgentRoles.mockResolvedValueOnce([
      { key: "backend-developer", name: "Backend Developer", isActive: true },
      { key: "frontend-developer", name: "Frontend Developer", isActive: true }
    ] as never);

    mockedRepository.getProjectForEstimationUnscoped.mockResolvedValueOnce({
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

    mockedRepository.createEstimationVersion.mockResolvedValueOnce({ id: "estimation-1" } as never);

    const result = await generateEstimate("local-dev-actor", "SUPERADMIN", "project-2", {
      roles: ["backend-developer", "frontend-developer"],
      model: "gpt-4o-mini"
    });

    expect(result).toEqual({ id: "estimation-1" });
    expect(mockedRepository.createEstimationVersion).toHaveBeenCalledTimes(1);

    const payload = mockedRepository.createEstimationVersion.mock.calls[0]?.[0];
    expect(payload.projectId).toBe("project-2");
    expect(payload.phases.length).toBeGreaterThanOrEqual(3);
    expect(payload.assumptions).toContain("Generation mode: heuristic fallback");
    expect(payload.token.tokens).toBeGreaterThan(0);
  });
});

describe("projects service addUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws 404 when project does not exist", async () => {
    mockedSessionStore.isAssignedToProject.mockResolvedValueOnce(true as never);
    mockedRepository.getProjectByIdUnscoped.mockResolvedValueOnce(null as never);

    await expect(
      addUseCase("local-dev-actor", "USER", "missing-project", {
        title: "A use case",
        description: "A sufficiently long use case description",
        priority: "MEDIUM"
      })
    ).rejects.toMatchObject({
      message: "Project not found",
      statusCode: 404
    });
  });

  it("throws 404 for USER when project is not assigned", async () => {
    mockedSessionStore.isAssignedToProject.mockResolvedValueOnce(false as never);

    await expect(
      addUseCase("local-dev-actor", "USER", "missing-project", {
        title: "A use case",
        description: "A sufficiently long use case description",
        priority: "MEDIUM"
      })
    ).rejects.toMatchObject({
      message: "Project not found",
      statusCode: 404
    });
  });
});