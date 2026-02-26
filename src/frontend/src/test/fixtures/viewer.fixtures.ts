/**
 * T-1009-TEST-FRONT: 3D Viewer Integration Test Fixtures
 * 
 * Provides mock PartDetail objects for testing the full 3D viewer flow:
 * Dashboard3D → PartDetailModal → ModelLoader → PartViewerCanvas
 * 
 * These fixtures extend parts.fixtures.ts (PartCanvasItem) with the full
 * 12-field PartDetail interface required by T-1002-BACK API contract.
 * 
 * @module test/fixtures/viewer.fixtures
 */

import { BlockStatus, type PartDetail } from '@/types/parts';
import type { AdjacentPartsInfo } from '@/types/modal';

/**
 * Mock PartDetail: Capitel (Capital) - Validated Status with GLB
 * 
 * Full 12-field object matching GET /api/parts/{id} response schema.
 * Used for happy path tests where model loads successfully.
 * 
 * @example
 * ```typescript
 * vi.mocked(uploadService.getPartDetail).mockResolvedValue(mockPartDetailCapitel);
 * render(<ModelLoader partId={mockPartDetailCapitel.id} />);
 * ```
 */
export const mockPartDetailCapitel: PartDetail = {
  id: 'test-part-capitel-001',
  iso_code: 'SF-C12-CAP-001',
  status: BlockStatus.Validated,
  tipologia: 'capitel',
  created_at: '2026-02-15T10:00:00Z',
  low_poly_url: 'https://cdn.cloudfront.net/low-poly/capitel-001.glb',
  bbox: {
    min: [-1, 0, -1],
    max: [1, 2, 1],
  },
  workshop_id: 'workshop-granollers-123',
  workshop_name: 'Taller Granollers',
  validation_report: null, // No errors, validated successfully
  glb_size_bytes: 52000, // ~50 KB
  triangle_count: 500,
};

/**
 * Mock PartDetail: Columna (Column) - In Fabrication Status
 * 
 * Part currently being fabricated in workshop, with larger geometry.
 */
export const mockPartDetailColumna: PartDetail = {
  id: 'test-part-columna-002',
  iso_code: 'SF-C12-COL-002',
  status: BlockStatus.InFabrication,
  tipologia: 'columna',
  created_at: '2026-02-20T14:30:00Z',
  low_poly_url: 'https://cdn.cloudfront.net/low-poly/columna-002.glb',
  bbox: {
    min: [-2, 0, -2],
    max: [2, 5, 2],
  },
  workshop_id: 'workshop-barcelona-456',
  workshop_name: 'Taller Barcelona',
  validation_report: null,
  glb_size_bytes: 120000, // ~120 KB
  triangle_count: 800,
};

/**
 * Mock PartDetail: Dovela (Voussoir) - Processing State (No GLB Yet)
 * 
 * Part uploaded but geometry not processed yet.
 * Used to test BBoxProxy fallback when low_poly_url is null.
 */
export const mockPartDetailProcessing: PartDetail = {
  id: 'test-part-processing-003',
  iso_code: 'SF-C12-DOV-003',
  status: BlockStatus.Uploaded, // Not validated yet
  tipologia: 'dovela',
  created_at: '2026-02-25T08:00:00Z',
  low_poly_url: null, // ⚠️ Not processed yet
  bbox: {
    min: [-1.5, 0, -1.5],
    max: [1.5, 1, 1.5],
  },
  workshop_id: null, // Not assigned to workshop yet
  workshop_name: null,
  validation_report: null,
  glb_size_bytes: null, // No GLB generated yet
  triangle_count: null,
};

/**
 * Mock PartDetail: Clave (Keystone) - Invalidated with Errors
 * 
 * Part that failed validation with geometry errors.
 * Used to test error display in metadata panel.
 */
export const mockPartDetailInvalidated: PartDetail = {
  id: 'test-part-invalidated-004',
  iso_code: 'SF-C12-CLA-004',
  status: BlockStatus.Rejected, // Failed validation
  tipologia: 'clave',
  created_at: '2026-02-22T16:00:00Z',
  low_poly_url: 'https://cdn.cloudfront.net/low-poly/clave-004.glb',
  bbox: {
    min: [-0.5, 0, -0.5],
    max: [0.5, 0.5, 0.5],
  },
  workshop_id: 'workshop-granollers-123',
  workshop_name: 'Taller Granollers',
  validation_report: {
    // Validation errors from Librarian agent
    is_valid: false,
    errors: [
      {
        category: 'nomenclature',
        target: 'iso_code',
        message: 'ISO code format invalid: missing dash separator',
      },
      {
        category: 'geometry',
        target: 'Layer 01',
        message: 'Geometry contains self-intersecting surfaces',
      },
    ],
    metadata: {
      rhino_version: '7.0',
      units: 'millimeters',
    },
    validated_at: '2026-02-22T16:05:00Z',
    validated_by: 'librarian-worker-01',
  },
  glb_size_bytes: 45000,
  triangle_count: 450,
};

/**
 * Mock PartDetail: 404 Error (Part Not Found)
 * 
 * Represents API response when part ID doesn't exist.
 * Used to test error handling in ModelLoader.
 */
export const mockPartDetailNotFound = {
  error: 'Part not found',
  detail: 'No part exists with ID: invalid-uuid-404',
  status: 404,
};

/**
 * Mock PartDetail: GLB Load Error (Invalid URL)
 * 
 * Part with corrupted or inaccessible GLB URL.
 * Used to test WebGL/useGLTF error handling.
 */
export const mockPartDetailGLBError: PartDetail = {
  id: 'test-part-glb-error-005',
  iso_code: 'SF-C12-IMP-005',
  status: BlockStatus.Validated,
  tipologia: 'imposta',
  created_at: '2026-02-23T12:00:00Z',
  low_poly_url: 'https://cdn.cloudfront.net/invalid-path/does-not-exist.glb', // ⚠️ 404 URL
  bbox: {
    min: [-1, 0, -1],
    max: [1, 1.5, 1],
  },
  workshop_id: 'workshop-barcelona-456',
  workshop_name: 'Taller Barcelona',
  validation_report: null,
  glb_size_bytes: 60000,
  triangle_count: 550,
};

/**
 * Mock Navigation: Adjacent Parts Info
 * 
 * Response from GET /api/parts/{id}/navigation endpoint (T-1003-BACK).
 * Used to test Prev/Next button functionality.
 */
export const mockAdjacentPartsDefault: AdjacentPartsInfo = {
  prev_id: 'test-part-prev-uuid',
  next_id: 'test-part-next-uuid',
  current_index: 5,
  total_count: 20,
};

/**
 * Mock Navigation: First Part (No Previous)
 * 
 * Used to test disabled "Prev" button at list start.
 */
export const mockAdjacentPartsFirst: AdjacentPartsInfo = {
  prev_id: null, // ⚠️ No previous part
  next_id: 'test-part-next-uuid',
  current_index: 0,
  total_count: 20,
};

/**
 * Mock Navigation: Last Part (No Next)
 * 
 * Used to test disabled "Next" button at list end.
 */
export const mockAdjacentPartsLast: AdjacentPartsInfo = {
  prev_id: 'test-part-prev-uuid',
  next_id: null, // ⚠️ No next part
  current_index: 19,
  total_count: 20,
};

/**
 * Mock Navigation: Single Part (No Navigation)
 * 
 * Used to test both buttons disabled when only one part exists.
 */
export const mockAdjacentPartsSingle: AdjacentPartsInfo = {
  prev_id: null,
  next_id: null,
  current_index: 0,
  total_count: 1,
};
