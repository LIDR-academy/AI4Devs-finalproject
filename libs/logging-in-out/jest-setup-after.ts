// This lib's organisms call useLocalization; the @helsoft/localization barrel pulls in its
// LocalizationProvider, which imports @helsoft/services (locale-preference) -> the native
// AsyncStorage module. Replace it with an in-memory stub so component tests never touch
// native storage. Mirrors libs/components/jest-setup-after.ts (same root cause).
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));
