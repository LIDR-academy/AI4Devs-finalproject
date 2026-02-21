import OpenAI from 'openai';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConversationPhase =
  | 'WAITING_ADDRESS'
  | 'WAITING_DISAMBIGUATION'
  | 'WAITING_BUILDING_DETAILS'
  | 'WAITING_CONFIRMATION';

export interface PendingAddress {
  gmapsFormatted: string;
  gmapsPlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  street: string;
  number: string | null;
  postalCode: string;
  city: string;
  province: string | null;
  country: string;
  block: string | null;
  staircase: string | null;
  floor: string | null;
  door: string | null;
  additionalInfo: string | null;
  couldBeBuilding: boolean;
  userConfirmedNoDetails: boolean;
}

export interface ConversationState {
  phase: ConversationPhase;
  pendingAddress?: PendingAddress;
  gmapsOptions?: GmapsResult[];
  failedAttempts?: number;
}

export interface GmapsResult {
  formattedAddress: string;
  placeId: string;
  latitude: number;
  longitude: number;
  street: string | null;
  streetNumber: string | null;
  postalCode: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
}

export interface ExtractedAddress {
  isComplete: boolean;
  missingFields: string[];
  couldBeBuilding: boolean;
  address: {
    street: string;
    number: string | null;
    block: string | null;
    staircase: string | null;
    floor: string | null;
    door: string | null;
    additionalInfo: string | null;
    postalCode: string;
    city: string;
    province: string | null;
    country: string;
    fullAddress: string;
  } | null;
}

export type UserIntentType =
  | 'CONFIRM'
  | 'REJECT_AND_CORRECT'
  | 'CHOOSE_OPTION'
  | 'PROVIDE_BUILDING_DETAILS'
  | 'CONFIRM_NO_BUILDING_DETAILS'
  | 'UNKNOWN';

export interface UserIntent {
  type: UserIntentType;
  choiceIndex?: number;
  correction?: string;
  buildingDetails?: {
    block?: string;
    staircase?: string;
    floor?: string;
    door?: string;
    additionalInfo?: string;
  };
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ─── OpenAI helpers ───────────────────────────────────────────────────────────

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

// ─── Address extraction ───────────────────────────────────────────────────────

const ADDRESS_EXTRACTION_SYSTEM = `You are an address extraction assistant.
Given a conversation, extract the delivery address provided by the user.
Respond ONLY with valid JSON (no markdown) matching:
{
  "isComplete": boolean,
  "missingFields": string[],
  "couldBeBuilding": boolean,
  "address": {
    "street": string, "number": string|null,
    "block": string|null, "staircase": string|null,
    "floor": string|null, "door": string|null,
    "additionalInfo": string|null,
    "postalCode": string, "city": string,
    "province": string|null, "country": string,
    "fullAddress": string
  } | null
}
Rules:
- isComplete=true requires street+number (if applicable), postalCode, city.
- couldBeBuilding=true if the address is likely an apartment building (urban, multi-floor).
- fullAddress: single-line normalized string.
- If nothing extractable, set isComplete=false and address=null.`;

export async function extractAddressFromConversation(
  messages: ConversationMessage[],
  language: string,
): Promise<ExtractedAddress> {
  const client = getOpenAIClient();

  if (!client) {
    return mockExtractAddress(messages);
  }

  const text = messages
    .filter((m) => m.role !== 'system')
    .map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
    .join('\n');

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: ADDRESS_EXTRACTION_SYSTEM },
      { role: 'user', content: `Language: ${language}\n\nConversation:\n${text}` },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 500,
    temperature: 0,
  });

  try {
    return JSON.parse(res.choices[0]?.message?.content ?? '{}') as ExtractedAddress;
  } catch {
    return { isComplete: false, missingFields: [], couldBeBuilding: false, address: null };
  }
}

