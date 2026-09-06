import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppNav } from '../app/AppNav.js';
import { usePermissions } from '../shared/hooks/usePermissions.js';
import { seedSession, clearSession, ALL_PERMISSIONS, KITCHEN_STAFF_PERMISSIONS } from './helpers/session.js';

function renderNav() {
  return render(
    <MemoryRouter>
      <AppNav />
    </MemoryRouter>
  );
}

describe('TK-121-FE (US-015 Escenario 2): ocultamiento por permiso', () => {
  afterEach(() => {
    clearSession();
  });

  it('AC1: un usuario sin reports:view ni roles:manage no ve Reportes ni Ajustes, y conserva el resto', () => {
    seedSession({ role: 'KITCHEN_STAFF', permissions: KITCHEN_STAFF_PERMISSIONS });

    renderNav();

    expect(screen.queryByRole('link', { name: /Reportes/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ajustes/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inventario/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Bodega/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Recetas/i })).toBeInTheDocument();
  });

  it('un rol NO llamado ADMIN pero CON los permisos sí ve Reportes y Ajustes (el punto de US-015)', () => {
    seedSession({ role: 'Encargado de Bodega', permissions: [...KITCHEN_STAFF_PERMISSIONS, 'reports:view', 'roles:manage'] });

    renderNav();

    expect(screen.getByRole('link', { name: /Reportes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ajustes/i })).toBeInTheDocument();
  });

  it('ADMIN con su lista completa ve todo', () => {
    seedSession({ role: 'ADMIN', permissions: ALL_PERMISSIONS });

    renderNav();

    expect(screen.getByRole('link', { name: /Reportes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ajustes/i })).toBeInTheDocument();
  });

  describe('AC2: compatibilidad con sesiones anteriores a TK-121 (token sin permissions)', () => {
    it('un ADMIN con token legado conserva acceso completo — no se le bloquea la navegación', () => {
      seedSession({ role: 'ADMIN' }); // sin permissions

      renderNav();

      expect(screen.getByRole('link', { name: /Reportes/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Ajustes/i })).toBeInTheDocument();
    });

    it('un operario con token legado ve exactamente lo que veía antes (sin Reportes ni Ajustes)', () => {
      seedSession({ role: 'KITCHEN_STAFF' }); // sin permissions

      renderNav();

      expect(screen.queryByRole('link', { name: /Reportes/i })).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Inventario/i })).toBeInTheDocument();
    });

    it('un token con forma no-JWT (sesión de prueba/legado) no rompe ni deja sin navegación', () => {
      localStorage.setItem('restostock_jwt_token', 'token-no-jwt');
      localStorage.setItem('restostock_user_info', JSON.stringify({ id: 'u1', name: 'Ana', role: 'ADMIN' }));

      renderNav();

      expect(screen.getByRole('link', { name: /Inventario/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Reportes/i })).toBeInTheDocument();
    });
  });

  it('la lista de permisos del token es la única fuente cuando existe (no se infiere del nombre del rol)', () => {
    // Un usuario llamado ADMIN pero cuyo token dice que NO tiene reports:view:
    // manda la lista, no el nombre. Refleja una revocación ya aplicada al emitir.
    seedSession({ role: 'ADMIN', permissions: KITCHEN_STAFF_PERMISSIONS });

    renderNav();

    expect(screen.queryByRole('link', { name: /Reportes/i })).not.toBeInTheDocument();
  });
});

describe('TK-121-FE: usePermissions como único punto de interpretación', () => {
  afterEach(() => {
    clearSession();
  });

  it('has() responde según la lista del token', () => {
    seedSession({ role: 'KITCHEN_STAFF', permissions: KITCHEN_STAFF_PERMISSIONS });

    const Probe: React.FC = () => {
      const { has } = usePermissions();
      return (
        <ul>
          <li>{`extract:${has('stock:extract')}`}</li>
          <li>{`reports:${has('reports:view')}`}</li>
        </ul>
      );
    };
    render(<Probe />);

    expect(screen.getByText('extract:true')).toBeInTheDocument();
    expect(screen.getByText('reports:false')).toBeInTheDocument();
  });
});
