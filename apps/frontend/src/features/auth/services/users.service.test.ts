import { describe, it, expect, vi, afterEach } from 'vitest';
import { UsersService } from './users.service.js';
import { AuthService } from './auth.service.js';

describe('UsersService — gestión de personal (TK-049-FE)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('crea un operario nuevo y retorna la cuenta real del backend', async () => {
    AuthService.saveSession('admin-token', { id: 'usr-admin', name: 'Ana', role: 'ADMIN' });
    const mockUser = { id: 'usr-new-1', name: 'Nuevo Operario', role: 'KITCHEN_STAFF', status: 'ACTIVE' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => mockUser }));

    const result = await UsersService.createUser({ name: 'Nuevo Operario', role: 'KITCHEN_STAFF', pin: '4321' });

    expect(result).toEqual(mockUser);
  });

  it('propaga el error real (400) cuando el PIN es inválido, sin fingir éxito', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'PIN inválido' }),
    }));

    await expect(UsersService.createUser({ name: 'X', role: 'KITCHEN_STAFF', pin: 'ab' }))
      .rejects.toMatchObject({ status: 400 });
  });

  it('bloquea una cuenta existente', async () => {
    const mockResult = { id: 'usr-1', status: 'BLOCKED' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => mockResult }));

    const result = await UsersService.setUserStatus('usr-1', 'BLOCK');

    expect(result).toEqual(mockResult);
  });

  it('propaga 404 cuando el usuario a bloquear no existe', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Usuario no encontrado' }),
    }));

    await expect(UsersService.setUserStatus('usr-inexistente', 'BLOCK')).rejects.toMatchObject({ status: 404 });
  });

  it('reactiva una cuenta bloqueada', async () => {
    const mockResult = { id: 'usr-1', status: 'ACTIVE' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => mockResult }));

    const result = await UsersService.setUserStatus('usr-1', 'ACTIVATE');

    expect(result).toEqual(mockResult);
  });
});
