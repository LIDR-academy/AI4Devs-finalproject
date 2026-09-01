import { describe, it, expect } from 'vitest';
import { User, UserProps } from './User.js';
import { Pin } from '../value-objects/Pin.js';
import { UserBlockedException } from '../errors/UserBlockedException.js';

function buildUser(overrides: Partial<UserProps> = {}): User {
  return new User({
    id: 'usr-1',
    name: 'Maria Silva',
    role: 'ADMIN',
    pin: Pin.createFromRaw('1234'),
    status: 'ACTIVE',
    failedAttempts: 0,
    ...overrides,
  });
}

describe('User Domain Entity — Bloqueo por Intentos Fallidos y Recuperacion de PIN', () => {
  it('debe bloquear la cuenta automaticamente al alcanzar 5 intentos fallidos', () => {
    // ARRANGE
    const user = buildUser();

    // ACT: 4 intentos fallidos no bloquean, el 5to si
    for (let i = 0; i < 4; i++) {
      user.validatePin('0000');
    }

    // ASSERT (ORACULO ESTADO): aun activo tras 4 intentos
    expect(user.isBlocked()).toBe(false);
    expect(user.failedAttempts).toBe(4);

    user.validatePin('0000');

    expect(user.isBlocked()).toBe(true);
    expect(user.failedAttempts).toBe(5);
  });

  it('validatePin debe lanzar UserBlockedException si el usuario ya esta bloqueado, sin contar el intento', () => {
    const user = buildUser({ status: 'BLOCKED' });

    expect(() => user.validatePin('1234')).toThrow(UserBlockedException);
    expect(user.failedAttempts).toBe(0);
  });

  it('un PIN correcto resetea el contador de intentos fallidos a 0', () => {
    const user = buildUser();
    user.validatePin('0000');
    user.validatePin('9999');
    expect(user.failedAttempts).toBe(2);

    const isValid = user.validatePin('1234');

    expect(isValid).toBe(true);
    expect(user.failedAttempts).toBe(0);
  });

  it('resetPin debe reactivar una cuenta bloqueada, resetear intentos y limpiar el token de recuperacion (one-time use)', () => {
    // ARRANGE: cuenta bloqueada con token de recuperacion vigente
    const user = buildUser({ status: 'BLOCKED', failedAttempts: 5 });
    user.setResetToken('token-hash-abc', new Date(Date.now() + 15 * 60 * 1000));

    // ACT
    const newPin = Pin.createFromRaw('9876');
    user.resetPin(newPin);

    // ASSERT (ORACULO ESTADO)
    expect(user.isBlocked()).toBe(false);
    expect(user.status).toBe('ACTIVE');
    expect(user.failedAttempts).toBe(0);
    expect(user.mustChangePin).toBe(false);
    expect(user.resetTokenHash).toBeUndefined();
    expect(user.resetTokenExpires).toBeUndefined();
    expect(user.pin.compareWithRaw('9876')).toBe(true);
  });

  it('updateDetails debe actualizar solo los campos provistos y dejar el resto intacto', () => {
    const user = buildUser({ name: 'Original', role: 'KITCHEN_STAFF', email: 'original@restostock.com' });

    user.updateDetails('Nuevo Nombre');

    expect(user.name).toBe('Nuevo Nombre');
    expect(user.role).toBe('KITCHEN_STAFF');
    expect(user.email).toBe('original@restostock.com');
  });

  it('updateDetails debe permitir vaciar el email explicitamente pasando string vacio', () => {
    const user = buildUser({ email: 'admin@restostock.com' });

    user.updateDetails(undefined, undefined, undefined, '');

    expect(user.email).toBe('');
  });
});
