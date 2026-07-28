import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  importGoodreadsCsv,
  pollImportJobUntilComplete,
  previewGoodreadsImport,
} from '../api/client';
import { messageFromUnknownError } from '../api/errors';
import type {
  GenreResolutionMap,
  GoodreadsImportPreviewResponse,
  GoodreadsImportResponse,
  ImportJobStatusResponse,
} from '../api/types';
import { ImportGenreResolutionStep } from '../components/import/ImportGenreResolutionStep';
import { ImportProgress } from '../components/import/ImportProgress';
import { ImportSummary } from '../components/import/ImportSummary';
import { Button, Card, PageHeader } from '../components/ui';
import { validateGoodreadsCsvFile } from '../lib/goodreadsImport';
import {
  clearStoredImportJobId,
  getStoredImportJobId,
  storeImportJobId,
} from '../lib/goodreadsImportJobStorage';
import './ImportExportPage.css';

export function ImportExportPage() {
  const queryClient = useQueryClient();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<GoodreadsImportResponse | null>(
    null,
  );
  const [jobProgress, setJobProgress] = useState<ImportJobStatusResponse | null>(
    null,
  );
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] =
    useState<GoodreadsImportPreviewResponse | null>(null);
  const [showGenreResolution, setShowGenreResolution] = useState(false);

  function invalidateLibraryCaches() {
    void queryClient.invalidateQueries({ queryKey: ['books'] });
    void queryClient.invalidateQueries({ queryKey: ['stats'] });
    void queryClient.invalidateQueries({ queryKey: ['goals'] });
  }

  function handleImportSuccess(data: GoodreadsImportResponse) {
    clearStoredImportJobId();
    setJobProgress(null);
    setImportResult(data);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    invalidateLibraryCaches();
  }

  function handleImportFailure() {
    clearStoredImportJobId();
    setJobProgress(null);
  }

  const importMutation = useMutation({
    mutationFn: ({
      file,
      genreResolutions,
    }: {
      file: File;
      genreResolutions?: GenreResolutionMap;
    }) =>
      importGoodreadsCsv(file, {
        genreResolutions,
        onJobAccepted: (jobId) => {
          storeImportJobId(jobId);
          setResumeError(null);
        },
        onProgress: (status) => setJobProgress(status),
      }),
    onSuccess: handleImportSuccess,
    onError: handleImportFailure,
  });

  const previewMutation = useMutation({
    mutationFn: (file: File) => previewGoodreadsImport(file),
    onSuccess: (preview, file) => {
      setPreviewResult(preview);
      if (preview.unresolved_genres.length > 0) {
        setShowGenreResolution(true);
        return;
      }
      importMutation.mutate({ file });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (jobId: string) =>
      pollImportJobUntilComplete(jobId, (status) => setJobProgress(status)),
    onSuccess: handleImportSuccess,
    onError: (error) => {
      handleImportFailure();
      setResumeError(messageFromUnknownError(error));
    },
  });

  useEffect(() => {
    const jobId = getStoredImportJobId();
    if (!jobId) {
      return;
    }

    setResumeError(null);
    resumeMutation.mutate(jobId);
  }, []);

  const isImporting = importMutation.isPending || resumeMutation.isPending;
  const isPreviewing = previewMutation.isPending;
  const fileValidation = validateGoodreadsCsvFile(selectedFile);
  const canSubmit = fileValidation.valid && !isImporting && !isPreviewing;

  function handleFileChange(file: File | null) {
    setImportResult(null);
    setJobProgress(null);
    setResumeError(null);
    importMutation.reset();
    previewMutation.reset();
    setPreviewResult(null);
    setShowGenreResolution(false);
    setSelectedFile(file);

    if (!file) {
      setValidationError(null);
      return;
    }

    const result = validateGoodreadsCsvFile(file);
    setValidationError(result.valid ? null : result.message);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setImportResult(null);
    setJobProgress(null);
    setResumeError(null);
    setPreviewResult(null);
    setShowGenreResolution(false);

    const result = validateGoodreadsCsvFile(selectedFile);
    if (!result.valid || !selectedFile) {
      setValidationError(
        result.valid
          ? 'Selecciona un archivo CSV de Goodreads.'
          : result.message,
      );
      return;
    }

    previewMutation.mutate(selectedFile);
  }

  function handleGenreResolutionsConfirmed(resolutions: GenreResolutionMap) {
    if (!selectedFile) return;
    setShowGenreResolution(false);
    importMutation.mutate({ file: selectedFile, genreResolutions: resolutions });
  }

  function handleGenreResolutionCancel() {
    setShowGenreResolution(false);
    setPreviewResult(null);
  }

  const mutationError =
    importMutation.error ?? resumeMutation.error ?? previewMutation.error;

  return (
    <div className="import-export-page">
      <PageHeader
        title="Importar / Exportar"
        subtitle="Importa tu biblioteca desde Goodreads. La exportación a Excel o PDF llegará más adelante."
      />

      <main className="import-export-main" aria-label="Opciones de importación y exportación">
        <Card
          title="Importar desde Goodreads"
          subtitle="Sube el CSV que exportas desde tu cuenta de Goodreads. Revisaremos los géneros del catálogo antes de importar."
          className="import-export-card"
        >
          <form
            className="goodreads-import-form"
            onSubmit={handleSubmit}
            aria-busy={isImporting}
            noValidate
          >
            <div className="ui-field">
              <label className="ui-field__label" htmlFor={fileInputId}>
                Archivo CSV de Goodreads
              </label>
              <input
                ref={fileInputRef}
                id={fileInputId}
                className="ui-input goodreads-import-form__file"
                type="file"
                name="file"
                accept=".csv,text/csv"
                disabled={isImporting}
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
              />
              <p className="goodreads-import-form__hint" id={`${fileInputId}-hint`}>
                Formato CSV, máximo 10 MB. Puedes exportarlo desde Goodreads en
                «Mis libros» → «Importar y exportar».
              </p>
            </div>

            {selectedFile ? (
              <p className="goodreads-import-form__filename" aria-live="polite">
                Archivo seleccionado: <strong>{selectedFile.name}</strong>
              </p>
            ) : null}

            {validationError ? (
              <p className="import-export-alert import-export-alert--error" role="alert">
                {validationError}
              </p>
            ) : null}

            {showGenreResolution && previewResult ? (
              <ImportGenreResolutionStep
                unresolvedGenres={previewResult.unresolved_genres}
                disabled={isImporting}
                onConfirm={handleGenreResolutionsConfirmed}
                onBack={handleGenreResolutionCancel}
              />
            ) : null}

            {isPreviewing ? (
              <p
                className="import-export-alert import-export-alert--progress"
                role="status"
                aria-live="polite"
              >
                Añadiendo libros a tu biblioteca. Este proceso puede tardar unos minutos. Puedes salir de esta página y volver más tarde para ver el resultado.
              </p>
            ) : null}

            {isImporting && jobProgress ? (
              <ImportProgress
                phase={jobProgress.phase}
                processedCount={jobProgress.processed_count}
                totalCount={jobProgress.total_count}
              />
            ) : null}

            {isImporting && !jobProgress ? (
              <p
                className="import-export-alert import-export-alert--progress"
                role="status"
                aria-live="polite"
              >
                Preparando importación…
              </p>
            ) : null}

            {mutationError ? (
              <p className="import-export-alert import-export-alert--error" role="alert">
                {messageFromUnknownError(mutationError)}
              </p>
            ) : null}

            {resumeError && !mutationError ? (
              <p className="import-export-alert import-export-alert--error" role="alert">
                {resumeError}
              </p>
            ) : null}

            {importResult ? <ImportSummary result={importResult} /> : null}

            <div className="goodreads-import-form__actions">
              <Button type="submit" disabled={!canSubmit || showGenreResolution}>
                {isPreviewing
                  ? 'Analizando…'
                  : isImporting
                    ? 'Importando…'
                    : 'Importar biblioteca'}
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Exportar datos" className="import-export-card import-export-card--muted">
          <p className="import-export-card__text">
            La exportación a Excel, CSV, PNG y formatos para redes sociales está
            planificada para una fase posterior.
          </p>
        </Card>
      </main>
    </div>
  );
}
