import React from 'react';
import { Bot, Save, Activity, CheckCircle2, AlertCircle, Sparkles, Key, EyeOff } from 'lucide-react';
import { PanelHeader } from '../../../shared/components/PanelHeader.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { AiProviderType } from '../services/aiSettings.service.js';
import { useAiSettings, TestResult } from '../hooks/useAiSettings.js';
import styles from './AiSettingsSection.module.css';

interface KeyFieldProps {
  apiKey: string;
  setApiKey: (k: string) => void;
  apiKeyConfigured: boolean;
  apiKeyMasked: string | null;
  showKeyInput: boolean;
  setShowKeyInput: (s: boolean) => void;
}

const ApiKeyControl: React.FC<KeyFieldProps> = ({
  apiKey,
  setApiKey,
  apiKeyConfigured,
  apiKeyMasked,
  showKeyInput,
  setShowKeyInput,
}) => (
  <div>
    <label htmlFor="ai-api-key" className="form-label">
      Clave API (Cifrada con AES-256-GCM en Base de Datos)
    </label>

    {apiKeyConfigured && !showKeyInput ? (
      <div className={styles['key-input-wrapper']}>
        <input
          id="ai-api-key"
          type="text"
          readOnly
          disabled
          value={apiKeyMasked || '••••••••••••••••'}
          className="input-touch w-full"
          aria-label="Clave API actualmente configurada (enmascarada)"
        />
        <button
          type="button"
          className={`btn-touch ${styles['key-toggle-btn']}`}
          onClick={() => setShowKeyInput(true)}
          id="btn-change-key"
          title="Rotar o cambiar clave API"
        >
          <Key size={18} />
          <span className="ml-1 fs-sm">Cambiar</span>
        </button>
      </div>
    ) : (
      <div className={styles['key-input-wrapper']}>
        <input
          id="ai-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="input-touch w-full"
          placeholder={apiKeyConfigured ? 'Ingresa la nueva API key para rotar' : 'Ingresa tu API key secreta'}
          autoComplete="new-password"
        />
        {apiKeyConfigured && (
          <button
            type="button"
            className={`btn-touch ${styles['key-toggle-btn']}`}
            onClick={() => {
              setShowKeyInput(false);
              setApiKey('');
            }}
            title="Cancelar cambio de clave"
          >
            <EyeOff size={18} />
          </button>
        )}
      </div>
    )}

    {apiKeyConfigured && (
      <div className={styles['key-status-badge']}>
        <CheckCircle2 size={14} />
        <span>Clave activa configurada en almacén de credenciales cifrado.</span>
      </div>
    )}
  </div>
);

interface ModuleTogglesProps {
  rescueRecipesOn: boolean;
  setRescueRecipesOn: (v: boolean) => void;
  replenishmentOn: boolean;
  setReplenishmentOn: (v: boolean) => void;
}

const CognitiveModulesControl: React.FC<ModuleTogglesProps> = ({
  rescueRecipesOn,
  setRescueRecipesOn,
  replenishmentOn,
  setReplenishmentOn,
}) => (
  <div className={styles['modules-section']}>
    <h2 className="fs-md fw-semibold m-0 text-primary">Módulos Cognitivos Habilitados</h2>

    <div className={styles['module-toggle-label']}>
      <input
        type="checkbox"
        checked={rescueRecipesOn}
        onChange={(e) => setRescueRecipesOn(e.target.checked)}
        className={styles['module-checkbox']}
        id="checkbox-rescue-recipes"
      />
      <label htmlFor="checkbox-rescue-recipes" className={styles['module-text-container']}>
        <span className={styles['module-title']}>Recetas de Aprovechamiento Inteligentes (Anti-Desperdicio)</span>
        <span className={styles['module-description']}>
          Sugiere recetas y preparaciones culinarias basadas en remanentes e insumos próximos a vencer (&lt;48h).
        </span>
      </label>
    </div>

    <div className={styles['module-toggle-label']}>
      <input
        type="checkbox"
        checked={replenishmentOn}
        onChange={(e) => setReplenishmentOn(e.target.checked)}
        className={styles['module-checkbox']}
        id="checkbox-replenishment"
      />
      <label htmlFor="checkbox-replenishment" className={styles['module-text-container']}>
        <span className={styles['module-title']}>Sugerencias de Reabastecimiento Predictivo</span>
        <span className={styles['module-description']}>
          Analiza velocidad de consumo y stock actual para sugerir compras antes del quiebre de stock.
        </span>
      </label>
    </div>
  </div>
);

interface LlmParamsProps {
  modelName: string;
  setModelName: (v: string) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  endpointUrl: string;
  setEndpointUrl: (v: string) => void;
  provider: AiProviderType;
}

