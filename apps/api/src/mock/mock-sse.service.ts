import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import Redis from 'ioredis';

interface SsePayload {
  conversationId: string;
  data: string;
}

@Injectable()
export class MockSseService implements OnModuleDestroy {
  private readonly subscriber: Redis;
  private readonly subject = new Subject<SsePayload>();

  constructor() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    if (!process.env.REDIS_URL) {
      console.warn('[SSE] REDIS_URL not set — using fallback redis://localhost:6379');
    }
    this.subscriber = new Redis(redisUrl);

    this.subscriber.on('error', (err) =>
      console.error('[SSE] Redis connection error:', err.message),
    );

    this.subscriber.psubscribe('conversation:*:update', (err) => {
      if (err) console.error('[SSE] Redis psubscribe error:', err);
    });

    this.subscriber.on('pmessage', (_pattern, channel, message) => {
      // Canal format: "conversation:<uuid>:update" — split(':')[1] is safe for UUIDs
      const conversationId = channel.split(':')[1];
      this.subject.next({ conversationId, data: message });
    });
  }

  subscribe(conversationId: string): Observable<MessageEvent> {
    return this.subject.pipe(
      filter((payload) => payload.conversationId === conversationId),
      map((payload) => ({ data: payload.data }) as MessageEvent),
    );
  }

  onModuleDestroy() {
    this.subscriber.disconnect();
  }
}
