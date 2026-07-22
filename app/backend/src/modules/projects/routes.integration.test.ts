import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../config/env", () => ({
  env: {
    PORT: 3001,
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    AUTH_ENABLED: true,
    AUTH_LOGIN_PASSWORD: "dev-pass-123",
    AUTH_TOKEN_SECRET: "test-token-secret-value",
    AUTH_TOKEN_TTL_SECONDS: 3600,
    AUTH_REFRESH_TOKEN_TTL_SECONDS: 7200,
    AUTH_SUPERADMIN_ACTOR_IDS: "qa-superadmin",
    AUTH_ADMIN_ACTOR_IDS: "qa-admin",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000",
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX_REQUESTS: 120,
    AZURE_OPENAI_ENABLED: false,
    AZURE_OPENAI_API_VERSION: "2024-10-21",
    AZURE_OPENAI_TIMEOUT_MS: 25000,
    AZURE_OPENAI_INPUT_COST_PER_1K: 0.005,
    AZURE_OPENAI_OUTPUT_COST_PER_1K: 0.015,
    AZURE_OPENAI_ENDPOINT: undefined,
    AZURE_OPENAI_API_KEY: undefined,
    AZURE_OPENAI_DEPLOYMENT: undefined
  }
}));

const sessionUsers = new Map<string, { actorId: string; displayName: string; role: "SUPERADMIN" | "ADMIN" | "USER"; sessionVersion: number }>();

vi.mock("../auth/session-store", () => {
  const superAdminActorIds = new Set<string>();
  const adminActorIds = new Set<string>();

  const resolveRole = (actorId: string): "SUPERADMIN" | "ADMIN" | "USER" => {
    if (superAdminActorIds.has(actorId)) {
      return "SUPERADMIN";
    }

    if (adminActorIds.has(actorId)) {
      return "ADMIN";
    }

    return "USER";
  };

  return {
    authSessionStore: {
      configureRoleMapping: vi.fn((input: { superAdminIds: string[]; adminIds: string[] }) => {
        superAdminActorIds.clear();
        adminActorIds.clear();
        input.superAdminIds.forEach((id) => superAdminActorIds.add(id));
        input.adminIds.forEach((id) => adminActorIds.add(id));
      }),
      getOrCreate: vi.fn(async (actorId: string, displayName: string) => {
        const current = sessionUsers.get(actorId);
        if (current) {
          const updated = { ...current, displayName, role: resolveRole(actorId) };
          sessionUsers.set(actorId, updated);
          return updated;
        }

        const created = { actorId, displayName, role: resolveRole(actorId), sessionVersion: 1 };
        sessionUsers.set(actorId, created);
        return created;
      }),
      get: vi.fn(async (actorId: string) => {
        return sessionUsers.get(actorId) ?? null;
      }),
      rotate: vi.fn(async (actorId: string) => {
        const current = sessionUsers.get(actorId);
        if (!current) {
          return null;
        }

        const rotated = { ...current, sessionVersion: current.sessionVersion + 1 };
        sessionUsers.set(actorId, rotated);
        return rotated;
      })
    }
  };
});

vi.mock("./service", () => ({
  createProject: vi.fn(),
  listProjects: vi.fn(),
  getProjectById: vi.fn(),
  addUseCase: vi.fn(),
  generateEstimate: vi.fn(),
  listUseCasesByProject: vi.fn(),
  listProjectEstimations: vi.fn(),
  listAgentRoles: vi.fn(),
  createAgentRole: vi.fn(),
  updateAgentRole: vi.fn(),
  deleteAgentRole: vi.fn()
}));

import * as service from "./service";
import { app } from "../../app";

const mockedService = vi.mocked(service);

const loginAs = async (actorId = "qa-superadmin") => {
  const response = await request(app).post("/auth/login").send({
    actorId,
    displayName: "QA Superadmin",
    password: "dev-pass-123"
  });

  expect(response.status).toBe(200);
  return response.body.accessToken as string;
};

