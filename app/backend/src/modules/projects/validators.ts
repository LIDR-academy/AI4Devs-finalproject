import { Complexity, Priority } from "@prisma/client";
import { z } from "zod";

export const projectIdSchema = z.object({
  id: z.string().min(1)
});

export const projectEstimationQuerySchema = z.object({
  version: z.coerce.number().int().positive().optional()
});

export const agentRoleIdSchema = z.object({
  roleId: z.string().min(1)
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(4000),
  complexity: z.nativeEnum(Complexity).optional(),
  useCases: z.array(
    z.object({
      title: z.string().trim().min(3).max(200),
      description: z.string().trim().min(10).max(4000),
      priority: z.nativeEnum(Priority).optional()
    })
  ).optional()
});

export const addUseCaseSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(4000),
  priority: z.nativeEnum(Priority).optional()
});

export const estimateProjectSchema = z.object({
  roles: z.array(z.string().trim().min(2).max(80)).min(1),
  model: z.string().trim().min(2).max(120).optional()
});

export const createAgentRoleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  key: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(300).optional()
});

export const updateAgentRoleSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    key: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().max(300).optional(),
    isActive: z.boolean().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required"
  });

export const assignProjectMemberSchema = z.object({
  actorId: z.string().trim().min(3).max(80)
});

export const createTeamSchema = z.object({
  name: z.string().trim().min(3).max(120)
});

export const inviteTeamMemberSchema = z.object({
  actorId: z.string().trim().min(3).max(80)
});

export const teamIdSchema = z.object({
  teamId: z.string().trim().min(1)
});

export const actorIdParamSchema = z.object({
  actorId: z.string().trim().min(3).max(80)
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["SUPERADMIN", "ADMIN", "USER"])
});
