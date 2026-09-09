import { useCallback, useEffect, useState } from 'react';
import { AiConfigDto, AiProviderType, AiSettingsService } from '../services/aiSettings.service.js';

export interface TestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

const PROVIDER_DEFAULTS: Record<AiProviderType, { modelName: string; endpointUrl: string }> = {
  GEMINI: { modelName: 'gemini-2.5-flash', endpointUrl: '' },
  OPENAI_COMPATIBLE: { modelName: 'llama3:8b', endpointUrl: 'http://localhost:11434/v1' },
  HEURISTIC: { modelName: 'heuristic-rules-engine', endpointUrl: '' },
};

function useAiConfigForm() {
  const [provider, setProvider] = useState<AiProviderType>('GEMINI');
  const [modelName, setModelName] = useState(PROVIDER_DEFAULTS.GEMINI.modelName);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [temperature, setTemperature] = useState(0.1);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [apiKeyMasked, setApiKeyMasked] = useState<string | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [rescueRecipesOn, setRescueRecipesOn] = useState(true);

  const hydrate = useCallback((cfg: AiConfigDto) => {
    setProvider(cfg.provider);
    setModelName(cfg.modelName);
    setEndpointUrl(cfg.endpointUrl || '');
    setTemperature(cfg.temperature);
    setApiKeyConfigured(cfg.apiKeyConfigured);
    setApiKeyMasked(cfg.apiKeyMasked);
    setRescueRecipesOn(cfg.rescueRecipesOn);
    setShowKeyInput(!cfg.apiKeyConfigured);
  }, []);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as AiProviderType;
    setProvider(next);
    setModelName(PROVIDER_DEFAULTS[next].modelName);
    setEndpointUrl(PROVIDER_DEFAULTS[next].endpointUrl);
  };

  return {
    provider, modelName, setModelName, endpointUrl, setEndpointUrl, temperature, setTemperature,
    apiKey, setApiKey, apiKeyConfigured, apiKeyMasked, showKeyInput, setShowKeyInput,
    rescueRecipesOn, setRescueRecipesOn, hydrate, handleProviderChange,
  };
}

function useAiConnectionTest(params: { provider: AiProviderType; apiKey: string; endpointUrl: string; modelName: string }) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { provider, apiKey, endpointUrl, modelName } = params;

  const handleTestConnection = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await AiSettingsService.testConnection({
        provider,
        apiKey: apiKey || undefined,
        endpointUrl: endpointUrl || undefined,
        modelName: modelName || undefined,
      });
      setTestResult({ success: res.success, message: res.message, latencyMs: res.latencyMs });
    } catch (err: unknown) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'Error inesperado de conexión' });
    } finally {
      setIsTesting(false);
    }
  }, [provider, apiKey, endpointUrl, modelName]);

  return { isTesting, testResult, handleTestConnection };
}

export function useAiSettings() {
  const form = useAiConfigForm();
  const test = useAiConnectionTest(form);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { hydrate } = form;
  useEffect(() => {
    AiSettingsService.fetchConfig()
      .then(hydrate)
      .catch((err) => {
        console.error('[AiSettingsSection] Error al cargar configuración:', err);
        setErrorMessage('No se pudo cargar la configuración del agente IA');
      })
      .finally(() => setIsLoading(false));
  }, [hydrate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      setSaveMessage(null);
      setErrorMessage(null);
      try {
        const updated = await AiSettingsService.updateConfig({
          provider: form.provider,
          modelName: form.modelName,
          endpointUrl: form.endpointUrl.trim() ? form.endpointUrl.trim() : null,
          temperature: Number(form.temperature),
          apiKey: form.apiKey.trim() ? form.apiKey.trim() : undefined,
          rescueRecipesOn: form.rescueRecipesOn,
        });
        hydrate(updated);
        form.setApiKey('');
        setSaveMessage('Configuración de IA guardada exitosamente.');
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error al guardar la configuración');
      } finally {
        setIsSaving(false);
      }
    },
    [form, hydrate]
  );

  return { ...form, ...test, isLoading, isSaving, saveMessage, errorMessage, handleSubmit };
}
