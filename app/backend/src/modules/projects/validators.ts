import { Complexity, Priority } from "@prisma/client";
import { z } from "zod";

export const projectIdSchema = z.object({
  id: z.string().min(1)
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
