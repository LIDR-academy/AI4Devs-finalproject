import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChecklistPage from './ChecklistPage';
import type { Checklist, ChecklistPhase } from '@/services/planning.service';

vi.mock('@/services/planning.service', () => ({
  default: {
    getChecklist: vi.fn(),
    updateChecklistPhase: vi.fn(),
  },
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'user-1' } }),
}));

import planningService from '@/services/planning.service';

const mockChecklist: Checklist = {
  id: 'cl-1',
  surgeryId: 'surgery-1',
  preInductionComplete: false,
  preIncisionComplete: false,
  postProcedureComplete: false,
  checklistData: {
    preInduction: {
      name: 'Sign In - Antes de la Inducción',
      items: [
        { id: 'item-1', text: 'Confirmar identidad del paciente', checked: false },
        { id: 'item-2', text: 'Confirmar sitio quirúrgico', checked: true, checkedAt: '2024-01-01T10:00:00Z' },
      ],
      completed: false,
    },
    preIncision: {
      name: 'Time Out - Antes de la Incisión',
      items: [{ id: 'item-3', text: 'Confirmar equipo estéril', checked: false }],
      completed: false,
    },
    postProcedure: {
      name: 'Sign Out - Antes de Salir del Quirófano',
      items: [],
      completed: false,
    },
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/checklist/surgery-1']}>
          <Routes>
            <Route path="/checklist/:surgeryId" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('ChecklistPage', () => {
  beforeEach(() => {
    vi.mocked(planningService.getChecklist).mockResolvedValue(mockChecklist);
    vi.mocked(planningService.updateChecklistPhase).mockResolvedValue(mockChecklist);
  });

  it('muestra estado de carga inicial', async () => {
    vi.mocked(planningService.getChecklist).mockImplementation(() => new Promise(() => {}));
    render(<ChecklistPage />, { wrapper: createWrapper() });
    expect(screen.getByText(/Cargando checklist/i)).toBeInTheDocument();
  });

  it('muestra error cuando no hay checklist', async () => {
    vi.mocked(planningService.getChecklist).mockResolvedValue(null as any);
    render(<ChecklistPage />, { wrapper: createWrapper() });
    expect(await screen.findByText(/No se pudo cargar el checklist/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
  });

  it('renderiza título y progreso general al cargar checklist', async () => {
    render(<ChecklistPage />, { wrapper: createWrapper() });
    expect(await screen.findByText(/Checklist Quirúrgico WHO/i)).toBeInTheDocument();
    expect(await screen.findByText(/Progreso General/i)).toBeInTheDocument();
  });

  it('muestra las tres fases y permite seleccionar una', async () => {
    render(<ChecklistPage />, { wrapper: createWrapper() });
    await screen.findByText(/Checklist Quirúrgico WHO/i);
    expect(screen.getAllByText(/Sign In - Antes de la Inducción/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Time Out - Antes de la Incisión/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Out - Antes de Salir del Quirófano/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmar identidad del paciente/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmar sitio quirúrgico/i)).toBeInTheDocument();
  });

  it('al hacer clic en fase preIncision muestra ítems de esa fase', async () => {
    render(<ChecklistPage />, { wrapper: createWrapper() });
    await screen.findByText(/Checklist Quirúrgico WHO/i);
    const preIncisionCard = screen.getByText(/Time Out - Antes de la Incisión/i).closest('div[role="button"]');
    expect(preIncisionCard).toBeInTheDocument();
    fireEvent.click(preIncisionCard!);
    expect(await screen.findByText(/Confirmar equipo estéril/i)).toBeInTheDocument();
  });

  it('muestra ítems de la fase activa con botones para marcar', async () => {
    render(<ChecklistPage />, { wrapper: createWrapper() });
    await screen.findByText(/Confirmar identidad del paciente/i);
    const buttons = screen.getAllByRole('button');
    const checkboxButtons = buttons.filter((b) => b.getAttribute('class')?.includes('rounded-full'));
    expect(checkboxButtons.length).toBe(2);
  });
});
