import * as repository from "./repository";
import {
  AddUseCaseInput,
  AssignProjectMemberInput,
  CreateAgentRoleInput,
  CreateProjectInput,
  CreateTeamInput,
  GenerateEstimateInput,
  InviteTeamMemberInput,
  UpdateAgentRoleInput
} from "./types";
import { env } from "../../config/env";
import { getBaseEstimationInputs } from "./estimation/shared";
import { generateHeuristicEstimate } from "./estimation/heuristic";
import { generateAzureEstimate } from "./estimation/azure";
import { telemetry } from "../../lib/telemetry";
import { authSessionStore } from "../auth/session-store";

type ActorRole = "SUPERADMIN" | "ADMIN" | "USER";

const ensureProjectAccess = async (actorId: string, actorRole: ActorRole, projectId: string) => {
  if (actorRole === "SUPERADMIN" || actorRole === "ADMIN") {
    return true;
  }

  return authSessionStore.isAssignedToProject(projectId, actorId);
};

export const createProject = async (actorId: string, input: CreateProjectInput) => {
  return repository.createProject(input, actorId);
};

export const listProjects = async (actorId: string, actorRole: ActorRole) => {
  if (actorRole === "USER") {
    const assignedProjectIds = await authSessionStore.getAssignedProjectIds(actorId);
    return repository.listProjectsByIds(assignedProjectIds);
  }

  return repository.listAllProjects();
};

