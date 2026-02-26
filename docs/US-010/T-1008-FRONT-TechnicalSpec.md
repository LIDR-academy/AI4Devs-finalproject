# Technical Specification: T-1008-FRONT

**Status:** ENRICHMENT COMPLETE — Ready for TDD-Red  
**Created:** 2026-02-25  
**Author:** AI Assistant (Claude Sonnet 4.5)  
**Workflow Step:** 1/5 (Pre-TDD Blueprint)

---

## 1. Ticket Summary

- **Tipo:** FRONT (React Component)
- **Alcance:** Crear componente `<PartMetadataPanel>` para reemplazar el tab "Metadata" actual en PartDetailModal. Display estructurado de 12 campos de PartDetail agrupados en 4 secciones colapsables: Info, Workshop, Geometry, Validation Summary.
- **Dependencias:**
  - **T-1007-FRONT** ✅ (PartDetailModal con tab system implementado, helper renderMetadataTab() a reemplazar)
  - **T-1002-BACK** ✅ (GET /api/parts/{id} endpoint devolviendo PartDetail con 12 campos)
  - **Architectural Pattern:** PartDetailModal inline styles pattern (no Tailwind por Portal rendering)

---

## 2. Component Interface

**File:** `src/frontend/src/components/MetadataSidebar.tsx`

```typescript
/**
 * T-1008-FRONT: Metadata Sidebar Component
 * Displays detailed part metadata in organized sections.
 */

import { PartDetail } from '@/types/parts';

export interface MetadataSidebarProps {
  /**
   * Part data from T-1002-BACK GET /api/parts/{id}
   */
  partData: PartDetail;
  
  /**
   * Show copy button
   * @default true
   */
  showCopyButton?: boolean;
  
  /**
   * Callback when metadata copied to clipboard
   */
  onCopy?: (metadata: string) => void;
  
  /**
   * Collapsible sections (mobile-friendly)
   * @default false
   */
  collapsible?: boolean;
}
```

---

## 3. Implementation

**File:** `src/frontend/src/components/MetadataSidebar.tsx`

```tsx
import React, { useState } from 'react';
import type { MetadataSidebarProps } from './MetadataSidebar.types';
import { METADATA_DEFAULTS, METADATA_LABELS } from './MetadataSidebar.constants';
import './MetadataSidebar.css';

/**
 * T-1008-FRONT: Metadata Sidebar Component
 * Displays part metadata in organized sections with copy-to-clipboard.
 */
export const MetadataSidebar: React.FC<MetadataSidebarProps> = ({
  partData,
  showCopyButton = METADATA_DEFAULTS.SHOW_COPY_BUTTON,
  onCopy,
  collapsible = METADATA_DEFAULTS.COLLAPSIBLE,
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  /**
   * Calculate dimensions from bounding box
   */
  const dimensions = partData.bbox
    ? {
        width: (partData.bbox.max[0] - partData.bbox.min[0]).toFixed(2),
        height: (partData.bbox.max[1] - partData.bbox.min[1]).toFixed(2),
        depth: (partData.bbox.max[2] - partData.bbox.min[2]).toFixed(2),
      }
    : null;

  /**
   * Format file size (bytes to MB)
   */
  const fileSizeMB = partData.glb_size_bytes
    ? (partData.glb_size_bytes / 1024 / 1024).toFixed(2)
    : null;

  /**
   * Format date (ISO 8601 to human-readable)
   */
  const formatDate = (isoDate: string): string => {
    return new Date(isoDate).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Copy metadata to clipboard
   */
  const handleCopy = async () => {
    const metadata = `
METADATOS DE PIEZA

Identificación:
- Código ISO: ${partData.iso_code}
- Tipología: ${partData.tipologia}
- Estado: ${partData.status}

${partData.workshop_name ? `Taller:\n- Nombre: ${partData.workshop_name}\n- ID: ${partData.workshop_id}\n` : 'Taller: No asignado\n'}
${dimensions ? `Dimensiones (metros):\n- Ancho: ${dimensions.width} m\n- Alto: ${dimensions.height} m\n- Profundidad: ${dimensions.depth} m\n` : ''}
${partData.triangle_count ? `- Triángulos: ${partData.triangle_count.toLocaleString()}\n` : ''}
${fileSizeMB ? `- Tamaño archivo: ${fileSizeMB} MB\n` : ''}
Timestamps:
- Creado: ${formatDate(partData.created_at)}

