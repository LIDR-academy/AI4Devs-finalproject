
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.PhoneScalarFieldEnum = {
  id: 'id',
  e164: 'e164',
  countryCallingCode: 'countryCallingCode',
  nationalNumber: 'nationalNumber',
  country: 'country',
  numberType: 'numberType',
  isValid: 'isValid',
  formattedNational: 'formattedNational',
  formattedInternational: 'formattedInternational',
  createdAt: 'createdAt'
};

exports.Prisma.EcommerceScalarFieldEnum = {
  id: 'id',
  taxId: 'taxId',
  legalName: 'legalName',
  commercialName: 'commercialName',
  email: 'email',
  phone: 'phone',
  country: 'country',
  billingAddress: 'billingAddress',
  trialEndsAt: 'trialEndsAt',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StoreScalarFieldEnum = {
  id: 'id',
  ecommerceId: 'ecommerceId',
  url: 'url',
  name: 'name',
  platform: 'platform',
  defaultLanguage: 'defaultLanguage',
  defaultCurrency: 'defaultCurrency',
  timezone: 'timezone',
  logoUrl: 'logoUrl',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  phoneId: 'phoneId',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  preferredLanguage: 'preferredLanguage',
  isRegistered: 'isRegistered',
  registeredAt: 'registeredAt',
  lastInteractionAt: 'lastInteractionAt',
  isDeleted: 'isDeleted',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AddressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  label: 'label',
  fullAddress: 'fullAddress',
  street: 'street',
  number: 'number',
  block: 'block',
  staircase: 'staircase',
  floor: 'floor',
  door: 'door',
  additionalInfo: 'additionalInfo',
  postalCode: 'postalCode',
  city: 'city',
  province: 'province',
  country: 'country',
  gmapsPlaceId: 'gmapsPlaceId',
  latitude: 'latitude',
  longitude: 'longitude',
  isDefault: 'isDefault',
  isDeleted: 'isDeleted',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  storeId: 'storeId',
  userId: 'userId',
  externalOrderId: 'externalOrderId',
  externalOrderNumber: 'externalOrderNumber',
  totalAmount: 'totalAmount',
  currency: 'currency',
  feePercentage: 'feePercentage',
  feeAmount: 'feeAmount',
  status: 'status',
  orderMode: 'orderMode',
  paymentType: 'paymentType',
  isGift: 'isGift',
  itemsSummary: 'itemsSummary',
  webhookReceivedAt: 'webhookReceivedAt',
  addressConfirmedAt: 'addressConfirmedAt',
  syncedAt: 'syncedAt',
  statusSource: 'statusSource',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderAddressScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  sourceAddressId: 'sourceAddressId',
  recipientType: 'recipientType',
  recipientName: 'recipientName',
  recipientPhoneId: 'recipientPhoneId',
  fullAddress: 'fullAddress',
  street: 'street',
  number: 'number',
  block: 'block',
  staircase: 'staircase',
  floor: 'floor',
  door: 'door',
  additionalInfo: 'additionalInfo',
  postalCode: 'postalCode',
  city: 'city',
  province: 'province',
  country: 'country',
  gmapsPlaceId: 'gmapsPlaceId',
  addressOrigin: 'addressOrigin',
  confirmedAt: 'confirmedAt',
  confirmedVia: 'confirmedVia'
};

exports.Prisma.GiftRecipientScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  phoneId: 'phoneId',
  recipientUserId: 'recipientUserId',
  firstName: 'firstName',
  lastName: 'lastName',
  note: 'note',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  userId: 'userId',
  conversationType: 'conversationType',
  userType: 'userType',
  status: 'status',
  isRegisteredAdresles: 'isRegisteredAdresles',
  isRegisteredEcommerce: 'isRegisteredEcommerce',
  hasAddressAdresles: 'hasAddressAdresles',
  hasAddressEcommerce: 'hasAddressEcommerce',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.PhoneNumberType = exports.$Enums.PhoneNumberType = {
  MOBILE: 'MOBILE',
  FIXED_LINE: 'FIXED_LINE',
  FIXED_LINE_OR_MOBILE: 'FIXED_LINE_OR_MOBILE',
  TOLL_FREE: 'TOLL_FREE',
  PREMIUM_RATE: 'PREMIUM_RATE',
  SHARED_COST: 'SHARED_COST',
  VOIP: 'VOIP',
  PERSONAL_NUMBER: 'PERSONAL_NUMBER',
  PAGER: 'PAGER',
  UAN: 'UAN',
  VOICEMAIL: 'VOICEMAIL'
};

exports.EcommerceStatus = exports.$Enums.EcommerceStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED'
};

