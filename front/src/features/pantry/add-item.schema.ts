import { z } from "zod";
import { PANTRY_UNITS } from "./pantry.api";

/**
 * Client-side validation schema for the manual add-item form. Mirrors the
 * backend CreatePantryItemDto (name, quantity, unit, optional expirationDate,
 * optional pricePaid) so client and server stay in sync.
 *
 * Field-level messages are intentionally short and actionable.
 */
export const addItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number." })
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
  unit: z.enum(PANTRY_UNITS),
  expirationDate: z.string().trim().min(1).optional(),
  unitPrice: z
    .number({ invalid_type_error: "Price must be a number." })
    .min(0, "Price must be 0 or more.")
    .optional(),
  pricePaid: z
    .number({ invalid_type_error: "Price must be a number." })
    .min(0, "Price must be 0 or more.")
    .optional(),
});

export type AddItemInput = z.input<typeof addItemSchema>;
export type AddItemValues = z.output<typeof addItemSchema>;

export type AddItemField = keyof AddItemInput;
export type AddItemErrors = Partial<Record<AddItemField, string>>;

export interface AddItemValidationResult {
  success: boolean;
  values?: AddItemValues;
  errors: AddItemErrors;
}

/**
 * Validates raw form input and returns the first error per field, so the UI can
 * render field-level messages. On success, `values` holds the parsed, trimmed
 * and correctly-typed data ready for the API payload.
 */
export function validateAddItem(input: AddItemInput): AddItemValidationResult {
  const parsed = addItemSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, values: parsed.data, errors: {} };
  }

  const errors: AddItemErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as AddItemField | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { success: false, errors };
}
