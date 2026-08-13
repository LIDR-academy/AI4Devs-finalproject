export function formatMileage(mileage: number | null | undefined): string {
  if (mileage === null || mileage === undefined) {
    return 'Sin registrar';
  }

  return `${mileage.toLocaleString('es-CR')} km`;
}
