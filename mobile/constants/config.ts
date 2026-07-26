import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const API_URL = extra['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000';
export const FIREBASE_API_KEY = extra['EXPO_PUBLIC_FIREBASE_API_KEY'] ?? '';
export const FIREBASE_AUTH_DOMAIN = extra['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '';
export const FIREBASE_PROJECT_ID = extra['EXPO_PUBLIC_FIREBASE_PROJECT_ID'] ?? '';
export const FIREBASE_STORAGE_BUCKET = extra['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? '';
export const FIREBASE_MESSAGING_SENDER_ID = extra['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '';
export const FIREBASE_APP_ID = extra['EXPO_PUBLIC_FIREBASE_APP_ID'] ?? '';

export const MIN_WORDS_FOR_PRACTICE = 4;
export const SESSION_SIZE = 10;
