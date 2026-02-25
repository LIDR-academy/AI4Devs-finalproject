/**
 * T-1008-FRONT: PartMetadataPanel Tests
 * Test suite for metadata display component
 * 
 * @remarks
 * TDD RED PHASE - All tests expected to FAIL
 * Tests describe expected behavior before implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartMetadataPanel } from './PartMetadataPanel';
import type { PartDetail } from '@/types/parts';
import { BlockStatus } from '@/types/parts';
import '@testing-library/jest-dom';

/**
 * Mock PartDetail fixture with all fields populated
 */
const mockPartDetailComplete: PartDetail = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  iso_code: 'SF-C12-D-001',
  status: BlockStatus.Validated,
  tipologia: 'capitel',
  created_at: '2026-02-15T10:30:00Z',
  low_poly_url: 'https://cdn.cloudfront.net/test.glb',
  bbox: {
    min: [-2.5, 0, -2.5],
    max: [2.5, 5, 2.5],
  },
  workshop_id: '123e4567-e89b-12d3-a456-426614174000',
  workshop_name: 'Taller Granollers',
  validation_report: {
    is_valid: true,
    errors: [],
    metadata: { layer_count: 5, object_count: 12 },
    validated_at: '2026-02-15T10:35:00Z',
    validated_by: 'librarian-v1.0.0',
  },
  glb_size_bytes: 425984, // ~416 KB
  triangle_count: 1024,
};

/**
 * Mock PartDetail with all optional fields null
 */
const mockPartDetailNull: PartDetail = {
  id: '123e4567-0000-0000-0000-000000000000',
  iso_code: 'SF-TEST-001',
  status: BlockStatus.Uploaded,
  tipologia: 'columna',
  created_at: '2026-02-20T08:00:00Z',
  low_poly_url: null,
  bbox: null,
  workshop_id: null,
  workshop_name: null,
  validation_report: null,
  glb_size_bytes: null,
  triangle_count: null,
};

/**
 * Mock PartDetail with large file size (5 GB)
 */
const mockPartDetailLargeFile: PartDetail = {
  ...mockPartDetailComplete,
  glb_size_bytes: 5368709120, // 5 GB
};

