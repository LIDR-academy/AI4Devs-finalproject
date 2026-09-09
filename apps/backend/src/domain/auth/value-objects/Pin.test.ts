import { describe, it, expect } from 'vitest';
import { Pin } from './Pin.js';

describe('Pin Value Object — Salt por Usuario', () => {
  it('debe generar hashes distintos para el mismo PIN en instancias distintas (salt aleatorio, no estático)', () => {
    // Given dos usuarios eligen el mismo PIN
    const pinA = Pin.createFromRaw('1234');
    const pinB = Pin.createFromRaw('1234');

    // Then sus hashes almacenados deben ser diferentes (nunca deben coincidir por un salt compartido)
    expect(pinA.getHash()).not.toBe(pinB.getHash());
  });

  it('debe verificar correctamente el PIN original a partir del hash persistido (round-trip createFromHash)', () => {
    const original = Pin.createFromRaw('5678');
    const persistedHash = original.getHash();

    const rehydrated = Pin.createFromHash(persistedHash);

    expect(rehydrated.compareWithRaw('5678')).toBe(true);
    expect(rehydrated.compareWithRaw('0000')).toBe(false);
  });

  it('compareWithRaw debe rechazar un PIN incorrecto', () => {
    const pin = Pin.createFromRaw('1111');
    expect(pin.compareWithRaw('2222')).toBe(false);
  });

  it('debe rechazar PINs con formato inválido (no numérico o longitud incorrecta)', () => {
    expect(() => Pin.createFromRaw('abcd')).toThrow();
    expect(() => Pin.createFromRaw('123')).toThrow();
  });
});
