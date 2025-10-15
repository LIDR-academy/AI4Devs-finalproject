import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { RatingsList } from './RatingsList';
import { RatingsService } from '../../api/ratings';

// Mock the API service
jest.mock('../../api/ratings');
const mockRatingsService = RatingsService as jest.Mocked<typeof RatingsService>;

describe('RatingsList', () => {
  const mockRatings = [
    {
      id: '1',
      raterId: 'rater-1',
      ratedId: 'rated-1',
      tripId: 'trip-1',
      ratingType: 'THUMBS_UP' as const,
      tags: ['punctual', 'friendly'],
      comment: 'Great driver!',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      id: '2',
      raterId: 'rater-2',
      ratedId: 'rated-1',
      tripId: 'trip-2',
      ratingType: 'THUMBS_DOWN' as const,
      tags: ['late'],
      comment: 'Always late',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockRatingsService.getRatingsForUser.mockImplementation(() => new Promise(() => {}));
    
    render(<RatingsList userId="test-user" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render ratings list with user name', async () => {
    mockRatingsService.getRatingsForUser.mockResolvedValue(mockRatings);
    
    render(<RatingsList userId="test-user" userName="Test User" />);
    
    await waitFor(() => {
      expect(screen.getByText('Valoraciones de Test User')).toBeInTheDocument();
      expect(screen.getByText('"Great driver!"')).toBeInTheDocument();
      expect(screen.getByText('"Always late"')).toBeInTheDocument();
    });
  });

  it('should render ratings without user name', async () => {
    mockRatingsService.getRatingsForUser.mockResolvedValue(mockRatings);
    
    render(<RatingsList userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('Valoraciones')).toBeInTheDocument();
    });
  });

  it('should display rating types correctly', async () => {
    mockRatingsService.getRatingsForUser.mockResolvedValue(mockRatings);
    
    render(<RatingsList userId="test-user" />);
    
    await waitFor(() => {
      const thumbsUpIcons = screen.getAllByText('👍');
      const thumbsDownIcons = screen.getAllByText('👎');
      expect(thumbsUpIcons).toHaveLength(1);
      expect(thumbsDownIcons).toHaveLength(1);
    });
  });

  it('should display tags correctly', async () => {
    mockRatingsService.getRatingsForUser.mockResolvedValue(mockRatings);
    
    render(<RatingsList userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('punctual')).toBeInTheDocument();
      expect(screen.getByText('friendly')).toBeInTheDocument();
      expect(screen.getByText('late')).toBeInTheDocument();
    });
  });

  it('should display comments correctly', async () => {
    mockRatingsService.getRatingsForUser.mockResolvedValue(mockRatings);
    
    render(<RatingsList userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('"Great driver!"')).toBeInTheDocument();
      expect(screen.getByText('"Always late"')).toBeInTheDocument();
    });
  });

  it('should display trip-specific badge when tripId exists', async () => {
    mockRatingsService.getRatingsForUser.mockResolvedValue(mockRatings);
    
    render(<RatingsList userId="test-user" />);
    
    await waitFor(() => {
      const tripBadges = screen.getAllByText('Viaje específico');
      expect(tripBadges).toHaveLength(2);
    });
  });

  it('should render error state when API fails', async () => {
    mockRatingsService.getRatingsForUser.mockRejectedValue(new Error('API Error'));
    
    render(<RatingsList userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar las valoraciones')).toBeInTheDocument();
    });
  });

  it('should render no ratings message when empty', async () => {
    mockRatingsService.getRatingsForUser.mockResolvedValue([]);
    
    render(<RatingsList userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('No hay valoraciones disponibles')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    mockRatingsService.getRatingsForUser.mockResolvedValue(mockRatings);
    
    render(<RatingsList userId="test-user" />);
    
    await waitFor(() => {
      // Check that dates are formatted (exact format may vary by locale)
      expect(screen.getByText(/1 ene 2024/)).toBeInTheDocument();
      expect(screen.getByText(/2 ene 2024/)).toBeInTheDocument();
    });
  });
});
