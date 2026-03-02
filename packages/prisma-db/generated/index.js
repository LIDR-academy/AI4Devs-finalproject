
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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




  const path = require('path')

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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\sergi\\GitHub_Local\\AI4Devs\\AI4Devs-finalproject\\packages\\prisma-db\\generated",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\sergi\\GitHub_Local\\AI4Devs\\AI4Devs-finalproject\\packages\\prisma-db\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../apps/api/.env"
  },
  "relativePath": "..",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// Prisma schema for Adresles - Supabase (PostgreSQL)\n// Data model from Adresles_Business.md Section 3.2-3.3\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"./generated\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// ─── Enums ────────────────────────────────────────────────────────────────────\n\nenum EcommerceStatus {\n  ACTIVE\n  SUSPENDED\n  CANCELLED\n}\n\nenum StorePlatform {\n  WOOCOMMERCE\n  PRESTASHOP\n  MAGENTO\n  SHOPIFY\n}\n\nenum StoreStatus {\n  ACTIVE\n  INACTIVE\n  PENDING_SETUP\n}\n\nenum OrderStatus {\n  PENDING_PAYMENT\n  PENDING_ADDRESS\n  READY_TO_PROCESS\n  COMPLETED\n  CANCELED\n}\n\nenum StatusSource {\n  ADRESLES\n  STORE\n}\n\nenum OrderMode {\n  TRADITIONAL\n  ADRESLES\n}\n\nenum PaymentType {\n  CREDIT_CARD\n  PAYPAL\n  BIZUM\n  BANK_TRANSFER\n  CASH_ON_DELIVERY\n  OTHER\n}\n\nenum RecipientType {\n  BUYER\n  GIFT_RECIPIENT\n}\n\nenum AddressOrigin {\n  STORE_TRADITIONAL\n  STORE_ADRESLES\n  ADRESLES_SAVED\n  USER_CONVERSATION\n}\n\nenum ConfirmedVia {\n  CONVERSATION\n  MANUAL\n  ECOMMERCE_SYNC\n}\n\nenum GiftRecipientStatus {\n  PENDING_CONTACT\n  CONTACTED\n  ADDRESS_RECEIVED\n  COMPLETED\n}\n\nenum ConversationType {\n  INFORMATION\n  GET_ADDRESS\n  REGISTER\n  GIFT_NOTIFICATION\n  SUPPORT\n}\n\nenum ConversationStatus {\n  ACTIVE\n  WAITING_USER\n  COMPLETED\n  ESCALATED\n  TIMEOUT\n}\n\nenum UserType {\n  BUYER\n  RECIPIENT\n}\n\nenum PhoneNumberType {\n  MOBILE\n  FIXED_LINE\n  FIXED_LINE_OR_MOBILE\n  TOLL_FREE\n  PREMIUM_RATE\n  SHARED_COST\n  VOIP\n  PERSONAL_NUMBER\n  PAGER\n  UAN\n  VOICEMAIL\n}\n\n// ─── Models ───────────────────────────────────────────────────────────────────\n\nmodel Phone {\n  id                     String           @id @default(uuid())\n  e164                   String           @unique\n  countryCallingCode     String           @map(\"country_calling_code\")\n  nationalNumber         String           @map(\"national_number\")\n  country                String?\n  numberType             PhoneNumberType? @map(\"number_type\")\n  isValid                Boolean          @map(\"is_valid\")\n  formattedNational      String?          @map(\"formatted_national\")\n  formattedInternational String?          @map(\"formatted_international\")\n  createdAt              DateTime         @default(now()) @map(\"created_at\")\n\n  // Un teléfono puede tener varios User históricos (soft-delete).\n  // Solo uno estará activo (isDeleted = false) en cada momento.\n  users          User[]\n  giftRecipients GiftRecipient[]\n  orderAddresses OrderAddress[]\n}\n\nmodel Ecommerce {\n  id             String          @id @default(uuid())\n  taxId          String          @unique @map(\"tax_id\")\n  legalName      String          @map(\"legal_name\")\n  commercialName String?         @map(\"commercial_name\")\n  email          String\n  phone          String?\n  country        String\n  billingAddress Json?           @map(\"billing_address\")\n  trialEndsAt    DateTime?       @map(\"trial_ends_at\")\n  status         EcommerceStatus @default(ACTIVE)\n  createdAt      DateTime        @default(now()) @map(\"created_at\")\n  updatedAt      DateTime        @updatedAt @map(\"updated_at\")\n\n  stores Store[]\n}\n\nmodel Store {\n  id              String        @id @default(uuid())\n  ecommerceId     String        @map(\"ecommerce_id\")\n  url             String        @unique\n  name            String\n  platform        StorePlatform @default(WOOCOMMERCE)\n  defaultLanguage String        @default(\"es\") @map(\"default_language\")\n  defaultCurrency String        @default(\"EUR\") @map(\"default_currency\")\n  timezone        String        @default(\"Europe/Madrid\")\n  logoUrl         String?       @map(\"logo_url\")\n  status          StoreStatus   @default(ACTIVE)\n  createdAt       DateTime      @default(now()) @map(\"created_at\")\n  updatedAt       DateTime      @updatedAt @map(\"updated_at\")\n\n  ecommerce Ecommerce @relation(fields: [ecommerceId], references: [id], onDelete: Cascade)\n  orders    Order[]\n}\n\nmodel User {\n  id                String    @id @default(uuid())\n  // Nullable para permitir soft-delete: se pone a null al desactivar el usuario\n  // y un nuevo usuario puede asumir el mismo phoneId.\n  phoneId           String?   @unique @map(\"phone_id\")\n  firstName         String?   @map(\"first_name\")\n  lastName          String?   @map(\"last_name\")\n  email             String?\n  preferredLanguage String?   @map(\"preferred_language\")\n  isRegistered      Boolean   @default(false) @map(\"is_registered\")\n  registeredAt      DateTime? @map(\"registered_at\")\n  lastInteractionAt DateTime? @map(\"last_interaction_at\")\n  isDeleted         Boolean   @default(false) @map(\"is_deleted\")\n  deletedAt         DateTime? @map(\"deleted_at\")\n  createdAt         DateTime  @default(now()) @map(\"created_at\")\n  updatedAt         DateTime  @updatedAt @map(\"updated_at\")\n\n  phone          Phone?          @relation(fields: [phoneId], references: [id])\n  orders         Order[]\n  addresses      Address[]\n  giftRecipients GiftRecipient[]\n}\n\nmodel Address {\n  id             String    @id @default(uuid())\n  userId         String    @map(\"user_id\")\n  label          String?\n  fullAddress    String    @map(\"full_address\")\n  street         String\n  number         String?\n  block          String?\n  staircase      String?\n  floor          String?\n  door           String?\n  additionalInfo String?   @map(\"additional_info\")\n  postalCode     String    @map(\"postal_code\")\n  city           String\n  province       String?\n  country        String\n  gmapsPlaceId   String?   @map(\"gmaps_place_id\")\n  latitude       Decimal?  @db.Decimal(10, 8)\n  longitude      Decimal?  @db.Decimal(11, 8)\n  isDefault      Boolean   @default(false) @map(\"is_default\")\n  isDeleted      Boolean   @default(false) @map(\"is_deleted\")\n  deletedAt      DateTime? @map(\"deleted_at\")\n  createdAt      DateTime  @default(now()) @map(\"created_at\")\n  updatedAt      DateTime  @updatedAt @map(\"updated_at\")\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel Order {\n  id                  String        @id @default(uuid())\n  storeId             String        @map(\"store_id\")\n  userId              String        @map(\"user_id\")\n  externalOrderId     String        @map(\"external_order_id\")\n  externalOrderNumber String?       @map(\"external_order_number\")\n  totalAmount         Decimal       @map(\"total_amount\") @db.Decimal(12, 2)\n  currency            String        @default(\"EUR\")\n  feePercentage       Decimal       @map(\"fee_percentage\") @db.Decimal(5, 2)\n  feeAmount           Decimal       @map(\"fee_amount\") @db.Decimal(12, 2)\n  status              OrderStatus   @default(PENDING_ADDRESS)\n  orderMode           OrderMode     @map(\"order_mode\")\n  paymentType         PaymentType   @map(\"payment_type\")\n  isGift              Boolean       @default(false) @map(\"is_gift\")\n  itemsSummary        Json?         @map(\"items_summary\")\n  webhookReceivedAt   DateTime      @map(\"webhook_received_at\")\n  addressConfirmedAt  DateTime?     @map(\"address_confirmed_at\")\n  syncedAt            DateTime?     @map(\"synced_at\")\n  statusSource        StatusSource? @map(\"status_source\")\n  createdAt           DateTime      @default(now()) @map(\"created_at\")\n  updatedAt           DateTime      @updatedAt @map(\"updated_at\")\n\n  store         Store          @relation(fields: [storeId], references: [id], onDelete: Cascade)\n  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  orderAddress  OrderAddress?\n  giftRecipient GiftRecipient?\n  conversations Conversation[]\n\n  @@unique([storeId, externalOrderId])\n  @@index([storeId, status])\n  @@index([userId])\n}\n\nmodel OrderAddress {\n  id               String        @id @default(uuid())\n  orderId          String        @unique @map(\"order_id\")\n  sourceAddressId  String?       @map(\"source_address_id\")\n  recipientType    RecipientType @map(\"recipient_type\")\n  recipientName    String        @map(\"recipient_name\")\n  recipientPhoneId String        @map(\"recipient_phone_id\")\n  fullAddress      String        @map(\"full_address\")\n  street           String\n  number           String?\n  block            String?\n  staircase        String?\n  floor            String?\n  door             String?\n  additionalInfo   String?       @map(\"additional_info\")\n  postalCode       String        @map(\"postal_code\")\n  city             String\n  province         String?\n  country          String\n  gmapsPlaceId     String?       @map(\"gmaps_place_id\")\n  addressOrigin    AddressOrigin @map(\"address_origin\")\n  confirmedAt      DateTime      @map(\"confirmed_at\")\n  confirmedVia     ConfirmedVia  @map(\"confirmed_via\")\n\n  order          Order @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  recipientPhone Phone @relation(fields: [recipientPhoneId], references: [id])\n}\n\nmodel GiftRecipient {\n  id              String              @id @default(uuid())\n  orderId         String              @unique @map(\"order_id\")\n  phoneId         String              @map(\"phone_id\")\n  recipientUserId String              @map(\"recipient_user_id\")\n  firstName       String              @map(\"first_name\")\n  lastName        String              @map(\"last_name\")\n  note            String?\n  status          GiftRecipientStatus @default(PENDING_CONTACT)\n  createdAt       DateTime            @default(now()) @map(\"created_at\")\n  updatedAt       DateTime            @updatedAt @map(\"updated_at\")\n\n  order         Order @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  phone         Phone @relation(fields: [phoneId], references: [id])\n  recipientUser User  @relation(fields: [recipientUserId], references: [id])\n}\n\nmodel Conversation {\n  id                    String             @id @default(uuid())\n  orderId               String             @map(\"order_id\")\n  userId                String             @map(\"user_id\")\n  conversationType      ConversationType   @map(\"conversation_type\")\n  userType              UserType           @map(\"user_type\")\n  status                ConversationStatus @default(ACTIVE)\n  isRegisteredAdresles  Boolean?           @map(\"is_registered_adresles\")\n  isRegisteredEcommerce Boolean?           @map(\"is_registered_ecommerce\")\n  hasAddressAdresles    Boolean?           @map(\"has_address_adresles\")\n  hasAddressEcommerce   Boolean?           @map(\"has_address_ecommerce\")\n  startedAt             DateTime           @default(now()) @map(\"started_at\")\n  completedAt           DateTime?          @map(\"completed_at\")\n\n  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  @@index([orderId])\n  @@index([userId])\n}\n",
  "inlineSchemaHash": "70bd78b8d2952a78c0f423aef0d9a796a3278a60847b70851af8de09b3d015a8",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "../../packages/prisma-db/generated",
    "../packages/prisma-db/generated",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Phone\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"e164\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countryCallingCode\",\"dbName\":\"country_calling_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nationalNumber\",\"dbName\":\"national_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numberType\",\"dbName\":\"number_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PhoneNumberType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isValid\",\"dbName\":\"is_valid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"formattedNational\",\"dbName\":\"formatted_national\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"formattedInternational\",\"dbName\":\"formatted_international\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"PhoneToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"giftRecipients\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"GiftRecipient\",\"relationName\":\"GiftRecipientToPhone\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderAddresses\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderAddress\",\"relationName\":\"OrderAddressToPhone\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Ecommerce\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"taxId\",\"dbName\":\"tax_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"legalName\",\"dbName\":\"legal_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"commercialName\",\"dbName\":\"commercial_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"billingAddress\",\"dbName\":\"billing_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trialEndsAt\",\"dbName\":\"trial_ends_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EcommerceStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"stores\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Store\",\"relationName\":\"EcommerceToStore\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Store\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ecommerceId\",\"dbName\":\"ecommerce_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"platform\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"StorePlatform\",\"default\":\"WOOCOMMERCE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"defaultLanguage\",\"dbName\":\"default_language\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"es\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"defaultCurrency\",\"dbName\":\"default_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"EUR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timezone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"Europe/Madrid\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logoUrl\",\"dbName\":\"logo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"StoreStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"ecommerce\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Ecommerce\",\"relationName\":\"EcommerceToStore\",\"relationFromFields\":[\"ecommerceId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orders\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderToStore\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"User\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phoneId\",\"dbName\":\"phone_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstName\",\"dbName\":\"first_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastName\",\"dbName\":\"last_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferredLanguage\",\"dbName\":\"preferred_language\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isRegistered\",\"dbName\":\"is_registered\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"registeredAt\",\"dbName\":\"registered_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastInteractionAt\",\"dbName\":\"last_interaction_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isDeleted\",\"dbName\":\"is_deleted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deletedAt\",\"dbName\":\"deleted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"phone\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Phone\",\"relationName\":\"PhoneToUser\",\"relationFromFields\":[\"phoneId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orders\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"addresses\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Address\",\"relationName\":\"AddressToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"giftRecipients\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"GiftRecipient\",\"relationName\":\"GiftRecipientToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Address\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"label\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fullAddress\",\"dbName\":\"full_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"street\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"block\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"staircase\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"floor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"door\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"additionalInfo\",\"dbName\":\"additional_info\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"postalCode\",\"dbName\":\"postal_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"province\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gmapsPlaceId\",\"dbName\":\"gmaps_place_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"longitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isDefault\",\"dbName\":\"is_default\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isDeleted\",\"dbName\":\"is_deleted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deletedAt\",\"dbName\":\"deleted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"AddressToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Order\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storeId\",\"dbName\":\"store_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"externalOrderId\",\"dbName\":\"external_order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"externalOrderNumber\",\"dbName\":\"external_order_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalAmount\",\"dbName\":\"total_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"EUR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"feePercentage\",\"dbName\":\"fee_percentage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"feeAmount\",\"dbName\":\"fee_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"OrderStatus\",\"default\":\"PENDING_ADDRESS\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderMode\",\"dbName\":\"order_mode\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderMode\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentType\",\"dbName\":\"payment_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PaymentType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isGift\",\"dbName\":\"is_gift\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemsSummary\",\"dbName\":\"items_summary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"webhookReceivedAt\",\"dbName\":\"webhook_received_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"addressConfirmedAt\",\"dbName\":\"address_confirmed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"syncedAt\",\"dbName\":\"synced_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statusSource\",\"dbName\":\"status_source\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"StatusSource\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"store\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Store\",\"relationName\":\"OrderToStore\",\"relationFromFields\":[\"storeId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"OrderToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderAddress\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderAddress\",\"relationName\":\"OrderToOrderAddress\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"giftRecipient\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"GiftRecipient\",\"relationName\":\"GiftRecipientToOrder\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"ConversationToOrder\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"storeId\",\"externalOrderId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"storeId\",\"externalOrderId\"]}],\"isGenerated\":false},\"OrderAddress\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sourceAddressId\",\"dbName\":\"source_address_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipientType\",\"dbName\":\"recipient_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RecipientType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipientName\",\"dbName\":\"recipient_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipientPhoneId\",\"dbName\":\"recipient_phone_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fullAddress\",\"dbName\":\"full_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"street\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"block\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"staircase\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"floor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"door\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"additionalInfo\",\"dbName\":\"additional_info\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"postalCode\",\"dbName\":\"postal_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"province\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gmapsPlaceId\",\"dbName\":\"gmaps_place_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"addressOrigin\",\"dbName\":\"address_origin\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AddressOrigin\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confirmedAt\",\"dbName\":\"confirmed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confirmedVia\",\"dbName\":\"confirmed_via\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ConfirmedVia\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderToOrderAddress\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipientPhone\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Phone\",\"relationName\":\"OrderAddressToPhone\",\"relationFromFields\":[\"recipientPhoneId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GiftRecipient\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phoneId\",\"dbName\":\"phone_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipientUserId\",\"dbName\":\"recipient_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstName\",\"dbName\":\"first_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastName\",\"dbName\":\"last_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"GiftRecipientStatus\",\"default\":\"PENDING_CONTACT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"GiftRecipientToOrder\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Phone\",\"relationName\":\"GiftRecipientToPhone\",\"relationFromFields\":[\"phoneId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipientUser\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"GiftRecipientToUser\",\"relationFromFields\":[\"recipientUserId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Conversation\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversationType\",\"dbName\":\"conversation_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ConversationType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userType\",\"dbName\":\"user_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ConversationStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isRegisteredAdresles\",\"dbName\":\"is_registered_adresles\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isRegisteredEcommerce\",\"dbName\":\"is_registered_ecommerce\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hasAddressAdresles\",\"dbName\":\"has_address_adresles\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hasAddressEcommerce\",\"dbName\":\"has_address_ecommerce\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startedAt\",\"dbName\":\"started_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completedAt\",\"dbName\":\"completed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"ConversationToOrder\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"EcommerceStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"SUSPENDED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"StorePlatform\":{\"values\":[{\"name\":\"WOOCOMMERCE\",\"dbName\":null},{\"name\":\"PRESTASHOP\",\"dbName\":null},{\"name\":\"MAGENTO\",\"dbName\":null},{\"name\":\"SHOPIFY\",\"dbName\":null}],\"dbName\":null},\"StoreStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null},{\"name\":\"PENDING_SETUP\",\"dbName\":null}],\"dbName\":null},\"OrderStatus\":{\"values\":[{\"name\":\"PENDING_PAYMENT\",\"dbName\":null},{\"name\":\"PENDING_ADDRESS\",\"dbName\":null},{\"name\":\"READY_TO_PROCESS\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"CANCELED\",\"dbName\":null}],\"dbName\":null},\"StatusSource\":{\"values\":[{\"name\":\"ADRESLES\",\"dbName\":null},{\"name\":\"STORE\",\"dbName\":null}],\"dbName\":null},\"OrderMode\":{\"values\":[{\"name\":\"TRADITIONAL\",\"dbName\":null},{\"name\":\"ADRESLES\",\"dbName\":null}],\"dbName\":null},\"PaymentType\":{\"values\":[{\"name\":\"CREDIT_CARD\",\"dbName\":null},{\"name\":\"PAYPAL\",\"dbName\":null},{\"name\":\"BIZUM\",\"dbName\":null},{\"name\":\"BANK_TRANSFER\",\"dbName\":null},{\"name\":\"CASH_ON_DELIVERY\",\"dbName\":null},{\"name\":\"OTHER\",\"dbName\":null}],\"dbName\":null},\"RecipientType\":{\"values\":[{\"name\":\"BUYER\",\"dbName\":null},{\"name\":\"GIFT_RECIPIENT\",\"dbName\":null}],\"dbName\":null},\"AddressOrigin\":{\"values\":[{\"name\":\"STORE_TRADITIONAL\",\"dbName\":null},{\"name\":\"STORE_ADRESLES\",\"dbName\":null},{\"name\":\"ADRESLES_SAVED\",\"dbName\":null},{\"name\":\"USER_CONVERSATION\",\"dbName\":null}],\"dbName\":null},\"ConfirmedVia\":{\"values\":[{\"name\":\"CONVERSATION\",\"dbName\":null},{\"name\":\"MANUAL\",\"dbName\":null},{\"name\":\"ECOMMERCE_SYNC\",\"dbName\":null}],\"dbName\":null},\"GiftRecipientStatus\":{\"values\":[{\"name\":\"PENDING_CONTACT\",\"dbName\":null},{\"name\":\"CONTACTED\",\"dbName\":null},{\"name\":\"ADDRESS_RECEIVED\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null}],\"dbName\":null},\"ConversationType\":{\"values\":[{\"name\":\"INFORMATION\",\"dbName\":null},{\"name\":\"GET_ADDRESS\",\"dbName\":null},{\"name\":\"REGISTER\",\"dbName\":null},{\"name\":\"GIFT_NOTIFICATION\",\"dbName\":null},{\"name\":\"SUPPORT\",\"dbName\":null}],\"dbName\":null},\"ConversationStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"WAITING_USER\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"ESCALATED\",\"dbName\":null},{\"name\":\"TIMEOUT\",\"dbName\":null}],\"dbName\":null},\"UserType\":{\"values\":[{\"name\":\"BUYER\",\"dbName\":null},{\"name\":\"RECIPIENT\",\"dbName\":null}],\"dbName\":null},\"PhoneNumberType\":{\"values\":[{\"name\":\"MOBILE\",\"dbName\":null},{\"name\":\"FIXED_LINE\",\"dbName\":null},{\"name\":\"FIXED_LINE_OR_MOBILE\",\"dbName\":null},{\"name\":\"TOLL_FREE\",\"dbName\":null},{\"name\":\"PREMIUM_RATE\",\"dbName\":null},{\"name\":\"SHARED_COST\",\"dbName\":null},{\"name\":\"VOIP\",\"dbName\":null},{\"name\":\"PERSONAL_NUMBER\",\"dbName\":null},{\"name\":\"PAGER\",\"dbName\":null},{\"name\":\"UAN\",\"dbName\":null},{\"name\":\"VOICEMAIL\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "../../packages/prisma-db/generated/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "../../packages/prisma-db/generated/schema.prisma")
