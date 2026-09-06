import { WorkOrderIntakeMode } from '../constants/intake-mode';

export function deriveIntakeMode(
  broughtByName: string | null | undefined,
): WorkOrderIntakeMode {
  return broughtByName != null && broughtByName.trim() !== ''
    ? WorkOrderIntakeMode.THIRD_PARTY
    : WorkOrderIntakeMode.OWNER;
}

export function normalizeBroughtByPhone(
  phone: string | null | undefined,
): string | null {
  if (phone === null || phone === undefined) {
    return null;
  }

  const trimmed = phone.trim();
  return trimmed === '' ? null : trimmed;
}

export function normalizeBroughtByName(
  name: string | null | undefined,
): string | null {
  if (name === null || name === undefined) {
    return null;
  }

  const trimmed = name.trim();
  return trimmed === '' ? null : trimmed;
}
