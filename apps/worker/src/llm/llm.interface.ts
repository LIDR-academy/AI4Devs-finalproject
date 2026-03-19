import type {
  ConversationMessage,
  ConversationPhase,
  ExtractedAddress,
  UserIntent,
} from '../services/address.service';

export interface GenerateMessageParams {
  systemPrompt: string;
  userPrompt: string;
}

export interface ILLMService {
  generateMessage(params: GenerateMessageParams): Promise<string>;
  extractAddress(messages: ConversationMessage[], language: string): Promise<ExtractedAddress>;
  interpretIntent(phase: ConversationPhase, userMessage: string, language: string): Promise<UserIntent>;
}
