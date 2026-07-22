import { prisma } from "../../lib/prisma";
import { AddUseCaseInput, CreateAgentRoleInput, CreateProjectInput, SaveEstimationInput, UpdateAgentRoleInput } from "./types";

const defaultRoles: Array<{ key: string; name: string; description: string }> = [
  {
    key: "frontend-developer",
    name: "Frontend Developer",
    description: "Construye interfaces, estados de UI y experiencia de usuario."
  },
  {
    key: "backend-developer",
    name: "Backend Developer",
    description: "Implementa APIs, reglas de negocio y persistencia."
  },
  {
    key: "qa-engineer",
    name: "QA Engineer",
    description: "Define y ejecuta pruebas funcionales y de regresion."
  },
  {
    key: "devops-engineer",
    name: "DevOps Engineer",
    description: "Automatiza despliegues, pipelines y observabilidad."
  },
  {
    key: "security-reviewer",
    name: "Security Reviewer",
    description: "Evalua riesgos, controles de acceso y exposicion de datos."
  },
  {
    key: "product-owner",
    name: "Product Owner",
    description: "Prioriza alcance, requisitos y decisiones de negocio."
  }
];

export const createProject = (input: CreateProjectInput, ownerId: string) => {
  return prisma.project.create({
    data: {
      ownerId,
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

export const listProjects = (ownerId: string) => {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { useCases: true }
      }
    }
  });
};

export const listAllProjects = () => {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { useCases: true }
      }
    }
  });
};

export const listProjectsByIds = (ids: string[]) => {
  if (ids.length === 0) {
    return Promise.resolve([]);
  }

  return prisma.project.findMany({
    where: {
      id: {
        in: ids
      }
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { useCases: true }
      }
    }
  });
};

export const getProjectByIdUnscoped = (id: string) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      useCases: true,
      estimations: {
        orderBy: [{ version: "desc" }],
        include: {
          phases: {
            include: {
              roleEstimates: true
            },
            orderBy: { order: "asc" }
          },
          tokens: true
        },
        take: 1
      }
    }
  });
};

export const getProjectForEstimationUnscoped = (id: string) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      useCases: true
    }
  });
};

export const listProjectEstimationsUnscoped = (projectId: string) => {
  return prisma.estimation.findMany({
    where: {
      projectId
    },
    orderBy: [{ version: "desc" }],
    select: {
      id: true,
      version: true,
      totalHours: true,
      totalCost: true,
      createdAt: true,
      updatedAt: true,
      tokens: {
        select: {
          model: true,
          tokens: true,
          cost: true
        }
      }
    }
  });
};

export const getProjectEstimationByVersionUnscoped = (projectId: string, version: number) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      useCases: true,
      estimations: {
        where: { version },
        include: {
          phases: {
            include: {
              roleEstimates: true
            },
            orderBy: { order: "asc" }
          },
          tokens: true
        },
        take: 1
      }
    }
  });
};

export const listUseCasesByProjectIds = (projectIds: string[]) => {
  if (projectIds.length === 0) {
    return Promise.resolve([]);
  }

  return prisma.useCase.findMany({
    where: {
      projectId: {
        in: projectIds
      }
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      project: {
        select: {
          id: true,
          name: true,
          complexity: true
        }
      }
    }
  });
};

export const getProjectById = (id: string, ownerId: string) => {
  return prisma.project.findFirst({
    where: { id, ownerId },
    include: {
      useCases: true,
      estimations: {
        orderBy: [{ version: "desc" }],
        include: {
          phases: {
            include: {
              roleEstimates: true
            },
            orderBy: { order: "asc" }
          },
          tokens: true
        },
        take: 1
      }
    }
  });
};

export const listUseCasesByProject = (ownerId: string) => {
  return prisma.useCase.findMany({
    where: {
      project: {
        ownerId
      }
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      project: {
        select: {
          id: true,
          name: true,
          complexity: true
        }
      }
    }
  });
};

export const listUseCasesByProjectUnscoped = () => {
  return prisma.useCase.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      project: {
        select: {
          id: true,
          name: true,
          complexity: true
        }
      }
    }
  });
};

export const projectExists = async (id: string, ownerId: string) => {
  const project = await prisma.project.findFirst({
    where: { id, ownerId },
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

export const getProjectForEstimation = (id: string, ownerId: string) => {
  return prisma.project.findFirst({
    where: { id, ownerId },
    include: {
      useCases: true
    }
  });
};

export const getProjectEstimationByVersion = (projectId: string, version: number, ownerId: string) => {
  return prisma.project.findFirst({
    where: { id: projectId, ownerId },
    include: {
      useCases: true,
      estimations: {
        where: { version },
        include: {
          phases: {
            include: {
              roleEstimates: true
            },
            orderBy: { order: "asc" }
          },
          tokens: true
        },
        take: 1
      }
    }
  });
};

export const createEstimationVersion = (input: SaveEstimationInput) => {
  return prisma.$transaction(async (tx) => {
    const latest = await tx.estimation.findFirst({
      where: { projectId: input.projectId },
      orderBy: { version: "desc" },
      select: { version: true }
    });

    const nextVersion = (latest?.version ?? 0) + 1;

    return tx.estimation.create({
      data: {
        projectId: input.projectId,
        version: nextVersion,
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
  });
};

export const listProjectEstimations = (projectId: string, ownerId: string) => {
  return prisma.estimation.findMany({
    where: {
      projectId,
      project: {
        ownerId
      }
    },
    orderBy: [{ version: "desc" }],
    select: {
      id: true,
      version: true,
      totalHours: true,
      totalCost: true,
      createdAt: true,
      updatedAt: true,
      tokens: {
        select: {
          model: true,
          tokens: true,
          cost: true
        }
      }
    }
  });
};

export const ensureDefaultAgentRoles = async () => {
  await Promise.all(
    defaultRoles.map((role) =>
      prisma.agentRole.upsert({
        where: { key: role.key },
        create: role,
        update: {
          name: role.name,
          description: role.description,
          isActive: true
        }
      })
    )
  );
};

export const listAgentRoles = () => {
  return prisma.agentRole.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }]
  });
};

export const listActiveAgentRoles = () => {
  return prisma.agentRole.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });
};

export const createAgentRole = (input: CreateAgentRoleInput & { key: string }) => {
  return prisma.agentRole.create({
    data: {
      key: input.key,
      name: input.name,
      description: input.description,
      isActive: true
    }
  });
};

export const updateAgentRole = (roleId: string, input: UpdateAgentRoleInput & { key?: string }) => {
  return prisma.agentRole.update({
    where: { id: roleId },
    data: input
  });
};

export const deleteAgentRole = (roleId: string) => {
  return prisma.agentRole.delete({
    where: { id: roleId }
  });
};

export const getAgentRoleById = (roleId: string) => {
  return prisma.agentRole.findUnique({
    where: { id: roleId }
  });
};
