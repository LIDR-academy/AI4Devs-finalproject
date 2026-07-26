import { StreakRepository } from '../repositories/StreakRepository';
import { Streak } from '../types';

function getDateString(date: Date, timezone?: string): string {
  try {
    if (timezone) {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    }
  } catch {
    // fallback to UTC
  }
  return date.toISOString().split('T')[0];
}

function isConsecutiveDay(lastDate: string, today: string): boolean {
  const last = new Date(lastDate + 'T12:00:00Z');
  const current = new Date(today + 'T12:00:00Z');
  const diffMs = current.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export const StreakService = {
  async getStreak(userId: string): Promise<Streak> {
    return StreakRepository.findByUser(userId);
  },

  async updateAfterSession(userId: string, timezone?: string): Promise<Streak> {
    const today = getDateString(new Date(), timezone);
    const streak = await StreakRepository.findByUser(userId);

    if (streak.lastCompletedDate === today) {
      return streak;
    }

    let newStreak: number;
    if (streak.lastCompletedDate && isConsecutiveDay(streak.lastCompletedDate, today)) {
      newStreak = streak.currentStreak + 1;
    } else {
      newStreak = 1;
    }

    const updatedStreak: Streak = {
      ...streak,
      currentStreak: newStreak,
      lastCompletedDate: today,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      updatedAt: new Date(),
    };

    return StreakRepository.upsert(updatedStreak);
  },
};
