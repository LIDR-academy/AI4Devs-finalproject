import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AiSettingsSection } from '../features/settings/components/AiSettingsSection.js';

describe('TK-123-FE: AiSettingsSection Component Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockDefaultConfig = {
    provider: 'GEMINI',
    modelName: 'gemini-1.5-flash',
    endpointUrl: null,
    temperature: 0.1,
    apiKeyConfigured: true,
    apiKeyMasked: 'AIzaSy************************1234',
    replenishmentOn: false,
    rescueRecipesOn: true,
  };

  it('carga y renderiza la configuración actual de IA', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockDefaultConfig,
      }),
    );

    render(<AiSettingsSection />);

    await waitFor(() => {
      expect(screen.getByText('Configuración de Inteligencia Artificial')).toBeInTheDocument();
      expect(screen.getByDisplayValue('gemini-1.5-flash')).toBeInTheDocument();
      expect(screen.getByText(/Clave activa configurada/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Recetas de Aprovechamiento/i })).toBeChecked();
    });
  });

  it('permite cambiar a proveedor OPENAI_COMPATIBLE y muestra campo de endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockDefaultConfig,
      }),
    );

    render(<AiSettingsSection />);
    await waitFor(() => expect(screen.getByDisplayValue('gemini-1.5-flash')).toBeInTheDocument());

    const select = screen.getByLabelText(/Proveedor de Inteligencia Artificial/i);
    fireEvent.change(select, { target: { value: 'OPENAI_COMPATIBLE' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/Endpoint URL Base/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('llama3:8b')).toBeInTheDocument();
    });
  });

  it('permite cambiar a proveedor HEURISTIC y muestra banner informativo sin inputs de LLM', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockDefaultConfig,
      }),
    );

    render(<AiSettingsSection />);
    await waitFor(() => expect(screen.getByDisplayValue('gemini-1.5-flash')).toBeInTheDocument());

    const select = screen.getByLabelText(/Proveedor de Inteligencia Artificial/i);
    fireEvent.change(select, { target: { value: 'HEURISTIC' } });

    await waitFor(() => {
      expect(screen.getByText(/opera 100% desconectado/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Nombre del Modelo/i)).not.toBeInTheDocument();
    });
  });

  it('ejecuta prueba de conexión y muestra badge de latencia', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/test') && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            latencyMs: 145,
            message: 'Conexión exitosa con el proveedor de IA',
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => mockDefaultConfig,
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AiSettingsSection />);
    await waitFor(() => expect(screen.getByDisplayValue('gemini-1.5-flash')).toBeInTheDocument());

    const pingBtn = screen.getByRole('button', { name: /Probar Conexión/i });
    fireEvent.click(pingBtn);

    await waitFor(() => {
      expect(screen.getByText(/Conexión exitosa con el proveedor de IA \(145 ms\)/i)).toBeInTheDocument();
    });
  });

  it('persiste la configuración modificada vía PUT y muestra feedback', async () => {
    let putCalled = false;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        putCalled = true;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ...mockDefaultConfig,
            temperature: 0.15,
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => mockDefaultConfig,
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AiSettingsSection />);
    await waitFor(() => expect(screen.getByDisplayValue('gemini-1.5-flash')).toBeInTheDocument());

    const tempInput = screen.getByLabelText(/Temperatura de Inferencia/i);
    fireEvent.change(tempInput, { target: { value: '0.15' } });

    const saveBtn = screen.getByRole('button', { name: /Guardar Configuración de IA/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(putCalled).toBe(true);
      expect(screen.getByText(/Configuración de IA guardada exitosamente/i)).toBeInTheDocument();
    });
  });
});
