import { useCallback, useEffect, useId, useState } from 'react';
import { searchBookCovers } from '../api/client';
import { messageFromUnknownError } from '../api/errors';
import type { CoverOption } from '../api/types';
import { flattenBookCoverSearchItems } from '../lib/bookCoverSearch';
import { CoverPicker } from './CoverPicker';
import { Button, Input } from './ui';
import './BookCoverSearchPanel.css';

const EMPTY_SEARCH_MESSAGE =
  'No se han encontrado portadas para esta búsqueda';

export type BookCoverSearchPanelProps = {
  bookId: string;
  defaultQuery: string;
  selectedCoverUrl: string;
  onSelectCover: (url: string) => void;
  disabled?: boolean;
};

export function BookCoverSearchPanel({
  bookId,
  defaultQuery,
  selectedCoverUrl,
  onSelectCover,
  disabled = false,
}: BookCoverSearchPanelProps) {
  const searchInputId = useId();
  const [query, setQuery] = useState(defaultQuery);
  const [covers, setCovers] = useState<CoverOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchBookCovers(bookId, searchQuery);
      const flatCovers = flattenBookCoverSearchItems(response.items);
      setQuery(response.query);
      setCovers(flatCovers);
      return flatCovers;
    } catch (err: unknown) {
      setError(messageFromUnknownError(err));
      setCovers([]);
      setSelectedId(null);
      return [];
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    let cancelled = false;

    void runSearch(defaultQuery).then((flatCovers) => {
      if (cancelled) return;
      const trimmedUrl = selectedCoverUrl.trim();
      if (!trimmedUrl) {
        setSelectedId(null);
        return;
      }
      const match = flatCovers.find((cover) => cover.url === trimmedUrl);
      setSelectedId(match?.id ?? null);
    });

    return () => {
      cancelled = true;
    };
    // Initial search when the panel opens for this book.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaultQuery is captured at mount
  }, [bookId, runSearch]);

  useEffect(() => {
    const trimmedUrl = selectedCoverUrl.trim();
    if (!trimmedUrl) {
      setSelectedId(null);
      return;
    }
    const match = covers.find((cover) => cover.url === trimmedUrl);
    setSelectedId(match?.id ?? null);
  }, [covers, selectedCoverUrl]);

  const handleSelect = (cover: CoverOption | null) => {
    if (!cover) return;
    setSelectedId(cover.id);
    onSelectCover(cover.url);
  };

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length === 0 || trimmedQuery.length >= 2;

  return (
    <div className="book-cover-search book-form__full-width">
      <div className="book-cover-search__controls">
        <Input
          id={searchInputId}
          label="Búsqueda de portada"
          value={query}
          disabled={disabled || loading}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button
          variant="secondary"
          disabled={disabled || loading || !canSearch}
          onClick={() => void runSearch(query)}
        >
          Buscar
        </Button>
      </div>

      <CoverPicker
        covers={covers}
        selectedId={selectedId}
        onSelect={handleSelect}
        loading={loading}
        error={error}
        onRetry={() => void runSearch(query)}
        editionTitle="resultados de búsqueda"
        emptyMessage={EMPTY_SEARCH_MESSAGE}
        showContinueWithoutCover={false}
      />
    </div>
  );
}
