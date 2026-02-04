import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChecklistListPage from './ChecklistListPage';
import planningService, { Surgery, SurgeryStatus, SurgeryType } from '@/services/planning.service';

vi.mock('@/services/planning.service', () => ({
  default: {
    getSurgeries: vi.fn(),
  },
  SurgeryStatus: { PLANNED: 'planned', SCHEDULED: 'scheduled', IN_PROGRESS: 'in_progress', COMPLETED: 'completed', CANCELLED: 'cancelled' },
  SurgeryType: { ELECTIVE: 'elective', URGENT: 'urgent', EMERGENCY: 'emergency' },
}));

const mockSurgeries: Surgery[] = [
  {
    id: 's1',
    patientId: 'p1',
    patient: { id: 'p1', firstName: 'Juan', lastName: 'Pérez', dateOfBirth: '1990-01-01', gender: 'M' },
    surgeonId: 'doc1',
    procedure: 'Artroscopia rodilla',
    type: SurgeryType.ELECTIVE,
    status: SurgeryStatus.SCHEDULED,
    scheduledDate: '2024-06-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    checklist: {
      id: 'cl1',
      surgeryId: 's1',
      preInductionComplete: true,
      preIncisionComplete: true,
      postProcedureComplete: true,
      checklistData: { preInduction: { name: 'Sign In', items: [], completed: true } },
      completedAt: '2024-06-10T12:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 's2',
    patientId: 'p2',
    patient: { id: 'p2', firstName: 'María', lastName: 'García', dateOfBirth: '1985-05-05', gender: 'F' },
    surgeonId: 'doc1',
    procedure: 'Colecistectomía',
    type: SurgeryType.ELECTIVE,
    status: SurgeryStatus.SCHEDULED,
    scheduledDate: '2024-06-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    checklist: {
      id: 'cl2',
      surgeryId: 's2',
      preInductionComplete: true,
      preIncisionComplete: false,
      postProcedureComplete: false,
      checklistData: { preInduction: { name: 'Sign In', items: [], completed: true } },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
];

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('ChecklistListPage', () => {
  beforeEach(() => {
    vi.mocked(planningService.getSurgeries).mockResolvedValue(mockSurgeries);
  });

  it('muestra estado de carga inicial', () => {
    vi.mocked(planningService.getSurgeries).mockImplementation(() => new Promise(() => {}));
    render(<ChecklistListPage />, { wrapper: createWrapper() });
    expect(screen.getByText(/Cargando cirugías/i)).toBeInTheDocument();
  });

  it('muestra título y lista de cirugías al cargar', async () => {
    render(<ChecklistListPage />, { wrapper: createWrapper() });
    expect(await screen.findByText(/Checklist Quirúrgico WHO/i)).toBeInTheDocument();
    expect(await screen.findByText(/Artroscopia rodilla/i)).toBeInTheDocument();
    expect(await screen.findByText(/Colecistectomía/i)).toBeInTheDocument();
  });

  it('muestra filtros Todos, Historial, En progreso, Sin iniciar', async () => {
    render(<ChecklistListPage />, { wrapper: createWrapper() });
    await screen.findByText(/Artroscopia rodilla/i);
    expect(screen.getByRole('button', { name: /Todos \(2\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Historial \(completados\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /En progreso/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sin iniciar/i })).toBeInTheDocument();
  });

  it('al filtrar por completados muestra solo cirugías con checklist completo', async () => {
    render(<ChecklistListPage />, { wrapper: createWrapper() });
    await screen.findByText(/Artroscopia rodilla/i);
    fireEvent.click(screen.getByRole('button', { name: /Historial \(completados\)/i }));
    expect(await screen.findByText(/Artroscopia rodilla/i)).toBeInTheDocument();
    expect(screen.queryByText(/Colecistectomía/i)).not.toBeInTheDocument();
  });

  it('muestra enlace Ver Checklist por cirugía', async () => {
    render(<ChecklistListPage />, { wrapper: createWrapper() });
    const links = await screen.findAllByRole('link', { name: /Ver Checklist/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/checklist/s1');
    expect(links[1]).toHaveAttribute('href', '/checklist/s2');
  });

  it('muestra mensaje cuando no hay cirugías', async () => {
    vi.mocked(planningService.getSurgeries).mockResolvedValue([]);
    render(<ChecklistListPage />, { wrapper: createWrapper() });
    expect(await screen.findByText(/No hay cirugías disponibles/i)).toBeInTheDocument();
  });
});
