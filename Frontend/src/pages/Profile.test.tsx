import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from './Profile';

jest.mock('../api/users', () => ({
  UsersService: {
    getCurrentUser: jest.fn(),
    updateCurrentUser: jest.fn(),
  },
}));

jest.mock('../api/notifications', () => ({
  subscribePush: jest.fn().mockResolvedValue({ ok: true, status: 200 }),
  unsubscribePush: jest.fn().mockResolvedValue({ ok: true, status: 200 }),
}));

const { UsersService } = jest.requireMock('../api/users');
const notifications = jest.requireMock('../api/notifications');

describe('Profile page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('loads and displays user profile', async () => {
    const mockUser = {
      id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      sedeId: 'SEDE-1',
      role: 'EMPLOYEE',
      createdAt: '',
      updatedAt: '',
    };
    
    UsersService.getCurrentUser.mockResolvedValueOnce(mockUser);
    
    await act(async () => {
      render(<Profile />);
    });
    
    // Wait for the user data to be loaded and displayed
    expect(await screen.findByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('alice@example.com')).toBeInTheDocument();
    
    // For the select, we need to check the selected option
    const sedeSelect = screen.getByLabelText('Sede *');
    expect(sedeSelect).toHaveValue('SEDE-1');
  });

  it('edits and saves profile', async () => {
    UsersService.getCurrentUser.mockResolvedValueOnce({
      id: 'u1', name: 'Bob', email: 'bob@example.com', sedeId: 'SEDE-2', role: 'EMPLOYEE', createdAt: '', updatedAt: ''
    });
    UsersService.updateCurrentUser.mockImplementation(async (payload: any) => ({
      id: 'u1', name: payload.name, email: payload.email, sedeId: payload.sedeId, role: 'EMPLOYEE', createdAt: '', updatedAt: ''
    }));

    await act(async () => {
      render(<Profile />);
    });

    const nameInput = await screen.findByLabelText('Nombre *');
    const sedeInput = screen.getByLabelText('Sede *');
    const emailInput = screen.getByLabelText('Email *');
    const saveBtn = screen.getByRole('button', { name: /Guardar cambios/i });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Bobby');
    await userEvent.selectOptions(sedeInput, 'SEDE-3');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'bobby@example.com');
    await userEvent.click(saveBtn);

    expect(UsersService.updateCurrentUser).toHaveBeenCalledWith({ name: 'Bobby', email: 'bobby@example.com', sedeId: 'SEDE-3' });
  });

  it('shows error when API fails', async () => {
    UsersService.getCurrentUser.mockRejectedValueOnce(new Error('fail'));
    await act(async () => {
      render(<Profile />);
    });
    expect(await screen.findByText('No se pudo cargar el perfil')).toBeInTheDocument();
  });

  it('enables push when clicking Habilitar', async () => {
    UsersService.getCurrentUser.mockResolvedValueOnce({
      id: 'u1', name: 'Bob', email: 'bob@example.com', sedeId: 'SEDE-2', role: 'EMPLOYEE', createdAt: '', updatedAt: ''
    });
    const p256 = new TextEncoder().encode('p256');
    const auth = new TextEncoder().encode('auth');
    const mockSub = {
      endpoint: 'https://push.example/sub',
      getKey: (name: 'p256dh' | 'auth') => (name === 'p256dh' ? p256.buffer : auth.buffer),
      unsubscribe: jest.fn().mockResolvedValue(true),
      toJSON: () => ({ endpoint: 'https://push.example/sub', keys: { p256dh: 'p', auth: 'a' } }),
    } as unknown as PushSubscription;

    (global as any).navigator = {
      serviceWorker: {
        register: jest.fn().mockResolvedValue({
          pushManager: {
            getSubscription: jest.fn().mockResolvedValue(null),
            subscribe: jest.fn().mockResolvedValue(mockSub),
          },
        }),
      },
    } as any;

    await act(async () => {
      render(<Profile />);
    });
    expect(await screen.findByText('Mi Perfil')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Habilitar'));
    await waitFor(() => expect(notifications.subscribePush).toHaveBeenCalled());
  });

  it('disables push when clicking Deshabilitar', async () => {
    UsersService.getCurrentUser.mockResolvedValueOnce({
      id: 'u1', name: 'Bob', email: 'bob@example.com', sedeId: 'SEDE-2', role: 'EMPLOYEE', createdAt: '', updatedAt: ''
    });
    const mockSub = {
      endpoint: 'https://push.example/sub',
      getKey: jest.fn(),
      unsubscribe: jest.fn().mockResolvedValue(true),
      toJSON: () => ({ endpoint: 'https://push.example/sub' }),
    } as unknown as PushSubscription;

    (global as any).navigator = {
      serviceWorker: {
        getRegistration: jest.fn().mockResolvedValue({
          pushManager: {
            getSubscription: jest.fn().mockResolvedValue(mockSub),
          },
        }),
      },
    } as any;

    await act(async () => {
      render(<Profile />);
    });
    expect(await screen.findByText('Mi Perfil')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Deshabilitar'));
    await waitFor(() => expect(notifications.unsubscribePush).toHaveBeenCalled());
  });
});


