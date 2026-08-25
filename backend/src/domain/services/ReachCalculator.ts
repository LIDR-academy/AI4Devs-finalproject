export function isWithinReach(coacheeSortOrder: number, classSortOrder: number): boolean {
  return Math.abs(coacheeSortOrder - classSortOrder) <= 1;
}