const LlmParamsControl: React.FC<LlmParamsProps> = ({
  modelName,
  setModelName,
  temperature,
  setTemperature,
  endpointUrl,
  setEndpointUrl,
  provider,
}) => (
  <>
    <div className={styles['two-col-grid']}>
      <div>
        <label htmlFor="ai-model-name" className="form-label">
          Nombre del Modelo
        </label>
        <input
          id="ai-model-name"
          type="text"
          required
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="input-touch w-full"
          placeholder="ej. gemini-1.5-flash o llama3:8b"
        />
      </div>

      <div>
        <label htmlFor="ai-temperature" className="form-label">
          Temperatura de Inferencia
        </label>
        <input
          id="ai-temperature"
          type="number"
          required
          min={0.0}
          max={0.2}
          step={0.01}
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="input-touch w-full"
        />
        <div className={styles['temperature-helper']}>
          Máximo 0.20 para garantizar determinismo y reproducibilidad (Guard 9).
        </div>
      </div>
    </div>

    {provider === 'OPENAI_COMPATIBLE' && (
      <div>
        <label htmlFor="ai-endpoint-url" className="form-label">
          Endpoint URL Base
        </label>
        <input
          id="ai-endpoint-url"
          type="url"
          value={endpointUrl}
          onChange={(e) => setEndpointUrl(e.target.value)}
          className="input-touch w-full"
          placeholder="http://localhost:11434/v1"
        />
      </div>
    )}
  </>
);

interface TestConnectionBarProps {
  isTesting: boolean;
  onTest: () => void;
  testResult: TestResult | null;
}

const TestConnectionBar: React.FC<TestConnectionBarProps> = ({ isTesting, onTest, testResult }) => (
  <div className={styles['test-connection-bar']}>
    <button
      type="button"
      className={`btn-touch btn-secondary flex-center flex-gap-xs ${styles['ping-btn']}`}
      disabled={isTesting}
      onClick={onTest}
      id="btn-test-ai-connection"
    >
      <Activity size={18} />
      {isTesting ? 'Probando conexión...' : 'Probar Conexión (Ping)'}
    </button>

    {testResult && (
      <div
        className={`${styles['test-badge']} ${
          testResult.success ? styles['test-badge-success'] : styles['test-badge-error']
        }`}
        role="status"
      >
        {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        <span>
          {testResult.message}
          {testResult.latencyMs !== undefined && ` (${testResult.latencyMs} ms)`}
        </span>
      </div>
    )}
  </div>
);

export const AiSettingsSection: React.FC = () => {
  const s = useAiSettings();

  if (s.isLoading) {
    return (
      <div className="flex-center p-8">
        <span className="fs-md text-secondary-color">Cargando configuración del agente IA...</span>
      </div>
    );
  }

  return (
    <>
      <PanelHeader
        icon={<Bot className="text-primary-color" />}
        title="Configuración de Inteligencia Artificial"
        subtitle="Gestiona el proveedor de IA, credenciales cifradas y módulos cognitivos activos."
      />

      <form onSubmit={s.handleSubmit} className={`settings-form ${styles.container}`}>
        {s.saveMessage && <SuccessFeedbackBanner message={s.saveMessage} />}
        {s.errorMessage && <ErrorBanner message={s.errorMessage} />}

        <div>
          <label htmlFor="ai-provider-select" className="form-label">
            Proveedor de Inteligencia Artificial
          </label>
          <select
            id="ai-provider-select"
            value={s.provider}
            onChange={s.handleProviderChange}
            className="input-touch w-full"
            aria-label="Seleccionar proveedor de IA"
          >
            <option value="GEMINI">Google Gemini (Gemini 1.5 Flash / Pro)</option>
            <option value="OPENAI_COMPATIBLE">Compatible OpenAI / Servidor Local (Ollama, LM Studio)</option>
            <option value="HEURISTIC">Motor Heurístico Local (Sin LLM / Sin conexión externa)</option>
          </select>
        </div>

        {s.provider === 'HEURISTIC' ? (
          <div className={styles['info-card']}>
            <Sparkles size={20} className="text-primary-color shrink-0" />
            <p className={styles['info-card-text']}>
              El <strong>Motor Heurístico Local</strong> opera 100% desconectado mediante algoritmos deterministas basados en FEFO,
              categorías de insumos y rotación de cocina. No requiere API Keys ni consume tokens externos.
            </p>
          </div>
        ) : (
          <>
            <LlmParamsControl
              modelName={s.modelName}
              setModelName={s.setModelName}
              temperature={s.temperature}
              setTemperature={s.setTemperature}
              endpointUrl={s.endpointUrl}
              setEndpointUrl={s.setEndpointUrl}
              provider={s.provider}
            />

            <ApiKeyControl
              apiKey={s.apiKey}
              setApiKey={s.setApiKey}
              apiKeyConfigured={s.apiKeyConfigured}
              apiKeyMasked={s.apiKeyMasked}
              showKeyInput={s.showKeyInput}
              setShowKeyInput={s.setShowKeyInput}
            />

            <TestConnectionBar
              isTesting={s.isTesting}
              onTest={s.handleTestConnection}
              testResult={s.testResult}
            />
          </>
        )}

        <CognitiveModulesControl
          rescueRecipesOn={s.rescueRecipesOn}
          setRescueRecipesOn={s.setRescueRecipesOn}
          replenishmentOn={s.replenishmentOn}
          setReplenishmentOn={s.setReplenishmentOn}
        />

        <button
          type="submit"
          className="btn-touch btn-primary flex-center flex-gap-xs"
          disabled={s.isSaving}
          id="btn-save-ai-settings"
        >
          <Save size={20} />
          {s.isSaving ? 'Guardando...' : 'Guardar Configuración de IA'}
        </button>
      </form>
    </>
  );
};
