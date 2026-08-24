import React from 'react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onDigitPress: (digit: string) => void;
  onDeletePress: () => void;
  disabled?: boolean;
}

const DIGIT_BUTTON_STYLE: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '4px',
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  color: 'var(--text-primary)',
  fontSize: '1.4rem',
  fontWeight: 700,
};

interface PinDigitButtonProps {
  digit: string;
  disabled: boolean;
  onPress: (digit: string) => void;
}

const PinDigitButton: React.FC<PinDigitButtonProps> = ({ digit, disabled, onPress }) => (
  <button type="button" disabled={disabled} onClick={() => onPress(digit)} className="btn-touch" style={DIGIT_BUTTON_STYLE}>
    {digit}
  </button>
);

export const PinPad: React.FC<PinPadProps> = ({ onDigitPress, onDeletePress, disabled = false }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 64px)',
        gap: '12px',
        justifyContent: 'center',
        margin: '20px auto',
      }}
    >
      {digits.map((digit) => (
        <PinDigitButton key={digit} digit={digit} disabled={disabled} onPress={onDigitPress} />
      ))}

      {/* Fila inferior: espacio vacio, 0, y borrar */}
      <div style={{ width: '64px', height: '64px' }} />

      <PinDigitButton digit="0" disabled={disabled} onPress={onDigitPress} />

      <button
        type="button"
        disabled={disabled}
        aria-label="Borrar digito"
        onClick={onDeletePress}
        className="btn-touch"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '4px',
          backgroundColor: 'rgba(225, 6, 0, 0.15)',
          border: '1px solid var(--color-danger)',
          color: 'var(--color-danger-text)',
        }}
      >
        <Delete size={24} />
      </button>
    </div>
  );
};
