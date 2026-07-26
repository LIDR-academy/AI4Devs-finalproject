import { SessionService } from '../services/SessionService';
import { SessionRepository } from '../repositories/SessionRepository';
import { WordRepository } from '../repositories/WordRepository';
import { StreakService } from '../services/StreakService';
import { generateMCQ } from '../integrations/claudeClient';
import { ForbiddenError, ConflictError, NotFoundError, AppError } from '../middleware/errorHandler';
import { WordCard, DailySession, Streak, Exercise } from '../types';

jest.mock('../repositories/SessionRepository');
jest.mock('../repositories/WordRepository');
jest.mock('../services/StreakService');
jest.mock('../integrations/claudeClient');

const mockSessionRepo = SessionRepository as jest.Mocked<typeof SessionRepository>;
const mockWordRepo = WordRepository as jest.Mocked<typeof WordRepository>;
const mockStreakService = StreakService as jest.Mocked<typeof StreakService>;
const mockGenerateMCQ = generateMCQ as jest.MockedFunction<typeof generateMCQ>;

function makeWord(id: string, term: string): WordCard {
  return {
    id,
    userId: 'user-test',
    term,
    normalizedTerm: term.toLowerCase(),
    definition: `Definition of ${term}`,
    definitionLanguage: 'es',
    imageUrl: `https://img.unsplash.com/${id}.jpg`,
    unsplashPhotoId: id,
    status: 'active',
    learnedAt: null,
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-01'),
  };
}

const TEN_WORDS = [
  'serendipity', 'ephemeral', 'eloquent', 'resilient', 'melancholy',
  'ubiquitous', 'tenacious', 'pragmatic', 'whimsical', 'pensive',
].map((term, i) => makeWord(`word-${i + 1}`, term));

const mockMCQ = {
  question: 'What does "serendipity" mean?',
  options: ['A lucky accident', 'Sadness', 'Strength', 'Wisdom'],
  correctAnswer: 'A lucky accident',
};

const mockStreak: Streak = {
  userId: 'user-test',
  currentStreak: 4,
  lastCompletedDate: '2026-06-14',
  longestStreak: 5,
  updatedAt: new Date(),
};

const mockSession: DailySession = {
  id: 'session-001',
  userId: 'user-test',
  sessionDate: '2026-06-14',
  totalExercises: 10,
  correctAnswers: 0,
  completed: false,
  startedAt: new Date(),
  completedAt: null,
  exercises: Array.from({ length: 10 }, (_, i) => ({
    id: `ex_${i}`,
    wordCardId: TEN_WORDS[i % TEN_WORDS.length].id,
    type: i < 5 ? 'image_match' : 'mcq',
    question: i < 5 ? null : mockMCQ.question,
    imageUrl: i < 5 ? TEN_WORDS[i].imageUrl : null,
    options: mockMCQ.options,
    correctAnswer: TEN_WORDS[i % TEN_WORDS.length].term,
    userAnswer: null,
    isCorrect: null,
    orderIndex: i,
  } as Exercise)),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateMCQ.mockResolvedValue(mockMCQ);
});

