import type { Response } from 'express';
import { EventEmitter } from 'events';

/**
 * Per-request progress event emitter (T037e, FR-018).
 * Emits: fetching_html → resolving_location → analyzing → cross_referencing_cadastro
 */
export class ProgressEmitter extends EventEmitter {
  private static readonly EVENTS = [
    'fetching_html',
    'resolving_location',
    'analyzing',
    'cross_referencing_cadastro',
  ] as const;

  constructor(private readonly res: Response) {
    super();
    this.setupSse();
  }

  private setupSse(): void {
    this.res.setHeader('Content-Type', 'text/event-stream');
    this.res.setHeader('Cache-Control', 'no-cache');
    this.res.setHeader('Connection', 'keep-alive');
    this.res.flushHeaders();
  }

  emit(event: (typeof ProgressEmitter.EVENTS)[number], payload: unknown = {}): boolean {
    const data = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    this.res.write(`event: ${event}\ndata: ${data}\n\n`);
    return super.emit(event, payload);
  }

  done(): void {
    this.res.end();
  }
}
