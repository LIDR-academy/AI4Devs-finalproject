import { z } from 'zod';

const VALID_DISTANCES = ['5K', '10K', 'half-marathon', 'marathon', 'ultra'] as const;
const VALID_SURFACES = ['road', 'trail', 'track', 'mixed'] as const;
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const VALID_OBJECTIVES = ['training', 'competition', 'recovery', 'daily'] as const;

function toArrayEnum<T extends string>(valid: readonly T[]) {
  return z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v): T[] => {
      const arr = Array.isArray(v) ? v : v ? [v] : [];
      return arr.filter((x): x is T => (valid as readonly string[]).includes(x));
    });
}

export const productFilterSchema = z
  .object({
    distance: toArrayEnum(VALID_DISTANCES),
    surface: toArrayEnum(VALID_SURFACES),
    level: toArrayEnum(VALID_LEVELS),
    objective: toArrayEnum(VALID_OBJECTIVES),
  })
  .strip();

export type ProductFilterQuery = z.infer<typeof productFilterSchema>;

export const productIdSchema = z.object({ id: z.string().uuid() }).strict();

export type ProductIdParam = z.infer<typeof productIdSchema>;