exports.StorePlatform = exports.$Enums.StorePlatform = {
  WOOCOMMERCE: 'WOOCOMMERCE',
  PRESTASHOP: 'PRESTASHOP',
  MAGENTO: 'MAGENTO',
  SHOPIFY: 'SHOPIFY'
};

exports.StoreStatus = exports.$Enums.StoreStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING_SETUP: 'PENDING_SETUP'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PENDING_ADDRESS: 'PENDING_ADDRESS',
  READY_TO_PROCESS: 'READY_TO_PROCESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED'
};

exports.OrderMode = exports.$Enums.OrderMode = {
  TRADITIONAL: 'TRADITIONAL',
  ADRESLES: 'ADRESLES'
};

exports.PaymentType = exports.$Enums.PaymentType = {
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL',
  BIZUM: 'BIZUM',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  OTHER: 'OTHER'
};

exports.StatusSource = exports.$Enums.StatusSource = {
  ADRESLES: 'ADRESLES',
  STORE: 'STORE'
};

exports.RecipientType = exports.$Enums.RecipientType = {
  BUYER: 'BUYER',
  GIFT_RECIPIENT: 'GIFT_RECIPIENT'
};

exports.AddressOrigin = exports.$Enums.AddressOrigin = {
  STORE_TRADITIONAL: 'STORE_TRADITIONAL',
  STORE_ADRESLES: 'STORE_ADRESLES',
  ADRESLES_SAVED: 'ADRESLES_SAVED',
  USER_CONVERSATION: 'USER_CONVERSATION'
};

exports.ConfirmedVia = exports.$Enums.ConfirmedVia = {
  CONVERSATION: 'CONVERSATION',
  MANUAL: 'MANUAL',
  ECOMMERCE_SYNC: 'ECOMMERCE_SYNC'
};

exports.GiftRecipientStatus = exports.$Enums.GiftRecipientStatus = {
  PENDING_CONTACT: 'PENDING_CONTACT',
  CONTACTED: 'CONTACTED',
  ADDRESS_RECEIVED: 'ADDRESS_RECEIVED',
  COMPLETED: 'COMPLETED'
};

exports.ConversationType = exports.$Enums.ConversationType = {
  INFORMATION: 'INFORMATION',
  GET_ADDRESS: 'GET_ADDRESS',
  REGISTER: 'REGISTER',
  GIFT_NOTIFICATION: 'GIFT_NOTIFICATION',
  SUPPORT: 'SUPPORT'
};

exports.UserType = exports.$Enums.UserType = {
  BUYER: 'BUYER',
  RECIPIENT: 'RECIPIENT'
};

exports.ConversationStatus = exports.$Enums.ConversationStatus = {
  ACTIVE: 'ACTIVE',
  WAITING_USER: 'WAITING_USER',
  COMPLETED: 'COMPLETED',
  ESCALATED: 'ESCALATED',
  TIMEOUT: 'TIMEOUT'
};

exports.Prisma.ModelName = {
  Phone: 'Phone',
  Ecommerce: 'Ecommerce',
  Store: 'Store',
  User: 'User',
  Address: 'Address',
  Order: 'Order',
  OrderAddress: 'OrderAddress',
  GiftRecipient: 'GiftRecipient',
  Conversation: 'Conversation'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
