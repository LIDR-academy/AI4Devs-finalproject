// dotenv is loaded in main.ts with override:true
import { Job } from 'bullmq';
import { PrismaClient } from '@adresles/prisma-db';
import {
  ProcessConversationJobData,
  ProcessResponseJobData,
  MockOrderContext,
} from '@adresles/shared-types';
import { saveMessage, getMessages, saveConversationState, getConversationState } from '../dynamodb/dynamodb.service';
import { publishConversationUpdate, publishConversationComplete } from '../redis-publisher';
import {
  ConversationState,
  PendingAddress,
  validateWithGoogleMaps,
  buildPendingAddress,
  buildAddressProposalMessage,
  pendingAddressNeedsBuildingDetails,
  buildAddressDisplayText,
  buildDisambiguationMessage,
  buildBuildingDetailsRequest,
  buildConfirmationRequest,
  buildAddressNotFoundMessage,
  buildSyncSuccessMessage,
  buildRegistrationOfferMessage,
  buildRegistrationEmailRequestMessage,
  buildRegistrationSuccessMessage,
  buildRegistrationDeclinedMessage,
  buildSaveAddressOfferMessage,
  buildSaveAddressLabelRequestMessage,
  buildAddressSavedMessage,
  buildAddressNotSavedMessage,
  extractEmailFromMessage,
  simulateEcommerceSync,
  ConversationMessage,
} from '../services/address.service';
import type { ILLMService } from '../llm/llm.interface';
import { MockLLMService } from '../llm/mock-llm.service';

const prisma = new PrismaClient();

// ─── LLM service — defaults to mock, replaced by main.ts with real service ───

let _llmService: ILLMService = new MockLLMService();

export function setLLMService(svc: ILLMService): void {
  _llmService = svc;
}

// ─── Language helpers ─────────────────────────────────────────────────────────

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish', ca: 'Catalan', fr: 'French', en: 'English',
  pt: 'Portuguese', de: 'German', it: 'Italian',
};

function getLanguageName(code: string | null | undefined): string {
  return LANGUAGE_NAMES[code ?? 'es'] ?? 'Spanish';
}

// ─── Initial GET_ADDRESS journey helpers ──────────────────────────────────────

function buildGetAddressSystemPrompt(language: string): string {
  return (
    `You are Adresles, a friendly and professional virtual assistant for e-commerce platforms. ` +
    `Your role is to help customers complete their purchases by confirming their delivery address via chat. ` +
    `Always respond in ${language}. ` +
    `If the user explicitly asks you to respond in a different language, honor that request for the rest of this conversation. ` +
    `Be concise, warm, and professional. Never ask for payment information. ` +
    `When asking for an address, request: street with number, floor/door if applicable, postal code, and city.`
  );
}

function buildGetAddressUserPrompt(params: {
  name: string;
  storeName: string;
  orderNumber: string | null;
  language: string;
}): string {
  return (
    `Generate a friendly initial message for this situation:\n` +
    `- Customer name: ${params.name}\n` +
    `- Store: ${params.storeName}\n` +
    `- Order number: ${params.orderNumber ?? 'N/A'}\n` +
    `- Language: ${params.language}\n\n` +
    `The message must:\n` +
    `1. Greet the customer by their first name\n` +
    `2. Confirm their recent order from ${params.storeName}\n` +
    `3. Explain you need their delivery address to complete the shipment\n` +
    `4. Ask clearly for: street and number, floor/door (if applicable), postal code, and city\n\n` +
    `Keep it under 3 short paragraphs. Do not include any placeholder text.`
  );
}

// ─── process-conversation ─────────────────────────────────────────────────────

export async function conversationProcessor(job: Job<ProcessConversationJobData>) {
  const { conversationId, orderId, userId, conversationType, context } = job.data;

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { phone: true } });
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { store: true, orderAddress: true } });

  if (!user || !order) throw new Error(`User ${userId} or Order ${orderId} not found`);

  if (conversationType === 'GET_ADDRESS') return processGetAddressJourney(conversationId, user, order, context);
  if (conversationType === 'INFORMATION') return processInformationJourney(conversationId, user, order);

  throw new Error(`Unknown conversation type: ${conversationType}`);
}

