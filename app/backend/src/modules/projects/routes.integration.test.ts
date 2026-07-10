import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./service", () => ({
  createProject: vi.fn(),
  listProjects: vi.fn(),
  getProjectById: vi.fn(),
  addUseCase: vi.fn(),
  generateEstimate: vi.fn()
}));

import * as service from "./service";
import { app } from "../../app";

const mockedService = vi.mocked(service);

describe("projects routes integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns health status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("creates a project", async () => {
    mockedService.createProject.mockResolvedValueOnce({
      id: "project-1",
      name: "Project 1",
      description: "A valid project description"
    } as never);

    const response = await request(app).post("/projects").send({
      name: "Project 1",
      description: "A valid project description"
    });

    expect(response.status).toBe(201);
    expect(mockedService.createProject).toHaveBeenCalled();
  });

  it("returns 404 when project detail is not found", async () => {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    mockedService.getProjectById.mockRejectedValueOnce(error);

    const response = await request(app).get("/projects/missing");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Project not found");
  });

  it("triggers project estimation", async () => {
    mockedService.generateEstimate.mockResolvedValueOnce({
      id: "est-1",
      totalHours: 42
    } as never);

    const response = await request(app).post("/projects/project-1/estimate").send({
      roles: ["backend-developer", "frontend-developer"],
      model: "gpt-4o-mini"
    });

    expect(response.status).toBe(200);
    expect(mockedService.generateEstimate).toHaveBeenCalledWith("project-1", {
      roles: ["backend-developer", "frontend-developer"],
      model: "gpt-4o-mini"
    });
  });
});