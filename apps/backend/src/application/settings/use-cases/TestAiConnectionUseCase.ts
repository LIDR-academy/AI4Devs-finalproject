import { IAiConfigurationRepository } from '../../../domain/settings/repositories/IAiConfigurationRepository.js';
import { AiConfiguration } from '../../../domain/settings/entities/AiConfiguration.js';
import { ICredentialCipher } from '../../../domain/settings/gateways/ICredentialCipher.js';
import { resolveProviderApiKey } from '../resolveProviderApiKey.js';

export interface TestAiConnectionResult {
  success: boolean;
  message: string;
  latencyMs: number;
}

export class TestAiConnectionUseCase {
  constructor(
    private readonly repository: IAiConfigurationRepository,
    private readonly cipher: ICredentialCipher
  ) {}

  async execute(): Promise<TestAiConnectionResult> {
    const config = await this.repository.getConfig();
    const startTime = Date.now();

    if (config.provider === 'HEURISTIC') {
      return {
        success: true,
        message: 'Motor Heurístico Local operativo (100% disponible sin conexión externa).',
        latencyMs: Math.max(1, Date.now() - startTime),
      };
    }

    const apiKey = this.resolveApiKey(config);
    if (!apiKey && config.provider === 'GEMINI') {
      return {
        success: false,
        message: 'No hay ninguna API Key configurada para Google Gemini.',
        latencyMs: 0,
      };
    }

    return this.probeEndpoint(config, apiKey, startTime);
  }

  private resolveApiKey(config: AiConfiguration): string {
    if (!config.encryptedApiKey) {
      return resolveProviderApiKey(config.provider) ?? '';
    }
    try {
      return this.cipher.decrypt(config.encryptedApiKey);
    } catch {
      return '';
    }
  }

  private buildProbeRequest(config: AiConfiguration, apiKey: string): { url: string; headers: Record<string, string> } {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.provider === 'GEMINI') {
      // AUDIT-DEV-012 L-5: la API key va en el header, nunca en la query string.
      const baseUrl = config.endpointUrl?.trim() || 'https://generativelanguage.googleapis.com';
      if (apiKey) {
        headers['x-goog-api-key'] = apiKey;
      }
      return { url: `${baseUrl.replace(/\/$/, '')}/v1beta/models`, headers };
    }
    const baseUrl = config.endpointUrl?.trim() || 'http://localhost:11434/v1';
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return { url: `${baseUrl.replace(/\/$/, '')}/models`, headers };
  }

  private async probeEndpoint(config: AiConfiguration, apiKey: string, startTime: number): Promise<TestAiConnectionResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const { url, headers } = this.buildProbeRequest(config, apiKey);

      const response = await fetch(url, { method: 'GET', headers, signal: controller.signal });
      clearTimeout(timeout);

      const latencyMs = Date.now() - startTime;
      if (response.ok) {
        return { success: true, message: `Conexión exitosa con el proveedor ${config.provider}.`, latencyMs };
      }
      return {
        success: false,
        message: `El proveedor respondió con código HTTP ${response.status} (${response.statusText}).`,
        latencyMs,
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      const msg = err instanceof Error ? err.message : 'Servicio no disponible';
      return {
        success: false,
        message: isTimeout ? 'Tiempo de espera agotado (>5000ms) al conectar con el proveedor.' : `Error de red al conectar: ${msg}`,
        latencyMs,
      };
    }
  }
}
