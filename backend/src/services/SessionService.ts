import { SessionRepository } from '../repositories/SessionRepository';
import { WordRepository } from '../repositories/WordRepository';
import { StreakService } from './StreakService';
import { generateMCQ } from '../integrations/claudeClient';
import { ForbiddenError, ConflictError, NotFoundError, AppError } from '../middleware/errorHandler';
import {
  DailySession,
  Exercise,
  WordCard,
  ExerciseAnswer,
  Streak,
  CreateSessionBody,
  CompleteSessionBody,
} from '../types';

const MIN_WORDS_REQUIRED = 4;
const SESSION_SIZE = 10;

function getTodayString(timezone?: string): string {
  try {
    if (timezone) {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    }
  } catch {
    // fallback
  }
  return new Date().toISOString().split('T')[0];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sampleWords(words: WordCard[], count: number): WordCard[] {
  if (words.length <= count) return shuffleArray(words);
  return shuffleArray(words).slice(0, count);
}

function buildImageMatchExercise(
  card: WordCard,
  allCards: WordCard[],
  index: number
): Exercise {
  const distractors = allCards
    .filter((c) => c.id !== card.id)
    .map((c) => c.term);
  const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
  const options = shuffleArray([card.term, ...shuffledDistractors]);

  return {
    id: `ex_${index}`,
    wordCardId: card.id,
    type: 'image_match',
    question: null,
    imageUrl: card.imageUrl || null,
    options,
    correctAnswer: card.term,
    userAnswer: null,
    isCorrect: null,
    orderIndex: index,
  };
}

async function buildMCQExercise(
  card: WordCard,
  allCards: WordCard[],
  index: number
): Promise<Exercise> {
  const distractors = allCards
    .filter((c) => c.id !== card.id)
    .map((c) => c.term)
    .slice(0, 5);

  const mcq = await generateMCQ(card.term, card.definition, distractors);

  return {
    id: `ex_${index}`,
    wordCardId: card.id,
    type: 'mcq',
    question: mcq.question,
    imageUrl: null,
    options: mcq.options,
    correctAnswer: mcq.correctAnswer,
    userAnswer: null,
    isCorrect: null,
    orderIndex: index,
  };
}

export const SessionService = {
  async createDailySession(
    userId: string,
    body: CreateSessionBody
  ): Promise<DailySession> {
    const today = getTodayString(body.timezone);

    const wordCount = await WordRepository.countByUser(userId);
    if (wordCount < MIN_WORDS_REQUIRED) {
      throw new ForbiddenError(
        'INSUFFICIENT_VOCABULARY',
        `You need at least ${MIN_WORDS_REQUIRED} words to practice. You have ${wordCount}.`
      );
    }

    const existing = await SessionRepository.findByDate(userId, today);
    if (existing) {
      if (existing.completed) {
        throw new ConflictError(
          'SESSION_ALREADY_COMPLETED',
          "You've already completed today's practice. Come back tomorrow!"
        );
      }
      return existing;
    }

    const allWords = await WordRepository.findAllByUser(userId);
    const selectedWords = sampleWords(allWords, SESSION_SIZE);

    const half = Math.ceil(SESSION_SIZE / 2);
    const imageMatchWords = selectedWords.slice(0, half);
    const mcqWords = selectedWords.slice(half);

    const imageExercises = imageMatchWords.map((card, i) =>
      buildImageMatchExercise(card, allWords, i)
    );

    const mcqExercises = await Promise.all(
      mcqWords.map((card, i) => buildMCQExercise(card, allWords, half + i))
    );

    const exercises = shuffleArray([...imageExercises, ...mcqExercises]).map(
      (ex, i) => ({ ...ex, orderIndex: i })
    );

    return SessionRepository.create({ userId, sessionDate: today, exercises });
  },

  async completeSession(
    userId: string,
    sessionId: string,
    body: CompleteSessionBody
  ): Promise<{ session: DailySession; streak: Streak }> {
    const session = await SessionRepository.findById(sessionId, userId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }
    if (session.completed) {
      throw new ConflictError('SESSION_ALREADY_COMPLETED', 'This session is already completed');
    }
    if (body.answers.length !== SESSION_SIZE) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `Expected ${SESSION_SIZE} answers, got ${body.answers.length}`
      );
    }

    const completedSession = await SessionRepository.complete(
      sessionId,
      userId,
      body.answers
    );
    if (!completedSession) {
      throw new NotFoundError('Session not found');
    }

    const streak = await StreakService.updateAfterSession(userId);

    return { session: completedSession, streak };
  },
};
