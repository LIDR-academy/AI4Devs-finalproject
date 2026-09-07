import { describe, it, expect, afterEach, vi } from 'vitest';
import { resolveProviderApiKey } from './resolveProviderApiKey.js';

describe('TK-129: resolveProviderApiKey (L-4)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('GEMINI lee GEMINI_API_KEY', () => {
    vi.stubEnv('GEMINI_API_KEY', 'sk-gemini');
    vi.stubEnv('OPENAI_API_KEY', 'sk-openai');
    expect(resolveProviderApiKey('GEMINI')).toBe('sk-gemini');
  });

  it('OPENAI_COMPATIBLE lee OPENAI_API_KEY', () => {
    vi.stubEnv('GEMINI_API_KEY', 'sk-gemini');
    vi.stubEnv('OPENAI_API_KEY', 'sk-openai');
    expect(resolveProviderApiKey('OPENAI_COMPATIBLE')).toBe('sk-openai');
  });

  it('HEURISTIC cae a la rama OPENAI_API_KEY (no GEMINI)', () => {
    vi.stubEnv('GEMINI_API_KEY', 'sk-gemini');
    vi.stubEnv('OPENAI_API_KEY', 'sk-openai');
    expect(resolveProviderApiKey('HEURISTIC')).toBe('sk-openai');
  });

  it('devuelve null si la variable no está', () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(resolveProviderApiKey('GEMINI')).toBeNull();
  });

  it('devuelve null si la variable es solo espacios', () => {
    vi.stubEnv('GEMINI_API_KEY', '   ');
    expect(resolveProviderApiKey('GEMINI')).toBeNull();
  });

  it('recorta espacios alrededor del valor', () => {
    vi.stubEnv('OPENAI_API_KEY', '  sk-padded  ');
    expect(resolveProviderApiKey('OPENAI_COMPATIBLE')).toBe('sk-padded');
  });
});
