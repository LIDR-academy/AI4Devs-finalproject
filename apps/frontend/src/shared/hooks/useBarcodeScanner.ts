import { useEffect, useRef, useState, RefObject } from 'react';

interface BarcodeScannerControls {
  stop: () => void;
}

export interface BarcodeReader {
  decodeFromVideoDevice(
    videoElement: HTMLVideoElement,
    onResult: (barcode: string) => void
  ): Promise<BarcodeScannerControls>;
}

/**
 * Adaptador real sobre @zxing/browser (US-032/TK-119-FE, librería aprobada por el
 * humano 2026-09-05, Guard 24). Import dinámico a propósito: @zxing/browser+library
 * añaden ~120KB gzip al bundle — code-splitting evita que TODO usuario los descargue
 * en el arranque de la app solo porque el módulo existe, cuando solo lo necesita
 * quien realmente abre el escáner (TK-119-FE, gate de presupuesto de bundle, SK-17
 * FASE 5.5). `deviceId: undefined` deja que la librería elija la cámara trasera
 * ("environment") del dispositivo cuando existe — sin hardware dedicado (Non-Goal #4
 * del PRD).
 */
async function createZxingBarcodeReader(): Promise<BarcodeReader> {
  const { BrowserMultiFormatReader } = await import('@zxing/browser');
  const reader = new BrowserMultiFormatReader();
  return {
    decodeFromVideoDevice: (videoElement, onResult) =>
      reader.decodeFromVideoDevice(undefined, videoElement, (result) => {
        if (result) onResult(result.getText());
      }),
  };
}

/**
 * Memoiza una fábrica async que solo debe ejecutarse una vez por vida de la app —
 * pero si esa única ejecución falla (ej. blip de red, chunk-hash desincronizado tras
 * un deploy), descarta la promesa rechazada del caché en vez de envenenarlo para
 * siempre: el próximo llamador vuelve a intentar en vez de fallar indefinidamente
 * hasta un refresh completo de página (revisión adversarial, 3ra ronda de TK-119-FE).
 */
export function memoizeRejectable<T>(factory: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;
  return () => {
    if (!cached) {
      cached = factory().catch((err) => {
        cached = undefined;
        throw err;
      });
    }
    return cached;
  };
}

const getDefaultBarcodeReader = memoizeRejectable(createZxingBarcodeReader);

export interface UseBarcodeScannerResult {
  videoRef: RefObject<HTMLVideoElement>;
  error: string | null;
}

const CAMERA_ERROR_MESSAGE = 'No se pudo acceder a la cámara. Verifica el permiso de cámara del navegador.';

/**
 * Arranca el escaneo continuo mientras `active` es true. `reader` es inyectable
 * (por defecto el adaptador real de zxing, cargado bajo demanda) para poder probar
 * el ciclo de vida del hook (arranque/detención/permiso denegado) sin depender de
 * una cámara real ni de los eventos de reproducción de <video> de jsdom.
 *
 * SIEMPRE detiene el stream (`controls.stop()`, libera todos los tracks) al
 * desactivarse o desmontar — un stream de cámara sin liberar es una fuga de
 * recursos real en un dispositivo táctil de uso continuo por turnos de 8h
 * (TK-119-FE, Mitigación de Riesgos #2). Si el cierre ocurre antes de que la cámara
 * llegue a abrirse, simplemente nunca se solicita el stream — nada que liberar.
 */
export function useBarcodeScanner(
  active: boolean,
  onScan: (barcode: string) => void,
  reader?: BarcodeReader
): UseBarcodeScannerResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    if (!active || !videoRef.current) return;

    let cancelled = false;
    let controls: BarcodeScannerControls | undefined;
    setError(null);

    Promise.resolve(reader ?? getDefaultBarcodeReader())
      .then((r) => {
        if (cancelled || !videoRef.current) return undefined;
        return r.decodeFromVideoDevice(videoRef.current, (barcode) => {
          if (!cancelled) onScanRef.current(barcode);
        });
      })
      .then((c) => {
        if (!c) return;
        if (cancelled) c.stop();
        else controls = c;
      })
      .catch(() => {
        if (!cancelled) setError(CAMERA_ERROR_MESSAGE);
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [active, reader]);

  return { videoRef, error };
}
