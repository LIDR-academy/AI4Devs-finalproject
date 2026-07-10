import { prisma } from "../../lib/prisma";
import { AddUseCaseInput, CreateProjectInput, SaveEstimationInput } from "./types";

export const createProject = (input: CreateProjectInput) => {
  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      complexity: input.complexity,
      useCases: input.useCases && input.useCases.length > 0
        ? {
            create: input.useCases.map((useCase) => ({
              title: useCase.title,
              description: useCase.description,
              priority: useCase.priority
            }))
          }
        : undefined
    },
    include: {
      useCases: true
    }
  });
};

export const listProjects = () => {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { useCases: true }
      }
    }
  });
};

export const getProjectById = (id: string) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      useCases: true,
      estimation: {
        include: {
          phases: {
            include: {
              roleEstimates: true
            },
            orderBy: { order: "asc" }
          },
          tokens: true
        }
      }
    }
  });
};

export const projectExists = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true }
  });

  return Boolean(project);
};

export const createUseCase = (projectId: string, input: AddUseCaseInput) => {
  return prisma.useCase.create({
    data: {
      projectId,
      title: input.title,
      description: input.description,
      priority: input.priority
    }
  });
};

export const getProjectForEstimation = (id: string) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      useCases: true
    }
  });
};

export const upsertEstimation = (input: SaveEstimationInput) => {
  return prisma.estimation.upsert({
    where: {
      projectId: input.projectId
    },
    create: {
      projectId: input.projectId,
      totalHours: input.totalHours,
      totalCost: input.totalCost,
      assumptions: input.assumptions,
      risks: input.risks,
      phases: {
        create: input.phases.map((phase) => ({
          name: phase.name,
          description: phase.description,
          order: phase.order,
          roleEstimates: {
            create: phase.roleEstimates.map((roleEstimate) => ({
              role: roleEstimate.role,
              hours: roleEstimate.hours
            }))
          }
        }))
      },
      tokens: {
        create: {
          model: input.token.model,
          tokens: input.token.tokens,
          cost: input.token.cost
        }
      }
    },
    update: {
      totalHours: input.totalHours,
      totalCost: input.totalCost,
      assumptions: input.assumptions,
      risks: input.risks,
      phases: {
        deleteMany: {},
        create: input.phases.map((phase) => ({
          name: phase.name,
          description: phase.description,
          order: phase.order,
          roleEstimates: {
            create: phase.roleEstimates.map((roleEstimate) => ({
              role: roleEstimate.role,
              hours: roleEstimate.hours
            }))
          }
        }))
      },
      tokens: {
        deleteMany: {},
        create: {
          model: input.token.model,
          tokens: input.token.tokens,
          cost: input.token.cost
        }
      }
    },
    include: {
      phases: {
        include: {
          roleEstimates: true
        },
        orderBy: { order: "asc" }
      },
      tokens: true
    }
  });
};
