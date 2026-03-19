// ─── Types ────────────────────────────────────────────────────────────────────

export type ConversationPhase =
  | 'WAITING_ADDRESS'
  | 'WAITING_ADDRESS_PROPOSAL_CONFIRM'
  | 'WAITING_DISAMBIGUATION'
  | 'WAITING_BUILDING_DETAILS'
  | 'WAITING_CONFIRMATION'
  | 'WAITING_REGISTER'
  | 'WAITING_REGISTER_EMAIL'
  | 'WAITING_SAVE_ADDRESS'
  | 'WAITING_SAVE_ADDRESS_LABEL';

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
  confirmedAddress?: PendingAddress;
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

// ─── Google Maps validation ───────────────────────────────────────────────────

type GmapsAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

function extractComponent(components: GmapsAddressComponent[], type: string): string | null {
  return components.find((c) => c.types.includes(type))?.long_name ?? null;
}

export async function validateWithGoogleMaps(fullAddress: string): Promise<GmapsResult[]> {
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

// ─── Message builders ─────────────────────────────────────────────────────────

export function buildAddressProposalMessage(
  pending: PendingAddress,
  storeName: string,
  source: 'adresles' | 'ecommerce',
  language: string,
): string {
  const addressText = buildAddressDisplayText(pending);
  const sourceText =
    source === 'adresles'
      ? language === 'English'
        ? 'your saved Adresles address'
        : 'tu dirección guardada en Adresles'
      : language === 'English'
        ? `your address registered at ${storeName}`
        : `tu dirección registrada en ${storeName}`;

  if (language === 'English') {
    return (
      `Hi! We've received your order from ${storeName}. ` +
      `Shall we send it to ${sourceText}?\n\n**${addressText}**\n\n` +
      `Reply "Yes" to confirm or give me a different address.`
    );
  }
  return (
    `¡Hola! Hemos recibido tu pedido de ${storeName}. ` +
    `¿Te lo enviamos a ${sourceText}?\n\n**${addressText}**\n\n` +
    `Responde "Sí" para confirmar o indícame otra dirección.`
  );
}

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
    return `I validated your address:\n📍 **${addr}**\n\nThis looks like it could be an apartment building. Could you tell me the floor and/or door number? If it's not needed (it's a house or local), just say "not needed".`;
  }
  if (language === 'French') {
    return `J'ai validé votre adresse :\n📍 **${addr}**\n\nCela ressemble à un immeuble. Pouvez-vous m'indiquer l'étage et/ou la porte ? Si ce n'est pas nécessaire (maison ou local), dites "pas nécessaire".`;
  }
  return `He validado tu dirección:\n📍 **${addr}**\n\nParece que podría ser un edificio. ¿Puedes indicarme el piso y/o la puerta? Si no hace falta (es una casa o local), dime "no hace falta".`;
}