ID: ${partData.id}
`.trim();

    try {
      await navigator.clipboard.writeText(metadata);
      setCopySuccess(true);
      onCopy?.(metadata);
      
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('[MetadataSidebar] Failed to copy:', error);
    }
  };

  return (
    <div className="metadata-sidebar">
      {/* Identification Section */}
      <Section title={METADATA_LABELS.IDENTIFICATION} collapsible={collapsible}>
        <MetadataRow label="Código ISO" value={partData.iso_code} />
        <MetadataRow label="Tipología" value={partData.tipologia} />
        <MetadataRow
          label="Estado"
          value={
            <span className={`status-badge status-${partData.status}`}>
              {partData.status}
            </span>
          }
        />
      </Section>

      {/* Workshop Section */}
      <Section title={METADATA_LABELS.WORKSHOP} collapsible={collapsible}>
        <MetadataRow
          label="Taller asignado"
          value={partData.workshop_name || 'No asignado'}
        />
        {partData.workshop_id && (
          <MetadataRow label="ID Taller" value={partData.workshop_id} mono />
        )}
      </Section>

      {/* Geometry Section */}
      {(dimensions || partData.triangle_count || fileSizeMB) && (
        <Section title={METADATA_LABELS.GEOMETRY} collapsible={collapsible}>
          {dimensions && (
            <>
              <MetadataRow label="Ancho" value={`${dimensions.width} m`} />
              <MetadataRow label="Alto" value={`${dimensions.height} m`} />
              <MetadataRow label="Profundidad" value={`${dimensions.depth} m`} />
            </>
          )}
          {partData.triangle_count && (
            <MetadataRow
              label="Triángulos"
              value={partData.triangle_count.toLocaleString('es-ES')}
            />
          )}
          {fileSizeMB && (
            <MetadataRow label="Tamaño archivo" value={`${fileSizeMB} MB`} />
          )}
          {partData.low_poly_url && (
            <MetadataRow label="Formato" value="GLB (Low Poly)" />
          )}
        </Section>
      )}

      {/* Timestamps Section */}
      <Section title={METADATA_LABELS.TIMESTAMPS} collapsible={collapsible}>
        <MetadataRow label="Creado" value={formatDate(partData.created_at)} />
      </Section>

      {/* Technical Info Section (IDs) */}
      <Section title={METADATA_LABELS.TECHNICAL} collapsible={collapsible} defaultExpanded={false}>
        <MetadataRow label="Part ID" value={partData.id} mono />
        {partData.low_poly_url && (
          <MetadataRow label="GLB URL" value={partData.low_poly_url} mono truncate />
        )}
      </Section>

      {/* Copy Button */}
      {showCopyButton && (
        <div className="metadata-actions">
          <button
            className={`copy-button ${copySuccess ? 'success' : ''}`}
            onClick={handleCopy}
            disabled={copySuccess}
          >
            {copySuccess ? '✓ Copiado' : '📋 Copiar Metadatos'}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Section Component (collapsible wrapper)
 */
const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}> = ({ title, children, collapsible = false, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  if (!collapsible) {
    return (
      <section className="metadata-section">
        <h3 className="section-title">{title}</h3>
        <div className="section-content">{children}</div>
      </section>
    );
  }

  return (
    <details className="metadata-section collapsible" open={expanded}>
      <summary
        className="section-title clickable"
        onClick={(e) => {
          e.preventDefault();
          setExpanded(!expanded);
        }}
      >
        {title}
        <span className="toggle-icon">{expanded ? '▼' : '►'}</span>
      </summary>
      <div className="section-content">{children}</div>
    </details>
  );
};

/**
 * Metadata Row Component
 */
const MetadataRow: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  truncate?: boolean;
}> = ({ label, value, mono = false, truncate = false }) => {
  return (
    <div className="metadata-row">
      <span className="row-label">{label}:</span>
      <span
        className={`row-value ${mono ? 'mono' : ''} ${truncate ? 'truncate' : ''}`}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
};

export default MetadataSidebar;
```

---

**File:** `src/frontend/src/components/MetadataSidebar.constants.ts`

```typescript
export const METADATA_DEFAULTS = {
  SHOW_COPY_BUTTON: true,
  COLLAPSIBLE: false,
} as const;

export const METADATA_LABELS = {
  IDENTIFICATION: 'Identificación',
  WORKSHOP: 'Taller',
  GEOMETRY: 'Geometría',
  TIMESTAMPS: 'Fechas',
  TECHNICAL: 'Información Técnica',
} as const;
```

---

**File:** `src/frontend/src/components/MetadataSidebar.css`

