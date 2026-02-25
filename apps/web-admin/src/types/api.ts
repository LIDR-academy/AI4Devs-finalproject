export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_ADDRESS'
  | 'READY_TO_PROCESS'
  | 'COMPLETED'
  | 'CANCELED';

export type OrderMode = 'ADRESLES' | 'TRADITIONAL';

export type PaymentType =
  | 'CREDIT_CARD'
  | 'PAYPAL'
  | 'BIZUM'
  | 'BANK_TRANSFER'
  | 'CASH_ON_DELIVERY'
  | 'OTHER';

export type ConversationStatus =
  | 'ACTIVE'
  | 'WAITING_USER'
  | 'COMPLETED'
  | 'ESCALATED'
  | 'TIMEOUT';

export type ConversationType =
  | 'GET_ADDRESS'
  | 'INFORMATION'
  | 'REGISTER'
  | 'GIFT_NOTIFICATION'
  | 'SUPPORT';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface AdminPhone {
  e164: string;
  formattedNational: string;
  country: string | null;
}

export interface AdminStore {
  id: string;
  name: string;
  url: string;
}

export interface AdminUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  preferredLanguage: string | null;
  isRegistered: boolean;
  registeredAt: string | null;
  lastInteractionAt: string | null;
  createdAt: string;
  phone: AdminPhone | null;
  _count: { orders: number; addresses: number };
}

export interface AdminOrderUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  isRegistered: boolean;
  phone: Pick<AdminPhone, 'e164' | 'formattedNational'> | null;
}

export interface AdminOrder {
  id: string;
  externalOrderId: string;
  externalOrderNumber: string | null;
  totalAmount: string;
  currency: string;
  feePercentage: string;
  feeAmount: string;
  status: OrderStatus;
  orderMode: OrderMode;
  paymentType: PaymentType;
  isGift: boolean;
  webhookReceivedAt: string;
  addressConfirmedAt: string | null;
  store: AdminStore;
  user: AdminOrderUser;
  conversations: Array<{ id: string }>;
}

export interface ConversationMessage {
  messageId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  expiresAt: number;
}

export interface ConversationContext {
  type: ConversationType;
  status: ConversationStatus;
  startedAt: string;
  completedAt: string | null;
  order: { externalOrderNumber: string | null };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface ConversationMessagesResponse {
  conversationId: string;
  conversation: ConversationContext;
  messages: ConversationMessage[];
}

export type OrdersResponse = PaginatedResponse<AdminOrder>;
export type UsersResponse  = PaginatedResponse<AdminUser>;

export type SortByColumn = 'ref' | 'store' | 'user' | 'amount' | 'date';
export type SortDir = 'asc' | 'desc';

export const VALID_SORT_COLUMNS: SortByColumn[] = ['ref', 'store', 'user', 'amount', 'date'];
export const DEFAULT_SORT: SortByColumn = 'date';
export const DEFAULT_DIR: SortDir = 'desc';

export interface OrdersFilters {
  q?: string;
  status?: OrderStatus[];
  mode?: OrderMode[];
  from?: string;
  to?: string;
}

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PENDING_ADDRESS',
  'READY_TO_PROCESS',
  'COMPLETED',
  'CANCELED',
];

export const VALID_ORDER_MODES: OrderMode[] = ['ADRESLES', 'TRADITIONAL'];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pago pendiente',
  PENDING_ADDRESS: 'Dirección pendiente',
  READY_TO_PROCESS: 'Listo para procesar',
  COMPLETED: 'Completado',
  CANCELED: 'Cancelado',
};

export const ORDER_MODE_LABELS: Record<OrderMode, string> = {
  ADRESLES: 'Adresles',
  TRADITIONAL: 'Tradicional',
};
