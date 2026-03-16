export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool';
  content: string;
  timestamp: string;
  imageUrl?: string;
  imageCaption?: string;
  source?: string;
  isError?: boolean;
  name?: string;
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

export interface SimpleChatMessage {
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool';
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  name?: string;
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

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface SendMessageParams {
  messages: SimpleChatMessage[];
}

export interface ChatApiResponse {
  message: {
    role: 'user' | 'assistant' | 'system' | 'function' | 'tool';
    content: string;
    name?: string;
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
  };
  orderData?: {
    orderNumber: string;
    status: string;
    items: Array<{
      product: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>;
    total: number;
    currency: string;
    estimatedDelivery: string;
    customerInfo: {
      name: string;
      address: string;
      email: string;
    };
    paymentMethod: string;
    shippingMethod: string;
    notes: string;
    timestamp: string;
  };
  debug?: {
    functionCalls?: Array<{
      name: string;
      arguments: any;
      result?: any;
      timestamp: string;
    }>;
    processingTime?: number;
    model?: string;
    temperature?: number;
  };
} 