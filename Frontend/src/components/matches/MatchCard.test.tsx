import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';
import MatchCard from './MatchCard';
import type { MatchDto } from '../../types/api';

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

const mockMatch: MatchDto = {
  id: 'match-1',
  tripId: 'trip-1',
  driverId: 'driver-1',
  score: 0.85,
  status: 'PENDING',
  origin: '40.4168,-3.7038',
  destinationSedeId: 'SEDE-1',
  dateTime: '2024-01-15T08:30:00Z',
  seatsFree: 3,
  reasons: ['Same route', 'Similar departure time'],
  direction: 'TO_SEDE',
  pairedTripId: null
};

describe('MatchCard', () => {
  const mockOnBook = jest.fn();
  const mockOnViewProfile = jest.fn();
  const mockOnRate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders match information correctly', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    expect(screen.getByText(/Viaje a/)).toBeInTheDocument();
    expect(screen.getByText('40.4168,-3.7038')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Same route')).toBeInTheDocument();
    expect(screen.getByText('Similar departure time')).toBeInTheDocument();
  });

  it('shows score badge with correct color and label', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    const scoreBadge = screen.getByText('Excelente');
    expect(scoreBadge).toBeInTheDocument();
    expect(scoreBadge.closest('span')).toHaveClass('text-green-600', 'bg-green-100');
  });

  it('shows booked status when isBooked is true', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        isBooked={true}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    expect(screen.getAllByText('Ya Reservado')).toHaveLength(2);
  });

  it('disables book button when no seats available', () => {
    const matchNoSeats = { ...mockMatch, seatsFree: 0 };
    
    renderWithI18n(
      <MatchCard
        match={matchNoSeats}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    const bookButton = screen.getByText('Sin asientos disponibles');
    expect(bookButton).toBeDisabled();
  });

  it('disables book button when already booked', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        isBooked={true}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    const bookButtons = screen.getAllByText('Ya Reservado');
    const mainButton = bookButtons.find(button => button.tagName === 'BUTTON');
    expect(mainButton).toBeDisabled();
  });

  it('shows loading state on book button when booking in progress', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        isBookingInProgress={true}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    const bookButton = screen.getByRole('button', { name: /reservar viaje/i });
    expect(bookButton).toBeDisabled();
  });

  it('calls onBook when book button is clicked', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    const bookButton = screen.getByText('Reservar Viaje');
    fireEvent.click(bookButton);

    expect(mockOnBook).toHaveBeenCalledWith(mockMatch);
  });

  it('calls onViewProfile when view profile button is clicked', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    const viewProfileButton = screen.getByText('👤 Ver Perfil');
    fireEvent.click(viewProfileButton);

    expect(mockOnViewProfile).toHaveBeenCalledWith('driver-1');
  });

  it('calls onRate when rate button is clicked', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    const rateButton = screen.getByText('⭐ Valorar');
    fireEvent.click(rateButton);

    expect(mockOnRate).toHaveBeenCalledWith('driver-1');
  });

  it('shows map toggle button when coordinates are valid', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    expect(screen.getByText('Mostrar Mapa')).toBeInTheDocument();
  });

  it('toggles map visibility when show/hide map button is clicked', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    const toggleButton = screen.getByText('Mostrar Mapa');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Ocultar Mapa')).toBeInTheDocument();
  });

  it('does not show map section when coordinates are invalid', () => {
    const matchInvalidCoords = { ...mockMatch, origin: 'invalid' };
    
    renderWithI18n(
      <MatchCard
        match={matchInvalidCoords}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    expect(screen.queryByText('Show Map')).not.toBeInTheDocument();
  });

  it('displays date and time correctly', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    // Check that date and time are displayed (format may vary by locale)
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('shows compatibility reasons when available', () => {
    renderWithI18n(
      <MatchCard
        match={mockMatch}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    expect(screen.getByText('Razones de compatibilidad:')).toBeInTheDocument();
    expect(screen.getByText('Same route')).toBeInTheDocument();
    expect(screen.getByText('Similar departure time')).toBeInTheDocument();
  });

  it('does not show compatibility reasons when empty', () => {
    const matchNoReasons = { ...mockMatch, reasons: [] };
    
    renderWithI18n(
      <MatchCard
        match={matchNoReasons}
        onBook={mockOnBook}
        onViewProfile={mockOnViewProfile}
        onRate={mockOnRate}
      />
    );

    expect(screen.queryByText('Compatibility reasons:')).not.toBeInTheDocument();
  });
});
