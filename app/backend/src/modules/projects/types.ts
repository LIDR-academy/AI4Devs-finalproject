import { Complexity, Priority } from "@prisma/client";

export type CreateProjectInput = {
  name: string;
  description: string;
  complexity?: Complexity;
  useCases?: {
    title: string;
    description: string;
    priority?: Priority;
  }[];
};

export type AddUseCaseInput = {
  title: string;
  description: string;
  priority?: Priority;
};

export type GenerateEstimateInput = {
  roles: string[];
  model?: string;
};

export type EstimationPhaseInput = {
  name: string;
  description: string;
  order: number;
  roleEstimates: {
    role: string;
    hours: number;
  }[];
};

export type SaveEstimationInput = {
  projectId: string;
  totalHours: number;
  totalCost: number;
  assumptions: string;
  risks: string;
  phases: EstimationPhaseInput[];
  token: {
    model: string;
    tokens: number;
    cost: number;
  };
};

export type ProjectEstimationContext = {
  id: string;
  name: string;
  description: string;
  complexity: Complexity;
  useCases: {
    id: string;
    title: string;
    description: string;
    priority: Priority;
  }[];
};

export type GeneratedEstimationOutput = {
  totalHours: number;
  totalCost: number;
  assumptions: string;
  risks: string;
  phases: EstimationPhaseInput[];
  token: {
    model: string;
    tokens: number;
    cost: number;
  };
};

export type CreateAgentRoleInput = {
  name: string;
  key?: string;
  description?: string;
};

export type UpdateAgentRoleInput = {
  name?: string;
  key?: string;
  description?: string;
  isActive?: boolean;
};

export type AssignProjectMemberInput = {
  actorId: string;
};

export type CreateTeamInput = {
  name: string;
};

export type InviteTeamMemberInput = {
  actorId: string;
};

export type UseCaseByProjectRow = {
  id: string;
  title: string;
  description: string;
  priority: string;
  createdAt: Date;
  project: {
    id: string;
    name: string;
    complexity: string;
  };
};
