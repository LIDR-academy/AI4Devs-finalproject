/**
 * Tests for GlobalMetricsCard component
 *
 * Tests cover:
 * - Component rendering with complete metrics
 * - Page count display with change indicators
 * - Field count display with change indicators
 * - Change statistics display
 * - Modification percentage with progress bar
 * - Version metadata display
 * - Timeline visualization
 * - Time difference calculations
 * - Accessibility attributes
 */

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GlobalMetrics } from '../../types/comparison.types';
import GlobalMetricsCard from './GlobalMetricsCard';

describe('GlobalMetricsCard', () => {
  const mockMetricsWithChanges: GlobalMetrics = {
    source_version_number: '2024-Q1',
    target_version_number: '2024-Q2',
    source_page_count: 5,
    target_page_count: 6,
    page_count_changed: true,
    source_field_count: 48,
    target_field_count: 52,
    field_count_changed: true,
    fields_added: 4,
    fields_removed: 0,
    fields_modified: 3,
    fields_unchanged: 45,
    modification_percentage: 14.58,
    source_created_at: '2024-01-15T10:30:00Z',
    target_created_at: '2024-04-20T14:25:00Z',
  };

  const mockMetricsNoChanges: GlobalMetrics = {
    source_version_number: 'v1.0',
    target_version_number: 'v1.0',
    source_page_count: 3,
    target_page_count: 3,
    page_count_changed: false,
    source_field_count: 30,
    target_field_count: 30,
    field_count_changed: false,
    fields_added: 0,
    fields_removed: 0,
    fields_modified: 0,
    fields_unchanged: 30,
    modification_percentage: 0.0,
    source_created_at: '2024-01-01T00:00:00Z',
    target_created_at: '2024-01-01T12:00:00Z',
  };

  describe('Component Rendering', () => {
    it('should render the component with all sections', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      expect(screen.getByText('Comparison Results')).toBeInTheDocument();
      expect(screen.getByText('2024-Q1 → 2024-Q2')).toBeInTheDocument();
      expect(screen.getByLabelText('Page count comparison')).toBeInTheDocument();
      expect(screen.getByLabelText('Field count comparison')).toBeInTheDocument();
      expect(screen.getByLabelText('Change statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Modification percentage')).toBeInTheDocument();
      expect(screen.getByLabelText('Version timeline')).toBeInTheDocument();
    });

    it('should accept custom className prop', () => {
      const { container } = render(
        <GlobalMetricsCard metrics={mockMetricsWithChanges} className="custom-class" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Page Count Display', () => {
    it('should display page count comparison', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const pageCountSection = screen.getByLabelText('Page count comparison');
      expect(within(pageCountSection).getByText('Page Count')).toBeInTheDocument();
      expect(within(pageCountSection).getByText('5 → 6')).toBeInTheDocument();
    });

    it('should show "Changed" indicator when pages differ', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const pageCountSection = screen.getByLabelText('Page count comparison');
      expect(within(pageCountSection).getByText('Changed')).toBeInTheDocument();
      expect(within(pageCountSection).getByText('⚠️')).toBeInTheDocument();
    });

    it('should show "Unchanged" indicator when pages are the same', () => {
      render(<GlobalMetricsCard metrics={mockMetricsNoChanges} />);

      const pageCountSection = screen.getByLabelText('Page count comparison');
      expect(within(pageCountSection).getByText('Unchanged')).toBeInTheDocument();
      expect(within(pageCountSection).getByText('✓')).toBeInTheDocument();
    });
  });

  describe('Field Count Display', () => {
    it('should display field count comparison', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const fieldCountSection = screen.getByLabelText('Field count comparison');
      expect(within(fieldCountSection).getByText('Field Count')).toBeInTheDocument();
      expect(within(fieldCountSection).getByText('48 → 52')).toBeInTheDocument();
    });

    it('should show "Changed" indicator when fields differ', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const fieldCountSection = screen.getByLabelText('Field count comparison');
      expect(within(fieldCountSection).getByText('Changed')).toBeInTheDocument();
    });

    it('should show "Unchanged" indicator when fields are the same', () => {
      render(<GlobalMetricsCard metrics={mockMetricsNoChanges} />);

      const fieldCountSection = screen.getByLabelText('Field count comparison');
      expect(within(fieldCountSection).getByText('Unchanged')).toBeInTheDocument();
    });
  });

  describe('Change Statistics Display', () => {
    it('should display all change statistics', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const changesSection = screen.getByLabelText('Change statistics');
      expect(within(changesSection).getByText('Changes')).toBeInTheDocument();
      expect(within(changesSection).getByText('4 Added')).toBeInTheDocument();
      expect(within(changesSection).getByText('0 Removed')).toBeInTheDocument();
      expect(within(changesSection).getByText('3 Modified')).toBeInTheDocument();
      expect(within(changesSection).getByText('45 Unchanged')).toBeInTheDocument();
    });

    it('should display emojis for each change type', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const changesSection = screen.getByLabelText('Change statistics');
      expect(within(changesSection).getByText('✅')).toBeInTheDocument(); // Added
      expect(within(changesSection).getByText('❌')).toBeInTheDocument(); // Removed
      expect(within(changesSection).getByText('🔄')).toBeInTheDocument(); // Modified
      expect(within(changesSection).getByText('✓')).toBeInTheDocument(); // Unchanged
    });

    it('should display zero values correctly', () => {
      render(<GlobalMetricsCard metrics={mockMetricsNoChanges} />);

      const changesSection = screen.getByLabelText('Change statistics');
      expect(within(changesSection).getByText('0 Added')).toBeInTheDocument();
      expect(within(changesSection).getByText('0 Removed')).toBeInTheDocument();
      expect(within(changesSection).getByText('0 Modified')).toBeInTheDocument();
      expect(within(changesSection).getByText('30 Unchanged')).toBeInTheDocument();
    });
  });

  describe('Modification Percentage Display', () => {
    it('should display modification percentage', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const percentageSection = screen.getByLabelText('Modification percentage');
      expect(within(percentageSection).getByText('Modified')).toBeInTheDocument();
      expect(within(percentageSection).getByText('14.58%')).toBeInTheDocument();
    });

    it('should render progress bar with correct value', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '14.58');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', '14.58% modified');
    });

    it('should display 0% for no changes', () => {
      render(<GlobalMetricsCard metrics={mockMetricsNoChanges} />);

      const percentageSection = screen.getByLabelText('Modification percentage');
      expect(within(percentageSection).getByText('0.00%')).toBeInTheDocument();
    });

    it('should cap progress bar width at 100%', () => {
      const metricsOver100: GlobalMetrics = {
        ...mockMetricsWithChanges,
        modification_percentage: 150.0,
      };

      render(<GlobalMetricsCard metrics={metricsOver100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('Version Metadata Display', () => {
    it('should display source version metadata', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const timeline = screen.getByLabelText('Version timeline');
      expect(within(timeline).getByText('Source')).toBeInTheDocument();
      expect(within(timeline).getByText('2024-Q1')).toBeInTheDocument();
      expect(within(timeline).getByText('Jan 15, 2024')).toBeInTheDocument();
    });

    it('should display target version metadata', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const timeline = screen.getByLabelText('Version timeline');
      expect(within(timeline).getByText('Target')).toBeInTheDocument();
      expect(within(timeline).getByText('2024-Q2')).toBeInTheDocument();
      expect(within(timeline).getByText('Apr 20, 2024')).toBeInTheDocument();
    });

    it('should display timeline arrow', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const timeline = screen.getByLabelText('Version timeline');
      expect(within(timeline).getByText('→')).toBeInTheDocument();
    });
  });

  describe('Time Difference Calculation', () => {
    it('should calculate time difference for months and days', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      // Jan 15 to Apr 20 is approximately 3 months (calculation varies by exact day count)
      expect(screen.getByText(/Time span:/)).toBeInTheDocument();
      expect(screen.getByText(/3 months/)).toBeInTheDocument();
    });

    it('should display "Same day" for same-day versions', () => {
      const sameDayMetrics: GlobalMetrics = {
        ...mockMetricsNoChanges,
        source_created_at: '2024-01-01T08:00:00Z',
        target_created_at: '2024-01-01T16:00:00Z',
      };

      render(<GlobalMetricsCard metrics={sameDayMetrics} />);

      expect(screen.getByText(/Same day/)).toBeInTheDocument();
    });

    it('should display "1 day" for one day difference', () => {
      const oneDayMetrics: GlobalMetrics = {
        ...mockMetricsNoChanges,
        source_created_at: '2024-01-01T00:00:00Z',
        target_created_at: '2024-01-02T00:00:00Z',
      };

      render(<GlobalMetricsCard metrics={oneDayMetrics} />);

      expect(screen.getByText(/1 day/)).toBeInTheDocument();
    });

    it('should display days for less than 30 days', () => {
      const daysMetrics: GlobalMetrics = {
        ...mockMetricsNoChanges,
        source_created_at: '2024-01-01T00:00:00Z',
        target_created_at: '2024-01-15T00:00:00Z',
      };

      render(<GlobalMetricsCard metrics={daysMetrics} />);

      expect(screen.getByText(/14 days/)).toBeInTheDocument();
    });

    it('should display "1 month" for exactly 30 days', () => {
      const oneMonthMetrics: GlobalMetrics = {
        ...mockMetricsNoChanges,
        source_created_at: '2024-01-01T00:00:00Z',
        target_created_at: '2024-01-31T00:00:00Z',
      };

      render(<GlobalMetricsCard metrics={oneMonthMetrics} />);

      expect(screen.getByText(/1 month/)).toBeInTheDocument();
    });

    it('should display months only for exact multiples of 30', () => {
      const twoMonthsMetrics: GlobalMetrics = {
        ...mockMetricsNoChanges,
        source_created_at: '2024-01-01T00:00:00Z',
        target_created_at: '2024-03-01T00:00:00Z',
      };

      render(<GlobalMetricsCard metrics={twoMonthsMetrics} />);

      // Jan 1 to Mar 1 is 60 days = 2 months
      expect(screen.getByText(/2 months/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all sections', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      expect(screen.getByLabelText('Page count comparison')).toBeInTheDocument();
      expect(screen.getByLabelText('Field count comparison')).toBeInTheDocument();
      expect(screen.getByLabelText('Change statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Modification percentage')).toBeInTheDocument();
      expect(screen.getByLabelText('Version timeline')).toBeInTheDocument();
    });

    it('should have role="region" for metric cards', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA attributes on progress bar', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin');
      expect(progressBar).toHaveAttribute('aria-valuemax');
      expect(progressBar).toHaveAttribute('aria-label');
    });

    it('should have role="status" for change indicators', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const statusElements = screen.getAllByRole('status');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should have aria-label for emoji icons', () => {
      render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      // Check for multiple Warning labels (page count and field count changed)
      const warningLabels = screen.getAllByLabelText('Warning');
      expect(warningLabels.length).toBeGreaterThan(0);

      expect(screen.getByLabelText('Added')).toBeInTheDocument();
      expect(screen.getByLabelText('Removed')).toBeInTheDocument();
      expect(screen.getByLabelText('Modified')).toBeInTheDocument();
      expect(screen.getByLabelText('Unchanged')).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative arrow', () => {
      const { container } = render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const arrow = container.querySelector('[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
      expect(arrow?.textContent).toBe('→');
    });
  });

  describe('Responsive Layout', () => {
    it('should apply responsive grid classes', () => {
      const { container } = render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      const { container } = render(<GlobalMetricsCard metrics={mockMetricsWithChanges} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('dark:bg-gray-800');
    });
  });
});

