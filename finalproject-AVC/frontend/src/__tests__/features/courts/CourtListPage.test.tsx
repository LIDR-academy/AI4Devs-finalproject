import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CourtListPage } from '../../../src/features/courts/CourtListPage';
import { ToastProvider } from '../../../src/shared/components/ToastContext';
import { courtsApi } from '../../../src/api/courtsApi';

// Mock the courts API
jest.mock('../../../src/api/courtsApi');

describe('CourtListPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderCourtListPage = () => {
        return render(
            <BrowserRouter>
                <ToastProvider>
                    <CourtListPage />
                </ToastProvider>
            </BrowserRouter>
        );
    };

    it('renders court list page', async () => {
        const mockCourts = [
            {
                id: '1',
                name: 'Cancha 1',
                active: true,
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                name: 'Cancha 2',
                active: true,
                createdAt: new Date().toISOString(),
            },
        ];

        (courtsApi.getCourts as jest.Mock).mockResolvedValue(mockCourts);

        renderCourtListPage();

        // Should show loading initially
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();

        // Wait for courts to load
        await waitFor(() => {
            expect(screen.getByText('Canchas Disponibles')).toBeInTheDocument();
        });

        // Should display courts
        expect(screen.getByText('Cancha 1')).toBeInTheDocument();
        expect(screen.getByText('Cancha 2')).toBeInTheDocument();
    });

    it('shows empty state when no courts available', async () => {
        (courtsApi.getCourts as jest.Mock).mockResolvedValue([]);

        renderCourtListPage();

        await waitFor(() => {
            expect(screen.getByText(/No hay canchas disponibles/i)).toBeInTheDocument();
        });
    });

    it('handles error when fetching courts', async () => {
        (courtsApi.getCourts as jest.Mock).mockRejectedValue({
            response: {
                data: {
                    message: 'Error al cargar canchas',
                },
            },
        });

        renderCourtListPage();

        await waitFor(() => {
            expect(screen.getByText(/Error al cargar las canchas/i)).toBeInTheDocument();
        });
    });
});
