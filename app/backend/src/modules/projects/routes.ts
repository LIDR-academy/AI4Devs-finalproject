import { Router } from "express";
import { addUseCaseSchema, createProjectSchema, estimateProjectSchema, projectIdSchema } from "./validators";
import * as service from "./service";

export const projectsRouter = Router();

projectsRouter.post("/", async (req, res, next) => {
  try {
    const payload = createProjectSchema.parse(req.body);
    const project = await service.createProject(payload);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/", async (_req, res, next) => {
  try {
    const projects = await service.listProjects();
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const project = await service.getProjectById(id);
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/use-cases", async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const payload = addUseCaseSchema.parse(req.body);
    const useCase = await service.addUseCase(id, payload);
    res.status(201).json(useCase);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/estimate", async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const payload = estimateProjectSchema.parse(req.body);
    const estimation = await service.generateEstimate(id, payload);
    res.status(200).json(estimation);
  } catch (error) {
    next(error);
  }
});
