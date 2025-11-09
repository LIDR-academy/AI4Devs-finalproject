/**
 * TemplatesPage Component
 *
 * Main page for displaying and managing PDF templates with:
 * - Templates table with sorting and pagination
 * - Search and filter functionality
 * - Download template PDFs
 * - View version history in modal
 * - View form fields in modal
 * - Loading and error states
 * - Responsive design
 *
 * Integrates:
 * - useTemplates hook for main data
 * - useTemplateVersions hook for version history modal
 * - useTemplateFields hook for fields modal
 * - All table and modal components
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import React, { useState } from 'react';
import TableFilters from '../../components/templates/TableFilters';
import TablePagination from '../../components/templates/TablePagination';
import TemplateFieldsModal from '../../components/templates/TemplateFieldsModal';
import TemplatesTable from '../../components/templates/TemplatesTable';
import VersionHistoryModal from '../../components/templates/VersionHistoryModal';
import { DeleteConfirmationModal } from '../../components/ui';
import { useTemplateFields } from '../../hooks/useTemplateFields';
import { useTemplates } from '../../hooks/useTemplates';
import { useTemplateVersions } from '../../hooks/useTemplateVersions';
import { templatesService } from '../../services/templates.service';
import { downloadBlob } from '../../utils/file-download';

/**
 * TemplatesPage - Main page for template management
 *
 * @example
 * ```tsx
 * // In router configuration
 * <Route path="/templates" element={<TemplatesPage />} />
 * ```
 */
