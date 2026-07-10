/**
 * analyzeStream — wires the ProgressEmitter to the AnalyzeListingUseCase.
 * Used by the SSE branch of POST /api/listings/analyze?stream=true.
 */
import type { Request, Response } from 'express';
import { ProgressEmitter } from '../progressEmitter';
import type { AnalyzeListingUseCase } from '../../domain/services/AnalyzeListingUseCase';
import { DomainError } from '../../domain/errors/DomainError';

export async function analyzeStream(
  req: Request,
  res: Response,
  useCase: AnalyzeListingUseCase,
  args: { url: string; manualText?: string },
): Promise<void> {
  const emitter = new ProgressEmitter(res);

  try {
    const result = await useCase.execute({
      url: args.url,
      sessionId: req.sessionId!,
      userId: req.userId!,
      manualText: args.manualText,
      onProgress: (event, payload) => emitter.emit(event as never, payload),
    });
    emitter.emit('done', result);
  } catch (err) {
    if (err instanceof DomainError) {
      emitter.emit('done', { error: { code: err.code, message: err.message } });
    } else {
      const message = err instanceof Error ? err.message : 'UNKNOWN';
      emitter.emit('done', { error: { code: 'INTERNAL_ERROR', message } });
    }
  } finally {
    emitter.done();
  }
}
