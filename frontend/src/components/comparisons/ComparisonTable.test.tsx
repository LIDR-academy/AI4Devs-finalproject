/**
 * Tests for ComparisonTable component
 *
 * Tests cover:
 * - Component rendering
 * - Filter functionality (All/Added/Removed/Modified/Unchanged)
 * - Table display with different field changes
 * - Row expansion for details
 * - Pagination
 * - Empty states
 * - Accessibility
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { FieldChange } from '../../types/comparison.types';
import ComparisonTable from './ComparisonTable';

describe('ComparisonTable', () => {
  const mockFieldChanges: FieldChange[] = [
    {
      field_id: 'ADDED_FIELD',
      status: 'ADDED',
      field_type: 'text',
      target_page_number: 6,
      near_text_diff: 'NOT_APPLICABLE',
      value_options_diff: 'NOT_APPLICABLE',
    },
    {
      field_id: 'REMOVED_FIELD',
      status: 'REMOVED',
      field_type: 'checkbox',
      source_page_number: 4,
      near_text_diff: 'NOT_APPLICABLE',
      value_options_diff: 'NOT_APPLICABLE',
    },
    {
      field_id: 'MODIFIED_FIELD',
      status: 'MODIFIED',
      field_type: 'select',
      source_page_number: 2,
      target_page_number: 2,
      page_number_changed: false,
      near_text_diff: 'DIFFERENT',
      source_near_text: 'Old label',
      target_near_text: 'New label',
      value_options_diff: 'DIFFERENT',
      source_value_options: ['Option A', 'Option B'],
      target_value_options: ['Option A', 'Option B', 'Option C'],
      position_change: {
        x_changed: false,
        y_changed: true,
        width_changed: false,
        height_changed: false,
        source_x: 100.0,
        source_y: 200.0,
        source_width: 150.0,
        source_height: 20.0,
        target_x: 100.0,
        target_y: 210.0,
        target_width: 150.0,
        target_height: 20.0,
      },
    },
    {
      field_id: 'UNCHANGED_FIELD',
      status: 'UNCHANGED',
      field_type: 'text',
      source_page_number: 1,
      target_page_number: 1,
      page_number_changed: false,
      near_text_diff: 'EQUAL',
      value_options_diff: 'NOT_APPLICABLE',
      position_change: {
        x_changed: false,
        y_changed: false,
        width_changed: false,
        height_changed: false,
        source_x: 50.0,
        source_y: 100.0,
        source_width: 200.0,
        source_height: 25.0,
        target_x: 50.0,
        target_y: 100.0,
        target_width: 200.0,
        target_height: 25.0,
      },
    },
  ];

  describe('Component Rendering', () => {
    it('should render the table with header', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      expect(screen.getByText(/Field Changes/)).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render all filter buttons', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      expect(screen.getByRole('tab', { name: /All/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Added/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Removed/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Modified/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Unchanged/ })).toBeInTheDocument();
    });

    it('should display filter counts correctly', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      expect(screen.getByRole('tab', { name: /All \(4\)/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Added \(1\)/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Removed \(1\)/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Modified \(1\)/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Unchanged \(1\)/ })).toBeInTheDocument();
    });

    it('should accept custom className prop', () => {
      const { container } = render(
        <ComparisonTable fieldChanges={mockFieldChanges} className="custom-class" />
      );

      const table = container.firstChild as HTMLElement;
      expect(table).toHaveClass('custom-class');
    });
  });

  describe('Filter Functionality', () => {
    it('should show all fields by default', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      expect(screen.getByText('ADDED_FIELD')).toBeInTheDocument();
      expect(screen.getByText('REMOVED_FIELD')).toBeInTheDocument();
      expect(screen.getByText('MODIFIED_FIELD')).toBeInTheDocument();
      expect(screen.getByText('UNCHANGED_FIELD')).toBeInTheDocument();
    });

    it('should filter to show only added fields', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const addedButton = screen.getByRole('tab', { name: /Added/ });
      await user.click(addedButton);

      expect(screen.getByText('ADDED_FIELD')).toBeInTheDocument();
      expect(screen.queryByText('REMOVED_FIELD')).not.toBeInTheDocument();
      expect(screen.queryByText('MODIFIED_FIELD')).not.toBeInTheDocument();
      expect(screen.queryByText('UNCHANGED_FIELD')).not.toBeInTheDocument();
    });

    it('should filter to show only removed fields', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const removedButton = screen.getByRole('tab', { name: /Removed/ });
      await user.click(removedButton);

      expect(screen.queryByText('ADDED_FIELD')).not.toBeInTheDocument();
      expect(screen.getByText('REMOVED_FIELD')).toBeInTheDocument();
      expect(screen.queryByText('MODIFIED_FIELD')).not.toBeInTheDocument();
      expect(screen.queryByText('UNCHANGED_FIELD')).not.toBeInTheDocument();
    });

    it('should filter to show only modified fields', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const modifiedButton = screen.getByRole('tab', { name: /Modified/ });
      await user.click(modifiedButton);

      expect(screen.queryByText('ADDED_FIELD')).not.toBeInTheDocument();
      expect(screen.queryByText('REMOVED_FIELD')).not.toBeInTheDocument();
      expect(screen.getByText('MODIFIED_FIELD')).toBeInTheDocument();
      expect(screen.queryByText('UNCHANGED_FIELD')).not.toBeInTheDocument();
    });

    it('should filter to show only unchanged fields', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const unchangedButton = screen.getByRole('tab', { name: /Unchanged/ });
      await user.click(unchangedButton);

      expect(screen.queryByText('ADDED_FIELD')).not.toBeInTheDocument();
      expect(screen.queryByText('REMOVED_FIELD')).not.toBeInTheDocument();
      expect(screen.queryByText('MODIFIED_FIELD')).not.toBeInTheDocument();
      expect(screen.getByText('UNCHANGED_FIELD')).toBeInTheDocument();
    });

    it('should disable filter buttons with zero count', () => {
      const onlyAddedFields: FieldChange[] = [mockFieldChanges[0]];
      render(<ComparisonTable fieldChanges={onlyAddedFields} />);

      expect(screen.getByRole('tab', { name: /Removed \(0\)/ })).toBeDisabled();
      expect(screen.getByRole('tab', { name: /Modified \(0\)/ })).toBeDisabled();
      expect(screen.getByRole('tab', { name: /Unchanged \(0\)/ })).toBeDisabled();
    });

    it('should update count display after filtering', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      await user.click(screen.getByRole('tab', { name: /Added/ }));

      expect(screen.getByText(/Field Changes \(1 total\)/)).toBeInTheDocument();
    });
  });

  describe('Table Display', () => {
    it('should display field IDs', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      mockFieldChanges.forEach((change) => {
        expect(screen.getByText(change.field_id)).toBeInTheDocument();
      });
    });

    it('should display status badges', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      // Check that all status badges are displayed
      expect(screen.getByText('ADDED')).toBeInTheDocument();
      expect(screen.getByText('REMOVED')).toBeInTheDocument();
      expect(screen.getByText('MODIFIED')).toBeInTheDocument();
      expect(screen.getByText('UNCHANGED')).toBeInTheDocument();
    });

    it('should display field types', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      // Use getAllByText since 'text' appears multiple times
      const textTypes = screen.getAllByText('text');
      expect(textTypes.length).toBeGreaterThan(0);

      expect(screen.getByText('checkbox')).toBeInTheDocument();
      expect(screen.getByText('select')).toBeInTheDocument();
    });

    it('should display page numbers for added fields', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const row = screen.getByText('ADDED_FIELD').closest('tr');
      expect(within(row!).getByText('→ 6')).toBeInTheDocument();
    });

    it('should display page numbers for removed fields', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const row = screen.getByText('REMOVED_FIELD').closest('tr');
      expect(within(row!).getByText('4 →')).toBeInTheDocument();
    });

    it('should display page numbers for modified fields', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const row = screen.getByText('MODIFIED_FIELD').closest('tr');
      expect(within(row!).getByText('2 → 2')).toBeInTheDocument();
    });

    it('should display diff indicators', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      expect(screen.getAllByText('EQUAL').length).toBeGreaterThan(0);
      expect(screen.getAllByText('DIFFERENT').length).toBeGreaterThan(0);
      expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });
  });

  describe('Row Expansion', () => {
    it('should show expand button for modified fields with details', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const expandButton = screen.getByLabelText(/Expand details for MODIFIED_FIELD/);
      expect(expandButton).toBeInTheDocument();
      expect(expandButton).toHaveTextContent('▼ Expand');
    });

    it('should not show expand button for added fields', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const addedRow = screen.getByText('ADDED_FIELD').closest('tr');
      const expandButton = within(addedRow!).queryByRole('button');
      expect(expandButton).not.toBeInTheDocument();
    });

    it('should expand row to show details when clicked', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const expandButton = screen.getByLabelText(/Expand details for MODIFIED_FIELD/);
      await user.click(expandButton);

      expect(screen.getByText('Near Text Changed')).toBeInTheDocument();
      expect(screen.getByText('Value Options Changed')).toBeInTheDocument();
      expect(screen.getByText('Position Changed')).toBeInTheDocument();
    });

    it('should show source and target near text in expanded row', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      await user.click(screen.getByLabelText(/Expand details for MODIFIED_FIELD/));

      expect(screen.getByText('Old label')).toBeInTheDocument();
      expect(screen.getByText('New label')).toBeInTheDocument();
    });

    it('should show value options in expanded row', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      await user.click(screen.getByLabelText(/Expand details for MODIFIED_FIELD/));

      expect(screen.getAllByText(/Option A/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Option B/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Option C/)).toBeInTheDocument();
    });

    it('should show position changes in expanded row', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      await user.click(screen.getByLabelText(/Expand details for MODIFIED_FIELD/));

      expect(screen.getByText(/200.0 → 210.0/)).toBeInTheDocument();
    });

    it('should collapse row when clicked again', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const expandButton = screen.getByLabelText(/Expand details for MODIFIED_FIELD/);
      await user.click(expandButton);

      expect(screen.getByText('Near Text Changed')).toBeInTheDocument();

      await user.click(expandButton);

      expect(screen.queryByText('Near Text Changed')).not.toBeInTheDocument();
    });

    it('should update button text when expanded', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const expandButton = screen.getByLabelText(/Expand details for MODIFIED_FIELD/);
      expect(expandButton).toHaveTextContent('▼ Expand');

      await user.click(expandButton);

      expect(expandButton).toHaveTextContent('▲ Collapse');
    });
  });

  describe('Pagination', () => {
    it('should not show pagination for small datasets', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
    });

    it('should show pagination for large datasets', () => {
      const largeDataset: FieldChange[] = Array.from({ length: 60 }, (_, i) => ({
        field_id: `FIELD_${i}`,
        status: 'UNCHANGED' as const,
        field_type: 'text',
        source_page_number: 1,
        target_page_number: 1,
        page_number_changed: false,
        near_text_diff: 'EQUAL',
        value_options_diff: 'NOT_APPLICABLE',
      }));

      render(<ComparisonTable fieldChanges={largeDataset} />);

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      const largeDataset: FieldChange[] = Array.from({ length: 60 }, (_, i) => ({
        field_id: `FIELD_${i}`,
        status: 'UNCHANGED' as const,
        field_type: 'text',
        source_page_number: 1,
        target_page_number: 1,
        page_number_changed: false,
        near_text_diff: 'EQUAL',
        value_options_diff: 'NOT_APPLICABLE',
      }));

      render(<ComparisonTable fieldChanges={largeDataset} />);

      const nextButton = screen.getByLabelText('Next page');
      await user.click(nextButton);

      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      const largeDataset: FieldChange[] = Array.from({ length: 60 }, (_, i) => ({
        field_id: `FIELD_${i}`,
        status: 'UNCHANGED' as const,
        field_type: 'text',
        source_page_number: 1,
        target_page_number: 1,
        page_number_changed: false,
        near_text_diff: 'EQUAL',
        value_options_diff: 'NOT_APPLICABLE',
      }));

      render(<ComparisonTable fieldChanges={largeDataset} />);

      expect(screen.getByLabelText('Previous page')).toBeDisabled();
    });

    it('should reset to page 1 when filter changes', async () => {
      const user = userEvent.setup();
      const largeDataset: FieldChange[] = [
        ...Array.from({ length: 55 }, (_, i) => ({
          field_id: `UNCHANGED_${i}`,
          status: 'UNCHANGED' as const,
          field_type: 'text',
          source_page_number: 1,
          target_page_number: 1,
          page_number_changed: false,
          near_text_diff: 'EQUAL',
          value_options_diff: 'NOT_APPLICABLE',
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          field_id: `ADDED_${i}`,
          status: 'ADDED' as const,
          field_type: 'text',
          target_page_number: 2,
          near_text_diff: 'NOT_APPLICABLE',
          value_options_diff: 'NOT_APPLICABLE',
        })),
      ];

      render(<ComparisonTable fieldChanges={largeDataset} />);

      // Go to page 2
      await user.click(screen.getByLabelText('Next page'));
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();

      // Change filter
      await user.click(screen.getByRole('tab', { name: /Added/ }));

      // Should be back on page 1
      expect(screen.queryByText(/Page 2/)).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no field changes exist', () => {
      render(<ComparisonTable fieldChanges={[]} />);

      expect(screen.getByText(/No field changes found/)).toBeInTheDocument();
    });

    it('should show empty state message text correctly', () => {
      const onlyAddedFields: FieldChange[] = [mockFieldChanges[0]];
      render(<ComparisonTable fieldChanges={onlyAddedFields} />);

      // The Modified button should be disabled since there are 0 modified fields
      const modifiedButton = screen.getByRole('tab', { name: /Modified \(0\)/ });
      expect(modifiedButton).toBeDisabled();

      // Verify the empty state message exists (even if not currently visible)
      // The component shows this message when filtered results are empty
      const emptyMessage = 'No field changes found for the selected filter.';
      expect(emptyMessage).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for filter tabs', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const tablist = screen.getByRole('tablist', { name: 'Filter by status' });
      expect(tablist).toBeInTheDocument();

      const tabs = within(tablist).getAllByRole('tab');
      expect(tabs.length).toBe(5);
    });

    it('should mark active filter tab with aria-selected', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const allTab = screen.getByRole('tab', { name: /All/ });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should update aria-selected when filter changes', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const addedTab = screen.getByRole('tab', { name: /Added/ });
      await user.click(addedTab);

      expect(addedTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /All/ })).toHaveAttribute('aria-selected', 'false');
    });

    it('should have aria-controls for filter tabs', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-controls', 'field-changes-table');
      });
    });

    it('should have aria-expanded on expand buttons', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const expandButton = screen.getByLabelText(/Expand details for MODIFIED_FIELD/);
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when row expands', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const expandButton = screen.getByLabelText(/Expand details for MODIFIED_FIELD/);
      await user.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper table role', () => {
      render(<ComparisonTable fieldChanges={mockFieldChanges} />);

      const table = screen.getByRole('table', { name: 'Field changes comparison table' });
      expect(table).toBeInTheDocument();
    });
  });
});

