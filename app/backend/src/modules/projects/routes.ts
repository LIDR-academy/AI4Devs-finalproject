import { Router } from "express";
import {
  addUseCaseSchema,
  agentRoleIdSchema,
  actorIdParamSchema,
  assignProjectMemberSchema,
  createAgentRoleSchema,
  createProjectSchema,
  createTeamSchema,
  estimateProjectSchema,
  inviteTeamMemberSchema,
  projectEstimationQuerySchema,
  projectIdSchema,
  teamIdSchema,
  updateUserRoleSchema,
  updateAgentRoleSchema
} from "./validators";
import * as service from "./service";
import { requireRoles } from "../../middlewares/authorization";

export const projectsRouter = Router();

projectsRouter.post("/", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const payload = createProjectSchema.parse(req.body);
    const project = await service.createProject(req.actorId!, payload);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/", async (req, res, next) => {
  try {
    const projects = await service.listProjects(req.actorId!, req.actorRole!);
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/use-cases", async (req, res, next) => {
  try {
    const useCases = await service.listUseCasesByProject(req.actorId!, req.actorRole!);
    res.status(200).json(useCases);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/agent-roles", async (_req, res, next) => {
  try {
    const roles = await service.listAgentRoles();
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/agent-roles", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const payload = createAgentRoleSchema.parse(req.body);
    const role = await service.createAgentRole(payload);
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
});

projectsRouter.put("/agent-roles/:roleId", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const { roleId } = agentRoleIdSchema.parse(req.params);
    const payload = updateAgentRoleSchema.parse(req.body);
    const role = await service.updateAgentRole(roleId, payload);
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete("/agent-roles/:roleId", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const { roleId } = agentRoleIdSchema.parse(req.params);
    await service.deleteAgentRole(roleId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/users", requireRoles(["SUPERADMIN"]), async (req, res, next) => {
  try {
    const users = await service.listUsers(req.actorRole!);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

projectsRouter.put("/users/:actorId/role", requireRoles(["SUPERADMIN"]), async (req, res, next) => {
  try {
    const { actorId } = actorIdParamSchema.parse(req.params);
    const payload = updateUserRoleSchema.parse(req.body);

    const updated = await service.updateUserRole(req.actorRole!, actorId, payload.role);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/teams", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const payload = createTeamSchema.parse(req.body);
    const team = await service.createTeam(req.actorId!, req.actorRole!, payload);
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/teams", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const teams = await service.listTeams(req.actorRole!);
    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/teams/:teamId/members", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const { teamId } = teamIdSchema.parse(req.params);
    const payload = inviteTeamMemberSchema.parse(req.body);
    const team = await service.inviteTeamMember(req.actorRole!, teamId, payload);
    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/members", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const payload = assignProjectMemberSchema.parse(req.body);
    const members = await service.assignProjectMember(req.actorId!, req.actorRole!, id, payload);
    res.status(200).json(members);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:id/members", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const members = await service.listProjectMembers(req.actorId!, req.actorRole!, id);
    res.status(200).json(members);
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete("/:id/members/:actorId", requireRoles(["SUPERADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const { actorId } = actorIdParamSchema.parse(req.params);
    const members = await service.unassignProjectMember(req.actorId!, req.actorRole!, id, actorId);
    res.status(200).json(members);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:id/estimations", async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const estimations = await service.listProjectEstimations(req.actorId!, req.actorRole!, id);
    res.status(200).json(estimations);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const { version } = projectEstimationQuerySchema.parse(req.query);
    const project = await service.getProjectById(req.actorId!, req.actorRole!, id, version);
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/use-cases", async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const payload = addUseCaseSchema.parse(req.body);
    const useCase = await service.addUseCase(req.actorId!, req.actorRole!, id, payload);
    res.status(201).json(useCase);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/estimate", async (req, res, next) => {
  try {
    const { id } = projectIdSchema.parse(req.params);
    const payload = estimateProjectSchema.parse(req.body);
    const estimation = await service.generateEstimate(req.actorId!, req.actorRole!, id, payload);
    res.status(200).json(estimation);
  } catch (error) {
    next(error);
  }
});
