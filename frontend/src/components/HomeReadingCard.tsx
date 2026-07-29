import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listBooks } from '../api/client';
import type { Book } from '../api/types';
import { Card } from './ui';
import './stats/CoverGallery.css';
import './HomeReadingCard.css';

function coverAltText(book: Pick<Book, 'title' | 'authors'>): string {
  return `${book.title} — ${book.authors}`;
}

function isReading(book: Book): boolean {
  return (book.reading_status ?? 'pendiente') === 'leyendo';
}

export function HomeReadingCard() {
  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: listBooks,
  });

  const readingBooks = books.filter(isReading);

  return (
    <Card className="home-card home-reading-card" title="Libros en curso">
      {isLoading ? (
        <p className="home-reading-card__status">Cargando lecturas…</p>
      ) : null}

      {error ? (
        <p className="home-reading-card__error" role="alert">
          No se pudieron cargar las lecturas en curso.
        </p>
      ) : null}

      {!isLoading && !error && readingBooks.length === 0 ? (
        <p className="home-reading-card__empty">
          No tienes libros en lectura ahora mismo.{' '}
          <Link to="/book-tracker">Ir al seguimiento</Link>
        </p>
      ) : null}

      {!isLoading && !error && readingBooks.length > 0 ? (
        <div className="home-reading-card__body">
          <ul
            className="home-reading-card__grid"
            aria-label={`${readingBooks.length} libros en curso`}
          >
            {readingBooks.map((book) => (
              <li key={book.id} className="cover-gallery__item">
                <figure className="cover-gallery__tile">
                  <div className="cover-gallery__media">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={coverAltText(book)}
                        className="cover-gallery__image"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="cover-gallery__placeholder"
                        role="img"
                        aria-label={coverAltText(book)}
                      >
                        <span
                          className="cover-gallery__placeholder-icon"
                          aria-hidden="true"
                        >
                          📖
                        </span>
                      </div>
                    )}
                  </div>
                  <figcaption className="cover-gallery__caption">
                    <span className="cover-gallery__title">{book.title}</span>
                    <span className="cover-gallery__authors">{book.authors}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="home-reading-card__footer">
            <Link to="/book-tracker">Ver en Todas mis lecturas</Link>
          </p>
        </div>
      ) : null}
    </Card>
  );
}
