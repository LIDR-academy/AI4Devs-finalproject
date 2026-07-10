import { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const superAdminActorIds = new Set<string>();
const adminActorIds = new Set<string>();

const resolveRole = (actorId: string): UserRole => {
  if (superAdminActorIds.has(actorId)) {
    return UserRole.SUPERADMIN;
  }

  if (adminActorIds.has(actorId)) {
    return UserRole.ADMIN;
  }

  return UserRole.USER;
};

const mapTeam = (team: {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    actorId: string;
    displayName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }>;
}) => {
  return {
    id: team.id,
    name: team.name,
    createdBy: team.createdBy,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    members: team.members
  };
};

export const authSessionStore = {
  configureRoleMapping(input: { superAdminIds: string[]; adminIds: string[] }) {
    superAdminActorIds.clear();
    adminActorIds.clear();

    input.superAdminIds.forEach((id) => superAdminActorIds.add(id));
    input.adminIds.forEach((id) => adminActorIds.add(id));
  },

  async getOrCreate(actorId: string, displayName: string) {
    const mappedRole = resolveRole(actorId);

    return prisma.authUser.upsert({
      where: { actorId },
      update: {
        displayName,
        role: mappedRole
      },
      create: {
        actorId,
        displayName,
        role: mappedRole,
        sessionVersion: 1
      }
    });
  },

  async get(actorId: string) {
    return prisma.authUser.findUnique({
      where: { actorId }
    });
  },

  async rotate(actorId: string) {
    const current = await prisma.authUser.findUnique({
      where: { actorId }
    });

    if (!current) {
      return null;
    }

    return prisma.authUser.update({
      where: { actorId },
      data: {
        sessionVersion: {
          increment: 1
        }
      }
    });
  },

  async listUsers() {
    return prisma.authUser.findMany({
      orderBy: [{ actorId: "asc" }]
    });
  },

  async setUserRole(actorId: string, role: UserRole) {
    const existing = await prisma.authUser.findUnique({
      where: { actorId }
    });

    if (!existing) {
      return null;
    }

    superAdminActorIds.delete(actorId);
    adminActorIds.delete(actorId);

    if (role === "SUPERADMIN") {
      superAdminActorIds.add(actorId);
    }

    if (role === "ADMIN") {
      adminActorIds.add(actorId);
    }

    return prisma.authUser.update({
      where: { actorId },
      data: {
        role,
        sessionVersion: {
          increment: 1
        }
      }
    });
  },

  async assignProject(projectId: string, actorId: string) {
    await prisma.projectMember.upsert({
      where: {
        projectId_actorId: {
          projectId,
          actorId
        }
      },
      update: {},
      create: {
        projectId,
        actorId
      }
    });

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      orderBy: [{ actorId: "asc" }],
      select: { actorId: true }
    });

    return members.map((member) => member.actorId);
  },

  async unassignProject(projectId: string, actorId: string) {
    await prisma.projectMember.deleteMany({
      where: {
        projectId,
        actorId
      }
    });

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      orderBy: [{ actorId: "asc" }],
      select: { actorId: true }
    });

    return members.map((member) => member.actorId);
  },

  async getAssignedProjectIds(actorId: string) {
    const assignments = await prisma.projectMember.findMany({
      where: { actorId },
      orderBy: [{ updatedAt: "desc" }],
      select: { projectId: true }
    });

    return assignments.map((assignment) => assignment.projectId);
  },

  async isAssignedToProject(projectId: string, actorId: string) {
    const count = await prisma.projectMember.count({
      where: {
        projectId,
        actorId
      }
    });

    return count > 0;
  },

  async listProjectAssignments(projectId: string) {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      orderBy: [{ actorId: "asc" }],
      select: { actorId: true }
    });

    return members.map((member) => member.actorId);
  },

  async createTeam(input: { name: string; createdBy: string }) {
    const team = await prisma.team.create({
      data: {
        name: input.name,
        createdBy: input.createdBy
      },
      include: {
        members: {
          orderBy: [{ actorId: "asc" }]
        }
      }
    });

    return mapTeam(team);
  },

  async listTeams() {
    const list = await prisma.team.findMany({
      include: {
        members: {
          orderBy: [{ actorId: "asc" }]
        }
      },
      orderBy: [{ updatedAt: "desc" }]
    });

    return list.map(mapTeam);
  },

  async addTeamMember(teamId: string, actorId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      return null;
    }

    const identity = await prisma.authUser.upsert({
      where: { actorId },
      update: {},
      create: {
        actorId,
        displayName: actorId,
        role: resolveRole(actorId),
        sessionVersion: 1
      }
    });

    await prisma.teamMember.upsert({
      where: {
        teamId_actorId: {
          teamId,
          actorId
        }
      },
      update: {
        displayName: identity.displayName,
        role: identity.role
      },
      create: {
        teamId,
        actorId,
        displayName: identity.displayName,
        role: identity.role
      }
    });

    const hydrated = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          orderBy: [{ actorId: "asc" }]
        }
      }
    });

    if (!hydrated) {
      return null;
    }

    return mapTeam(hydrated);
  }
};
