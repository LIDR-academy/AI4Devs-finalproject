import React from 'react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onDigitPress: (digit: string) => void;
  onDeletePress: () => void;
  disabled?: boolean;
}

interface PinDigitButtonProps {
  digit: string;
  disabled: boolean;
  onPress: (digit: string) => void;
}

const PinDigitButton: React.FC<PinDigitButtonProps> = ({ digit, disabled, onPress }) => (
  <button type="button" disabled={disabled} onClick={() => onPress(digit)} className="btn-touch pin-digit-btn">
    {digit}
  </button>
);

export const PinPad: React.FC<PinPadProps> = ({ onDigitPress, onDeletePress, disabled = false }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="pin-pad-grid">
      {digits.map((digit) => (
        <PinDigitButton key={digit} digit={digit} disabled={disabled} onPress={onDigitPress} />
      ))}

      {/* Fila inferior: espacio vacio, 0, y borrar */}
      <div className="pin-digit-spacer" />

      <PinDigitButton digit="0" disabled={disabled} onPress={onDigitPress} />

      <button
        type="button"
        disabled={disabled}
        aria-label="Borrar digito"
        onClick={onDeletePress}
        className="btn-touch pin-delete-btn"
      >
        <Delete size={24} />
      </button>
    </div>
  );
};
