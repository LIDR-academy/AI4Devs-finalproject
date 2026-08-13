import { Truck, RotateCcw, Shield } from 'lucide-react';

const SIGNALS = [
  { icon: Truck, text: 'Envío gratis en pedidos +50€' },
  { icon: RotateCcw, text: 'Devolución gratuita 30 días' },
  { icon: Shield, text: 'Garantía 2 años' },
] as const;

export function TrustSignals() {
  return (
    <ul className="flex flex-col gap-3 mt-2">
      {SIGNALS.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-2 text-sm text-gray-700">
          <Icon className="w-4 h-4 text-green-600 shrink-0" />
          {text}
        </li>
      ))}
    </ul>
  );
}