const TemplatesPage: React.FC = () => {
  // Main templates data
  const {
    templates,
    total,
    isLoading,
    error,
    currentPage,
    totalPages,
    setPage,
    setPageSize,
    pagination,
    sort,
    handleSort,
    search,
    setSearch,
    refetch, // Add refetch method
  } = useTemplates();

  // Version history modal data
  const {
    versions,
    isLoading: versionsLoading,
    error: versionsError,
    templateId: versionsTemplateId,
    currentPage: versionsCurrentPage,
    totalPages: versionsTotalPages,
    setPage: setVersionsPage,
    fetchVersions,
    clearVersions,
  } = useTemplateVersions();

  // Fields modal data
  const {
    fields,
    isLoading: fieldsLoading,
    error: fieldsError,
    templateId: fieldsTemplateId,
    versionInfo,
    currentPage: fieldsCurrentPage,
    totalPages: fieldsTotalPages,
    setPage: setFieldsPage,
    search: fieldsSearch,
    setSearch: setFieldsSearch,
    pageNumber: fieldsPageNumber,
    setPageNumber: setFieldsPageNumber,
    clearPageNumber: clearFieldsPageNumber,
    fetchCurrentVersionFields,
    clearFields,
  } = useTemplateFields();

  // Local state for modals
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Delete version modal state
  const [deleteVersionModalOpen, setDeleteVersionModalOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<{ 
    templateId: number; 
    versionId: number; 
    versionNumber: string;
  } | null>(null);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  const [deleteVersionSuccess, setDeleteVersionSuccess] = useState<string | null>(null);
  const [deleteVersionError, setDeleteVersionError] = useState<string | null>(null);

  /**
   * Handle template download
   */
  const handleDownload = async (templateId: number) => {
    setDownloadError(null);
    try {
      const { blob, filename } = await templatesService.downloadTemplate(
        templateId
      );
      downloadBlob(blob, filename);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to download template';
      setDownloadError(errorMessage);
      // Auto-clear error after 5 seconds
      setTimeout(() => setDownloadError(null), 5000);
    }
  };

  /**
   * Handle opening version history modal
   */
  const handleViewVersions = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateName(template.name);
      fetchVersions(templateId);
    }
  };

  /**
   * Handle closing version history modal
   */
  const handleCloseVersionsModal = () => {
    clearVersions();
    setSelectedTemplateName('');
  };

  /**
   * Handle opening fields modal
   */
  const handleViewFields = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateName(template.name);
      fetchCurrentVersionFields(templateId);
    }
  };

  /**
   * Handle closing fields modal
   */
  const handleCloseFieldsModal = () => {
    clearFields();
    setSelectedTemplateName('');
  };

  /**
   * Handle delete button click - open confirmation modal
   */
  const handleDeleteClick = (templateId: number, templateName: string) => {
    setTemplateToDelete({ id: templateId, name: templateName });
    setDeleteModalOpen(true);
    setDeleteError(null);
    setDeleteSuccess(null);
  };

  /**
   * Handle delete confirmation - perform actual deletion
   */
  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await templatesService.deleteTemplate(templateToDelete.id);
      
      // Show success message
      setDeleteSuccess(`Template "${templateToDelete.name}" deleted successfully`);
      
      // Close modal
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
      
      // Refresh templates list (re-fetch current page)
      window.location.reload();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setDeleteSuccess(null), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete template';
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle closing delete confirmation modal
   */
  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
      setDeleteError(null);
    }
  };

  /**
   * Handle delete version button click - open confirmation modal
   */
  const handleDeleteVersionClick = (templateId: number, versionId: number, versionNumber: string) => {
    setVersionToDelete({ templateId, versionId, versionNumber });
    setDeleteVersionModalOpen(true);
    setDeleteVersionError(null);
    setDeleteVersionSuccess(null);
  };

  /**
   * Handle delete version confirmation - perform actual deletion
   */
  const handleDeleteVersionConfirm = async () => {
    if (!versionToDelete) return;

    setIsDeletingVersion(true);
    setDeleteVersionError(null);

    try {
      await templatesService.deleteVersion(versionToDelete.templateId, versionToDelete.versionId);
      
      // Show success message
      setDeleteVersionSuccess(`Versión ${versionToDelete.versionNumber} eliminada correctamente`);
      
      // Close delete confirmation modal
      setDeleteVersionModalOpen(false);
      setVersionToDelete(null);
      
      // Close version history modal to show success message
      handleCloseVersionsModal();
      
      // Refresh main templates list
      refetch();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setDeleteVersionSuccess(null), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete version';
      setDeleteVersionError(errorMessage);
    } finally {
      setIsDeletingVersion(false);
    }
  };

  /**
   * Handle closing delete version confirmation modal
   */
  const handleDeleteVersionCancel = () => {
    if (!isDeletingVersion) {
      setDeleteVersionModalOpen(false);
      setVersionToDelete(null);
      setDeleteVersionError(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Templates
        </h1>
      </div>

      {/* Success notification */}
      {deleteSuccess && (
        <div
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          role="alert"
        >
          <p className="text-green-800 dark:text-green-200">{deleteSuccess}</p>
        </div>
      )}

      {/* Version delete success notification */}
      {deleteVersionSuccess && (
        <div
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          role="alert"
        >
          <p className="text-green-800 dark:text-green-200">{deleteVersionSuccess}</p>
        </div>
      )}

      {/* Download error toast */}
      {downloadError && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          role="alert"
        >
          <p className="text-red-800 dark:text-red-200">{downloadError}</p>
        </div>
      )}

      {/* Main error display */}
      {error && !isLoading && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
          role="alert"
        >
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Templates
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Content container */}
      {!error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {/* Filters */}
          {!isLoading && templates && templates.length > 0 && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <TableFilters search={search} onSearchChange={setSearch} />
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <TemplatesTable
              templates={templates || []}
              isLoading={isLoading}
              sortBy={sort.sort_by}
              sortOrder={sort.sort_order}
              onSort={handleSort}
              onDownload={handleDownload}
              onViewVersions={handleViewVersions}
              onViewFields={handleViewFields}
              onDelete={handleDeleteClick}
            />
          </div>

          {/* Pagination */}
          {!isLoading && !error && templates && templates.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pagination.limit}
              totalItems={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      )}

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={versionsTemplateId !== null}
        onClose={handleCloseVersionsModal}
        templateName={selectedTemplateName}
        templateId={versionsTemplateId}
        versions={versions}
        isLoading={versionsLoading}
        error={versionsError}
        currentPage={versionsCurrentPage}
        totalPages={versionsTotalPages}
        onPageChange={setVersionsPage}
        onDeleteVersion={handleDeleteVersionClick}
      />

      {/* Template Fields Modal */}
      <TemplateFieldsModal
        isOpen={fieldsTemplateId !== null}
        onClose={handleCloseFieldsModal}
        templateName={selectedTemplateName}
        fields={fields}
        versionInfo={versionInfo}
        isLoading={fieldsLoading}
        error={fieldsError}
        currentPage={fieldsCurrentPage}
        totalPages={fieldsTotalPages}
        search={fieldsSearch}
        pageNumber={fieldsPageNumber}
        onPageChange={setFieldsPage}
        onSearchChange={setFieldsSearch}
        onPageNumberFilter={setFieldsPageNumber}
        onClearPageFilter={clearFieldsPageNumber}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Plantilla"
        message={`¿Estás seguro de que deseas eliminar la plantilla "${templateToDelete?.name}"?`}
        details="Esta acción eliminará permanentemente todas las versiones, campos y comparaciones asociadas a esta plantilla."
        isLoading={isDeleting}
      />

      {/* Delete Error Modal (shown inside delete modal) */}
      {deleteError && deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Error al eliminar
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{deleteError}</p>
            <button
              onClick={() => setDeleteError(null)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Delete Version Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteVersionModalOpen}
        onClose={handleDeleteVersionCancel}
        onConfirm={handleDeleteVersionConfirm}
        title="Eliminar Versión"
        message={`¿Estás seguro de que deseas eliminar la versión ${versionToDelete?.versionNumber}?`}
        details="Esta acción eliminará permanentemente la versión, sus campos y todas las comparaciones que la utilicen."
        isLoading={isDeletingVersion}
      />

      {/* Delete Version Error Modal */}
      {deleteVersionError && deleteVersionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Error al eliminar versión
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{deleteVersionError}</p>
            <button
              onClick={() => setDeleteVersionError(null)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