describe("projects routes integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionUsers.clear();
  });

  it("logs in and returns an auth token", async () => {
    const response = await request(app).post("/auth/login").send({
      actorId: "qa-user",
      displayName: "QA User",
      password: "dev-pass-123"
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        tokenType: "Bearer",
        actor: expect.objectContaining({
          id: "qa-user",
          displayName: "QA User",
          role: expect.any(String)
        })
      })
    );
  });

  it("refreshes token pair from refresh token", async () => {
    const loginResponse = await request(app).post("/auth/login").send({
      actorId: "qa-user",
      displayName: "QA User",
      password: "dev-pass-123"
    });

    const refreshResponse = await request(app).post("/auth/refresh").send({
      refreshToken: loginResponse.body.refreshToken
    });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        tokenType: "Bearer",
        actor: expect.objectContaining({
          id: "qa-user",
          displayName: "QA User",
          role: expect.any(String)
        })
      })
    );
  });

  it("revokes refresh token after logout", async () => {
    const loginResponse = await request(app).post("/auth/login").send({
      actorId: "qa-user-revoke",
      displayName: "QA User Revoke",
      password: "dev-pass-123"
    });

    const logoutResponse = await request(app)
      .post("/auth/logout")
      .set("authorization", `Bearer ${loginResponse.body.accessToken}`)
      .send();

    expect(logoutResponse.status).toBe(204);

    const refreshResponse = await request(app).post("/auth/refresh").send({
      refreshToken: loginResponse.body.refreshToken
    });

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.message).toBe("Refresh token invalido o revocado");
  });

  it("returns health status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  it("propagates request id and includes it in error responses", async () => {
    const accessToken = await loginAs();
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    mockedService.getProjectById.mockRejectedValueOnce(error);

    const response = await request(app)
      .get("/projects/missing")
      .set("authorization", `Bearer ${accessToken}`)
      .set("x-request-id", "req-test-123");

    expect(response.status).toBe(404);
    expect(response.headers["x-request-id"]).toBe("req-test-123");
    expect(response.body.requestId).toBe("req-test-123");
  });

  it("returns telemetry snapshot", async () => {
    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        requestsTotal: expect.any(Number),
        requestsByStatus: expect.objectContaining({
          "1xx": expect.any(Number),
          "2xx": expect.any(Number),
          "3xx": expect.any(Number),
          "4xx": expect.any(Number),
          "5xx": expect.any(Number)
        }),
        estimationRunsTotal: expect.any(Number),
        estimationFallbackTotal: expect.any(Number),
        estimationFallbackByReason: expect.any(Object)
      })
    );
  });

  it("creates a project", async () => {
    const accessToken = await loginAs();
    mockedService.createProject.mockResolvedValueOnce({
      id: "project-1",
      name: "Project 1",
      description: "A valid project description"
    } as never);

    const response = await request(app)
      .post("/projects")
      .set("authorization", `Bearer ${accessToken}`)
      .send({
        name: "Project 1",
        description: "A valid project description"
      });

    expect(response.status).toBe(201);
    expect(mockedService.createProject).toHaveBeenCalledWith(
      "qa-superadmin",
      expect.objectContaining({
        name: "Project 1",
        description: "A valid project description"
      })
    );
  });

  it("returns 404 when project detail is not found", async () => {
    const accessToken = await loginAs();
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    mockedService.getProjectById.mockRejectedValueOnce(error);

    const response = await request(app)
      .get("/projects/missing")
      .set("authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Project not found");
  });

  it("returns 404 when actor accesses a non-owned project", async () => {
    const accessToken = await loginAs();
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    mockedService.getProjectById.mockRejectedValueOnce(error);

    const response = await request(app)
      .get("/projects/project-owned-by-other")
      .set("authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Project not found");
    expect(mockedService.getProjectById).toHaveBeenCalledWith("qa-superadmin", "SUPERADMIN", "project-owned-by-other", undefined);
  });

  it("returns 404 when adding use case to unknown project", async () => {
    const accessToken = await loginAs();
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    mockedService.addUseCase.mockRejectedValueOnce(error);

    const response = await request(app)
      .post("/projects/missing/use-cases")
      .set("authorization", `Bearer ${accessToken}`)
      .send({
        title: "Checkout flow",
        description: "A valid use case description for checkout flow",
        priority: "HIGH"
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Project not found");
  });

  it("returns 400 when estimate payload has empty roles", async () => {
    const accessToken = await loginAs();
    const response = await request(app)
      .post("/projects/project-1/estimate")
      .set("authorization", `Bearer ${accessToken}`)
      .send({
        roles: []
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("triggers project estimation", async () => {
    const accessToken = await loginAs();
    mockedService.generateEstimate.mockResolvedValueOnce({
      id: "est-1",
      totalHours: 42
    } as never);

    const response = await request(app)
      .post("/projects/project-1/estimate")
      .set("authorization", `Bearer ${accessToken}`)
      .send({
        roles: ["backend-developer", "frontend-developer"],
        model: "gpt-4o-mini"
      });

    expect(response.status).toBe(200);
    expect(mockedService.generateEstimate).toHaveBeenCalledWith("qa-superadmin", "SUPERADMIN", "project-1", {
      roles: ["backend-developer", "frontend-developer"],
      model: "gpt-4o-mini"
    });
  });

  it("returns project estimation history", async () => {
    const accessToken = await loginAs();
    mockedService.listProjectEstimations.mockResolvedValueOnce([
      {
        id: "est-2",
        version: 2,
        totalHours: 45,
        totalCost: 2050
      }
    ] as never);

    const response = await request(app)
      .get("/projects/project-1/estimations")
      .set("authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(mockedService.listProjectEstimations).toHaveBeenCalledWith("qa-superadmin", "SUPERADMIN", "project-1");
    expect(response.body).toEqual([
      expect.objectContaining({
        id: "est-2",
        version: 2
      })
    ]);
  });
});