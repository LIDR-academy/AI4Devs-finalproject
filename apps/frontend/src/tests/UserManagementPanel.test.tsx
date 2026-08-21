import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserManagementPanel } from '../features/auth/components/UserManagementPanel.js';

describe('TK-049-FE: UserManagementPanel Component Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe mostrar la pantalla de Acceso Restringido si el usuario no es ADMIN', () => {
    render(<UserManagementPanel isOpen={true} userRole="KITCHEN_STAFF" onClose={() => {}} />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
    expect(screen.getByText(/requiere rol de Administrador/i)).toBeInTheDocument();
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(<UserManagementPanel isOpen={false} userRole="ADMIN" onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('crea un operario exitosamente y muestra el mensaje de confirmación real del backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: 'usr-new-1', name: 'Nuevo Operario', role: 'KITCHEN_STAFF', status: 'ACTIVE' }),
      })
    );

    render(<UserManagementPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Nuevo Operario' } });
    fireEvent.change(screen.getByLabelText(/PIN/i), { target: { value: '4321' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear Operario/i }));

    await waitFor(() => {
      expect(screen.getByText(/creado con estado ACTIVE/i)).toBeInTheDocument();
    });
  });

  it('muestra el error real del backend si la creación falla (nunca finge éxito)', async () => {
    // PIN con formato válido a nivel cliente (pasa la validación HTML5 pattern);
    // el rechazo simulado viene del backend (ej. nombre duplicado), no del formulario.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ message: 'El nombre ya está en uso' }) })
    );

    render(<UserManagementPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Nuevo Operario' } });
    fireEvent.change(screen.getByLabelText(/PIN/i), { target: { value: '4321' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear Operario/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/El nombre ya está en uso/i);
    });
  });

  it('lista los operarios reales y bloquea uno desde la pestaña Bloquear / Reactivar (TK-056)', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init || !init.method || init.method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => [{ id: 'usr-1', name: 'Carlos Gomez', role: 'KITCHEN_STAFF', status: 'ACTIVE' }],
        };
      }
      return { ok: true, status: 200, json: async () => ({ id: 'usr-1', status: 'BLOCKED' }) };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<UserManagementPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Bloquear \/ Reactivar/i }));

    await waitFor(() => {
      expect(screen.getByText('Carlos Gomez')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Bloquear$/i }));

    await waitFor(() => {
      expect(screen.getByText(/ahora en estado BLOCKED/i)).toBeInTheDocument();
    });
  });

  it('muestra estado vacío cuando no hay operarios registrados', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }));

    render(<UserManagementPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Bloquear \/ Reactivar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sin operarios registrados todavía/i)).toBeInTheDocument();
    });
  });
});
