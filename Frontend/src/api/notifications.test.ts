import { subscribePush, unsubscribePush, listSubscriptions } from './notifications';

describe('notifications api', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) } as any);
    (global as any).atob = (b64: string) => Buffer.from(b64, 'base64').toString('binary');
    (global as any).btoa = (bin: string) => Buffer.from(bin, 'binary').toString('base64');
    (global as any).import = undefined;
    (global as any).window = {} as any;
    (global as any).navigator = {} as any;
    process.env.VITE_VAPID_PUBLIC_KEY = 'BHVapidKeyFake_______';
  });

  it('posts subscription payload directly', async () => {
    const payload = { endpoint: 'https://push.example/sub', p256dhKey: 'p', authKey: 'a' };
    await subscribePush(payload);
    expect((global as any).fetch).toHaveBeenCalled();
    const [url, init] = ((global as any).fetch as jest.Mock).mock.calls[0];
    expect(String(url)).toContain('/notifications/subscribe');
    expect((init as any).method).toBe('POST');
  });

  it('deletes subscription by endpoint', async () => {
    await unsubscribePush('https://push.example/sub');
    expect((global as any).fetch).toHaveBeenCalled();
    const [url, init] = ((global as any).fetch as jest.Mock).mock.calls[0];
    expect(String(url)).toContain('/notifications/unsubscribe?endpoint=');
    expect((init as any).method).toBe('DELETE');
  });

  it('lists subscriptions', async () => {
    await listSubscriptions();
    expect((global as any).fetch).toHaveBeenCalled();
    const [url, init] = ((global as any).fetch as jest.Mock).mock.calls[0];
    expect(String(url)).toContain('/notifications/subscriptions');
    expect((init as any).method).toBe('GET');
  });
});


