/**
 * Test Fixtures for Parts/Dashboard Integration Tests
 * T-0509-TEST-FRONT: 3D Dashboard Integration Tests
 * 
 * Provides mock data for PartCanvasItem to test dashboard rendering,
 * filtering, selection, and performance scenarios.
 * 
 * @module test/fixtures/parts.fixtures
 */

import { BlockStatus, type PartCanvasItem } from '@/types/parts';

/**
 * Mock Part: Capitel (Capital) - Validated Status
 * 
 * @example
 * ```typescript
 * usePartsStore.setState({ parts: [mockPartCapitel] });
 * ```
 */
export const mockPartCapitel: PartCanvasItem = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  iso_code: 'SF-C12-CAP-001',
  status: BlockStatus.Validated,
  tipologia: 'capitel',
  low_poly_url: 'https://storage.supabase.co/object/public/processed-geometry/capitel-001.glb',
  bbox: {
    min: [0, 0, 0],
    max: [1, 1, 1],
  },
  workshop_id: 'workshop-123',
  workshop_name: 'Taller Granollers',
};

/**
 * Mock Part: Columna (Column) - In Fabrication Status
 * 
 * @example
 * ```typescript
 * usePartsStore.setState({ parts: [mockPartColumna] });
 * ```
 */
export const mockPartColumna: PartCanvasItem = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  iso_code: 'SF-C12-COL-002',
  status: BlockStatus.InFabrication,
  tipologia: 'columna',
  low_poly_url: 'https://storage.supabase.co/object/public/processed-geometry/columna-002.glb',
  bbox: {
    min: [0, 0, 0],
    max: [2, 2, 3],
  },
  workshop_id: 'workshop-456',
  workshop_name: 'Taller Barcelona',
};

/**
 * Mock Part: Dovela (Voussoir) - Uploaded Status (No GLB yet)
 * 
 * Used to test parts that haven't been processed yet (low_poly_url = null)
 */
export const mockPartDovela: PartCanvasItem = {
  id: '323e4567-e89b-12d3-a456-426614174002',
  iso_code: 'SF-C12-DOV-003',
  status: BlockStatus.Uploaded,
  tipologia: 'dovela',
  low_poly_url: null, // Not processed yet
  bbox: null,
  workshop_id: null,
  workshop_name: null,
};

/**
 * Mock Part: Clave (Keystone) - Completed Status
 */
export const mockPartClave: PartCanvasItem = {
  id: '423e4567-e89b-12d3-a456-426614174003',
  iso_code: 'SF-C12-CLA-004',
  status: BlockStatus.Completed,
  tipologia: 'clave',
  low_poly_url: 'https://storage.supabase.co/object/public/processed-geometry/clave-004.glb',
  bbox: {
    min: [0, 0, 0],
    max: [0.5, 0.5, 0.5],
  },
  workshop_id: 'workshop-123',
  workshop_name: 'Taller Granollers',
};

/**
 * Mock Part: Imposta - Archived Status
 */
export const mockPartImposta: PartCanvasItem = {
  id: '523e4567-e89b-12d3-a456-426614174004',
  iso_code: 'SF-C12-IMP-005',
  status: BlockStatus.Archived,
  tipologia: 'imposta',
  low_poly_url: 'https://storage.supabase.co/object/public/processed-geometry/imposta-005.glb',
  bbox: {
    min: [0, 0, 0],
    max: [1.5, 1.5, 0.5],
  },
  workshop_id: null,
  workshop_name: null,
};

/**
 * Generate N mock parts for performance testing
 * 
 * Creates an array of PartCanvasItem with realistic data distributed across:
 * - Statuses: validated, in_fabrication, completed (cycled)
 * - Tipologias: capitel, columna, dovela (cycled)
 * - Workshops: 3 different workshops (cycled)
 * 
 * @param count - Number of parts to generate (default: 150)
 * @returns Array of mock PartCanvasItem
 * 
 * @example
 * ```typescript
 * // Generate 150 parts for performance test
 * const parts = generate150MockParts();
 * usePartsStore.setState({ parts });
 * 
 * // Generate custom amount
 * const parts = generate150MockParts(50);
 * ```
 */
export function generate150MockParts(count: number = 150): PartCanvasItem[] {
  const statuses = [BlockStatus.Validated, BlockStatus.InFabrication, BlockStatus.Completed];
  const tipologias = ['capitel', 'columna', 'dovela'] as const;
  const workshops = [
    { id: 'workshop-123', name: 'Taller Granollers' },
    { id: 'workshop-456', name: 'Taller Barcelona' },
    { id: 'workshop-789', name: 'Taller Vic' },
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `part-${String(i).padStart(4, '0')}`,
    iso_code: `SF-TEST-${String(i).padStart(3, '0')}`,
    status: statuses[i % 3],
    tipologia: tipologias[i % 3],
    low_poly_url: `https://storage.supabase.co/object/public/processed-geometry/part-${i}.glb`,
    bbox: {
      min: [0, 0, 0],
      max: [1, 1, 1],
    },
    workshop_id: workshops[i % 3].id,
    workshop_name: workshops[i % 3].name,
  }));
}

/**
 * Mixed collection for complex filter testing
 * 
 * Contains parts with various combinations of status/tipologia/workshop
 * to test AND filter logic.
 */
export const mockPartsForFilterTesting: PartCanvasItem[] = [
  mockPartCapitel,       // validated + capitel + workshop-123
  mockPartColumna,       // in_fabrication + columna + workshop-456
  mockPartDovela,        // uploaded + dovela + no workshop
  mockPartClave,         // completed + clave + workshop-123
  mockPartImposta,       // archived + imposta + no workshop
  {
    id: '623e4567-e89b-12d3-a456-426614174005',
    iso_code: 'SF-C12-CAP-006',
    status: BlockStatus.Validated,
    tipologia: 'capitel', // Another capitel (same tipologia as mockPartCapitel)
    low_poly_url: 'https://storage.supabase.co/object/public/processed-geometry/capitel-006.glb',
    bbox: { min: [0, 0, 0], max: [1, 1, 1] },
    workshop_id: 'workshop-456', // Different workshop
    workshop_name: 'Taller Barcelona',
  },
];

