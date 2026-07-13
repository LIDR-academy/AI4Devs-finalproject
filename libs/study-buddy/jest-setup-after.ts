// The components barrel transitively imports @helsoft/supabase-services, which pulls in the
// native AsyncStorage module. Replace it with an in-memory stub so component tests
// (which mock @helsoft/localization anyway) never touch native storage.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));
