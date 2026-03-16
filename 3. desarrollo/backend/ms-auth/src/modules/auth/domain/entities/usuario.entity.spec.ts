import { UsuarioEntity } from './usuario.entity';

describe('UsuarioEntity', () => {
  const crearUsuario = (overrides?: Partial<UsuarioEntity>): UsuarioEntity => {
    return new UsuarioEntity(
      overrides?.id ?? 1,
      overrides?.uuid ?? '550e8400-e29b-41d4-a716-446655440000',
      overrides?.username ?? 'jperez',
      overrides?.nombreCompleto ?? 'Juan Pérez',
      overrides?.email ?? 'jperez@ejemplo.com',
      overrides?.passwordHash ?? '$2b$12$hash',
      overrides?.empresaId ?? 1,
      overrides?.oficinaId ?? 1,
      overrides?.perfilId ?? 1,
      overrides?.empleadoId ?? null,
      overrides?.tipoUsuario ?? 'EMPLEADO',
      overrides?.esAdmin ?? false,
      overrides?.accesoGlobal ?? false,
      overrides?.fechaUltimoPassword ?? new Date(),
      overrides?.forzarCambioPassword ?? false,
      overrides?.passwordNuncaExpira ?? false,
      overrides?.intentosFallidos ?? 0,
      overrides?.fechaPrimerIntentoFallido ?? null,
      overrides?.bloqueadoHasta ?? null,
      overrides?.motivoBloqueo ?? null,
      overrides?.fechaUltimoLogin ?? null,
      overrides?.ultimaIpLogin ?? null,
      overrides?.mfaActivado ?? false,
      overrides?.totpSecret ?? null,
      overrides?.activo ?? true,
      overrides?.esSistema ?? false,
      overrides?.fechaEliminacion ?? null,
    );
  };

  describe('estaActivo', () => {
    it('debe retornar true si el usuario está activo y no eliminado', () => {
      const usuario = crearUsuario({ activo: true, fechaEliminacion: null });

      expect(usuario.estaActivo()).toBe(true);
    });

    it('debe retornar false si el usuario está inactivo', () => {
      const usuario = crearUsuario({ activo: false });

      expect(usuario.estaActivo()).toBe(false);
    });

    it('debe retornar false si el usuario está eliminado', () => {
      const usuario = crearUsuario({
        activo: true,
        fechaEliminacion: new Date(),
      });

      expect(usuario.estaActivo()).toBe(false);
    });
  });

  describe('estaBloqueado', () => {
    it('debe retornar false si no está bloqueado', () => {
      const usuario = crearUsuario({ bloqueadoHasta: null });

      expect(usuario.estaBloqueado()).toBe(false);
    });

    it('debe retornar true si está bloqueado', () => {
      const bloqueadoHasta = new Date(Date.now() + 30 * 60000);
      const usuario = crearUsuario({ bloqueadoHasta });

      expect(usuario.estaBloqueado()).toBe(true);
    });

    it('debe retornar false si el bloqueo ya expiró', () => {
      const bloqueadoHasta = new Date(Date.now() - 60000);
      const usuario = crearUsuario({ bloqueadoHasta });

      expect(usuario.estaBloqueado()).toBe(false);
    });
  });

  describe('esTipoSistema', () => {
    it('debe retornar true para usuario tipo SISTEMA', () => {
      const usuario = crearUsuario({ tipoUsuario: 'SISTEMA' });

      expect(usuario.esTipoSistema()).toBe(true);
    });

    it('debe retornar true si esSistema es true', () => {
      const usuario = crearUsuario({ esSistema: true });

      expect(usuario.esTipoSistema()).toBe(true);
    });

    it('debe retornar false para usuario tipo EMPLEADO', () => {
      const usuario = crearUsuario({ tipoUsuario: 'EMPLEADO', esSistema: false });

      expect(usuario.esTipoSistema()).toBe(false);
    });
  });

  describe('debeCambiarPassword', () => {
    it('debe retornar false si passwordNuncaExpira es true', () => {
      const usuario = crearUsuario({ passwordNuncaExpira: true });

      expect(usuario.debeCambiarPassword(90)).toBe(false);
    });

    it('debe retornar true si forzarCambioPassword es true', () => {
      const usuario = crearUsuario({ forzarCambioPassword: true });

      expect(usuario.debeCambiarPassword(90)).toBe(true);
    });

    it('debe retornar true si la contraseña ha expirado', () => {
      const fechaUltimoPassword = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 días atrás
      const usuario = crearUsuario({ fechaUltimoPassword });

      expect(usuario.debeCambiarPassword(90)).toBe(true);
    });

    it('debe retornar false si la contraseña no ha expirado', () => {
      const fechaUltimoPassword = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días atrás
      const usuario = crearUsuario({ fechaUltimoPassword });

      expect(usuario.debeCambiarPassword(90)).toBe(false);
    });
  });

  describe('puedeIntentarLogin', () => {
    it('debe retornar true si no hay intentos fallidos', () => {
      const usuario = crearUsuario({ intentosFallidos: 0 });

      expect(usuario.puedeIntentarLogin(5, 15)).toBe(true);
    });

    it('debe retornar true si la ventana de tiempo expiró', () => {
      const fechaPrimerIntento = new Date(Date.now() - 20 * 60000); // 20 min atrás
      const usuario = crearUsuario({
        intentosFallidos: 3,
        fechaPrimerIntentoFallido: fechaPrimerIntento,
      });

      expect(usuario.puedeIntentarLogin(5, 15)).toBe(true);
    });

    it('debe retornar true si los intentos están por debajo del máximo', () => {
      const fechaPrimerIntento = new Date(Date.now() - 5 * 60000); // 5 min atrás
      const usuario = crearUsuario({
        intentosFallidos: 2,
        fechaPrimerIntentoFallido: fechaPrimerIntento,
      });

      expect(usuario.puedeIntentarLogin(5, 15)).toBe(true);
    });

    it('debe retornar false si excedió el máximo de intentos dentro de la ventana', () => {
      const fechaPrimerIntento = new Date(Date.now() - 5 * 60000); // 5 min atrás
      const usuario = crearUsuario({
        intentosFallidos: 5,
        fechaPrimerIntentoFallido: fechaPrimerIntento,
      });

      expect(usuario.puedeIntentarLogin(5, 15)).toBe(false);
    });
  });
});