export const getProjectById = async (actorId: string, actorRole: ActorRole, id: string, estimationVersion?: number) => {
  const hasAccess = await ensureProjectAccess(actorId, actorRole, id);

  if (!hasAccess) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const project = await repository.getProjectByIdUnscoped(id);

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const { estimations, ...projectBase } = project;
  let estimation = estimations[0] ?? null;

  if (estimationVersion) {
    const projectWithRequestedVersion =
      actorRole === "USER"
        ? await repository.getProjectEstimationByVersionUnscoped(id, estimationVersion)
        : await repository.getProjectEstimationByVersionUnscoped(id, estimationVersion);
    const requestedEstimation = projectWithRequestedVersion?.estimations[0] ?? null;

    if (!requestedEstimation) {
      const error = new Error("Estimation version not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    estimation = requestedEstimation;
  }

  if (!estimation) {
    return {
      ...projectBase,
      estimation: null,
      summary: null
    };
  }

  const hoursByRole = estimation.phases
    .flatMap((phase) => phase.roleEstimates)
    .reduce<Record<string, number>>((acc, roleEstimate) => {
      const current = acc[roleEstimate.role] ?? 0;
      acc[roleEstimate.role] = Math.round((current + roleEstimate.hours) * 10) / 10;
      return acc;
    }, {});

  const totalTokens = estimation.tokens.reduce((acc, token) => acc + token.tokens, 0);
  const tokenCost = Math.round(estimation.tokens.reduce((acc, token) => acc + token.cost, 0) * 100) / 100;
  const laborCost = Math.round((estimation.totalCost - tokenCost) * 100) / 100;
  const averageHoursPerUseCase =
    project.useCases.length > 0
      ? Math.round((estimation.totalHours / project.useCases.length) * 10) / 10
      : 0;

  return {
    ...projectBase,
    estimation,
    summary: {
      useCaseCount: project.useCases.length,
      phaseCount: estimation.phases.length,
      roleCount: Object.keys(hoursByRole).length,
      totalTokens,
      tokenCost,
      laborCost,
      averageHoursPerUseCase,
      hoursByRole,
      generatedAt: estimation.updatedAt
    }
  };
};

export const listProjectEstimations = async (actorId: string, actorRole: ActorRole, projectId: string) => {
  const hasAccess = await ensureProjectAccess(actorId, actorRole, projectId);

  if (!hasAccess) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const project =
    actorRole === "USER"
      ? await repository.getProjectForEstimationUnscoped(projectId)
      : await repository.getProjectForEstimation(projectId, actorId);

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return repository.listProjectEstimationsUnscoped(projectId);
};

export const listUseCasesByProject = async (actorId: string, actorRole: ActorRole) => {
  if (actorRole === "USER") {
    const assignedProjectIds = await authSessionStore.getAssignedProjectIds(actorId);
    return repository.listUseCasesByProjectIds(assignedProjectIds);
  }

  return repository.listUseCasesByProjectUnscoped();
};

export const addUseCase = async (actorId: string, actorRole: ActorRole, projectId: string, input: AddUseCaseInput) => {
  const hasAccess = await ensureProjectAccess(actorId, actorRole, projectId);

  if (!hasAccess) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const exists = Boolean(await repository.getProjectByIdUnscoped(projectId));

  if (!exists) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return repository.createUseCase(projectId, input);
};

const slugifyRoleKey = (value: string) => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const listAgentRoles = async () => {
  return repository.listAgentRoles();
};

export const createAgentRole = async (input: CreateAgentRoleInput) => {
  const key = slugifyRoleKey(input.key?.trim() || input.name);

  if (!key) {
    const error = new Error("Role key could not be generated") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  return repository.createAgentRole({
    ...input,
    key
  });
};

export const updateAgentRole = async (roleId: string, input: UpdateAgentRoleInput) => {
  const role = await repository.getAgentRoleById(roleId);

  if (!role) {
    const error = new Error("Agent role not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const normalizedKey = input.key ? slugifyRoleKey(input.key) : undefined;

  return repository.updateAgentRole(roleId, {
    ...input,
    key: normalizedKey
  });
};

export const deleteAgentRole = async (roleId: string) => {
  const role = await repository.getAgentRoleById(roleId);

  if (!role) {
    const error = new Error("Agent role not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return repository.deleteAgentRole(roleId);
};

export const generateEstimate = async (
  actorId: string,
  actorRole: ActorRole,
  projectId: string,
  input: GenerateEstimateInput
) => {
  const hasAccess = await ensureProjectAccess(actorId, actorRole, projectId);

  if (!hasAccess) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const project = await repository.getProjectForEstimationUnscoped(projectId);

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  if (project.useCases.length === 0) {
    const error = new Error("At least one use case is required to run estimation") as Error & {
      statusCode: number;
    };
    error.statusCode = 400;
    throw error;
  }

  const { selectedRoles } = getBaseEstimationInputs(project, input);
  const activeRoles = await repository.listActiveAgentRoles();
  const activeRoleByKey = new Map(activeRoles.map((role) => [role.key, role.name]));
  const resolvedRoleNames = selectedRoles.map((roleKey) => activeRoleByKey.get(roleKey)).filter(Boolean) as string[];

  if (resolvedRoleNames.length === 0) {
    const error = new Error("At least one valid role is required") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  const resolvedInput: GenerateEstimateInput = {
    ...input,
    roles: resolvedRoleNames
  };

  const azureConfigured = Boolean(env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY && env.AZURE_OPENAI_DEPLOYMENT);
  let fallbackReason = !env.AZURE_OPENAI_ENABLED
    ? "azure-disabled"
    : azureConfigured
      ? "azure-request-failed-or-invalid-output"
      : "azure-misconfigured";

  let estimation = null;

  try {
    estimation = await generateAzureEstimate(project, resolvedInput);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      JSON.stringify({
        level: "warn",
        message: "estimation.azure_failed",
        projectId,
        actorId,
        error: errorMessage
      })
    );
    fallbackReason = "azure-request-failed-or-invalid-output";
    estimation = null;
  }

  const resolvedEstimation = estimation ?? generateHeuristicEstimate(project, resolvedInput, fallbackReason);
  const usedFallback = estimation === null;

  telemetry.recordEstimationRun({
    usedFallback,
    fallbackReason: usedFallback ? fallbackReason : undefined
  });

  console.info(
    JSON.stringify({
      level: "info",
      message: "estimation.completed",
      projectId,
      actorId,
      usedFallback,
      fallbackReason: usedFallback ? fallbackReason : null,
      totalHours: resolvedEstimation.totalHours,
      totalCost: resolvedEstimation.totalCost
    })
  );

  return repository.createEstimationVersion({
    projectId,
    totalHours: resolvedEstimation.totalHours,
    totalCost: resolvedEstimation.totalCost,
    assumptions: resolvedEstimation.assumptions,
    risks: resolvedEstimation.risks,
    phases: resolvedEstimation.phases,
    token: resolvedEstimation.token
  });
};

export const assignProjectMember = async (actorId: string, actorRole: ActorRole, projectId: string, input: AssignProjectMemberInput) => {
  if (actorRole === "USER") {
    const error = new Error("Forbidden: insufficient permissions") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  const project = await repository.getProjectByIdUnscoped(projectId);

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  await authSessionStore.getOrCreate(input.actorId, input.actorId);

  return {
    projectId,
    members: await authSessionStore.assignProject(projectId, input.actorId)
  };
};

export const unassignProjectMember = async (actorId: string, actorRole: ActorRole, projectId: string, targetActorId: string) => {
  if (actorRole === "USER") {
    const error = new Error("Forbidden: insufficient permissions") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  const project = await repository.getProjectByIdUnscoped(projectId);

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return {
    projectId,
    members: await authSessionStore.unassignProject(projectId, targetActorId)
  };
};

export const listProjectMembers = async (actorId: string, actorRole: ActorRole, projectId: string) => {
  if (actorRole === "USER") {
    const error = new Error("Forbidden: insufficient permissions") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  const project = await repository.getProjectByIdUnscoped(projectId);

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return {
    projectId,
    members: await authSessionStore.listProjectAssignments(projectId)
  };
};

export const listUsers = async (actorRole: ActorRole) => {
  if (actorRole !== "SUPERADMIN") {
    const error = new Error("Forbidden: insufficient permissions") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  return authSessionStore.listUsers();
};

export const updateUserRole = async (
  actorRole: ActorRole,
  targetActorId: string,
  role: "SUPERADMIN" | "ADMIN" | "USER"
) => {
  if (actorRole !== "SUPERADMIN") {
    const error = new Error("Forbidden: insufficient permissions") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  const updated = await authSessionStore.setUserRole(targetActorId, role);

  if (!updated) {
    const error = new Error("User not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return updated;
};

export const createTeam = async (actorId: string, actorRole: ActorRole, input: CreateTeamInput) => {
  if (actorRole === "USER") {
    const error = new Error("Forbidden: insufficient permissions") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  return authSessionStore.createTeam({
    name: input.name,
    createdBy: actorId
  });
};

export const listTeams = async (actorRole: ActorRole) => {
  if (actorRole === "USER") {
    const error = new Error("Forbidden: insufficient permissions") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  return authSessionStore.listTeams();
};

export const inviteTeamMember = async (
  actorRole: ActorRole,
  teamId: string,
  input: InviteTeamMemberInput
) => {
  if (actorRole === "USER") {
    const error = new Error("Forbidden: insufficient permissions") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  await authSessionStore.getOrCreate(input.actorId, input.actorId);
  const team = await authSessionStore.addTeamMember(teamId, input.actorId);

  if (!team) {
    const error = new Error("Team not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return team;
};
