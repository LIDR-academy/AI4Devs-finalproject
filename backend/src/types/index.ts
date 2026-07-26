export type DefinitionLanguage = 'es' | 'en';
export type WordCardStatus = 'active' | 'learned';
export type ExerciseType = 'image_match' | 'mcq';
export type UiLanguage = 'es' | 'en';

export interface UnsplashImage {
  photoId: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
}

export interface WordCard {
  id: string;
  userId: string;
  term: string;
  normalizedTerm: string;
  definition: string;
  definitionLanguage: DefinitionLanguage;
  imageUrl: string;
  unsplashPhotoId: string | null;
  status: WordCardStatus;
  learnedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  wordCardId: string;
  type: ExerciseType;
  question: string | null;
  imageUrl: string | null;
  options: string[];
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  orderIndex: number;
}

export interface DailySession {
  id: string;
  userId: string;
  sessionDate: string;
  totalExercises: number;
  correctAnswers: number;
  completed: boolean;
  startedAt: Date;
  completedAt: Date | null;
  exercises: Exercise[];
}

export interface Streak {
  userId: string;
  currentStreak: number;
  lastCompletedDate: string | null;
  longestStreak: number;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  uiLanguage: UiLanguage;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseAnswer {
  exerciseId: string;
  userAnswer: string;
}

// Request body types
export interface CreateWordBody {
  term: string;
  definitionLanguage: DefinitionLanguage;
}

export interface UpdateWordBody {
  definition?: string;
  imageUrl?: string;
  unsplashPhotoId?: string;
  status?: WordCardStatus;
}

export interface CreateSessionBody {
  sessionDate?: string;
  timezone?: string;
}

export interface CompleteSessionBody {
  answers: ExerciseAnswer[];
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user: {
        uid: string;
        email?: string;
      };
    }
  }
}