function mockExtractAddress(messages: ConversationMessage[]): ExtractedAddress {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const content = lastUser?.content ?? '';
  const hasPostal = /\b\d{5}\b/.test(content);
  const hasCity = content.length > 10;

  if (!hasPostal || !hasCity) {
    return {
      isComplete: false,
      missingFields: [...(!hasPostal ? ['código postal'] : []), ...(!hasCity ? ['calle y número'] : [])],
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
      street: 'Calle Mock', number: '1', block: null, staircase: null,
      floor: null, door: null, additionalInfo: null,
      postalCode: postalMatch?.[1] ?? '28001', city: 'Madrid',
      province: 'Madrid', country: 'España', fullAddress: content,
    },
  };
}

// ─── Google Maps validation ───────────────────────────────────────────────────

type GmapsAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

function extractComponent(components: GmapsAddressComponent[], type: string): string | null {
  return components.find((c) => c.types.includes(type))?.long_name ?? null;
}

export async function validateWithGoogleMaps(
  fullAddress: string,
): Promise<GmapsResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('[AddressService] GOOGLE_MAPS_API_KEY not set — skipping GMaps validation');
    return [];
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: string;
      results: Array<{
        formatted_address: string;
        place_id: string;
        geometry: { location: { lat: number; lng: number } };
        address_components: GmapsAddressComponent[];
      }>;
    };

    if (data.status !== 'OK' || !data.results.length) {
      console.warn(`[AddressService] GMaps status: ${data.status} for "${fullAddress}"`);
      return [];
    }

    return data.results.slice(0, 3).map((r) => ({
      formattedAddress: r.formatted_address,
      placeId: r.place_id,
      latitude: r.geometry.location.lat,
      longitude: r.geometry.location.lng,
      street: extractComponent(r.address_components, 'route'),
      streetNumber: extractComponent(r.address_components, 'street_number'),
      postalCode: extractComponent(r.address_components, 'postal_code'),
      city:
        extractComponent(r.address_components, 'locality') ??
        extractComponent(r.address_components, 'administrative_area_level_2'),
      province: extractComponent(r.address_components, 'administrative_area_level_2'),
      country: extractComponent(r.address_components, 'country'),
    }));
  } catch (err) {
    console.error('[AddressService] GMaps API error:', err);
    return [];
  }
}

export function buildPendingAddress(
  gmaps: GmapsResult,
  extracted: ExtractedAddress['address'],
  couldBeBuilding: boolean,
): PendingAddress {
  return {
    gmapsFormatted: gmaps.formattedAddress,
    gmapsPlaceId: gmaps.placeId,
    latitude: gmaps.latitude,
    longitude: gmaps.longitude,
    street: gmaps.street ?? extracted?.street ?? '',
    number: gmaps.streetNumber ?? extracted?.number ?? null,
    postalCode: gmaps.postalCode ?? extracted?.postalCode ?? '',
    city: gmaps.city ?? extracted?.city ?? '',
    province: gmaps.province ?? extracted?.province ?? null,
    country: gmaps.country ?? extracted?.country ?? '',
    block: extracted?.block ?? null,
    staircase: extracted?.staircase ?? null,
    floor: extracted?.floor ?? null,
    door: extracted?.door ?? null,
    additionalInfo: extracted?.additionalInfo ?? null,
    couldBeBuilding,
    userConfirmedNoDetails: false,
  };
}

export function pendingAddressNeedsBuildingDetails(pending: PendingAddress): boolean {
  return (
    pending.couldBeBuilding &&
    !pending.userConfirmedNoDetails &&
    !pending.floor &&
    !pending.door
  );
}

// ─── Intent interpretation ────────────────────────────────────────────────────

