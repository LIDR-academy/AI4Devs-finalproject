import axios from 'axios';

jest.mock('../auth/keycloak', () => ({
  getKeycloak: () => ({
    updateToken: jest.fn().mockResolvedValue(true),
    token: 'abc',
  }),
}));

describe('api client interceptor', () => {
  it('injects Authorization header with refreshed token', async () => {
    const { api } = await import('./client');
    // Mock adapter to avoid network and capture config
    let capturedConfig: any;
    (api.defaults as any).adapter = jest.fn(async (config: any) => {
      capturedConfig = config;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config } as any;
    });

    await api.get('/test');

    expect(capturedConfig.headers && (capturedConfig.headers as any).Authorization).toBe('Bearer abc');
  });
});


