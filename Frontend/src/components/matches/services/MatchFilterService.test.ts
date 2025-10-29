import { MatchFilterService } from './MatchFilterService';
import { ConcreteFilterStrategyFactory } from '../factories/FilterStrategyFactory';
import { ConcreteSortStrategyFactory } from '../factories/SortStrategyFactory';
import type { MatchDto } from '../../../types/api';

const mockMatches: MatchDto[] = [
  {
    id: 'match-1',
    tripId: 'trip-1',
    driverId: 'driver-1',
    score: 0.9,
    status: 'PENDING',
    origin: '40.4168,-3.7038',
    destinationSedeId: 'SEDE-1',
    dateTime: '2024-01-15T08:30:00Z',
    seatsFree: 4,
    reasons: ['Same route'],
    direction: 'TO_SEDE',
    pairedTripId: null
  },
  {
    id: 'match-2',
    tripId: 'trip-2',
    driverId: 'driver-2',
    score: 0.6,
    status: 'PENDING',
    origin: '40.4200,-3.7000',
    destinationSedeId: 'SEDE-1',
    dateTime: '2024-01-15T09:00:00Z',
    seatsFree: 2,
    reasons: ['Similar time'],
    direction: 'TO_SEDE',
    pairedTripId: null
  },
  {
    id: 'match-3',
    tripId: 'trip-3',
    driverId: 'driver-3',
    score: 0.3,
    status: 'PENDING',
    origin: '40.4100,-3.7100',
    destinationSedeId: 'SEDE-1',
    dateTime: '2024-01-16T08:00:00Z',
    seatsFree: 1,
    reasons: ['Different route'],
    direction: 'TO_SEDE',
    pairedTripId: null
  }
];

describe('MatchFilterService', () => {
  let filterService: MatchFilterService;

  beforeEach(() => {
    filterService = new MatchFilterService(
      new ConcreteFilterStrategyFactory(),
      new ConcreteSortStrategyFactory()
    );
  });

  describe('processMatches', () => {
    it('applies score filter correctly', () => {
      const filters = {
        minScore: 70,
        minSeats: 1,
        dateFrom: '',
        dateTo: '',
        sortBy: 'score' as const,
        sortOrder: 'desc' as const
      };

      const result = filterService.processMatches(mockMatches, filters);

      expect(result).toHaveLength(1);
      expect(result[0].score).toBeGreaterThanOrEqual(0.7);
    });

    it('applies seats filter correctly', () => {
      const filters = {
        minScore: 0,
        minSeats: 3,
        dateFrom: '',
        dateTo: '',
        sortBy: 'score' as const,
        sortOrder: 'desc' as const
      };

      const result = filterService.processMatches(mockMatches, filters);

      expect(result).toHaveLength(1);
      expect(result[0].seatsFree).toBeGreaterThanOrEqual(3);
    });

    it('applies date range filter correctly', () => {
      const filters = {
        minScore: 0,
        minSeats: 1,
        dateFrom: '2024-01-15',
        dateTo: '2024-01-15',
        sortBy: 'score' as const,
        sortOrder: 'desc' as const
      };

      const result = filterService.processMatches(mockMatches, filters);

      expect(result).toHaveLength(2);
      result.forEach(match => {
        const matchDate = new Date(match.dateTime);
        expect(matchDate.getDate()).toBe(15);
      });
    });

    it('sorts by score in descending order', () => {
      const filters = {
        minScore: 0,
        minSeats: 1,
        dateFrom: '',
        dateTo: '',
        sortBy: 'score' as const,
        sortOrder: 'desc' as const
      };

      const result = filterService.processMatches(mockMatches, filters);

      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
      expect(result[1].score).toBeGreaterThanOrEqual(result[2].score);
    });

    it('sorts by score in ascending order', () => {
      const filters = {
        minScore: 0,
        minSeats: 1,
        dateFrom: '',
        dateTo: '',
        sortBy: 'score' as const,
        sortOrder: 'asc' as const
      };

      const result = filterService.processMatches(mockMatches, filters);

      expect(result[0].score).toBeLessThanOrEqual(result[1].score);
      expect(result[1].score).toBeLessThanOrEqual(result[2].score);
    });

    it('sorts by date in descending order', () => {
      const filters = {
        minScore: 0,
        minSeats: 1,
        dateFrom: '',
        dateTo: '',
        sortBy: 'date' as const,
        sortOrder: 'desc' as const
      };

      const result = filterService.processMatches(mockMatches, filters);

      const date1 = new Date(result[0].dateTime);
      const date2 = new Date(result[1].dateTime);
      const date3 = new Date(result[2].dateTime);
      
      expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      expect(date2.getTime()).toBeGreaterThanOrEqual(date3.getTime());
    });

    it('sorts by seats in descending order', () => {
      const filters = {
        minScore: 0,
        minSeats: 1,
        dateFrom: '',
        dateTo: '',
        sortBy: 'seats' as const,
        sortOrder: 'desc' as const
      };

      const result = filterService.processMatches(mockMatches, filters);

      expect(result[0].seatsFree).toBeGreaterThanOrEqual(result[1].seatsFree);
      expect(result[1].seatsFree).toBeGreaterThanOrEqual(result[2].seatsFree);
    });

    it('applies multiple filters correctly', () => {
      const filters = {
        minScore: 50,
        minSeats: 2,
        dateFrom: '2024-01-15',
        dateTo: '2024-01-15',
        sortBy: 'score' as const,
        sortOrder: 'desc' as const
      };

      const result = filterService.processMatches(mockMatches, filters);

      expect(result).toHaveLength(1);
      expect(result[0].score).toBeGreaterThanOrEqual(0.5);
      expect(result[0].seatsFree).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array when no matches meet criteria', () => {
      const filters = {
        minScore: 95,
        minSeats: 1,
        dateFrom: '',
        dateTo: '',
        sortBy: 'score' as const,
        sortOrder: 'desc' as const
      };

      const result = filterService.processMatches(mockMatches, filters);

      expect(result).toHaveLength(0);
    });
  });

  describe('getActiveFilterNames', () => {
    it('returns empty array when no filters are active', () => {
      const filters = {
        minScore: 0,
        minSeats: 1,
        dateFrom: '',
        dateTo: ''
      };

      const result = filterService.getActiveFilterNames(filters);

      expect(result).toHaveLength(0);
    });

    it('returns score filter name when score filter is active', () => {
      const filters = {
        minScore: 70,
        minSeats: 1,
        dateFrom: '',
        dateTo: ''
      };

      const result = filterService.getActiveFilterNames(filters);

      expect(result).toContain('Score ≥ 70%');
    });

    it('returns seats filter name when seats filter is active', () => {
      const filters = {
        minScore: 0,
        minSeats: 3,
        dateFrom: '',
        dateTo: ''
      };

      const result = filterService.getActiveFilterNames(filters);

      expect(result).toContain('Seats ≥ 3');
    });

    it('returns date filter name when date filter is active', () => {
      const filters = {
        minScore: 0,
        minSeats: 1,
        dateFrom: '2024-01-15',
        dateTo: '2024-01-16'
      };

      const result = filterService.getActiveFilterNames(filters);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('From');
      expect(result[0]).toContain('To');
    });

    it('returns multiple filter names when multiple filters are active', () => {
      const filters = {
        minScore: 60,
        minSeats: 2,
        dateFrom: '2024-01-15',
        dateTo: ''
      };

      const result = filterService.getActiveFilterNames(filters);

      expect(result).toHaveLength(2);
      expect(result).toContain('Score ≥ 60%');
      expect(result).toContain('Seats ≥ 2');
    });
  });
});
