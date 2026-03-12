import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock i18n config
const mockI18n = {
  language: 'ca',
  changeLanguage: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  hasResourceBundle: jest.fn(),
  getResourceBundle: jest.fn(),
};

// Mock the i18n config module
jest.mock('../i18n/config', () => mockI18n);

// Import after mocking
import { setupAxiosInterceptors } from './axios';

describe('Axios Interceptors', () => {
  let mock: MockAdapter;
  let originalLanguage: string;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    originalLanguage = mockI18n.language;
  });

  afterEach(() => {
    mock.restore();
    mockI18n.language = originalLanguage;
  });

  test('sets up request interceptor to add Accept-Language header', () => {
    setupAxiosInterceptors();

    // Mock a request
    mock.onGet('/api/test').reply(200, { success: true });

    // Make a request
    return axios.get('/api/test').then((response) => {
      expect(response.config.headers['Accept-Language']).toBe('ca');
    });
  });

  test('updates Accept-Language header when language changes', () => {
    setupAxiosInterceptors();

    // Change language
    mockI18n.language = 'es';

    // Mock a request
    mock.onGet('/api/test').reply(200, { success: true });

    // Make a request
    return axios.get('/api/test').then((response) => {
      expect(response.config.headers['Accept-Language']).toBe('es');
    });
  });

  test('handles different languages correctly', async () => {
    setupAxiosInterceptors();

    const languages = ['ca', 'es', 'ro', 'uk', 'en', 'fr'];
    
    for (const lang of languages) {
      mockI18n.language = lang;
      mock.onGet(`/api/test-${lang}`).reply(200, { success: true });
      
      const response = await axios.get(`/api/test-${lang}`);
      expect(response.config.headers['Accept-Language']).toBe(lang);
    }
  });

  test('preserves existing headers when adding Accept-Language', () => {
    setupAxiosInterceptors();

    mock.onGet('/api/test').reply(200, { success: true });

    return axios.get('/api/test', {
      headers: {
        'Authorization': 'Bearer token123',
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.config.headers['Accept-Language']).toBe('ca');
      expect(response.config.headers['Authorization']).toBe('Bearer token123');
      expect(response.config.headers['Content-Type']).toBe('application/json');
    });
  });

  test('handles POST requests with Accept-Language header', () => {
    setupAxiosInterceptors();

    mockI18n.language = 'en';

    mock.onPost('/api/users').reply(200, { success: true });

    return axios.post('/api/users', { name: 'John' }).then((response) => {
      expect(response.config.headers['Accept-Language']).toBe('en');
    });
  });

  test('handles PUT requests with Accept-Language header', () => {
    setupAxiosInterceptors();

    mockI18n.language = 'fr';

    mock.onPut('/api/users/1').reply(200, { success: true });

    return axios.put('/api/users/1', { name: 'Jean' }).then((response) => {
      expect(response.config.headers['Accept-Language']).toBe('fr');
    });
  });

  test('handles DELETE requests with Accept-Language header', () => {
    setupAxiosInterceptors();

    mockI18n.language = 'ro';

    mock.onDelete('/api/users/1').reply(200, { success: true });

    return axios.delete('/api/users/1').then((response) => {
      expect(response.config.headers['Accept-Language']).toBe('ro');
    });
  });

  test('handles Ukrainian language correctly', () => {
    setupAxiosInterceptors();

    mockI18n.language = 'uk';

    mock.onGet('/api/test').reply(200, { success: true });

    return axios.get('/api/test').then((response) => {
      expect(response.config.headers['Accept-Language']).toBe('uk');
    });
  });

  test('handles Romanian language correctly', () => {
    setupAxiosInterceptors();

    mockI18n.language = 'ro';

    mock.onGet('/api/test').reply(200, { success: true });

    return axios.get('/api/test').then((response) => {
      expect(response.config.headers['Accept-Language']).toBe('ro');
    });
  });
});
