import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PhotoGallery } from './PhotoGallery';
import type { Photo } from './PhotoGallery';

const singlePhoto: Photo[] = [
  { url: 'https://example.com/photo1.jpg', caption: 'Living room' },
];

const multiplePhotos: Photo[] = [
  { url: 'https://example.com/photo1.jpg', caption: 'Living room' },
  { url: 'https://example.com/photo2.jpg', caption: 'Bedroom' },
  { url: 'https://example.com/photo3.jpg', caption: 'Kitchen' },
];

describe('PhotoGallery Component', () => {
  describe('Empty state', () => {
    it('renders placeholder when photos array is empty', () => {
      render(<PhotoGallery photos={[]} />);
      expect(screen.getByTestId('photo-gallery-placeholder')).toBeInTheDocument();
      expect(screen.getByText(/no photos available/i)).toBeInTheDocument();
    });
  });

  describe('Single photo', () => {
    it('renders primary photo with correct src and alt', () => {
      render(<PhotoGallery photos={singlePhoto} />);
      const img = screen.getByAltText('Living room');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/photo1.jpg');
    });

    it('does not render thumbnail strip for single photo', () => {
      render(<PhotoGallery photos={singlePhoto} />);
      const thumbnails = screen.queryByRole('list', { name: /photo thumbnails/i });
      expect(thumbnails).not.toBeInTheDocument();
    });
  });

  describe('Multiple photos', () => {
    it('renders primary photo (first by default)', () => {
      render(<PhotoGallery photos={multiplePhotos} />);
      const primaryBtn = screen.getByRole('button', { name: /view living room in full screen/i });
      expect(primaryBtn).toBeInTheDocument();
    });

    it('renders thumbnail strip with all photos', () => {
      render(<PhotoGallery photos={multiplePhotos} />);
      const thumbnailList = screen.getByRole('list', { name: /photo thumbnails/i });
      expect(thumbnailList).toBeInTheDocument();
      const thumbButtons = screen.getAllByRole('listitem');
      expect(thumbButtons).toHaveLength(3);
    });

    it('clicking a thumbnail swaps the primary photo', () => {
      render(<PhotoGallery photos={multiplePhotos} />);

      // Initial primary is photo 1 (Living room)
      expect(screen.getByRole('button', { name: /view living room in full screen/i })).toBeInTheDocument();

      // Click second thumbnail
      const thumbButtons = screen.getAllByRole('listitem');
      fireEvent.click(thumbButtons[1]);

      // Primary should now show Bedroom
      expect(screen.getByRole('button', { name: /view bedroom in full screen/i })).toBeInTheDocument();
    });

    it('marks active thumbnail with aria-pressed=true', () => {
      render(<PhotoGallery photos={multiplePhotos} />);
      const thumbButtons = screen.getAllByRole('listitem');
      expect(thumbButtons[0]).toHaveAttribute('aria-pressed', 'true');
      expect(thumbButtons[1]).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows photo counter in primary photo', () => {
      render(<PhotoGallery photos={multiplePhotos} />);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  describe('Lightbox', () => {
    it('opens lightbox when primary photo is clicked', () => {
      render(<PhotoGallery photos={multiplePhotos} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      const primaryBtn = screen.getByRole('button', { name: /view living room in full screen/i });
      fireEvent.click(primaryBtn);

      expect(screen.getByRole('dialog', { name: /lightbox/i })).toBeInTheDocument();
    });

    it('closes lightbox when close button is clicked', () => {
      render(<PhotoGallery photos={multiplePhotos} />);

      fireEvent.click(screen.getByRole('button', { name: /view living room in full screen/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /close lightbox/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('navigates to next photo in lightbox', () => {
      render(<PhotoGallery photos={multiplePhotos} />);

      fireEvent.click(screen.getByRole('button', { name: /view living room in full screen/i }));
      expect(screen.getByText('Living room')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /next photo/i }));
      expect(screen.getByText('Bedroom')).toBeInTheDocument();
    });

    it('navigates to previous photo in lightbox', () => {
      render(<PhotoGallery photos={multiplePhotos} />);

      // Open on photo 2
      const thumbButtons = screen.getAllByRole('listitem');
      fireEvent.click(thumbButtons[1]);
      fireEvent.click(screen.getByRole('button', { name: /view bedroom in full screen/i }));

      fireEvent.click(screen.getByRole('button', { name: /previous photo/i }));
      expect(screen.getByText('Living room')).toBeInTheDocument();
    });
  });

  describe('Editorial token styling', () => {
    it('marks the active thumbnail with the terracotta border', () => {
      render(<PhotoGallery photos={[{ url: 'a', caption: 'A' }, { url: 'b', caption: 'B' }]} />);
      expect(screen.getAllByRole('listitem')[0].className).toContain('border-terracotta');
      expect(screen.getAllByRole('listitem')[1].className).toContain('border-transparent');
      expect(screen.getAllByRole('listitem')[1].className).not.toContain('border-terracotta');
    });
  });
});
