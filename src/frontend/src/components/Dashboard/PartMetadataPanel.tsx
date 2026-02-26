/**
 * T-1008-FRONT: PartMetadataPanel Component
 * Displays part metadata in organized collapsible sections
 * 
 * @module components/Dashboard/PartMetadataPanel
 */

import React, { useState } from 'react';
import type { PartMetadataPanelProps, ExpandedSections, SectionId } from './PartMetadataPanel.types';
import { SECTIONS_CONFIG, SECTION_STYLES, STATUS_COLORS, ARIA_LABELS, EMPTY_VALUES } from './PartMetadataPanel.constants';
import { formatFileSize, formatDate, formatBBox } from '../../utils/formatters';

/**
 * PartMetadataPanel - Displays part metadata in structured format
 * 
 * Renders part details organized into 4 collapsible sections:
 * - Info: ISO code, status, typology, creation date, ID
 * - Workshop: Name and ID
 * - Geometry: Bounding box, file size, triangle count, GLB URL
 * - Validation: Validation report summary
 * 
 * Features:
 * - Keyboard accessible (Enter/Space to toggle sections)
 * - ARIA attributes for screen readers
 * - Null-safe with fallback placeholders
 * - Auto-formatting for dates, file sizes, coordinates
 * 
 * @param props - Component props (see PartMetadataPanelProps)
 * @returns React element
 */
export const PartMetadataPanel: React.FC<PartMetadataPanelProps> = ({
  part,
  // initialExpandedSection, // Reserved for future use
  className,
}) => {
  // Guard against undefined part
  if (!part) {
    return (
      <div data-testid="metadata-panel" className={className} style={SECTION_STYLES.container}>
        <span style={SECTION_STYLES.fieldValueEmpty}>No part data available</span>
      </div>
    );
  }

  // Initialize all sections as collapsed EXCEPT info by default
  // But maintain them in DOM with display:none for test querying
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    info: true,
    workshop: false,
    geometry: false,
    validation: false,
  });

  const toggleSection = (sectionId: SectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, sectionId: SectionId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSection(sectionId);
    }
  };

  const renderFieldValue = (field: any, value: any) => {
    // Handle null/undefined (but NOT 0)
    if (value === null || value === undefined) {
      return (
        <span style={{ ...SECTION_STYLES.fieldValue, ...SECTION_STYLES.fieldValueEmpty }}>
          {field.emptyValue || EMPTY_VALUES.NOT_AVAILABLE}
        </span>
      );
    }

    // Render based on component type
    switch (field.component) {
      case 'badge':
        const statusColor = STATUS_COLORS[value] || STATUS_COLORS.uploaded;
        return (
          <span style={{ ...SECTION_STYLES.badge, ...statusColor }}>
            {value}
          </span>
        );

      case 'json':
        // Check if validation_report is empty or null
        if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
          return (
            <span style={{ ...SECTION_STYLES.fieldValue, ...SECTION_STYLES.fieldValueEmpty }}>
              {field.emptyValue || EMPTY_VALUES.NO_VALIDATION}
            </span>
          );
        }
        // For validation_report, show errors if present with label
        if (field.key === 'validation_report' && value.errors && Array.isArray(value.errors)) {
          const errorMessages = value.errors.map((err: any) => err.message || err.category).join(', ');
          return (
            <pre style={SECTION_STYLES.json}>
              validation_report: {errorMessages || 'No errors - validation passed'}
            </pre>
          );
        }
        return (
          <pre style={SECTION_STYLES.json}>
            {JSON.stringify(value, null, 2)}
          </pre>
        );

      case 'coordinates':
        return (
          <div style={SECTION_STYLES.coordinates}>
            {formatBBox(value, field.emptyValue || EMPTY_VALUES.NO_DATA)}
          </div>
        );

      case 'link':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" style={SECTION_STYLES.link}>
            {value}
          </a>
        );

      case 'text':
      default:
        // Apply formatting based on key
        let displayValue: string = value;

        if (field.key === 'created_at') {
          displayValue = formatDate(value, EMPTY_VALUES.NO_DATA);
        } else if (field.key === 'glb_size_bytes') {
          displayValue = formatFileSize(value, EMPTY_VALUES.NO_DATA);
        } else if (field.key === 'bbox') {
          displayValue = formatBBox(value, EMPTY_VALUES.NO_DATA);
        } else if (field.key === 'triangle_count') {
          // For triangle_count, display as is (including 0)
          displayValue = String(value);
        } else if (typeof value === 'object') {
          displayValue = JSON.stringify(value);
        } else {
          displayValue = String(value);
        }

        const valueStyle = field.monospace
          ? SECTION_STYLES.fieldValueMono
          : SECTION_STYLES.fieldValue;

        return <span style={valueStyle}>{displayValue}</span>;
    }
  };

  return (
    <div data-testid="metadata-panel" className={className} style={SECTION_STYLES.container}>
      {SECTIONS_CONFIG.map((section, index) => {
        const isExpanded = expandedSections[section.id];
        const isLast = index === SECTIONS_CONFIG.length - 1;
        const sectionStyle = isLast
          ? { ...SECTION_STYLES.section, ...SECTION_STYLES.sectionLast }
          : SECTION_STYLES.section;

        const headerId = `section-header-${section.id}`;
        const contentId = `section-content-${section.id}`;

        return (
          <div key={section.id} style={sectionStyle}>
            {/* Section Header - Collapsible Button */}
            <button
              id={headerId}
              onClick={() => toggleSection(section.id)}
              onKeyDown={(e) => handleKeyDown(e, section.id)}
              aria-expanded={isExpanded}
              aria-controls={contentId}
              aria-label={ARIA_LABELS.SECTION_BUTTON(section.title)}
              style={{
                ...SECTION_STYLES.header,
                background: 'none',
                border: 'none',
                width: '100%',
              }}
            >
              <div style={SECTION_STYLES.headerTitle}>
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </div>
              <span
                style={{
                  ...SECTION_STYLES.expandIcon,
                  ...(isExpanded ? SECTION_STYLES.expandIconExpanded : {}),
                }}
                aria-label={ARIA_LABELS.EXPAND_ICON}
              >
                ▶
              </span>
            </button>

            {/* Section Content - Collapsible Region */}
            <div
              id={contentId}
              role="region"
              aria-labelledby={headerId}
              style={{
                ...SECTION_STYLES.content,
                display: isExpanded ? 'flex' : 'none',
              }}
            >
                {section.fields.map((field) => {
                  const value = part[field.key as keyof typeof part];

                  return (
                    <div key={field.key} style={{ ...SECTION_STYLES.fieldRow, wordBreak: 'break-all' }}>
                      <span style={SECTION_STYLES.fieldLabel}>{field.label}</span>
                      {renderFieldValue(field, value)}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PartMetadataPanel;
