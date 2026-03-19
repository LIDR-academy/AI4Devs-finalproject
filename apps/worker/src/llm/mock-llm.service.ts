import type { ILLMService, GenerateMessageParams } from './llm.interface';
import type {
  ConversationMessage,
  ConversationPhase,
  ExtractedAddress,
  UserIntent,
} from '../services/address.service';

export class MockLLMService implements ILLMService {
  async generateMessage(_params: GenerateMessageParams): Promise<string> {
    return '[MOCK OpenAI] Hola! Hemos recibido tu pedido y necesitamos tu dirección de entrega para completar el envío. Por favor, indícanos tu calle y número, código postal y ciudad.';
  }

  async extractAddress(messages: ConversationMessage[], _language: string): Promise<ExtractedAddress> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const content = lastUser?.content ?? '';
    const hasPostal = /\b\d{5}\b/.test(content);
    const hasCity = content.length > 10;

    if (!hasPostal || !hasCity) {
      return {
        isComplete: false,
        missingFields: [
          ...(!hasPostal ? ['código postal'] : []),
          ...(!hasCity ? ['calle y número'] : []),
        ],
        couldBeBuilding: false,
        address: null,
      };
    }

    const postalMatch = content.match(/\b(\d{5})\b/);
    return {
      isComplete: true,
      missingFields: [],
      couldBeBuilding: false,
      address: {
        street: 'Calle Mock',
        number: '1',
        block: null,
        staircase: null,
        floor: null,
        door: null,
        additionalInfo: null,
        postalCode: postalMatch?.[1] ?? '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
        fullAddress: content,
      },
    };
  }

  async interpretIntent(phase: ConversationPhase, msg: string, _language: string): Promise<UserIntent> {
    const lower = msg.toLowerCase().trim();

    const confirmWords = ['sí', 'si', 'yes', 'ok', 'correcto', 'confirmo', 'perfecto', 'vale', 'de acuerdo'];
    if (confirmWords.some((w) => lower === w || lower.startsWith(w + ' ') || lower.endsWith(' ' + w))) {
      if (phase === 'WAITING_BUILDING_DETAILS') return { type: 'CONFIRM_NO_BUILDING_DETAILS' };
      return { type: 'CONFIRM' };
    }

    const noDetailsWords = ['no hace falta', 'no tiene', 'es una casa', 'es un local', 'unifamiliar', 'chalet'];
    if (noDetailsWords.some((w) => lower.includes(w))) {
      return { type: 'CONFIRM_NO_BUILDING_DETAILS' };
    }

    const choiceMap: Record<string, number> = { '1': 0, 'primera': 0, '2': 1, 'segunda': 1, '3': 2, 'tercera': 2 };
    for (const [k, v] of Object.entries(choiceMap)) {
      if (lower === k || lower.startsWith(k + ' ') || lower.startsWith('opción ' + (v + 1))) {
        return { type: 'CHOOSE_OPTION', choiceIndex: v };
      }
    }

    const buildingKeywords = ['piso', 'puerta', 'bloque', 'escalera', 'planta', 'ático', 'bajo'];
    if (buildingKeywords.some((w) => lower.includes(w))) {
      const floorMatch = lower.match(/(?:piso|planta|ático)\s*([0-9]+[ºª]?|bajo|ático)/i);
      const doorMatch = lower.match(/(?:puerta|letra)\s*([a-z0-9]+)/i);
      const blockMatch = lower.match(/(?:bloque|bl\.?)\s*([a-z0-9]+)/i);
      const stairMatch = lower.match(/(?:escalera|esc\.?)\s*([a-z0-9]+)/i);
      return {
        type: 'PROVIDE_BUILDING_DETAILS',
        buildingDetails: {
          floor: floorMatch?.[1] ?? undefined,
          door: doorMatch?.[1] ?? undefined,
          block: blockMatch?.[1] ?? undefined,
          staircase: stairMatch?.[1] ?? undefined,
          additionalInfo: undefined,
        },
      };
    }

    if (lower.startsWith('no ') || lower === 'no') {
      if (phase === 'WAITING_BUILDING_DETAILS') return { type: 'CONFIRM_NO_BUILDING_DETAILS' };
      return { type: 'REJECT_AND_CORRECT', correction: msg };
    }

    if (lower.includes('calle') || lower.includes('avenida') || lower.includes('plaza') || /\d{5}/.test(lower)) {
      return { type: 'REJECT_AND_CORRECT', correction: msg };
    }

    return { type: 'UNKNOWN' };
  }
}
