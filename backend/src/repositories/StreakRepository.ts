import { db } from '../config/firebaseAdmin';
import { Streak } from '../types';

const COLLECTION = 'streaks';

function toStreak(doc: FirebaseFirestore.DocumentData, userId: string): Streak {
  return {
    userId,
    currentStreak: doc.currentStreak ?? 0,
    lastCompletedDate: doc.lastCompletedDate ?? null,
    longestStreak: doc.longestStreak ?? 0,
    updatedAt: doc.updatedAt?.toDate() ?? new Date(),
  };
}

export const StreakRepository = {
  async findByUser(userId: string): Promise<Streak> {
    const doc = await db.collection(COLLECTION).doc(userId).get();
    if (!doc.exists) {
      return {
        userId,
        currentStreak: 0,
        lastCompletedDate: null,
        longestStreak: 0,
        updatedAt: new Date(),
      };
    }
    return toStreak(doc.data()!, userId);
  },

  async upsert(streak: Streak): Promise<Streak> {
    const now = new Date();
    await db
      .collection(COLLECTION)
      .doc(streak.userId)
      .set(
        {
          userId: streak.userId,
          currentStreak: streak.currentStreak,
          lastCompletedDate: streak.lastCompletedDate,
          longestStreak: streak.longestStreak,
          updatedAt: now,
        },
        { merge: true }
      );
    return { ...streak, updatedAt: now };
  },
};
