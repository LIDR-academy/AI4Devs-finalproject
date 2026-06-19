import { z } from 'zod';

const VALID_DISTANCES = ['5K', '10K', 'half-marathon', 'marathon', 'ultra'] as const;
const VALID_SURFACES = ['road', 'trail', 'track', 'mixed'] as const;
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const VALID_OBJECTIVES = ['training', 'competition', 'recovery', 'daily'] as const;
const VALID_CATEGORIES = ['shoes', 'clothing', 'accessories'] as const;

function toArrayEnum<T extends string>(valid: readonly T[]) {
  return z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v): T[] => {
      const arr = Array.isArray(v) ? v : v ? [v] : [];
      return arr.filter((x): x is T => (valid as readonly string[]).includes(x));
    });
}

function toEnumOrUndefined<T extends string>(valid: readonly T[]) {
  return z
    .string()
    .optional()
    .transform((v): T | undefined =>
      v !== undefined && (valid as readonly string[]).includes(v) ? (v as T) : undefined,
    );
}

function toNonNegativeNumberOrUndefined() {
  return z
    .string()
    .optional()
    .transform((v): number | undefined => {
      if (v === undefined) return undefined;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? n : undefined;
    });
}

export const productFilterSchema = z
  .object({
    distance: toArrayEnum(VALID_DISTANCES),
    surface: toArrayEnum(VALID_SURFACES),
    level: toArrayEnum(VALID_LEVELS),
    objective: toArrayEnum(VALID_OBJECTIVES),
    category: toEnumOrUndefined(VALID_CATEGORIES),
    priceMax: toNonNegativeNumberOrUndefined(),
  })
  .strip();

export type ProductFilterQuery = z.infer<typeof productFilterSchema>;

export const productIdSchema = z.object({ id: z.string().min(1).max(200) }).strict();

export type ProductIdParam = z.infer<typeof productIdSchema>;