const INTENT_SYSTEM = `You are an intent classifier for a delivery address chatbot.
Given the current phase and user message, respond ONLY with valid JSON (no markdown):
{
  "type": "CONFIRM"|"REJECT_AND_CORRECT"|"CHOOSE_OPTION"|"PROVIDE_BUILDING_DETAILS"|"CONFIRM_NO_BUILDING_DETAILS"|"UNKNOWN",
  "choiceIndex": number|null,      // 0-based, for CHOOSE_OPTION
  "correction": string|null,       // for REJECT_AND_CORRECT
  "buildingDetails": {             // for PROVIDE_BUILDING_DETAILS
    "block": string|null, "staircase": string|null,
    "floor": string|null, "door": string|null, "additionalInfo": string|null
  }|null
}
Rules:
- CONFIRM: user agrees, says "yes/sí/correcto/ok/confirmo/perfecto".
- REJECT_AND_CORRECT: user says "no" or provides a correction.
- CHOOSE_OPTION: user picks a numbered option (1, 2, "primera", "segunda", etc.). choiceIndex is 0-based.
- PROVIDE_BUILDING_DETAILS: user gives floor, door, block or staircase info.
- CONFIRM_NO_BUILDING_DETAILS: user says it's a house/local, or "no hace falta", "no tiene", "es una casa", etc.
- UNKNOWN: anything else.`;

export async function interpretUserIntent(
  phase: ConversationPhase,
  userMessage: string,
  language: string,
): Promise<UserIntent> {
  const client = getOpenAIClient();

  if (!client) {
    return mockInterpretIntent(phase, userMessage);
  }

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: INTENT_SYSTEM },
      {
        role: 'user',
        content: `Phase: ${phase}\nLanguage: ${language}\nUser message: "${userMessage}"`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 200,
    temperature: 0,
  });

  try {
    return JSON.parse(res.choices[0]?.message?.content ?? '{}') as UserIntent;
  } catch {
    return { type: 'UNKNOWN' };
  }
}

function mockInterpretIntent(phase: ConversationPhase, msg: string): UserIntent {
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

  // Numbered choice
  const choiceMap: Record<string, number> = { '1': 0, 'primera': 0, '2': 1, 'segunda': 1, '3': 2, 'tercera': 2 };
  for (const [k, v] of Object.entries(choiceMap)) {
    if (lower === k || lower.startsWith(k + ' ') || lower.startsWith('opción ' + (v + 1))) {
      return { type: 'CHOOSE_OPTION', choiceIndex: v };
    }
  }

  // Building details keywords
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

  // If starts with "no", treat as rejection/correction
  if (lower.startsWith('no ') || lower === 'no') {
    if (phase === 'WAITING_BUILDING_DETAILS') return { type: 'CONFIRM_NO_BUILDING_DETAILS' };
    return { type: 'REJECT_AND_CORRECT', correction: msg };
  }

  // If it looks like a new address, treat as correction
  if (lower.includes('calle') || lower.includes('avenida') || lower.includes('plaza') || /\d{5}/.test(lower)) {
    return { type: 'REJECT_AND_CORRECT', correction: msg };
  }

  return { type: 'UNKNOWN' };
}

// ─── Message builders ─────────────────────────────────────────────────────────

export function buildAddressDisplayText(pending: PendingAddress): string {
  const parts = [
    pending.street && pending.number ? `${pending.street}, ${pending.number}` : pending.street,
    pending.block ? `Bloque ${pending.block}` : null,
    pending.staircase ? `Escalera ${pending.staircase}` : null,
    pending.floor ? `Piso ${pending.floor}` : null,
    pending.door ? `Puerta ${pending.door}` : null,
    pending.additionalInfo ?? null,
    pending.postalCode && pending.city ? `${pending.postalCode} ${pending.city}` : null,
    pending.province ?? null,
    pending.country ?? null,
  ].filter(Boolean);

  return parts.join(', ');
}

export function buildDisambiguationMessage(options: GmapsResult[], language: string): string {
  const nums = ['1️⃣', '2️⃣', '3️⃣'];
  const list = options
    .slice(0, 3)
    .map((o, i) => `${nums[i]} ${o.formattedAddress}`)
    .join('\n');

  if (language === 'English') {
    return `I found several addresses that could be yours. Which one is correct?\n\n${list}\n\nReply with the option number.`;
  }
  if (language === 'French') {
    return `J'ai trouvé plusieurs adresses. Laquelle est la bonne ?\n\n${list}\n\nRépondez avec le numéro.`;
  }
  return `He encontrado varias direcciones. ¿Cuál es la correcta?\n\n${list}\n\nResponde con el número de opción.`;
}

