import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'inkspire_favorites';

/** Client-side favorites (saved artists), persisted in localStorage. */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly favoriteIds = signal<ReadonlySet<string>>(this.load());

  readonly favorites = this.favoriteIds.asReadonly();

  isFavorite(artistId: string): boolean {
    return this.favoriteIds().has(artistId);
  }

  toggle(artistId: string): void {
    const next = new Set(this.favoriteIds());
    if (next.has(artistId)) {
      next.delete(artistId);
    } else {
      next.add(artistId);
    }
    this.favoriteIds.set(next);
    this.persist(next);
  }

  private load(): ReadonlySet<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
    } catch {
      return new Set();
    }
  }

  private persist(ids: ReadonlySet<string>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch {
      // Storage unavailable (private mode/quota): favorites stay in memory only.
    }
  }
}
