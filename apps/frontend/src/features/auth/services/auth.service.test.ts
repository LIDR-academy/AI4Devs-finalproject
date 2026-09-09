import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthService } from './auth.service.js';

describe('AuthService.loginWithPin — sin bypass de autenticación', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('guarda la sesión real y retorna los datos del backend cuando la respuesta es 200 OK', async () => {
    const mockResponse = {
      accessToken: 'real-jwt-token',
      user: { id: 'usr-1', name: 'Carlos', role: 'OPERATOR' },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }));

    const result = await AuthService.loginWithPin('usr-1', '1234');

    expect(result).toEqual(mockResponse);
    expect(localStorage.getItem('restostock_jwt_token')).toBe('real-jwt-token');
  });

  it('relanza el error real cuando el backend rechaza el PIN (400/401) — comportamiento ya correcto, no debe cambiar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'PIN invalido o incorrecto' }),
    }));

    await expect(AuthService.loginWithPin('usr-1', '9999')).rejects.toThrow(/PIN invalido/);
    expect(localStorage.getItem('restostock_jwt_token')).toBeNull();
  });

  it('relanza el error real ante un fallo genérico del backend (500) en vez de crear una sesión falsa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Error interno del servidor' }),
    }));

    await expect(AuthService.loginWithPin('usr-1', '1234')).rejects.toThrow(/Error interno del servidor/);
    expect(localStorage.getItem('restostock_jwt_token')).toBeNull();
  });

  it('relanza el error real ante un fallo de red (fetch rechazado) en vez de crear una sesión falsa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network request failed')));

    await expect(AuthService.loginWithPin('usr-1', '1234')).rejects.toThrow(/Network request failed/);
    expect(localStorage.getItem('restostock_jwt_token')).toBeNull();
  });

  it('un userId que contenga "maria" NO obtiene sesión ADMIN automática cuando el backend falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('backend caído')));

    await expect(AuthService.loginWithPin('maria-operario', '1234')).rejects.toThrow();
    expect(localStorage.getItem('restostock_user_info')).toBeNull();
  });

  describe('requestForgotPin & resetAdminPin (TK-077-FE)', () => {
    it('requestForgotPin envía solicitud POST al backend y retorna mensaje exitoso', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Instrucciones enviadas.' }),
      }));

      const res = await AuthService.requestForgotPin('admin@restostock.com');
      expect(res.message).toBe('Instrucciones enviadas.');
    });

    it('resetAdminPin envía token y nuevo PIN y confirma restablecimiento', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'PIN actualizado exitosamente.' }),
      }));

      const res = await AuthService.resetAdminPin('valid-token-12345678', '9876');
      expect(res.message).toBe('PIN actualizado exitosamente.');
    });

    it('resetAdminPin propaga error RFC 7807 detail cuando el token es inválido o ha expirado', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'El token de recuperación es inválido o ha expirado.' }),
      }));

      await expect(AuthService.resetAdminPin('invalid-token', '9876')).rejects.toThrow(
        /inválido o ha expirado/
      );
    });
  });
});