function addressToPendingAddress(addr: {
  fullAddress: string;
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
}): PendingAddress {
  return {
    gmapsFormatted: addr.fullAddress,
    gmapsPlaceId: null,
    latitude: null,
    longitude: null,
    street: addr.street,
    number: addr.number ?? null,
    postalCode: addr.postalCode,
    city: addr.city,
    province: addr.province ?? null,
    country: addr.country,
    block: addr.block ?? null,
    staircase: addr.staircase ?? null,
    floor: addr.floor ?? null,
    door: addr.door ?? null,
    additionalInfo: addr.additionalInfo ?? null,
    couldBeBuilding: false,
    userConfirmedNoDetails: true,
  };
}

function ecommerceAddressToPending(addr: {
  full_address: string;
  street: string;
  number?: string;
  postal_code: string;
  city: string;
  province?: string;
  country: string;
  block?: string;
  staircase?: string;
  floor?: string;
  door?: string;
  additional_info?: string;
}): PendingAddress {
  return {
    gmapsFormatted: addr.full_address,
    gmapsPlaceId: null,
    latitude: null,
    longitude: null,
    street: addr.street,
    number: addr.number ?? null,
    postalCode: addr.postal_code,
    city: addr.city,
    province: addr.province ?? null,
    country: addr.country,
    block: addr.block ?? null,
    staircase: addr.staircase ?? null,
    floor: addr.floor ?? null,
    door: addr.door ?? null,
    additionalInfo: addr.additional_info ?? null,
    couldBeBuilding: false,
    userConfirmedNoDetails: true,
  };
}

async function processGetAddressJourney(
  conversationId: string,
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    preferredLanguage: string | null;
    isRegistered: boolean;
  },
  order: { externalOrderId: string; store: { name: string } },
  context?: MockOrderContext,
) {
  const name = user.firstName ?? 'Cliente';
  const language = getLanguageName(user.preferredLanguage);
  const systemPrompt = buildGetAddressSystemPrompt(language);
  const storeName = order.store.name;

  // ─── Sub-journey 2.1: usuario registrado con dirección en Adresles ──
  if (user.isRegistered) {
    const savedAddresses = await prisma.address.findMany({
      where: { userId: user.id, isDeleted: false },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      take: 1,
    });

    if (savedAddresses.length > 0) {
      const saved = savedAddresses[0];
      const proposedPending = addressToPendingAddress({
        fullAddress: saved.fullAddress,
        street: saved.street,
        number: saved.number,
        postalCode: saved.postalCode,
        city: saved.city,
        province: saved.province,
        country: saved.country,
        block: saved.block,
        staircase: saved.staircase,
        floor: saved.floor,
        door: saved.door,
        additionalInfo: saved.additionalInfo,
      });

      const msg = buildAddressProposalMessage(proposedPending, storeName, 'adresles', language);
      await saveMessage(conversationId, 'system', systemPrompt);
      await saveMessage(conversationId, 'assistant', msg);
      await saveConversationState(conversationId, {
        phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM',
        pendingAddress: proposedPending,
        failedAttempts: 0,
      });
      await publishConversationUpdate(conversationId, 'assistant', msg);

      console.log(`[GET_ADDRESS] Sub-journey 2.1 — proposed Adresles saved address to ${name}`);
      return { conversationId, message: msg, conversationType: 'GET_ADDRESS' };
    }
  }

  // ─── Sub-journey 2.3: usuario no registrado con dirección eCommerce ──
  if (!user.isRegistered && context?.buyerRegisteredEcommerce && context.buyerEcommerceAddress) {
    const addr = context.buyerEcommerceAddress;
    const proposedPending = ecommerceAddressToPending(addr);

    const msg = buildAddressProposalMessage(proposedPending, storeName, 'ecommerce', language);
    await saveMessage(conversationId, 'system', systemPrompt);
    await saveMessage(conversationId, 'assistant', msg);
    await saveConversationState(conversationId, {
      phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM',
      pendingAddress: proposedPending,
      failedAttempts: 0,
    });
    await publishConversationUpdate(conversationId, 'assistant', msg);

    console.log(`[GET_ADDRESS] Sub-journey 2.3 — proposed eCommerce address to ${name}`);
    return { conversationId, message: msg, conversationType: 'GET_ADDRESS' };
  }

  // ─── Sub-journey 2.2 / 2.4: pregunta dirección estándar ──
  const userPrompt = buildGetAddressUserPrompt({ name, storeName, orderNumber: order.externalOrderId, language });
  const assistantMessage = await _llmService.generateMessage({ systemPrompt, userPrompt });

  await saveMessage(conversationId, 'system', systemPrompt);
  await saveMessage(conversationId, 'user', userPrompt);
  await saveMessage(conversationId, 'assistant', assistantMessage);
  await publishConversationUpdate(conversationId, 'assistant', assistantMessage);

  await saveConversationState(conversationId, { phase: 'WAITING_ADDRESS', failedAttempts: 0 } as ConversationState);

  console.log(`[GET_ADDRESS] Sub-journey 2.2/2.4 — asked for address from ${name}: ${assistantMessage}`);
  return { conversationId, message: assistantMessage, conversationType: 'GET_ADDRESS' };
}

