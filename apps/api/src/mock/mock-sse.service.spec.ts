import { EventEmitter } from 'events';
import { firstValueFrom, take } from 'rxjs';

jest.mock('ioredis', () => {
  const { EventEmitter: EE } = require('events');
  class FakeRedis extends EE {
    psubscribe = jest.fn((_pattern: string, cb?: (err: Error | null) => void) => {
      if (cb) cb(null);
    });
    disconnect = jest.fn();
  }
  return { __esModule: true, default: jest.fn(() => new FakeRedis()) };
});

import { MockSseService } from './mock-sse.service';

function getLastRedisInstance(): EventEmitter & { psubscribe: jest.Mock; disconnect: jest.Mock } {
  const Redis = require('ioredis').default as jest.Mock;
  return Redis.mock.results[Redis.mock.results.length - 1].value;
}

describe('MockSseService', () => {
  let service: MockSseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MockSseService();
  });

  it('suscribe a Redis psubscribe en la inicialización', () => {
    const redis = getLastRedisInstance();
    expect(redis.psubscribe).toHaveBeenCalledWith('conversation:*:update', expect.any(Function));
  });

  it('subscribe() emite solo mensajes de la conversationId correcta', async () => {
    const targetId = 'conv-abc';
    const otherId = 'conv-xyz';
    const redis = getLastRedisInstance();

    const result$ = service.subscribe(targetId).pipe(take(1));
    const resultPromise = firstValueFrom(result$);

    redis.emit('pmessage', 'conversation:*:update', `conversation:${otherId}:update`, '{"role":"assistant","content":"other"}');
    redis.emit('pmessage', 'conversation:*:update', `conversation:${targetId}:update`, '{"role":"assistant","content":"hello"}');

    const result = await resultPromise;
    expect((result as MessageEvent).data).toBe('{"role":"assistant","content":"hello"}');
  });

  it('subscribe() no emite mensajes de otra conversationId', (done) => {
    const targetId = 'conv-target';
    const otherId = 'conv-other';
    const redis = getLastRedisInstance();
    let received = false;

    service.subscribe(targetId).pipe(take(1)).subscribe(() => {
      received = true;
    });

    redis.emit('pmessage', 'conversation:*:update', `conversation:${otherId}:update`, '{"role":"assistant","content":"wrong"}');

    setTimeout(() => {
      expect(received).toBe(false);
      done();
    }, 50);
  });

  it('onModuleDestroy() llama a subscriber.disconnect()', () => {
    const redis = getLastRedisInstance();
    service.onModuleDestroy();
    expect(redis.disconnect).toHaveBeenCalledTimes(1);
  });

  it('loguea un aviso cuando REDIS_URL no está definida', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const original = process.env.REDIS_URL;
    delete process.env.REDIS_URL;

    new MockSseService();

    expect(warnSpy).toHaveBeenCalledWith(
      '[SSE] REDIS_URL not set — using fallback redis://localhost:6379',
    );

    process.env.REDIS_URL = original;
    warnSpy.mockRestore();
  });

  it('no loguea aviso cuando REDIS_URL está definida', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.REDIS_URL = 'redis://custom:6380';

    new MockSseService();

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
