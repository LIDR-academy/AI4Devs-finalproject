import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import { firebaseAuth } from './firebase';
import { API_URL } from '../constants/config';
import type {
  WordCard,
  UnsplashImage,
  DailySession,
  Streak,
  DefinitionLanguage,
  WordCardStatus,
  ExerciseAnswer,
} from '../types';

const http = axios.create({ baseURL: API_URL });

http.interceptors.request.use(async (config) => {
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await getIdToken(user);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Words
export const wordsApi = {
  create: (term: string, definitionLanguage: DefinitionLanguage) =>
    http
      .post<{ wordCard: WordCard; suggestedImages: UnsplashImage[] }>('/words', {
        term,
        definitionLanguage,
      })
      .then((r) => r.data),

  update: (
    id: string,
    payload: {
      definition?: string;
      imageUrl?: string;
      unsplashPhotoId?: string;
      status?: WordCardStatus;
    }
  ) =>
    http
      .put<{ wordCard: WordCard }>(`/words/${id}`, payload)
      .then((r) => r.data.wordCard),

  list: () => http.get<{ words: WordCard[] }>('/words').then((r) => r.data.words),

  delete: (id: string) => http.delete(`/words/${id}`),
};

// Sessions
export const sessionsApi = {
  createDaily: (timezone?: string) =>
    http
      .post<{ session: DailySession }>('/sessions/daily', { timezone })
      .then((r) => r.data.session),

  complete: (sessionId: string, answers: ExerciseAnswer[]) =>
    http
      .post<{ session: DailySession; streak: Streak }>(`/sessions/${sessionId}/complete`, {
        answers,
      })
      .then((r) => r.data),
};

// Streak
export const streakApi = {
  get: () => http.get<{ streak: Streak }>('/streak').then((r) => r.data.streak),
};
