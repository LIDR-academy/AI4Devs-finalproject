export interface ChatRequest {
  messages: Array<ChatMessage>;
}

export interface ChatResponse {
  messages: Array<ChatMessage>;
  response: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool';
  content: string;
  name?: string;
  imageUrl?: string;
  imageCaption?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    }
  }>;
  tool_call_id?: string;
} 