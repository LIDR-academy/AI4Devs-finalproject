import { describe, it, expect } from 'vitest';
import { InactiveConsumptionReasonException } from './InactiveConsumptionReasonException.js';
import { DomainError } from '../../errors/DomainError.js';

describe('InactiveConsumptionReasonException (ADR-004 / TK-108)', () => {
  it('es un DomainError con statusCode 400', () => {
    const err = new InactiveConsumptionReasonException('reason-1');
    expect(err).toBeInstanceOf(DomainError);
    expect(err.statusCode).toBe(400);
  });

  it('el mensaje incluye el reasonId recibido', () => {
    const err = new InactiveConsumptionReasonException('reason-xyz-123');
    expect(err.message).toContain('reason-xyz-123');
  });

  it('el mensaje explica que el motivo está desactivado', () => {
    const err = new InactiveConsumptionReasonException('reason-1');
    expect(err.message).toMatch(/desactivado/i);
  });

  it('el name coincide con el nombre de la clase', () => {
    const err = new InactiveConsumptionReasonException('reason-1');
    expect(err.name).toBe('InactiveConsumptionReasonException');
  });
});
