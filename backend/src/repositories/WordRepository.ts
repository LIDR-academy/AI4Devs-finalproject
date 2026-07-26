import { db } from '../config/firebaseAdmin';
import { WordCard, WordCardStatus, DefinitionLanguage } from '../types';

const COLLECTION = 'wordCards';

export interface CreateWordDto {
  userId: string;
  term: string;
  normalizedTerm: string;
  definition: string;
  definitionLanguage: DefinitionLanguage;
  imageUrl: string;
  unsplashPhotoId: string | null;
  status: WordCardStatus;
}

export interface UpdateWordDto {
  definition?: string;
  imageUrl?: string;
  unsplashPhotoId?: string;
  status?: WordCardStatus;
  learnedAt?: Date | null;
}

function toWordCard(doc: FirebaseFirestore.DocumentData, id: string): WordCard {
  return {
    id,
    userId: doc.userId,
    term: doc.term,
    normalizedTerm: doc.normalizedTerm,
    definition: doc.definition,
    definitionLanguage: doc.definitionLanguage,
    imageUrl: doc.imageUrl,
    unsplashPhotoId: doc.unsplashPhotoId ?? null,
    status: doc.status,
    learnedAt: doc.learnedAt?.toDate() ?? null,
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
}

export const WordRepository = {
  async findByNormalizedTerm(
    userId: string,
    normalizedTerm: string
  ): Promise<WordCard | null> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .where('normalizedTerm', '==', normalizedTerm)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return toWordCard(doc.data(), doc.id);
  },

  async findById(id: string, userId: string): Promise<WordCard | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    if (data.userId !== userId) return null;
    return toWordCard(data, doc.id);
  },

  async findAllByUser(userId: string): Promise<WordCard[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => toWordCard(doc.data(), doc.id));
  },

  async countByUser(userId: string): Promise<number> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .count()
      .get();
    return snapshot.data().count;
  },

  async create(data: CreateWordDto): Promise<WordCard> {
    const ref = db.collection(COLLECTION).doc();
    const now = new Date();
    const wordCard: WordCard = {
      id: ref.id,
      ...data,
      learnedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await ref.set({
      ...wordCard,
      createdAt: now,
      updatedAt: now,
    });
    return wordCard;
  },

  async update(id: string, userId: string, data: UpdateWordDto): Promise<WordCard | null> {
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists || doc.data()!.userId !== userId) return null;

    const now = new Date();
    const updateData: Record<string, unknown> = { ...data, updatedAt: now };

    if (data.status === 'learned' && !data.learnedAt) {
      updateData.learnedAt = now;
    } else if (data.status === 'active') {
      updateData.learnedAt = null;
    }

    await ref.update(updateData);
    const updated = await ref.get();
    return toWordCard(updated.data()!, updated.id);
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists || doc.data()!.userId !== userId) return false;
    await ref.delete();
    return true;
  },
};
