import { useState, useEffect, useRef, useCallback } from 'react';
import { MicrophoneIcon } from '@heroicons/react/24/outline';
import { MicrophoneIcon as MicrophoneSolidIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Mensajes claros para los códigos de error de la Web Speech API
function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'not-allowed': 'Permiso de micrófono denegado. Permite el acceso en la barra de direcciones o en ajustes del sitio.',
    'no-speech': 'No se detectó voz. Habla más cerca del micrófono e intenta de nuevo.',
    'audio-capture': 'No se pudo usar el micrófono. Comprueba que no esté en uso por otra pestaña o aplicación.',
    'network': 'Error de conexión. El reconocimiento de voz necesita internet; comprueba tu red.',
    'aborted': 'Dictado cancelado.',
    'language-not-supported': 'Idioma no soportado para reconocimiento.',
  };
  return messages[code] || `Error de reconocimiento (${code}). Prueba en Chrome con permiso de micrófono.`;
}

// Web Speech API types (no están en todos los entornos TypeScript)
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionClass = new () => SpeechRecognitionInstance;

export interface VoiceInputProps {
  /** Callback con el texto transcrito (segmentos finales) */
  onResult: (text: string) => void;
  /** Idioma del reconocimiento (default: es-ES) */
  lang?: string;
  /** Deshabilitar el botón */
  disabled?: boolean;
  /** Modo continuo (reiniciar al terminar). Default true */
  continuous?: boolean;
  /** Mostrar indicador "Grabando..." debajo del botón */
  showRecordingLabel?: boolean;
  /** Clases CSS para el botón */
  className?: string;
}

/**
 * Componente de dictado por voz usando Web Speech API.
 * Muestra un botón para iniciar/detener y opcionalmente un indicador de grabación.
 */
const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  lang = 'es-ES',
  disabled = false,
  continuous = true,
  showRecordingLabel = true,
  className = '',
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const SpeechRecognitionClassRef = useRef<SpeechRecognitionClass | null>(null);
  const onResultRef = useRef(onResult);
  const isRecordingRef = useRef(false);
  onResultRef.current = onResult;
  isRecordingRef.current = isRecording;

  // Solo detectar soporte y guardar el constructor; la instancia se crea en cada "Dictar"
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionClass; SpeechRecognition?: SpeechRecognitionClass })
        .webkitSpeechRecognition ||
      (window as unknown as { SpeechRecognition?: SpeechRecognitionClass }).SpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
    SpeechRecognitionClassRef.current = SpeechRecognition;
    return () => {
      SpeechRecognitionClassRef.current = null;
      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    const SpeechRecognitionClass = SpeechRecognitionClassRef.current;
    if (!SpeechRecognitionClass) return;

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('Permiso de micrófono denegado. Actívalo en la barra de direcciones o en ajustes del navegador.');
        return;
      }
      if (err?.name === 'NotFoundError') {
        setError('No se encontró ningún micrófono.');
        return;
      }
      setError('No se pudo acceder al micrófono. Comprueba que no esté en uso por otra pestaña o aplicación.');
      return;
    }

    // Nueva instancia en cada "Dictar": tras stop() no se puede start() de nuevo en la misma instancia
    const recognition = new SpeechRecognitionClass() as SpeechRecognitionInstance & {
      onresult: (event: { resultIndex: number; results: { isFinal: boolean; [0]: { transcript: string } }[] }) => void;
      onerror: (event: { error: string }) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    };

    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: { resultIndex: number; results: { isFinal: boolean; [0]: { transcript: string } }[] }) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      if (finalTranscript.trim()) {
        onResultRef.current(finalTranscript.trim() + ' ');
      }
    };

    recognition.onerror = (event: { error: string }) => {
      setError(getErrorMessage(event.error));
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      if (!isRecordingRef.current) {
        recognitionRef.current = null;
        return;
      }
      const Klass = SpeechRecognitionClassRef.current;
      if (Klass) {
        try {
          const next = new Klass() as typeof recognition;
          next.continuous = continuous;
          next.interimResults = true;
          next.lang = lang;
          next.onresult = recognition.onresult;
          next.onerror = recognition.onerror;
          next.onend = recognition.onend;
          recognitionRef.current = next as SpeechRecognitionInstance;
          next.start();
        } catch {
          setIsRecording(false);
          recognitionRef.current = null;
        }
      }
    };

    recognitionRef.current = recognition as SpeechRecognitionInstance;
    try {
      recognition.start();
      setIsRecording(true);
    } catch (e) {
      setError('No se pudo iniciar el reconocimiento de voz. Prueba recargando la página o usa Chrome.');
      recognitionRef.current = null;
    }
  }, [continuous, lang]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      try {
        (recognitionRef.current as { stop: () => void }).stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  if (!isSupported) {
    return (
      <span className="text-sm text-medical-gray-400" title="Tu navegador no soporta dictado por voz">
        Dictado no disponible
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`btn btn-sm flex items-center gap-2 ${
          isRecording ? 'btn-danger' : 'btn-secondary'
        } ${className}`}
        title={isRecording ? 'Detener dictado' : 'Iniciar dictado por voz'}
      >
        {isRecording ? (
          <>
            <MicrophoneSolidIcon className="w-4 h-4" />
            Detener
          </>
        ) : (
          <>
            <MicrophoneIcon className="w-4 h-4" />
            Dictar
          </>
        )}
      </button>
      {showRecordingLabel && isRecording && (
        <div className="flex items-center gap-2 text-medical-danger text-sm">
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
          <span>Grabando... Habla ahora</span>
        </div>
      )}
      {error && (
        <p className="text-sm text-medical-danger">{error}</p>
      )}
    </div>
  );
};

export default VoiceInput;