async function processInformationJourney(
  conversationId: string,
  user: { firstName: string | null; lastName: string | null },
  order: {
    externalOrderId: string;
    store: { name: string };
    orderAddress: { fullAddress: string } | null;
  },
) {
  const name = user.firstName ?? 'Cliente';
  const orderNumber = order.externalOrderId;
  const addressLine =
    order.orderAddress != null
      ? `📍 **Dirección de entrega:**\n${order.orderAddress.fullAddress}`
      : '📍 La dirección de entrega que indicaste ha sido registrada correctamente.';
  const message = [
    `¡Hola **${name}**!`,
    `✅ Tu pedido **#${orderNumber}** de **${order.store.name}** ha sido confirmado.`,
    addressLine,
    '📦 Tu pedido será enviado pronto.\n\n¡Gracias por tu compra!',
  ].join('\n\n');

  await saveMessage(conversationId, 'assistant', message);
  await publishConversationUpdate(conversationId, 'assistant', message);
  console.log(`[INFORMATION] Conversation ${conversationId}: ${message}`);
  return { conversationId, message, conversationType: 'INFORMATION' };
}

// ─── process-response (state machine) ────────────────────────────────────────

interface HandlerContext {
  conversationId: string;
  orderId: string;
  userId: string;
  userMessage: string;
  state: ConversationState;
  language: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    preferredLanguage: string | null;
    isRegistered: boolean;
    phone: { id: string } | null;
  };
  order: { externalOrderId: string; store: { name: string } };
}

export async function processResponseProcessor(job: Job<ProcessResponseJobData>) {
  const { conversationId, orderId, userId, userMessage } = job.data;
  console.log(`[PROCESS_RESPONSE] Conversation ${conversationId} — user: "${userMessage}"`);

  const [conversation, user, order] = await Promise.all([
    prisma.conversation.findUnique({ where: { id: conversationId } }),
    prisma.user.findUnique({ where: { id: userId }, include: { phone: true } }),
    prisma.order.findUnique({ where: { id: orderId }, include: { store: true } }),
  ]);

  if (!conversation || !user || !order) {
    throw new Error(`Missing data for conversation ${conversationId}`);
  }

  const language = getLanguageName(user.preferredLanguage);
  const state = (await getConversationState<ConversationState>(conversationId)) ?? {
    phase: 'WAITING_ADDRESS' as const,
    failedAttempts: 0,
  };

  console.log(`[PROCESS_RESPONSE] Phase: ${state.phase}`);

  const ctx: HandlerContext = { conversationId, orderId, userId, userMessage, state, language, user, order };

  const handlers: Record<ConversationState['phase'], (ctx: HandlerContext) => Promise<unknown>> = {
    WAITING_ADDRESS: handleWaitingAddress,
    WAITING_ADDRESS_PROPOSAL_CONFIRM: handleAddressProposalConfirm,
    WAITING_DISAMBIGUATION: handleDisambiguation,
    WAITING_BUILDING_DETAILS: handleBuildingDetails,
    WAITING_CONFIRMATION: handleConfirmation,
    WAITING_REGISTER: handleWaitingRegister,
    WAITING_REGISTER_EMAIL: handleWaitingRegisterEmail,
    WAITING_SAVE_ADDRESS: handleWaitingSaveAddress,
    WAITING_SAVE_ADDRESS_LABEL: handleWaitingSaveAddressLabel,
  };

  return handlers[state.phase](ctx);
}