export function buildBuildingDetailsRequest(pending: PendingAddress, language: string): string {
  const addr = buildAddressDisplayText(pending);

  if (language === 'English') {
    return `I validated your address:\n📍 ${addr}\n\nThis looks like it could be an apartment building. Could you tell me the floor and/or door number? If it's not needed (it's a house or local), just say "not needed".`;
  }
  if (language === 'French') {
    return `J'ai validé votre adresse :\n📍 ${addr}\n\nCela ressemble à un immeuble. Pouvez-vous m'indiquer l'étage et/ou la porte ? Si ce n'est pas nécessaire (maison ou local), dites "pas nécessaire".`;
  }
  return `He validado tu dirección:\n📍 ${addr}\n\nParece que podría ser un edificio. ¿Puedes indicarme el piso y/o la puerta? Si no hace falta (es una casa o local), dime "no hace falta".`;
}

export function buildConfirmationRequest(pending: PendingAddress, language: string): string {
  const addr = buildAddressDisplayText(pending);

  if (language === 'English') {
    return `I will send this address to the store:\n📍 ${addr}\n\nPlease confirm it is correct by replying "yes", or correct me if there's any error.`;
  }
  if (language === 'French') {
    return `Je vais envoyer cette adresse à la boutique :\n📍 ${addr}\n\nConfirmez-vous qu'elle est correcte ? Répondez "oui" ou corrigez-moi si nécessaire.`;
  }
  return `Voy a enviar esta dirección al eCommerce:\n📍 ${addr}\n\n¿Confirmas que es correcta? Responde "sí" para confirmar o corrígeme si hay algún error.`;
}

export function buildAddressNotFoundMessage(language: string): string {
  if (language === 'English') {
    return `I couldn't find that address. Could you write it again with the full street name, number, postal code, and city?`;
  }
  if (language === 'French') {
    return `Je n'ai pas trouvé cette adresse. Pourriez-vous la réécrire avec la rue, le numéro, le code postal et la ville ?`;
  }
  return `No he podido encontrar esa dirección. ¿Puedes escribirla de nuevo con la calle, número, código postal y ciudad?`;
}

export function buildUnknownIntentMessage(language: string): string {
  if (language === 'English') {
    return `I didn't understand that. Please reply "yes" to confirm the address or let me know what you'd like to change.`;
  }
  if (language === 'French') {
    return `Je n'ai pas compris. Répondez "oui" pour confirmer ou indiquez ce que vous souhaitez modifier.`;
  }
  return `No he entendido tu respuesta. Por favor, responde "sí" para confirmar la dirección o dime qué quieres corregir.`;
}

export function buildSyncSuccessMessage(pending: PendingAddress, language: string): string {
  const addr = buildAddressDisplayText(pending);

  if (language === 'English') {
    return `✅ Your delivery address has been registered successfully!\n📍 ${addr}\n\nYour order is now being processed. Thank you!`;
  }
  if (language === 'French') {
    return `✅ Votre adresse de livraison a été enregistrée avec succès !\n📍 ${addr}\n\nVotre commande est en cours de traitement. Merci !`;
  }
  return `✅ ¡Tu dirección de entrega ha sido registrada correctamente en la tienda!\n📍 ${addr}\n\nTu pedido ya puede ser procesado. ¡Gracias!`;
}

// ─── eCommerce sync simulation ────────────────────────────────────────────────

export async function simulateEcommerceSync(
  orderId: string,
  pending: PendingAddress,
): Promise<{ success: boolean; statusCode: number }> {
  const addr = buildAddressDisplayText(pending);
  console.log(`[ECOMMERCE_SYNC] → Simulating POST /ecommerce/orders/${orderId}/address`);
  console.log(`[ECOMMERCE_SYNC] → Payload: { address: "${addr}" }`);
  console.log(`[ECOMMERCE_SYNC] ← 200 OK (mock)`);
  return { success: true, statusCode: 200 };
}