describe('PartMetadataPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== HAPPY PATH TESTS (5) =====
  describe('Happy Path', () => {
    it('HP-01: should render all 4 section headers', () => {
      render(<PartMetadataPanel part={mockPartDetailComplete} />);

      // All 4 section headers should be visible as buttons (use getByRole to avoid text conflicts)
      expect(screen.getByRole('button', { name: /Información/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Taller/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Geometría/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Validación/i })).toBeInTheDocument();

      // Headers should be buttons (collapsible)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4);
    });

    it('HP-02: should toggle section expansion when header clicked', () => {
      render(<PartMetadataPanel part={mockPartDetailComplete} />);

      // Default: Info section should be expanded (initialExpandedSection='info')
      const infoButton = screen.getByRole('button', { name: /Información/i });
      expect(infoButton).toHaveAttribute('aria-expanded', 'true');

      // Workshop section should be collapsed initially
      const workshopButton = screen.getByRole('button', { name: /Taller/i });
      expect(workshopButton).toHaveAttribute('aria-expanded', 'false');

      // Click workshop header to expand
      fireEvent.click(workshopButton);

      // Workshop section should now be expanded
      expect(workshopButton).toHaveAttribute('aria-expanded', 'true');

      // Workshop content should be visible
      expect(screen.getByText('Taller Granollers')).toBeInTheDocument();
    });

    it('HP-03: should display formatted field values', () => {
      render(<PartMetadataPanel part={mockPartDetailComplete} />);

      // ISO code should be displayed
      expect(screen.getByText('SF-C12-D-001')).toBeInTheDocument();

      // Date should be formatted (not raw ISO string)
      // Expected format: DD/MM/YYYY, HH:MM or similar
      const dateRegex = /15\/02\/2026|15 de febrero de 2026|Feb.*15.*2026/i;
      expect(screen.getByText(dateRegex)).toBeInTheDocument();

      // File size should be formatted (not raw bytes)
      // 425984 bytes = 416.0 KB
      expect(screen.getByText(/416.*KB|0\.4.*MB/i)).toBeInTheDocument();
    });

    it('HP-04: should render status as badge with color', () => {
      render(<PartMetadataPanel part={mockPartDetailComplete} />);

      // Status badge should exist
      const statusBadge = screen.getByText(/validated/i);
      expect(statusBadge).toBeInTheDocument();

      // Badge should have background color styling (green for validated)
      const badgeElement = statusBadge.closest('span') || statusBadge;
      const styles = window.getComputedStyle(badgeElement);
      
      // Check for any green-ish background color
      // RGB values for green should be present
      expect(
        styles.backgroundColor.includes('rgb') ||
        badgeElement.getAttribute('style')?.includes('background')
      ).toBeTruthy();
    });

    it('HP-05: should display workshop name and ID', () => {
      render(<PartMetadataPanel part={mockPartDetailComplete} />);

      // Workshop name should be displayed
      expect(screen.getByText('Taller Granollers')).toBeInTheDocument();

      // Workshop ID should be displayed in monospace
      const workshopId = screen.getByText(/123e4567-e89b-12d3-a456-426614174000/i);
      expect(workshopId).toBeInTheDocument();

      // Monospace font should be applied
      const workshopIdElement = workshopId.closest('span') || workshopId;
      const styles = window.getComputedStyle(workshopIdElement);
      expect(
        styles.fontFamily.includes('monospace') ||
        styles.fontFamily.includes('Monaco') ||
        styles.fontFamily.includes('Courier')
      ).toBeTruthy();
    });
  });

  // ===== EDGE CASES TESTS (4) =====
  describe('Edge Cases', () => {
    it('EC-01: should display placeholders when all optional fields are null', () => {
      render(<PartMetadataPanel part={mockPartDetailNull} />);

      // Workshop should show "No asignado"
      expect(screen.getByText(/No asignado|Sin asignar/i)).toBeInTheDocument();

      // Null numeric fields should show "Sin datos" or "N/A"
      const placeholders = screen.getAllByText(/Sin datos|N\/A|No disponible/i);
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('EC-02: should display message when validation_report is null', () => {
      render(<PartMetadataPanel part={mockPartDetailNull} />);

      // Validation section should show empty state
      expect(
        screen.getByText(/Sin reporte de validación|No hay reporte/i)
      ).toBeInTheDocument();
    });

    it('EC-03: should format large file sizes correctly', () => {
      render(<PartMetadataPanel part={mockPartDetailLargeFile} />);

      // 5368709120 bytes = 5 GB
      // Should display "5.0 GB" not "5368709120 B"
      expect(screen.getByText(/5\.0.*GB|5.*GB/i)).toBeInTheDocument();
      expect(screen.queryByText(/5368709120/)).not.toBeInTheDocument();
    });

    it('EC-04: should handle long UUIDs without breaking layout', () => {
      render(<PartMetadataPanel part={mockPartDetailComplete} />);

      // UUID should be displayed
      const uuidElement = screen.getByText(/550e8400-e29b-41d4-a716-446655440000/i);
      expect(uuidElement).toBeInTheDocument();

      // Container should have overflow handling
      const container = uuidElement.closest('div');
      const styles = container ? window.getComputedStyle(container) : null;
      
      // Should have overflow-x: auto or word-break
      expect(
        styles?.overflowX === 'auto' ||
        styles?.wordBreak === 'break-all' ||
        styles?.wordBreak === 'break-word'
      ).toBeTruthy();
    });
  });

  // ===== ACCESSIBILITY TESTS (3) =====
  describe('Accessibility', () => {
    it('A11Y-01: should have proper ARIA attributes on section headers', () => {
      render(<PartMetadataPanel part={mockPartDetailComplete} />);

      const buttons = screen.getAllByRole('button');
      
      // All section headers should be buttons
      expect(buttons.length).toBeGreaterThanOrEqual(4);

      // Each button should have aria-expanded attribute
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-expanded');
        expect(button).toHaveAttribute('aria-controls');
      });

      // Default expanded section('info') should have aria-expanded="true"
      const infoButton = screen.getByRole('button', { name: /Información/i });
      expect(infoButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('A11Y-02: should support keyboard interaction (Enter/Space)', () => {
      render(<PartMetadataPanel part={mockPartDetailComplete} />);

      const geometryButton = screen.getByRole('button', { name: /Geometría/i });
      
      // Initially collapsed
      expect(geometryButton).toHaveAttribute('aria-expanded', 'false');

      // Press Enter key
      fireEvent.keyDown(geometryButton, { key: 'Enter', code: 'Enter' });

      // Should expand
      expect(geometryButton).toHaveAttribute('aria-expanded', 'true');

      // Press Space key
      fireEvent.keyDown(geometryButton, { key: ' ', code: 'Space' });

      // Should collapse again
      expect(geometryButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('A11Y-03: should have proper region roles for section content', () => {
      render(<PartMetadataPanel part={mockPartDetailComplete} />);

      // Sections should have role="region" and aria-labelledby
      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThan(0);

      // Each region should have aria-labelledby linking to header
      regions.forEach(region => {
        expect(region).toHaveAttribute('aria-labelledby');
      });
    });
  });

  // ===== PROP VALIDATION TESTS (3) =====
  describe('Prop Validation', () => {
    it('PROP-01: should handle missing required prop gracefully', () => {
      // TypeScript should catch this at build time
      // Runtime: Component should not crash
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // @ts-expect-error - Testing missing required prop
      expect(() => render(<PartMetadataPanel />)).not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('PROP-02: should safely access nested validation_report properties', () => {
      const partWithNestedData: PartDetail = {
        ...mockPartDetailComplete,
        validation_report: {
          is_valid: false,
          errors: [
            { category: 'nomenclature', target: 'layer-1', message: 'Invalid name' },
            { category: 'geometry', target: null, message: 'Self-intersecting surface' },
          ],
          metadata: {},
          validated_at: '2026-02-15T10:35:00Z',
          validated_by: 'librarian-v1.0.0',
        },
      };

      // Should not crash when accessing validation_report.errors
      expect(() => render(<PartMetadataPanel part={partWithNestedData} />)).not.toThrow();

      // Validation report should be displayed
      const validationText = screen.getByText(/validation_report/i) || screen.getByText(/Invalid name|nomenclature/i);
      expect(validationText).toBeInTheDocument();
    });

    it('PROP-03: should handle falsy but valid numeric values (0)', () => {
      const partWithZeroTriangles: PartDetail = {
        ...mockPartDetailComplete,
        triangle_count: 0, // Falsy but valid
        glb_size_bytes: 0, // Falsy but valid
      };

      render(<PartMetadataPanel part={partWithZeroTriangles} />);

      // Should display "0" not "N/A" or empty placeholder
      const zeroText = screen.getAllByText('0');
      expect(zeroText.length).toBeGreaterThan(0);

      // Should NOT display "N/A" for these fields
      // (but may display it for genuinely null fields)
    });
  });
});
