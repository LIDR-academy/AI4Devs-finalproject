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
  learnedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  startedAt: string;
  completedAt: string | null;
  exercises: Exercise[];
}

export interface Streak {
  userId: string;
  currentStreak: number;
  lastCompletedDate: string | null;
  longestStreak: number;
  updatedAt: string;
}

export interface ExerciseAnswer {
  exerciseId: string;
  userAnswer: string;
}
