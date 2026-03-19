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
  order: { externalOrderId: string };
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

export interface AdminAddressUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AdminAddress {
  id: string;
  label: string | null;
  street: string;
  number: string | null;
  block: string | null;
  staircase: string | null;
  floor: string | null;
  door: string | null;
  postalCode: string;
  city: string;
  province: string | null;
  country: string;
  isDefault: boolean;
  user: AdminAddressUser;
}

export type OrdersResponse = PaginatedResponse<AdminOrder>;
export type UsersResponse  = PaginatedResponse<AdminUser>;
export type AddressesResponse = PaginatedResponse<AdminAddress>;

export type AddressSortByColumn =
  | 'name'
  | 'alias'
  | 'postalCode'
  | 'city'
  | 'province'
  | 'country'
  | 'favorite';

export const VALID_ADDRESS_SORT_COLUMNS: AddressSortByColumn[] = [
  'name', 'alias', 'postalCode', 'city', 'province', 'country', 'favorite',
];
export const DEFAULT_ADDRESS_SORT: AddressSortByColumn = 'name';
export const DEFAULT_ADDRESS_DIR: SortDir = 'asc';

export interface AddressesFilters {
  q?: string;
  favorite?: 'true' | 'false';
}

export const ADDRESS_FAVORITE_FILTER_LABELS: Record<string, string> = {
  true: 'Favorita',
  false: 'No favorita',
};

export type SortByColumn = 'ref' | 'store' | 'user' | 'amount' | 'date';
export type SortDir = 'asc' | 'desc';

export const VALID_SORT_COLUMNS: SortByColumn[] = ['ref', 'store', 'user', 'amount', 'date'];
export const DEFAULT_SORT: SortByColumn = 'date';
export const DEFAULT_DIR: SortDir = 'desc';

export type UserSortByColumn = 'name' | 'email' | 'orders' | 'addresses' | 'lastInteraction';
export const VALID_USER_SORT_COLUMNS: UserSortByColumn[] = ['name', 'email', 'orders', 'addresses', 'lastInteraction'];
export const DEFAULT_USER_SORT: UserSortByColumn = 'lastInteraction';
export const DEFAULT_USER_DIR: SortDir = 'desc';

export interface UsersFilters {
  q?: string;
  registered?: 'true' | 'false';
}

export const USER_REGISTERED_FILTER_LABELS: Record<string, string> = {
  true: 'Registrado',
  false: 'No registrado',
};

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

export type StorePlatform = 'WOOCOMMERCE' | 'PRESTASHOP' | 'MAGENTO' | 'SHOPIFY';

export interface SimulateStore {
  id: string;
  name: string;
  url: string;
  platform: StorePlatform;
  ecommerceName: string;
}

export interface StoresResponse {
  data: SimulateStore[];
}

export interface CreateMockOrderPayload {
  store: { name: string; url: string };
  external_order_id?: string;
  buyer: { first_name: string; last_name: string; phone: string; email?: string };
  mode: 'adresles' | 'tradicional';
  address?: {
    full_address: string;
    street: string;
    number?: string;
    floor?: string;
    door?: string;
    postal_code: string;
    city: string;
    province?: string;
    country: string;
  };
  buyer_registered_ecommerce?: boolean;
  buyer_ecommerce_address?: {
    full_address: string;
    street: string;
    number?: string;
    floor?: string;
    postal_code: string;
    city: string;
    province?: string;
    country: string;
  };
  gift_recipient?: { first_name: string; last_name: string; phone: string };
  items?: Array<{ name: string; quantity: number; price: number }>;
  total_amount: number;
  currency: string;
}

export interface StartSimulationResult {
  order_id: string;
  conversation_id: string;
}
