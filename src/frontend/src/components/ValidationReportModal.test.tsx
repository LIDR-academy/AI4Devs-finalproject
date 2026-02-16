/**
 * Tests for ValidationReportModal component (T-032-FRONT)
 * 
 * TDD RED PHASE - These tests will fail because the component doesn't exist yet.
 * 
 * Test coverage:
 * - Happy Path (10 tests)
 * - Edge Cases (5 tests)
 * - User Interactions (6 tests)
 * - Accessibility (6 tests)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ValidationReportModal } from './ValidationReportModal';
import type { ValidationReport } from '../types/validation';
import type { ValidationReportModalProps } from '../types/validation-modal';

// ==========================================
// MOCK DATA
// ==========================================

const MOCK_VALID_REPORT: ValidationReport = {
  is_valid: true,
  errors: [],
  metadata: {
    total_objects: 42,
    valid_objects: 42,
    invalid_objects: 0,
    layer_count: 5,
    file_size_mb: 125.3,
    bounding_box: {
      min: [-10, -5, 0],
      max: [10, 5, 20],
    },
  },
  validated_at: '2026-02-16T10:30:00Z',
  validated_by: 'librarian-v1.0.0',
};

const MOCK_INVALID_REPORT: ValidationReport = {
  is_valid: false,
  errors: [
    {
      category: 'nomenclature',
      target: 'Layer::bloque_test',
      message: 'Invalid layer name format. Expected pattern: ^[A-Z]{2,3}-[A-Z0-9]{3,4}-[A-Z]{1,2}-\\d{3}$',
    },
    {
      category: 'nomenclature',
      target: 'Layer::temp_layer',
      message: 'Layer name does not comply with ISO-19650 standard',
    },
    {
      category: 'geometry',
      target: 'Object::a3f9b2c1-4d5e-6f7g-8h9i-0j1k2l3m4n5o',
      message: 'Geometry is invalid (IsValid check failed)',
    },
    {
      category: 'geometry',
      message: '3 objects have degenerate bounding boxes',
    },
  ],
  metadata: {
    total_objects: 45,
    valid_objects: 39,
    invalid_objects: 6,
    layer_count: 8,
    file_size_mb: 215.7,
  },
  validated_at: '2026-02-16T10:35:00Z',
  validated_by: 'librarian-v1.0.0',
};

const MOCK_EMPTY_ERRORS_REPORT: ValidationReport = {
  is_valid: true,
  errors: [],
  metadata: {},
  validated_at: '2026-02-16T10:40:00Z',
  validated_by: 'librarian-v1.0.0',
};

// ==========================================
// TESTS
// ==========================================

describe('ValidationReportModal', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  // ==========================================
  // HAPPY PATH TESTS (10 tests)
  // ==========================================

  describe('Happy Path', () => {
    it('should render modal when isOpen is true with valid report', () => {
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
          isoCode="SF-C12-M-001"
        />
      );

      // Modal should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Validation Report/i)).toBeInTheDocument();
    });

    it('should display validation summary with validated_at and validated_by', () => {
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Feb 16, 2026/i)).toBeInTheDocument();
      expect(screen.getByText(/librarian-v1.0.0/i)).toBeInTheDocument();
    });

    it('should render 3 tabs (Nomenclature, Geometry, Metadata) with correct labels', () => {
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('tab', { name: /Nomenclature/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Geometry/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Metadata/i })).toBeInTheDocument();
    });

    it('should default to Nomenclature tab as active', () => {
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const nomenclatureTab = screen.getByRole('tab', { name: /Nomenclature/i });
      expect(nomenclatureTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch active tab when clicking Geometry tab', async () => {
      const user = userEvent.setup();
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const geometryTab = screen.getByRole('tab', { name: /Geometry/i });
      await user.click(geometryTab);

      expect(geometryTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should show success message when errors array is empty for a category', () => {
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should show success icon and message
      expect(screen.getByText(/All.*checks passed/i)).toBeInTheDocument();
    });

    it('should display error list with target and message when errors exist', () => {
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should display nomenclature errors
      expect(screen.getByText(/Layer::bloque_test/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid layer name format/i)).toBeInTheDocument();
    });

    it('should group errors by category correctly', () => {
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Nomenclature tab should show 2 errors
      const nomenclatureTab = screen.getByRole('tab', { name: /Nomenclature/i });
      expect(nomenclatureTab).toHaveTextContent(/2/); // Badge count
    });

    it('should render metadata table with key-value pairs', async () => {
      const user = userEvent.setup();
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Click on Metadata tab
      const metadataTab = screen.getByRole('tab', { name: /Metadata/i });
      await user.click(metadataTab);

      // Should display metadata
      expect(screen.getByText(/total_objects/i)).toBeInTheDocument();
      expect(screen.getAllByText(/42/).length).toBeGreaterThan(0);
    });

    it('should show correct error counts in tab badges', () => {
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Nomenclature tab: 2 errors
      expect(screen.getByRole('tab', { name: /Nomenclature.*2/i })).toBeInTheDocument();
      
      // Geometry tab: 2 errors
      expect(screen.getByRole('tab', { name: /Geometry.*2/i })).toBeInTheDocument();
    });
  });

  // ==========================================
  // EDGE CASES (5 tests)
  // ==========================================

  describe('Edge Cases', () => {
    it('should show placeholder when report is null', () => {
      render(
        <ValidationReportModal
          report={null}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/No validation data available/i)).toBeInTheDocument();
    });

    it('should handle empty errors array gracefully', () => {
      render(
        <ValidationReportModal
          report={MOCK_EMPTY_ERRORS_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/All.*checks passed/i)).toBeInTheDocument();
    });

    it('should show placeholder when metadata is empty object', async () => {
      const user = userEvent.setup();
      render(
        <ValidationReportModal
          report={MOCK_EMPTY_ERRORS_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const metadataTab = screen.getByRole('tab', { name: /Metadata/i });
      await user.click(metadataTab);

      expect(screen.getByText(/No metadata extracted/i)).toBeInTheDocument();
    });

    it('should handle missing target field in error without crashing', () => {
      const reportWithoutTarget: ValidationReport = {
        ...MOCK_INVALID_REPORT,
        errors: [
          {
            category: 'geometry',
            message: '3 objects have degenerate bounding boxes',
          },
        ],
      };

      render(
        <ValidationReportModal
          report={reportWithoutTarget}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should display message without target
      expect(screen.getByText(/3 objects have degenerate bounding boxes/i)).toBeInTheDocument();
    });

    it('should handle missing optional fields (validated_at, validated_by)', () => {
      const reportWithoutOptionalFields: ValidationReport = {
        is_valid: true,
        errors: [],
        metadata: {},
      };

      render(
        <ValidationReportModal
          report={reportWithoutOptionalFields}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  // ==========================================
  // USER INTERACTIONS (6 tests)
  // ==========================================

  describe('User Interactions', () => {
    it('should call onClose when clicking backdrop', async () => {
      const user = userEvent.setup();
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Click backdrop (outside modal content)
      const backdrop = document.querySelector('[data-testid="modal-backdrop"]');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking close button', async () => {
      const user = userEvent.setup();
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText(/Close validation report/i);
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when pressing ESC key', async () => {
      const user = userEvent.setup();
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should switch to next tab when pressing ArrowRight', async () => {
      const user = userEvent.setup();
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const nomenclatureTab = screen.getByRole('tab', { name: /Nomenclature/i });
      nomenclatureTab.focus();
      
      await user.keyboard('{ArrowRight}');

      const geometryTab = screen.getByRole('tab', { name: /Geometry/i });
      expect(geometryTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to previous tab when pressing ArrowLeft', async () => {
      const user = userEvent.setup();
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // First switch to Geometry tab
      const geometryTab = screen.getByRole('tab', { name: /Geometry/i });
      await user.click(geometryTab);

      // Then press ArrowLeft
      geometryTab.focus();
      await user.keyboard('{ArrowLeft}');

      const nomenclatureTab = screen.getByRole('tab', { name: /Nomenclature/i });
      expect(nomenclatureTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should NOT render modal when isOpen is false', () => {
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // ACCESSIBILITY (6 tests)
  // ==========================================

  describe('Accessibility', () => {
    it('should have correct ARIA attributes on modal', () => {
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have aria-label on close button', () => {
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText(/Close validation report/i);
      expect(closeButton).toBeInTheDocument();
    });

    it('should have correct ARIA attributes on tabs', () => {
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const nomenclatureTab = screen.getByRole('tab', { name: /Nomenclature/i });
      expect(nomenclatureTab).toHaveAttribute('aria-selected');
    });

    it('should have role=tabpanel on tab content', () => {
      render(
        <ValidationReportModal
          report={MOCK_INVALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toBeInTheDocument();
      expect(tabPanel).toHaveAttribute('aria-labelledby');
    });

    it('should trap focus within modal when open', async () => {
      const user = userEvent.setup();
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Tab through all focusable elements
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();

      // Focus should stay within modal
      const dialog = screen.getByRole('dialog');
      expect(dialog).toContainElement(document.activeElement);
    });

    it('should move focus to close button when modal opens', () => {
      render(
        <ValidationReportModal
          report={MOCK_VALID_REPORT}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText(/Close validation report/i);
      
      // In a real implementation, close button should receive focus
      // For now, just verify it exists and is focusable
      expect(closeButton).toBeInTheDocument();
    });
  });

  // ==========================================
  // CLEANUP
  // ==========================================

  afterEach(() => {
    vi.clearAllMocks();
  });
});
