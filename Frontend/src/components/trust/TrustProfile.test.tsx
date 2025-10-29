import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TrustProfile } from './TrustProfile';
import { RatingsService } from '../../api/ratings';

// Mock the API service
jest.mock('../../api/ratings');
const mockRatingsService = RatingsService as jest.Mocked<typeof RatingsService>;

describe('TrustProfile', () => {
  const mockTrustStats = {
    totalRatings: 10,
    thumbsUp: 8,
    thumbsDown: 2,
    trustScore: 0.8,
    mostCommonTags: ['punctual', 'friendly']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockRatingsService.getTrustStats.mockImplementation(() => new Promise(() => {}));
    
    render(<TrustProfile userId="test-user" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render trust profile with stats', async () => {
    mockRatingsService.getTrustStats.mockResolvedValue(mockTrustStats);
    
    render(<TrustProfile userId="test-user" userName="Test User" />);
    
    await waitFor(() => {
      expect(screen.getByText('Perfil de Confianza - Test User')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('Excelente')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should render error state when API fails', async () => {
    mockRatingsService.getTrustStats.mockRejectedValue(new Error('API Error'));
    
    render(<TrustProfile userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar estadísticas de confianza')).toBeInTheDocument();
    });
  });

  it('should render no stats message when no data', async () => {
    mockRatingsService.getTrustStats.mockResolvedValue(null);
    
    render(<TrustProfile userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('No hay estadísticas de confianza disponibles')).toBeInTheDocument();
    });
  });

  it('should display correct trust score colors', async () => {
    const highScoreStats = { ...mockTrustStats, trustScore: 0.9 };
    mockRatingsService.getTrustStats.mockResolvedValue(highScoreStats);
    
    render(<TrustProfile userId="test-user" />);
    
    await waitFor(() => {
      const scoreElement = screen.getByText('90%');
      expect(scoreElement).toHaveClass('text-green-600');
    });
  });

  it('should display most common tags', async () => {
    mockRatingsService.getTrustStats.mockResolvedValue(mockTrustStats);
    
    render(<TrustProfile userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('Etiquetas más comunes')).toBeInTheDocument();
      expect(screen.getByText('punctual')).toBeInTheDocument();
      expect(screen.getByText('friendly')).toBeInTheDocument();
    });
  });
});









