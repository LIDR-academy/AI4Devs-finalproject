import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../../features/auth/LoginPage';
import { AuthProvider } from '../../../features/auth/AuthContext';
import { authApi } from '../../../api/authApi';

// Mock the auth API
jest.mock('../../../api/authApi');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderLoginPage = () => {
        return render(
            <BrowserRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </BrowserRouter>
        );
    };

    it('renders login form', () => {
        renderLoginPage();

        expect(screen.getByText('SC Padel Club')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
        expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('submits form with valid credentials', async () => {
        const mockLoginResponse = {
            token: 'mock-token',
            user: {
                id: '1',
                email: 'test@example.com',
                role: 'PLAYER' as const,
                active: true,
                createdAt: new Date().toISOString(),
            },
        };

        (authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse);

        renderLoginPage();

        const emailInput = screen.getByLabelText('Correo Electrónico');
        const passwordInput = screen.getByLabelText('Contraseña');
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('displays error message on login failure', async () => {
        (authApi.login as jest.Mock).mockRejectedValue({
            response: {
                data: {
                    message: 'Invalid credentials',
                },
            },
        });

        renderLoginPage();

        const emailInput = screen.getByLabelText('Correo Electrónico');
        const passwordInput = screen.getByLabelText('Contraseña');
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });
    });

    it('disables form during submission', async () => {
        (authApi.login as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        renderLoginPage();

        const emailInput = screen.getByLabelText('Correo Electrónico');
        const passwordInput = screen.getByLabelText('Contraseña');
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
    });
});
