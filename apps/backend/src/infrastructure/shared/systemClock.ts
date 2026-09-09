import { Clock } from '../../domain/shared/Clock.js';

/** Reloj real del sistema. `Date` se serializa siempre en UTC vía `toISOString()`. */
export const systemClock: Clock = {
  now: () => new Date(),
};
