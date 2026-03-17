import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Profile Validation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should show validation errors for empty required fields', async () => {
    UsersService.getCurrentUser.mockResolvedValueOnce({
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      sedeId: 'SEDE-1',
      role: 'EMPLOYEE',
      createdAt: '',
      updatedAt: '',
    });

    render(<Profile />);

    // Wait for component to load
    await screen.findByDisplayValue('Test User');

    // Clear required fields
    const nameInput = screen.getByLabelText('Nombre *');
    const emailInput = screen.getByLabelText('Correo electrónico *');
    const sedeSelect = screen.getByLabelText('Sede *');

    await userEvent.clear(nameInput);
    await userEvent.clear(emailInput);
    await userEvent.selectOptions(sedeSelect, '');

    // Trigger validation by clicking save
    const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });
    await userEvent.click(saveButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
      expect(screen.getByText('El email es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('La sede es obligatoria')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email format', async () => {
    UsersService.getCurrentUser.mockResolvedValueOnce({
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      sedeId: 'SEDE-1',
      role: 'EMPLOYEE',
      createdAt: '',
      updatedAt: '',
    });

    render(<Profile />);

    await screen.findByDisplayValue('Test User');

    const emailInput = screen.getByLabelText('Correo electrónico *');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'invalid-email');

    // Trigger validation
    const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor ingresa un email válido')).toBeInTheDocument();
    });
  });

  it('should show validation error for name too short', async () => {
    UsersService.getCurrentUser.mockResolvedValueOnce({
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      sedeId: 'SEDE-1',
      role: 'EMPLOYEE',
      createdAt: '',
      updatedAt: '',
    });

    render(<Profile />);

    await screen.findByDisplayValue('Test User');

    const nameInput = screen.getByLabelText('Nombre *');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'A');

    // Trigger validation
    const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
    });
  });

  it('should clear validation errors when user fixes them', async () => {
    UsersService.getCurrentUser.mockResolvedValueOnce({
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      sedeId: 'SEDE-1',
      role: 'EMPLOYEE',
      createdAt: '',
      updatedAt: '',
    });

    render(<Profile />);

    await screen.findByDisplayValue('Test User');

    // Create validation error
    const nameInput = screen.getByLabelText('Nombre *');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'A');

    const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });
    await userEvent.click(saveButton);

    // Check error is shown
    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
    });

    // Fix the error
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Valid Name');

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('El nombre debe tener al menos 2 caracteres')).not.toBeInTheDocument();
    });
  });

  it('should show success message when profile is updated successfully', async () => {
    const mockUser = {
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      sedeId: 'SEDE-1',
      role: 'EMPLOYEE',
      createdAt: '',
      updatedAt: '',
    };

    UsersService.getCurrentUser.mockResolvedValueOnce(mockUser);
    UsersService.updateCurrentUser.mockResolvedValueOnce({
      ...mockUser,
      name: 'Updated Name',
    });

    render(<Profile />);

    await screen.findByDisplayValue('Test User');

    const nameInput = screen.getByLabelText('Nombre *');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('¡Perfil actualizado exitosamente!')).toBeInTheDocument();
    });
  });

  it('should show error message when API update fails', async () => {
    const mockUser = {
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      sedeId: 'SEDE-1',
      role: 'EMPLOYEE',
      createdAt: '',
      updatedAt: '',
    };

    UsersService.getCurrentUser.mockResolvedValueOnce(mockUser);
    UsersService.updateCurrentUser.mockRejectedValueOnce(new Error('API Error'));

    render(<Profile />);

    await screen.findByDisplayValue('Test User');

    const nameInput = screen.getByLabelText('Nombre *');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('should disable save button while saving', async () => {
    const mockUser = {
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      sedeId: 'SEDE-1',
      role: 'EMPLOYEE',
      createdAt: '',
      updatedAt: '',
    };

    UsersService.getCurrentUser.mockResolvedValueOnce(mockUser);
    UsersService.updateCurrentUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Profile />);

    await screen.findByDisplayValue('Test User');

    const nameInput = screen.getByLabelText('Nombre *');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });
    await userEvent.click(saveButton);

    // Button should be disabled and show loading state
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Guardando...')).toBeInTheDocument();
  });
});
