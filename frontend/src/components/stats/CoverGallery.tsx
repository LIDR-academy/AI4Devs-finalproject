import type { PeriodBookSummary } from '../../api/types';
import './CoverGallery.css';

export interface CoverGalleryProps {
  books: PeriodBookSummary[];
  periodScope: string;
}

function coverAltText(book: PeriodBookSummary): string {
  return `${book.title} — ${book.authors}`;
}

export function CoverGallery({ books, periodScope }: CoverGalleryProps) {
  return (
    <section
      className="cover-gallery"
      aria-label={`Portadas de libros leídos ${periodScope}`}
    >
      <h2 className="cover-gallery__heading">Galería</h2>
      <p className="cover-gallery__subtitle">
        Libros terminados {periodScope} ({books.length})
      </p>
      <ul className="cover-gallery__grid">
        {books.map((book) => (
          <li key={book.id} className="cover-gallery__item">
            <figure className="cover-gallery__tile">
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
                  <span className="cover-gallery__placeholder-icon" aria-hidden="true">
                    📖
                  </span>
                </div>
              )}
              <figcaption className="cover-gallery__caption">
                <span className="cover-gallery__title">{book.title}</span>
                <span className="cover-gallery__authors">{book.authors}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
