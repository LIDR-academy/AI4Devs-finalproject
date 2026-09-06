import { describe, it, expect } from 'vitest';
import { AiConfiguration } from './AiConfiguration.js';

describe('AiConfiguration Entity', () => {
  it('creates an AiConfiguration with default heuristic settings', () => {
    const config = AiConfiguration.createDefault();

    expect(config.id).toBe('default');
    expect(config.provider).toBe('HEURISTIC');
    expect(config.temperature).toBe(0.0);
    expect(config.replenishmentOn).toBe(true);
    expect(config.rescueRecipesOn).toBe(true);
    expect(config.anomalyAuditOn).toBe(false);
    expect(config.hasApiKey).toBe(false);
  });

  it('correctly detects configured encrypted API key', () => {
    const config = new AiConfiguration({
      id: 'default',
      provider: 'GEMINI',
      modelName: 'gemini-2.5-flash',
      encryptedApiKey: 'iv:tag:cipher',
      temperature: 0.1,
      replenishmentOn: true,
      rescueRecipesOn: true,
      anomalyAuditOn: false,
    });

    expect(config.hasApiKey).toBe(true);
    expect(config.provider).toBe('GEMINI');
    expect(config.temperature).toBe(0.1);
  });

  it('enforces temperature limit <= 0.2 (Guard 9 determinism)', () => {
    expect(() => {
      new AiConfiguration({
        id: 'default',
        provider: 'GEMINI',
        modelName: 'gemini-2.5-flash',
        temperature: 0.5,
        replenishmentOn: true,
        rescueRecipesOn: true,
        anomalyAuditOn: false,
      });
    }).toThrow(/temperatura.*0\.2/i);
  });

  it('rejects invalid providers', () => {
    expect(() => {
      new AiConfiguration({
        id: 'default',
        provider: 'INVALID_PROVIDER' as unknown as import('../value-objects/AiProvider.js').AiProviderType,
        modelName: 'gemini-2.5-flash',
        temperature: 0.0,
        replenishmentOn: true,
        rescueRecipesOn: true,
        anomalyAuditOn: false,
      });
    }).toThrow(/proveedor/i);
  });
});
