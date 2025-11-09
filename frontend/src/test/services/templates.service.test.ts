/**
 * Unit Tests for Templates Service - New API Methods
 * 
 * Tests the new template service methods for:
 * - Fetching template list with pagination, sorting, filtering
 * - Downloading template PDFs
 * - Fetching template versions with pagination
 * - Fetching template fields with pagination and search
 * 
 * @author AI4Devs
 * @date 2025-10-25
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiService } from '../../services/apiService';
import { templatesService } from '../../services/templates.service';
import type {
  FieldsFilters,
  TemplateFieldListResponse,
  TemplateListResponse,
  TemplateVersionDetail,
  TemplateVersionListResponse,
  VersionsFilters,
} from '../../types/templates.types';

// Mock apiService
vi.mock('../../services/apiService', () => ({
  apiService: {
    get: vi.fn(),
  },
}));

// Mock global fetch for download tests
global.fetch = vi.fn();

describe('TemplatesService - List Templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockTemplateListResponse: TemplateListResponse = {
    data: [
      {
        id: 1,
        name: 'Template A',
        current_version: '1.0',
        file_size_mb: 2.5,
        field_count: 15,
        updated_at: '2025-10-20T10:00:00Z',
        created_at: '2025-10-01T10:00:00Z',
      },
      {
        id: 2,
        name: 'Template B',
        current_version: '2.1',
        file_size_mb: 3.8,
        field_count: 22,
        updated_at: '2025-10-22T14:30:00Z',
        created_at: '2025-10-05T14:30:00Z',
      },
    ],
    total: 2,
    limit: 20,
    offset: 0,
  };

  it('should fetch templates with default parameters', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockTemplateListResponse);

    const result = await templatesService.getTemplates();

    expect(apiService.get).toHaveBeenCalledWith('/templates/', {
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc',
    });
    expect(result).toEqual(mockTemplateListResponse);
  });

  it('should fetch templates with custom pagination', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockTemplateListResponse);

    await templatesService.getTemplates({
      limit: 50,
      offset: 100,
    });

    expect(apiService.get).toHaveBeenCalledWith('/templates/', {
      limit: 50,
      offset: 100,
      sort_by: 'updated_at',
      sort_order: 'desc',
    });
  });

  it('should fetch templates with custom sorting', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockTemplateListResponse);

    await templatesService.getTemplates({
      sort_by: 'name',
      sort_order: 'asc',
    });

    expect(apiService.get).toHaveBeenCalledWith('/templates/', {
      limit: 20,
      offset: 0,
      sort_by: 'name',
      sort_order: 'asc',
    });
  });

  it('should fetch templates with search query', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockTemplateListResponse);

    await templatesService.getTemplates({
      search: 'Template A',
    });

    expect(apiService.get).toHaveBeenCalledWith('/templates/', {
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc',
      search: 'Template A',
    });
  });

  it('should handle API errors when fetching templates', async () => {
    const error = new Error('Failed to fetch templates');
    vi.mocked(apiService.get).mockRejectedValue(error);

    await expect(templatesService.getTemplates()).rejects.toThrow(
      'Failed to fetch templates'
    );
  });

  it('should handle empty template list', async () => {
    const emptyResponse: TemplateListResponse = {
      data: [],
      total: 0,
      limit: 20,
      offset: 0,
    };
    vi.mocked(apiService.get).mockResolvedValue(emptyResponse);

    const result = await templatesService.getTemplates();

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe('TemplatesService - Download Template', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should download template PDF successfully', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
      headers: new Headers({
        'Content-Disposition': 'attachment; filename="template_v1.0.pdf"',
      }),
    } as unknown as Response;

    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    const result = await templatesService.downloadTemplate(1);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/templates/1/download'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer /),
        }),
      })
    );
    expect(result.blob).toBe(mockBlob);
    expect(result.filename).toBe('template_v1.0.pdf');
  });

  it('should extract filename from Content-Disposition header', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
      headers: new Headers({
        'Content-Disposition':
          'attachment; filename="My_Template_v2.1.pdf"',
      }),
    } as unknown as Response;

    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    const result = await templatesService.downloadTemplate(5);

    expect(result.filename).toBe('My_Template_v2.1.pdf');
  });

  it('should use default filename when header is missing', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
      headers: new Headers(),
    } as unknown as Response;

    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    const result = await templatesService.downloadTemplate(3);

    expect(result.filename).toBe('template_3.pdf');
  });

  it('should handle download errors', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response;

    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    await expect(templatesService.downloadTemplate(999)).rejects.toThrow(
      'Failed to download template: 404 Not Found'
    );
  });

  it('should handle network errors during download', async () => {
    vi.mocked(global.fetch).mockRejectedValue(
      new Error('Network error')
    );

    await expect(templatesService.downloadTemplate(1)).rejects.toThrow(
      'Network error'
    );
  });
});

describe('TemplatesService - Template Versions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockVersionsResponse: TemplateVersionListResponse = {
    data: [
      {
        id: 1,
        template_id: 1,
        version_number: '1.0',
        file_path: '/uploads/template_v1.0.pdf',
        file_size_bytes: 2621440,
        checksum: 'abc123',
        page_count: 5,
        title: 'Template Title',
        author: 'John Doe',
        subject: 'Test Template',
        creation_date: '2025-10-01T10:00:00Z',
        modification_date: '2025-10-15T10:00:00Z',
        created_at: '2025-10-01T10:00:00Z',
        is_current: true,
      },
      {
        id: 2,
        template_id: 1,
        version_number: '0.9',
        file_path: '/uploads/template_v0.9.pdf',
        file_size_bytes: 2097152,
        checksum: 'def456',
        page_count: 4,
        title: 'Template Title',
        author: 'Jane Smith',
        subject: 'Test Template',
        creation_date: '2025-09-15T10:00:00Z',
        modification_date: '2025-09-20T10:00:00Z',
        created_at: '2025-09-15T10:00:00Z',
        is_current: false,
      },
    ],
    total: 2,
    limit: 20,
    offset: 0,
  };

  it('should fetch template versions with default parameters', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockVersionsResponse);

    const result = await templatesService.getTemplateVersions(1);

    expect(apiService.get).toHaveBeenCalledWith('/templates/1/versions', {
      limit: 20,
      offset: 0,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    expect(result).toEqual(mockVersionsResponse);
  });

  it('should fetch template versions with custom filters', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockVersionsResponse);

    const filters: VersionsFilters = {
      limit: 10,
      offset: 20,
      sort_by: 'version_number',
      sort_order: 'asc',
    };

    await templatesService.getTemplateVersions(1, filters);

    expect(apiService.get).toHaveBeenCalledWith('/templates/1/versions', {
      limit: 10,
      offset: 20,
      sort_by: 'version_number',
      sort_order: 'asc',
    });
  });

  it('should handle errors when fetching versions', async () => {
    const error = new Error('Template not found');
    vi.mocked(apiService.get).mockRejectedValue(error);

    await expect(
      templatesService.getTemplateVersions(999)
    ).rejects.toThrow('Template not found');
  });

  it('should handle empty versions list', async () => {
    const emptyResponse: TemplateVersionListResponse = {
      data: [],
      total: 0,
      limit: 20,
      offset: 0,
    };
    vi.mocked(apiService.get).mockResolvedValue(emptyResponse);

    const result = await templatesService.getTemplateVersions(1);

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe('TemplatesService - Template Fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockFieldsResponse: TemplateFieldListResponse = {
    data: [
      {
        id: 1,
        template_version_id: 1,
        field_id: 'field_name',
        field_type: 'text',
        near_text: 'Name:',
        page_number: 1,
        field_page_order: 1,
        position: {
          x: 100,
          y: 200,
          width: 150,
          height: 20,
        },
        created_at: '2025-10-01T10:00:00Z',
      },
      {
        id: 2,
        template_version_id: 1,
        field_id: 'field_email',
        field_type: 'text',
        near_text: 'Email:',
        page_number: 1,
        field_page_order: 2,
        position: {
          x: 100,
          y: 230,
          width: 150,
          height: 20,
        },
        created_at: '2025-10-01T10:00:00Z',
      },
    ],
    total: 2,
    limit: 20,
    offset: 0,
    version: {
      id: 1,
      version_number: '1.0',
      page_count: 5,
    },
  };

  it('should fetch current version fields with default parameters', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockFieldsResponse);

    const result = await templatesService.getCurrentVersionFields(1);

    expect(apiService.get).toHaveBeenCalledWith(
      '/templates/1/fields/current',
      {
        limit: 20,
        offset: 0,
      }
    );
    expect(result).toEqual(mockFieldsResponse);
  });

  it('should fetch current version fields with custom filters', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockFieldsResponse);

    const filters: FieldsFilters = {
      limit: 50,
      offset: 10,
      page_number: 2,
      search: 'email',
    };

    await templatesService.getCurrentVersionFields(1, filters);

    expect(apiService.get).toHaveBeenCalledWith(
      '/templates/1/fields/current',
      {
        limit: 50,
        offset: 10,
        page_number: 2,
        search: 'email',
      }
    );
  });

  it('should fetch specific version fields with default parameters', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockFieldsResponse);

    const result = await templatesService.getVersionFields(1, 5);

    expect(apiService.get).toHaveBeenCalledWith(
      '/templates/1/versions/5/fields',
      {
        limit: 20,
        offset: 0,
      }
    );
    expect(result).toEqual(mockFieldsResponse);
  });

  it('should fetch specific version fields with custom filters', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockFieldsResponse);

    const filters: FieldsFilters = {
      limit: 100,
      offset: 0,
      page_number: 3,
      search: 'checkbox',
    };

    await templatesService.getVersionFields(1, 5, filters);

    expect(apiService.get).toHaveBeenCalledWith(
      '/templates/1/versions/5/fields',
      {
        limit: 100,
        offset: 0,
        page_number: 3,
        search: 'checkbox',
      }
    );
  });

  it('should handle errors when fetching current version fields', async () => {
    const error = new Error('No current version found');
    vi.mocked(apiService.get).mockRejectedValue(error);

    await expect(
      templatesService.getCurrentVersionFields(999)
    ).rejects.toThrow('No current version found');
  });

  it('should handle errors when fetching specific version fields', async () => {
    const error = new Error('Version not found');
    vi.mocked(apiService.get).mockRejectedValue(error);

    await expect(
      templatesService.getVersionFields(1, 999)
    ).rejects.toThrow('Version not found');
  });

  it('should handle empty fields list', async () => {
    const emptyResponse: TemplateFieldListResponse = {
      data: [],
      total: 0,
      limit: 20,
      offset: 0,
      version: {
        id: 1,
        version_number: '1.0',
        page_count: 5,
      },
    };
    vi.mocked(apiService.get).mockResolvedValue(emptyResponse);

    const result = await templatesService.getCurrentVersionFields(1);

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should only include defined filter parameters', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockFieldsResponse);

    const filters: FieldsFilters = {
      search: 'name',
      // limit and offset not provided, should use defaults
    };

    await templatesService.getCurrentVersionFields(1, filters);

    expect(apiService.get).toHaveBeenCalledWith(
      '/templates/1/fields/current',
      {
        limit: 20,
        offset: 0,
        search: 'name',
        // page_number should not be included since it wasn't provided
      }
    );
  });
});

describe('TemplatesService - Get Version By ID', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockVersionDetail: TemplateVersionDetail = {
    // Version information
    id: 1,
    version_number: '1.0',
    change_summary: 'Initial version',
    is_current: true,
    created_at: '2025-10-26T10:00:00Z',
    // File information
    file_path: '/app/uploads/test-template.pdf',
    file_size_bytes: 2621440,
    field_count: 48,
    sepe_url: 'https://www.sepe.es/templates/test',
    // PDF metadata
    title: 'Test Template',
    author: 'SEPE',
    subject: 'Test Subject',
    creation_date: '2024-10-15T08:00:00Z',
    modification_date: '2024-10-20T14:30:00Z',
    page_count: 5,
    // Associated template
    template: {
      id: 10,
      name: 'Test Template Name',
      current_version: '1.0',
      comment: 'Test comment',
      uploaded_by: 5,
      created_at: '2025-10-26T09:45:00Z',
    },
  };

  it('should fetch version detail by ID successfully', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockVersionDetail);

    const result = await templatesService.getVersionById(1);

    expect(result).toEqual(mockVersionDetail);
    expect(apiService.get).toHaveBeenCalledWith('/templates/versions/1');
    expect(apiService.get).toHaveBeenCalledTimes(1);
  });

  it('should return version with all required fields', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockVersionDetail);

    const result = await templatesService.getVersionById(1);

    // Verify version data
    expect(result.id).toBe(1);
    expect(result.version_number).toBe('1.0');
    expect(result.is_current).toBe(true);
    expect(result.created_at).toBe('2025-10-26T10:00:00Z');

    // Verify file information
    expect(result.file_path).toBe('/app/uploads/test-template.pdf');
    expect(result.file_size_bytes).toBe(2621440);
    expect(result.field_count).toBe(48);
    expect(result.sepe_url).toBe('https://www.sepe.es/templates/test');

    // Verify PDF metadata
    expect(result.title).toBe('Test Template');
    expect(result.author).toBe('SEPE');
    expect(result.page_count).toBe(5);

    // Verify associated template
    expect(result.template).toBeDefined();
    expect(result.template.id).toBe(10);
    expect(result.template.name).toBe('Test Template Name');
    expect(result.template.current_version).toBe('1.0');
  });

  it('should handle version with null optional fields', async () => {
    const versionWithNulls: TemplateVersionDetail = {
      ...mockVersionDetail,
      change_summary: null,
      sepe_url: null,
      title: null,
      author: null,
      subject: null,
      creation_date: null,
      modification_date: null,
      template: {
        ...mockVersionDetail.template,
        comment: null,
        uploaded_by: null,
      },
    };

    vi.mocked(apiService.get).mockResolvedValue(versionWithNulls);

    const result = await templatesService.getVersionById(1);

    expect(result.change_summary).toBeNull();
    expect(result.sepe_url).toBeNull();
    expect(result.title).toBeNull();
    expect(result.template.comment).toBeNull();
    expect(result.template.uploaded_by).toBeNull();
  });

  it('should throw error when version not found', async () => {
    const error = new Error('Version not found');
    vi.mocked(apiService.get).mockRejectedValue(error);

    await expect(templatesService.getVersionById(999)).rejects.toThrow(
      'Version not found'
    );
    expect(apiService.get).toHaveBeenCalledWith('/templates/versions/999');
  });

  it('should handle API errors gracefully', async () => {
    const apiError = new Error('API Error: 500 Internal Server Error');
    vi.mocked(apiService.get).mockRejectedValue(apiError);

    await expect(templatesService.getVersionById(1)).rejects.toThrow(
      'API Error: 500 Internal Server Error'
    );
  });

  it('should call correct endpoint for different version IDs', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockVersionDetail);

    await templatesService.getVersionById(42);
    expect(apiService.get).toHaveBeenCalledWith('/templates/versions/42');

    await templatesService.getVersionById(100);
    expect(apiService.get).toHaveBeenCalledWith('/templates/versions/100');
  });
});

