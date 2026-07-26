import { db } from '../config/firebaseAdmin';
import { DailySession, Exercise, ExerciseAnswer } from '../types';

const COLLECTION = 'dailySessions';

function toSession(doc: FirebaseFirestore.DocumentData, id: string): DailySession {
  return {
    id,
    userId: doc.userId,
    sessionDate: doc.sessionDate,
    totalExercises: doc.totalExercises,
    correctAnswers: doc.correctAnswers,
    completed: doc.completed,
    startedAt: doc.startedAt.toDate(),
    completedAt: doc.completedAt?.toDate() ?? null,
    exercises: doc.exercises ?? [],
  };
}

export const SessionRepository = {
  async findInProgressByDate(
    userId: string,
    sessionDate: string
  ): Promise<DailySession | null> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .where('sessionDate', '==', sessionDate)
      .get();

    const inProgressDoc = snapshot.docs.find((doc) => !doc.data().completed);
    if (!inProgressDoc) return null;
    return toSession(inProgressDoc.data(), inProgressDoc.id);
  },

  async findById(id: string, userId: string): Promise<DailySession | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    if (data.userId !== userId) return null;
    return toSession(data, doc.id);
  },

  async create(data: {
    userId: string;
    sessionDate: string;
    exercises: Exercise[];
  }): Promise<DailySession> {
    const ref = db.collection(COLLECTION).doc();
    const now = new Date();
    const session: DailySession = {
      id: ref.id,
      userId: data.userId,
      sessionDate: data.sessionDate,
      totalExercises: 10,
      correctAnswers: 0,
      completed: false,
      startedAt: now,
      completedAt: null,
      exercises: data.exercises,
    };
    await ref.set({
      ...session,
      startedAt: now,
    });
    return session;
  },

  async complete(
    id: string,
    userId: string,
    answers: ExerciseAnswer[]
  ): Promise<DailySession | null> {
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    if (data.userId !== userId) return null;

    const exercises = data.exercises as Exercise[];
    let correctAnswers = 0;

    const updatedExercises = exercises.map((ex) => {
      const answer = answers.find((a) => a.exerciseId === ex.id);
      if (!answer) return ex;
      const isCorrect = answer.userAnswer === ex.correctAnswer;
      if (isCorrect) correctAnswers++;
      return { ...ex, userAnswer: answer.userAnswer, isCorrect };
    });

    const now = new Date();
    await ref.update({
      exercises: updatedExercises,
      correctAnswers,
      completed: true,
      completedAt: now,
    });

    return {
      id,
      userId,
      sessionDate: data.sessionDate,
      totalExercises: 10,
      correctAnswers,
      completed: true,
      startedAt: data.startedAt.toDate(),
      completedAt: now,
      exercises: updatedExercises,
    };
  },
};
