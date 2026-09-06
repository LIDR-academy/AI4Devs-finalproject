import { useCallback, useEffect, useState } from 'react';
import { AiProviderType, AiSettingsService } from '../services/aiSettings.service.js';

export interface TestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export function useAiSettings() {
  const [provider, setProvider] = useState<AiProviderType>('GEMINI');
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [temperature, setTemperature] = useState(0.1);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [apiKeyMasked, setApiKeyMasked] = useState<string | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [replenishmentOn, setReplenishmentOn] = useState(false);
  const [rescueRecipesOn, setRescueRecipesOn] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    AiSettingsService.fetchConfig()
      .then((cfg) => {
        setProvider(cfg.provider);
        setModelName(cfg.modelName);
        setEndpointUrl(cfg.endpointUrl || '');
        setTemperature(cfg.temperature);
        setApiKeyConfigured(cfg.apiKeyConfigured);
        setApiKeyMasked(cfg.apiKeyMasked);
        setReplenishmentOn(cfg.replenishmentOn);
        setRescueRecipesOn(cfg.rescueRecipesOn);
        setShowKeyInput(!cfg.apiKeyConfigured);
      })
      .catch((err) => {
        console.error('[AiSettingsSection] Error al cargar configuración:', err);
        setErrorMessage('No se pudo cargar la configuración del agente IA');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextProvider = e.target.value as AiProviderType;
    setProvider(nextProvider);
    if (nextProvider === 'GEMINI') {
      setModelName('gemini-1.5-flash');
      setEndpointUrl('');
    } else if (nextProvider === 'OPENAI_COMPATIBLE') {
      setModelName('llama3:8b');
      setEndpointUrl('http://localhost:11434/v1');
    } else {
      setModelName('heuristic-rules-engine');
      setEndpointUrl('');
    }
  };

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
      setTestResult({
        success: res.success,
        message: res.message,
        latencyMs: res.latencyMs,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado de conexión';
      setTestResult({ success: false, message: msg });
    } finally {
      setIsTesting(false);
    }
  }, [provider, apiKey, endpointUrl, modelName]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      setSaveMessage(null);
      setErrorMessage(null);

      try {
        const updated = await AiSettingsService.updateConfig({
          provider,
          modelName,
          endpointUrl: endpointUrl.trim() ? endpointUrl.trim() : null,
          temperature: Number(temperature),
          apiKey: apiKey.trim() ? apiKey.trim() : undefined,
          replenishmentOn,
          rescueRecipesOn,
        });

        setProvider(updated.provider);
        setModelName(updated.modelName);
        setEndpointUrl(updated.endpointUrl || '');
        setTemperature(updated.temperature);
        setApiKeyConfigured(updated.apiKeyConfigured);
        setApiKeyMasked(updated.apiKeyMasked);
        setReplenishmentOn(updated.replenishmentOn);
        setRescueRecipesOn(updated.rescueRecipesOn);
        setApiKey('');
        setShowKeyInput(false);
        setSaveMessage('Configuración de IA guardada exitosamente.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al guardar la configuración';
        setErrorMessage(msg);
      } finally {
        setIsSaving(false);
      }
    },
    [provider, modelName, endpointUrl, temperature, apiKey, replenishmentOn, rescueRecipesOn],
  );

  return {
    provider,
    modelName,
    setModelName,
    endpointUrl,
    setEndpointUrl,
    temperature,
    setTemperature,
    apiKey,
    setApiKey,
    apiKeyConfigured,
    apiKeyMasked,
    showKeyInput,
    setShowKeyInput,
    replenishmentOn,
    setReplenishmentOn,
    rescueRecipesOn,
    setRescueRecipesOn,
    isLoading,
    isSaving,
    isTesting,
    saveMessage,
    errorMessage,
    testResult,
    handleProviderChange,
    handleTestConnection,
    handleSubmit,
  };
}