```css
/* T-1008-FRONT: Metadata Sidebar Styles */

.metadata-sidebar {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  overflow-y: auto;
  height: 100%;
}

/* Section */
.metadata-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.metadata-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.section-title.clickable {
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-icon {
  font-size: 0.75rem;
  color: #9ca3af;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Metadata Row */
.metadata-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: baseline;
}

.row-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.row-value {
  font-size: 0.875rem;
  color: #111827;
  word-break: break-word;
}

.row-value.mono {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: #374151;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.row-value.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-validated { background: #d1fae5; color: #065f46; }
.status-uploaded { background: #dbeafe; color: #1e40af; }
.status-processing { background: #fef3c7; color: #92400e; }
.status-error { background: #fee2e2; color: #991b1b; }

/* Actions */
.metadata-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.copy-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.copy-button.success {
  background: #10b981;
  cursor: default;
}

.copy-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .metadata-sidebar {
    padding: 1rem;
  }
  
  .metadata-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .row-label {
    font-weight: 600;
    color: #374151;
  }
}
```

---

## 4. Testing Strategy

**File:** `src/frontend/src/components/MetadataSidebar.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetadataSidebar } from './MetadataSidebar';
import '@testing-library/jest-dom';

const mockPartData = {
  id: 'test-part-id',
  iso_code: 'SF-C12-D-001',
  status: 'validated',
  tipologia: 'capitel',
  created_at: '2026-02-15T10:30:00Z',
  low_poly_url: 'https://cdn.cloudfront.net/test.glb',
  bbox: { min: [-2.5, 0, -2.5], max: [2.5, 5, 2.5] },
  workshop_id: 'workshop-123',
  workshop_name: 'Taller Granollers',
  validation_report: null,
  glb_size_bytes: 1048576,
  triangle_count: 2048,
};

describe('MetadataSidebar', () => {
  it('RENDER-01: should display all metadata sections', () => {
    render(<MetadataSidebar partData={mockPartData} />);
    
    expect(screen.getByText('Identificación')).toBeInTheDocument();
    expect(screen.getByText('Taller')).toBeInTheDocument();
    expect(screen.getByText('Geometría')).toBeInTheDocument();
    expect(screen.getByText('Fechas')).toBeInTheDocument();
  });

  it('DATA-01: should display ISO code and tipología', () => {
    render(<MetadataSidebar partData={mockPartData} />);
    
    expect(screen.getByText('SF-C12-D-001')).toBeInTheDocument();
    expect(screen.getByText('capitel')).toBeInTheDocument();
  });

  it('DATA-02: should calculate and display dimensions from bbox', () => {
    render(<MetadataSidebar partData={mockPartData} />);
    
    expect(screen.getByText('5.00 m')).toBeInTheDocument(); // Width: 2.5 - (-2.5) = 5
    expect(screen.getByText('5.00 m')).toBeInTheDocument(); // Height: 5 - 0 = 5
  });

  it('DATA-03: should format file size (bytes to MB)', () => {
    render(<MetadataSidebar partData={mockPartData} />);
    
    expect(screen.getByText('1.00 MB')).toBeInTheDocument();
  });

  it('COPY-01: should copy metadata to clipboard when button clicked', async () => {
    const mockClipboard = {
      writeText: vi.fn(() => Promise.resolve()),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<MetadataSidebar partData={mockPartData} />);
    
    fireEvent.click(screen.getByText('📋 Copiar Metadatos'));
    
    expect(mockClipboard.writeText).toHaveBeenCalled();
    expect(await screen.findByText('✓ Copiado')).toBeInTheDocument();
  });

  it('COPY-02: should call onCopy callback when metadata copied', async () => {
    const onCopy = vi.fn();
    const mockClipboard = {
      writeText: vi.fn(() => Promise.resolve()),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<MetadataSidebar partData={mockPartData} onCopy={onCopy} />);
    
    fireEvent.click(screen.getByText('📋 Copiar Metadatos'));
    
    await screen.findByText('✓ Copiado');
    expect(onCopy).toHaveBeenCalledWith(expect.stringContaining('SF-C12-D-001'));
  });

  it('A11Y-01: should handle missing optional data gracefully', () => {
    const partialData = {
      ...mockPartData,
      workshop_name: null,
      workshop_id: null,
      bbox: null,
      glb_size_bytes: null,
      triangle_count: null,
    };

    render(<MetadataSidebar partData={partialData} />);
    
    expect(screen.getByText('No asignado')).toBeInTheDocument();
  });
});