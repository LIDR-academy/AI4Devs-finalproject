import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../../../src/features/auth/ProtectedRoute';
import { AuthProvider } from '../../../src/features/auth/AuthContext';
import { authApi } from '../../../src/api/authApi';

// Mock the auth API
jest.mock('../../../src/api/authApi');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Navigate: ({ to }: { to: string }) => {
        mockNavigate(to);
        return <div>Redirecting to {to}</div>;
    },
}));

describe('ProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    const renderProtectedRoute = () => {
        return render(
            <BrowserRouter>
                <AuthProvider>
                    <ProtectedRoute />
                </AuthProvider>
            </BrowserRouter>
        );
    };

    it('redirects to login when not authenticated', async () => {
        (authApi.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

        renderProtectedRoute();

        await screen.findByText(/Redirecting to \/login/i);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('shows loading spinner while checking authentication', () => {
        (authApi.getCurrentUser as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        renderProtectedRoute();

        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
});
