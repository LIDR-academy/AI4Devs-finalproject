import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  catalogEditionToCreatePayload,
  createBook,
  fetchEditionCovers,
  listGenres,
  searchCatalog,
} from '../api/client';
import { messageFromUnknownError } from '../api/errors';
import type { CatalogEdition, CoverOption } from '../api/types';
import { AudienceSelect } from './AudienceSelect';
import { CoverPicker } from './CoverPicker';
import { GenreSelect } from './GenreSelect';
import './AddBookModal.css';

type ModalStep = 'search' | 'covers';

interface AddBookModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onCreateManual?: () => void;
}

function matchGenreId(
  catalogGenre: string | null,
  genres: Array<{ id: string; name: string }>,
): string | null {
  if (!catalogGenre) return null;
  const needle = catalogGenre.trim().toLowerCase();
  return genres.find((g) => g.name.toLowerCase() === needle)?.id ?? null;
}

export function AddBookModal({ open, onClose, onSaved, onCreateManual }: AddBookModalProps) {
  const [step, setStep] = useState<ModalStep>('search');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<CatalogEdition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<CatalogEdition | null>(null);
  const [covers, setCovers] = useState<CoverOption[]>([]);
  const [selectedCover, setSelectedCover] = useState<CoverOption | null>(null);
  const [coversLoading, setCoversLoading] = useState(false);
  const [coversError, setCoversError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audienceId, setAudienceId] = useState<string | null>(null);
  const [genreId, setGenreId] = useState<string | null>(null);

  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: listGenres,
    enabled: open,
  });

  const resetState = useCallback(() => {
    setStep('search');
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setSelectedEdition(null);
    setCovers([]);
    setSelectedCover(null);
    setCoversLoading(false);
    setCoversError(null);
    setSearchLoading(false);
    setSaving(false);
    setError(null);
    setAudienceId(null);
    setGenreId(null);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  useEffect(() => {
    if (!open || step !== 'search' || debouncedQuery.length < 2) {
      if (step === 'search') setResults([]);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setError(null);

    searchCatalog(debouncedQuery)
      .then((res) => {
        if (!cancelled) {
          setResults(res.items);
          setSelectedEdition(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudo buscar. Comprueba la conexión e inténtalo de nuevo.');
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open, step]);

  const loadCovers = useCallback(async (edition: CatalogEdition) => {
    setCoversLoading(true);
    setCoversError(null);
    setCovers([]);
    setSelectedCover(null);

    try {
      const res = await fetchEditionCovers(
        edition.data_source,
        edition.external_provider_id,
        edition.cover_image_url,
      );
      setCovers(res.covers);
      if (res.covers.length === 1) {
        setSelectedCover(res.covers[0]);
      } else if (res.default_cover_id) {
        const def = res.covers.find((c) => c.id === res.default_cover_id);
        if (def) setSelectedCover(def);
      }
    } catch {
      setCoversError('No se pudieron cargar las portadas.');
    } finally {
      setCoversLoading(false);
    }
  }, []);

  const handleSelectEdition = useCallback(
    (edition: CatalogEdition) => {
      setSelectedEdition(edition);
      setAudienceId(null);
      setGenreId(matchGenreId(edition.genre, genres));
      setStep('covers');
      setError(null);
      void loadCovers(edition);
    },
    [genres, loadCovers],
  );

  const handleBackToSearch = () => {
    setStep('search');
    setSelectedEdition(null);
    setCovers([]);
    setSelectedCover(null);
    setCoversError(null);
    setGenreId(null);
  };

  const canSave =
    !!selectedEdition && (covers.length === 0 || selectedCover !== null);

  const handleSave = useCallback(async () => {
    if (!selectedEdition) return;
    if (covers.length > 0 && !selectedCover) return;

    setSaving(true);
    setError(null);
    const coverUrl = selectedCover?.url ?? null;

    try {
      await createBook(
        catalogEditionToCreatePayload(
          selectedEdition,
          coverUrl,
          audienceId,
          genreId,
        ),
      );
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(messageFromUnknownError(err));
    } finally {
      setSaving(false);
    }
  }, [
    selectedEdition,
    selectedCover,
    covers.length,
    audienceId,
    genreId,
    onSaved,
    onClose,
  ]);

  const showManualCreate =
    step === 'search' &&
    debouncedQuery.length >= 2 &&
    !searchLoading &&
    results.length === 0;

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="add-book-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="add-book-title">
            {step === 'search' ? 'Añadir libro' : 'Elige portada'}
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        {step === 'search' && (
          <>
            <label className="search-label">
              Título o autora
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en Open Library…"
                autoFocus
              />
            </label>

            {searchLoading && (
              <p className="modal-hint">Buscando en Open Library… (puede tardar unos segundos)</p>
            )}
            {showManualCreate && (
              <div className="manual-create-fallback">
                <p className="modal-hint">No se encontraron libros.</p>
                {onCreateManual ? (
                  <button
                    type="button"
                    className="btn-manual-create"
                    onClick={onCreateManual}
                  >
                    Crear manualmente
                  </button>
                ) : null}
              </div>
            )}

            <ul className="edition-list">
              {results.map((edition) => (
                <li key={`${edition.data_source}-${edition.external_provider_id}`}>
                  <button
                    type="button"
                    className="edition-card"
                    onClick={() => handleSelectEdition(edition)}
                  >
                    {edition.cover_image_url ? (
                      <img src={edition.cover_image_url} alt="" className="edition-cover" />
                    ) : (
                      <div className="edition-cover placeholder">Sin portada</div>
                    )}
                    <div className="edition-meta">
                      <strong>{edition.title}</strong>
                      <span>{edition.authors}</span>
                      <span className="edition-meta-detail">
                        <span className="edition-meta-tag">
                          Género: {edition.genre ?? '—'}
                        </span>
                        <span className="edition-meta-tag">
                          Páginas: {edition.page_count != null ? edition.page_count : '—'}
                        </span>
                        {edition.isbn_13 ? (
                          <span className="edition-meta-tag">ISBN: {edition.isbn_13}</span>
                        ) : null}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 'covers' && selectedEdition && (
          <>
            <button type="button" className="modal-back" onClick={handleBackToSearch}>
              ← Volver a resultados
            </button>
            <p className="edition-summary">
              <strong>{selectedEdition.title}</strong> · {selectedEdition.authors}
              <br />
              Género: {selectedEdition.genre ?? '—'} · Páginas:{' '}
              {selectedEdition.page_count != null ? selectedEdition.page_count : '—'}
            </p>
            <CoverPicker
              covers={covers}
              selectedId={selectedCover?.id ?? null}
              onSelect={setSelectedCover}
              loading={coversLoading}
              error={coversError}
              onRetry={() => loadCovers(selectedEdition)}
              editionTitle={selectedEdition.title}
            />
            <GenreSelect
              id="add-book-genre"
              label="Género"
              value={genreId}
              onChange={setGenreId}
              disabled={saving}
            />
            <AudienceSelect
              id="add-book-audience"
              label="Público objetivo"
              value={audienceId}
              onChange={setAudienceId}
              disabled={saving}
            />
          </>
        )}

        {error && (
          <p className="modal-error modal-error-global" role="alert">
            {error}
          </p>
        )}

        <footer className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          {step === 'covers' && (
            <button
              type="button"
              className="btn-primary"
              disabled={!canSave || saving}
              onClick={handleSave}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
