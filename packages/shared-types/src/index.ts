export interface MockOrderContext {
  buyerRegisteredEcommerce?: boolean;
  buyerEcommerceAddress?: {
    full_address: string;
    street: string;
    number?: string;
    block?: string;
    staircase?: string;
    floor?: string;
    door?: string;
    additional_info?: string;
    postal_code: string;
    city: string;
    province?: string;
    country: string;
  } | null;
  giftRecipient?: {
    first_name: string;
    last_name: string;
    phone: string;
  } | null;
}

export interface ProcessConversationJobData {
  conversationId: string;
  orderId: string;
  userId: string;
  conversationType: string;
  context?: MockOrderContext;
}

export interface ProcessResponseJobData {
  conversationId: string;
  orderId: string;
  userId: string;
  userMessage: string;
}
