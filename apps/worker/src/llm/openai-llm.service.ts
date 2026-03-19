import OpenAI from 'openai';
import type { ILLMService, GenerateMessageParams } from './llm.interface';
import type {
  ConversationMessage,
  ConversationPhase,
  ExtractedAddress,
  UserIntent,
} from '../services/address.service';

// ─── System prompts ───────────────────────────────────────────────────────────

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

// ─── Implementation ───────────────────────────────────────────────────────────

export class OpenAILLMService implements ILLMService {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateMessage({ systemPrompt, userPrompt }: GenerateMessageParams): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async extractAddress(messages: ConversationMessage[], language: string): Promise<ExtractedAddress> {
    const text = messages
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
      .join('\n');

    const res = await this.client.chat.completions.create({
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

  async interpretIntent(
    phase: ConversationPhase,
    userMessage: string,
    language: string,
  ): Promise<UserIntent> {
    const res = await this.client.chat.completions.create({
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
}
