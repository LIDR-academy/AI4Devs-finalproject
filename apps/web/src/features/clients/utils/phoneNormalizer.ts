export function normalizePhoneInput(value: string): string {
  return value.replace(/\D/g, '');
}
