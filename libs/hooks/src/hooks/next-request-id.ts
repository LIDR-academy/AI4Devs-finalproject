/** Monotonic request counter for in-flight async loads (staleness guard). */
export const nextRequestId = (current: number): number => current + 1;
