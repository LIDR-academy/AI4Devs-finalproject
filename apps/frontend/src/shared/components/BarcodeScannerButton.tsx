import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Modal } from './Modal.js';
import { ModalHeader } from './ModalHeader.js';
import { useBarcodeScanner, BarcodeReader } from '../hooks/useBarcodeScanner.js';
import styles from './BarcodeScannerButton.module.css';

interface BarcodeScannerButtonProps {
  onScan: (barcode: string) => void;
  /** Inyectable solo para pruebas — en producción siempre usa el adaptador zxing real. */
  reader?: BarcodeReader;
}

interface ScannerModalProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  error: string | null;
  onClose: () => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ videoRef, error, onClose }) => (
  <Modal size="sm">
    <ModalHeader icon={<Camera size={20} className="text-primary-color" />} title="Escanear Código de Barras" onClose={onClose} />
    {/* El <video> SIEMPRE se renderiza (nunca se reemplaza por el mensaje de error): si
        dejara de existir mientras hay un error, su ref nunca volvería a adjuntarse y un
        reintento posterior (reabrir el escáner) quedaría bloqueado para siempre
        (revisión adversarial — deadlock real detectado). */}
    {error && (
      <p role="alert" className={styles['camera-error']}>
        {error}
      </p>
    )}
    <video ref={videoRef} className={styles['scanner-video']} autoPlay muted playsInline />
  </Modal>
);

/**
 * Botón reutilizable de escaneo por cámara (US-032/TK-119-FE) — vive en `shared/`
 * porque el mismo patrón sirve para cualquier futuro punto de escaneo, no solo
 * extracción de bodega. No sabe nada de insumos: solo decodifica un código y emite
 * el string vía `onScan`; el llamador decide qué hacer con el resultado (match,
 * sin match, error).
 */
export const BarcodeScannerButton: React.FC<BarcodeScannerButtonProps> = ({ onScan, reader }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  // El decoder de zxing puede invocar su callback más de una vez para el mismo código
  // (un frame por cada instante en que el código sigue en cuadro) antes de que el
  // cierre del stream (asíncrono, vía el cleanup del hook) llegue a surtir efecto —
  // sin esta guarda, un escaneo sostenido dispara onScan/setIsScanning repetidas veces
  // (revisión adversarial, corroborado por 2 ángulos independientes).
  const hasScannedRef = useRef(false);

  const openScanner = () => {
    hasScannedRef.current = false;
    setDetectedCode(null);
    setIsScanning(true);
  };

  const handleScan = (barcode: string) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;
    setDetectedCode(barcode);
    onScan(barcode);
    setIsScanning(false);
  };

  const { videoRef, error } = useBarcodeScanner(isScanning, handleScan, reader);

  return (
    <>
      <button type="button" className="btn-touch btn-secondary" onClick={openScanner} id="btn-open-barcode-scanner">
        <Camera size={20} className={styles['inline-icon-spacer']} aria-hidden="true" />
        Escanear Código de Barras
      </button>

      {/* Anuncio no visual para lectores de pantalla del resultado del escaneo — decoupled
          del ErrorBanner (role="alert", assertive) que muestra el llamador ante un 404,
          para no duplicar semántica de "alerta" sobre una simple confirmación de captura. */}
      <span aria-live="polite" className="visually-hidden">
        {detectedCode ? `Código detectado: ${detectedCode}` : ''}
      </span>

      {isScanning && <ScannerModal videoRef={videoRef} error={error} onClose={() => setIsScanning(false)} />}
    </>
  );
};
