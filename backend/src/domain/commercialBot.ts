export type CommercialIntent =
  | { type: 'catalog' }
  | { type: 'inventory' }
  | { type: 'purchase'; quantity: number; requestedDiscountPercent?: number }
  | { type: 'accept'; quantity: number }
  | { type: 'payment_confirmed' }
  | { type: 'delivery'; addressText?: string }
  | { type: 'close' }
  | { type: 'help' }
  | { type: 'handoff' }
  | { type: 'unknown' };

const catalogWords = ['catalogo', 'productos', 'opciones', 'referencias', 'inventario completo'];
const inventoryWords = ['inventario', 'stock', 'disponible', 'disponibilidad', 'hay', 'precio', 'valor', 'cuanto vale', 'cuanto cuesta'];
const purchaseWords = ['comprar', 'compro', 'quiero', 'me interesa', 'separo', 'llevo', 'pedido'];
const acceptWords = [
  'acepto',
  'aceptar',
  'aceptar oferta',
  'aceptar la oferta',
  'confirmo',
  'confirmar',
  'crear orden',
  'crear la orden',
  'dale',
  'listo',
  'de una',
  'si quiero'
];
const closeWords = ['no gracias', 'nada mas', 'eso es todo', 'por ahora no', 'finalizar', 'cerrar chat', 'terminar'];
const handoffWords = ['humano', 'asesor', 'agente', 'persona'];
const paymentWords = ['pague', 'pagué', 'pagado', 'pago realizado', 'ya pague', 'ya pagué'];
const deliveryWords = ['entrega', 'envio', 'envío', 'direccion', 'dirección', 'ubicacion', 'ubicación', 'donde recojo'];
const helpWords = ['ayuda', 'menu', 'menú', 'hola', 'buenas'];

export function parseCommercialIntent(message: string): CommercialIntent {
  const text = normalizeText(message);
  const quantity = extractQuantity(text);
  const requestedDiscountPercent = extractDiscountPercent(text);

  if (containsAny(text, catalogWords)) return { type: 'catalog' };
  if (containsAny(text, closeWords)) return { type: 'close' };
  if (containsAny(text, paymentWords)) return { type: 'payment_confirmed' };

  if (containsAny(text, deliveryWords)) {
    return {
      type: 'delivery',
      addressText: extractAddress(message)
    };
  }

  if (containsAny(text, acceptWords)) return { type: 'accept', quantity };

  if (containsAny(text, inventoryWords)) return { type: 'inventory' };

  if (containsAny(text, handoffWords)) return { type: 'handoff' };

  if (containsAny(text, purchaseWords) || requestedDiscountPercent !== undefined) {
    return { type: 'purchase', quantity, requestedDiscountPercent };
  }

  if (containsSku(message)) return { type: 'inventory' };

  if (containsAny(text, helpWords)) return { type: 'help' };

  return { type: 'unknown' };
}

export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.includes(normalizeText(word)));
}

function extractQuantity(text: string) {
  const explicit = text.match(/\b(\d{1,2})\s*(unidad|unidades|unds?|productos?|audifonos?|camaras?|morrales?|kits?|termos?)\b/);
  if (explicit) return Number(explicit[1]);

  if (/\bdos\b/.test(text)) return 2;
  if (/\btres\b/.test(text)) return 3;
  if (/\bcuatro\b/.test(text)) return 4;

  return 1;
}

function extractDiscountPercent(text: string) {
  const match = text.match(/\b(\d{1,2})\s*%/);
  if (!match) return undefined;

  const value = Number(match[1]);
  if (Number.isNaN(value) || value < 0 || value > 80) return undefined;
  return value;
}

function containsSku(message: string) {
  return /\b[A-Z]{2,}[A-Z0-9]*-[A-Z0-9-]{2,}\b/i.test(message);
}

function extractAddress(message: string) {
  const cleaned = message.trim();
  const direct = cleaned.match(/(?:direccion|dirección|entrega|envio|envío|ubicacion|ubicación)\s*(?:es|en|a|:|-)?\s*(.+)$/i);
  const address = direct?.[1]?.trim();

  if (address && address.length >= 8) return address;
  if (cleaned.length >= 12 && /#|calle|cra|carrera|avenida|centro|bogota|medellin|cali/i.test(cleaned)) return cleaned;

  return undefined;
}
