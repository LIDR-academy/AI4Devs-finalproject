import { describe, it, expect, vi } from 'vitest';
import { memoizeRejectable } from './useBarcodeScanner.js';

describe('TK-119-FE: memoizeRejectable (regresión — 3ra ronda de revisión adversarial)', () => {
  it('llama a la fábrica una sola vez cuando resuelve', async () => {
    const factory = vi.fn(() => Promise.resolve('reader-instance'));
    const getCached = memoizeRejectable(factory);

    await expect(getCached()).resolves.toBe('reader-instance');
    await expect(getCached()).resolves.toBe('reader-instance');

    expect(factory).toHaveBeenCalledOnce();
  });

  it('no envenena el caché para siempre tras un rechazo: el próximo llamador reintenta', async () => {
    const factory = vi.fn(() => Promise.reject<string>(new Error('chunk load failed')));
    const getCached = memoizeRejectable(factory);

    await expect(getCached()).rejects.toThrow('chunk load failed');

    factory.mockImplementationOnce(() => Promise.resolve('reader-instance'));
    await expect(getCached()).resolves.toBe('reader-instance');

    expect(factory).toHaveBeenCalledTimes(2);
  });
});
