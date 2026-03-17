import type { FilterOptions } from '../MatchFilters';

/**
 * Repository for persisting filter state
 * Follows Repository pattern and Single Responsibility Principle
 */
export interface FilterPersistenceRepository {
  save(filters: FilterOptions): void;
  load(): FilterOptions | null;
  clear(): void;
}

/**
 * LocalStorage implementation of filter persistence
 * Follows Dependency Inversion Principle - depends on abstraction
 */
export class LocalStorageFilterRepository implements FilterPersistenceRepository {
  private readonly storageKey = 'matchFilters';

  save(filters: FilterOptions): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }

  load(): FilterOptions | null {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      
      // Validate the structure
      if (this.isValidFilterOptions(parsed)) {
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error);
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear filters from localStorage:', error);
    }
  }

  private isValidFilterOptions(obj: any): obj is FilterOptions {
    return (
      obj &&
      typeof obj.minScore === 'number' &&
      typeof obj.minSeats === 'number' &&
      typeof obj.sortBy === 'string' &&
      typeof obj.sortOrder === 'string' &&
      (obj.dateFrom === undefined || typeof obj.dateFrom === 'string') &&
      (obj.dateTo === undefined || typeof obj.dateTo === 'string')
    );
  }
}
