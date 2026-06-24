import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewList } from './ReviewList';
import type { ReviewsResponse } from '@/types';

vi.mock('@/services/propertyService', () => ({
  usePropertyReviews: vi.fn(),
}));

import { usePropertyReviews } from '@/services/propertyService';

const emptyReviewsData: ReviewsResponse = {
  reviews: [],
  pagination: { page: 1, size: 10, total_results: 0, total_pages: 0 },
  avg_rating: 0,
  total_reviews: 0,
};

const reviewsData: ReviewsResponse = {
  reviews: [
    {
      id: 'rev-1',
      guest_name: 'Alice',
      guest_avatar_url: null,
      rating: 5,
      comment: 'Amazing place, would stay again!',
      created_at: '2026-03-15T10:00:00Z',
    },
    {
      id: 'rev-2',
      guest_name: 'Bob',
      guest_avatar_url: 'https://example.com/avatar.jpg',
      rating: 4,
      comment: 'Great location and clean apartment.',
      created_at: '2026-02-10T14:00:00Z',
    },
  ],
  pagination: { page: 1, size: 10, total_results: 2, total_pages: 1 },
  avg_rating: 4.5,
  total_reviews: 2,
};

describe('ReviewList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('shows loading state while fetching on first page', () => {
      (usePropertyReviews as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<ReviewList propertyId="prop-1" avgRating={null} reviewCount={0} />);
      expect(screen.getByTestId('review-list-loading')).toBeInTheDocument();
      expect(screen.getByLabelText(/loading reviews/i)).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('shows error message when request fails', () => {
      (usePropertyReviews as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      });

      render(<ReviewList propertyId="prop-1" avgRating={null} reviewCount={0} />);
      expect(screen.getByTestId('review-list-error')).toBeInTheDocument();
      expect(screen.getByText(/failed to load reviews/i)).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('shows "No reviews yet" when total_reviews is 0', () => {
      (usePropertyReviews as ReturnType<typeof vi.fn>).mockReturnValue({
        data: emptyReviewsData,
        isLoading: false,
        error: null,
      });

      render(<ReviewList propertyId="prop-1" avgRating={null} reviewCount={0} />);
      expect(screen.getByTestId('review-list-empty')).toBeInTheDocument();
      expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
    });

    it('shows "No rating yet" in aggregate when no reviews', () => {
      (usePropertyReviews as ReturnType<typeof vi.fn>).mockReturnValue({
        data: emptyReviewsData,
        isLoading: false,
        error: null,
      });

      render(<ReviewList propertyId="prop-1" avgRating={null} reviewCount={0} />);
      expect(screen.getByText(/no rating yet/i)).toBeInTheDocument();
    });
  });

  describe('Reviews present', () => {
    beforeEach(() => {
      (usePropertyReviews as ReturnType<typeof vi.fn>).mockReturnValue({
        data: reviewsData,
        isLoading: false,
        error: null,
      });
    });

    it('renders review list container', () => {
      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={2} />);
      expect(screen.getByTestId('review-list')).toBeInTheDocument();
    });

    it('renders individual review cards', () => {
      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={2} />);
      const cards = screen.getAllByTestId('review-card');
      expect(cards).toHaveLength(2);
    });

    it('renders guest names', () => {
      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={2} />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('renders review comments', () => {
      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={2} />);
      expect(screen.getByText('Amazing place, would stay again!')).toBeInTheDocument();
      expect(screen.getByText('Great location and clean apartment.')).toBeInTheDocument();
    });

    it('shows aggregate rating', () => {
      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={2} />);
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('shows review count', () => {
      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={2} />);
      expect(screen.getByText(/2 reviews/i)).toBeInTheDocument();
    });

    it('renders avatar fallback with initial when no avatar_url', () => {
      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={2} />);
      // Alice has no avatar_url, should show initial 'A'
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('renders guest avatar image when avatar_url is set', () => {
      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={2} />);
      const img = screen.getByAltText(/bob avatar/i);
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  describe('Pagination', () => {
    it('does NOT show "Load more" when all reviews fit on one page', () => {
      (usePropertyReviews as ReturnType<typeof vi.fn>).mockReturnValue({
        data: reviewsData,
        isLoading: false,
        error: null,
      });

      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={2} />);
      expect(screen.queryByTestId('review-load-more')).not.toBeInTheDocument();
    });

    it('shows "Load more" button when there are more pages', () => {
      (usePropertyReviews as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          ...reviewsData,
          pagination: { page: 1, size: 10, total_results: 25, total_pages: 3 },
          total_reviews: 25,
        },
        isLoading: false,
        error: null,
      });

      render(<ReviewList propertyId="prop-1" avgRating={4.5} reviewCount={25} />);
      expect(screen.getByTestId('review-load-more')).toBeInTheDocument();
    });
  });
});
