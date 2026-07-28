import { useEffect, useRef, useState, type RefObject } from 'react';
import './CoverGallery.css';

/** Minimal cover fields shared by stats period books and full library books. */
export type CoverGalleryBook = {
  id: string;
  title: string;
  authors: string;
  cover_image_url: string | null;
};

export interface CoverGalleryProps {
  books: CoverGalleryBook[];
  /** Defaults to "Galería". Pass `null` to omit the heading. */
  heading?: string | null;
  subtitle?: string;
  ariaLabel?: string;
}

const SHELF_MIN_ITEM_PX = 104; // ~6.5rem
const SHELF_GAP_PX = 16; // ~space-4

function coverAltText(book: CoverGalleryBook): string {
  return `${book.title} — ${book.authors}`;
}

function chunkBooks(
  books: CoverGalleryBook[],
  columns: number,
): CoverGalleryBook[][] {
  const size = Math.max(1, columns);
  const rows: CoverGalleryBook[][] = [];
  for (let i = 0; i < books.length; i += size) {
    rows.push(books.slice(i, i + size));
  }
  return rows;
}

function useShelfColumns(containerRef: RefObject<HTMLElement | null>): number {
  const [columns, setColumns] = useState(6);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }

    const update = (width: number) => {
      const next = Math.max(
        1,
        Math.floor((width + SHELF_GAP_PX) / (SHELF_MIN_ITEM_PX + SHELF_GAP_PX)),
      );
      setColumns(next);
    };

    update(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        update(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  return columns;
}

function CoverTile({ book }: { book: CoverGalleryBook }) {
  return (
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
            <span className="cover-gallery__placeholder-icon" aria-hidden="true">
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
  );
}

export function CoverGallery({
  books,
  heading = 'Galería',
  subtitle,
  ariaLabel,
}: CoverGalleryProps) {
  const shelvesRef = useRef<HTMLDivElement>(null);
  const columns = useShelfColumns(shelvesRef);
  const rows = chunkBooks(books, columns);

  return (
    <section
      className="cover-gallery"
      aria-label={ariaLabel ?? heading ?? 'Galería de portadas'}
    >
      {heading ? <h2 className="cover-gallery__heading">{heading}</h2> : null}
      {subtitle ? <p className="cover-gallery__subtitle">{subtitle}</p> : null}
      <div className="cover-gallery__shelves" ref={shelvesRef}>
        {rows.map((row, rowIndex) => (
          <div key={`shelf-${rowIndex}`} className="cover-gallery__shelf">
            <ul
              className="cover-gallery__shelf-row"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {row.map((book) => (
                <li key={book.id} className="cover-gallery__item">
                  <CoverTile book={book} />
                </li>
              ))}
            </ul>
            <div className="cover-gallery__plank" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
