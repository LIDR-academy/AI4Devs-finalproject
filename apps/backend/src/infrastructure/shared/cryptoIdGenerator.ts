import { randomUUID } from 'node:crypto';
import { IdGenerator } from '../../domain/shared/IdGenerator.js';

/** Genera ids `<prefijo>-<uuid v4>` — sin colisión por milisegundo. */
export const cryptoIdGenerator: IdGenerator = {
  next: (prefix: string) => `${prefix}-${randomUUID()}`,
};
