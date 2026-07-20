/** Client-side validation for the start flow, mirroring the server's rules (design D-P4).
 *  Length is counted in Unicode code points to match streamer's RuneCountInString (design D-P3). */

/** Maximum `description` length, in Unicode code points. Agreed cross-scope (design D-P3). */
export const DESCRIPTION_MAX_CODE_POINTS = 100;

/** Count Unicode code points, not UTF-16 units — `[...str]` iterates by code point. */
export function countCodePoints(value: string): number {
  return [...value].length;
}

export type RequiredValidation =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly error: "empty" };

/** Validate a required text field: non-empty after trimming. Returns the trimmed value. */
export function validateRequired(raw: string): RequiredValidation {
  const value = raw.trim();
  if (value.length === 0) {
    return { ok: false, error: "empty" };
  }
  return { ok: true, value };
}

export type DescriptionValidation =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly error: "too-long" };

/** Validate the optional description: at most DESCRIPTION_MAX_CODE_POINTS code points. */
export function validateDescription(raw: string): DescriptionValidation {
  if (countCodePoints(raw) > DESCRIPTION_MAX_CODE_POINTS) {
    return { ok: false, error: "too-long" };
  }
  return { ok: true, value: raw };
}
