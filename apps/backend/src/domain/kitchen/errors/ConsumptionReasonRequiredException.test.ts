import { describe, it, expect } from 'vitest';
import { ConsumptionReasonRequiredException } from './ConsumptionReasonRequiredException.js';
import { DomainError } from '../../errors/DomainError.js';

describe('ConsumptionReasonRequiredException (ADR-004 / TK-109)', () => {
  it('es un DomainError con statusCode 400', () => {
    const err = new ConsumptionReasonRequiredException('rem-1');
    expect(err).toBeInstanceOf(DomainError);
    expect(err.statusCode).toBe(400);
  });

  it('el mensaje incluye el remanenteId recibido', () => {
    const err = new ConsumptionReasonRequiredException('rem-xyz-123');
    expect(err.message).toContain('rem-xyz-123');
  });

  it('el mensaje menciona la varianza negativa', () => {
    const err = new ConsumptionReasonRequiredException('rem-1');
    expect(err.message).toMatch(/varianza negativa/i);
  });

  it('el name coincide con el nombre de la clase', () => {
    const err = new ConsumptionReasonRequiredException('rem-1');
    expect(err.name).toBe('ConsumptionReasonRequiredException');
  });
});
