/**
 * Unit Tests for TemplatesPage Component
 *
 * Tests the main templates page with:
 * - Rendering templates table
 * - Search and filter functionality
 * - Sorting functionality
 * - Pagination
 * - Opening version history modal
 * - Opening fields modal
 * - Downloading templates
 * - Loading and error states
 * - Responsive design
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Template } from '../../../types/templates.types';
import TemplatesPage from '../TemplatesPage';

// Mock the custom hooks
vi.mock('../../../hooks/useTemplates', () => ({
  useTemplates: vi.fn(),
}));

vi.mock('../../../hooks/useTemplateVersions', () => ({
  useTemplateVersions: vi.fn(),
}));

vi.mock('../../../hooks/useTemplateFields', () => ({
  useTemplateFields: vi.fn(),
}));

// Mock the templates service
vi.mock('../../../services/templates.service', () => ({
  templatesService: {
    downloadTemplate: vi.fn(),
  },
}));

// Mock file download utility
vi.mock('../../../utils/file-download', () => ({
  downloadBlob: vi.fn(),
}));

import { useTemplateFields } from '../../../hooks/useTemplateFields';
import { useTemplates } from '../../../hooks/useTemplates';
import { useTemplateVersions } from '../../../hooks/useTemplateVersions';
import { templatesService } from '../../../services/templates.service';

const mockTemplates: Template[] = [
  {
    id: 1,
    name: 'Template A',
    version: '1.0',
    file_path: '/uploads/template_a.pdf',
    file_size_bytes: 2621440,
    field_count: 15,
    sepe_url: null,
    uploaded_by: null,
    updated_at: '2025-10-20T10:00:00Z',
    created_at: '2025-10-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Template B',
    version: '2.1',
    file_path: '/uploads/template_b.pdf',
    file_size_bytes: 3984588,
    field_count: 22,
    sepe_url: null,
    uploaded_by: null,
    updated_at: '2025-10-22T14:30:00Z',
    created_at: '2025-10-05T14:30:00Z',
  },
];

describe('TemplatesPage Component', () => {
  beforeEach(() => {
    // Default mock implementations
    vi.mocked(useTemplates).mockReturnValue({
      templates: mockTemplates,
      total: 2,
      isLoading: false,
      error: null,
      pagination: { limit: 20, offset: 0 },
      currentPage: 1,
      totalPages: 1,
      setPage: vi.fn(),
      setPageSize: vi.fn(),
      sort: { sort_by: 'updated_at', sort_order: 'desc' },
      setSort: vi.fn(),
      handleSort: vi.fn(),
      search: '',
      setSearch: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useTemplateVersions).mockReturnValue({
      versions: [],
      total: 0,
      isLoading: false,
      error: null,
      templateId: null,
      pagination: { limit: 20, offset: 0 },
      currentPage: 1,
      totalPages: 0,
      setPage: vi.fn(),
      setPageSize: vi.fn(),
      sort: { sort_by: 'created_at', sort_order: 'desc' },
      setSort: vi.fn(),
      handleSort: vi.fn(),
      fetchVersions: vi.fn(),
      refetch: vi.fn(),
      clearVersions: vi.fn(),
    });

    vi.mocked(useTemplateFields).mockReturnValue({
      fields: [],
      total: 0,
      isLoading: false,
      error: null,
      templateId: null,
      versionId: null,
      versionInfo: null,
      pagination: { limit: 20, offset: 0 },
      currentPage: 1,
      totalPages: 0,
      setPage: vi.fn(),
      setPageSize: vi.fn(),
      search: '',
      setSearch: vi.fn(),
      pageNumber: null,
      setPageNumber: vi.fn(),
      clearPageNumber: vi.fn(),
      fetchCurrentVersionFields: vi.fn(),
      fetchVersionFields: vi.fn(),
      refetch: vi.fn(),
      clearFields: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Tests', () => {
    it('renders page with title', () => {
      render(<TemplatesPage />);

      expect(
        screen.getByRole('heading', { name: /templates/i })
      ).toBeInTheDocument();
    });

    it('renders templates table with data', () => {
      render(<TemplatesPage />);

      expect(screen.getByText('Template A')).toBeInTheDocument();
      expect(screen.getByText('Template B')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<TemplatesPage />);

      expect(
        screen.getByPlaceholderText(/search templates/i)
      ).toBeInTheDocument();
    });

    it('renders pagination controls', () => {
      render(<TemplatesPage />);

      expect(screen.getByLabelText(/items per page/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality Tests', () => {
    it('calls setSearch when typing in search input', async () => {
      const user = userEvent.setup();
      const setSearch = vi.fn();
      vi.mocked(useTemplates).mockReturnValue({
        ...vi.mocked(useTemplates)(),
        setSearch,
      } as any);

      render(<TemplatesPage />);

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await user.type(searchInput, 'test');

      expect(setSearch).toHaveBeenCalled();
    });
  });

  describe('Sorting Tests', () => {
    it('calls handleSort when clicking column header', async () => {
      const user = userEvent.setup();
      const handleSort = vi.fn();
      vi.mocked(useTemplates).mockReturnValue({
        ...vi.mocked(useTemplates)(),
        handleSort,
      } as any);

      render(<TemplatesPage />);

      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      expect(handleSort).toHaveBeenCalledWith('name');
    });
  });

  describe('Pagination Tests', () => {
    it('calls setPage when clicking next page', async () => {
      const user = userEvent.setup();
      const setPage = vi.fn();
      vi.mocked(useTemplates).mockReturnValue({
        ...vi.mocked(useTemplates)(),
        totalPages: 3,
        setPage,
      } as any);

      render(<TemplatesPage />);

      const nextButton = screen.getByLabelText(/next page/i);
      await user.click(nextButton);

      expect(setPage).toHaveBeenCalledWith(2);
    });
  });

  describe('Download Functionality Tests', () => {
    it('downloads template when clicking download button', async () => {
      const user = userEvent.setup();
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      vi.mocked(templatesService.downloadTemplate).mockResolvedValue({
        blob: mockBlob,
        filename: 'template_a.pdf',
      });

      render(<TemplatesPage />);

      const downloadButtons = screen.getAllByLabelText(/download pdf/i);
      await user.click(downloadButtons[0]);

      await waitFor(() => {
        expect(templatesService.downloadTemplate).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Version History Modal Tests', () => {
    it('calls fetchVersions when clicking versions button', async () => {
      const user = userEvent.setup();
      const fetchVersions = vi.fn();
      vi.mocked(useTemplateVersions).mockReturnValue({
        ...vi.mocked(useTemplateVersions)(),
        fetchVersions,
      } as any);

      render(<TemplatesPage />);

      const versionsButtons = screen.getAllByLabelText(
        /view version history/i
      );
      await user.click(versionsButtons[0]);

      await waitFor(() => {
        expect(fetchVersions).toHaveBeenCalledWith(1);
      });
    });

    it('renders version history modal when templateId is set', () => {
      vi.mocked(useTemplateVersions).mockReturnValue({
        ...vi.mocked(useTemplateVersions)(),
        templateId: 1,
        versions: [],
      } as any);

      render(<TemplatesPage />);

      expect(
        screen.getByRole('dialog', { name: /version history/i })
      ).toBeInTheDocument();
    });
  });

  describe('Fields Modal Tests', () => {
    it('calls fetchCurrentVersionFields when clicking fields button', async () => {
      const user = userEvent.setup();
      const fetchCurrentVersionFields = vi.fn();
      vi.mocked(useTemplateFields).mockReturnValue({
        ...vi.mocked(useTemplateFields)(),
        fetchCurrentVersionFields,
      } as any);

      render(<TemplatesPage />);

      const fieldsButtons = screen.getAllByLabelText(/view form fields/i);
      await user.click(fieldsButtons[0]);

      await waitFor(() => {
        expect(fetchCurrentVersionFields).toHaveBeenCalledWith(1);
      });
    });

    it('renders fields modal when templateId is set', () => {
      vi.mocked(useTemplateFields).mockReturnValue({
        ...vi.mocked(useTemplateFields)(),
        templateId: 1,
        fields: [],
        versionInfo: { id: 1, version_number: '1.0', page_count: 5 },
      } as any);

      render(<TemplatesPage />);

      expect(
        screen.getByRole('dialog', { name: /form fields/i })
      ).toBeInTheDocument();
    });
  });

  describe('Loading State Tests', () => {
    it('shows loading spinner when templates are loading', () => {
      vi.mocked(useTemplates).mockReturnValue({
        ...vi.mocked(useTemplates)(),
        isLoading: true,
        templates: [],
      } as any);

      const { container } = render(<TemplatesPage />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State Tests', () => {
    it('displays error message when there is an error', () => {
      vi.mocked(useTemplates).mockReturnValue({
        ...vi.mocked(useTemplates)(),
        error: 'Failed to load templates',
        templates: [],
      } as any);

      render(<TemplatesPage />);

      expect(screen.getByText(/failed to load templates/i)).toBeInTheDocument();
    });
  });

  describe('Empty State Tests', () => {
    it('shows empty state when no templates', () => {
      vi.mocked(useTemplates).mockReturnValue({
        ...vi.mocked(useTemplates)(),
        templates: [],
      } as any);

      render(<TemplatesPage />);

      expect(screen.getByText(/no templates found/i)).toBeInTheDocument();
    });
  });
});