// ─── Phase handlers ───────────────────────────────────────────────────────────

async function handleAddressProposalConfirm(ctx: HandlerContext) {
  const { userMessage, state, language } = ctx;
  const pending = state.pendingAddress!;

  const intent = await _llmService.interpretIntent('WAITING_CONFIRMATION', userMessage, language);
  console.log(`[PROCESS_RESPONSE] Address proposal confirm intent: ${intent.type}`);

  if (intent.type === 'CONFIRM') {
    return finalizeAddress(ctx, pending);
  }

  // Usuario rechaza o da otra dirección → transicionar a WAITING_ADDRESS
  const correctedCtx: HandlerContext = {
    ...ctx,
    userMessage: intent.type === 'REJECT_AND_CORRECT' && intent.correction ? intent.correction : userMessage,
    state: { phase: 'WAITING_ADDRESS', failedAttempts: 0 },
  };
  return handleWaitingAddress(correctedCtx);
}

async function handleWaitingAddress(ctx: HandlerContext) {
  const { conversationId, userMessage, state, language } = ctx;

  const history = await getMessages(conversationId);
  const messages: ConversationMessage[] = history.map((m) => ({
    role: m.role as 'system' | 'user' | 'assistant',
    content: m.content,
  }));

  const extracted = await _llmService.extractAddress(messages, language);
  console.log(`[PROCESS_RESPONSE] Extracted:`, JSON.stringify(extracted));

  if (!extracted.isComplete || !extracted.address) {
    const failed = (state.failedAttempts ?? 0) + 1;
    const newState: ConversationState = { ...state, phase: 'WAITING_ADDRESS', failedAttempts: failed };

    if (failed >= 3) {
      await prisma.conversation.update({ where: { id: conversationId }, data: { status: 'ESCALATED', completedAt: new Date() } });
      const msg = language === 'English'
        ? `I'm having trouble understanding your address. A support agent will contact you shortly.`
        : `No he podido entender tu dirección. Un agente de soporte se pondrá en contacto contigo pronto.`;
      await saveMessage(conversationId, 'assistant', msg);
      await publishConversationUpdate(conversationId, 'assistant', msg);
      await publishConversationComplete(conversationId, 'ESCALATED');
      return { conversationId, status: 'escalated' };
    }

    await saveConversationState(conversationId, newState);
    const msg = buildAddressNotFoundMessage(language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
    return { conversationId, status: 'waiting_address', message: msg };
  }

  // Validate with Google Maps
  const gmapsResults = await validateWithGoogleMaps(extracted.address.fullAddress);
  console.log(`[PROCESS_RESPONSE] GMaps results: ${gmapsResults.length}`);

  // GMaps returned nothing (no key or invalid address) — build pending from extraction only
  if (gmapsResults.length === 0) {
    const pending: PendingAddress = {
      gmapsFormatted: extracted.address.fullAddress,
      gmapsPlaceId: null,
      latitude: null,
      longitude: null,
      street: extracted.address.street,
      number: extracted.address.number,
      postalCode: extracted.address.postalCode,
      city: extracted.address.city,
      province: extracted.address.province,
      country: extracted.address.country,
      block: extracted.address.block,
      staircase: extracted.address.staircase,
      floor: extracted.address.floor,
      door: extracted.address.door,
      additionalInfo: extracted.address.additionalInfo,
      couldBeBuilding: extracted.couldBeBuilding,
      userConfirmedNoDetails: false,
    };
    return advanceFromPending(ctx, pending);
  }

  // Multiple results → disambiguation
  if (gmapsResults.length > 1) {
    const newState: ConversationState = { phase: 'WAITING_DISAMBIGUATION', gmapsOptions: gmapsResults, failedAttempts: 0 };
    await saveConversationState(conversationId, newState);
    const msg = buildDisambiguationMessage(gmapsResults, language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
    console.log(`[PROCESS_RESPONSE] → WAITING_DISAMBIGUATION (${gmapsResults.length} options)`);
    return { conversationId, status: 'waiting_disambiguation', message: msg };
  }

  // Single result
  const pending = buildPendingAddress(gmapsResults[0], extracted.address, extracted.couldBeBuilding);
  return advanceFromPending(ctx, pending);
}

async function handleDisambiguation(ctx: HandlerContext) {
  const { conversationId, userMessage, state, language } = ctx;
  const options = state.gmapsOptions ?? [];

  const intent = await _llmService.interpretIntent('WAITING_DISAMBIGUATION', userMessage, language);
  console.log(`[PROCESS_RESPONSE] Disambiguation intent: ${intent.type}`);

  if (intent.type === 'CHOOSE_OPTION' && intent.choiceIndex !== undefined) {
    const chosen = options[intent.choiceIndex];
    if (chosen) {
      const pending: PendingAddress = {
        gmapsFormatted: chosen.formattedAddress,
        gmapsPlaceId: chosen.placeId,
        latitude: chosen.latitude,
        longitude: chosen.longitude,
        street: chosen.street ?? '',
        number: chosen.streetNumber ?? null,
        postalCode: chosen.postalCode ?? '',
        city: chosen.city ?? '',
        province: chosen.province ?? null,
        country: chosen.country ?? '',
        block: null, staircase: null, floor: null, door: null, additionalInfo: null,
        couldBeBuilding: false,
        userConfirmedNoDetails: false,
      };
      return advanceFromPending(ctx, pending);
    }
  }

  // Re-send disambiguation if choice unclear
  const msg = buildDisambiguationMessage(options, language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  return { conversationId, status: 'waiting_disambiguation', message: msg };
}

async function handleBuildingDetails(ctx: HandlerContext) {
  const { conversationId, userMessage, state, language } = ctx;
  const pending = state.pendingAddress!;

  const intent = await _llmService.interpretIntent('WAITING_BUILDING_DETAILS', userMessage, language);
  console.log(`[PROCESS_RESPONSE] Building details intent: ${intent.type}`);

  if (intent.type === 'CONFIRM_NO_BUILDING_DETAILS') {
    const updated: PendingAddress = { ...pending, userConfirmedNoDetails: true };
    return advanceFromPending(ctx, updated);
  }

  if (intent.type === 'PROVIDE_BUILDING_DETAILS' && intent.buildingDetails) {
    const d = intent.buildingDetails;
    const updated: PendingAddress = {
      ...pending,
      block: d.block ?? pending.block,
      staircase: d.staircase ?? pending.staircase,
      floor: d.floor ?? pending.floor,
      door: d.door ?? pending.door,
      additionalInfo: d.additionalInfo ?? pending.additionalInfo,
    };
    return advanceFromPending(ctx, updated);
  }

  // Unknown — re-ask
  const msg = buildBuildingDetailsRequest(pending, language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  return { conversationId, status: 'waiting_building_details', message: msg };
}

async function handleConfirmation(ctx: HandlerContext) {
  const { conversationId, userMessage, state, language } = ctx;
  const pending = state.pendingAddress!;

  const intent = await _llmService.interpretIntent('WAITING_CONFIRMATION', userMessage, language);
  console.log(`[PROCESS_RESPONSE] Confirmation intent: ${intent.type}`);

  if (intent.type === 'CONFIRM') {
    return finalizeAddress(ctx, pending);
  }

  if (intent.type === 'REJECT_AND_CORRECT') {
    const correctedCtx: HandlerContext = {
      ...ctx,
      userMessage: intent.correction ?? userMessage,
      state: { phase: 'WAITING_ADDRESS', failedAttempts: 0 },
    };
    return handleWaitingAddress(correctedCtx);
  }

  // UNKNOWN — re-send confirmation request
  const msg = buildConfirmationRequest(pending, language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  return { conversationId, status: 'waiting_confirmation', message: msg };
}

async function handleWaitingRegister(ctx: HandlerContext) {
  const { conversationId, state, language } = ctx;
  const confirmedAddress = state.confirmedAddress!;

  const intent = await _llmService.interpretIntent('WAITING_CONFIRMATION', ctx.userMessage, language);
  console.log(`[PROCESS_RESPONSE] Registration offer intent: ${intent.type}`);

  if (intent.type === 'CONFIRM') {
    const msg = buildRegistrationEmailRequestMessage(language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
    await saveConversationState(conversationId, {
      phase: 'WAITING_REGISTER_EMAIL',
      confirmedAddress,
    });
    return { conversationId, status: 'waiting_register_email', message: msg };
  }

  const msg = buildRegistrationDeclinedMessage(language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  const now = new Date();
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'COMPLETED', completedAt: now },
  });
  await publishConversationComplete(conversationId, 'COMPLETED');
  return { conversationId, status: 'registration_declined', message: msg };
}

async function handleWaitingRegisterEmail(ctx: HandlerContext) {
  const { conversationId, userId, userMessage, state, language } = ctx;
  const confirmedAddress = state.confirmedAddress!;

  const email = extractEmailFromMessage(userMessage);
  console.log(`[PROCESS_RESPONSE] Registration email extracted: ${email ?? 'null'}`);

  if (!email) {
    const msg = buildRegistrationEmailRequestMessage(language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
    return { conversationId, status: 'waiting_register_email', message: msg };
  }

  const now = new Date();
  await prisma.user.update({
    where: { id: userId },
    data: { isRegistered: true, registeredAt: now, email },
  });
  console.log(`[PROCESS_RESPONSE] User ${userId} registered in Adresles`);

  const msg = buildRegistrationSuccessMessage(language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);

  return offerSaveAddress({ ...ctx, state: { ...state, confirmedAddress } }, confirmedAddress);
}

function sanitizeAddressLabel(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return 'Mi dirección';
  return trimmed.slice(0, 80);
}

async function closeConversation(ctx: HandlerContext) {
  const { conversationId } = ctx;
  const now = new Date();
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'COMPLETED', completedAt: now },
  });
  await publishConversationComplete(conversationId, 'COMPLETED');
  return { conversationId, status: 'completed' };
}

async function offerSaveAddress(ctx: HandlerContext, confirmedAddress: PendingAddress) {
  const { conversationId, userId, language } = ctx;

  const existingAddresses = await prisma.address.findMany({
    where: { userId, isDeleted: false },
  });
  const isNewAddress = !existingAddresses.some(
    (a) => a.fullAddress.trim().toLowerCase() === confirmedAddress.gmapsFormatted.trim().toLowerCase(),
  );

  if (!isNewAddress) {
    return closeConversation(ctx);
  }

  const msg = buildSaveAddressOfferMessage(confirmedAddress, language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  await saveConversationState(conversationId, {
    phase: 'WAITING_SAVE_ADDRESS',
    confirmedAddress,
  });
  console.log(`[PROCESS_RESPONSE] offerSaveAddress: new address offered for conversation ${conversationId}`);
  return { conversationId, status: 'waiting_save_address' };
}

async function handleWaitingSaveAddress(ctx: HandlerContext) {
  const { conversationId, userMessage, state, language } = ctx;

  const intent = await _llmService.interpretIntent('WAITING_CONFIRMATION', userMessage, language);
  console.log(`[PROCESS_RESPONSE] WAITING_SAVE_ADDRESS intent: ${intent.type}`);

  if (intent.type === 'CONFIRM') {
    const msg = buildSaveAddressLabelRequestMessage(language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
    await saveConversationState(conversationId, {
      phase: 'WAITING_SAVE_ADDRESS_LABEL',
      confirmedAddress: state.confirmedAddress,
    });
    console.log(`[PROCESS_RESPONSE] handleWaitingSaveAddress: asking for label`);
    return { conversationId, status: 'waiting_save_address_label' };
  }

  const msg = buildAddressNotSavedMessage(language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  return closeConversation(ctx);
}

async function handleWaitingSaveAddressLabel(ctx: HandlerContext) {
  const { conversationId, userId, userMessage, state, language } = ctx;
  const confirmedAddress = state.confirmedAddress!;

  const label = sanitizeAddressLabel(userMessage);

  await prisma.address.create({
    data: {
      userId,
      label,
      fullAddress: confirmedAddress.gmapsFormatted,
      street: confirmedAddress.street,
      number: confirmedAddress.number ?? undefined,
      block: confirmedAddress.block ?? undefined,
      staircase: confirmedAddress.staircase ?? undefined,
      floor: confirmedAddress.floor ?? undefined,
      door: confirmedAddress.door ?? undefined,
      postalCode: confirmedAddress.postalCode,
      city: confirmedAddress.city,
      province: confirmedAddress.province ?? undefined,
      country: confirmedAddress.country,
      isDefault: false,
    },
  });

  const msg = buildAddressSavedMessage(language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  console.log(`[PROCESS_RESPONSE] handleWaitingSaveAddressLabel: address saved with label "${label}"`);
  return closeConversation(ctx);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function advanceFromPending(ctx: HandlerContext, pending: PendingAddress) {
  const { conversationId, language } = ctx;

  if (pendingAddressNeedsBuildingDetails(pending)) {
    const newState: ConversationState = { phase: 'WAITING_BUILDING_DETAILS', pendingAddress: pending };
    await saveConversationState(conversationId, newState);
    const msg = buildBuildingDetailsRequest(pending, language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
    console.log(`[PROCESS_RESPONSE] → WAITING_BUILDING_DETAILS`);
    return { conversationId, status: 'waiting_building_details', message: msg };
  }

  const newState: ConversationState = { phase: 'WAITING_CONFIRMATION', pendingAddress: pending };
  await saveConversationState(conversationId, newState);
  const msg = buildConfirmationRequest(pending, language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  console.log(`[PROCESS_RESPONSE] → WAITING_CONFIRMATION`);
  return { conversationId, status: 'waiting_confirmation', message: msg };
}

async function finalizeAddress(ctx: HandlerContext, pending: PendingAddress) {
  const { conversationId, orderId, language, user } = ctx;

  const syncResult = await simulateEcommerceSync(orderId, pending, ctx.order.store.name);

  if (!syncResult.success) {
    const msg = language === 'English'
      ? `There was an issue saving your address. Please try again later.`
      : `Ha ocurrido un error al guardar tu dirección. Por favor, inténtalo de nuevo más tarde.`;
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
    return { conversationId, status: 'sync_failed' };
  }

  const recipientPhoneId = user.phone?.id;
  if (!recipientPhoneId) throw new Error(`User ${user.id} has no associated phone record`);

  const recipientName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Cliente';
  const now = new Date();
  const addrText = buildAddressDisplayText(pending);

  await prisma.orderAddress.create({
    data: {
      orderId,
      recipientType: 'BUYER',
      recipientName,
      recipientPhoneId,
      fullAddress: pending.gmapsFormatted || addrText,
      street: pending.street,
      number: pending.number ?? undefined,
      block: pending.block ?? undefined,
      staircase: pending.staircase ?? undefined,
      floor: pending.floor ?? undefined,
      door: pending.door ?? undefined,
      additionalInfo: pending.additionalInfo ?? undefined,
      postalCode: pending.postalCode,
      city: pending.city,
      province: pending.province ?? undefined,
      country: pending.country,
      gmapsPlaceId: pending.gmapsPlaceId ?? undefined,
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: now,
      confirmedVia: 'CONVERSATION',
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'READY_TO_PROCESS',
      addressConfirmedAt: now,
      syncedAt: now,
      statusSource: 'ADRESLES',
    },
  });

  const successMsg = buildSyncSuccessMessage(pending, language, ctx.order.store.name);
  await saveMessage(conversationId, 'assistant', successMsg);
  await publishConversationUpdate(conversationId, 'assistant', successMsg);

  if (!user.isRegistered) {
    const registerMsg = buildRegistrationOfferMessage(language);
    await saveMessage(conversationId, 'assistant', registerMsg);
    await publishConversationUpdate(conversationId, 'assistant', registerMsg);
    await saveConversationState(conversationId, {
      phase: 'WAITING_REGISTER',
      confirmedAddress: pending,
    });
    console.log(`[PROCESS_RESPONSE] ✅ Address confirmed, offered registration for order ${orderId}`);
    return { conversationId, orderId, status: 'waiting_register', address: addrText };
  }

  return offerSaveAddress(ctx, pending);
}
