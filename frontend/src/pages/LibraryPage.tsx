import { useQuery } from '@tanstack/react-query';
import { listBooks } from '../api/client';
import { CoverGallery } from '../components/stats/CoverGallery';
import { PageHeader } from '../components/ui';
import './LibraryPage.css';

export function LibraryPage() {
  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: listBooks,
  });

  return (
    <div className="library-page">
      <PageHeader
        title="Biblioteca"
      />

      {isLoading ? (
        <p className="library-page__status">Cargando biblioteca…</p>
      ) : null}

      {error ? (
        <p className="library-page__error" role="alert">
          No se pudieron cargar los libros de la biblioteca.
        </p>
      ) : null}

      {!isLoading && !error && books.length === 0 ? (
        <p className="library-page__empty">
          Aún no tienes libros. Añade alguno desde Todas mis lecturas.
        </p>
      ) : null}

      {!isLoading && !error && books.length > 0 ? (
        <CoverGallery
          books={books}
          heading="Galería"
          subtitle={`Todos tus libros (${books.length})`}
          ariaLabel="Portadas de toda tu biblioteca"
        />
      ) : null}
    </div>
  );
}
