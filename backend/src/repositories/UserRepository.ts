import { db } from '../config/firebaseAdmin';
import { User, UiLanguage } from '../types';

const COLLECTION = 'users';

export const UserRepository = {
  async findById(userId: string): Promise<User | null> {
    const doc = await db.collection(COLLECTION).doc(userId).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: userId,
      email: data.email,
      uiLanguage: data.uiLanguage,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  },

  async create(userId: string, email: string, uiLanguage: UiLanguage = 'es'): Promise<User> {
    const now = new Date();
    const user: User = {
      id: userId,
      email,
      uiLanguage,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection(COLLECTION).doc(userId).set({
      email,
      uiLanguage,
      createdAt: now,
      updatedAt: now,
    });
    return user;
  },

  async update(userId: string, data: { uiLanguage?: UiLanguage }): Promise<void> {
    await db
      .collection(COLLECTION)
      .doc(userId)
      .update({ ...data, updatedAt: new Date() });
  },
};
