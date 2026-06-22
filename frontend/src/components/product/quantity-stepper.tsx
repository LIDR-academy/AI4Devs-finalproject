interface QuantityStepperProps {
  quantity: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantityStepper({ quantity, max, onIncrement, onDecrement }: QuantityStepperProps) {
  const atMin = quantity <= 1;
  const atMax = quantity >= max;

  return (
    <div className="flex items-center gap-3">
      <p className="text-sm font-medium text-gray-700">Cantidad</p>
      <div className="flex items-center border border-gray-300 rounded">
        <button
          type="button"
          aria-label="Reducir cantidad"
          disabled={atMin}
          onClick={onDecrement}
          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-medium select-none">{quantity}</span>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          disabled={atMax}
          onClick={onIncrement}
          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          +
        </button>
      </div>
    </div>
  );
}
