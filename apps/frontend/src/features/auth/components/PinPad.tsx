import React from 'react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onDigitPress: (digit: string) => void;
  onDeletePress: () => void;
  disabled?: boolean;
}

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
        <button
          key={digit}
          type="button"
          disabled={disabled}
          onClick={() => onDigitPress(digit)}
          className="btn-touch"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-primary)',
            fontSize: '1.4rem',
            fontWeight: 700,
          }}
        >
          {digit}
        </button>
      ))}

      {/* Fila inferior: espacio vacio, 0, y borrar */}
      <div style={{ width: '64px', height: '64px' }} />

      <button
        type="button"
        disabled={disabled}
        onClick={() => onDigitPress('0')}
        className="btn-touch"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          color: 'var(--text-primary)',
          fontSize: '1.4rem',
          fontWeight: 700,
        }}
      >
        0
      </button>

      <button
        type="button"
        disabled={disabled}
        aria-label="Borrar digito"
        onClick={onDeletePress}
        className="btn-touch"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 42, 42, 0.15)',
          border: '1px solid var(--color-danger)',
          color: 'var(--color-danger)',
        }}
      >
        <Delete size={24} />
      </button>
    </div>
  );
};