export function buildConfirmationRequest(pending: PendingAddress, language: string): string {
  const addr = buildAddressDisplayText(pending);

  if (language === 'English') {
    return `I will send this address to the store:\n📍 **${addr}**\n\nPlease confirm it is correct by replying "yes", or correct me if there's any error.`;
  }
  if (language === 'French') {
    return `Je vais envoyer cette adresse à la boutique :\n📍 **${addr}**\n\nConfirmez-vous qu'elle est correcte ? Répondez "oui" ou corrigez-moi si nécessaire.`;
  }
  return `Voy a enviar esta dirección al eCommerce:\n📍 **${addr}**\n\n¿Confirmas que es correcta? Responde "sí" para confirmar o corrígeme si hay algún error.`;
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

export function buildSyncSuccessMessage(pending: PendingAddress, language: string, storeName: string): string {
  const addr = buildAddressDisplayText(pending);

  if (language === 'English') {
    return `✅ Your delivery address has been successfully registered in **${storeName}**!\n📍 **${addr}**\n\nYour order status has been updated both in **${storeName}** and in Adresles. It is now ready to be processed. Thank you!`;
  }
  if (language === 'French') {
    return `✅ Votre adresse de livraison a été enregistrée avec succès dans **${storeName}** !\n📍 **${addr}**\n\nLe statut de votre commande a été mis à jour dans **${storeName}** et dans Adresles. Elle est maintenant prête à être traitée. Merci !`;
  }
  return `✅ ¡Tu dirección de entrega ha sido registrada correctamente en **${storeName}**!\n📍 **${addr}**\n\nEl estado de tu pedido ha sido actualizado tanto en **${storeName}** como en Adresles. Ya puede ser procesado. ¡Gracias!`;
}

export function buildRegistrationOfferMessage(language: string): string {
  if (language === 'English') {
    return (
      `By the way, did you know you can register with Adresles for free? ` +
      `Next time you shop, I'll confirm your address automatically without you having to type it again. ` +
      `Would you like to register now? (reply "Yes" or "No")`
    );
  }
  return (
    `Por cierto, ¿sabías que puedes registrarte en Adresles de forma gratuita? ` +
    `Así, en tu próxima compra confirmaré tu dirección automáticamente sin que tengas que escribirla de nuevo. ` +
    `¿Te gustaría registrarte ahora? (responde "Sí" o "No")`
  );
}

export function buildRegistrationEmailRequestMessage(language: string): string {
  if (language === 'English') {
    return `To complete your registration, please provide your email address.`;
  }
  return `Para completar tu registro, indícame tu correo electrónico.`;
}

export function buildRegistrationSuccessMessage(language: string): string {
  if (language === 'English') {
    return `Great! You're now registered with Adresles. Thank you for trusting us!`;
  }
  return `¡Perfecto! Ya estás registrado en Adresles. ¡Gracias por confiar en nosotros!`;
}

export function buildRegistrationDeclinedMessage(language: string): string {
  if (language === 'English') {
    return `No problem! Have a great day! 😊`;
  }
  return `¡Sin problema! ¡Hasta pronto! 😊`;
}

export function buildSaveAddressOfferMessage(pending: PendingAddress, language: string): string {
  const addressText = buildAddressDisplayText(pending);
  if (language === 'English') {
    return (
      `Would you like to save this address in your Adresles address book for future use?\n\n` +
      `**${addressText}**\n\n(reply "Yes" or "No")`
    );
  }
  return (
    `¿Te gustaría guardar esta dirección en tu libreta de Adresles para usarla en el futuro?\n\n` +
    `**${addressText}**\n\n(responde "Sí" o "No")`
  );
}

export function buildSaveAddressLabelRequestMessage(language: string): string {
  if (language === 'English') {
    return `What would you like to call this address? (e.g. Home, Work)`;
  }
  return `¿Cómo quieres llamar a esta dirección? (ej: Casa, Trabajo)`;
}

export function buildAddressSavedMessage(language: string): string {
  if (language === 'English') return `Done! Address saved to your Adresles address book. 📋`;
  return `¡Listo! Dirección guardada en tu libreta de Adresles. 📋`;
}

export function buildAddressNotSavedMessage(language: string): string {
  if (language === 'English') return `No problem! Have a great day! 😊`;
  return `¡Sin problema! ¡Hasta pronto! 😊`;
}

/** Simplified RFC 5322-like: local@domain.tld, max 254 chars */
const EMAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/;

export function extractEmailFromMessage(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 254) return null;
  const match = trimmed.match(EMAIL_REGEX);
  const email = match?.[0] ?? null;
  return email && email.length <= 254 ? email : null;
}

// ─── eCommerce sync simulation ────────────────────────────────────────────────

export async function simulateEcommerceSync(
  orderId: string,
  pending: PendingAddress,
  storeName?: string,
): Promise<{ success: boolean; statusCode: number }> {
  const addr = buildAddressDisplayText(pending);
  const store = storeName ? ` [${storeName}]` : '';
  const syncedAt = new Date().toISOString();
  console.log(`[SYNC_SIMULATED]${store} → POST /ecommerce/orders/${orderId}/address`);
  console.log(`[SYNC_SIMULATED]${store} → Payload: { address: "${addr}" }`);
  console.log(`[SYNC_SIMULATED]${store} ← 200 OK (mock) | status=READY_TO_PROCESS | syncedAt=${syncedAt}`);
  return { success: true, statusCode: 200 };
}
