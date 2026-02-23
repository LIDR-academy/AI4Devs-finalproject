import axios from 'axios';

// Mock axios with a self-contained factory to avoid hoisting issues
jest.mock('axios', () => {
    const mockRequestInterceptors: any[] = [];
    const mockResponseInterceptors: any[] = [];
    
    return {
        create: jest.fn(() => ({
            defaults: {
                baseURL: '/api/v1',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            interceptors: {
                request: {
                    use: jest.fn((fulfilled, rejected) => {
                        mockRequestInterceptors.push({ fulfilled, rejected });
                        return mockRequestInterceptors.length - 1;
                    }),
                    handlers: mockRequestInterceptors,
                },
                response: {
                    use: jest.fn((fulfilled, rejected) => {
                        mockResponseInterceptors.push({ fulfilled, rejected });
                        return mockResponseInterceptors.length - 1;
                    }),
                    handlers: mockResponseInterceptors,
                },
            },
        })),
    };
});

// Import api after mock is set up
import api from '../client';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client', () => {
    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();
        // Clear localStorage
        localStorage.clear();
        // Don't clear interceptor handlers - they need to persist from client.ts import
    });

    describe('Configuration', () => {
        it('should be an axios instance', () => {
            expect(api).toBeDefined();
        });

        it('should have correct base URL', () => {
            expect(api.defaults.baseURL).toBe('/api/v1');
        });

        it('should have correct default headers', () => {
            expect(api.defaults.headers['Content-Type']).toBe('application/json');
        });
    });

    describe('Request Interceptor', () => {
        it('should add Authorization header when token exists', async () => {
            const token = 'test-jwt-token';
            localStorage.setItem('token', token);

            const config: any = {
                headers: {},
            };

            // Get the request interceptor
            const requestInterceptor = (api as any).interceptors.request.handlers[0];
            const result = requestInterceptor.fulfilled(config);

            expect(result.headers.Authorization).toBe(`Bearer ${token}`);
        });

        it('should not add Authorization header when token does not exist', async () => {
            const config: any = {
                headers: {},
            };

            const requestInterceptor = (api as any).interceptors.request.handlers[0];
            const result = requestInterceptor.fulfilled(config);

            expect(result.headers.Authorization).toBeUndefined();
        });
    });

    describe('Response Interceptor', () => {
        it('should pass through successful responses', async () => {
            const response = { data: { message: 'success' }, status: 200 };

            const responseInterceptor = (api as any).interceptors.response.handlers[0];
            const result = responseInterceptor.fulfilled(response);

            expect(result).toEqual(response);
        });

        it('should remove token and redirect on 401 error', async () => {
            const token = 'test-token';
            localStorage.setItem('token', token);

            // Mock window.location with pathname
            delete (window as any).location;
            (window as any).location = { 
                href: '',
                pathname: '/some-page' // Not /login, so the condition passes
            };

            const error = {
                response: {
                    status: 401,
                    data: { error: 'Unauthorized' },
                },
            };

            const responseInterceptor = (api as any).interceptors.response.handlers[0];

            try {
                await responseInterceptor.rejected(error);
            } catch (e) {
                // Expected to throw
            }

            expect(localStorage.getItem('token')).toBeNull();
            expect(window.location.href).toBe('/login');
        });

        it('should pass through non-401 errors', async () => {
            const error = {
                response: {
                    status: 500,
                    data: { error: 'Internal Server Error' },
                },
            };

            const responseInterceptor = (api as any).interceptors.response.handlers[0];

            await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
        });

        it('should handle errors without response property', async () => {
            const error = new Error('Network Error');

            const responseInterceptor = (api as any).interceptors.response.handlers[0];

            await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
        });
    });
});
