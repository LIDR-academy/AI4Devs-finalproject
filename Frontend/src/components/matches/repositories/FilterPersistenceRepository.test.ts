import { LocalStorageFilterRepository } from './FilterPersistenceRepository';
import type { FilterOptions } from '../MatchFilters';

describe('LocalStorageFilterRepository', () => {
  let repository: LocalStorageFilterRepository;

  beforeEach(() => {
    repository = new LocalStorageFilterRepository();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('save', () => {
    it('saves filters to localStorage', () => {
      const filters: FilterOptions = {
        minScore: 70,
        minSeats: 2,
        dateFrom: '2024-01-15',
        dateTo: '2024-01-16',
        sortBy: 'score',
        sortOrder: 'desc'
      };

      repository.save(filters);

      const saved = localStorage.getItem('matchFilters');
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual(filters);
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const filters: FilterOptions = {
        minScore: 70,
        minSeats: 2,
        dateFrom: '',
        dateTo: '',
        sortBy: 'score',
        sortOrder: 'desc'
      };

      repository.save(filters);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save filters to localStorage:',
        expect.any(Error)
      );

      // Restore original localStorage
      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe('load', () => {
    it('loads filters from localStorage', () => {
      const filters: FilterOptions = {
        minScore: 70,
        minSeats: 2,
        dateFrom: '2024-01-15',
        dateTo: '2024-01-16',
        sortBy: 'score',
        sortOrder: 'desc'
      };

      localStorage.setItem('matchFilters', JSON.stringify(filters));

      const result = repository.load();

      expect(result).toEqual(filters);
    });

    it('returns null when no filters are saved', () => {
      const result = repository.load();

      expect(result).toBeNull();
    });

    it('returns null when saved data is invalid JSON', () => {
      localStorage.setItem('matchFilters', 'invalid json');

      const result = repository.load();

      expect(result).toBeNull();
    });

    it('returns null when saved data has invalid structure', () => {
      const invalidData = {
        minScore: 'not a number',
        minSeats: 2,
        dateFrom: '2024-01-15',
        dateTo: '2024-01-16',
        sortBy: 'score',
        sortOrder: 'desc'
      };

      localStorage.setItem('matchFilters', JSON.stringify(invalidData));

      const result = repository.load();

      expect(result).toBeNull();
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = repository.load();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load filters from localStorage:',
        expect.any(Error)
      );

      // Restore original localStorage
      localStorage.getItem = originalGetItem;
      consoleSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('removes filters from localStorage', () => {
      const filters: FilterOptions = {
        minScore: 70,
        minSeats: 2,
        dateFrom: '',
        dateTo: '',
        sortBy: 'score',
        sortOrder: 'desc'
      };

      localStorage.setItem('matchFilters', JSON.stringify(filters));
      expect(localStorage.getItem('matchFilters')).toBeTruthy();

      repository.clear();

      expect(localStorage.getItem('matchFilters')).toBeNull();
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      repository.clear();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear filters from localStorage:',
        expect.any(Error)
      );

      // Restore original localStorage
      localStorage.removeItem = originalRemoveItem;
      consoleSpy.mockRestore();
    });
  });

  describe('isValidFilterOptions', () => {
    it('validates correct filter options structure', () => {
      const validFilters: FilterOptions = {
        minScore: 70,
        minSeats: 2,
        dateFrom: '2024-01-15',
        dateTo: '2024-01-16',
        sortBy: 'score',
        sortOrder: 'desc'
      };

      // Access private method through type assertion
      const repository = new LocalStorageFilterRepository() as any;
      const isValid = repository.isValidFilterOptions(validFilters);

      expect(isValid).toBe(true);
    });

    it('rejects invalid filter options structure', () => {
      const invalidFilters = {
        minScore: 'not a number',
        minSeats: 2,
        dateFrom: '2024-01-15',
        dateTo: '2024-01-16',
        sortBy: 'score',
        sortOrder: 'desc'
      };

      // Access private method through type assertion
      const repository = new LocalStorageFilterRepository() as any;
      const isValid = repository.isValidFilterOptions(invalidFilters);

      expect(isValid).toBe(false);
    });

    it('rejects null or undefined', () => {
      // Access private method through type assertion
      const repository = new LocalStorageFilterRepository() as any;
      
      expect(repository.isValidFilterOptions(null)).toBe(false);
      expect(repository.isValidFilterOptions(undefined)).toBe(false);
    });

    it('accepts filters with optional date fields', () => {
      const filtersWithOptionalDates = {
        minScore: 70,
        minSeats: 2,
        dateFrom: undefined,
        dateTo: undefined,
        sortBy: 'score',
        sortOrder: 'desc'
      };

      // Access private method through type assertion
      const repository = new LocalStorageFilterRepository() as any;
      const isValid = repository.isValidFilterOptions(filtersWithOptionalDates);

      expect(isValid).toBe(true);
    });
  });
});
