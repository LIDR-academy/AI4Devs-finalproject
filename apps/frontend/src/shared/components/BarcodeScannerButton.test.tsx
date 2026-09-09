import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BarcodeScannerButton } from './BarcodeScannerButton.js';
import { BarcodeReader } from '../hooks/useBarcodeScanner.js';

function createFakeReader() {
  const stop = vi.fn();
  let capturedOnResult: ((barcode: string) => void) | undefined;
  let resolveReady: () => void;
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });
  const reader: BarcodeReader = {
    decodeFromVideoDevice: (_video, onResult) => {
      capturedOnResult = onResult;
      resolveReady();
      return Promise.resolve({ stop });
    },
  };
  return { reader, stop, ready, emitResult: (barcode: string) => capturedOnResult?.(barcode) };
}

describe('TK-119-FE: BarcodeScannerButton (US-032)', () => {
  it('es un botón táctil (.btn-touch), no abre la cámara hasta que se activa', () => {
    render(<BarcodeScannerButton onScan={() => {}} />);
    const btn = screen.getByRole('button', { name: /Escanear Código de Barras/i });
    expect(btn).toHaveClass('btn-touch');
  });

  it('escaneo exitoso invoca onScan con el código y lo anuncia vía aria-live="polite"', async () => {
    const { reader, ready, emitResult } = createFakeReader();
    const onScan = vi.fn();
    render(<BarcodeScannerButton onScan={onScan} reader={reader} />);

    fireEvent.click(screen.getByRole('button', { name: /Escanear Código de Barras/i }));
    await act(() => ready);

    act(() => emitResult('7791234567890'));

    expect(onScan).toHaveBeenCalledWith('7791234567890');
    const liveRegion = await screen.findByText(/Código detectado: 7791234567890/i);
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('al cerrar el modal se detiene el stream de la cámara (controls.stop())', async () => {
    const { reader, ready, stop } = createFakeReader();
    render(<BarcodeScannerButton onScan={() => {}} reader={reader} />);

    fireEvent.click(screen.getByRole('button', { name: /Escanear Código de Barras/i }));
    await act(() => ready);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]); // botón de cerrar del ModalHeader (icono sin texto)

    await waitFor(() => expect(stop).toHaveBeenCalledOnce());
  });

  it('desmontar mientras escanea también detiene el stream de la cámara', async () => {
    const { reader, ready, stop } = createFakeReader();
    const { unmount } = render(<BarcodeScannerButton onScan={() => {}} reader={reader} />);

    fireEvent.click(screen.getByRole('button', { name: /Escanear Código de Barras/i }));
    await act(() => ready);

    unmount();

    await waitFor(() => expect(stop).toHaveBeenCalledOnce());
  });

  it('permiso de cámara denegado muestra un mensaje inline, sin fallar en silencio ni bloquear el selector manual', async () => {
    const reader: BarcodeReader = {
      decodeFromVideoDevice: () => Promise.reject(new Error('Permission denied')),
    };
    render(<BarcodeScannerButton onScan={() => {}} reader={reader} />);

    fireEvent.click(screen.getByRole('button', { name: /Escanear Código de Barras/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo acceder a la cámara/i);
    // el botón de escaneo (y por extensión el selector manual del llamador) sigue disponible
    expect(screen.getByRole('button', { name: /Escanear Código de Barras/i })).toBeInTheDocument();
  });

  it('regresión: reabrir el escáner tras un permiso denegado limpia el error y reintenta (antes quedaba bloqueado para siempre)', async () => {
    let shouldFail = true;
    const { reader, stop } = createFakeReader();
    const flakyReader: BarcodeReader = {
      decodeFromVideoDevice: (video, onResult) => {
        if (shouldFail) return Promise.reject(new Error('Permission denied'));
        return reader.decodeFromVideoDevice(video, onResult);
      },
    };
    render(<BarcodeScannerButton onScan={() => {}} reader={flakyReader} />);

    fireEvent.click(screen.getByRole('button', { name: /Escanear Código de Barras/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo acceder a la cámara/i);

    // cierra (el <video> nunca desaparece de la vista de error, así que su ref sigue viva)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);

    shouldFail = false;
    fireEvent.click(screen.getByRole('button', { name: /Escanear Código de Barras/i }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(stop).not.toHaveBeenCalled(); // el segundo intento sigue en curso, aún no se cerró
  });

  it('regresión: onResult disparado más de una vez para el mismo código solo invoca onScan una vez', async () => {
    const { reader, ready, emitResult } = createFakeReader();
    const onScan = vi.fn();
    render(<BarcodeScannerButton onScan={onScan} reader={reader} />);

    fireEvent.click(screen.getByRole('button', { name: /Escanear Código de Barras/i }));
    await act(() => ready);

    act(() => {
      emitResult('7791234567890');
      emitResult('7791234567890');
    });

    expect(onScan).toHaveBeenCalledOnce();
  });
});
