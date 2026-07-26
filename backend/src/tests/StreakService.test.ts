import { StreakService } from '../services/StreakService';
import { StreakRepository } from '../repositories/StreakRepository';
import { Streak } from '../types';

jest.mock('../repositories/StreakRepository');

const mockRepo = StreakRepository as jest.Mocked<typeof StreakRepository>;

const baseStreak: Streak = {
  userId: 'user-test',
  currentStreak: 3,
  lastCompletedDate: '2026-06-13',
  longestStreak: 5,
  updatedAt: new Date('2026-06-13'),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('StreakService.getStreak', () => {
  it('devuelve la racha del usuario desde el repositorio', async () => {
    mockRepo.findByUser.mockResolvedValue(baseStreak);

    const result = await StreakService.getStreak('user-test');

    expect(result).toEqual(baseStreak);
    expect(mockRepo.findByUser).toHaveBeenCalledWith('user-test');
  });
});

describe('StreakService.updateAfterSession', () => {
  it('es idempotente: no actualiza si ya se completó hoy', async () => {
    jest.setSystemTime(new Date('2026-06-13T12:00:00Z'));
    mockRepo.findByUser.mockResolvedValue(baseStreak);

    const result = await StreakService.updateAfterSession('user-test');

    expect(result).toEqual(baseStreak);
    expect(mockRepo.upsert).not.toHaveBeenCalled();
  });

  it('incrementa la racha al completar el día siguiente consecutivo', async () => {
    jest.setSystemTime(new Date('2026-06-14T12:00:00Z'));
    mockRepo.findByUser.mockResolvedValue(baseStreak);
    mockRepo.upsert.mockImplementation(async (s) => s);

    const result = await StreakService.updateAfterSession('user-test');

    expect(result.currentStreak).toBe(4);
    expect(result.lastCompletedDate).toBe('2026-06-14');
    expect(result.longestStreak).toBe(5);
  });

  it('resetea la racha a 1 si se saltó un día', async () => {
    jest.setSystemTime(new Date('2026-06-16T12:00:00Z'));
    mockRepo.findByUser.mockResolvedValue(baseStreak);
    mockRepo.upsert.mockImplementation(async (s) => s);

    const result = await StreakService.updateAfterSession('user-test');

    expect(result.currentStreak).toBe(1);
    expect(result.lastCompletedDate).toBe('2026-06-16');
  });

  it('inicia la racha en 1 la primera vez (sin historial)', async () => {
    jest.setSystemTime(new Date('2026-06-14T12:00:00Z'));
    const newUserStreak: Streak = {
      userId: 'user-new',
      currentStreak: 0,
      lastCompletedDate: null,
      longestStreak: 0,
      updatedAt: new Date(),
    };
    mockRepo.findByUser.mockResolvedValue(newUserStreak);
    mockRepo.upsert.mockImplementation(async (s) => s);

    const result = await StreakService.updateAfterSession('user-new');

    expect(result.currentStreak).toBe(1);
    expect(result.lastCompletedDate).toBe('2026-06-14');
    expect(result.longestStreak).toBe(1);
  });

  it('actualiza longestStreak cuando la racha actual lo supera', async () => {
    jest.setSystemTime(new Date('2026-06-14T12:00:00Z'));
    const highStreak: Streak = {
      ...baseStreak,
      currentStreak: 5,
      longestStreak: 5,
    };
    mockRepo.findByUser.mockResolvedValue(highStreak);
    mockRepo.upsert.mockImplementation(async (s) => s);

    const result = await StreakService.updateAfterSession('user-test');

    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it('no actualiza longestStreak si la racha actual es menor', async () => {
    jest.setSystemTime(new Date('2026-06-14T12:00:00Z'));
    mockRepo.findByUser.mockResolvedValue(baseStreak);
    mockRepo.upsert.mockImplementation(async (s) => s);

    const result = await StreakService.updateAfterSession('user-test');

    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(5);
  });
});
