// Components transitively import @helsoft/hooks (e.g. Button -> useInteractionState,
// useAuth), which pulls in @helsoft/services (locale) or native modules -> AsyncStorage module. Replace it
// with an in-memory stub so component tests never touch native storage. Mirrors
// libs/study-buddy/jest-setup-after.ts (same root cause, one workspace layer up).
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));
