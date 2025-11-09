/**
 * Tests for CreateComparisonPage component
 *
 * Tests cover:
 * - Component rendering
 * - Template selection
 * - Version selection
 * - Validation (same version IDs)
 * - Comparison execution
 * - Navigation to results
 * - Error handling
 * - Loading states
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { templatesService } from '../../services/templates.service';
import type { ComparisonResult } from '../../types/comparison.types';
import type {
  TemplateNameItem,
  TemplateVersion,
} from '../../types/templates.types';
import CreateComparisonPage from './CreateComparisonPage';

// Mock services
vi.mock('../../services/templates.service', () => ({
  templatesService: {
    getTemplates: vi.fn(),
    getTemplateVersions: vi.fn(),
    analyzeComparison: vi.fn(),
  },
}));

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreateComparisonPage', () => {
  const mockTemplateNames: TemplateNameItem[] = [
    { id: 1, name: 'Template A', current_version: '2024-Q1' },
    { id: 2, name: 'Template B', current_version: '2024-Q2' },
  ];

  const mockVersionsTemplate1: TemplateVersion[] = [
    {
      id: 10,
      template_id: 1,
      version_number: '2024-Q1',
      change_summary: 'Initial version',
      is_current: true,
      created_at: '2024-01-15T10:30:00Z',
      file_path: '/uploads/template_a_q1.pdf',
      file_size_bytes: 102400,
      field_count: 48,
      sepe_url: null,
      title: null,
      author: null,
      subject: null,
      creation_date: null,
      modification_date: null,
      page_count: 5,
    },
    {
      id: 11,
      template_id: 1,
      version_number: '2024-Q2',
      change_summary: 'Updated version',
      is_current: false,
      created_at: '2024-04-20T14:25:00Z',
      file_path: '/uploads/template_a_q2.pdf',
      file_size_bytes: 108800,
      field_count: 52,
      sepe_url: null,
      title: null,
      author: null,
      subject: null,
      creation_date: null,
      modification_date: null,
      page_count: 6,
    },
  ];

  const mockVersionsTemplate2: TemplateVersion[] = [
    {
      id: 20,
      template_id: 2,
      version_number: '2024-Q1',
      change_summary: 'Initial version',
      is_current: true,
      created_at: '2024-02-01T09:00:00Z',
      file_path: '/uploads/template_b_q1.pdf',
      file_size_bytes: 81920,
      field_count: 30,
      sepe_url: null,
      title: null,
      author: null,
      subject: null,
      creation_date: null,
      modification_date: null,
      page_count: 3,
    },
  ];

  const mockComparisonResult: ComparisonResult = {
    source_version_id: 10,
    target_version_id: 11,
    global_metrics: {
      source_version_number: '2024-Q1',
      target_version_number: '2024-Q2',
      source_page_count: 5,
      target_page_count: 6,
      page_count_changed: true,
      source_field_count: 48,
      target_field_count: 52,
      field_count_changed: true,
      fields_added: 4,
      fields_removed: 0,
      fields_modified: 3,
      fields_unchanged: 45,
      modification_percentage: 14.58,
      source_created_at: '2024-01-15T10:30:00Z',
      target_created_at: '2024-04-20T14:25:00Z',
    },
    field_changes: [],
    analyzed_at: '2025-10-26T16:00:00Z',
  };

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CreateComparisonPage />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Default mock implementations
    vi.mocked(templatesService.getTemplates).mockResolvedValue({
      items: mockTemplateNames.map(t => ({
        id: t.id,
        name: t.name,
        current_version: t.current_version,
        comment: null,
        uploaded_by: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null,
      })),
      total: mockTemplateNames.length,
      limit: 100,
      offset: 0,
    });
  });

  describe('Component Rendering', () => {
    it('should render page title and description', async () => {
      renderComponent();

      expect(screen.getByText('Compare Template Versions')).toBeInTheDocument();
      expect(
        screen.getByText('Select two template versions to compare and analyze the differences')
      ).toBeInTheDocument();
    });

    it('should render source and target selection sections', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Source Version')).toBeInTheDocument();
        expect(screen.getByText('Target Version')).toBeInTheDocument();
      });
    });

    it('should load and display template names on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(templatesService.getTemplates).toHaveBeenCalledWith({
          limit: 100,
          offset: 0,
          sort_by: 'name',
          sort_order: 'asc',
        });
      });

      const sourceSelect = screen.getByLabelText('Select source template');
      expect(within(sourceSelect).getByText('Template A')).toBeInTheDocument();
      expect(within(sourceSelect).getByText('Template B')).toBeInTheDocument();
    });

    it('should show loading state while fetching templates', () => {
      vi.mocked(templatesService.getTemplates).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();

      expect(screen.getByText('Loading templates...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show error when template loading fails', async () => {
      const errorMessage = 'Network error';
      vi.mocked(templatesService.getTemplates).mockRejectedValue(new Error(errorMessage));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Template Selection', () => {
    it('should load versions when source template is selected', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue({
        items: mockVersionsTemplate1,
        total: mockVersionsTemplate1.length,
        limit: 100,
        offset: 0,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      const sourceSelect = screen.getByLabelText('Select source template');
      await userEvent.selectOptions(sourceSelect, '1');

      await waitFor(() => {
        expect(templatesService.getTemplateVersions).toHaveBeenCalledWith(1, {
          limit: 100,
          offset: 0,
          sort_by: 'created_at',
          sort_order: 'desc',
        });
      });
    });

    it('should load versions when target template is selected', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue({
        items: mockVersionsTemplate2,
        total: mockVersionsTemplate2.length,
        limit: 100,
        offset: 0,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select target template')).toBeInTheDocument();
      });

      const targetSelect = screen.getByLabelText('Select target template');
      await userEvent.selectOptions(targetSelect, '2');

      await waitFor(() => {
        expect(templatesService.getTemplateVersions).toHaveBeenCalledWith(2, {
          limit: 100,
          offset: 0,
          sort_by: 'created_at',
          sort_order: 'desc',
        });
      });
    });

    it('should reset version selection when template changes', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue({
        items: mockVersionsTemplate1,
        total: mockVersionsTemplate1.length,
        limit: 100,
        offset: 0,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      // Select template and version
      const sourceTemplateSelect = screen.getByLabelText('Select source template');
      await userEvent.selectOptions(sourceTemplateSelect, '1');

      await waitFor(() => {
        expect(screen.getByLabelText('Select source version')).toBeEnabled();
      });

      const sourceVersionSelect = screen.getByLabelText('Select source version');
      await userEvent.selectOptions(sourceVersionSelect, '10');

      // Change template
      await userEvent.selectOptions(sourceTemplateSelect, '2');

      // Version should be reset
      expect(sourceVersionSelect).toHaveValue('');
    });
  });

  describe('Version Selection', () => {
    it('should display version details when version is selected', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue({
        items: mockVersionsTemplate1,
        total: mockVersionsTemplate1.length,
        limit: 100,
        offset: 0,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      // Select template
      const sourceTemplateSelect = screen.getByLabelText('Select source template');
      await userEvent.selectOptions(sourceTemplateSelect, '1');

      await waitFor(() => {
        expect(screen.getByLabelText('Select source version')).toBeEnabled();
      });

      // Select version
      const sourceVersionSelect = screen.getByLabelText('Select source version');
      await userEvent.selectOptions(sourceVersionSelect, '10');

      // Check version details displayed
      await waitFor(() => {
        expect(screen.getByText('Version: 2024-Q1')).toBeInTheDocument();
        expect(screen.getByText(/Created: Jan 15, 2024/)).toBeInTheDocument();
        expect(screen.getByText(/48 fields, 5 pages/)).toBeInTheDocument();
      });
    });

    it('should disable version selectors when no template selected', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      const sourceVersionSelect = screen.getByLabelText('Select source version');
      const targetVersionSelect = screen.getByLabelText('Select target version');

      expect(sourceVersionSelect).toBeDisabled();
      expect(targetVersionSelect).toBeDisabled();
    });
  });

  describe('Validation', () => {
    it('should show warning when same version is selected', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue({
        items: mockVersionsTemplate1,
        total: mockVersionsTemplate1.length,
        limit: 100,
        offset: 0,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      // Select same template and version for both
      const sourceTemplateSelect = screen.getByLabelText('Select source template');
      const targetTemplateSelect = screen.getByLabelText('Select target template');

      await userEvent.selectOptions(sourceTemplateSelect, '1');
      await userEvent.selectOptions(targetTemplateSelect, '1');

      await waitFor(() => {
        expect(screen.getAllByLabelText('Select source version')[0]).toBeEnabled();
      });

      const sourceVersionSelect = screen.getByLabelText('Select source version');
      const targetVersionSelect = screen.getByLabelText('Select target version');

      await userEvent.selectOptions(sourceVersionSelect, '10');
      await userEvent.selectOptions(targetVersionSelect, '10');

      // Check warning displayed
      await waitFor(() => {
        expect(screen.getByText('Versions are identical. Nothing to compare.')).toBeInTheDocument();
      });

      // Execute button should be disabled
      const executeButton = screen.getByLabelText('Execute comparison');
      expect(executeButton).toBeDisabled();
    });

    it('should disable execute button when selections are incomplete', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      const executeButton = screen.getByLabelText('Execute comparison');
      expect(executeButton).toBeDisabled();
    });

    it('should enable execute button when valid selections are made', async () => {
      vi.mocked(templatesService.getTemplateVersions)
        .mockResolvedValueOnce({
          items: mockVersionsTemplate1,
          total: mockVersionsTemplate1.length,
          limit: 100,
          offset: 0,
        })
        .mockResolvedValueOnce({
          items: mockVersionsTemplate1,
          total: mockVersionsTemplate1.length,
          limit: 100,
          offset: 0,
        });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      // Select different versions
      const sourceTemplateSelect = screen.getByLabelText('Select source template');
      const targetTemplateSelect = screen.getByLabelText('Select target template');

      await userEvent.selectOptions(sourceTemplateSelect, '1');
      await userEvent.selectOptions(targetTemplateSelect, '1');

      await waitFor(() => {
        expect(screen.getByLabelText('Select source version')).toBeEnabled();
      });

      const sourceVersionSelect = screen.getByLabelText('Select source version');
      const targetVersionSelect = screen.getByLabelText('Select target version');

      await userEvent.selectOptions(sourceVersionSelect, '10');
      await userEvent.selectOptions(targetVersionSelect, '11');

      await waitFor(() => {
        const executeButton = screen.getByLabelText('Execute comparison');
        expect(executeButton).toBeEnabled();
      });
    });
  });

  describe('Comparison Execution', () => {
    it('should call analyzeComparison with correct parameters', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue({
        items: mockVersionsTemplate1,
        total: mockVersionsTemplate1.length,
        limit: 100,
        offset: 0,
      });
      vi.mocked(templatesService.analyzeComparison).mockResolvedValue(mockComparisonResult);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      // Select versions
      const sourceTemplateSelect = screen.getByLabelText('Select source template');
      const targetTemplateSelect = screen.getByLabelText('Select target template');

      await userEvent.selectOptions(sourceTemplateSelect, '1');
      await userEvent.selectOptions(targetTemplateSelect, '1');

      await waitFor(() => {
        expect(screen.getByLabelText('Select source version')).toBeEnabled();
      });

      const sourceVersionSelect = screen.getByLabelText('Select source version');
      const targetVersionSelect = screen.getByLabelText('Select target version');

      await userEvent.selectOptions(sourceVersionSelect, '10');
      await userEvent.selectOptions(targetVersionSelect, '11');

      // Execute comparison
      const executeButton = screen.getByLabelText('Execute comparison');
      await userEvent.click(executeButton);

      await waitFor(() => {
        expect(templatesService.analyzeComparison).toHaveBeenCalledWith({
          source_version_id: 10,
          target_version_id: 11,
        });
      });
    });

    it('should navigate to results page on success', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue({
        items: mockVersionsTemplate1,
        total: mockVersionsTemplate1.length,
        limit: 100,
        offset: 0,
      });
      vi.mocked(templatesService.analyzeComparison).mockResolvedValue(mockComparisonResult);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      // Select versions
      const sourceTemplateSelect = screen.getByLabelText('Select source template');
      const targetTemplateSelect = screen.getByLabelText('Select target template');

      await userEvent.selectOptions(sourceTemplateSelect, '1');
      await userEvent.selectOptions(targetTemplateSelect, '1');

      await waitFor(() => {
        expect(screen.getByLabelText('Select source version')).toBeEnabled();
      });

      const sourceVersionSelect = screen.getByLabelText('Select source version');
      const targetVersionSelect = screen.getByLabelText('Select target version');

      await userEvent.selectOptions(sourceVersionSelect, '10');
      await userEvent.selectOptions(targetVersionSelect, '11');

      // Execute comparison
      const executeButton = screen.getByLabelText('Execute comparison');
      await userEvent.click(executeButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/comparisons/results', {
          state: { comparisonResult: mockComparisonResult },
        });
      });
    });

    it('should show loading state during comparison', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue({
        items: mockVersionsTemplate1,
        total: mockVersionsTemplate1.length,
        limit: 100,
        offset: 0,
      });
      vi.mocked(templatesService.analyzeComparison).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      // Select versions
      const sourceTemplateSelect = screen.getByLabelText('Select source template');
      const targetTemplateSelect = screen.getByLabelText('Select target template');

      await userEvent.selectOptions(sourceTemplateSelect, '1');
      await userEvent.selectOptions(targetTemplateSelect, '1');

      await waitFor(() => {
        expect(screen.getByLabelText('Select source version')).toBeEnabled();
      });

      const sourceVersionSelect = screen.getByLabelText('Select source version');
      const targetVersionSelect = screen.getByLabelText('Select target version');

      await userEvent.selectOptions(sourceVersionSelect, '10');
      await userEvent.selectOptions(targetVersionSelect, '11');

      // Execute comparison
      const executeButton = screen.getByLabelText('Execute comparison');
      await userEvent.click(executeButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('Analyzing...')).toBeInTheDocument();
        expect(executeButton).toBeDisabled();
      });
    });

    it('should display error message when comparison fails', async () => {
      const errorMessage = 'Version not found';
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue({
        items: mockVersionsTemplate1,
        total: mockVersionsTemplate1.length,
        limit: 100,
        offset: 0,
      });
      vi.mocked(templatesService.analyzeComparison).mockRejectedValue(new Error(errorMessage));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText('Select source template')).toBeInTheDocument();
      });

      // Select versions
      const sourceTemplateSelect = screen.getByLabelText('Select source template');
      const targetTemplateSelect = screen.getByLabelText('Select target template');

      await userEvent.selectOptions(sourceTemplateSelect, '1');
      await userEvent.selectOptions(targetTemplateSelect, '1');

      await waitFor(() => {
        expect(screen.getByLabelText('Select source version')).toBeEnabled();
      });

      const sourceVersionSelect = screen.getByLabelText('Select source version');
      const targetVersionSelect = screen.getByLabelText('Select target version');

      await userEvent.selectOptions(sourceVersionSelect, '10');
      await userEvent.selectOptions(targetVersionSelect, '11');

      // Execute comparison
      const executeButton = screen.getByLabelText('Execute comparison');
      await userEvent.click(executeButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Button should be re-enabled after error
      expect(executeButton).toBeEnabled();
    });
  });
});

