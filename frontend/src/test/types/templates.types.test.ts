/**
 * Tests for template type definitions
 * These tests verify that types are properly defined and exportable
 */

import { describe, expect, it } from 'vitest';
import type {
    FieldsFilters,
    FieldType,
    ModalState,
    PaginationState,
    PositionData,
    SortConfig,
    Template,
    TemplateField,
    TemplateFieldListResponse,
    TemplateListResponse,
    TemplatesFilters,
    TemplatesPageState,
    TemplateVersion,
    TemplateVersionListResponse,
    VersionInfo,
    VersionsFilters,
} from '../../types/templates.types';
import { FIELD_TYPE_COLORS, FIELD_TYPE_LABELS } from '../../types/templates.types';

describe('Template Types', () => {
  it('should define Template interface correctly', () => {
    const template: Template = {
      id: 1,
      name: 'Test Template',
      version: '1.0',
      file_path: '/path/to/file.pdf',
      file_size_bytes: 1024,
      field_count: 10,
      sepe_url: 'https://example.com',
      uploaded_by: 1,
      created_at: '2025-10-25T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
    };

    expect(template).toBeDefined();
    expect(template.id).toBe(1);
    expect(template.name).toBe('Test Template');
  });

  it('should define TemplateVersion interface with metadata', () => {
    const version: TemplateVersion = {
      id: 1,
      template_id: 1,
      version_number: '1.0',
      change_summary: 'Initial version',
      is_current: true,
      created_at: '2025-10-25T00:00:00Z',
      title: 'Test Document',
      author: 'Test Author',
      subject: 'Test Subject',
      creation_date: '2025-10-20T00:00:00Z',
      modification_date: '2025-10-24T00:00:00Z',
      page_count: 5,
    };

    expect(version).toBeDefined();
    expect(version.is_current).toBe(true);
    expect(version.page_count).toBe(5);
  });

  it('should define TemplateField interface with position data', () => {
    const positionData: PositionData = {
      x0: 100,
      y0: 200,
      x1: 300,
      y1: 220,
    };

    const field: TemplateField = {
      id: 1,
      version_id: 1,
      field_id: 'A0101',
      field_type: 'text',
      raw_type: '/Tx',
      page_number: 1,
      field_page_order: 0,
      near_text: 'Test Field',
      value_options: null,
      position_data: positionData,
      created_at: '2025-10-25T00:00:00Z',
    };

    expect(field).toBeDefined();
    expect(field.field_type).toBe('text');
    expect(field.position_data).toEqual(positionData);
  });

  it('should define all FieldType variants', () => {
    const types: FieldType[] = [
      'text',
      'checkbox',
      'radiobutton',
      'select',
      'textarea',
      'button',
      'signature',
    ];

    types.forEach((type) => {
      const field: Partial<TemplateField> = {
        field_type: type,
      };
      expect(field.field_type).toBe(type);
    });
  });

  it('should define paginated response types', () => {
    const templateList: TemplateListResponse = {
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    };

    const versionList: TemplateVersionListResponse = {
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    };

    const versionInfo: VersionInfo = {
      version_id: 1,
      version_number: '1.0',
      field_count: 10,
    };

    const fieldList: TemplateFieldListResponse = {
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
      version_info: versionInfo,
    };

    expect(templateList).toBeDefined();
    expect(versionList).toBeDefined();
    expect(fieldList.version_info).toEqual(versionInfo);
  });

  it('should define filter types', () => {
    const templatesFilters: TemplatesFilters = {
      name: 'test',
      version: '1.0',
      search: 'search term',
    };

    const versionsFilters: VersionsFilters = {
      limit: 20,
      offset: 0,
      sort_by: 'created_at',
      sort_order: 'desc',
    };

    const fieldsFilters: FieldsFilters = {
      limit: 20,
      offset: 0,
      page_number: 1,
      search: 'field',
    };

    expect(templatesFilters).toBeDefined();
    expect(versionsFilters.sort_by).toBe('created_at');
    expect(fieldsFilters.page_number).toBe(1);
  });

  it('should define SortConfig type', () => {
    const sortConfig: SortConfig = {
      column: 'name',
      direction: 'asc',
    };

    expect(sortConfig.direction).toBe('asc');
  });

  it('should define PaginationState type', () => {
    const pagination: PaginationState = {
      page: 1,
      limit: 20,
      total: 100,
      offset: 0,
    };

    expect(pagination.total).toBe(100);
  });

  it('should define TemplatesPageState type', () => {
    const pageState: TemplatesPageState = {
      templates: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        offset: 0,
      },
      filters: {},
      sort: {
        column: 'created_at',
        direction: 'desc',
      },
    };

    expect(pageState.loading).toBe(false);
    expect(pageState.sort.direction).toBe('desc');
  });

  it('should define ModalState type', () => {
    const modalState: ModalState = {
      isOpen: false,
      templateId: null,
    };

    const openModal: ModalState = {
      isOpen: true,
      templateId: 123,
    };

    expect(modalState.isOpen).toBe(false);
    expect(openModal.templateId).toBe(123);
  });
});

describe('Field Type Constants', () => {
  it('should export FIELD_TYPE_COLORS constant', () => {
    expect(FIELD_TYPE_COLORS).toBeDefined();
    expect(FIELD_TYPE_COLORS.text).toBe('blue');
    expect(FIELD_TYPE_COLORS.checkbox).toBe('green');
    expect(FIELD_TYPE_COLORS.radiobutton).toBe('purple');
    expect(FIELD_TYPE_COLORS.select).toBe('orange');
    expect(FIELD_TYPE_COLORS.textarea).toBe('blue');
    expect(FIELD_TYPE_COLORS.button).toBe('gray');
    expect(FIELD_TYPE_COLORS.signature).toBe('red');
  });

  it('should export FIELD_TYPE_LABELS constant', () => {
    expect(FIELD_TYPE_LABELS).toBeDefined();
    expect(FIELD_TYPE_LABELS.text).toBe('Text');
    expect(FIELD_TYPE_LABELS.checkbox).toBe('Checkbox');
    expect(FIELD_TYPE_LABELS.radiobutton).toBe('Radio Button');
    expect(FIELD_TYPE_LABELS.select).toBe('Select');
    expect(FIELD_TYPE_LABELS.textarea).toBe('Text Area');
    expect(FIELD_TYPE_LABELS.button).toBe('Button');
    expect(FIELD_TYPE_LABELS.signature).toBe('Signature');
  });

  it('should have matching keys in colors and labels', () => {
    const colorKeys = Object.keys(FIELD_TYPE_COLORS);
    const labelKeys = Object.keys(FIELD_TYPE_LABELS);

    expect(colorKeys).toEqual(labelKeys);
  });
});