describe('SessionService.createDailySession', () => {
  it('lanza ForbiddenError si el usuario tiene menos de 4 palabras', async () => {
    mockWordRepo.countByUser.mockResolvedValue(3);

    await expect(
      SessionService.createDailySession('user-test', {})
    ).rejects.toThrow(ForbiddenError);

    await expect(
      SessionService.createDailySession('user-test', {})
    ).rejects.toMatchObject({ statusCode: 403, errorCode: 'INSUFFICIENT_VOCABULARY' });
  });

  it('crea una nueva sesión si la sesión de hoy ya fue completada', async () => {
    mockWordRepo.countByUser.mockResolvedValue(10);
    mockSessionRepo.findInProgressByDate.mockResolvedValue(null);
    mockWordRepo.findAllByUser.mockResolvedValue(TEN_WORDS);
    mockSessionRepo.create.mockResolvedValue({ ...mockSession, id: 'session-002' });

    const result = await SessionService.createDailySession('user-test', {});

    expect(result.id).toBe('session-002');
    expect(mockSessionRepo.create).toHaveBeenCalled();
  });

  it('devuelve la sesión existente si está en progreso (no completada)', async () => {
    mockWordRepo.countByUser.mockResolvedValue(10);
    mockSessionRepo.findInProgressByDate.mockResolvedValue({ ...mockSession, completed: false });

    const result = await SessionService.createDailySession('user-test', {});

    expect(result.id).toBe('session-001');
    expect(mockSessionRepo.create).not.toHaveBeenCalled();
  });

  it('crea una nueva sesión con exactamente 10 ejercicios', async () => {
    mockWordRepo.countByUser.mockResolvedValue(10);
    mockSessionRepo.findInProgressByDate.mockResolvedValue(null);
    mockWordRepo.findAllByUser.mockResolvedValue(TEN_WORDS);
    mockSessionRepo.create.mockResolvedValue(mockSession);

    const result = await SessionService.createDailySession('user-test', {});

    expect(result.totalExercises).toBe(10);
    expect(mockSessionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-test',
        exercises: expect.arrayContaining([
          expect.objectContaining({ type: expect.stringMatching(/^(image_match|mcq)$/) }),
        ]),
      })
    );
    const callArg = mockSessionRepo.create.mock.calls[0][0];
    expect(callArg.exercises).toHaveLength(10);
  });

  it('genera ejercicios de tipo image_match y mcq', async () => {
    mockWordRepo.countByUser.mockResolvedValue(10);
    mockSessionRepo.findInProgressByDate.mockResolvedValue(null);
    mockWordRepo.findAllByUser.mockResolvedValue(TEN_WORDS);
    mockSessionRepo.create.mockResolvedValue(mockSession);

    await SessionService.createDailySession('user-test', {});

    const exercises: Exercise[] = mockSessionRepo.create.mock.calls[0][0].exercises;
    const types = exercises.map((e) => e.type);
    expect(types).toContain('image_match');
    expect(types).toContain('mcq');
  });

  it('no crea la sesión si hay menos de 4 palabras (no llama a SessionRepository)', async () => {
    mockWordRepo.countByUser.mockResolvedValue(2);

    await expect(SessionService.createDailySession('user-test', {})).rejects.toThrow();

    expect(mockSessionRepo.create).not.toHaveBeenCalled();
  });
});

describe('SessionService.completeSession', () => {
  const tenAnswers = Array.from({ length: 10 }, (_, i) => ({
    exerciseId: `ex_${i}`,
    userAnswer: TEN_WORDS[i % TEN_WORDS.length].term,
  }));

  it('lanza NotFoundError si la sesión no existe', async () => {
    mockSessionRepo.findById.mockResolvedValue(null);

    await expect(
      SessionService.completeSession('user-test', 'session-no-existe', { answers: tenAnswers })
    ).rejects.toThrow(NotFoundError);
  });

  it('lanza ConflictError si la sesión ya fue completada', async () => {
    mockSessionRepo.findById.mockResolvedValue({ ...mockSession, completed: true });

    await expect(
      SessionService.completeSession('user-test', 'session-001', { answers: tenAnswers })
    ).rejects.toThrow(ConflictError);
  });

  it('lanza AppError 400 si no se envían exactamente 10 respuestas', async () => {
    mockSessionRepo.findById.mockResolvedValue(mockSession);

    const fewAnswers = tenAnswers.slice(0, 7);
    await expect(
      SessionService.completeSession('user-test', 'session-001', { answers: fewAnswers })
    ).rejects.toMatchObject({ statusCode: 400, errorCode: 'VALIDATION_ERROR' });
  });

  it('completa la sesión y actualiza la racha', async () => {
    mockSessionRepo.findById.mockResolvedValue(mockSession);
    const completedSession = { ...mockSession, completed: true, correctAnswers: 8 };
    mockSessionRepo.complete.mockResolvedValue(completedSession);
    mockStreakService.updateAfterSession.mockResolvedValue(mockStreak);

    const result = await SessionService.completeSession('user-test', 'session-001', {
      answers: tenAnswers,
    });

    expect(result.session.completed).toBe(true);
    expect(result.streak).toEqual(mockStreak);
    expect(mockStreakService.updateAfterSession).toHaveBeenCalledWith('user-test');
  });

  it('llama a SessionRepository.complete con las respuestas correctas', async () => {
    mockSessionRepo.findById.mockResolvedValue(mockSession);
    mockSessionRepo.complete.mockResolvedValue({ ...mockSession, completed: true, correctAnswers: 10 });
    mockStreakService.updateAfterSession.mockResolvedValue(mockStreak);

    await SessionService.completeSession('user-test', 'session-001', { answers: tenAnswers });

    expect(mockSessionRepo.complete).toHaveBeenCalledWith('session-001', 'user-test', tenAnswers);
  });
});
