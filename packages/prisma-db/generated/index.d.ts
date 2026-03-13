
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Phone
 * 
 */
export type Phone = $Result.DefaultSelection<Prisma.$PhonePayload>
/**
 * Model Ecommerce
 * 
 */
export type Ecommerce = $Result.DefaultSelection<Prisma.$EcommercePayload>
/**
 * Model Store
 * 
 */
export type Store = $Result.DefaultSelection<Prisma.$StorePayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Address
 * 
 */
export type Address = $Result.DefaultSelection<Prisma.$AddressPayload>
/**
 * Model Order
 * 
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model OrderAddress
 * 
 */
export type OrderAddress = $Result.DefaultSelection<Prisma.$OrderAddressPayload>
/**
 * Model GiftRecipient
 * 
 */
export type GiftRecipient = $Result.DefaultSelection<Prisma.$GiftRecipientPayload>
/**
 * Model Conversation
 * 
 */
export type Conversation = $Result.DefaultSelection<Prisma.$ConversationPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const PhoneNumberType: {
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

export type PhoneNumberType = (typeof PhoneNumberType)[keyof typeof PhoneNumberType]


export const EcommerceStatus: {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED'
};

export type EcommerceStatus = (typeof EcommerceStatus)[keyof typeof EcommerceStatus]


export const StorePlatform: {
  WOOCOMMERCE: 'WOOCOMMERCE',
  PRESTASHOP: 'PRESTASHOP',
  MAGENTO: 'MAGENTO',
  SHOPIFY: 'SHOPIFY'
};

export type StorePlatform = (typeof StorePlatform)[keyof typeof StorePlatform]


export const StoreStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING_SETUP: 'PENDING_SETUP'
};

export type StoreStatus = (typeof StoreStatus)[keyof typeof StoreStatus]


export const OrderStatus: {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PENDING_ADDRESS: 'PENDING_ADDRESS',
  READY_TO_PROCESS: 'READY_TO_PROCESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED'
};

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]


export const OrderMode: {
  TRADITIONAL: 'TRADITIONAL',
  ADRESLES: 'ADRESLES'
};

export type OrderMode = (typeof OrderMode)[keyof typeof OrderMode]


export const PaymentType: {
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL',
  BIZUM: 'BIZUM',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  OTHER: 'OTHER'
};

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType]


export const StatusSource: {
  ADRESLES: 'ADRESLES',
  STORE: 'STORE'
};

export type StatusSource = (typeof StatusSource)[keyof typeof StatusSource]


export const RecipientType: {
  BUYER: 'BUYER',
  GIFT_RECIPIENT: 'GIFT_RECIPIENT'
};

export type RecipientType = (typeof RecipientType)[keyof typeof RecipientType]


export const AddressOrigin: {
  STORE_TRADITIONAL: 'STORE_TRADITIONAL',
  STORE_ADRESLES: 'STORE_ADRESLES',
  ADRESLES_SAVED: 'ADRESLES_SAVED',
  USER_CONVERSATION: 'USER_CONVERSATION'
};

export type AddressOrigin = (typeof AddressOrigin)[keyof typeof AddressOrigin]


export const ConfirmedVia: {
  CONVERSATION: 'CONVERSATION',
  MANUAL: 'MANUAL',
  ECOMMERCE_SYNC: 'ECOMMERCE_SYNC'
};

export type ConfirmedVia = (typeof ConfirmedVia)[keyof typeof ConfirmedVia]


export const GiftRecipientStatus: {
  PENDING_CONTACT: 'PENDING_CONTACT',
  CONTACTED: 'CONTACTED',
  ADDRESS_RECEIVED: 'ADDRESS_RECEIVED',
  COMPLETED: 'COMPLETED'
};

export type GiftRecipientStatus = (typeof GiftRecipientStatus)[keyof typeof GiftRecipientStatus]


export const ConversationType: {
  INFORMATION: 'INFORMATION',
  GET_ADDRESS: 'GET_ADDRESS',
  REGISTER: 'REGISTER',
  GIFT_NOTIFICATION: 'GIFT_NOTIFICATION',
  SUPPORT: 'SUPPORT'
};

export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType]


export const UserType: {
  BUYER: 'BUYER',
  RECIPIENT: 'RECIPIENT'
};

export type UserType = (typeof UserType)[keyof typeof UserType]


export const ConversationStatus: {
  ACTIVE: 'ACTIVE',
  WAITING_USER: 'WAITING_USER',
  COMPLETED: 'COMPLETED',
  ESCALATED: 'ESCALATED',
  TIMEOUT: 'TIMEOUT'
};

export type ConversationStatus = (typeof ConversationStatus)[keyof typeof ConversationStatus]

}

export type PhoneNumberType = $Enums.PhoneNumberType

export const PhoneNumberType: typeof $Enums.PhoneNumberType

export type EcommerceStatus = $Enums.EcommerceStatus

export const EcommerceStatus: typeof $Enums.EcommerceStatus

export type StorePlatform = $Enums.StorePlatform

export const StorePlatform: typeof $Enums.StorePlatform

export type StoreStatus = $Enums.StoreStatus

export const StoreStatus: typeof $Enums.StoreStatus

export type OrderStatus = $Enums.OrderStatus

export const OrderStatus: typeof $Enums.OrderStatus

export type OrderMode = $Enums.OrderMode

export const OrderMode: typeof $Enums.OrderMode

export type PaymentType = $Enums.PaymentType

export const PaymentType: typeof $Enums.PaymentType

export type StatusSource = $Enums.StatusSource

export const StatusSource: typeof $Enums.StatusSource

export type RecipientType = $Enums.RecipientType

export const RecipientType: typeof $Enums.RecipientType

export type AddressOrigin = $Enums.AddressOrigin

export const AddressOrigin: typeof $Enums.AddressOrigin

export type ConfirmedVia = $Enums.ConfirmedVia

export const ConfirmedVia: typeof $Enums.ConfirmedVia

export type GiftRecipientStatus = $Enums.GiftRecipientStatus

export const GiftRecipientStatus: typeof $Enums.GiftRecipientStatus

export type ConversationType = $Enums.ConversationType

export const ConversationType: typeof $Enums.ConversationType

export type UserType = $Enums.UserType

export const UserType: typeof $Enums.UserType

export type ConversationStatus = $Enums.ConversationStatus

export const ConversationStatus: typeof $Enums.ConversationStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Phones
 * const phones = await prisma.phone.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Phones
   * const phones = await prisma.phone.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.phone`: Exposes CRUD operations for the **Phone** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Phones
    * const phones = await prisma.phone.findMany()
    * ```
    */
  get phone(): Prisma.PhoneDelegate<ExtArgs>;

  /**
   * `prisma.ecommerce`: Exposes CRUD operations for the **Ecommerce** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ecommerces
    * const ecommerces = await prisma.ecommerce.findMany()
    * ```
    */
  get ecommerce(): Prisma.EcommerceDelegate<ExtArgs>;

  /**
   * `prisma.store`: Exposes CRUD operations for the **Store** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Stores
    * const stores = await prisma.store.findMany()
    * ```
    */
  get store(): Prisma.StoreDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.address`: Exposes CRUD operations for the **Address** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Addresses
    * const addresses = await prisma.address.findMany()
    * ```
    */
  get address(): Prisma.AddressDelegate<ExtArgs>;

  /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs>;

  /**
   * `prisma.orderAddress`: Exposes CRUD operations for the **OrderAddress** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrderAddresses
    * const orderAddresses = await prisma.orderAddress.findMany()
    * ```
    */
  get orderAddress(): Prisma.OrderAddressDelegate<ExtArgs>;

  /**
   * `prisma.giftRecipient`: Exposes CRUD operations for the **GiftRecipient** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GiftRecipients
    * const giftRecipients = await prisma.giftRecipient.findMany()
    * ```
    */
  get giftRecipient(): Prisma.GiftRecipientDelegate<ExtArgs>;

  /**
   * `prisma.conversation`: Exposes CRUD operations for the **Conversation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Conversations
    * const conversations = await prisma.conversation.findMany()
    * ```
    */
  get conversation(): Prisma.ConversationDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "phone" | "ecommerce" | "store" | "user" | "address" | "order" | "orderAddress" | "giftRecipient" | "conversation"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Phone: {
        payload: Prisma.$PhonePayload<ExtArgs>
        fields: Prisma.PhoneFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PhoneFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PhoneFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload>
          }
          findFirst: {
            args: Prisma.PhoneFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PhoneFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload>
          }
          findMany: {
            args: Prisma.PhoneFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload>[]
          }
          create: {
            args: Prisma.PhoneCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload>
          }
          createMany: {
            args: Prisma.PhoneCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PhoneCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload>[]
          }
          delete: {
            args: Prisma.PhoneDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload>
          }
          update: {
            args: Prisma.PhoneUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload>
          }
          deleteMany: {
            args: Prisma.PhoneDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PhoneUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PhoneUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhonePayload>
          }
          aggregate: {
            args: Prisma.PhoneAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePhone>
          }
          groupBy: {
            args: Prisma.PhoneGroupByArgs<ExtArgs>
            result: $Utils.Optional<PhoneGroupByOutputType>[]
          }
          count: {
            args: Prisma.PhoneCountArgs<ExtArgs>
            result: $Utils.Optional<PhoneCountAggregateOutputType> | number
          }
        }
      }
      Ecommerce: {
        payload: Prisma.$EcommercePayload<ExtArgs>
        fields: Prisma.EcommerceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EcommerceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EcommerceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload>
          }
          findFirst: {
            args: Prisma.EcommerceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EcommerceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload>
          }
          findMany: {
            args: Prisma.EcommerceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload>[]
          }
          create: {
            args: Prisma.EcommerceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload>
          }
          createMany: {
            args: Prisma.EcommerceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EcommerceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload>[]
          }
          delete: {
            args: Prisma.EcommerceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload>
          }
          update: {
            args: Prisma.EcommerceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload>
          }
          deleteMany: {
            args: Prisma.EcommerceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EcommerceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EcommerceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EcommercePayload>
          }
          aggregate: {
            args: Prisma.EcommerceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEcommerce>
          }
          groupBy: {
            args: Prisma.EcommerceGroupByArgs<ExtArgs>
            result: $Utils.Optional<EcommerceGroupByOutputType>[]
          }
          count: {
            args: Prisma.EcommerceCountArgs<ExtArgs>
            result: $Utils.Optional<EcommerceCountAggregateOutputType> | number
          }
        }
      }
      Store: {
        payload: Prisma.$StorePayload<ExtArgs>
        fields: Prisma.StoreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StoreFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StoreFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload>
          }
          findFirst: {
            args: Prisma.StoreFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StoreFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload>
          }
          findMany: {
            args: Prisma.StoreFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload>[]
          }
          create: {
            args: Prisma.StoreCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload>
          }
          createMany: {
            args: Prisma.StoreCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StoreCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload>[]
          }
          delete: {
            args: Prisma.StoreDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload>
          }
          update: {
            args: Prisma.StoreUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload>
          }
          deleteMany: {
            args: Prisma.StoreDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StoreUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StoreUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StorePayload>
          }
          aggregate: {
            args: Prisma.StoreAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStore>
          }
          groupBy: {
            args: Prisma.StoreGroupByArgs<ExtArgs>
            result: $Utils.Optional<StoreGroupByOutputType>[]
          }
          count: {
            args: Prisma.StoreCountArgs<ExtArgs>
            result: $Utils.Optional<StoreCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Address: {
        payload: Prisma.$AddressPayload<ExtArgs>
        fields: Prisma.AddressFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AddressFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AddressFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload>
          }
          findFirst: {
            args: Prisma.AddressFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AddressFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload>
          }
          findMany: {
            args: Prisma.AddressFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload>[]
          }
          create: {
            args: Prisma.AddressCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload>
          }
          createMany: {
            args: Prisma.AddressCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AddressCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload>[]
          }
          delete: {
            args: Prisma.AddressDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload>
          }
          update: {
            args: Prisma.AddressUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload>
          }
          deleteMany: {
            args: Prisma.AddressDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AddressUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AddressUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressPayload>
          }
          aggregate: {
            args: Prisma.AddressAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAddress>
          }
          groupBy: {
            args: Prisma.AddressGroupByArgs<ExtArgs>
            result: $Utils.Optional<AddressGroupByOutputType>[]
          }
          count: {
            args: Prisma.AddressCountArgs<ExtArgs>
            result: $Utils.Optional<AddressCountAggregateOutputType> | number
          }
        }
      }
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      OrderAddress: {
        payload: Prisma.$OrderAddressPayload<ExtArgs>
        fields: Prisma.OrderAddressFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderAddressFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderAddressFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload>
          }
          findFirst: {
            args: Prisma.OrderAddressFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderAddressFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload>
          }
          findMany: {
            args: Prisma.OrderAddressFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload>[]
          }
          create: {
            args: Prisma.OrderAddressCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload>
          }
          createMany: {
            args: Prisma.OrderAddressCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderAddressCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload>[]
          }
          delete: {
            args: Prisma.OrderAddressDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload>
          }
          update: {
            args: Prisma.OrderAddressUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload>
          }
          deleteMany: {
            args: Prisma.OrderAddressDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderAddressUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrderAddressUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderAddressPayload>
          }
          aggregate: {
            args: Prisma.OrderAddressAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrderAddress>
          }
          groupBy: {
            args: Prisma.OrderAddressGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderAddressGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderAddressCountArgs<ExtArgs>
            result: $Utils.Optional<OrderAddressCountAggregateOutputType> | number
          }
        }
      }
      GiftRecipient: {
        payload: Prisma.$GiftRecipientPayload<ExtArgs>
        fields: Prisma.GiftRecipientFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GiftRecipientFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GiftRecipientFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload>
          }
          findFirst: {
            args: Prisma.GiftRecipientFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GiftRecipientFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload>
          }
          findMany: {
            args: Prisma.GiftRecipientFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload>[]
          }
          create: {
            args: Prisma.GiftRecipientCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload>
          }
          createMany: {
            args: Prisma.GiftRecipientCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GiftRecipientCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload>[]
          }
          delete: {
            args: Prisma.GiftRecipientDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload>
          }
          update: {
            args: Prisma.GiftRecipientUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload>
          }
          deleteMany: {
            args: Prisma.GiftRecipientDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GiftRecipientUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GiftRecipientUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GiftRecipientPayload>
          }
          aggregate: {
            args: Prisma.GiftRecipientAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGiftRecipient>
          }
          groupBy: {
            args: Prisma.GiftRecipientGroupByArgs<ExtArgs>
            result: $Utils.Optional<GiftRecipientGroupByOutputType>[]
          }
          count: {
            args: Prisma.GiftRecipientCountArgs<ExtArgs>
            result: $Utils.Optional<GiftRecipientCountAggregateOutputType> | number
          }
        }
      }
      Conversation: {
        payload: Prisma.$ConversationPayload<ExtArgs>
        fields: Prisma.ConversationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConversationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConversationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          findFirst: {
            args: Prisma.ConversationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConversationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          findMany: {
            args: Prisma.ConversationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>[]
          }
          create: {
            args: Prisma.ConversationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          createMany: {
            args: Prisma.ConversationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConversationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>[]
          }
          delete: {
            args: Prisma.ConversationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          update: {
            args: Prisma.ConversationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          deleteMany: {
            args: Prisma.ConversationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConversationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConversationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          aggregate: {
            args: Prisma.ConversationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConversation>
          }
          groupBy: {
            args: Prisma.ConversationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConversationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConversationCountArgs<ExtArgs>
            result: $Utils.Optional<ConversationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type PhoneCountOutputType
   */

  export type PhoneCountOutputType = {
    users: number
    giftRecipients: number
    orderAddresses: number
  }

  export type PhoneCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | PhoneCountOutputTypeCountUsersArgs
    giftRecipients?: boolean | PhoneCountOutputTypeCountGiftRecipientsArgs
    orderAddresses?: boolean | PhoneCountOutputTypeCountOrderAddressesArgs
  }

  // Custom InputTypes
  /**
   * PhoneCountOutputType without action
   */
  export type PhoneCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneCountOutputType
     */
    select?: PhoneCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PhoneCountOutputType without action
   */
  export type PhoneCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * PhoneCountOutputType without action
   */
  export type PhoneCountOutputTypeCountGiftRecipientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GiftRecipientWhereInput
  }

  /**
   * PhoneCountOutputType without action
   */
  export type PhoneCountOutputTypeCountOrderAddressesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderAddressWhereInput
  }


  /**
   * Count Type EcommerceCountOutputType
   */

  export type EcommerceCountOutputType = {
    stores: number
  }

  export type EcommerceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stores?: boolean | EcommerceCountOutputTypeCountStoresArgs
  }

  // Custom InputTypes
  /**
   * EcommerceCountOutputType without action
   */
  export type EcommerceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EcommerceCountOutputType
     */
    select?: EcommerceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EcommerceCountOutputType without action
   */
  export type EcommerceCountOutputTypeCountStoresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StoreWhereInput
  }


  /**
   * Count Type StoreCountOutputType
   */

  export type StoreCountOutputType = {
    orders: number
  }

  export type StoreCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | StoreCountOutputTypeCountOrdersArgs
  }

  // Custom InputTypes
  /**
   * StoreCountOutputType without action
   */
  export type StoreCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreCountOutputType
     */
    select?: StoreCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * StoreCountOutputType without action
   */
  export type StoreCountOutputTypeCountOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    orders: number
    addresses: number
    giftRecipients: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | UserCountOutputTypeCountOrdersArgs
    addresses?: boolean | UserCountOutputTypeCountAddressesArgs
    giftRecipients?: boolean | UserCountOutputTypeCountGiftRecipientsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAddressesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AddressWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountGiftRecipientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GiftRecipientWhereInput
  }


  /**
   * Count Type OrderCountOutputType
   */

  export type OrderCountOutputType = {
    conversations: number
  }

  export type OrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversations?: boolean | OrderCountOutputTypeCountConversationsArgs
  }

  // Custom InputTypes
  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: OrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountConversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Phone
   */

  export type AggregatePhone = {
    _count: PhoneCountAggregateOutputType | null
    _min: PhoneMinAggregateOutputType | null
    _max: PhoneMaxAggregateOutputType | null
  }

  export type PhoneMinAggregateOutputType = {
    id: string | null
    e164: string | null
    countryCallingCode: string | null
    nationalNumber: string | null
    country: string | null
    numberType: $Enums.PhoneNumberType | null
    isValid: boolean | null
    formattedNational: string | null
    formattedInternational: string | null
    createdAt: Date | null
  }

  export type PhoneMaxAggregateOutputType = {
    id: string | null
    e164: string | null
    countryCallingCode: string | null
    nationalNumber: string | null
    country: string | null
    numberType: $Enums.PhoneNumberType | null
    isValid: boolean | null
    formattedNational: string | null
    formattedInternational: string | null
    createdAt: Date | null
  }

  export type PhoneCountAggregateOutputType = {
    id: number
    e164: number
    countryCallingCode: number
    nationalNumber: number
    country: number
    numberType: number
    isValid: number
    formattedNational: number
    formattedInternational: number
    createdAt: number
    _all: number
  }


  export type PhoneMinAggregateInputType = {
    id?: true
    e164?: true
    countryCallingCode?: true
    nationalNumber?: true
    country?: true
    numberType?: true
    isValid?: true
    formattedNational?: true
    formattedInternational?: true
    createdAt?: true
  }

  export type PhoneMaxAggregateInputType = {
    id?: true
    e164?: true
    countryCallingCode?: true
    nationalNumber?: true
    country?: true
    numberType?: true
    isValid?: true
    formattedNational?: true
    formattedInternational?: true
    createdAt?: true
  }

  export type PhoneCountAggregateInputType = {
    id?: true
    e164?: true
    countryCallingCode?: true
    nationalNumber?: true
    country?: true
    numberType?: true
    isValid?: true
    formattedNational?: true
    formattedInternational?: true
    createdAt?: true
    _all?: true
  }

  export type PhoneAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Phone to aggregate.
     */
    where?: PhoneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Phones to fetch.
     */
    orderBy?: PhoneOrderByWithRelationInput | PhoneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PhoneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Phones from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Phones.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Phones
    **/
    _count?: true | PhoneCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PhoneMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PhoneMaxAggregateInputType
  }

  export type GetPhoneAggregateType<T extends PhoneAggregateArgs> = {
        [P in keyof T & keyof AggregatePhone]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePhone[P]>
      : GetScalarType<T[P], AggregatePhone[P]>
  }




  export type PhoneGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PhoneWhereInput
    orderBy?: PhoneOrderByWithAggregationInput | PhoneOrderByWithAggregationInput[]
    by: PhoneScalarFieldEnum[] | PhoneScalarFieldEnum
    having?: PhoneScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PhoneCountAggregateInputType | true
    _min?: PhoneMinAggregateInputType
    _max?: PhoneMaxAggregateInputType
  }

  export type PhoneGroupByOutputType = {
    id: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country: string | null
    numberType: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational: string | null
    formattedInternational: string | null
    createdAt: Date
    _count: PhoneCountAggregateOutputType | null
    _min: PhoneMinAggregateOutputType | null
    _max: PhoneMaxAggregateOutputType | null
  }

  type GetPhoneGroupByPayload<T extends PhoneGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PhoneGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PhoneGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PhoneGroupByOutputType[P]>
            : GetScalarType<T[P], PhoneGroupByOutputType[P]>
        }
      >
    >


  export type PhoneSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    e164?: boolean
    countryCallingCode?: boolean
    nationalNumber?: boolean
    country?: boolean
    numberType?: boolean
    isValid?: boolean
    formattedNational?: boolean
    formattedInternational?: boolean
    createdAt?: boolean
    users?: boolean | Phone$usersArgs<ExtArgs>
    giftRecipients?: boolean | Phone$giftRecipientsArgs<ExtArgs>
    orderAddresses?: boolean | Phone$orderAddressesArgs<ExtArgs>
    _count?: boolean | PhoneCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["phone"]>

  export type PhoneSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    e164?: boolean
    countryCallingCode?: boolean
    nationalNumber?: boolean
    country?: boolean
    numberType?: boolean
    isValid?: boolean
    formattedNational?: boolean
    formattedInternational?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["phone"]>

  export type PhoneSelectScalar = {
    id?: boolean
    e164?: boolean
    countryCallingCode?: boolean
    nationalNumber?: boolean
    country?: boolean
    numberType?: boolean
    isValid?: boolean
    formattedNational?: boolean
    formattedInternational?: boolean
    createdAt?: boolean
  }

  export type PhoneInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Phone$usersArgs<ExtArgs>
    giftRecipients?: boolean | Phone$giftRecipientsArgs<ExtArgs>
    orderAddresses?: boolean | Phone$orderAddressesArgs<ExtArgs>
    _count?: boolean | PhoneCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PhoneIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PhonePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Phone"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
      giftRecipients: Prisma.$GiftRecipientPayload<ExtArgs>[]
      orderAddresses: Prisma.$OrderAddressPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      e164: string
      countryCallingCode: string
      nationalNumber: string
      country: string | null
      numberType: $Enums.PhoneNumberType | null
      isValid: boolean
      formattedNational: string | null
      formattedInternational: string | null
      createdAt: Date
    }, ExtArgs["result"]["phone"]>
    composites: {}
  }

  type PhoneGetPayload<S extends boolean | null | undefined | PhoneDefaultArgs> = $Result.GetResult<Prisma.$PhonePayload, S>

  type PhoneCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PhoneFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PhoneCountAggregateInputType | true
    }

  export interface PhoneDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Phone'], meta: { name: 'Phone' } }
    /**
     * Find zero or one Phone that matches the filter.
     * @param {PhoneFindUniqueArgs} args - Arguments to find a Phone
     * @example
     * // Get one Phone
     * const phone = await prisma.phone.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PhoneFindUniqueArgs>(args: SelectSubset<T, PhoneFindUniqueArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Phone that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PhoneFindUniqueOrThrowArgs} args - Arguments to find a Phone
     * @example
     * // Get one Phone
     * const phone = await prisma.phone.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PhoneFindUniqueOrThrowArgs>(args: SelectSubset<T, PhoneFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Phone that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneFindFirstArgs} args - Arguments to find a Phone
     * @example
     * // Get one Phone
     * const phone = await prisma.phone.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PhoneFindFirstArgs>(args?: SelectSubset<T, PhoneFindFirstArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Phone that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneFindFirstOrThrowArgs} args - Arguments to find a Phone
     * @example
     * // Get one Phone
     * const phone = await prisma.phone.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PhoneFindFirstOrThrowArgs>(args?: SelectSubset<T, PhoneFindFirstOrThrowArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Phones that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Phones
     * const phones = await prisma.phone.findMany()
     * 
     * // Get first 10 Phones
     * const phones = await prisma.phone.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const phoneWithIdOnly = await prisma.phone.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PhoneFindManyArgs>(args?: SelectSubset<T, PhoneFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Phone.
     * @param {PhoneCreateArgs} args - Arguments to create a Phone.
     * @example
     * // Create one Phone
     * const Phone = await prisma.phone.create({
     *   data: {
     *     // ... data to create a Phone
     *   }
     * })
     * 
     */
    create<T extends PhoneCreateArgs>(args: SelectSubset<T, PhoneCreateArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Phones.
     * @param {PhoneCreateManyArgs} args - Arguments to create many Phones.
     * @example
     * // Create many Phones
     * const phone = await prisma.phone.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PhoneCreateManyArgs>(args?: SelectSubset<T, PhoneCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Phones and returns the data saved in the database.
     * @param {PhoneCreateManyAndReturnArgs} args - Arguments to create many Phones.
     * @example
     * // Create many Phones
     * const phone = await prisma.phone.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Phones and only return the `id`
     * const phoneWithIdOnly = await prisma.phone.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PhoneCreateManyAndReturnArgs>(args?: SelectSubset<T, PhoneCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Phone.
     * @param {PhoneDeleteArgs} args - Arguments to delete one Phone.
     * @example
     * // Delete one Phone
     * const Phone = await prisma.phone.delete({
     *   where: {
     *     // ... filter to delete one Phone
     *   }
     * })
     * 
     */
    delete<T extends PhoneDeleteArgs>(args: SelectSubset<T, PhoneDeleteArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Phone.
     * @param {PhoneUpdateArgs} args - Arguments to update one Phone.
     * @example
     * // Update one Phone
     * const phone = await prisma.phone.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PhoneUpdateArgs>(args: SelectSubset<T, PhoneUpdateArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Phones.
     * @param {PhoneDeleteManyArgs} args - Arguments to filter Phones to delete.
     * @example
     * // Delete a few Phones
     * const { count } = await prisma.phone.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PhoneDeleteManyArgs>(args?: SelectSubset<T, PhoneDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Phones.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Phones
     * const phone = await prisma.phone.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PhoneUpdateManyArgs>(args: SelectSubset<T, PhoneUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Phone.
     * @param {PhoneUpsertArgs} args - Arguments to update or create a Phone.
     * @example
     * // Update or create a Phone
     * const phone = await prisma.phone.upsert({
     *   create: {
     *     // ... data to create a Phone
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Phone we want to update
     *   }
     * })
     */
    upsert<T extends PhoneUpsertArgs>(args: SelectSubset<T, PhoneUpsertArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Phones.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneCountArgs} args - Arguments to filter Phones to count.
     * @example
     * // Count the number of Phones
     * const count = await prisma.phone.count({
     *   where: {
     *     // ... the filter for the Phones we want to count
     *   }
     * })
    **/
    count<T extends PhoneCountArgs>(
      args?: Subset<T, PhoneCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PhoneCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Phone.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PhoneAggregateArgs>(args: Subset<T, PhoneAggregateArgs>): Prisma.PrismaPromise<GetPhoneAggregateType<T>>

    /**
     * Group by Phone.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PhoneGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PhoneGroupByArgs['orderBy'] }
        : { orderBy?: PhoneGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PhoneGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPhoneGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Phone model
   */
  readonly fields: PhoneFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Phone.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PhoneClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Phone$usersArgs<ExtArgs> = {}>(args?: Subset<T, Phone$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany"> | Null>
    giftRecipients<T extends Phone$giftRecipientsArgs<ExtArgs> = {}>(args?: Subset<T, Phone$giftRecipientsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "findMany"> | Null>
    orderAddresses<T extends Phone$orderAddressesArgs<ExtArgs> = {}>(args?: Subset<T, Phone$orderAddressesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Phone model
   */ 
  interface PhoneFieldRefs {
    readonly id: FieldRef<"Phone", 'String'>
    readonly e164: FieldRef<"Phone", 'String'>
    readonly countryCallingCode: FieldRef<"Phone", 'String'>
    readonly nationalNumber: FieldRef<"Phone", 'String'>
    readonly country: FieldRef<"Phone", 'String'>
    readonly numberType: FieldRef<"Phone", 'PhoneNumberType'>
    readonly isValid: FieldRef<"Phone", 'Boolean'>
    readonly formattedNational: FieldRef<"Phone", 'String'>
    readonly formattedInternational: FieldRef<"Phone", 'String'>
    readonly createdAt: FieldRef<"Phone", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Phone findUnique
   */
  export type PhoneFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    /**
     * Filter, which Phone to fetch.
     */
    where: PhoneWhereUniqueInput
  }

  /**
   * Phone findUniqueOrThrow
   */
  export type PhoneFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    /**
     * Filter, which Phone to fetch.
     */
    where: PhoneWhereUniqueInput
  }

  /**
   * Phone findFirst
   */
  export type PhoneFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    /**
     * Filter, which Phone to fetch.
     */
    where?: PhoneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Phones to fetch.
     */
    orderBy?: PhoneOrderByWithRelationInput | PhoneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Phones.
     */
    cursor?: PhoneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Phones from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Phones.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Phones.
     */
    distinct?: PhoneScalarFieldEnum | PhoneScalarFieldEnum[]
  }

  /**
   * Phone findFirstOrThrow
   */
  export type PhoneFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    /**
     * Filter, which Phone to fetch.
     */
    where?: PhoneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Phones to fetch.
     */
    orderBy?: PhoneOrderByWithRelationInput | PhoneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Phones.
     */
    cursor?: PhoneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Phones from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Phones.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Phones.
     */
    distinct?: PhoneScalarFieldEnum | PhoneScalarFieldEnum[]
  }

  /**
   * Phone findMany
   */
  export type PhoneFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    /**
     * Filter, which Phones to fetch.
     */
    where?: PhoneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Phones to fetch.
     */
    orderBy?: PhoneOrderByWithRelationInput | PhoneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Phones.
     */
    cursor?: PhoneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Phones from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Phones.
     */
    skip?: number
    distinct?: PhoneScalarFieldEnum | PhoneScalarFieldEnum[]
  }

  /**
   * Phone create
   */
  export type PhoneCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    /**
     * The data needed to create a Phone.
     */
    data: XOR<PhoneCreateInput, PhoneUncheckedCreateInput>
  }

  /**
   * Phone createMany
   */
  export type PhoneCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Phones.
     */
    data: PhoneCreateManyInput | PhoneCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Phone createManyAndReturn
   */
  export type PhoneCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Phones.
     */
    data: PhoneCreateManyInput | PhoneCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Phone update
   */
  export type PhoneUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    /**
     * The data needed to update a Phone.
     */
    data: XOR<PhoneUpdateInput, PhoneUncheckedUpdateInput>
    /**
     * Choose, which Phone to update.
     */
    where: PhoneWhereUniqueInput
  }

  /**
   * Phone updateMany
   */
  export type PhoneUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Phones.
     */
    data: XOR<PhoneUpdateManyMutationInput, PhoneUncheckedUpdateManyInput>
    /**
     * Filter which Phones to update
     */
    where?: PhoneWhereInput
  }

  /**
   * Phone upsert
   */
  export type PhoneUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    /**
     * The filter to search for the Phone to update in case it exists.
     */
    where: PhoneWhereUniqueInput
    /**
     * In case the Phone found by the `where` argument doesn't exist, create a new Phone with this data.
     */
    create: XOR<PhoneCreateInput, PhoneUncheckedCreateInput>
    /**
     * In case the Phone was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PhoneUpdateInput, PhoneUncheckedUpdateInput>
  }

  /**
   * Phone delete
   */
  export type PhoneDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    /**
     * Filter which Phone to delete.
     */
    where: PhoneWhereUniqueInput
  }

  /**
   * Phone deleteMany
   */
  export type PhoneDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Phones to delete
     */
    where?: PhoneWhereInput
  }

  /**
   * Phone.users
   */
  export type Phone$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Phone.giftRecipients
   */
  export type Phone$giftRecipientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    where?: GiftRecipientWhereInput
    orderBy?: GiftRecipientOrderByWithRelationInput | GiftRecipientOrderByWithRelationInput[]
    cursor?: GiftRecipientWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GiftRecipientScalarFieldEnum | GiftRecipientScalarFieldEnum[]
  }

  /**
   * Phone.orderAddresses
   */
  export type Phone$orderAddressesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    where?: OrderAddressWhereInput
    orderBy?: OrderAddressOrderByWithRelationInput | OrderAddressOrderByWithRelationInput[]
    cursor?: OrderAddressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderAddressScalarFieldEnum | OrderAddressScalarFieldEnum[]
  }

  /**
   * Phone without action
   */
  export type PhoneDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
  }


  /**
   * Model Ecommerce
   */

  export type AggregateEcommerce = {
    _count: EcommerceCountAggregateOutputType | null
    _min: EcommerceMinAggregateOutputType | null
    _max: EcommerceMaxAggregateOutputType | null
  }

  export type EcommerceMinAggregateOutputType = {
    id: string | null
    taxId: string | null
    legalName: string | null
    commercialName: string | null
    email: string | null
    phone: string | null
    country: string | null
    trialEndsAt: Date | null
    status: $Enums.EcommerceStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EcommerceMaxAggregateOutputType = {
    id: string | null
    taxId: string | null
    legalName: string | null
    commercialName: string | null
    email: string | null
    phone: string | null
    country: string | null
    trialEndsAt: Date | null
    status: $Enums.EcommerceStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EcommerceCountAggregateOutputType = {
    id: number
    taxId: number
    legalName: number
    commercialName: number
    email: number
    phone: number
    country: number
    billingAddress: number
    trialEndsAt: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EcommerceMinAggregateInputType = {
    id?: true
    taxId?: true
    legalName?: true
    commercialName?: true
    email?: true
    phone?: true
    country?: true
    trialEndsAt?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EcommerceMaxAggregateInputType = {
    id?: true
    taxId?: true
    legalName?: true
    commercialName?: true
    email?: true
    phone?: true
    country?: true
    trialEndsAt?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EcommerceCountAggregateInputType = {
    id?: true
    taxId?: true
    legalName?: true
    commercialName?: true
    email?: true
    phone?: true
    country?: true
    billingAddress?: true
    trialEndsAt?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EcommerceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ecommerce to aggregate.
     */
    where?: EcommerceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ecommerces to fetch.
     */
    orderBy?: EcommerceOrderByWithRelationInput | EcommerceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EcommerceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ecommerces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ecommerces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Ecommerces
    **/
    _count?: true | EcommerceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EcommerceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EcommerceMaxAggregateInputType
  }

  export type GetEcommerceAggregateType<T extends EcommerceAggregateArgs> = {
        [P in keyof T & keyof AggregateEcommerce]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEcommerce[P]>
      : GetScalarType<T[P], AggregateEcommerce[P]>
  }




  export type EcommerceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EcommerceWhereInput
    orderBy?: EcommerceOrderByWithAggregationInput | EcommerceOrderByWithAggregationInput[]
    by: EcommerceScalarFieldEnum[] | EcommerceScalarFieldEnum
    having?: EcommerceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EcommerceCountAggregateInputType | true
    _min?: EcommerceMinAggregateInputType
    _max?: EcommerceMaxAggregateInputType
  }

  export type EcommerceGroupByOutputType = {
    id: string
    taxId: string
    legalName: string
    commercialName: string | null
    email: string
    phone: string | null
    country: string
    billingAddress: JsonValue | null
    trialEndsAt: Date | null
    status: $Enums.EcommerceStatus
    createdAt: Date
    updatedAt: Date
    _count: EcommerceCountAggregateOutputType | null
    _min: EcommerceMinAggregateOutputType | null
    _max: EcommerceMaxAggregateOutputType | null
  }

  type GetEcommerceGroupByPayload<T extends EcommerceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EcommerceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EcommerceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EcommerceGroupByOutputType[P]>
            : GetScalarType<T[P], EcommerceGroupByOutputType[P]>
        }
      >
    >


  export type EcommerceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    taxId?: boolean
    legalName?: boolean
    commercialName?: boolean
    email?: boolean
    phone?: boolean
    country?: boolean
    billingAddress?: boolean
    trialEndsAt?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    stores?: boolean | Ecommerce$storesArgs<ExtArgs>
    _count?: boolean | EcommerceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ecommerce"]>

  export type EcommerceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    taxId?: boolean
    legalName?: boolean
    commercialName?: boolean
    email?: boolean
    phone?: boolean
    country?: boolean
    billingAddress?: boolean
    trialEndsAt?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ecommerce"]>

  export type EcommerceSelectScalar = {
    id?: boolean
    taxId?: boolean
    legalName?: boolean
    commercialName?: boolean
    email?: boolean
    phone?: boolean
    country?: boolean
    billingAddress?: boolean
    trialEndsAt?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EcommerceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stores?: boolean | Ecommerce$storesArgs<ExtArgs>
    _count?: boolean | EcommerceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EcommerceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $EcommercePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Ecommerce"
    objects: {
      stores: Prisma.$StorePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      taxId: string
      legalName: string
      commercialName: string | null
      email: string
      phone: string | null
      country: string
      billingAddress: Prisma.JsonValue | null
      trialEndsAt: Date | null
      status: $Enums.EcommerceStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ecommerce"]>
    composites: {}
  }

  type EcommerceGetPayload<S extends boolean | null | undefined | EcommerceDefaultArgs> = $Result.GetResult<Prisma.$EcommercePayload, S>

  type EcommerceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EcommerceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EcommerceCountAggregateInputType | true
    }

  export interface EcommerceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Ecommerce'], meta: { name: 'Ecommerce' } }
    /**
     * Find zero or one Ecommerce that matches the filter.
     * @param {EcommerceFindUniqueArgs} args - Arguments to find a Ecommerce
     * @example
     * // Get one Ecommerce
     * const ecommerce = await prisma.ecommerce.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EcommerceFindUniqueArgs>(args: SelectSubset<T, EcommerceFindUniqueArgs<ExtArgs>>): Prisma__EcommerceClient<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Ecommerce that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EcommerceFindUniqueOrThrowArgs} args - Arguments to find a Ecommerce
     * @example
     * // Get one Ecommerce
     * const ecommerce = await prisma.ecommerce.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EcommerceFindUniqueOrThrowArgs>(args: SelectSubset<T, EcommerceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EcommerceClient<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Ecommerce that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EcommerceFindFirstArgs} args - Arguments to find a Ecommerce
     * @example
     * // Get one Ecommerce
     * const ecommerce = await prisma.ecommerce.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EcommerceFindFirstArgs>(args?: SelectSubset<T, EcommerceFindFirstArgs<ExtArgs>>): Prisma__EcommerceClient<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Ecommerce that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EcommerceFindFirstOrThrowArgs} args - Arguments to find a Ecommerce
     * @example
     * // Get one Ecommerce
     * const ecommerce = await prisma.ecommerce.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EcommerceFindFirstOrThrowArgs>(args?: SelectSubset<T, EcommerceFindFirstOrThrowArgs<ExtArgs>>): Prisma__EcommerceClient<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Ecommerces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EcommerceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ecommerces
     * const ecommerces = await prisma.ecommerce.findMany()
     * 
     * // Get first 10 Ecommerces
     * const ecommerces = await prisma.ecommerce.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ecommerceWithIdOnly = await prisma.ecommerce.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EcommerceFindManyArgs>(args?: SelectSubset<T, EcommerceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Ecommerce.
     * @param {EcommerceCreateArgs} args - Arguments to create a Ecommerce.
     * @example
     * // Create one Ecommerce
     * const Ecommerce = await prisma.ecommerce.create({
     *   data: {
     *     // ... data to create a Ecommerce
     *   }
     * })
     * 
     */
    create<T extends EcommerceCreateArgs>(args: SelectSubset<T, EcommerceCreateArgs<ExtArgs>>): Prisma__EcommerceClient<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Ecommerces.
     * @param {EcommerceCreateManyArgs} args - Arguments to create many Ecommerces.
     * @example
     * // Create many Ecommerces
     * const ecommerce = await prisma.ecommerce.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EcommerceCreateManyArgs>(args?: SelectSubset<T, EcommerceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ecommerces and returns the data saved in the database.
     * @param {EcommerceCreateManyAndReturnArgs} args - Arguments to create many Ecommerces.
     * @example
     * // Create many Ecommerces
     * const ecommerce = await prisma.ecommerce.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ecommerces and only return the `id`
     * const ecommerceWithIdOnly = await prisma.ecommerce.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EcommerceCreateManyAndReturnArgs>(args?: SelectSubset<T, EcommerceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Ecommerce.
     * @param {EcommerceDeleteArgs} args - Arguments to delete one Ecommerce.
     * @example
     * // Delete one Ecommerce
     * const Ecommerce = await prisma.ecommerce.delete({
     *   where: {
     *     // ... filter to delete one Ecommerce
     *   }
     * })
     * 
     */
    delete<T extends EcommerceDeleteArgs>(args: SelectSubset<T, EcommerceDeleteArgs<ExtArgs>>): Prisma__EcommerceClient<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Ecommerce.
     * @param {EcommerceUpdateArgs} args - Arguments to update one Ecommerce.
     * @example
     * // Update one Ecommerce
     * const ecommerce = await prisma.ecommerce.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EcommerceUpdateArgs>(args: SelectSubset<T, EcommerceUpdateArgs<ExtArgs>>): Prisma__EcommerceClient<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Ecommerces.
     * @param {EcommerceDeleteManyArgs} args - Arguments to filter Ecommerces to delete.
     * @example
     * // Delete a few Ecommerces
     * const { count } = await prisma.ecommerce.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EcommerceDeleteManyArgs>(args?: SelectSubset<T, EcommerceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ecommerces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EcommerceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ecommerces
     * const ecommerce = await prisma.ecommerce.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EcommerceUpdateManyArgs>(args: SelectSubset<T, EcommerceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ecommerce.
     * @param {EcommerceUpsertArgs} args - Arguments to update or create a Ecommerce.
     * @example
     * // Update or create a Ecommerce
     * const ecommerce = await prisma.ecommerce.upsert({
     *   create: {
     *     // ... data to create a Ecommerce
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ecommerce we want to update
     *   }
     * })
     */
    upsert<T extends EcommerceUpsertArgs>(args: SelectSubset<T, EcommerceUpsertArgs<ExtArgs>>): Prisma__EcommerceClient<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Ecommerces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EcommerceCountArgs} args - Arguments to filter Ecommerces to count.
     * @example
     * // Count the number of Ecommerces
     * const count = await prisma.ecommerce.count({
     *   where: {
     *     // ... the filter for the Ecommerces we want to count
     *   }
     * })
    **/
    count<T extends EcommerceCountArgs>(
      args?: Subset<T, EcommerceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EcommerceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ecommerce.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EcommerceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EcommerceAggregateArgs>(args: Subset<T, EcommerceAggregateArgs>): Prisma.PrismaPromise<GetEcommerceAggregateType<T>>

    /**
     * Group by Ecommerce.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EcommerceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EcommerceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EcommerceGroupByArgs['orderBy'] }
        : { orderBy?: EcommerceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EcommerceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEcommerceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Ecommerce model
   */
  readonly fields: EcommerceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Ecommerce.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EcommerceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    stores<T extends Ecommerce$storesArgs<ExtArgs> = {}>(args?: Subset<T, Ecommerce$storesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Ecommerce model
   */ 
  interface EcommerceFieldRefs {
    readonly id: FieldRef<"Ecommerce", 'String'>
    readonly taxId: FieldRef<"Ecommerce", 'String'>
    readonly legalName: FieldRef<"Ecommerce", 'String'>
    readonly commercialName: FieldRef<"Ecommerce", 'String'>
    readonly email: FieldRef<"Ecommerce", 'String'>
    readonly phone: FieldRef<"Ecommerce", 'String'>
    readonly country: FieldRef<"Ecommerce", 'String'>
    readonly billingAddress: FieldRef<"Ecommerce", 'Json'>
    readonly trialEndsAt: FieldRef<"Ecommerce", 'DateTime'>
    readonly status: FieldRef<"Ecommerce", 'EcommerceStatus'>
    readonly createdAt: FieldRef<"Ecommerce", 'DateTime'>
    readonly updatedAt: FieldRef<"Ecommerce", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Ecommerce findUnique
   */
  export type EcommerceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
    /**
     * Filter, which Ecommerce to fetch.
     */
    where: EcommerceWhereUniqueInput
  }

  /**
   * Ecommerce findUniqueOrThrow
   */
  export type EcommerceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
    /**
     * Filter, which Ecommerce to fetch.
     */
    where: EcommerceWhereUniqueInput
  }

  /**
   * Ecommerce findFirst
   */
  export type EcommerceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
    /**
     * Filter, which Ecommerce to fetch.
     */
    where?: EcommerceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ecommerces to fetch.
     */
    orderBy?: EcommerceOrderByWithRelationInput | EcommerceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ecommerces.
     */
    cursor?: EcommerceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ecommerces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ecommerces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ecommerces.
     */
    distinct?: EcommerceScalarFieldEnum | EcommerceScalarFieldEnum[]
  }

  /**
   * Ecommerce findFirstOrThrow
   */
  export type EcommerceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
    /**
     * Filter, which Ecommerce to fetch.
     */
    where?: EcommerceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ecommerces to fetch.
     */
    orderBy?: EcommerceOrderByWithRelationInput | EcommerceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ecommerces.
     */
    cursor?: EcommerceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ecommerces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ecommerces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ecommerces.
     */
    distinct?: EcommerceScalarFieldEnum | EcommerceScalarFieldEnum[]
  }

  /**
   * Ecommerce findMany
   */
  export type EcommerceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
    /**
     * Filter, which Ecommerces to fetch.
     */
    where?: EcommerceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ecommerces to fetch.
     */
    orderBy?: EcommerceOrderByWithRelationInput | EcommerceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Ecommerces.
     */
    cursor?: EcommerceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ecommerces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ecommerces.
     */
    skip?: number
    distinct?: EcommerceScalarFieldEnum | EcommerceScalarFieldEnum[]
  }

  /**
   * Ecommerce create
   */
  export type EcommerceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
    /**
     * The data needed to create a Ecommerce.
     */
    data: XOR<EcommerceCreateInput, EcommerceUncheckedCreateInput>
  }

  /**
   * Ecommerce createMany
   */
  export type EcommerceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Ecommerces.
     */
    data: EcommerceCreateManyInput | EcommerceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ecommerce createManyAndReturn
   */
  export type EcommerceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Ecommerces.
     */
    data: EcommerceCreateManyInput | EcommerceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ecommerce update
   */
  export type EcommerceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
    /**
     * The data needed to update a Ecommerce.
     */
    data: XOR<EcommerceUpdateInput, EcommerceUncheckedUpdateInput>
    /**
     * Choose, which Ecommerce to update.
     */
    where: EcommerceWhereUniqueInput
  }

  /**
   * Ecommerce updateMany
   */
  export type EcommerceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Ecommerces.
     */
    data: XOR<EcommerceUpdateManyMutationInput, EcommerceUncheckedUpdateManyInput>
    /**
     * Filter which Ecommerces to update
     */
    where?: EcommerceWhereInput
  }

  /**
   * Ecommerce upsert
   */
  export type EcommerceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
    /**
     * The filter to search for the Ecommerce to update in case it exists.
     */
    where: EcommerceWhereUniqueInput
    /**
     * In case the Ecommerce found by the `where` argument doesn't exist, create a new Ecommerce with this data.
     */
    create: XOR<EcommerceCreateInput, EcommerceUncheckedCreateInput>
    /**
     * In case the Ecommerce was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EcommerceUpdateInput, EcommerceUncheckedUpdateInput>
  }

  /**
   * Ecommerce delete
   */
  export type EcommerceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
    /**
     * Filter which Ecommerce to delete.
     */
    where: EcommerceWhereUniqueInput
  }

  /**
   * Ecommerce deleteMany
   */
  export type EcommerceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ecommerces to delete
     */
    where?: EcommerceWhereInput
  }

  /**
   * Ecommerce.stores
   */
  export type Ecommerce$storesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    where?: StoreWhereInput
    orderBy?: StoreOrderByWithRelationInput | StoreOrderByWithRelationInput[]
    cursor?: StoreWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StoreScalarFieldEnum | StoreScalarFieldEnum[]
  }

  /**
   * Ecommerce without action
   */
  export type EcommerceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ecommerce
     */
    select?: EcommerceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EcommerceInclude<ExtArgs> | null
  }


  /**
   * Model Store
   */

  export type AggregateStore = {
    _count: StoreCountAggregateOutputType | null
    _min: StoreMinAggregateOutputType | null
    _max: StoreMaxAggregateOutputType | null
  }

  export type StoreMinAggregateOutputType = {
    id: string | null
    ecommerceId: string | null
    url: string | null
    name: string | null
    platform: $Enums.StorePlatform | null
    defaultLanguage: string | null
    defaultCurrency: string | null
    timezone: string | null
    logoUrl: string | null
    status: $Enums.StoreStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StoreMaxAggregateOutputType = {
    id: string | null
    ecommerceId: string | null
    url: string | null
    name: string | null
    platform: $Enums.StorePlatform | null
    defaultLanguage: string | null
    defaultCurrency: string | null
    timezone: string | null
    logoUrl: string | null
    status: $Enums.StoreStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StoreCountAggregateOutputType = {
    id: number
    ecommerceId: number
    url: number
    name: number
    platform: number
    defaultLanguage: number
    defaultCurrency: number
    timezone: number
    logoUrl: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StoreMinAggregateInputType = {
    id?: true
    ecommerceId?: true
    url?: true
    name?: true
    platform?: true
    defaultLanguage?: true
    defaultCurrency?: true
    timezone?: true
    logoUrl?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StoreMaxAggregateInputType = {
    id?: true
    ecommerceId?: true
    url?: true
    name?: true
    platform?: true
    defaultLanguage?: true
    defaultCurrency?: true
    timezone?: true
    logoUrl?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StoreCountAggregateInputType = {
    id?: true
    ecommerceId?: true
    url?: true
    name?: true
    platform?: true
    defaultLanguage?: true
    defaultCurrency?: true
    timezone?: true
    logoUrl?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StoreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Store to aggregate.
     */
    where?: StoreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stores to fetch.
     */
    orderBy?: StoreOrderByWithRelationInput | StoreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StoreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stores.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Stores
    **/
    _count?: true | StoreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StoreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StoreMaxAggregateInputType
  }

  export type GetStoreAggregateType<T extends StoreAggregateArgs> = {
        [P in keyof T & keyof AggregateStore]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStore[P]>
      : GetScalarType<T[P], AggregateStore[P]>
  }




  export type StoreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StoreWhereInput
    orderBy?: StoreOrderByWithAggregationInput | StoreOrderByWithAggregationInput[]
    by: StoreScalarFieldEnum[] | StoreScalarFieldEnum
    having?: StoreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StoreCountAggregateInputType | true
    _min?: StoreMinAggregateInputType
    _max?: StoreMaxAggregateInputType
  }

  export type StoreGroupByOutputType = {
    id: string
    ecommerceId: string
    url: string
    name: string
    platform: $Enums.StorePlatform
    defaultLanguage: string
    defaultCurrency: string
    timezone: string
    logoUrl: string | null
    status: $Enums.StoreStatus
    createdAt: Date
    updatedAt: Date
    _count: StoreCountAggregateOutputType | null
    _min: StoreMinAggregateOutputType | null
    _max: StoreMaxAggregateOutputType | null
  }

  type GetStoreGroupByPayload<T extends StoreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StoreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StoreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StoreGroupByOutputType[P]>
            : GetScalarType<T[P], StoreGroupByOutputType[P]>
        }
      >
    >


  export type StoreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ecommerceId?: boolean
    url?: boolean
    name?: boolean
    platform?: boolean
    defaultLanguage?: boolean
    defaultCurrency?: boolean
    timezone?: boolean
    logoUrl?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ecommerce?: boolean | EcommerceDefaultArgs<ExtArgs>
    orders?: boolean | Store$ordersArgs<ExtArgs>
    _count?: boolean | StoreCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["store"]>

  export type StoreSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ecommerceId?: boolean
    url?: boolean
    name?: boolean
    platform?: boolean
    defaultLanguage?: boolean
    defaultCurrency?: boolean
    timezone?: boolean
    logoUrl?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ecommerce?: boolean | EcommerceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["store"]>

  export type StoreSelectScalar = {
    id?: boolean
    ecommerceId?: boolean
    url?: boolean
    name?: boolean
    platform?: boolean
    defaultLanguage?: boolean
    defaultCurrency?: boolean
    timezone?: boolean
    logoUrl?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StoreInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ecommerce?: boolean | EcommerceDefaultArgs<ExtArgs>
    orders?: boolean | Store$ordersArgs<ExtArgs>
    _count?: boolean | StoreCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type StoreIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ecommerce?: boolean | EcommerceDefaultArgs<ExtArgs>
  }

  export type $StorePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Store"
    objects: {
      ecommerce: Prisma.$EcommercePayload<ExtArgs>
      orders: Prisma.$OrderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ecommerceId: string
      url: string
      name: string
      platform: $Enums.StorePlatform
      defaultLanguage: string
      defaultCurrency: string
      timezone: string
      logoUrl: string | null
      status: $Enums.StoreStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["store"]>
    composites: {}
  }

  type StoreGetPayload<S extends boolean | null | undefined | StoreDefaultArgs> = $Result.GetResult<Prisma.$StorePayload, S>

  type StoreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StoreFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StoreCountAggregateInputType | true
    }

  export interface StoreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Store'], meta: { name: 'Store' } }
    /**
     * Find zero or one Store that matches the filter.
     * @param {StoreFindUniqueArgs} args - Arguments to find a Store
     * @example
     * // Get one Store
     * const store = await prisma.store.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StoreFindUniqueArgs>(args: SelectSubset<T, StoreFindUniqueArgs<ExtArgs>>): Prisma__StoreClient<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Store that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StoreFindUniqueOrThrowArgs} args - Arguments to find a Store
     * @example
     * // Get one Store
     * const store = await prisma.store.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StoreFindUniqueOrThrowArgs>(args: SelectSubset<T, StoreFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StoreClient<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Store that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreFindFirstArgs} args - Arguments to find a Store
     * @example
     * // Get one Store
     * const store = await prisma.store.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StoreFindFirstArgs>(args?: SelectSubset<T, StoreFindFirstArgs<ExtArgs>>): Prisma__StoreClient<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Store that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreFindFirstOrThrowArgs} args - Arguments to find a Store
     * @example
     * // Get one Store
     * const store = await prisma.store.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StoreFindFirstOrThrowArgs>(args?: SelectSubset<T, StoreFindFirstOrThrowArgs<ExtArgs>>): Prisma__StoreClient<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Stores that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Stores
     * const stores = await prisma.store.findMany()
     * 
     * // Get first 10 Stores
     * const stores = await prisma.store.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const storeWithIdOnly = await prisma.store.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StoreFindManyArgs>(args?: SelectSubset<T, StoreFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Store.
     * @param {StoreCreateArgs} args - Arguments to create a Store.
     * @example
     * // Create one Store
     * const Store = await prisma.store.create({
     *   data: {
     *     // ... data to create a Store
     *   }
     * })
     * 
     */
    create<T extends StoreCreateArgs>(args: SelectSubset<T, StoreCreateArgs<ExtArgs>>): Prisma__StoreClient<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Stores.
     * @param {StoreCreateManyArgs} args - Arguments to create many Stores.
     * @example
     * // Create many Stores
     * const store = await prisma.store.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StoreCreateManyArgs>(args?: SelectSubset<T, StoreCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Stores and returns the data saved in the database.
     * @param {StoreCreateManyAndReturnArgs} args - Arguments to create many Stores.
     * @example
     * // Create many Stores
     * const store = await prisma.store.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Stores and only return the `id`
     * const storeWithIdOnly = await prisma.store.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StoreCreateManyAndReturnArgs>(args?: SelectSubset<T, StoreCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Store.
     * @param {StoreDeleteArgs} args - Arguments to delete one Store.
     * @example
     * // Delete one Store
     * const Store = await prisma.store.delete({
     *   where: {
     *     // ... filter to delete one Store
     *   }
     * })
     * 
     */
    delete<T extends StoreDeleteArgs>(args: SelectSubset<T, StoreDeleteArgs<ExtArgs>>): Prisma__StoreClient<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Store.
     * @param {StoreUpdateArgs} args - Arguments to update one Store.
     * @example
     * // Update one Store
     * const store = await prisma.store.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StoreUpdateArgs>(args: SelectSubset<T, StoreUpdateArgs<ExtArgs>>): Prisma__StoreClient<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Stores.
     * @param {StoreDeleteManyArgs} args - Arguments to filter Stores to delete.
     * @example
     * // Delete a few Stores
     * const { count } = await prisma.store.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StoreDeleteManyArgs>(args?: SelectSubset<T, StoreDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stores.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Stores
     * const store = await prisma.store.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StoreUpdateManyArgs>(args: SelectSubset<T, StoreUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Store.
     * @param {StoreUpsertArgs} args - Arguments to update or create a Store.
     * @example
     * // Update or create a Store
     * const store = await prisma.store.upsert({
     *   create: {
     *     // ... data to create a Store
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Store we want to update
     *   }
     * })
     */
    upsert<T extends StoreUpsertArgs>(args: SelectSubset<T, StoreUpsertArgs<ExtArgs>>): Prisma__StoreClient<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Stores.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreCountArgs} args - Arguments to filter Stores to count.
     * @example
     * // Count the number of Stores
     * const count = await prisma.store.count({
     *   where: {
     *     // ... the filter for the Stores we want to count
     *   }
     * })
    **/
    count<T extends StoreCountArgs>(
      args?: Subset<T, StoreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StoreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Store.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StoreAggregateArgs>(args: Subset<T, StoreAggregateArgs>): Prisma.PrismaPromise<GetStoreAggregateType<T>>

    /**
     * Group by Store.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StoreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StoreGroupByArgs['orderBy'] }
        : { orderBy?: StoreGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StoreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStoreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Store model
   */
  readonly fields: StoreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Store.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StoreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ecommerce<T extends EcommerceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EcommerceDefaultArgs<ExtArgs>>): Prisma__EcommerceClient<$Result.GetResult<Prisma.$EcommercePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    orders<T extends Store$ordersArgs<ExtArgs> = {}>(args?: Subset<T, Store$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Store model
   */ 
  interface StoreFieldRefs {
    readonly id: FieldRef<"Store", 'String'>
    readonly ecommerceId: FieldRef<"Store", 'String'>
    readonly url: FieldRef<"Store", 'String'>
    readonly name: FieldRef<"Store", 'String'>
    readonly platform: FieldRef<"Store", 'StorePlatform'>
    readonly defaultLanguage: FieldRef<"Store", 'String'>
    readonly defaultCurrency: FieldRef<"Store", 'String'>
    readonly timezone: FieldRef<"Store", 'String'>
    readonly logoUrl: FieldRef<"Store", 'String'>
    readonly status: FieldRef<"Store", 'StoreStatus'>
    readonly createdAt: FieldRef<"Store", 'DateTime'>
    readonly updatedAt: FieldRef<"Store", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Store findUnique
   */
  export type StoreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    /**
     * Filter, which Store to fetch.
     */
    where: StoreWhereUniqueInput
  }

  /**
   * Store findUniqueOrThrow
   */
  export type StoreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    /**
     * Filter, which Store to fetch.
     */
    where: StoreWhereUniqueInput
  }

  /**
   * Store findFirst
   */
  export type StoreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    /**
     * Filter, which Store to fetch.
     */
    where?: StoreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stores to fetch.
     */
    orderBy?: StoreOrderByWithRelationInput | StoreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stores.
     */
    cursor?: StoreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stores.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stores.
     */
    distinct?: StoreScalarFieldEnum | StoreScalarFieldEnum[]
  }

  /**
   * Store findFirstOrThrow
   */
  export type StoreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    /**
     * Filter, which Store to fetch.
     */
    where?: StoreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stores to fetch.
     */
    orderBy?: StoreOrderByWithRelationInput | StoreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stores.
     */
    cursor?: StoreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stores.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stores.
     */
    distinct?: StoreScalarFieldEnum | StoreScalarFieldEnum[]
  }

  /**
   * Store findMany
   */
  export type StoreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    /**
     * Filter, which Stores to fetch.
     */
    where?: StoreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stores to fetch.
     */
    orderBy?: StoreOrderByWithRelationInput | StoreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Stores.
     */
    cursor?: StoreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stores.
     */
    skip?: number
    distinct?: StoreScalarFieldEnum | StoreScalarFieldEnum[]
  }

  /**
   * Store create
   */
  export type StoreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    /**
     * The data needed to create a Store.
     */
    data: XOR<StoreCreateInput, StoreUncheckedCreateInput>
  }

  /**
   * Store createMany
   */
  export type StoreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Stores.
     */
    data: StoreCreateManyInput | StoreCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Store createManyAndReturn
   */
  export type StoreCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Stores.
     */
    data: StoreCreateManyInput | StoreCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Store update
   */
  export type StoreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    /**
     * The data needed to update a Store.
     */
    data: XOR<StoreUpdateInput, StoreUncheckedUpdateInput>
    /**
     * Choose, which Store to update.
     */
    where: StoreWhereUniqueInput
  }

  /**
   * Store updateMany
   */
  export type StoreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Stores.
     */
    data: XOR<StoreUpdateManyMutationInput, StoreUncheckedUpdateManyInput>
    /**
     * Filter which Stores to update
     */
    where?: StoreWhereInput
  }

  /**
   * Store upsert
   */
  export type StoreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    /**
     * The filter to search for the Store to update in case it exists.
     */
    where: StoreWhereUniqueInput
    /**
     * In case the Store found by the `where` argument doesn't exist, create a new Store with this data.
     */
    create: XOR<StoreCreateInput, StoreUncheckedCreateInput>
    /**
     * In case the Store was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StoreUpdateInput, StoreUncheckedUpdateInput>
  }

  /**
   * Store delete
   */
  export type StoreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
    /**
     * Filter which Store to delete.
     */
    where: StoreWhereUniqueInput
  }

  /**
   * Store deleteMany
   */
  export type StoreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stores to delete
     */
    where?: StoreWhereInput
  }

  /**
   * Store.orders
   */
  export type Store$ordersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Store without action
   */
  export type StoreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Store
     */
    select?: StoreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoreInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    phoneId: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    preferredLanguage: string | null
    isRegistered: boolean | null
    registeredAt: Date | null
    lastInteractionAt: Date | null
    isDeleted: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    phoneId: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    preferredLanguage: string | null
    isRegistered: boolean | null
    registeredAt: Date | null
    lastInteractionAt: Date | null
    isDeleted: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    phoneId: number
    firstName: number
    lastName: number
    email: number
    preferredLanguage: number
    isRegistered: number
    registeredAt: number
    lastInteractionAt: number
    isDeleted: number
    deletedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    phoneId?: true
    firstName?: true
    lastName?: true
    email?: true
    preferredLanguage?: true
    isRegistered?: true
    registeredAt?: true
    lastInteractionAt?: true
    isDeleted?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    phoneId?: true
    firstName?: true
    lastName?: true
    email?: true
    preferredLanguage?: true
    isRegistered?: true
    registeredAt?: true
    lastInteractionAt?: true
    isDeleted?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    phoneId?: true
    firstName?: true
    lastName?: true
    email?: true
    preferredLanguage?: true
    isRegistered?: true
    registeredAt?: true
    lastInteractionAt?: true
    isDeleted?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    phoneId: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    preferredLanguage: string | null
    isRegistered: boolean
    registeredAt: Date | null
    lastInteractionAt: Date | null
    isDeleted: boolean
    deletedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneId?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    preferredLanguage?: boolean
    isRegistered?: boolean
    registeredAt?: boolean
    lastInteractionAt?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    phone?: boolean | User$phoneArgs<ExtArgs>
    orders?: boolean | User$ordersArgs<ExtArgs>
    addresses?: boolean | User$addressesArgs<ExtArgs>
    giftRecipients?: boolean | User$giftRecipientsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneId?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    preferredLanguage?: boolean
    isRegistered?: boolean
    registeredAt?: boolean
    lastInteractionAt?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    phone?: boolean | User$phoneArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    phoneId?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    preferredLanguage?: boolean
    isRegistered?: boolean
    registeredAt?: boolean
    lastInteractionAt?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    phone?: boolean | User$phoneArgs<ExtArgs>
    orders?: boolean | User$ordersArgs<ExtArgs>
    addresses?: boolean | User$addressesArgs<ExtArgs>
    giftRecipients?: boolean | User$giftRecipientsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    phone?: boolean | User$phoneArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      phone: Prisma.$PhonePayload<ExtArgs> | null
      orders: Prisma.$OrderPayload<ExtArgs>[]
      addresses: Prisma.$AddressPayload<ExtArgs>[]
      giftRecipients: Prisma.$GiftRecipientPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      phoneId: string | null
      firstName: string | null
      lastName: string | null
      email: string | null
      preferredLanguage: string | null
      isRegistered: boolean
      registeredAt: Date | null
      lastInteractionAt: Date | null
      isDeleted: boolean
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    phone<T extends User$phoneArgs<ExtArgs> = {}>(args?: Subset<T, User$phoneArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    orders<T extends User$ordersArgs<ExtArgs> = {}>(args?: Subset<T, User$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany"> | Null>
    addresses<T extends User$addressesArgs<ExtArgs> = {}>(args?: Subset<T, User$addressesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "findMany"> | Null>
    giftRecipients<T extends User$giftRecipientsArgs<ExtArgs> = {}>(args?: Subset<T, User$giftRecipientsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly phoneId: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly preferredLanguage: FieldRef<"User", 'String'>
    readonly isRegistered: FieldRef<"User", 'Boolean'>
    readonly registeredAt: FieldRef<"User", 'DateTime'>
    readonly lastInteractionAt: FieldRef<"User", 'DateTime'>
    readonly isDeleted: FieldRef<"User", 'Boolean'>
    readonly deletedAt: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.phone
   */
  export type User$phoneArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Phone
     */
    select?: PhoneSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneInclude<ExtArgs> | null
    where?: PhoneWhereInput
  }

  /**
   * User.orders
   */
  export type User$ordersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * User.addresses
   */
  export type User$addressesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    where?: AddressWhereInput
    orderBy?: AddressOrderByWithRelationInput | AddressOrderByWithRelationInput[]
    cursor?: AddressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AddressScalarFieldEnum | AddressScalarFieldEnum[]
  }

  /**
   * User.giftRecipients
   */
  export type User$giftRecipientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    where?: GiftRecipientWhereInput
    orderBy?: GiftRecipientOrderByWithRelationInput | GiftRecipientOrderByWithRelationInput[]
    cursor?: GiftRecipientWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GiftRecipientScalarFieldEnum | GiftRecipientScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Address
   */

  export type AggregateAddress = {
    _count: AddressCountAggregateOutputType | null
    _avg: AddressAvgAggregateOutputType | null
    _sum: AddressSumAggregateOutputType | null
    _min: AddressMinAggregateOutputType | null
    _max: AddressMaxAggregateOutputType | null
  }

  export type AddressAvgAggregateOutputType = {
    latitude: Decimal | null
    longitude: Decimal | null
  }

  export type AddressSumAggregateOutputType = {
    latitude: Decimal | null
    longitude: Decimal | null
  }

  export type AddressMinAggregateOutputType = {
    id: string | null
    userId: string | null
    label: string | null
    fullAddress: string | null
    street: string | null
    number: string | null
    block: string | null
    staircase: string | null
    floor: string | null
    door: string | null
    additionalInfo: string | null
    postalCode: string | null
    city: string | null
    province: string | null
    country: string | null
    gmapsPlaceId: string | null
    latitude: Decimal | null
    longitude: Decimal | null
    isDefault: boolean | null
    isDeleted: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AddressMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    label: string | null
    fullAddress: string | null
    street: string | null
    number: string | null
    block: string | null
    staircase: string | null
    floor: string | null
    door: string | null
    additionalInfo: string | null
    postalCode: string | null
    city: string | null
    province: string | null
    country: string | null
    gmapsPlaceId: string | null
    latitude: Decimal | null
    longitude: Decimal | null
    isDefault: boolean | null
    isDeleted: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AddressCountAggregateOutputType = {
    id: number
    userId: number
    label: number
    fullAddress: number
    street: number
    number: number
    block: number
    staircase: number
    floor: number
    door: number
    additionalInfo: number
    postalCode: number
    city: number
    province: number
    country: number
    gmapsPlaceId: number
    latitude: number
    longitude: number
    isDefault: number
    isDeleted: number
    deletedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AddressAvgAggregateInputType = {
    latitude?: true
    longitude?: true
  }

  export type AddressSumAggregateInputType = {
    latitude?: true
    longitude?: true
  }

  export type AddressMinAggregateInputType = {
    id?: true
    userId?: true
    label?: true
    fullAddress?: true
    street?: true
    number?: true
    block?: true
    staircase?: true
    floor?: true
    door?: true
    additionalInfo?: true
    postalCode?: true
    city?: true
    province?: true
    country?: true
    gmapsPlaceId?: true
    latitude?: true
    longitude?: true
    isDefault?: true
    isDeleted?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AddressMaxAggregateInputType = {
    id?: true
    userId?: true
    label?: true
    fullAddress?: true
    street?: true
    number?: true
    block?: true
    staircase?: true
    floor?: true
    door?: true
    additionalInfo?: true
    postalCode?: true
    city?: true
    province?: true
    country?: true
    gmapsPlaceId?: true
    latitude?: true
    longitude?: true
    isDefault?: true
    isDeleted?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AddressCountAggregateInputType = {
    id?: true
    userId?: true
    label?: true
    fullAddress?: true
    street?: true
    number?: true
    block?: true
    staircase?: true
    floor?: true
    door?: true
    additionalInfo?: true
    postalCode?: true
    city?: true
    province?: true
    country?: true
    gmapsPlaceId?: true
    latitude?: true
    longitude?: true
    isDefault?: true
    isDeleted?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AddressAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Address to aggregate.
     */
    where?: AddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Addresses to fetch.
     */
    orderBy?: AddressOrderByWithRelationInput | AddressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Addresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Addresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Addresses
    **/
    _count?: true | AddressCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AddressAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AddressSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AddressMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AddressMaxAggregateInputType
  }

  export type GetAddressAggregateType<T extends AddressAggregateArgs> = {
        [P in keyof T & keyof AggregateAddress]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAddress[P]>
      : GetScalarType<T[P], AggregateAddress[P]>
  }




  export type AddressGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AddressWhereInput
    orderBy?: AddressOrderByWithAggregationInput | AddressOrderByWithAggregationInput[]
    by: AddressScalarFieldEnum[] | AddressScalarFieldEnum
    having?: AddressScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AddressCountAggregateInputType | true
    _avg?: AddressAvgAggregateInputType
    _sum?: AddressSumAggregateInputType
    _min?: AddressMinAggregateInputType
    _max?: AddressMaxAggregateInputType
  }

  export type AddressGroupByOutputType = {
    id: string
    userId: string
    label: string | null
    fullAddress: string
    street: string
    number: string | null
    block: string | null
    staircase: string | null
    floor: string | null
    door: string | null
    additionalInfo: string | null
    postalCode: string
    city: string
    province: string | null
    country: string
    gmapsPlaceId: string | null
    latitude: Decimal | null
    longitude: Decimal | null
    isDefault: boolean
    isDeleted: boolean
    deletedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: AddressCountAggregateOutputType | null
    _avg: AddressAvgAggregateOutputType | null
    _sum: AddressSumAggregateOutputType | null
    _min: AddressMinAggregateOutputType | null
    _max: AddressMaxAggregateOutputType | null
  }

  type GetAddressGroupByPayload<T extends AddressGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AddressGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AddressGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AddressGroupByOutputType[P]>
            : GetScalarType<T[P], AddressGroupByOutputType[P]>
        }
      >
    >


  export type AddressSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    label?: boolean
    fullAddress?: boolean
    street?: boolean
    number?: boolean
    block?: boolean
    staircase?: boolean
    floor?: boolean
    door?: boolean
    additionalInfo?: boolean
    postalCode?: boolean
    city?: boolean
    province?: boolean
    country?: boolean
    gmapsPlaceId?: boolean
    latitude?: boolean
    longitude?: boolean
    isDefault?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["address"]>

  export type AddressSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    label?: boolean
    fullAddress?: boolean
    street?: boolean
    number?: boolean
    block?: boolean
    staircase?: boolean
    floor?: boolean
    door?: boolean
    additionalInfo?: boolean
    postalCode?: boolean
    city?: boolean
    province?: boolean
    country?: boolean
    gmapsPlaceId?: boolean
    latitude?: boolean
    longitude?: boolean
    isDefault?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["address"]>

  export type AddressSelectScalar = {
    id?: boolean
    userId?: boolean
    label?: boolean
    fullAddress?: boolean
    street?: boolean
    number?: boolean
    block?: boolean
    staircase?: boolean
    floor?: boolean
    door?: boolean
    additionalInfo?: boolean
    postalCode?: boolean
    city?: boolean
    province?: boolean
    country?: boolean
    gmapsPlaceId?: boolean
    latitude?: boolean
    longitude?: boolean
    isDefault?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AddressInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AddressIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AddressPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Address"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      label: string | null
      fullAddress: string
      street: string
      number: string | null
      block: string | null
      staircase: string | null
      floor: string | null
      door: string | null
      additionalInfo: string | null
      postalCode: string
      city: string
      province: string | null
      country: string
      gmapsPlaceId: string | null
      latitude: Prisma.Decimal | null
      longitude: Prisma.Decimal | null
      isDefault: boolean
      isDeleted: boolean
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["address"]>
    composites: {}
  }

  type AddressGetPayload<S extends boolean | null | undefined | AddressDefaultArgs> = $Result.GetResult<Prisma.$AddressPayload, S>

  type AddressCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AddressFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AddressCountAggregateInputType | true
    }

  export interface AddressDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Address'], meta: { name: 'Address' } }
    /**
     * Find zero or one Address that matches the filter.
     * @param {AddressFindUniqueArgs} args - Arguments to find a Address
     * @example
     * // Get one Address
     * const address = await prisma.address.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AddressFindUniqueArgs>(args: SelectSubset<T, AddressFindUniqueArgs<ExtArgs>>): Prisma__AddressClient<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Address that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AddressFindUniqueOrThrowArgs} args - Arguments to find a Address
     * @example
     * // Get one Address
     * const address = await prisma.address.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AddressFindUniqueOrThrowArgs>(args: SelectSubset<T, AddressFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AddressClient<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Address that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressFindFirstArgs} args - Arguments to find a Address
     * @example
     * // Get one Address
     * const address = await prisma.address.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AddressFindFirstArgs>(args?: SelectSubset<T, AddressFindFirstArgs<ExtArgs>>): Prisma__AddressClient<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Address that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressFindFirstOrThrowArgs} args - Arguments to find a Address
     * @example
     * // Get one Address
     * const address = await prisma.address.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AddressFindFirstOrThrowArgs>(args?: SelectSubset<T, AddressFindFirstOrThrowArgs<ExtArgs>>): Prisma__AddressClient<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Addresses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Addresses
     * const addresses = await prisma.address.findMany()
     * 
     * // Get first 10 Addresses
     * const addresses = await prisma.address.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const addressWithIdOnly = await prisma.address.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AddressFindManyArgs>(args?: SelectSubset<T, AddressFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Address.
     * @param {AddressCreateArgs} args - Arguments to create a Address.
     * @example
     * // Create one Address
     * const Address = await prisma.address.create({
     *   data: {
     *     // ... data to create a Address
     *   }
     * })
     * 
     */
    create<T extends AddressCreateArgs>(args: SelectSubset<T, AddressCreateArgs<ExtArgs>>): Prisma__AddressClient<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Addresses.
     * @param {AddressCreateManyArgs} args - Arguments to create many Addresses.
     * @example
     * // Create many Addresses
     * const address = await prisma.address.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AddressCreateManyArgs>(args?: SelectSubset<T, AddressCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Addresses and returns the data saved in the database.
     * @param {AddressCreateManyAndReturnArgs} args - Arguments to create many Addresses.
     * @example
     * // Create many Addresses
     * const address = await prisma.address.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Addresses and only return the `id`
     * const addressWithIdOnly = await prisma.address.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AddressCreateManyAndReturnArgs>(args?: SelectSubset<T, AddressCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Address.
     * @param {AddressDeleteArgs} args - Arguments to delete one Address.
     * @example
     * // Delete one Address
     * const Address = await prisma.address.delete({
     *   where: {
     *     // ... filter to delete one Address
     *   }
     * })
     * 
     */
    delete<T extends AddressDeleteArgs>(args: SelectSubset<T, AddressDeleteArgs<ExtArgs>>): Prisma__AddressClient<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Address.
     * @param {AddressUpdateArgs} args - Arguments to update one Address.
     * @example
     * // Update one Address
     * const address = await prisma.address.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AddressUpdateArgs>(args: SelectSubset<T, AddressUpdateArgs<ExtArgs>>): Prisma__AddressClient<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Addresses.
     * @param {AddressDeleteManyArgs} args - Arguments to filter Addresses to delete.
     * @example
     * // Delete a few Addresses
     * const { count } = await prisma.address.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AddressDeleteManyArgs>(args?: SelectSubset<T, AddressDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Addresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Addresses
     * const address = await prisma.address.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AddressUpdateManyArgs>(args: SelectSubset<T, AddressUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Address.
     * @param {AddressUpsertArgs} args - Arguments to update or create a Address.
     * @example
     * // Update or create a Address
     * const address = await prisma.address.upsert({
     *   create: {
     *     // ... data to create a Address
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Address we want to update
     *   }
     * })
     */
    upsert<T extends AddressUpsertArgs>(args: SelectSubset<T, AddressUpsertArgs<ExtArgs>>): Prisma__AddressClient<$Result.GetResult<Prisma.$AddressPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Addresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressCountArgs} args - Arguments to filter Addresses to count.
     * @example
     * // Count the number of Addresses
     * const count = await prisma.address.count({
     *   where: {
     *     // ... the filter for the Addresses we want to count
     *   }
     * })
    **/
    count<T extends AddressCountArgs>(
      args?: Subset<T, AddressCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AddressCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Address.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AddressAggregateArgs>(args: Subset<T, AddressAggregateArgs>): Prisma.PrismaPromise<GetAddressAggregateType<T>>

    /**
     * Group by Address.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AddressGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AddressGroupByArgs['orderBy'] }
        : { orderBy?: AddressGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AddressGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAddressGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Address model
   */
  readonly fields: AddressFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Address.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AddressClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Address model
   */ 
  interface AddressFieldRefs {
    readonly id: FieldRef<"Address", 'String'>
    readonly userId: FieldRef<"Address", 'String'>
    readonly label: FieldRef<"Address", 'String'>
    readonly fullAddress: FieldRef<"Address", 'String'>
    readonly street: FieldRef<"Address", 'String'>
    readonly number: FieldRef<"Address", 'String'>
    readonly block: FieldRef<"Address", 'String'>
    readonly staircase: FieldRef<"Address", 'String'>
    readonly floor: FieldRef<"Address", 'String'>
    readonly door: FieldRef<"Address", 'String'>
    readonly additionalInfo: FieldRef<"Address", 'String'>
    readonly postalCode: FieldRef<"Address", 'String'>
    readonly city: FieldRef<"Address", 'String'>
    readonly province: FieldRef<"Address", 'String'>
    readonly country: FieldRef<"Address", 'String'>
    readonly gmapsPlaceId: FieldRef<"Address", 'String'>
    readonly latitude: FieldRef<"Address", 'Decimal'>
    readonly longitude: FieldRef<"Address", 'Decimal'>
    readonly isDefault: FieldRef<"Address", 'Boolean'>
    readonly isDeleted: FieldRef<"Address", 'Boolean'>
    readonly deletedAt: FieldRef<"Address", 'DateTime'>
    readonly createdAt: FieldRef<"Address", 'DateTime'>
    readonly updatedAt: FieldRef<"Address", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Address findUnique
   */
  export type AddressFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    /**
     * Filter, which Address to fetch.
     */
    where: AddressWhereUniqueInput
  }

  /**
   * Address findUniqueOrThrow
   */
  export type AddressFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    /**
     * Filter, which Address to fetch.
     */
    where: AddressWhereUniqueInput
  }

  /**
   * Address findFirst
   */
  export type AddressFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    /**
     * Filter, which Address to fetch.
     */
    where?: AddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Addresses to fetch.
     */
    orderBy?: AddressOrderByWithRelationInput | AddressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Addresses.
     */
    cursor?: AddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Addresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Addresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Addresses.
     */
    distinct?: AddressScalarFieldEnum | AddressScalarFieldEnum[]
  }

  /**
   * Address findFirstOrThrow
   */
  export type AddressFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    /**
     * Filter, which Address to fetch.
     */
    where?: AddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Addresses to fetch.
     */
    orderBy?: AddressOrderByWithRelationInput | AddressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Addresses.
     */
    cursor?: AddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Addresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Addresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Addresses.
     */
    distinct?: AddressScalarFieldEnum | AddressScalarFieldEnum[]
  }

  /**
   * Address findMany
   */
  export type AddressFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    /**
     * Filter, which Addresses to fetch.
     */
    where?: AddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Addresses to fetch.
     */
    orderBy?: AddressOrderByWithRelationInput | AddressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Addresses.
     */
    cursor?: AddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Addresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Addresses.
     */
    skip?: number
    distinct?: AddressScalarFieldEnum | AddressScalarFieldEnum[]
  }

  /**
   * Address create
   */
  export type AddressCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    /**
     * The data needed to create a Address.
     */
    data: XOR<AddressCreateInput, AddressUncheckedCreateInput>
  }

  /**
   * Address createMany
   */
  export type AddressCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Addresses.
     */
    data: AddressCreateManyInput | AddressCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Address createManyAndReturn
   */
  export type AddressCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Addresses.
     */
    data: AddressCreateManyInput | AddressCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Address update
   */
  export type AddressUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    /**
     * The data needed to update a Address.
     */
    data: XOR<AddressUpdateInput, AddressUncheckedUpdateInput>
    /**
     * Choose, which Address to update.
     */
    where: AddressWhereUniqueInput
  }

  /**
   * Address updateMany
   */
  export type AddressUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Addresses.
     */
    data: XOR<AddressUpdateManyMutationInput, AddressUncheckedUpdateManyInput>
    /**
     * Filter which Addresses to update
     */
    where?: AddressWhereInput
  }

  /**
   * Address upsert
   */
  export type AddressUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    /**
     * The filter to search for the Address to update in case it exists.
     */
    where: AddressWhereUniqueInput
    /**
     * In case the Address found by the `where` argument doesn't exist, create a new Address with this data.
     */
    create: XOR<AddressCreateInput, AddressUncheckedCreateInput>
    /**
     * In case the Address was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AddressUpdateInput, AddressUncheckedUpdateInput>
  }

  /**
   * Address delete
   */
  export type AddressDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
    /**
     * Filter which Address to delete.
     */
    where: AddressWhereUniqueInput
  }

  /**
   * Address deleteMany
   */
  export type AddressDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Addresses to delete
     */
    where?: AddressWhereInput
  }

  /**
   * Address without action
   */
  export type AddressDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Address
     */
    select?: AddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressInclude<ExtArgs> | null
  }


  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    totalAmount: Decimal | null
    feePercentage: Decimal | null
    feeAmount: Decimal | null
  }

  export type OrderSumAggregateOutputType = {
    totalAmount: Decimal | null
    feePercentage: Decimal | null
    feeAmount: Decimal | null
  }

  export type OrderMinAggregateOutputType = {
    id: string | null
    storeId: string | null
    userId: string | null
    externalOrderId: string | null
    externalOrderNumber: string | null
    totalAmount: Decimal | null
    currency: string | null
    feePercentage: Decimal | null
    feeAmount: Decimal | null
    status: $Enums.OrderStatus | null
    orderMode: $Enums.OrderMode | null
    paymentType: $Enums.PaymentType | null
    isGift: boolean | null
    webhookReceivedAt: Date | null
    addressConfirmedAt: Date | null
    syncedAt: Date | null
    statusSource: $Enums.StatusSource | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderMaxAggregateOutputType = {
    id: string | null
    storeId: string | null
    userId: string | null
    externalOrderId: string | null
    externalOrderNumber: string | null
    totalAmount: Decimal | null
    currency: string | null
    feePercentage: Decimal | null
    feeAmount: Decimal | null
    status: $Enums.OrderStatus | null
    orderMode: $Enums.OrderMode | null
    paymentType: $Enums.PaymentType | null
    isGift: boolean | null
    webhookReceivedAt: Date | null
    addressConfirmedAt: Date | null
    syncedAt: Date | null
    statusSource: $Enums.StatusSource | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    storeId: number
    userId: number
    externalOrderId: number
    externalOrderNumber: number
    totalAmount: number
    currency: number
    feePercentage: number
    feeAmount: number
    status: number
    orderMode: number
    paymentType: number
    isGift: number
    itemsSummary: number
    webhookReceivedAt: number
    addressConfirmedAt: number
    syncedAt: number
    statusSource: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    totalAmount?: true
    feePercentage?: true
    feeAmount?: true
  }

  export type OrderSumAggregateInputType = {
    totalAmount?: true
    feePercentage?: true
    feeAmount?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    storeId?: true
    userId?: true
    externalOrderId?: true
    externalOrderNumber?: true
    totalAmount?: true
    currency?: true
    feePercentage?: true
    feeAmount?: true
    status?: true
    orderMode?: true
    paymentType?: true
    isGift?: true
    webhookReceivedAt?: true
    addressConfirmedAt?: true
    syncedAt?: true
    statusSource?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    storeId?: true
    userId?: true
    externalOrderId?: true
    externalOrderNumber?: true
    totalAmount?: true
    currency?: true
    feePercentage?: true
    feeAmount?: true
    status?: true
    orderMode?: true
    paymentType?: true
    isGift?: true
    webhookReceivedAt?: true
    addressConfirmedAt?: true
    syncedAt?: true
    statusSource?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    storeId?: true
    userId?: true
    externalOrderId?: true
    externalOrderNumber?: true
    totalAmount?: true
    currency?: true
    feePercentage?: true
    feeAmount?: true
    status?: true
    orderMode?: true
    paymentType?: true
    isGift?: true
    itemsSummary?: true
    webhookReceivedAt?: true
    addressConfirmedAt?: true
    syncedAt?: true
    statusSource?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: string
    storeId: string
    userId: string
    externalOrderId: string
    externalOrderNumber: string | null
    totalAmount: Decimal
    currency: string
    feePercentage: Decimal
    feeAmount: Decimal
    status: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift: boolean
    itemsSummary: JsonValue | null
    webhookReceivedAt: Date
    addressConfirmedAt: Date | null
    syncedAt: Date | null
    statusSource: $Enums.StatusSource | null
    createdAt: Date
    updatedAt: Date
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    storeId?: boolean
    userId?: boolean
    externalOrderId?: boolean
    externalOrderNumber?: boolean
    totalAmount?: boolean
    currency?: boolean
    feePercentage?: boolean
    feeAmount?: boolean
    status?: boolean
    orderMode?: boolean
    paymentType?: boolean
    isGift?: boolean
    itemsSummary?: boolean
    webhookReceivedAt?: boolean
    addressConfirmedAt?: boolean
    syncedAt?: boolean
    statusSource?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    store?: boolean | StoreDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    orderAddress?: boolean | Order$orderAddressArgs<ExtArgs>
    giftRecipient?: boolean | Order$giftRecipientArgs<ExtArgs>
    conversations?: boolean | Order$conversationsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    storeId?: boolean
    userId?: boolean
    externalOrderId?: boolean
    externalOrderNumber?: boolean
    totalAmount?: boolean
    currency?: boolean
    feePercentage?: boolean
    feeAmount?: boolean
    status?: boolean
    orderMode?: boolean
    paymentType?: boolean
    isGift?: boolean
    itemsSummary?: boolean
    webhookReceivedAt?: boolean
    addressConfirmedAt?: boolean
    syncedAt?: boolean
    statusSource?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    store?: boolean | StoreDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectScalar = {
    id?: boolean
    storeId?: boolean
    userId?: boolean
    externalOrderId?: boolean
    externalOrderNumber?: boolean
    totalAmount?: boolean
    currency?: boolean
    feePercentage?: boolean
    feeAmount?: boolean
    status?: boolean
    orderMode?: boolean
    paymentType?: boolean
    isGift?: boolean
    itemsSummary?: boolean
    webhookReceivedAt?: boolean
    addressConfirmedAt?: boolean
    syncedAt?: boolean
    statusSource?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    store?: boolean | StoreDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    orderAddress?: boolean | Order$orderAddressArgs<ExtArgs>
    giftRecipient?: boolean | Order$giftRecipientArgs<ExtArgs>
    conversations?: boolean | Order$conversationsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    store?: boolean | StoreDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      store: Prisma.$StorePayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
      orderAddress: Prisma.$OrderAddressPayload<ExtArgs> | null
      giftRecipient: Prisma.$GiftRecipientPayload<ExtArgs> | null
      conversations: Prisma.$ConversationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      storeId: string
      userId: string
      externalOrderId: string
      externalOrderNumber: string | null
      totalAmount: Prisma.Decimal
      currency: string
      feePercentage: Prisma.Decimal
      feeAmount: Prisma.Decimal
      status: $Enums.OrderStatus
      orderMode: $Enums.OrderMode
      paymentType: $Enums.PaymentType
      isGift: boolean
      itemsSummary: Prisma.JsonValue | null
      webhookReceivedAt: Date
      addressConfirmedAt: Date | null
      syncedAt: Date | null
      statusSource: $Enums.StatusSource | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {OrderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    store<T extends StoreDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StoreDefaultArgs<ExtArgs>>): Prisma__StoreClient<$Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    orderAddress<T extends Order$orderAddressArgs<ExtArgs> = {}>(args?: Subset<T, Order$orderAddressArgs<ExtArgs>>): Prisma__OrderAddressClient<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    giftRecipient<T extends Order$giftRecipientArgs<ExtArgs> = {}>(args?: Subset<T, Order$giftRecipientArgs<ExtArgs>>): Prisma__GiftRecipientClient<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    conversations<T extends Order$conversationsArgs<ExtArgs> = {}>(args?: Subset<T, Order$conversationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Order model
   */ 
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'String'>
    readonly storeId: FieldRef<"Order", 'String'>
    readonly userId: FieldRef<"Order", 'String'>
    readonly externalOrderId: FieldRef<"Order", 'String'>
    readonly externalOrderNumber: FieldRef<"Order", 'String'>
    readonly totalAmount: FieldRef<"Order", 'Decimal'>
    readonly currency: FieldRef<"Order", 'String'>
    readonly feePercentage: FieldRef<"Order", 'Decimal'>
    readonly feeAmount: FieldRef<"Order", 'Decimal'>
    readonly status: FieldRef<"Order", 'OrderStatus'>
    readonly orderMode: FieldRef<"Order", 'OrderMode'>
    readonly paymentType: FieldRef<"Order", 'PaymentType'>
    readonly isGift: FieldRef<"Order", 'Boolean'>
    readonly itemsSummary: FieldRef<"Order", 'Json'>
    readonly webhookReceivedAt: FieldRef<"Order", 'DateTime'>
    readonly addressConfirmedAt: FieldRef<"Order", 'DateTime'>
    readonly syncedAt: FieldRef<"Order", 'DateTime'>
    readonly statusSource: FieldRef<"Order", 'StatusSource'>
    readonly createdAt: FieldRef<"Order", 'DateTime'>
    readonly updatedAt: FieldRef<"Order", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order createManyAndReturn
   */
  export type OrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
  }

  /**
   * Order.orderAddress
   */
  export type Order$orderAddressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    where?: OrderAddressWhereInput
  }

  /**
   * Order.giftRecipient
   */
  export type Order$giftRecipientArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    where?: GiftRecipientWhereInput
  }

  /**
   * Order.conversations
   */
  export type Order$conversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    where?: ConversationWhereInput
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    cursor?: ConversationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model OrderAddress
   */

  export type AggregateOrderAddress = {
    _count: OrderAddressCountAggregateOutputType | null
    _min: OrderAddressMinAggregateOutputType | null
    _max: OrderAddressMaxAggregateOutputType | null
  }

  export type OrderAddressMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    sourceAddressId: string | null
    recipientType: $Enums.RecipientType | null
    recipientName: string | null
    recipientPhoneId: string | null
    fullAddress: string | null
    street: string | null
    number: string | null
    block: string | null
    staircase: string | null
    floor: string | null
    door: string | null
    additionalInfo: string | null
    postalCode: string | null
    city: string | null
    province: string | null
    country: string | null
    gmapsPlaceId: string | null
    addressOrigin: $Enums.AddressOrigin | null
    confirmedAt: Date | null
    confirmedVia: $Enums.ConfirmedVia | null
  }

  export type OrderAddressMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    sourceAddressId: string | null
    recipientType: $Enums.RecipientType | null
    recipientName: string | null
    recipientPhoneId: string | null
    fullAddress: string | null
    street: string | null
    number: string | null
    block: string | null
    staircase: string | null
    floor: string | null
    door: string | null
    additionalInfo: string | null
    postalCode: string | null
    city: string | null
    province: string | null
    country: string | null
    gmapsPlaceId: string | null
    addressOrigin: $Enums.AddressOrigin | null
    confirmedAt: Date | null
    confirmedVia: $Enums.ConfirmedVia | null
  }

  export type OrderAddressCountAggregateOutputType = {
    id: number
    orderId: number
    sourceAddressId: number
    recipientType: number
    recipientName: number
    recipientPhoneId: number
    fullAddress: number
    street: number
    number: number
    block: number
    staircase: number
    floor: number
    door: number
    additionalInfo: number
    postalCode: number
    city: number
    province: number
    country: number
    gmapsPlaceId: number
    addressOrigin: number
    confirmedAt: number
    confirmedVia: number
    _all: number
  }


  export type OrderAddressMinAggregateInputType = {
    id?: true
    orderId?: true
    sourceAddressId?: true
    recipientType?: true
    recipientName?: true
    recipientPhoneId?: true
    fullAddress?: true
    street?: true
    number?: true
    block?: true
    staircase?: true
    floor?: true
    door?: true
    additionalInfo?: true
    postalCode?: true
    city?: true
    province?: true
    country?: true
    gmapsPlaceId?: true
    addressOrigin?: true
    confirmedAt?: true
    confirmedVia?: true
  }

  export type OrderAddressMaxAggregateInputType = {
    id?: true
    orderId?: true
    sourceAddressId?: true
    recipientType?: true
    recipientName?: true
    recipientPhoneId?: true
    fullAddress?: true
    street?: true
    number?: true
    block?: true
    staircase?: true
    floor?: true
    door?: true
    additionalInfo?: true
    postalCode?: true
    city?: true
    province?: true
    country?: true
    gmapsPlaceId?: true
    addressOrigin?: true
    confirmedAt?: true
    confirmedVia?: true
  }

  export type OrderAddressCountAggregateInputType = {
    id?: true
    orderId?: true
    sourceAddressId?: true
    recipientType?: true
    recipientName?: true
    recipientPhoneId?: true
    fullAddress?: true
    street?: true
    number?: true
    block?: true
    staircase?: true
    floor?: true
    door?: true
    additionalInfo?: true
    postalCode?: true
    city?: true
    province?: true
    country?: true
    gmapsPlaceId?: true
    addressOrigin?: true
    confirmedAt?: true
    confirmedVia?: true
    _all?: true
  }

  export type OrderAddressAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderAddress to aggregate.
     */
    where?: OrderAddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderAddresses to fetch.
     */
    orderBy?: OrderAddressOrderByWithRelationInput | OrderAddressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderAddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderAddresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderAddresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrderAddresses
    **/
    _count?: true | OrderAddressCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderAddressMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderAddressMaxAggregateInputType
  }

  export type GetOrderAddressAggregateType<T extends OrderAddressAggregateArgs> = {
        [P in keyof T & keyof AggregateOrderAddress]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrderAddress[P]>
      : GetScalarType<T[P], AggregateOrderAddress[P]>
  }




  export type OrderAddressGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderAddressWhereInput
    orderBy?: OrderAddressOrderByWithAggregationInput | OrderAddressOrderByWithAggregationInput[]
    by: OrderAddressScalarFieldEnum[] | OrderAddressScalarFieldEnum
    having?: OrderAddressScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderAddressCountAggregateInputType | true
    _min?: OrderAddressMinAggregateInputType
    _max?: OrderAddressMaxAggregateInputType
  }

  export type OrderAddressGroupByOutputType = {
    id: string
    orderId: string
    sourceAddressId: string | null
    recipientType: $Enums.RecipientType
    recipientName: string
    recipientPhoneId: string
    fullAddress: string
    street: string
    number: string | null
    block: string | null
    staircase: string | null
    floor: string | null
    door: string | null
    additionalInfo: string | null
    postalCode: string
    city: string
    province: string | null
    country: string
    gmapsPlaceId: string | null
    addressOrigin: $Enums.AddressOrigin
    confirmedAt: Date
    confirmedVia: $Enums.ConfirmedVia
    _count: OrderAddressCountAggregateOutputType | null
    _min: OrderAddressMinAggregateOutputType | null
    _max: OrderAddressMaxAggregateOutputType | null
  }

  type GetOrderAddressGroupByPayload<T extends OrderAddressGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderAddressGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderAddressGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderAddressGroupByOutputType[P]>
            : GetScalarType<T[P], OrderAddressGroupByOutputType[P]>
        }
      >
    >


  export type OrderAddressSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    sourceAddressId?: boolean
    recipientType?: boolean
    recipientName?: boolean
    recipientPhoneId?: boolean
    fullAddress?: boolean
    street?: boolean
    number?: boolean
    block?: boolean
    staircase?: boolean
    floor?: boolean
    door?: boolean
    additionalInfo?: boolean
    postalCode?: boolean
    city?: boolean
    province?: boolean
    country?: boolean
    gmapsPlaceId?: boolean
    addressOrigin?: boolean
    confirmedAt?: boolean
    confirmedVia?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    recipientPhone?: boolean | PhoneDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderAddress"]>

  export type OrderAddressSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    sourceAddressId?: boolean
    recipientType?: boolean
    recipientName?: boolean
    recipientPhoneId?: boolean
    fullAddress?: boolean
    street?: boolean
    number?: boolean
    block?: boolean
    staircase?: boolean
    floor?: boolean
    door?: boolean
    additionalInfo?: boolean
    postalCode?: boolean
    city?: boolean
    province?: boolean
    country?: boolean
    gmapsPlaceId?: boolean
    addressOrigin?: boolean
    confirmedAt?: boolean
    confirmedVia?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    recipientPhone?: boolean | PhoneDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderAddress"]>

  export type OrderAddressSelectScalar = {
    id?: boolean
    orderId?: boolean
    sourceAddressId?: boolean
    recipientType?: boolean
    recipientName?: boolean
    recipientPhoneId?: boolean
    fullAddress?: boolean
    street?: boolean
    number?: boolean
    block?: boolean
    staircase?: boolean
    floor?: boolean
    door?: boolean
    additionalInfo?: boolean
    postalCode?: boolean
    city?: boolean
    province?: boolean
    country?: boolean
    gmapsPlaceId?: boolean
    addressOrigin?: boolean
    confirmedAt?: boolean
    confirmedVia?: boolean
  }

  export type OrderAddressInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    recipientPhone?: boolean | PhoneDefaultArgs<ExtArgs>
  }
  export type OrderAddressIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    recipientPhone?: boolean | PhoneDefaultArgs<ExtArgs>
  }

  export type $OrderAddressPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrderAddress"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
      recipientPhone: Prisma.$PhonePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      sourceAddressId: string | null
      recipientType: $Enums.RecipientType
      recipientName: string
      recipientPhoneId: string
      fullAddress: string
      street: string
      number: string | null
      block: string | null
      staircase: string | null
      floor: string | null
      door: string | null
      additionalInfo: string | null
      postalCode: string
      city: string
      province: string | null
      country: string
      gmapsPlaceId: string | null
      addressOrigin: $Enums.AddressOrigin
      confirmedAt: Date
      confirmedVia: $Enums.ConfirmedVia
    }, ExtArgs["result"]["orderAddress"]>
    composites: {}
  }

  type OrderAddressGetPayload<S extends boolean | null | undefined | OrderAddressDefaultArgs> = $Result.GetResult<Prisma.$OrderAddressPayload, S>

  type OrderAddressCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrderAddressFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrderAddressCountAggregateInputType | true
    }

  export interface OrderAddressDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrderAddress'], meta: { name: 'OrderAddress' } }
    /**
     * Find zero or one OrderAddress that matches the filter.
     * @param {OrderAddressFindUniqueArgs} args - Arguments to find a OrderAddress
     * @example
     * // Get one OrderAddress
     * const orderAddress = await prisma.orderAddress.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderAddressFindUniqueArgs>(args: SelectSubset<T, OrderAddressFindUniqueArgs<ExtArgs>>): Prisma__OrderAddressClient<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OrderAddress that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrderAddressFindUniqueOrThrowArgs} args - Arguments to find a OrderAddress
     * @example
     * // Get one OrderAddress
     * const orderAddress = await prisma.orderAddress.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderAddressFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderAddressFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderAddressClient<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OrderAddress that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAddressFindFirstArgs} args - Arguments to find a OrderAddress
     * @example
     * // Get one OrderAddress
     * const orderAddress = await prisma.orderAddress.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderAddressFindFirstArgs>(args?: SelectSubset<T, OrderAddressFindFirstArgs<ExtArgs>>): Prisma__OrderAddressClient<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OrderAddress that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAddressFindFirstOrThrowArgs} args - Arguments to find a OrderAddress
     * @example
     * // Get one OrderAddress
     * const orderAddress = await prisma.orderAddress.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderAddressFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderAddressFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderAddressClient<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OrderAddresses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAddressFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrderAddresses
     * const orderAddresses = await prisma.orderAddress.findMany()
     * 
     * // Get first 10 OrderAddresses
     * const orderAddresses = await prisma.orderAddress.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderAddressWithIdOnly = await prisma.orderAddress.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderAddressFindManyArgs>(args?: SelectSubset<T, OrderAddressFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OrderAddress.
     * @param {OrderAddressCreateArgs} args - Arguments to create a OrderAddress.
     * @example
     * // Create one OrderAddress
     * const OrderAddress = await prisma.orderAddress.create({
     *   data: {
     *     // ... data to create a OrderAddress
     *   }
     * })
     * 
     */
    create<T extends OrderAddressCreateArgs>(args: SelectSubset<T, OrderAddressCreateArgs<ExtArgs>>): Prisma__OrderAddressClient<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OrderAddresses.
     * @param {OrderAddressCreateManyArgs} args - Arguments to create many OrderAddresses.
     * @example
     * // Create many OrderAddresses
     * const orderAddress = await prisma.orderAddress.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderAddressCreateManyArgs>(args?: SelectSubset<T, OrderAddressCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrderAddresses and returns the data saved in the database.
     * @param {OrderAddressCreateManyAndReturnArgs} args - Arguments to create many OrderAddresses.
     * @example
     * // Create many OrderAddresses
     * const orderAddress = await prisma.orderAddress.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrderAddresses and only return the `id`
     * const orderAddressWithIdOnly = await prisma.orderAddress.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderAddressCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderAddressCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OrderAddress.
     * @param {OrderAddressDeleteArgs} args - Arguments to delete one OrderAddress.
     * @example
     * // Delete one OrderAddress
     * const OrderAddress = await prisma.orderAddress.delete({
     *   where: {
     *     // ... filter to delete one OrderAddress
     *   }
     * })
     * 
     */
    delete<T extends OrderAddressDeleteArgs>(args: SelectSubset<T, OrderAddressDeleteArgs<ExtArgs>>): Prisma__OrderAddressClient<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OrderAddress.
     * @param {OrderAddressUpdateArgs} args - Arguments to update one OrderAddress.
     * @example
     * // Update one OrderAddress
     * const orderAddress = await prisma.orderAddress.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderAddressUpdateArgs>(args: SelectSubset<T, OrderAddressUpdateArgs<ExtArgs>>): Prisma__OrderAddressClient<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OrderAddresses.
     * @param {OrderAddressDeleteManyArgs} args - Arguments to filter OrderAddresses to delete.
     * @example
     * // Delete a few OrderAddresses
     * const { count } = await prisma.orderAddress.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderAddressDeleteManyArgs>(args?: SelectSubset<T, OrderAddressDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderAddresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAddressUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrderAddresses
     * const orderAddress = await prisma.orderAddress.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderAddressUpdateManyArgs>(args: SelectSubset<T, OrderAddressUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OrderAddress.
     * @param {OrderAddressUpsertArgs} args - Arguments to update or create a OrderAddress.
     * @example
     * // Update or create a OrderAddress
     * const orderAddress = await prisma.orderAddress.upsert({
     *   create: {
     *     // ... data to create a OrderAddress
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrderAddress we want to update
     *   }
     * })
     */
    upsert<T extends OrderAddressUpsertArgs>(args: SelectSubset<T, OrderAddressUpsertArgs<ExtArgs>>): Prisma__OrderAddressClient<$Result.GetResult<Prisma.$OrderAddressPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OrderAddresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAddressCountArgs} args - Arguments to filter OrderAddresses to count.
     * @example
     * // Count the number of OrderAddresses
     * const count = await prisma.orderAddress.count({
     *   where: {
     *     // ... the filter for the OrderAddresses we want to count
     *   }
     * })
    **/
    count<T extends OrderAddressCountArgs>(
      args?: Subset<T, OrderAddressCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderAddressCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrderAddress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAddressAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAddressAggregateArgs>(args: Subset<T, OrderAddressAggregateArgs>): Prisma.PrismaPromise<GetOrderAddressAggregateType<T>>

    /**
     * Group by OrderAddress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAddressGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderAddressGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderAddressGroupByArgs['orderBy'] }
        : { orderBy?: OrderAddressGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderAddressGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderAddressGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrderAddress model
   */
  readonly fields: OrderAddressFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrderAddress.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderAddressClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    recipientPhone<T extends PhoneDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PhoneDefaultArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrderAddress model
   */ 
  interface OrderAddressFieldRefs {
    readonly id: FieldRef<"OrderAddress", 'String'>
    readonly orderId: FieldRef<"OrderAddress", 'String'>
    readonly sourceAddressId: FieldRef<"OrderAddress", 'String'>
    readonly recipientType: FieldRef<"OrderAddress", 'RecipientType'>
    readonly recipientName: FieldRef<"OrderAddress", 'String'>
    readonly recipientPhoneId: FieldRef<"OrderAddress", 'String'>
    readonly fullAddress: FieldRef<"OrderAddress", 'String'>
    readonly street: FieldRef<"OrderAddress", 'String'>
    readonly number: FieldRef<"OrderAddress", 'String'>
    readonly block: FieldRef<"OrderAddress", 'String'>
    readonly staircase: FieldRef<"OrderAddress", 'String'>
    readonly floor: FieldRef<"OrderAddress", 'String'>
    readonly door: FieldRef<"OrderAddress", 'String'>
    readonly additionalInfo: FieldRef<"OrderAddress", 'String'>
    readonly postalCode: FieldRef<"OrderAddress", 'String'>
    readonly city: FieldRef<"OrderAddress", 'String'>
    readonly province: FieldRef<"OrderAddress", 'String'>
    readonly country: FieldRef<"OrderAddress", 'String'>
    readonly gmapsPlaceId: FieldRef<"OrderAddress", 'String'>
    readonly addressOrigin: FieldRef<"OrderAddress", 'AddressOrigin'>
    readonly confirmedAt: FieldRef<"OrderAddress", 'DateTime'>
    readonly confirmedVia: FieldRef<"OrderAddress", 'ConfirmedVia'>
  }
    

  // Custom InputTypes
  /**
   * OrderAddress findUnique
   */
  export type OrderAddressFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    /**
     * Filter, which OrderAddress to fetch.
     */
    where: OrderAddressWhereUniqueInput
  }

  /**
   * OrderAddress findUniqueOrThrow
   */
  export type OrderAddressFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    /**
     * Filter, which OrderAddress to fetch.
     */
    where: OrderAddressWhereUniqueInput
  }

  /**
   * OrderAddress findFirst
   */
  export type OrderAddressFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    /**
     * Filter, which OrderAddress to fetch.
     */
    where?: OrderAddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderAddresses to fetch.
     */
    orderBy?: OrderAddressOrderByWithRelationInput | OrderAddressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderAddresses.
     */
    cursor?: OrderAddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderAddresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderAddresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderAddresses.
     */
    distinct?: OrderAddressScalarFieldEnum | OrderAddressScalarFieldEnum[]
  }

  /**
   * OrderAddress findFirstOrThrow
   */
  export type OrderAddressFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    /**
     * Filter, which OrderAddress to fetch.
     */
    where?: OrderAddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderAddresses to fetch.
     */
    orderBy?: OrderAddressOrderByWithRelationInput | OrderAddressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderAddresses.
     */
    cursor?: OrderAddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderAddresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderAddresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderAddresses.
     */
    distinct?: OrderAddressScalarFieldEnum | OrderAddressScalarFieldEnum[]
  }

  /**
   * OrderAddress findMany
   */
  export type OrderAddressFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    /**
     * Filter, which OrderAddresses to fetch.
     */
    where?: OrderAddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderAddresses to fetch.
     */
    orderBy?: OrderAddressOrderByWithRelationInput | OrderAddressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrderAddresses.
     */
    cursor?: OrderAddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderAddresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderAddresses.
     */
    skip?: number
    distinct?: OrderAddressScalarFieldEnum | OrderAddressScalarFieldEnum[]
  }

  /**
   * OrderAddress create
   */
  export type OrderAddressCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    /**
     * The data needed to create a OrderAddress.
     */
    data: XOR<OrderAddressCreateInput, OrderAddressUncheckedCreateInput>
  }

  /**
   * OrderAddress createMany
   */
  export type OrderAddressCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrderAddresses.
     */
    data: OrderAddressCreateManyInput | OrderAddressCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrderAddress createManyAndReturn
   */
  export type OrderAddressCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OrderAddresses.
     */
    data: OrderAddressCreateManyInput | OrderAddressCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderAddress update
   */
  export type OrderAddressUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    /**
     * The data needed to update a OrderAddress.
     */
    data: XOR<OrderAddressUpdateInput, OrderAddressUncheckedUpdateInput>
    /**
     * Choose, which OrderAddress to update.
     */
    where: OrderAddressWhereUniqueInput
  }

  /**
   * OrderAddress updateMany
   */
  export type OrderAddressUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrderAddresses.
     */
    data: XOR<OrderAddressUpdateManyMutationInput, OrderAddressUncheckedUpdateManyInput>
    /**
     * Filter which OrderAddresses to update
     */
    where?: OrderAddressWhereInput
  }

  /**
   * OrderAddress upsert
   */
  export type OrderAddressUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    /**
     * The filter to search for the OrderAddress to update in case it exists.
     */
    where: OrderAddressWhereUniqueInput
    /**
     * In case the OrderAddress found by the `where` argument doesn't exist, create a new OrderAddress with this data.
     */
    create: XOR<OrderAddressCreateInput, OrderAddressUncheckedCreateInput>
    /**
     * In case the OrderAddress was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderAddressUpdateInput, OrderAddressUncheckedUpdateInput>
  }

  /**
   * OrderAddress delete
   */
  export type OrderAddressDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
    /**
     * Filter which OrderAddress to delete.
     */
    where: OrderAddressWhereUniqueInput
  }

  /**
   * OrderAddress deleteMany
   */
  export type OrderAddressDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderAddresses to delete
     */
    where?: OrderAddressWhereInput
  }

  /**
   * OrderAddress without action
   */
  export type OrderAddressDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderAddress
     */
    select?: OrderAddressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderAddressInclude<ExtArgs> | null
  }


  /**
   * Model GiftRecipient
   */

  export type AggregateGiftRecipient = {
    _count: GiftRecipientCountAggregateOutputType | null
    _min: GiftRecipientMinAggregateOutputType | null
    _max: GiftRecipientMaxAggregateOutputType | null
  }

  export type GiftRecipientMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    phoneId: string | null
    recipientUserId: string | null
    firstName: string | null
    lastName: string | null
    note: string | null
    status: $Enums.GiftRecipientStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GiftRecipientMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    phoneId: string | null
    recipientUserId: string | null
    firstName: string | null
    lastName: string | null
    note: string | null
    status: $Enums.GiftRecipientStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GiftRecipientCountAggregateOutputType = {
    id: number
    orderId: number
    phoneId: number
    recipientUserId: number
    firstName: number
    lastName: number
    note: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GiftRecipientMinAggregateInputType = {
    id?: true
    orderId?: true
    phoneId?: true
    recipientUserId?: true
    firstName?: true
    lastName?: true
    note?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GiftRecipientMaxAggregateInputType = {
    id?: true
    orderId?: true
    phoneId?: true
    recipientUserId?: true
    firstName?: true
    lastName?: true
    note?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GiftRecipientCountAggregateInputType = {
    id?: true
    orderId?: true
    phoneId?: true
    recipientUserId?: true
    firstName?: true
    lastName?: true
    note?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GiftRecipientAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GiftRecipient to aggregate.
     */
    where?: GiftRecipientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GiftRecipients to fetch.
     */
    orderBy?: GiftRecipientOrderByWithRelationInput | GiftRecipientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GiftRecipientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GiftRecipients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GiftRecipients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GiftRecipients
    **/
    _count?: true | GiftRecipientCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GiftRecipientMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GiftRecipientMaxAggregateInputType
  }

  export type GetGiftRecipientAggregateType<T extends GiftRecipientAggregateArgs> = {
        [P in keyof T & keyof AggregateGiftRecipient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGiftRecipient[P]>
      : GetScalarType<T[P], AggregateGiftRecipient[P]>
  }




  export type GiftRecipientGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GiftRecipientWhereInput
    orderBy?: GiftRecipientOrderByWithAggregationInput | GiftRecipientOrderByWithAggregationInput[]
    by: GiftRecipientScalarFieldEnum[] | GiftRecipientScalarFieldEnum
    having?: GiftRecipientScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GiftRecipientCountAggregateInputType | true
    _min?: GiftRecipientMinAggregateInputType
    _max?: GiftRecipientMaxAggregateInputType
  }

  export type GiftRecipientGroupByOutputType = {
    id: string
    orderId: string
    phoneId: string
    recipientUserId: string
    firstName: string
    lastName: string
    note: string | null
    status: $Enums.GiftRecipientStatus
    createdAt: Date
    updatedAt: Date
    _count: GiftRecipientCountAggregateOutputType | null
    _min: GiftRecipientMinAggregateOutputType | null
    _max: GiftRecipientMaxAggregateOutputType | null
  }

  type GetGiftRecipientGroupByPayload<T extends GiftRecipientGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GiftRecipientGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GiftRecipientGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GiftRecipientGroupByOutputType[P]>
            : GetScalarType<T[P], GiftRecipientGroupByOutputType[P]>
        }
      >
    >


  export type GiftRecipientSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    phoneId?: boolean
    recipientUserId?: boolean
    firstName?: boolean
    lastName?: boolean
    note?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    phone?: boolean | PhoneDefaultArgs<ExtArgs>
    recipientUser?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["giftRecipient"]>

  export type GiftRecipientSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    phoneId?: boolean
    recipientUserId?: boolean
    firstName?: boolean
    lastName?: boolean
    note?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    phone?: boolean | PhoneDefaultArgs<ExtArgs>
    recipientUser?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["giftRecipient"]>

  export type GiftRecipientSelectScalar = {
    id?: boolean
    orderId?: boolean
    phoneId?: boolean
    recipientUserId?: boolean
    firstName?: boolean
    lastName?: boolean
    note?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GiftRecipientInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    phone?: boolean | PhoneDefaultArgs<ExtArgs>
    recipientUser?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type GiftRecipientIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    phone?: boolean | PhoneDefaultArgs<ExtArgs>
    recipientUser?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $GiftRecipientPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GiftRecipient"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
      phone: Prisma.$PhonePayload<ExtArgs>
      recipientUser: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      phoneId: string
      recipientUserId: string
      firstName: string
      lastName: string
      note: string | null
      status: $Enums.GiftRecipientStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["giftRecipient"]>
    composites: {}
  }

  type GiftRecipientGetPayload<S extends boolean | null | undefined | GiftRecipientDefaultArgs> = $Result.GetResult<Prisma.$GiftRecipientPayload, S>

  type GiftRecipientCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GiftRecipientFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GiftRecipientCountAggregateInputType | true
    }

  export interface GiftRecipientDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GiftRecipient'], meta: { name: 'GiftRecipient' } }
    /**
     * Find zero or one GiftRecipient that matches the filter.
     * @param {GiftRecipientFindUniqueArgs} args - Arguments to find a GiftRecipient
     * @example
     * // Get one GiftRecipient
     * const giftRecipient = await prisma.giftRecipient.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GiftRecipientFindUniqueArgs>(args: SelectSubset<T, GiftRecipientFindUniqueArgs<ExtArgs>>): Prisma__GiftRecipientClient<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GiftRecipient that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GiftRecipientFindUniqueOrThrowArgs} args - Arguments to find a GiftRecipient
     * @example
     * // Get one GiftRecipient
     * const giftRecipient = await prisma.giftRecipient.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GiftRecipientFindUniqueOrThrowArgs>(args: SelectSubset<T, GiftRecipientFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GiftRecipientClient<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GiftRecipient that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiftRecipientFindFirstArgs} args - Arguments to find a GiftRecipient
     * @example
     * // Get one GiftRecipient
     * const giftRecipient = await prisma.giftRecipient.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GiftRecipientFindFirstArgs>(args?: SelectSubset<T, GiftRecipientFindFirstArgs<ExtArgs>>): Prisma__GiftRecipientClient<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GiftRecipient that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiftRecipientFindFirstOrThrowArgs} args - Arguments to find a GiftRecipient
     * @example
     * // Get one GiftRecipient
     * const giftRecipient = await prisma.giftRecipient.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GiftRecipientFindFirstOrThrowArgs>(args?: SelectSubset<T, GiftRecipientFindFirstOrThrowArgs<ExtArgs>>): Prisma__GiftRecipientClient<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GiftRecipients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiftRecipientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GiftRecipients
     * const giftRecipients = await prisma.giftRecipient.findMany()
     * 
     * // Get first 10 GiftRecipients
     * const giftRecipients = await prisma.giftRecipient.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const giftRecipientWithIdOnly = await prisma.giftRecipient.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GiftRecipientFindManyArgs>(args?: SelectSubset<T, GiftRecipientFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GiftRecipient.
     * @param {GiftRecipientCreateArgs} args - Arguments to create a GiftRecipient.
     * @example
     * // Create one GiftRecipient
     * const GiftRecipient = await prisma.giftRecipient.create({
     *   data: {
     *     // ... data to create a GiftRecipient
     *   }
     * })
     * 
     */
    create<T extends GiftRecipientCreateArgs>(args: SelectSubset<T, GiftRecipientCreateArgs<ExtArgs>>): Prisma__GiftRecipientClient<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GiftRecipients.
     * @param {GiftRecipientCreateManyArgs} args - Arguments to create many GiftRecipients.
     * @example
     * // Create many GiftRecipients
     * const giftRecipient = await prisma.giftRecipient.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GiftRecipientCreateManyArgs>(args?: SelectSubset<T, GiftRecipientCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GiftRecipients and returns the data saved in the database.
     * @param {GiftRecipientCreateManyAndReturnArgs} args - Arguments to create many GiftRecipients.
     * @example
     * // Create many GiftRecipients
     * const giftRecipient = await prisma.giftRecipient.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GiftRecipients and only return the `id`
     * const giftRecipientWithIdOnly = await prisma.giftRecipient.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GiftRecipientCreateManyAndReturnArgs>(args?: SelectSubset<T, GiftRecipientCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GiftRecipient.
     * @param {GiftRecipientDeleteArgs} args - Arguments to delete one GiftRecipient.
     * @example
     * // Delete one GiftRecipient
     * const GiftRecipient = await prisma.giftRecipient.delete({
     *   where: {
     *     // ... filter to delete one GiftRecipient
     *   }
     * })
     * 
     */
    delete<T extends GiftRecipientDeleteArgs>(args: SelectSubset<T, GiftRecipientDeleteArgs<ExtArgs>>): Prisma__GiftRecipientClient<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GiftRecipient.
     * @param {GiftRecipientUpdateArgs} args - Arguments to update one GiftRecipient.
     * @example
     * // Update one GiftRecipient
     * const giftRecipient = await prisma.giftRecipient.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GiftRecipientUpdateArgs>(args: SelectSubset<T, GiftRecipientUpdateArgs<ExtArgs>>): Prisma__GiftRecipientClient<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GiftRecipients.
     * @param {GiftRecipientDeleteManyArgs} args - Arguments to filter GiftRecipients to delete.
     * @example
     * // Delete a few GiftRecipients
     * const { count } = await prisma.giftRecipient.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GiftRecipientDeleteManyArgs>(args?: SelectSubset<T, GiftRecipientDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GiftRecipients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiftRecipientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GiftRecipients
     * const giftRecipient = await prisma.giftRecipient.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GiftRecipientUpdateManyArgs>(args: SelectSubset<T, GiftRecipientUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GiftRecipient.
     * @param {GiftRecipientUpsertArgs} args - Arguments to update or create a GiftRecipient.
     * @example
     * // Update or create a GiftRecipient
     * const giftRecipient = await prisma.giftRecipient.upsert({
     *   create: {
     *     // ... data to create a GiftRecipient
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GiftRecipient we want to update
     *   }
     * })
     */
    upsert<T extends GiftRecipientUpsertArgs>(args: SelectSubset<T, GiftRecipientUpsertArgs<ExtArgs>>): Prisma__GiftRecipientClient<$Result.GetResult<Prisma.$GiftRecipientPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GiftRecipients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiftRecipientCountArgs} args - Arguments to filter GiftRecipients to count.
     * @example
     * // Count the number of GiftRecipients
     * const count = await prisma.giftRecipient.count({
     *   where: {
     *     // ... the filter for the GiftRecipients we want to count
     *   }
     * })
    **/
    count<T extends GiftRecipientCountArgs>(
      args?: Subset<T, GiftRecipientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GiftRecipientCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GiftRecipient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiftRecipientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GiftRecipientAggregateArgs>(args: Subset<T, GiftRecipientAggregateArgs>): Prisma.PrismaPromise<GetGiftRecipientAggregateType<T>>

    /**
     * Group by GiftRecipient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiftRecipientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GiftRecipientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GiftRecipientGroupByArgs['orderBy'] }
        : { orderBy?: GiftRecipientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GiftRecipientGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGiftRecipientGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GiftRecipient model
   */
  readonly fields: GiftRecipientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GiftRecipient.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GiftRecipientClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    phone<T extends PhoneDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PhoneDefaultArgs<ExtArgs>>): Prisma__PhoneClient<$Result.GetResult<Prisma.$PhonePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    recipientUser<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GiftRecipient model
   */ 
  interface GiftRecipientFieldRefs {
    readonly id: FieldRef<"GiftRecipient", 'String'>
    readonly orderId: FieldRef<"GiftRecipient", 'String'>
    readonly phoneId: FieldRef<"GiftRecipient", 'String'>
    readonly recipientUserId: FieldRef<"GiftRecipient", 'String'>
    readonly firstName: FieldRef<"GiftRecipient", 'String'>
    readonly lastName: FieldRef<"GiftRecipient", 'String'>
    readonly note: FieldRef<"GiftRecipient", 'String'>
    readonly status: FieldRef<"GiftRecipient", 'GiftRecipientStatus'>
    readonly createdAt: FieldRef<"GiftRecipient", 'DateTime'>
    readonly updatedAt: FieldRef<"GiftRecipient", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GiftRecipient findUnique
   */
  export type GiftRecipientFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    /**
     * Filter, which GiftRecipient to fetch.
     */
    where: GiftRecipientWhereUniqueInput
  }

  /**
   * GiftRecipient findUniqueOrThrow
   */
  export type GiftRecipientFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    /**
     * Filter, which GiftRecipient to fetch.
     */
    where: GiftRecipientWhereUniqueInput
  }

  /**
   * GiftRecipient findFirst
   */
  export type GiftRecipientFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    /**
     * Filter, which GiftRecipient to fetch.
     */
    where?: GiftRecipientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GiftRecipients to fetch.
     */
    orderBy?: GiftRecipientOrderByWithRelationInput | GiftRecipientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GiftRecipients.
     */
    cursor?: GiftRecipientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GiftRecipients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GiftRecipients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GiftRecipients.
     */
    distinct?: GiftRecipientScalarFieldEnum | GiftRecipientScalarFieldEnum[]
  }

  /**
   * GiftRecipient findFirstOrThrow
   */
  export type GiftRecipientFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    /**
     * Filter, which GiftRecipient to fetch.
     */
    where?: GiftRecipientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GiftRecipients to fetch.
     */
    orderBy?: GiftRecipientOrderByWithRelationInput | GiftRecipientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GiftRecipients.
     */
    cursor?: GiftRecipientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GiftRecipients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GiftRecipients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GiftRecipients.
     */
    distinct?: GiftRecipientScalarFieldEnum | GiftRecipientScalarFieldEnum[]
  }

  /**
   * GiftRecipient findMany
   */
  export type GiftRecipientFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    /**
     * Filter, which GiftRecipients to fetch.
     */
    where?: GiftRecipientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GiftRecipients to fetch.
     */
    orderBy?: GiftRecipientOrderByWithRelationInput | GiftRecipientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GiftRecipients.
     */
    cursor?: GiftRecipientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GiftRecipients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GiftRecipients.
     */
    skip?: number
    distinct?: GiftRecipientScalarFieldEnum | GiftRecipientScalarFieldEnum[]
  }

  /**
   * GiftRecipient create
   */
  export type GiftRecipientCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    /**
     * The data needed to create a GiftRecipient.
     */
    data: XOR<GiftRecipientCreateInput, GiftRecipientUncheckedCreateInput>
  }

  /**
   * GiftRecipient createMany
   */
  export type GiftRecipientCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GiftRecipients.
     */
    data: GiftRecipientCreateManyInput | GiftRecipientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GiftRecipient createManyAndReturn
   */
  export type GiftRecipientCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GiftRecipients.
     */
    data: GiftRecipientCreateManyInput | GiftRecipientCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GiftRecipient update
   */
  export type GiftRecipientUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    /**
     * The data needed to update a GiftRecipient.
     */
    data: XOR<GiftRecipientUpdateInput, GiftRecipientUncheckedUpdateInput>
    /**
     * Choose, which GiftRecipient to update.
     */
    where: GiftRecipientWhereUniqueInput
  }

  /**
   * GiftRecipient updateMany
   */
  export type GiftRecipientUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GiftRecipients.
     */
    data: XOR<GiftRecipientUpdateManyMutationInput, GiftRecipientUncheckedUpdateManyInput>
    /**
     * Filter which GiftRecipients to update
     */
    where?: GiftRecipientWhereInput
  }

  /**
   * GiftRecipient upsert
   */
  export type GiftRecipientUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    /**
     * The filter to search for the GiftRecipient to update in case it exists.
     */
    where: GiftRecipientWhereUniqueInput
    /**
     * In case the GiftRecipient found by the `where` argument doesn't exist, create a new GiftRecipient with this data.
     */
    create: XOR<GiftRecipientCreateInput, GiftRecipientUncheckedCreateInput>
    /**
     * In case the GiftRecipient was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GiftRecipientUpdateInput, GiftRecipientUncheckedUpdateInput>
  }

  /**
   * GiftRecipient delete
   */
  export type GiftRecipientDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
    /**
     * Filter which GiftRecipient to delete.
     */
    where: GiftRecipientWhereUniqueInput
  }

  /**
   * GiftRecipient deleteMany
   */
  export type GiftRecipientDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GiftRecipients to delete
     */
    where?: GiftRecipientWhereInput
  }

  /**
   * GiftRecipient without action
   */
  export type GiftRecipientDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiftRecipient
     */
    select?: GiftRecipientSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GiftRecipientInclude<ExtArgs> | null
  }


  /**
   * Model Conversation
   */

  export type AggregateConversation = {
    _count: ConversationCountAggregateOutputType | null
    _min: ConversationMinAggregateOutputType | null
    _max: ConversationMaxAggregateOutputType | null
  }

  export type ConversationMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    userId: string | null
    conversationType: $Enums.ConversationType | null
    userType: $Enums.UserType | null
    status: $Enums.ConversationStatus | null
    isRegisteredAdresles: boolean | null
    isRegisteredEcommerce: boolean | null
    hasAddressAdresles: boolean | null
    hasAddressEcommerce: boolean | null
    startedAt: Date | null
    completedAt: Date | null
  }

  export type ConversationMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    userId: string | null
    conversationType: $Enums.ConversationType | null
    userType: $Enums.UserType | null
    status: $Enums.ConversationStatus | null
    isRegisteredAdresles: boolean | null
    isRegisteredEcommerce: boolean | null
    hasAddressAdresles: boolean | null
    hasAddressEcommerce: boolean | null
    startedAt: Date | null
    completedAt: Date | null
  }

  export type ConversationCountAggregateOutputType = {
    id: number
    orderId: number
    userId: number
    conversationType: number
    userType: number
    status: number
    isRegisteredAdresles: number
    isRegisteredEcommerce: number
    hasAddressAdresles: number
    hasAddressEcommerce: number
    startedAt: number
    completedAt: number
    _all: number
  }


  export type ConversationMinAggregateInputType = {
    id?: true
    orderId?: true
    userId?: true
    conversationType?: true
    userType?: true
    status?: true
    isRegisteredAdresles?: true
    isRegisteredEcommerce?: true
    hasAddressAdresles?: true
    hasAddressEcommerce?: true
    startedAt?: true
    completedAt?: true
  }

  export type ConversationMaxAggregateInputType = {
    id?: true
    orderId?: true
    userId?: true
    conversationType?: true
    userType?: true
    status?: true
    isRegisteredAdresles?: true
    isRegisteredEcommerce?: true
    hasAddressAdresles?: true
    hasAddressEcommerce?: true
    startedAt?: true
    completedAt?: true
  }

  export type ConversationCountAggregateInputType = {
    id?: true
    orderId?: true
    userId?: true
    conversationType?: true
    userType?: true
    status?: true
    isRegisteredAdresles?: true
    isRegisteredEcommerce?: true
    hasAddressAdresles?: true
    hasAddressEcommerce?: true
    startedAt?: true
    completedAt?: true
    _all?: true
  }

  export type ConversationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Conversation to aggregate.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Conversations
    **/
    _count?: true | ConversationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConversationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConversationMaxAggregateInputType
  }

  export type GetConversationAggregateType<T extends ConversationAggregateArgs> = {
        [P in keyof T & keyof AggregateConversation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConversation[P]>
      : GetScalarType<T[P], AggregateConversation[P]>
  }




  export type ConversationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationWhereInput
    orderBy?: ConversationOrderByWithAggregationInput | ConversationOrderByWithAggregationInput[]
    by: ConversationScalarFieldEnum[] | ConversationScalarFieldEnum
    having?: ConversationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConversationCountAggregateInputType | true
    _min?: ConversationMinAggregateInputType
    _max?: ConversationMaxAggregateInputType
  }

  export type ConversationGroupByOutputType = {
    id: string
    orderId: string
    userId: string
    conversationType: $Enums.ConversationType
    userType: $Enums.UserType
    status: $Enums.ConversationStatus
    isRegisteredAdresles: boolean | null
    isRegisteredEcommerce: boolean | null
    hasAddressAdresles: boolean | null
    hasAddressEcommerce: boolean | null
    startedAt: Date
    completedAt: Date | null
    _count: ConversationCountAggregateOutputType | null
    _min: ConversationMinAggregateOutputType | null
    _max: ConversationMaxAggregateOutputType | null
  }

  type GetConversationGroupByPayload<T extends ConversationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConversationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConversationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConversationGroupByOutputType[P]>
            : GetScalarType<T[P], ConversationGroupByOutputType[P]>
        }
      >
    >


  export type ConversationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    userId?: boolean
    conversationType?: boolean
    userType?: boolean
    status?: boolean
    isRegisteredAdresles?: boolean
    isRegisteredEcommerce?: boolean
    hasAddressAdresles?: boolean
    hasAddressEcommerce?: boolean
    startedAt?: boolean
    completedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversation"]>

  export type ConversationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    userId?: boolean
    conversationType?: boolean
    userType?: boolean
    status?: boolean
    isRegisteredAdresles?: boolean
    isRegisteredEcommerce?: boolean
    hasAddressAdresles?: boolean
    hasAddressEcommerce?: boolean
    startedAt?: boolean
    completedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversation"]>

  export type ConversationSelectScalar = {
    id?: boolean
    orderId?: boolean
    userId?: boolean
    conversationType?: boolean
    userType?: boolean
    status?: boolean
    isRegisteredAdresles?: boolean
    isRegisteredEcommerce?: boolean
    hasAddressAdresles?: boolean
    hasAddressEcommerce?: boolean
    startedAt?: boolean
    completedAt?: boolean
  }

  export type ConversationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type ConversationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $ConversationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Conversation"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      userId: string
      conversationType: $Enums.ConversationType
      userType: $Enums.UserType
      status: $Enums.ConversationStatus
      isRegisteredAdresles: boolean | null
      isRegisteredEcommerce: boolean | null
      hasAddressAdresles: boolean | null
      hasAddressEcommerce: boolean | null
      startedAt: Date
      completedAt: Date | null
    }, ExtArgs["result"]["conversation"]>
    composites: {}
  }

  type ConversationGetPayload<S extends boolean | null | undefined | ConversationDefaultArgs> = $Result.GetResult<Prisma.$ConversationPayload, S>

  type ConversationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ConversationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ConversationCountAggregateInputType | true
    }

  export interface ConversationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Conversation'], meta: { name: 'Conversation' } }
    /**
     * Find zero or one Conversation that matches the filter.
     * @param {ConversationFindUniqueArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConversationFindUniqueArgs>(args: SelectSubset<T, ConversationFindUniqueArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Conversation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ConversationFindUniqueOrThrowArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConversationFindUniqueOrThrowArgs>(args: SelectSubset<T, ConversationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Conversation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationFindFirstArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConversationFindFirstArgs>(args?: SelectSubset<T, ConversationFindFirstArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Conversation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationFindFirstOrThrowArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConversationFindFirstOrThrowArgs>(args?: SelectSubset<T, ConversationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Conversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Conversations
     * const conversations = await prisma.conversation.findMany()
     * 
     * // Get first 10 Conversations
     * const conversations = await prisma.conversation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conversationWithIdOnly = await prisma.conversation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConversationFindManyArgs>(args?: SelectSubset<T, ConversationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Conversation.
     * @param {ConversationCreateArgs} args - Arguments to create a Conversation.
     * @example
     * // Create one Conversation
     * const Conversation = await prisma.conversation.create({
     *   data: {
     *     // ... data to create a Conversation
     *   }
     * })
     * 
     */
    create<T extends ConversationCreateArgs>(args: SelectSubset<T, ConversationCreateArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Conversations.
     * @param {ConversationCreateManyArgs} args - Arguments to create many Conversations.
     * @example
     * // Create many Conversations
     * const conversation = await prisma.conversation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConversationCreateManyArgs>(args?: SelectSubset<T, ConversationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Conversations and returns the data saved in the database.
     * @param {ConversationCreateManyAndReturnArgs} args - Arguments to create many Conversations.
     * @example
     * // Create many Conversations
     * const conversation = await prisma.conversation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Conversations and only return the `id`
     * const conversationWithIdOnly = await prisma.conversation.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConversationCreateManyAndReturnArgs>(args?: SelectSubset<T, ConversationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Conversation.
     * @param {ConversationDeleteArgs} args - Arguments to delete one Conversation.
     * @example
     * // Delete one Conversation
     * const Conversation = await prisma.conversation.delete({
     *   where: {
     *     // ... filter to delete one Conversation
     *   }
     * })
     * 
     */
    delete<T extends ConversationDeleteArgs>(args: SelectSubset<T, ConversationDeleteArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Conversation.
     * @param {ConversationUpdateArgs} args - Arguments to update one Conversation.
     * @example
     * // Update one Conversation
     * const conversation = await prisma.conversation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConversationUpdateArgs>(args: SelectSubset<T, ConversationUpdateArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Conversations.
     * @param {ConversationDeleteManyArgs} args - Arguments to filter Conversations to delete.
     * @example
     * // Delete a few Conversations
     * const { count } = await prisma.conversation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConversationDeleteManyArgs>(args?: SelectSubset<T, ConversationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Conversations
     * const conversation = await prisma.conversation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConversationUpdateManyArgs>(args: SelectSubset<T, ConversationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Conversation.
     * @param {ConversationUpsertArgs} args - Arguments to update or create a Conversation.
     * @example
     * // Update or create a Conversation
     * const conversation = await prisma.conversation.upsert({
     *   create: {
     *     // ... data to create a Conversation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Conversation we want to update
     *   }
     * })
     */
    upsert<T extends ConversationUpsertArgs>(args: SelectSubset<T, ConversationUpsertArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationCountArgs} args - Arguments to filter Conversations to count.
     * @example
     * // Count the number of Conversations
     * const count = await prisma.conversation.count({
     *   where: {
     *     // ... the filter for the Conversations we want to count
     *   }
     * })
    **/
    count<T extends ConversationCountArgs>(
      args?: Subset<T, ConversationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConversationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConversationAggregateArgs>(args: Subset<T, ConversationAggregateArgs>): Prisma.PrismaPromise<GetConversationAggregateType<T>>

    /**
     * Group by Conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConversationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConversationGroupByArgs['orderBy'] }
        : { orderBy?: ConversationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConversationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Conversation model
   */
  readonly fields: ConversationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Conversation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConversationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Conversation model
   */ 
  interface ConversationFieldRefs {
    readonly id: FieldRef<"Conversation", 'String'>
    readonly orderId: FieldRef<"Conversation", 'String'>
    readonly userId: FieldRef<"Conversation", 'String'>
    readonly conversationType: FieldRef<"Conversation", 'ConversationType'>
    readonly userType: FieldRef<"Conversation", 'UserType'>
    readonly status: FieldRef<"Conversation", 'ConversationStatus'>
    readonly isRegisteredAdresles: FieldRef<"Conversation", 'Boolean'>
    readonly isRegisteredEcommerce: FieldRef<"Conversation", 'Boolean'>
    readonly hasAddressAdresles: FieldRef<"Conversation", 'Boolean'>
    readonly hasAddressEcommerce: FieldRef<"Conversation", 'Boolean'>
    readonly startedAt: FieldRef<"Conversation", 'DateTime'>
    readonly completedAt: FieldRef<"Conversation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Conversation findUnique
   */
  export type ConversationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation findUniqueOrThrow
   */
  export type ConversationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation findFirst
   */
  export type ConversationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conversations.
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conversations.
     */
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Conversation findFirstOrThrow
   */
  export type ConversationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conversations.
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conversations.
     */
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Conversation findMany
   */
  export type ConversationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversations to fetch.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Conversations.
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Conversation create
   */
  export type ConversationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * The data needed to create a Conversation.
     */
    data: XOR<ConversationCreateInput, ConversationUncheckedCreateInput>
  }

  /**
   * Conversation createMany
   */
  export type ConversationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Conversations.
     */
    data: ConversationCreateManyInput | ConversationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Conversation createManyAndReturn
   */
  export type ConversationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Conversations.
     */
    data: ConversationCreateManyInput | ConversationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Conversation update
   */
  export type ConversationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * The data needed to update a Conversation.
     */
    data: XOR<ConversationUpdateInput, ConversationUncheckedUpdateInput>
    /**
     * Choose, which Conversation to update.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation updateMany
   */
  export type ConversationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Conversations.
     */
    data: XOR<ConversationUpdateManyMutationInput, ConversationUncheckedUpdateManyInput>
    /**
     * Filter which Conversations to update
     */
    where?: ConversationWhereInput
  }

  /**
   * Conversation upsert
   */
  export type ConversationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * The filter to search for the Conversation to update in case it exists.
     */
    where: ConversationWhereUniqueInput
    /**
     * In case the Conversation found by the `where` argument doesn't exist, create a new Conversation with this data.
     */
    create: XOR<ConversationCreateInput, ConversationUncheckedCreateInput>
    /**
     * In case the Conversation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConversationUpdateInput, ConversationUncheckedUpdateInput>
  }

  /**
   * Conversation delete
   */
  export type ConversationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter which Conversation to delete.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation deleteMany
   */
  export type ConversationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Conversations to delete
     */
    where?: ConversationWhereInput
  }

  /**
   * Conversation without action
   */
  export type ConversationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const PhoneScalarFieldEnum: {
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

  export type PhoneScalarFieldEnum = (typeof PhoneScalarFieldEnum)[keyof typeof PhoneScalarFieldEnum]


  export const EcommerceScalarFieldEnum: {
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

  export type EcommerceScalarFieldEnum = (typeof EcommerceScalarFieldEnum)[keyof typeof EcommerceScalarFieldEnum]


  export const StoreScalarFieldEnum: {
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

  export type StoreScalarFieldEnum = (typeof StoreScalarFieldEnum)[keyof typeof StoreScalarFieldEnum]


  export const UserScalarFieldEnum: {
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

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AddressScalarFieldEnum: {
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

  export type AddressScalarFieldEnum = (typeof AddressScalarFieldEnum)[keyof typeof AddressScalarFieldEnum]


  export const OrderScalarFieldEnum: {
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

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const OrderAddressScalarFieldEnum: {
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

  export type OrderAddressScalarFieldEnum = (typeof OrderAddressScalarFieldEnum)[keyof typeof OrderAddressScalarFieldEnum]


  export const GiftRecipientScalarFieldEnum: {
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

  export type GiftRecipientScalarFieldEnum = (typeof GiftRecipientScalarFieldEnum)[keyof typeof GiftRecipientScalarFieldEnum]


  export const ConversationScalarFieldEnum: {
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

  export type ConversationScalarFieldEnum = (typeof ConversationScalarFieldEnum)[keyof typeof ConversationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'PhoneNumberType'
   */
  export type EnumPhoneNumberTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PhoneNumberType'>
    


  /**
   * Reference to a field of type 'PhoneNumberType[]'
   */
  export type ListEnumPhoneNumberTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PhoneNumberType[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'EcommerceStatus'
   */
  export type EnumEcommerceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EcommerceStatus'>
    


  /**
   * Reference to a field of type 'EcommerceStatus[]'
   */
  export type ListEnumEcommerceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EcommerceStatus[]'>
    


  /**
   * Reference to a field of type 'StorePlatform'
   */
  export type EnumStorePlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StorePlatform'>
    


  /**
   * Reference to a field of type 'StorePlatform[]'
   */
  export type ListEnumStorePlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StorePlatform[]'>
    


  /**
   * Reference to a field of type 'StoreStatus'
   */
  export type EnumStoreStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StoreStatus'>
    


  /**
   * Reference to a field of type 'StoreStatus[]'
   */
  export type ListEnumStoreStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StoreStatus[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'OrderStatus'
   */
  export type EnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus'>
    


  /**
   * Reference to a field of type 'OrderStatus[]'
   */
  export type ListEnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus[]'>
    


  /**
   * Reference to a field of type 'OrderMode'
   */
  export type EnumOrderModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderMode'>
    


  /**
   * Reference to a field of type 'OrderMode[]'
   */
  export type ListEnumOrderModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderMode[]'>
    


  /**
   * Reference to a field of type 'PaymentType'
   */
  export type EnumPaymentTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentType'>
    


  /**
   * Reference to a field of type 'PaymentType[]'
   */
  export type ListEnumPaymentTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentType[]'>
    


  /**
   * Reference to a field of type 'StatusSource'
   */
  export type EnumStatusSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatusSource'>
    


  /**
   * Reference to a field of type 'StatusSource[]'
   */
  export type ListEnumStatusSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatusSource[]'>
    


  /**
   * Reference to a field of type 'RecipientType'
   */
  export type EnumRecipientTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RecipientType'>
    


  /**
   * Reference to a field of type 'RecipientType[]'
   */
  export type ListEnumRecipientTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RecipientType[]'>
    


  /**
   * Reference to a field of type 'AddressOrigin'
   */
  export type EnumAddressOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AddressOrigin'>
    


  /**
   * Reference to a field of type 'AddressOrigin[]'
   */
  export type ListEnumAddressOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AddressOrigin[]'>
    


  /**
   * Reference to a field of type 'ConfirmedVia'
   */
  export type EnumConfirmedViaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConfirmedVia'>
    


  /**
   * Reference to a field of type 'ConfirmedVia[]'
   */
  export type ListEnumConfirmedViaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConfirmedVia[]'>
    


  /**
   * Reference to a field of type 'GiftRecipientStatus'
   */
  export type EnumGiftRecipientStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GiftRecipientStatus'>
    


  /**
   * Reference to a field of type 'GiftRecipientStatus[]'
   */
  export type ListEnumGiftRecipientStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GiftRecipientStatus[]'>
    


  /**
   * Reference to a field of type 'ConversationType'
   */
  export type EnumConversationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConversationType'>
    


  /**
   * Reference to a field of type 'ConversationType[]'
   */
  export type ListEnumConversationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConversationType[]'>
    


  /**
   * Reference to a field of type 'UserType'
   */
  export type EnumUserTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserType'>
    


  /**
   * Reference to a field of type 'UserType[]'
   */
  export type ListEnumUserTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserType[]'>
    


  /**
   * Reference to a field of type 'ConversationStatus'
   */
  export type EnumConversationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConversationStatus'>
    


  /**
   * Reference to a field of type 'ConversationStatus[]'
   */
  export type ListEnumConversationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConversationStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type PhoneWhereInput = {
    AND?: PhoneWhereInput | PhoneWhereInput[]
    OR?: PhoneWhereInput[]
    NOT?: PhoneWhereInput | PhoneWhereInput[]
    id?: StringFilter<"Phone"> | string
    e164?: StringFilter<"Phone"> | string
    countryCallingCode?: StringFilter<"Phone"> | string
    nationalNumber?: StringFilter<"Phone"> | string
    country?: StringNullableFilter<"Phone"> | string | null
    numberType?: EnumPhoneNumberTypeNullableFilter<"Phone"> | $Enums.PhoneNumberType | null
    isValid?: BoolFilter<"Phone"> | boolean
    formattedNational?: StringNullableFilter<"Phone"> | string | null
    formattedInternational?: StringNullableFilter<"Phone"> | string | null
    createdAt?: DateTimeFilter<"Phone"> | Date | string
    users?: UserListRelationFilter
    giftRecipients?: GiftRecipientListRelationFilter
    orderAddresses?: OrderAddressListRelationFilter
  }

  export type PhoneOrderByWithRelationInput = {
    id?: SortOrder
    e164?: SortOrder
    countryCallingCode?: SortOrder
    nationalNumber?: SortOrder
    country?: SortOrderInput | SortOrder
    numberType?: SortOrderInput | SortOrder
    isValid?: SortOrder
    formattedNational?: SortOrderInput | SortOrder
    formattedInternational?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    users?: UserOrderByRelationAggregateInput
    giftRecipients?: GiftRecipientOrderByRelationAggregateInput
    orderAddresses?: OrderAddressOrderByRelationAggregateInput
  }

  export type PhoneWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    e164?: string
    AND?: PhoneWhereInput | PhoneWhereInput[]
    OR?: PhoneWhereInput[]
    NOT?: PhoneWhereInput | PhoneWhereInput[]
    countryCallingCode?: StringFilter<"Phone"> | string
    nationalNumber?: StringFilter<"Phone"> | string
    country?: StringNullableFilter<"Phone"> | string | null
    numberType?: EnumPhoneNumberTypeNullableFilter<"Phone"> | $Enums.PhoneNumberType | null
    isValid?: BoolFilter<"Phone"> | boolean
    formattedNational?: StringNullableFilter<"Phone"> | string | null
    formattedInternational?: StringNullableFilter<"Phone"> | string | null
    createdAt?: DateTimeFilter<"Phone"> | Date | string
    users?: UserListRelationFilter
    giftRecipients?: GiftRecipientListRelationFilter
    orderAddresses?: OrderAddressListRelationFilter
  }, "id" | "e164">

  export type PhoneOrderByWithAggregationInput = {
    id?: SortOrder
    e164?: SortOrder
    countryCallingCode?: SortOrder
    nationalNumber?: SortOrder
    country?: SortOrderInput | SortOrder
    numberType?: SortOrderInput | SortOrder
    isValid?: SortOrder
    formattedNational?: SortOrderInput | SortOrder
    formattedInternational?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PhoneCountOrderByAggregateInput
    _max?: PhoneMaxOrderByAggregateInput
    _min?: PhoneMinOrderByAggregateInput
  }

  export type PhoneScalarWhereWithAggregatesInput = {
    AND?: PhoneScalarWhereWithAggregatesInput | PhoneScalarWhereWithAggregatesInput[]
    OR?: PhoneScalarWhereWithAggregatesInput[]
    NOT?: PhoneScalarWhereWithAggregatesInput | PhoneScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Phone"> | string
    e164?: StringWithAggregatesFilter<"Phone"> | string
    countryCallingCode?: StringWithAggregatesFilter<"Phone"> | string
    nationalNumber?: StringWithAggregatesFilter<"Phone"> | string
    country?: StringNullableWithAggregatesFilter<"Phone"> | string | null
    numberType?: EnumPhoneNumberTypeNullableWithAggregatesFilter<"Phone"> | $Enums.PhoneNumberType | null
    isValid?: BoolWithAggregatesFilter<"Phone"> | boolean
    formattedNational?: StringNullableWithAggregatesFilter<"Phone"> | string | null
    formattedInternational?: StringNullableWithAggregatesFilter<"Phone"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Phone"> | Date | string
  }

  export type EcommerceWhereInput = {
    AND?: EcommerceWhereInput | EcommerceWhereInput[]
    OR?: EcommerceWhereInput[]
    NOT?: EcommerceWhereInput | EcommerceWhereInput[]
    id?: StringFilter<"Ecommerce"> | string
    taxId?: StringFilter<"Ecommerce"> | string
    legalName?: StringFilter<"Ecommerce"> | string
    commercialName?: StringNullableFilter<"Ecommerce"> | string | null
    email?: StringFilter<"Ecommerce"> | string
    phone?: StringNullableFilter<"Ecommerce"> | string | null
    country?: StringFilter<"Ecommerce"> | string
    billingAddress?: JsonNullableFilter<"Ecommerce">
    trialEndsAt?: DateTimeNullableFilter<"Ecommerce"> | Date | string | null
    status?: EnumEcommerceStatusFilter<"Ecommerce"> | $Enums.EcommerceStatus
    createdAt?: DateTimeFilter<"Ecommerce"> | Date | string
    updatedAt?: DateTimeFilter<"Ecommerce"> | Date | string
    stores?: StoreListRelationFilter
  }

  export type EcommerceOrderByWithRelationInput = {
    id?: SortOrder
    taxId?: SortOrder
    legalName?: SortOrder
    commercialName?: SortOrderInput | SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    country?: SortOrder
    billingAddress?: SortOrderInput | SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    stores?: StoreOrderByRelationAggregateInput
  }

  export type EcommerceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    taxId?: string
    AND?: EcommerceWhereInput | EcommerceWhereInput[]
    OR?: EcommerceWhereInput[]
    NOT?: EcommerceWhereInput | EcommerceWhereInput[]
    legalName?: StringFilter<"Ecommerce"> | string
    commercialName?: StringNullableFilter<"Ecommerce"> | string | null
    email?: StringFilter<"Ecommerce"> | string
    phone?: StringNullableFilter<"Ecommerce"> | string | null
    country?: StringFilter<"Ecommerce"> | string
    billingAddress?: JsonNullableFilter<"Ecommerce">
    trialEndsAt?: DateTimeNullableFilter<"Ecommerce"> | Date | string | null
    status?: EnumEcommerceStatusFilter<"Ecommerce"> | $Enums.EcommerceStatus
    createdAt?: DateTimeFilter<"Ecommerce"> | Date | string
    updatedAt?: DateTimeFilter<"Ecommerce"> | Date | string
    stores?: StoreListRelationFilter
  }, "id" | "taxId">

  export type EcommerceOrderByWithAggregationInput = {
    id?: SortOrder
    taxId?: SortOrder
    legalName?: SortOrder
    commercialName?: SortOrderInput | SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    country?: SortOrder
    billingAddress?: SortOrderInput | SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EcommerceCountOrderByAggregateInput
    _max?: EcommerceMaxOrderByAggregateInput
    _min?: EcommerceMinOrderByAggregateInput
  }

  export type EcommerceScalarWhereWithAggregatesInput = {
    AND?: EcommerceScalarWhereWithAggregatesInput | EcommerceScalarWhereWithAggregatesInput[]
    OR?: EcommerceScalarWhereWithAggregatesInput[]
    NOT?: EcommerceScalarWhereWithAggregatesInput | EcommerceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Ecommerce"> | string
    taxId?: StringWithAggregatesFilter<"Ecommerce"> | string
    legalName?: StringWithAggregatesFilter<"Ecommerce"> | string
    commercialName?: StringNullableWithAggregatesFilter<"Ecommerce"> | string | null
    email?: StringWithAggregatesFilter<"Ecommerce"> | string
    phone?: StringNullableWithAggregatesFilter<"Ecommerce"> | string | null
    country?: StringWithAggregatesFilter<"Ecommerce"> | string
    billingAddress?: JsonNullableWithAggregatesFilter<"Ecommerce">
    trialEndsAt?: DateTimeNullableWithAggregatesFilter<"Ecommerce"> | Date | string | null
    status?: EnumEcommerceStatusWithAggregatesFilter<"Ecommerce"> | $Enums.EcommerceStatus
    createdAt?: DateTimeWithAggregatesFilter<"Ecommerce"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Ecommerce"> | Date | string
  }

  export type StoreWhereInput = {
    AND?: StoreWhereInput | StoreWhereInput[]
    OR?: StoreWhereInput[]
    NOT?: StoreWhereInput | StoreWhereInput[]
    id?: StringFilter<"Store"> | string
    ecommerceId?: StringFilter<"Store"> | string
    url?: StringFilter<"Store"> | string
    name?: StringFilter<"Store"> | string
    platform?: EnumStorePlatformFilter<"Store"> | $Enums.StorePlatform
    defaultLanguage?: StringFilter<"Store"> | string
    defaultCurrency?: StringFilter<"Store"> | string
    timezone?: StringFilter<"Store"> | string
    logoUrl?: StringNullableFilter<"Store"> | string | null
    status?: EnumStoreStatusFilter<"Store"> | $Enums.StoreStatus
    createdAt?: DateTimeFilter<"Store"> | Date | string
    updatedAt?: DateTimeFilter<"Store"> | Date | string
    ecommerce?: XOR<EcommerceRelationFilter, EcommerceWhereInput>
    orders?: OrderListRelationFilter
  }

  export type StoreOrderByWithRelationInput = {
    id?: SortOrder
    ecommerceId?: SortOrder
    url?: SortOrder
    name?: SortOrder
    platform?: SortOrder
    defaultLanguage?: SortOrder
    defaultCurrency?: SortOrder
    timezone?: SortOrder
    logoUrl?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ecommerce?: EcommerceOrderByWithRelationInput
    orders?: OrderOrderByRelationAggregateInput
  }

  export type StoreWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    url?: string
    AND?: StoreWhereInput | StoreWhereInput[]
    OR?: StoreWhereInput[]
    NOT?: StoreWhereInput | StoreWhereInput[]
    ecommerceId?: StringFilter<"Store"> | string
    name?: StringFilter<"Store"> | string
    platform?: EnumStorePlatformFilter<"Store"> | $Enums.StorePlatform
    defaultLanguage?: StringFilter<"Store"> | string
    defaultCurrency?: StringFilter<"Store"> | string
    timezone?: StringFilter<"Store"> | string
    logoUrl?: StringNullableFilter<"Store"> | string | null
    status?: EnumStoreStatusFilter<"Store"> | $Enums.StoreStatus
    createdAt?: DateTimeFilter<"Store"> | Date | string
    updatedAt?: DateTimeFilter<"Store"> | Date | string
    ecommerce?: XOR<EcommerceRelationFilter, EcommerceWhereInput>
    orders?: OrderListRelationFilter
  }, "id" | "url">

  export type StoreOrderByWithAggregationInput = {
    id?: SortOrder
    ecommerceId?: SortOrder
    url?: SortOrder
    name?: SortOrder
    platform?: SortOrder
    defaultLanguage?: SortOrder
    defaultCurrency?: SortOrder
    timezone?: SortOrder
    logoUrl?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StoreCountOrderByAggregateInput
    _max?: StoreMaxOrderByAggregateInput
    _min?: StoreMinOrderByAggregateInput
  }

  export type StoreScalarWhereWithAggregatesInput = {
    AND?: StoreScalarWhereWithAggregatesInput | StoreScalarWhereWithAggregatesInput[]
    OR?: StoreScalarWhereWithAggregatesInput[]
    NOT?: StoreScalarWhereWithAggregatesInput | StoreScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Store"> | string
    ecommerceId?: StringWithAggregatesFilter<"Store"> | string
    url?: StringWithAggregatesFilter<"Store"> | string
    name?: StringWithAggregatesFilter<"Store"> | string
    platform?: EnumStorePlatformWithAggregatesFilter<"Store"> | $Enums.StorePlatform
    defaultLanguage?: StringWithAggregatesFilter<"Store"> | string
    defaultCurrency?: StringWithAggregatesFilter<"Store"> | string
    timezone?: StringWithAggregatesFilter<"Store"> | string
    logoUrl?: StringNullableWithAggregatesFilter<"Store"> | string | null
    status?: EnumStoreStatusWithAggregatesFilter<"Store"> | $Enums.StoreStatus
    createdAt?: DateTimeWithAggregatesFilter<"Store"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Store"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    phoneId?: StringNullableFilter<"User"> | string | null
    firstName?: StringNullableFilter<"User"> | string | null
    lastName?: StringNullableFilter<"User"> | string | null
    email?: StringNullableFilter<"User"> | string | null
    preferredLanguage?: StringNullableFilter<"User"> | string | null
    isRegistered?: BoolFilter<"User"> | boolean
    registeredAt?: DateTimeNullableFilter<"User"> | Date | string | null
    lastInteractionAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isDeleted?: BoolFilter<"User"> | boolean
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    phone?: XOR<PhoneNullableRelationFilter, PhoneWhereInput> | null
    orders?: OrderListRelationFilter
    addresses?: AddressListRelationFilter
    giftRecipients?: GiftRecipientListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    phoneId?: SortOrderInput | SortOrder
    firstName?: SortOrderInput | SortOrder
    lastName?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    preferredLanguage?: SortOrderInput | SortOrder
    isRegistered?: SortOrder
    registeredAt?: SortOrderInput | SortOrder
    lastInteractionAt?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    phone?: PhoneOrderByWithRelationInput
    orders?: OrderOrderByRelationAggregateInput
    addresses?: AddressOrderByRelationAggregateInput
    giftRecipients?: GiftRecipientOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    phoneId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    firstName?: StringNullableFilter<"User"> | string | null
    lastName?: StringNullableFilter<"User"> | string | null
    email?: StringNullableFilter<"User"> | string | null
    preferredLanguage?: StringNullableFilter<"User"> | string | null
    isRegistered?: BoolFilter<"User"> | boolean
    registeredAt?: DateTimeNullableFilter<"User"> | Date | string | null
    lastInteractionAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isDeleted?: BoolFilter<"User"> | boolean
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    phone?: XOR<PhoneNullableRelationFilter, PhoneWhereInput> | null
    orders?: OrderListRelationFilter
    addresses?: AddressListRelationFilter
    giftRecipients?: GiftRecipientListRelationFilter
  }, "id" | "phoneId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    phoneId?: SortOrderInput | SortOrder
    firstName?: SortOrderInput | SortOrder
    lastName?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    preferredLanguage?: SortOrderInput | SortOrder
    isRegistered?: SortOrder
    registeredAt?: SortOrderInput | SortOrder
    lastInteractionAt?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    phoneId?: StringNullableWithAggregatesFilter<"User"> | string | null
    firstName?: StringNullableWithAggregatesFilter<"User"> | string | null
    lastName?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
    preferredLanguage?: StringNullableWithAggregatesFilter<"User"> | string | null
    isRegistered?: BoolWithAggregatesFilter<"User"> | boolean
    registeredAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    lastInteractionAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    isDeleted?: BoolWithAggregatesFilter<"User"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type AddressWhereInput = {
    AND?: AddressWhereInput | AddressWhereInput[]
    OR?: AddressWhereInput[]
    NOT?: AddressWhereInput | AddressWhereInput[]
    id?: StringFilter<"Address"> | string
    userId?: StringFilter<"Address"> | string
    label?: StringNullableFilter<"Address"> | string | null
    fullAddress?: StringFilter<"Address"> | string
    street?: StringFilter<"Address"> | string
    number?: StringNullableFilter<"Address"> | string | null
    block?: StringNullableFilter<"Address"> | string | null
    staircase?: StringNullableFilter<"Address"> | string | null
    floor?: StringNullableFilter<"Address"> | string | null
    door?: StringNullableFilter<"Address"> | string | null
    additionalInfo?: StringNullableFilter<"Address"> | string | null
    postalCode?: StringFilter<"Address"> | string
    city?: StringFilter<"Address"> | string
    province?: StringNullableFilter<"Address"> | string | null
    country?: StringFilter<"Address"> | string
    gmapsPlaceId?: StringNullableFilter<"Address"> | string | null
    latitude?: DecimalNullableFilter<"Address"> | Decimal | DecimalJsLike | number | string | null
    longitude?: DecimalNullableFilter<"Address"> | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFilter<"Address"> | boolean
    isDeleted?: BoolFilter<"Address"> | boolean
    deletedAt?: DateTimeNullableFilter<"Address"> | Date | string | null
    createdAt?: DateTimeFilter<"Address"> | Date | string
    updatedAt?: DateTimeFilter<"Address"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type AddressOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    label?: SortOrderInput | SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrderInput | SortOrder
    block?: SortOrderInput | SortOrder
    staircase?: SortOrderInput | SortOrder
    floor?: SortOrderInput | SortOrder
    door?: SortOrderInput | SortOrder
    additionalInfo?: SortOrderInput | SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrderInput | SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrderInput | SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AddressWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AddressWhereInput | AddressWhereInput[]
    OR?: AddressWhereInput[]
    NOT?: AddressWhereInput | AddressWhereInput[]
    userId?: StringFilter<"Address"> | string
    label?: StringNullableFilter<"Address"> | string | null
    fullAddress?: StringFilter<"Address"> | string
    street?: StringFilter<"Address"> | string
    number?: StringNullableFilter<"Address"> | string | null
    block?: StringNullableFilter<"Address"> | string | null
    staircase?: StringNullableFilter<"Address"> | string | null
    floor?: StringNullableFilter<"Address"> | string | null
    door?: StringNullableFilter<"Address"> | string | null
    additionalInfo?: StringNullableFilter<"Address"> | string | null
    postalCode?: StringFilter<"Address"> | string
    city?: StringFilter<"Address"> | string
    province?: StringNullableFilter<"Address"> | string | null
    country?: StringFilter<"Address"> | string
    gmapsPlaceId?: StringNullableFilter<"Address"> | string | null
    latitude?: DecimalNullableFilter<"Address"> | Decimal | DecimalJsLike | number | string | null
    longitude?: DecimalNullableFilter<"Address"> | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFilter<"Address"> | boolean
    isDeleted?: BoolFilter<"Address"> | boolean
    deletedAt?: DateTimeNullableFilter<"Address"> | Date | string | null
    createdAt?: DateTimeFilter<"Address"> | Date | string
    updatedAt?: DateTimeFilter<"Address"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id">

  export type AddressOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    label?: SortOrderInput | SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrderInput | SortOrder
    block?: SortOrderInput | SortOrder
    staircase?: SortOrderInput | SortOrder
    floor?: SortOrderInput | SortOrder
    door?: SortOrderInput | SortOrder
    additionalInfo?: SortOrderInput | SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrderInput | SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrderInput | SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AddressCountOrderByAggregateInput
    _avg?: AddressAvgOrderByAggregateInput
    _max?: AddressMaxOrderByAggregateInput
    _min?: AddressMinOrderByAggregateInput
    _sum?: AddressSumOrderByAggregateInput
  }

  export type AddressScalarWhereWithAggregatesInput = {
    AND?: AddressScalarWhereWithAggregatesInput | AddressScalarWhereWithAggregatesInput[]
    OR?: AddressScalarWhereWithAggregatesInput[]
    NOT?: AddressScalarWhereWithAggregatesInput | AddressScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Address"> | string
    userId?: StringWithAggregatesFilter<"Address"> | string
    label?: StringNullableWithAggregatesFilter<"Address"> | string | null
    fullAddress?: StringWithAggregatesFilter<"Address"> | string
    street?: StringWithAggregatesFilter<"Address"> | string
    number?: StringNullableWithAggregatesFilter<"Address"> | string | null
    block?: StringNullableWithAggregatesFilter<"Address"> | string | null
    staircase?: StringNullableWithAggregatesFilter<"Address"> | string | null
    floor?: StringNullableWithAggregatesFilter<"Address"> | string | null
    door?: StringNullableWithAggregatesFilter<"Address"> | string | null
    additionalInfo?: StringNullableWithAggregatesFilter<"Address"> | string | null
    postalCode?: StringWithAggregatesFilter<"Address"> | string
    city?: StringWithAggregatesFilter<"Address"> | string
    province?: StringNullableWithAggregatesFilter<"Address"> | string | null
    country?: StringWithAggregatesFilter<"Address"> | string
    gmapsPlaceId?: StringNullableWithAggregatesFilter<"Address"> | string | null
    latitude?: DecimalNullableWithAggregatesFilter<"Address"> | Decimal | DecimalJsLike | number | string | null
    longitude?: DecimalNullableWithAggregatesFilter<"Address"> | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolWithAggregatesFilter<"Address"> | boolean
    isDeleted?: BoolWithAggregatesFilter<"Address"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Address"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Address"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Address"> | Date | string
  }

  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: StringFilter<"Order"> | string
    storeId?: StringFilter<"Order"> | string
    userId?: StringFilter<"Order"> | string
    externalOrderId?: StringFilter<"Order"> | string
    externalOrderNumber?: StringNullableFilter<"Order"> | string | null
    totalAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"Order"> | string
    feePercentage?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    orderMode?: EnumOrderModeFilter<"Order"> | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFilter<"Order"> | $Enums.PaymentType
    isGift?: BoolFilter<"Order"> | boolean
    itemsSummary?: JsonNullableFilter<"Order">
    webhookReceivedAt?: DateTimeFilter<"Order"> | Date | string
    addressConfirmedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    syncedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    statusSource?: EnumStatusSourceNullableFilter<"Order"> | $Enums.StatusSource | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    store?: XOR<StoreRelationFilter, StoreWhereInput>
    user?: XOR<UserRelationFilter, UserWhereInput>
    orderAddress?: XOR<OrderAddressNullableRelationFilter, OrderAddressWhereInput> | null
    giftRecipient?: XOR<GiftRecipientNullableRelationFilter, GiftRecipientWhereInput> | null
    conversations?: ConversationListRelationFilter
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    storeId?: SortOrder
    userId?: SortOrder
    externalOrderId?: SortOrder
    externalOrderNumber?: SortOrderInput | SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    feePercentage?: SortOrder
    feeAmount?: SortOrder
    status?: SortOrder
    orderMode?: SortOrder
    paymentType?: SortOrder
    isGift?: SortOrder
    itemsSummary?: SortOrderInput | SortOrder
    webhookReceivedAt?: SortOrder
    addressConfirmedAt?: SortOrderInput | SortOrder
    syncedAt?: SortOrderInput | SortOrder
    statusSource?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    store?: StoreOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
    orderAddress?: OrderAddressOrderByWithRelationInput
    giftRecipient?: GiftRecipientOrderByWithRelationInput
    conversations?: ConversationOrderByRelationAggregateInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    storeId_externalOrderId?: OrderStoreIdExternalOrderIdCompoundUniqueInput
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    storeId?: StringFilter<"Order"> | string
    userId?: StringFilter<"Order"> | string
    externalOrderId?: StringFilter<"Order"> | string
    externalOrderNumber?: StringNullableFilter<"Order"> | string | null
    totalAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"Order"> | string
    feePercentage?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    orderMode?: EnumOrderModeFilter<"Order"> | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFilter<"Order"> | $Enums.PaymentType
    isGift?: BoolFilter<"Order"> | boolean
    itemsSummary?: JsonNullableFilter<"Order">
    webhookReceivedAt?: DateTimeFilter<"Order"> | Date | string
    addressConfirmedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    syncedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    statusSource?: EnumStatusSourceNullableFilter<"Order"> | $Enums.StatusSource | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    store?: XOR<StoreRelationFilter, StoreWhereInput>
    user?: XOR<UserRelationFilter, UserWhereInput>
    orderAddress?: XOR<OrderAddressNullableRelationFilter, OrderAddressWhereInput> | null
    giftRecipient?: XOR<GiftRecipientNullableRelationFilter, GiftRecipientWhereInput> | null
    conversations?: ConversationListRelationFilter
  }, "id" | "storeId_externalOrderId">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    storeId?: SortOrder
    userId?: SortOrder
    externalOrderId?: SortOrder
    externalOrderNumber?: SortOrderInput | SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    feePercentage?: SortOrder
    feeAmount?: SortOrder
    status?: SortOrder
    orderMode?: SortOrder
    paymentType?: SortOrder
    isGift?: SortOrder
    itemsSummary?: SortOrderInput | SortOrder
    webhookReceivedAt?: SortOrder
    addressConfirmedAt?: SortOrderInput | SortOrder
    syncedAt?: SortOrderInput | SortOrder
    statusSource?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Order"> | string
    storeId?: StringWithAggregatesFilter<"Order"> | string
    userId?: StringWithAggregatesFilter<"Order"> | string
    externalOrderId?: StringWithAggregatesFilter<"Order"> | string
    externalOrderNumber?: StringNullableWithAggregatesFilter<"Order"> | string | null
    totalAmount?: DecimalWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string
    currency?: StringWithAggregatesFilter<"Order"> | string
    feePercentage?: DecimalWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusWithAggregatesFilter<"Order"> | $Enums.OrderStatus
    orderMode?: EnumOrderModeWithAggregatesFilter<"Order"> | $Enums.OrderMode
    paymentType?: EnumPaymentTypeWithAggregatesFilter<"Order"> | $Enums.PaymentType
    isGift?: BoolWithAggregatesFilter<"Order"> | boolean
    itemsSummary?: JsonNullableWithAggregatesFilter<"Order">
    webhookReceivedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    addressConfirmedAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    syncedAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    statusSource?: EnumStatusSourceNullableWithAggregatesFilter<"Order"> | $Enums.StatusSource | null
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
  }

  export type OrderAddressWhereInput = {
    AND?: OrderAddressWhereInput | OrderAddressWhereInput[]
    OR?: OrderAddressWhereInput[]
    NOT?: OrderAddressWhereInput | OrderAddressWhereInput[]
    id?: StringFilter<"OrderAddress"> | string
    orderId?: StringFilter<"OrderAddress"> | string
    sourceAddressId?: StringNullableFilter<"OrderAddress"> | string | null
    recipientType?: EnumRecipientTypeFilter<"OrderAddress"> | $Enums.RecipientType
    recipientName?: StringFilter<"OrderAddress"> | string
    recipientPhoneId?: StringFilter<"OrderAddress"> | string
    fullAddress?: StringFilter<"OrderAddress"> | string
    street?: StringFilter<"OrderAddress"> | string
    number?: StringNullableFilter<"OrderAddress"> | string | null
    block?: StringNullableFilter<"OrderAddress"> | string | null
    staircase?: StringNullableFilter<"OrderAddress"> | string | null
    floor?: StringNullableFilter<"OrderAddress"> | string | null
    door?: StringNullableFilter<"OrderAddress"> | string | null
    additionalInfo?: StringNullableFilter<"OrderAddress"> | string | null
    postalCode?: StringFilter<"OrderAddress"> | string
    city?: StringFilter<"OrderAddress"> | string
    province?: StringNullableFilter<"OrderAddress"> | string | null
    country?: StringFilter<"OrderAddress"> | string
    gmapsPlaceId?: StringNullableFilter<"OrderAddress"> | string | null
    addressOrigin?: EnumAddressOriginFilter<"OrderAddress"> | $Enums.AddressOrigin
    confirmedAt?: DateTimeFilter<"OrderAddress"> | Date | string
    confirmedVia?: EnumConfirmedViaFilter<"OrderAddress"> | $Enums.ConfirmedVia
    order?: XOR<OrderRelationFilter, OrderWhereInput>
    recipientPhone?: XOR<PhoneRelationFilter, PhoneWhereInput>
  }

  export type OrderAddressOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    sourceAddressId?: SortOrderInput | SortOrder
    recipientType?: SortOrder
    recipientName?: SortOrder
    recipientPhoneId?: SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrderInput | SortOrder
    block?: SortOrderInput | SortOrder
    staircase?: SortOrderInput | SortOrder
    floor?: SortOrderInput | SortOrder
    door?: SortOrderInput | SortOrder
    additionalInfo?: SortOrderInput | SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrderInput | SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrderInput | SortOrder
    addressOrigin?: SortOrder
    confirmedAt?: SortOrder
    confirmedVia?: SortOrder
    order?: OrderOrderByWithRelationInput
    recipientPhone?: PhoneOrderByWithRelationInput
  }

  export type OrderAddressWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    orderId?: string
    AND?: OrderAddressWhereInput | OrderAddressWhereInput[]
    OR?: OrderAddressWhereInput[]
    NOT?: OrderAddressWhereInput | OrderAddressWhereInput[]
    sourceAddressId?: StringNullableFilter<"OrderAddress"> | string | null
    recipientType?: EnumRecipientTypeFilter<"OrderAddress"> | $Enums.RecipientType
    recipientName?: StringFilter<"OrderAddress"> | string
    recipientPhoneId?: StringFilter<"OrderAddress"> | string
    fullAddress?: StringFilter<"OrderAddress"> | string
    street?: StringFilter<"OrderAddress"> | string
    number?: StringNullableFilter<"OrderAddress"> | string | null
    block?: StringNullableFilter<"OrderAddress"> | string | null
    staircase?: StringNullableFilter<"OrderAddress"> | string | null
    floor?: StringNullableFilter<"OrderAddress"> | string | null
    door?: StringNullableFilter<"OrderAddress"> | string | null
    additionalInfo?: StringNullableFilter<"OrderAddress"> | string | null
    postalCode?: StringFilter<"OrderAddress"> | string
    city?: StringFilter<"OrderAddress"> | string
    province?: StringNullableFilter<"OrderAddress"> | string | null
    country?: StringFilter<"OrderAddress"> | string
    gmapsPlaceId?: StringNullableFilter<"OrderAddress"> | string | null
    addressOrigin?: EnumAddressOriginFilter<"OrderAddress"> | $Enums.AddressOrigin
    confirmedAt?: DateTimeFilter<"OrderAddress"> | Date | string
    confirmedVia?: EnumConfirmedViaFilter<"OrderAddress"> | $Enums.ConfirmedVia
    order?: XOR<OrderRelationFilter, OrderWhereInput>
    recipientPhone?: XOR<PhoneRelationFilter, PhoneWhereInput>
  }, "id" | "orderId">

  export type OrderAddressOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    sourceAddressId?: SortOrderInput | SortOrder
    recipientType?: SortOrder
    recipientName?: SortOrder
    recipientPhoneId?: SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrderInput | SortOrder
    block?: SortOrderInput | SortOrder
    staircase?: SortOrderInput | SortOrder
    floor?: SortOrderInput | SortOrder
    door?: SortOrderInput | SortOrder
    additionalInfo?: SortOrderInput | SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrderInput | SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrderInput | SortOrder
    addressOrigin?: SortOrder
    confirmedAt?: SortOrder
    confirmedVia?: SortOrder
    _count?: OrderAddressCountOrderByAggregateInput
    _max?: OrderAddressMaxOrderByAggregateInput
    _min?: OrderAddressMinOrderByAggregateInput
  }

  export type OrderAddressScalarWhereWithAggregatesInput = {
    AND?: OrderAddressScalarWhereWithAggregatesInput | OrderAddressScalarWhereWithAggregatesInput[]
    OR?: OrderAddressScalarWhereWithAggregatesInput[]
    NOT?: OrderAddressScalarWhereWithAggregatesInput | OrderAddressScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrderAddress"> | string
    orderId?: StringWithAggregatesFilter<"OrderAddress"> | string
    sourceAddressId?: StringNullableWithAggregatesFilter<"OrderAddress"> | string | null
    recipientType?: EnumRecipientTypeWithAggregatesFilter<"OrderAddress"> | $Enums.RecipientType
    recipientName?: StringWithAggregatesFilter<"OrderAddress"> | string
    recipientPhoneId?: StringWithAggregatesFilter<"OrderAddress"> | string
    fullAddress?: StringWithAggregatesFilter<"OrderAddress"> | string
    street?: StringWithAggregatesFilter<"OrderAddress"> | string
    number?: StringNullableWithAggregatesFilter<"OrderAddress"> | string | null
    block?: StringNullableWithAggregatesFilter<"OrderAddress"> | string | null
    staircase?: StringNullableWithAggregatesFilter<"OrderAddress"> | string | null
    floor?: StringNullableWithAggregatesFilter<"OrderAddress"> | string | null
    door?: StringNullableWithAggregatesFilter<"OrderAddress"> | string | null
    additionalInfo?: StringNullableWithAggregatesFilter<"OrderAddress"> | string | null
    postalCode?: StringWithAggregatesFilter<"OrderAddress"> | string
    city?: StringWithAggregatesFilter<"OrderAddress"> | string
    province?: StringNullableWithAggregatesFilter<"OrderAddress"> | string | null
    country?: StringWithAggregatesFilter<"OrderAddress"> | string
    gmapsPlaceId?: StringNullableWithAggregatesFilter<"OrderAddress"> | string | null
    addressOrigin?: EnumAddressOriginWithAggregatesFilter<"OrderAddress"> | $Enums.AddressOrigin
    confirmedAt?: DateTimeWithAggregatesFilter<"OrderAddress"> | Date | string
    confirmedVia?: EnumConfirmedViaWithAggregatesFilter<"OrderAddress"> | $Enums.ConfirmedVia
  }

  export type GiftRecipientWhereInput = {
    AND?: GiftRecipientWhereInput | GiftRecipientWhereInput[]
    OR?: GiftRecipientWhereInput[]
    NOT?: GiftRecipientWhereInput | GiftRecipientWhereInput[]
    id?: StringFilter<"GiftRecipient"> | string
    orderId?: StringFilter<"GiftRecipient"> | string
    phoneId?: StringFilter<"GiftRecipient"> | string
    recipientUserId?: StringFilter<"GiftRecipient"> | string
    firstName?: StringFilter<"GiftRecipient"> | string
    lastName?: StringFilter<"GiftRecipient"> | string
    note?: StringNullableFilter<"GiftRecipient"> | string | null
    status?: EnumGiftRecipientStatusFilter<"GiftRecipient"> | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFilter<"GiftRecipient"> | Date | string
    updatedAt?: DateTimeFilter<"GiftRecipient"> | Date | string
    order?: XOR<OrderRelationFilter, OrderWhereInput>
    phone?: XOR<PhoneRelationFilter, PhoneWhereInput>
    recipientUser?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type GiftRecipientOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    phoneId?: SortOrder
    recipientUserId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    note?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    order?: OrderOrderByWithRelationInput
    phone?: PhoneOrderByWithRelationInput
    recipientUser?: UserOrderByWithRelationInput
  }

  export type GiftRecipientWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    orderId?: string
    AND?: GiftRecipientWhereInput | GiftRecipientWhereInput[]
    OR?: GiftRecipientWhereInput[]
    NOT?: GiftRecipientWhereInput | GiftRecipientWhereInput[]
    phoneId?: StringFilter<"GiftRecipient"> | string
    recipientUserId?: StringFilter<"GiftRecipient"> | string
    firstName?: StringFilter<"GiftRecipient"> | string
    lastName?: StringFilter<"GiftRecipient"> | string
    note?: StringNullableFilter<"GiftRecipient"> | string | null
    status?: EnumGiftRecipientStatusFilter<"GiftRecipient"> | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFilter<"GiftRecipient"> | Date | string
    updatedAt?: DateTimeFilter<"GiftRecipient"> | Date | string
    order?: XOR<OrderRelationFilter, OrderWhereInput>
    phone?: XOR<PhoneRelationFilter, PhoneWhereInput>
    recipientUser?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "orderId">

  export type GiftRecipientOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    phoneId?: SortOrder
    recipientUserId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    note?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GiftRecipientCountOrderByAggregateInput
    _max?: GiftRecipientMaxOrderByAggregateInput
    _min?: GiftRecipientMinOrderByAggregateInput
  }

  export type GiftRecipientScalarWhereWithAggregatesInput = {
    AND?: GiftRecipientScalarWhereWithAggregatesInput | GiftRecipientScalarWhereWithAggregatesInput[]
    OR?: GiftRecipientScalarWhereWithAggregatesInput[]
    NOT?: GiftRecipientScalarWhereWithAggregatesInput | GiftRecipientScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GiftRecipient"> | string
    orderId?: StringWithAggregatesFilter<"GiftRecipient"> | string
    phoneId?: StringWithAggregatesFilter<"GiftRecipient"> | string
    recipientUserId?: StringWithAggregatesFilter<"GiftRecipient"> | string
    firstName?: StringWithAggregatesFilter<"GiftRecipient"> | string
    lastName?: StringWithAggregatesFilter<"GiftRecipient"> | string
    note?: StringNullableWithAggregatesFilter<"GiftRecipient"> | string | null
    status?: EnumGiftRecipientStatusWithAggregatesFilter<"GiftRecipient"> | $Enums.GiftRecipientStatus
    createdAt?: DateTimeWithAggregatesFilter<"GiftRecipient"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GiftRecipient"> | Date | string
  }

  export type ConversationWhereInput = {
    AND?: ConversationWhereInput | ConversationWhereInput[]
    OR?: ConversationWhereInput[]
    NOT?: ConversationWhereInput | ConversationWhereInput[]
    id?: StringFilter<"Conversation"> | string
    orderId?: StringFilter<"Conversation"> | string
    userId?: StringFilter<"Conversation"> | string
    conversationType?: EnumConversationTypeFilter<"Conversation"> | $Enums.ConversationType
    userType?: EnumUserTypeFilter<"Conversation"> | $Enums.UserType
    status?: EnumConversationStatusFilter<"Conversation"> | $Enums.ConversationStatus
    isRegisteredAdresles?: BoolNullableFilter<"Conversation"> | boolean | null
    isRegisteredEcommerce?: BoolNullableFilter<"Conversation"> | boolean | null
    hasAddressAdresles?: BoolNullableFilter<"Conversation"> | boolean | null
    hasAddressEcommerce?: BoolNullableFilter<"Conversation"> | boolean | null
    startedAt?: DateTimeFilter<"Conversation"> | Date | string
    completedAt?: DateTimeNullableFilter<"Conversation"> | Date | string | null
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }

  export type ConversationOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    userId?: SortOrder
    conversationType?: SortOrder
    userType?: SortOrder
    status?: SortOrder
    isRegisteredAdresles?: SortOrderInput | SortOrder
    isRegisteredEcommerce?: SortOrderInput | SortOrder
    hasAddressAdresles?: SortOrderInput | SortOrder
    hasAddressEcommerce?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    order?: OrderOrderByWithRelationInput
  }

  export type ConversationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConversationWhereInput | ConversationWhereInput[]
    OR?: ConversationWhereInput[]
    NOT?: ConversationWhereInput | ConversationWhereInput[]
    orderId?: StringFilter<"Conversation"> | string
    userId?: StringFilter<"Conversation"> | string
    conversationType?: EnumConversationTypeFilter<"Conversation"> | $Enums.ConversationType
    userType?: EnumUserTypeFilter<"Conversation"> | $Enums.UserType
    status?: EnumConversationStatusFilter<"Conversation"> | $Enums.ConversationStatus
    isRegisteredAdresles?: BoolNullableFilter<"Conversation"> | boolean | null
    isRegisteredEcommerce?: BoolNullableFilter<"Conversation"> | boolean | null
    hasAddressAdresles?: BoolNullableFilter<"Conversation"> | boolean | null
    hasAddressEcommerce?: BoolNullableFilter<"Conversation"> | boolean | null
    startedAt?: DateTimeFilter<"Conversation"> | Date | string
    completedAt?: DateTimeNullableFilter<"Conversation"> | Date | string | null
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }, "id">

  export type ConversationOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    userId?: SortOrder
    conversationType?: SortOrder
    userType?: SortOrder
    status?: SortOrder
    isRegisteredAdresles?: SortOrderInput | SortOrder
    isRegisteredEcommerce?: SortOrderInput | SortOrder
    hasAddressAdresles?: SortOrderInput | SortOrder
    hasAddressEcommerce?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    _count?: ConversationCountOrderByAggregateInput
    _max?: ConversationMaxOrderByAggregateInput
    _min?: ConversationMinOrderByAggregateInput
  }

  export type ConversationScalarWhereWithAggregatesInput = {
    AND?: ConversationScalarWhereWithAggregatesInput | ConversationScalarWhereWithAggregatesInput[]
    OR?: ConversationScalarWhereWithAggregatesInput[]
    NOT?: ConversationScalarWhereWithAggregatesInput | ConversationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Conversation"> | string
    orderId?: StringWithAggregatesFilter<"Conversation"> | string
    userId?: StringWithAggregatesFilter<"Conversation"> | string
    conversationType?: EnumConversationTypeWithAggregatesFilter<"Conversation"> | $Enums.ConversationType
    userType?: EnumUserTypeWithAggregatesFilter<"Conversation"> | $Enums.UserType
    status?: EnumConversationStatusWithAggregatesFilter<"Conversation"> | $Enums.ConversationStatus
    isRegisteredAdresles?: BoolNullableWithAggregatesFilter<"Conversation"> | boolean | null
    isRegisteredEcommerce?: BoolNullableWithAggregatesFilter<"Conversation"> | boolean | null
    hasAddressAdresles?: BoolNullableWithAggregatesFilter<"Conversation"> | boolean | null
    hasAddressEcommerce?: BoolNullableWithAggregatesFilter<"Conversation"> | boolean | null
    startedAt?: DateTimeWithAggregatesFilter<"Conversation"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"Conversation"> | Date | string | null
  }

  export type PhoneCreateInput = {
    id?: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country?: string | null
    numberType?: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational?: string | null
    formattedInternational?: string | null
    createdAt?: Date | string
    users?: UserCreateNestedManyWithoutPhoneInput
    giftRecipients?: GiftRecipientCreateNestedManyWithoutPhoneInput
    orderAddresses?: OrderAddressCreateNestedManyWithoutRecipientPhoneInput
  }

  export type PhoneUncheckedCreateInput = {
    id?: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country?: string | null
    numberType?: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational?: string | null
    formattedInternational?: string | null
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutPhoneInput
    giftRecipients?: GiftRecipientUncheckedCreateNestedManyWithoutPhoneInput
    orderAddresses?: OrderAddressUncheckedCreateNestedManyWithoutRecipientPhoneInput
  }

  export type PhoneUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutPhoneNestedInput
    giftRecipients?: GiftRecipientUpdateManyWithoutPhoneNestedInput
    orderAddresses?: OrderAddressUpdateManyWithoutRecipientPhoneNestedInput
  }

  export type PhoneUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutPhoneNestedInput
    giftRecipients?: GiftRecipientUncheckedUpdateManyWithoutPhoneNestedInput
    orderAddresses?: OrderAddressUncheckedUpdateManyWithoutRecipientPhoneNestedInput
  }

  export type PhoneCreateManyInput = {
    id?: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country?: string | null
    numberType?: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational?: string | null
    formattedInternational?: string | null
    createdAt?: Date | string
  }

  export type PhoneUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PhoneUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EcommerceCreateInput = {
    id?: string
    taxId: string
    legalName: string
    commercialName?: string | null
    email: string
    phone?: string | null
    country: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: Date | string | null
    status?: $Enums.EcommerceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    stores?: StoreCreateNestedManyWithoutEcommerceInput
  }

  export type EcommerceUncheckedCreateInput = {
    id?: string
    taxId: string
    legalName: string
    commercialName?: string | null
    email: string
    phone?: string | null
    country: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: Date | string | null
    status?: $Enums.EcommerceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    stores?: StoreUncheckedCreateNestedManyWithoutEcommerceInput
  }

  export type EcommerceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    taxId?: StringFieldUpdateOperationsInput | string
    legalName?: StringFieldUpdateOperationsInput | string
    commercialName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumEcommerceStatusFieldUpdateOperationsInput | $Enums.EcommerceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stores?: StoreUpdateManyWithoutEcommerceNestedInput
  }

  export type EcommerceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    taxId?: StringFieldUpdateOperationsInput | string
    legalName?: StringFieldUpdateOperationsInput | string
    commercialName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumEcommerceStatusFieldUpdateOperationsInput | $Enums.EcommerceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stores?: StoreUncheckedUpdateManyWithoutEcommerceNestedInput
  }

  export type EcommerceCreateManyInput = {
    id?: string
    taxId: string
    legalName: string
    commercialName?: string | null
    email: string
    phone?: string | null
    country: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: Date | string | null
    status?: $Enums.EcommerceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EcommerceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    taxId?: StringFieldUpdateOperationsInput | string
    legalName?: StringFieldUpdateOperationsInput | string
    commercialName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumEcommerceStatusFieldUpdateOperationsInput | $Enums.EcommerceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EcommerceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    taxId?: StringFieldUpdateOperationsInput | string
    legalName?: StringFieldUpdateOperationsInput | string
    commercialName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumEcommerceStatusFieldUpdateOperationsInput | $Enums.EcommerceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoreCreateInput = {
    id?: string
    url: string
    name: string
    platform?: $Enums.StorePlatform
    defaultLanguage?: string
    defaultCurrency?: string
    timezone?: string
    logoUrl?: string | null
    status?: $Enums.StoreStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    ecommerce: EcommerceCreateNestedOneWithoutStoresInput
    orders?: OrderCreateNestedManyWithoutStoreInput
  }

  export type StoreUncheckedCreateInput = {
    id?: string
    ecommerceId: string
    url: string
    name: string
    platform?: $Enums.StorePlatform
    defaultLanguage?: string
    defaultCurrency?: string
    timezone?: string
    logoUrl?: string | null
    status?: $Enums.StoreStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutStoreInput
  }

  export type StoreUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    platform?: EnumStorePlatformFieldUpdateOperationsInput | $Enums.StorePlatform
    defaultLanguage?: StringFieldUpdateOperationsInput | string
    defaultCurrency?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumStoreStatusFieldUpdateOperationsInput | $Enums.StoreStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ecommerce?: EcommerceUpdateOneRequiredWithoutStoresNestedInput
    orders?: OrderUpdateManyWithoutStoreNestedInput
  }

  export type StoreUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ecommerceId?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    platform?: EnumStorePlatformFieldUpdateOperationsInput | $Enums.StorePlatform
    defaultLanguage?: StringFieldUpdateOperationsInput | string
    defaultCurrency?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumStoreStatusFieldUpdateOperationsInput | $Enums.StoreStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutStoreNestedInput
  }

  export type StoreCreateManyInput = {
    id?: string
    ecommerceId: string
    url: string
    name: string
    platform?: $Enums.StorePlatform
    defaultLanguage?: string
    defaultCurrency?: string
    timezone?: string
    logoUrl?: string | null
    status?: $Enums.StoreStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoreUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    platform?: EnumStorePlatformFieldUpdateOperationsInput | $Enums.StorePlatform
    defaultLanguage?: StringFieldUpdateOperationsInput | string
    defaultCurrency?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumStoreStatusFieldUpdateOperationsInput | $Enums.StoreStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoreUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ecommerceId?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    platform?: EnumStorePlatformFieldUpdateOperationsInput | $Enums.StorePlatform
    defaultLanguage?: StringFieldUpdateOperationsInput | string
    defaultCurrency?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumStoreStatusFieldUpdateOperationsInput | $Enums.StoreStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone?: PhoneCreateNestedOneWithoutUsersInput
    orders?: OrderCreateNestedManyWithoutUserInput
    addresses?: AddressCreateNestedManyWithoutUserInput
    giftRecipients?: GiftRecipientCreateNestedManyWithoutRecipientUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    phoneId?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutUserInput
    addresses?: AddressUncheckedCreateNestedManyWithoutUserInput
    giftRecipients?: GiftRecipientUncheckedCreateNestedManyWithoutRecipientUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: PhoneUpdateOneWithoutUsersNestedInput
    orders?: OrderUpdateManyWithoutUserNestedInput
    addresses?: AddressUpdateManyWithoutUserNestedInput
    giftRecipients?: GiftRecipientUpdateManyWithoutRecipientUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutUserNestedInput
    addresses?: AddressUncheckedUpdateManyWithoutUserNestedInput
    giftRecipients?: GiftRecipientUncheckedUpdateManyWithoutRecipientUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    phoneId?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AddressCreateInput = {
    id?: string
    label?: string | null
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    isDefault?: boolean
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutAddressesInput
  }

  export type AddressUncheckedCreateInput = {
    id?: string
    userId: string
    label?: string | null
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    isDefault?: boolean
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AddressUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAddressesNestedInput
  }

  export type AddressUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AddressCreateManyInput = {
    id?: string
    userId: string
    label?: string | null
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    isDefault?: boolean
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AddressUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AddressUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateInput = {
    id?: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    store: StoreCreateNestedOneWithoutOrdersInput
    user: UserCreateNestedOneWithoutOrdersInput
    orderAddress?: OrderAddressCreateNestedOneWithoutOrderInput
    giftRecipient?: GiftRecipientCreateNestedOneWithoutOrderInput
    conversations?: ConversationCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateInput = {
    id?: string
    storeId: string
    userId: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderAddress?: OrderAddressUncheckedCreateNestedOneWithoutOrderInput
    giftRecipient?: GiftRecipientUncheckedCreateNestedOneWithoutOrderInput
    conversations?: ConversationUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    store?: StoreUpdateOneRequiredWithoutOrdersNestedInput
    user?: UserUpdateOneRequiredWithoutOrdersNestedInput
    orderAddress?: OrderAddressUpdateOneWithoutOrderNestedInput
    giftRecipient?: GiftRecipientUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderAddress?: OrderAddressUncheckedUpdateOneWithoutOrderNestedInput
    giftRecipient?: GiftRecipientUncheckedUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateManyInput = {
    id?: string
    storeId: string
    userId: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderAddressCreateInput = {
    id?: string
    sourceAddressId?: string | null
    recipientType: $Enums.RecipientType
    recipientName: string
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    addressOrigin: $Enums.AddressOrigin
    confirmedAt: Date | string
    confirmedVia: $Enums.ConfirmedVia
    order: OrderCreateNestedOneWithoutOrderAddressInput
    recipientPhone: PhoneCreateNestedOneWithoutOrderAddressesInput
  }

  export type OrderAddressUncheckedCreateInput = {
    id?: string
    orderId: string
    sourceAddressId?: string | null
    recipientType: $Enums.RecipientType
    recipientName: string
    recipientPhoneId: string
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    addressOrigin: $Enums.AddressOrigin
    confirmedAt: Date | string
    confirmedVia: $Enums.ConfirmedVia
  }

  export type OrderAddressUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceAddressId?: NullableStringFieldUpdateOperationsInput | string | null
    recipientType?: EnumRecipientTypeFieldUpdateOperationsInput | $Enums.RecipientType
    recipientName?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    addressOrigin?: EnumAddressOriginFieldUpdateOperationsInput | $Enums.AddressOrigin
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedVia?: EnumConfirmedViaFieldUpdateOperationsInput | $Enums.ConfirmedVia
    order?: OrderUpdateOneRequiredWithoutOrderAddressNestedInput
    recipientPhone?: PhoneUpdateOneRequiredWithoutOrderAddressesNestedInput
  }

  export type OrderAddressUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sourceAddressId?: NullableStringFieldUpdateOperationsInput | string | null
    recipientType?: EnumRecipientTypeFieldUpdateOperationsInput | $Enums.RecipientType
    recipientName?: StringFieldUpdateOperationsInput | string
    recipientPhoneId?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    addressOrigin?: EnumAddressOriginFieldUpdateOperationsInput | $Enums.AddressOrigin
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedVia?: EnumConfirmedViaFieldUpdateOperationsInput | $Enums.ConfirmedVia
  }

  export type OrderAddressCreateManyInput = {
    id?: string
    orderId: string
    sourceAddressId?: string | null
    recipientType: $Enums.RecipientType
    recipientName: string
    recipientPhoneId: string
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    addressOrigin: $Enums.AddressOrigin
    confirmedAt: Date | string
    confirmedVia: $Enums.ConfirmedVia
  }

  export type OrderAddressUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceAddressId?: NullableStringFieldUpdateOperationsInput | string | null
    recipientType?: EnumRecipientTypeFieldUpdateOperationsInput | $Enums.RecipientType
    recipientName?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    addressOrigin?: EnumAddressOriginFieldUpdateOperationsInput | $Enums.AddressOrigin
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedVia?: EnumConfirmedViaFieldUpdateOperationsInput | $Enums.ConfirmedVia
  }

  export type OrderAddressUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sourceAddressId?: NullableStringFieldUpdateOperationsInput | string | null
    recipientType?: EnumRecipientTypeFieldUpdateOperationsInput | $Enums.RecipientType
    recipientName?: StringFieldUpdateOperationsInput | string
    recipientPhoneId?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    addressOrigin?: EnumAddressOriginFieldUpdateOperationsInput | $Enums.AddressOrigin
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedVia?: EnumConfirmedViaFieldUpdateOperationsInput | $Enums.ConfirmedVia
  }

  export type GiftRecipientCreateInput = {
    id?: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutGiftRecipientInput
    phone: PhoneCreateNestedOneWithoutGiftRecipientsInput
    recipientUser: UserCreateNestedOneWithoutGiftRecipientsInput
  }

  export type GiftRecipientUncheckedCreateInput = {
    id?: string
    orderId: string
    phoneId: string
    recipientUserId: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GiftRecipientUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutGiftRecipientNestedInput
    phone?: PhoneUpdateOneRequiredWithoutGiftRecipientsNestedInput
    recipientUser?: UserUpdateOneRequiredWithoutGiftRecipientsNestedInput
  }

  export type GiftRecipientUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    phoneId?: StringFieldUpdateOperationsInput | string
    recipientUserId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GiftRecipientCreateManyInput = {
    id?: string
    orderId: string
    phoneId: string
    recipientUserId: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GiftRecipientUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GiftRecipientUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    phoneId?: StringFieldUpdateOperationsInput | string
    recipientUserId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationCreateInput = {
    id?: string
    userId: string
    conversationType: $Enums.ConversationType
    userType: $Enums.UserType
    status?: $Enums.ConversationStatus
    isRegisteredAdresles?: boolean | null
    isRegisteredEcommerce?: boolean | null
    hasAddressAdresles?: boolean | null
    hasAddressEcommerce?: boolean | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    order: OrderCreateNestedOneWithoutConversationsInput
  }

  export type ConversationUncheckedCreateInput = {
    id?: string
    orderId: string
    userId: string
    conversationType: $Enums.ConversationType
    userType: $Enums.UserType
    status?: $Enums.ConversationStatus
    isRegisteredAdresles?: boolean | null
    isRegisteredEcommerce?: boolean | null
    hasAddressAdresles?: boolean | null
    hasAddressEcommerce?: boolean | null
    startedAt?: Date | string
    completedAt?: Date | string | null
  }

  export type ConversationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    conversationType?: EnumConversationTypeFieldUpdateOperationsInput | $Enums.ConversationType
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus
    isRegisteredAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    isRegisteredEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    order?: OrderUpdateOneRequiredWithoutConversationsNestedInput
  }

  export type ConversationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    conversationType?: EnumConversationTypeFieldUpdateOperationsInput | $Enums.ConversationType
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus
    isRegisteredAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    isRegisteredEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ConversationCreateManyInput = {
    id?: string
    orderId: string
    userId: string
    conversationType: $Enums.ConversationType
    userType: $Enums.UserType
    status?: $Enums.ConversationStatus
    isRegisteredAdresles?: boolean | null
    isRegisteredEcommerce?: boolean | null
    hasAddressAdresles?: boolean | null
    hasAddressEcommerce?: boolean | null
    startedAt?: Date | string
    completedAt?: Date | string | null
  }

  export type ConversationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    conversationType?: EnumConversationTypeFieldUpdateOperationsInput | $Enums.ConversationType
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus
    isRegisteredAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    isRegisteredEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ConversationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    conversationType?: EnumConversationTypeFieldUpdateOperationsInput | $Enums.ConversationType
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus
    isRegisteredAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    isRegisteredEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumPhoneNumberTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PhoneNumberType | EnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.PhoneNumberType[] | ListEnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PhoneNumberType[] | ListEnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPhoneNumberTypeNullableFilter<$PrismaModel> | $Enums.PhoneNumberType | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type GiftRecipientListRelationFilter = {
    every?: GiftRecipientWhereInput
    some?: GiftRecipientWhereInput
    none?: GiftRecipientWhereInput
  }

  export type OrderAddressListRelationFilter = {
    every?: OrderAddressWhereInput
    some?: OrderAddressWhereInput
    none?: OrderAddressWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GiftRecipientOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderAddressOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PhoneCountOrderByAggregateInput = {
    id?: SortOrder
    e164?: SortOrder
    countryCallingCode?: SortOrder
    nationalNumber?: SortOrder
    country?: SortOrder
    numberType?: SortOrder
    isValid?: SortOrder
    formattedNational?: SortOrder
    formattedInternational?: SortOrder
    createdAt?: SortOrder
  }

  export type PhoneMaxOrderByAggregateInput = {
    id?: SortOrder
    e164?: SortOrder
    countryCallingCode?: SortOrder
    nationalNumber?: SortOrder
    country?: SortOrder
    numberType?: SortOrder
    isValid?: SortOrder
    formattedNational?: SortOrder
    formattedInternational?: SortOrder
    createdAt?: SortOrder
  }

  export type PhoneMinOrderByAggregateInput = {
    id?: SortOrder
    e164?: SortOrder
    countryCallingCode?: SortOrder
    nationalNumber?: SortOrder
    country?: SortOrder
    numberType?: SortOrder
    isValid?: SortOrder
    formattedNational?: SortOrder
    formattedInternational?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumPhoneNumberTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PhoneNumberType | EnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.PhoneNumberType[] | ListEnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PhoneNumberType[] | ListEnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPhoneNumberTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.PhoneNumberType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPhoneNumberTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumPhoneNumberTypeNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumEcommerceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EcommerceStatus | EnumEcommerceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EcommerceStatus[] | ListEnumEcommerceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EcommerceStatus[] | ListEnumEcommerceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEcommerceStatusFilter<$PrismaModel> | $Enums.EcommerceStatus
  }

  export type StoreListRelationFilter = {
    every?: StoreWhereInput
    some?: StoreWhereInput
    none?: StoreWhereInput
  }

  export type StoreOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EcommerceCountOrderByAggregateInput = {
    id?: SortOrder
    taxId?: SortOrder
    legalName?: SortOrder
    commercialName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    country?: SortOrder
    billingAddress?: SortOrder
    trialEndsAt?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EcommerceMaxOrderByAggregateInput = {
    id?: SortOrder
    taxId?: SortOrder
    legalName?: SortOrder
    commercialName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    country?: SortOrder
    trialEndsAt?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EcommerceMinOrderByAggregateInput = {
    id?: SortOrder
    taxId?: SortOrder
    legalName?: SortOrder
    commercialName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    country?: SortOrder
    trialEndsAt?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumEcommerceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EcommerceStatus | EnumEcommerceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EcommerceStatus[] | ListEnumEcommerceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EcommerceStatus[] | ListEnumEcommerceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEcommerceStatusWithAggregatesFilter<$PrismaModel> | $Enums.EcommerceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEcommerceStatusFilter<$PrismaModel>
    _max?: NestedEnumEcommerceStatusFilter<$PrismaModel>
  }

  export type EnumStorePlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.StorePlatform | EnumStorePlatformFieldRefInput<$PrismaModel>
    in?: $Enums.StorePlatform[] | ListEnumStorePlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.StorePlatform[] | ListEnumStorePlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumStorePlatformFilter<$PrismaModel> | $Enums.StorePlatform
  }

  export type EnumStoreStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.StoreStatus | EnumStoreStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StoreStatus[] | ListEnumStoreStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoreStatus[] | ListEnumStoreStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStoreStatusFilter<$PrismaModel> | $Enums.StoreStatus
  }

  export type EcommerceRelationFilter = {
    is?: EcommerceWhereInput
    isNot?: EcommerceWhereInput
  }

  export type OrderListRelationFilter = {
    every?: OrderWhereInput
    some?: OrderWhereInput
    none?: OrderWhereInput
  }

  export type OrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StoreCountOrderByAggregateInput = {
    id?: SortOrder
    ecommerceId?: SortOrder
    url?: SortOrder
    name?: SortOrder
    platform?: SortOrder
    defaultLanguage?: SortOrder
    defaultCurrency?: SortOrder
    timezone?: SortOrder
    logoUrl?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StoreMaxOrderByAggregateInput = {
    id?: SortOrder
    ecommerceId?: SortOrder
    url?: SortOrder
    name?: SortOrder
    platform?: SortOrder
    defaultLanguage?: SortOrder
    defaultCurrency?: SortOrder
    timezone?: SortOrder
    logoUrl?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StoreMinOrderByAggregateInput = {
    id?: SortOrder
    ecommerceId?: SortOrder
    url?: SortOrder
    name?: SortOrder
    platform?: SortOrder
    defaultLanguage?: SortOrder
    defaultCurrency?: SortOrder
    timezone?: SortOrder
    logoUrl?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumStorePlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StorePlatform | EnumStorePlatformFieldRefInput<$PrismaModel>
    in?: $Enums.StorePlatform[] | ListEnumStorePlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.StorePlatform[] | ListEnumStorePlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumStorePlatformWithAggregatesFilter<$PrismaModel> | $Enums.StorePlatform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStorePlatformFilter<$PrismaModel>
    _max?: NestedEnumStorePlatformFilter<$PrismaModel>
  }

  export type EnumStoreStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StoreStatus | EnumStoreStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StoreStatus[] | ListEnumStoreStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoreStatus[] | ListEnumStoreStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStoreStatusWithAggregatesFilter<$PrismaModel> | $Enums.StoreStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStoreStatusFilter<$PrismaModel>
    _max?: NestedEnumStoreStatusFilter<$PrismaModel>
  }

  export type PhoneNullableRelationFilter = {
    is?: PhoneWhereInput | null
    isNot?: PhoneWhereInput | null
  }

  export type AddressListRelationFilter = {
    every?: AddressWhereInput
    some?: AddressWhereInput
    none?: AddressWhereInput
  }

  export type AddressOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    phoneId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    preferredLanguage?: SortOrder
    isRegistered?: SortOrder
    registeredAt?: SortOrder
    lastInteractionAt?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    phoneId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    preferredLanguage?: SortOrder
    isRegistered?: SortOrder
    registeredAt?: SortOrder
    lastInteractionAt?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    phoneId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    preferredLanguage?: SortOrder
    isRegistered?: SortOrder
    registeredAt?: SortOrder
    lastInteractionAt?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type AddressCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    label?: SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrder
    block?: SortOrder
    staircase?: SortOrder
    floor?: SortOrder
    door?: SortOrder
    additionalInfo?: SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AddressAvgOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type AddressMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    label?: SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrder
    block?: SortOrder
    staircase?: SortOrder
    floor?: SortOrder
    door?: SortOrder
    additionalInfo?: SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AddressMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    label?: SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrder
    block?: SortOrder
    staircase?: SortOrder
    floor?: SortOrder
    door?: SortOrder
    additionalInfo?: SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AddressSumOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type EnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type EnumOrderModeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderMode | EnumOrderModeFieldRefInput<$PrismaModel>
    in?: $Enums.OrderMode[] | ListEnumOrderModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderMode[] | ListEnumOrderModeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderModeFilter<$PrismaModel> | $Enums.OrderMode
  }

  export type EnumPaymentTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentType | EnumPaymentTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentType[] | ListEnumPaymentTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentType[] | ListEnumPaymentTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentTypeFilter<$PrismaModel> | $Enums.PaymentType
  }

  export type EnumStatusSourceNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusSource | EnumStatusSourceFieldRefInput<$PrismaModel> | null
    in?: $Enums.StatusSource[] | ListEnumStatusSourceFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.StatusSource[] | ListEnumStatusSourceFieldRefInput<$PrismaModel> | null
    not?: NestedEnumStatusSourceNullableFilter<$PrismaModel> | $Enums.StatusSource | null
  }

  export type StoreRelationFilter = {
    is?: StoreWhereInput
    isNot?: StoreWhereInput
  }

  export type OrderAddressNullableRelationFilter = {
    is?: OrderAddressWhereInput | null
    isNot?: OrderAddressWhereInput | null
  }

  export type GiftRecipientNullableRelationFilter = {
    is?: GiftRecipientWhereInput | null
    isNot?: GiftRecipientWhereInput | null
  }

  export type ConversationListRelationFilter = {
    every?: ConversationWhereInput
    some?: ConversationWhereInput
    none?: ConversationWhereInput
  }

  export type ConversationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderStoreIdExternalOrderIdCompoundUniqueInput = {
    storeId: string
    externalOrderId: string
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    storeId?: SortOrder
    userId?: SortOrder
    externalOrderId?: SortOrder
    externalOrderNumber?: SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    feePercentage?: SortOrder
    feeAmount?: SortOrder
    status?: SortOrder
    orderMode?: SortOrder
    paymentType?: SortOrder
    isGift?: SortOrder
    itemsSummary?: SortOrder
    webhookReceivedAt?: SortOrder
    addressConfirmedAt?: SortOrder
    syncedAt?: SortOrder
    statusSource?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    totalAmount?: SortOrder
    feePercentage?: SortOrder
    feeAmount?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    storeId?: SortOrder
    userId?: SortOrder
    externalOrderId?: SortOrder
    externalOrderNumber?: SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    feePercentage?: SortOrder
    feeAmount?: SortOrder
    status?: SortOrder
    orderMode?: SortOrder
    paymentType?: SortOrder
    isGift?: SortOrder
    webhookReceivedAt?: SortOrder
    addressConfirmedAt?: SortOrder
    syncedAt?: SortOrder
    statusSource?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    storeId?: SortOrder
    userId?: SortOrder
    externalOrderId?: SortOrder
    externalOrderNumber?: SortOrder
    totalAmount?: SortOrder
    currency?: SortOrder
    feePercentage?: SortOrder
    feeAmount?: SortOrder
    status?: SortOrder
    orderMode?: SortOrder
    paymentType?: SortOrder
    isGift?: SortOrder
    webhookReceivedAt?: SortOrder
    addressConfirmedAt?: SortOrder
    syncedAt?: SortOrder
    statusSource?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    totalAmount?: SortOrder
    feePercentage?: SortOrder
    feeAmount?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type EnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type EnumOrderModeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderMode | EnumOrderModeFieldRefInput<$PrismaModel>
    in?: $Enums.OrderMode[] | ListEnumOrderModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderMode[] | ListEnumOrderModeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderModeWithAggregatesFilter<$PrismaModel> | $Enums.OrderMode
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderModeFilter<$PrismaModel>
    _max?: NestedEnumOrderModeFilter<$PrismaModel>
  }

  export type EnumPaymentTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentType | EnumPaymentTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentType[] | ListEnumPaymentTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentType[] | ListEnumPaymentTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentTypeWithAggregatesFilter<$PrismaModel> | $Enums.PaymentType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentTypeFilter<$PrismaModel>
    _max?: NestedEnumPaymentTypeFilter<$PrismaModel>
  }

  export type EnumStatusSourceNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusSource | EnumStatusSourceFieldRefInput<$PrismaModel> | null
    in?: $Enums.StatusSource[] | ListEnumStatusSourceFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.StatusSource[] | ListEnumStatusSourceFieldRefInput<$PrismaModel> | null
    not?: NestedEnumStatusSourceNullableWithAggregatesFilter<$PrismaModel> | $Enums.StatusSource | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumStatusSourceNullableFilter<$PrismaModel>
    _max?: NestedEnumStatusSourceNullableFilter<$PrismaModel>
  }

  export type EnumRecipientTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.RecipientType | EnumRecipientTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RecipientType[] | ListEnumRecipientTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RecipientType[] | ListEnumRecipientTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRecipientTypeFilter<$PrismaModel> | $Enums.RecipientType
  }

  export type EnumAddressOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.AddressOrigin | EnumAddressOriginFieldRefInput<$PrismaModel>
    in?: $Enums.AddressOrigin[] | ListEnumAddressOriginFieldRefInput<$PrismaModel>
    notIn?: $Enums.AddressOrigin[] | ListEnumAddressOriginFieldRefInput<$PrismaModel>
    not?: NestedEnumAddressOriginFilter<$PrismaModel> | $Enums.AddressOrigin
  }

  export type EnumConfirmedViaFilter<$PrismaModel = never> = {
    equals?: $Enums.ConfirmedVia | EnumConfirmedViaFieldRefInput<$PrismaModel>
    in?: $Enums.ConfirmedVia[] | ListEnumConfirmedViaFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConfirmedVia[] | ListEnumConfirmedViaFieldRefInput<$PrismaModel>
    not?: NestedEnumConfirmedViaFilter<$PrismaModel> | $Enums.ConfirmedVia
  }

  export type OrderRelationFilter = {
    is?: OrderWhereInput
    isNot?: OrderWhereInput
  }

  export type PhoneRelationFilter = {
    is?: PhoneWhereInput
    isNot?: PhoneWhereInput
  }

  export type OrderAddressCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    sourceAddressId?: SortOrder
    recipientType?: SortOrder
    recipientName?: SortOrder
    recipientPhoneId?: SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrder
    block?: SortOrder
    staircase?: SortOrder
    floor?: SortOrder
    door?: SortOrder
    additionalInfo?: SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrder
    addressOrigin?: SortOrder
    confirmedAt?: SortOrder
    confirmedVia?: SortOrder
  }

  export type OrderAddressMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    sourceAddressId?: SortOrder
    recipientType?: SortOrder
    recipientName?: SortOrder
    recipientPhoneId?: SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrder
    block?: SortOrder
    staircase?: SortOrder
    floor?: SortOrder
    door?: SortOrder
    additionalInfo?: SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrder
    addressOrigin?: SortOrder
    confirmedAt?: SortOrder
    confirmedVia?: SortOrder
  }

  export type OrderAddressMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    sourceAddressId?: SortOrder
    recipientType?: SortOrder
    recipientName?: SortOrder
    recipientPhoneId?: SortOrder
    fullAddress?: SortOrder
    street?: SortOrder
    number?: SortOrder
    block?: SortOrder
    staircase?: SortOrder
    floor?: SortOrder
    door?: SortOrder
    additionalInfo?: SortOrder
    postalCode?: SortOrder
    city?: SortOrder
    province?: SortOrder
    country?: SortOrder
    gmapsPlaceId?: SortOrder
    addressOrigin?: SortOrder
    confirmedAt?: SortOrder
    confirmedVia?: SortOrder
  }

  export type EnumRecipientTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RecipientType | EnumRecipientTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RecipientType[] | ListEnumRecipientTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RecipientType[] | ListEnumRecipientTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRecipientTypeWithAggregatesFilter<$PrismaModel> | $Enums.RecipientType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRecipientTypeFilter<$PrismaModel>
    _max?: NestedEnumRecipientTypeFilter<$PrismaModel>
  }

  export type EnumAddressOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AddressOrigin | EnumAddressOriginFieldRefInput<$PrismaModel>
    in?: $Enums.AddressOrigin[] | ListEnumAddressOriginFieldRefInput<$PrismaModel>
    notIn?: $Enums.AddressOrigin[] | ListEnumAddressOriginFieldRefInput<$PrismaModel>
    not?: NestedEnumAddressOriginWithAggregatesFilter<$PrismaModel> | $Enums.AddressOrigin
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAddressOriginFilter<$PrismaModel>
    _max?: NestedEnumAddressOriginFilter<$PrismaModel>
  }

  export type EnumConfirmedViaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConfirmedVia | EnumConfirmedViaFieldRefInput<$PrismaModel>
    in?: $Enums.ConfirmedVia[] | ListEnumConfirmedViaFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConfirmedVia[] | ListEnumConfirmedViaFieldRefInput<$PrismaModel>
    not?: NestedEnumConfirmedViaWithAggregatesFilter<$PrismaModel> | $Enums.ConfirmedVia
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConfirmedViaFilter<$PrismaModel>
    _max?: NestedEnumConfirmedViaFilter<$PrismaModel>
  }

  export type EnumGiftRecipientStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.GiftRecipientStatus | EnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GiftRecipientStatus[] | ListEnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GiftRecipientStatus[] | ListEnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGiftRecipientStatusFilter<$PrismaModel> | $Enums.GiftRecipientStatus
  }

  export type GiftRecipientCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    phoneId?: SortOrder
    recipientUserId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    note?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GiftRecipientMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    phoneId?: SortOrder
    recipientUserId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    note?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GiftRecipientMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    phoneId?: SortOrder
    recipientUserId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    note?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumGiftRecipientStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GiftRecipientStatus | EnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GiftRecipientStatus[] | ListEnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GiftRecipientStatus[] | ListEnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGiftRecipientStatusWithAggregatesFilter<$PrismaModel> | $Enums.GiftRecipientStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGiftRecipientStatusFilter<$PrismaModel>
    _max?: NestedEnumGiftRecipientStatusFilter<$PrismaModel>
  }

  export type EnumConversationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ConversationType | EnumConversationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConversationType[] | ListEnumConversationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConversationType[] | ListEnumConversationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConversationTypeFilter<$PrismaModel> | $Enums.ConversationType
  }

  export type EnumUserTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeFilter<$PrismaModel> | $Enums.UserType
  }

  export type EnumConversationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ConversationStatus | EnumConversationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ConversationStatus[] | ListEnumConversationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConversationStatus[] | ListEnumConversationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumConversationStatusFilter<$PrismaModel> | $Enums.ConversationStatus
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type ConversationCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    userId?: SortOrder
    conversationType?: SortOrder
    userType?: SortOrder
    status?: SortOrder
    isRegisteredAdresles?: SortOrder
    isRegisteredEcommerce?: SortOrder
    hasAddressAdresles?: SortOrder
    hasAddressEcommerce?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type ConversationMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    userId?: SortOrder
    conversationType?: SortOrder
    userType?: SortOrder
    status?: SortOrder
    isRegisteredAdresles?: SortOrder
    isRegisteredEcommerce?: SortOrder
    hasAddressAdresles?: SortOrder
    hasAddressEcommerce?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type ConversationMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    userId?: SortOrder
    conversationType?: SortOrder
    userType?: SortOrder
    status?: SortOrder
    isRegisteredAdresles?: SortOrder
    isRegisteredEcommerce?: SortOrder
    hasAddressAdresles?: SortOrder
    hasAddressEcommerce?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type EnumConversationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConversationType | EnumConversationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConversationType[] | ListEnumConversationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConversationType[] | ListEnumConversationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConversationTypeWithAggregatesFilter<$PrismaModel> | $Enums.ConversationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConversationTypeFilter<$PrismaModel>
    _max?: NestedEnumConversationTypeFilter<$PrismaModel>
  }

  export type EnumUserTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeWithAggregatesFilter<$PrismaModel> | $Enums.UserType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTypeFilter<$PrismaModel>
    _max?: NestedEnumUserTypeFilter<$PrismaModel>
  }

  export type EnumConversationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConversationStatus | EnumConversationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ConversationStatus[] | ListEnumConversationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConversationStatus[] | ListEnumConversationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumConversationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ConversationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConversationStatusFilter<$PrismaModel>
    _max?: NestedEnumConversationStatusFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type UserCreateNestedManyWithoutPhoneInput = {
    create?: XOR<UserCreateWithoutPhoneInput, UserUncheckedCreateWithoutPhoneInput> | UserCreateWithoutPhoneInput[] | UserUncheckedCreateWithoutPhoneInput[]
    connectOrCreate?: UserCreateOrConnectWithoutPhoneInput | UserCreateOrConnectWithoutPhoneInput[]
    createMany?: UserCreateManyPhoneInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type GiftRecipientCreateNestedManyWithoutPhoneInput = {
    create?: XOR<GiftRecipientCreateWithoutPhoneInput, GiftRecipientUncheckedCreateWithoutPhoneInput> | GiftRecipientCreateWithoutPhoneInput[] | GiftRecipientUncheckedCreateWithoutPhoneInput[]
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutPhoneInput | GiftRecipientCreateOrConnectWithoutPhoneInput[]
    createMany?: GiftRecipientCreateManyPhoneInputEnvelope
    connect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
  }

  export type OrderAddressCreateNestedManyWithoutRecipientPhoneInput = {
    create?: XOR<OrderAddressCreateWithoutRecipientPhoneInput, OrderAddressUncheckedCreateWithoutRecipientPhoneInput> | OrderAddressCreateWithoutRecipientPhoneInput[] | OrderAddressUncheckedCreateWithoutRecipientPhoneInput[]
    connectOrCreate?: OrderAddressCreateOrConnectWithoutRecipientPhoneInput | OrderAddressCreateOrConnectWithoutRecipientPhoneInput[]
    createMany?: OrderAddressCreateManyRecipientPhoneInputEnvelope
    connect?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutPhoneInput = {
    create?: XOR<UserCreateWithoutPhoneInput, UserUncheckedCreateWithoutPhoneInput> | UserCreateWithoutPhoneInput[] | UserUncheckedCreateWithoutPhoneInput[]
    connectOrCreate?: UserCreateOrConnectWithoutPhoneInput | UserCreateOrConnectWithoutPhoneInput[]
    createMany?: UserCreateManyPhoneInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type GiftRecipientUncheckedCreateNestedManyWithoutPhoneInput = {
    create?: XOR<GiftRecipientCreateWithoutPhoneInput, GiftRecipientUncheckedCreateWithoutPhoneInput> | GiftRecipientCreateWithoutPhoneInput[] | GiftRecipientUncheckedCreateWithoutPhoneInput[]
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutPhoneInput | GiftRecipientCreateOrConnectWithoutPhoneInput[]
    createMany?: GiftRecipientCreateManyPhoneInputEnvelope
    connect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
  }

  export type OrderAddressUncheckedCreateNestedManyWithoutRecipientPhoneInput = {
    create?: XOR<OrderAddressCreateWithoutRecipientPhoneInput, OrderAddressUncheckedCreateWithoutRecipientPhoneInput> | OrderAddressCreateWithoutRecipientPhoneInput[] | OrderAddressUncheckedCreateWithoutRecipientPhoneInput[]
    connectOrCreate?: OrderAddressCreateOrConnectWithoutRecipientPhoneInput | OrderAddressCreateOrConnectWithoutRecipientPhoneInput[]
    createMany?: OrderAddressCreateManyRecipientPhoneInputEnvelope
    connect?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableEnumPhoneNumberTypeFieldUpdateOperationsInput = {
    set?: $Enums.PhoneNumberType | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateManyWithoutPhoneNestedInput = {
    create?: XOR<UserCreateWithoutPhoneInput, UserUncheckedCreateWithoutPhoneInput> | UserCreateWithoutPhoneInput[] | UserUncheckedCreateWithoutPhoneInput[]
    connectOrCreate?: UserCreateOrConnectWithoutPhoneInput | UserCreateOrConnectWithoutPhoneInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutPhoneInput | UserUpsertWithWhereUniqueWithoutPhoneInput[]
    createMany?: UserCreateManyPhoneInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutPhoneInput | UserUpdateWithWhereUniqueWithoutPhoneInput[]
    updateMany?: UserUpdateManyWithWhereWithoutPhoneInput | UserUpdateManyWithWhereWithoutPhoneInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type GiftRecipientUpdateManyWithoutPhoneNestedInput = {
    create?: XOR<GiftRecipientCreateWithoutPhoneInput, GiftRecipientUncheckedCreateWithoutPhoneInput> | GiftRecipientCreateWithoutPhoneInput[] | GiftRecipientUncheckedCreateWithoutPhoneInput[]
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutPhoneInput | GiftRecipientCreateOrConnectWithoutPhoneInput[]
    upsert?: GiftRecipientUpsertWithWhereUniqueWithoutPhoneInput | GiftRecipientUpsertWithWhereUniqueWithoutPhoneInput[]
    createMany?: GiftRecipientCreateManyPhoneInputEnvelope
    set?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    disconnect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    delete?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    connect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    update?: GiftRecipientUpdateWithWhereUniqueWithoutPhoneInput | GiftRecipientUpdateWithWhereUniqueWithoutPhoneInput[]
    updateMany?: GiftRecipientUpdateManyWithWhereWithoutPhoneInput | GiftRecipientUpdateManyWithWhereWithoutPhoneInput[]
    deleteMany?: GiftRecipientScalarWhereInput | GiftRecipientScalarWhereInput[]
  }

  export type OrderAddressUpdateManyWithoutRecipientPhoneNestedInput = {
    create?: XOR<OrderAddressCreateWithoutRecipientPhoneInput, OrderAddressUncheckedCreateWithoutRecipientPhoneInput> | OrderAddressCreateWithoutRecipientPhoneInput[] | OrderAddressUncheckedCreateWithoutRecipientPhoneInput[]
    connectOrCreate?: OrderAddressCreateOrConnectWithoutRecipientPhoneInput | OrderAddressCreateOrConnectWithoutRecipientPhoneInput[]
    upsert?: OrderAddressUpsertWithWhereUniqueWithoutRecipientPhoneInput | OrderAddressUpsertWithWhereUniqueWithoutRecipientPhoneInput[]
    createMany?: OrderAddressCreateManyRecipientPhoneInputEnvelope
    set?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
    disconnect?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
    delete?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
    connect?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
    update?: OrderAddressUpdateWithWhereUniqueWithoutRecipientPhoneInput | OrderAddressUpdateWithWhereUniqueWithoutRecipientPhoneInput[]
    updateMany?: OrderAddressUpdateManyWithWhereWithoutRecipientPhoneInput | OrderAddressUpdateManyWithWhereWithoutRecipientPhoneInput[]
    deleteMany?: OrderAddressScalarWhereInput | OrderAddressScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutPhoneNestedInput = {
    create?: XOR<UserCreateWithoutPhoneInput, UserUncheckedCreateWithoutPhoneInput> | UserCreateWithoutPhoneInput[] | UserUncheckedCreateWithoutPhoneInput[]
    connectOrCreate?: UserCreateOrConnectWithoutPhoneInput | UserCreateOrConnectWithoutPhoneInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutPhoneInput | UserUpsertWithWhereUniqueWithoutPhoneInput[]
    createMany?: UserCreateManyPhoneInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutPhoneInput | UserUpdateWithWhereUniqueWithoutPhoneInput[]
    updateMany?: UserUpdateManyWithWhereWithoutPhoneInput | UserUpdateManyWithWhereWithoutPhoneInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type GiftRecipientUncheckedUpdateManyWithoutPhoneNestedInput = {
    create?: XOR<GiftRecipientCreateWithoutPhoneInput, GiftRecipientUncheckedCreateWithoutPhoneInput> | GiftRecipientCreateWithoutPhoneInput[] | GiftRecipientUncheckedCreateWithoutPhoneInput[]
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutPhoneInput | GiftRecipientCreateOrConnectWithoutPhoneInput[]
    upsert?: GiftRecipientUpsertWithWhereUniqueWithoutPhoneInput | GiftRecipientUpsertWithWhereUniqueWithoutPhoneInput[]
    createMany?: GiftRecipientCreateManyPhoneInputEnvelope
    set?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    disconnect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    delete?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    connect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    update?: GiftRecipientUpdateWithWhereUniqueWithoutPhoneInput | GiftRecipientUpdateWithWhereUniqueWithoutPhoneInput[]
    updateMany?: GiftRecipientUpdateManyWithWhereWithoutPhoneInput | GiftRecipientUpdateManyWithWhereWithoutPhoneInput[]
    deleteMany?: GiftRecipientScalarWhereInput | GiftRecipientScalarWhereInput[]
  }

  export type OrderAddressUncheckedUpdateManyWithoutRecipientPhoneNestedInput = {
    create?: XOR<OrderAddressCreateWithoutRecipientPhoneInput, OrderAddressUncheckedCreateWithoutRecipientPhoneInput> | OrderAddressCreateWithoutRecipientPhoneInput[] | OrderAddressUncheckedCreateWithoutRecipientPhoneInput[]
    connectOrCreate?: OrderAddressCreateOrConnectWithoutRecipientPhoneInput | OrderAddressCreateOrConnectWithoutRecipientPhoneInput[]
    upsert?: OrderAddressUpsertWithWhereUniqueWithoutRecipientPhoneInput | OrderAddressUpsertWithWhereUniqueWithoutRecipientPhoneInput[]
    createMany?: OrderAddressCreateManyRecipientPhoneInputEnvelope
    set?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
    disconnect?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
    delete?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
    connect?: OrderAddressWhereUniqueInput | OrderAddressWhereUniqueInput[]
    update?: OrderAddressUpdateWithWhereUniqueWithoutRecipientPhoneInput | OrderAddressUpdateWithWhereUniqueWithoutRecipientPhoneInput[]
    updateMany?: OrderAddressUpdateManyWithWhereWithoutRecipientPhoneInput | OrderAddressUpdateManyWithWhereWithoutRecipientPhoneInput[]
    deleteMany?: OrderAddressScalarWhereInput | OrderAddressScalarWhereInput[]
  }

  export type StoreCreateNestedManyWithoutEcommerceInput = {
    create?: XOR<StoreCreateWithoutEcommerceInput, StoreUncheckedCreateWithoutEcommerceInput> | StoreCreateWithoutEcommerceInput[] | StoreUncheckedCreateWithoutEcommerceInput[]
    connectOrCreate?: StoreCreateOrConnectWithoutEcommerceInput | StoreCreateOrConnectWithoutEcommerceInput[]
    createMany?: StoreCreateManyEcommerceInputEnvelope
    connect?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
  }

  export type StoreUncheckedCreateNestedManyWithoutEcommerceInput = {
    create?: XOR<StoreCreateWithoutEcommerceInput, StoreUncheckedCreateWithoutEcommerceInput> | StoreCreateWithoutEcommerceInput[] | StoreUncheckedCreateWithoutEcommerceInput[]
    connectOrCreate?: StoreCreateOrConnectWithoutEcommerceInput | StoreCreateOrConnectWithoutEcommerceInput[]
    createMany?: StoreCreateManyEcommerceInputEnvelope
    connect?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumEcommerceStatusFieldUpdateOperationsInput = {
    set?: $Enums.EcommerceStatus
  }

  export type StoreUpdateManyWithoutEcommerceNestedInput = {
    create?: XOR<StoreCreateWithoutEcommerceInput, StoreUncheckedCreateWithoutEcommerceInput> | StoreCreateWithoutEcommerceInput[] | StoreUncheckedCreateWithoutEcommerceInput[]
    connectOrCreate?: StoreCreateOrConnectWithoutEcommerceInput | StoreCreateOrConnectWithoutEcommerceInput[]
    upsert?: StoreUpsertWithWhereUniqueWithoutEcommerceInput | StoreUpsertWithWhereUniqueWithoutEcommerceInput[]
    createMany?: StoreCreateManyEcommerceInputEnvelope
    set?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
    disconnect?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
    delete?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
    connect?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
    update?: StoreUpdateWithWhereUniqueWithoutEcommerceInput | StoreUpdateWithWhereUniqueWithoutEcommerceInput[]
    updateMany?: StoreUpdateManyWithWhereWithoutEcommerceInput | StoreUpdateManyWithWhereWithoutEcommerceInput[]
    deleteMany?: StoreScalarWhereInput | StoreScalarWhereInput[]
  }

  export type StoreUncheckedUpdateManyWithoutEcommerceNestedInput = {
    create?: XOR<StoreCreateWithoutEcommerceInput, StoreUncheckedCreateWithoutEcommerceInput> | StoreCreateWithoutEcommerceInput[] | StoreUncheckedCreateWithoutEcommerceInput[]
    connectOrCreate?: StoreCreateOrConnectWithoutEcommerceInput | StoreCreateOrConnectWithoutEcommerceInput[]
    upsert?: StoreUpsertWithWhereUniqueWithoutEcommerceInput | StoreUpsertWithWhereUniqueWithoutEcommerceInput[]
    createMany?: StoreCreateManyEcommerceInputEnvelope
    set?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
    disconnect?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
    delete?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
    connect?: StoreWhereUniqueInput | StoreWhereUniqueInput[]
    update?: StoreUpdateWithWhereUniqueWithoutEcommerceInput | StoreUpdateWithWhereUniqueWithoutEcommerceInput[]
    updateMany?: StoreUpdateManyWithWhereWithoutEcommerceInput | StoreUpdateManyWithWhereWithoutEcommerceInput[]
    deleteMany?: StoreScalarWhereInput | StoreScalarWhereInput[]
  }

  export type EcommerceCreateNestedOneWithoutStoresInput = {
    create?: XOR<EcommerceCreateWithoutStoresInput, EcommerceUncheckedCreateWithoutStoresInput>
    connectOrCreate?: EcommerceCreateOrConnectWithoutStoresInput
    connect?: EcommerceWhereUniqueInput
  }

  export type OrderCreateNestedManyWithoutStoreInput = {
    create?: XOR<OrderCreateWithoutStoreInput, OrderUncheckedCreateWithoutStoreInput> | OrderCreateWithoutStoreInput[] | OrderUncheckedCreateWithoutStoreInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutStoreInput | OrderCreateOrConnectWithoutStoreInput[]
    createMany?: OrderCreateManyStoreInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutStoreInput = {
    create?: XOR<OrderCreateWithoutStoreInput, OrderUncheckedCreateWithoutStoreInput> | OrderCreateWithoutStoreInput[] | OrderUncheckedCreateWithoutStoreInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutStoreInput | OrderCreateOrConnectWithoutStoreInput[]
    createMany?: OrderCreateManyStoreInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type EnumStorePlatformFieldUpdateOperationsInput = {
    set?: $Enums.StorePlatform
  }

  export type EnumStoreStatusFieldUpdateOperationsInput = {
    set?: $Enums.StoreStatus
  }

  export type EcommerceUpdateOneRequiredWithoutStoresNestedInput = {
    create?: XOR<EcommerceCreateWithoutStoresInput, EcommerceUncheckedCreateWithoutStoresInput>
    connectOrCreate?: EcommerceCreateOrConnectWithoutStoresInput
    upsert?: EcommerceUpsertWithoutStoresInput
    connect?: EcommerceWhereUniqueInput
    update?: XOR<XOR<EcommerceUpdateToOneWithWhereWithoutStoresInput, EcommerceUpdateWithoutStoresInput>, EcommerceUncheckedUpdateWithoutStoresInput>
  }

  export type OrderUpdateManyWithoutStoreNestedInput = {
    create?: XOR<OrderCreateWithoutStoreInput, OrderUncheckedCreateWithoutStoreInput> | OrderCreateWithoutStoreInput[] | OrderUncheckedCreateWithoutStoreInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutStoreInput | OrderCreateOrConnectWithoutStoreInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutStoreInput | OrderUpsertWithWhereUniqueWithoutStoreInput[]
    createMany?: OrderCreateManyStoreInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutStoreInput | OrderUpdateWithWhereUniqueWithoutStoreInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutStoreInput | OrderUpdateManyWithWhereWithoutStoreInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutStoreNestedInput = {
    create?: XOR<OrderCreateWithoutStoreInput, OrderUncheckedCreateWithoutStoreInput> | OrderCreateWithoutStoreInput[] | OrderUncheckedCreateWithoutStoreInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutStoreInput | OrderCreateOrConnectWithoutStoreInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutStoreInput | OrderUpsertWithWhereUniqueWithoutStoreInput[]
    createMany?: OrderCreateManyStoreInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutStoreInput | OrderUpdateWithWhereUniqueWithoutStoreInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutStoreInput | OrderUpdateManyWithWhereWithoutStoreInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type PhoneCreateNestedOneWithoutUsersInput = {
    create?: XOR<PhoneCreateWithoutUsersInput, PhoneUncheckedCreateWithoutUsersInput>
    connectOrCreate?: PhoneCreateOrConnectWithoutUsersInput
    connect?: PhoneWhereUniqueInput
  }

  export type OrderCreateNestedManyWithoutUserInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type AddressCreateNestedManyWithoutUserInput = {
    create?: XOR<AddressCreateWithoutUserInput, AddressUncheckedCreateWithoutUserInput> | AddressCreateWithoutUserInput[] | AddressUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AddressCreateOrConnectWithoutUserInput | AddressCreateOrConnectWithoutUserInput[]
    createMany?: AddressCreateManyUserInputEnvelope
    connect?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
  }

  export type GiftRecipientCreateNestedManyWithoutRecipientUserInput = {
    create?: XOR<GiftRecipientCreateWithoutRecipientUserInput, GiftRecipientUncheckedCreateWithoutRecipientUserInput> | GiftRecipientCreateWithoutRecipientUserInput[] | GiftRecipientUncheckedCreateWithoutRecipientUserInput[]
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutRecipientUserInput | GiftRecipientCreateOrConnectWithoutRecipientUserInput[]
    createMany?: GiftRecipientCreateManyRecipientUserInputEnvelope
    connect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type AddressUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AddressCreateWithoutUserInput, AddressUncheckedCreateWithoutUserInput> | AddressCreateWithoutUserInput[] | AddressUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AddressCreateOrConnectWithoutUserInput | AddressCreateOrConnectWithoutUserInput[]
    createMany?: AddressCreateManyUserInputEnvelope
    connect?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
  }

  export type GiftRecipientUncheckedCreateNestedManyWithoutRecipientUserInput = {
    create?: XOR<GiftRecipientCreateWithoutRecipientUserInput, GiftRecipientUncheckedCreateWithoutRecipientUserInput> | GiftRecipientCreateWithoutRecipientUserInput[] | GiftRecipientUncheckedCreateWithoutRecipientUserInput[]
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutRecipientUserInput | GiftRecipientCreateOrConnectWithoutRecipientUserInput[]
    createMany?: GiftRecipientCreateManyRecipientUserInputEnvelope
    connect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
  }

  export type PhoneUpdateOneWithoutUsersNestedInput = {
    create?: XOR<PhoneCreateWithoutUsersInput, PhoneUncheckedCreateWithoutUsersInput>
    connectOrCreate?: PhoneCreateOrConnectWithoutUsersInput
    upsert?: PhoneUpsertWithoutUsersInput
    disconnect?: PhoneWhereInput | boolean
    delete?: PhoneWhereInput | boolean
    connect?: PhoneWhereUniqueInput
    update?: XOR<XOR<PhoneUpdateToOneWithWhereWithoutUsersInput, PhoneUpdateWithoutUsersInput>, PhoneUncheckedUpdateWithoutUsersInput>
  }

  export type OrderUpdateManyWithoutUserNestedInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutUserInput | OrderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutUserInput | OrderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutUserInput | OrderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type AddressUpdateManyWithoutUserNestedInput = {
    create?: XOR<AddressCreateWithoutUserInput, AddressUncheckedCreateWithoutUserInput> | AddressCreateWithoutUserInput[] | AddressUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AddressCreateOrConnectWithoutUserInput | AddressCreateOrConnectWithoutUserInput[]
    upsert?: AddressUpsertWithWhereUniqueWithoutUserInput | AddressUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AddressCreateManyUserInputEnvelope
    set?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
    disconnect?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
    delete?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
    connect?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
    update?: AddressUpdateWithWhereUniqueWithoutUserInput | AddressUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AddressUpdateManyWithWhereWithoutUserInput | AddressUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AddressScalarWhereInput | AddressScalarWhereInput[]
  }

  export type GiftRecipientUpdateManyWithoutRecipientUserNestedInput = {
    create?: XOR<GiftRecipientCreateWithoutRecipientUserInput, GiftRecipientUncheckedCreateWithoutRecipientUserInput> | GiftRecipientCreateWithoutRecipientUserInput[] | GiftRecipientUncheckedCreateWithoutRecipientUserInput[]
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutRecipientUserInput | GiftRecipientCreateOrConnectWithoutRecipientUserInput[]
    upsert?: GiftRecipientUpsertWithWhereUniqueWithoutRecipientUserInput | GiftRecipientUpsertWithWhereUniqueWithoutRecipientUserInput[]
    createMany?: GiftRecipientCreateManyRecipientUserInputEnvelope
    set?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    disconnect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    delete?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    connect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    update?: GiftRecipientUpdateWithWhereUniqueWithoutRecipientUserInput | GiftRecipientUpdateWithWhereUniqueWithoutRecipientUserInput[]
    updateMany?: GiftRecipientUpdateManyWithWhereWithoutRecipientUserInput | GiftRecipientUpdateManyWithWhereWithoutRecipientUserInput[]
    deleteMany?: GiftRecipientScalarWhereInput | GiftRecipientScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutUserInput | OrderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutUserInput | OrderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutUserInput | OrderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type AddressUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AddressCreateWithoutUserInput, AddressUncheckedCreateWithoutUserInput> | AddressCreateWithoutUserInput[] | AddressUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AddressCreateOrConnectWithoutUserInput | AddressCreateOrConnectWithoutUserInput[]
    upsert?: AddressUpsertWithWhereUniqueWithoutUserInput | AddressUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AddressCreateManyUserInputEnvelope
    set?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
    disconnect?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
    delete?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
    connect?: AddressWhereUniqueInput | AddressWhereUniqueInput[]
    update?: AddressUpdateWithWhereUniqueWithoutUserInput | AddressUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AddressUpdateManyWithWhereWithoutUserInput | AddressUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AddressScalarWhereInput | AddressScalarWhereInput[]
  }

  export type GiftRecipientUncheckedUpdateManyWithoutRecipientUserNestedInput = {
    create?: XOR<GiftRecipientCreateWithoutRecipientUserInput, GiftRecipientUncheckedCreateWithoutRecipientUserInput> | GiftRecipientCreateWithoutRecipientUserInput[] | GiftRecipientUncheckedCreateWithoutRecipientUserInput[]
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutRecipientUserInput | GiftRecipientCreateOrConnectWithoutRecipientUserInput[]
    upsert?: GiftRecipientUpsertWithWhereUniqueWithoutRecipientUserInput | GiftRecipientUpsertWithWhereUniqueWithoutRecipientUserInput[]
    createMany?: GiftRecipientCreateManyRecipientUserInputEnvelope
    set?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    disconnect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    delete?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    connect?: GiftRecipientWhereUniqueInput | GiftRecipientWhereUniqueInput[]
    update?: GiftRecipientUpdateWithWhereUniqueWithoutRecipientUserInput | GiftRecipientUpdateWithWhereUniqueWithoutRecipientUserInput[]
    updateMany?: GiftRecipientUpdateManyWithWhereWithoutRecipientUserInput | GiftRecipientUpdateManyWithWhereWithoutRecipientUserInput[]
    deleteMany?: GiftRecipientScalarWhereInput | GiftRecipientScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutAddressesInput = {
    create?: XOR<UserCreateWithoutAddressesInput, UserUncheckedCreateWithoutAddressesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAddressesInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type UserUpdateOneRequiredWithoutAddressesNestedInput = {
    create?: XOR<UserCreateWithoutAddressesInput, UserUncheckedCreateWithoutAddressesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAddressesInput
    upsert?: UserUpsertWithoutAddressesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAddressesInput, UserUpdateWithoutAddressesInput>, UserUncheckedUpdateWithoutAddressesInput>
  }

  export type StoreCreateNestedOneWithoutOrdersInput = {
    create?: XOR<StoreCreateWithoutOrdersInput, StoreUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: StoreCreateOrConnectWithoutOrdersInput
    connect?: StoreWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutOrdersInput = {
    create?: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrdersInput
    connect?: UserWhereUniqueInput
  }

  export type OrderAddressCreateNestedOneWithoutOrderInput = {
    create?: XOR<OrderAddressCreateWithoutOrderInput, OrderAddressUncheckedCreateWithoutOrderInput>
    connectOrCreate?: OrderAddressCreateOrConnectWithoutOrderInput
    connect?: OrderAddressWhereUniqueInput
  }

  export type GiftRecipientCreateNestedOneWithoutOrderInput = {
    create?: XOR<GiftRecipientCreateWithoutOrderInput, GiftRecipientUncheckedCreateWithoutOrderInput>
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutOrderInput
    connect?: GiftRecipientWhereUniqueInput
  }

  export type ConversationCreateNestedManyWithoutOrderInput = {
    create?: XOR<ConversationCreateWithoutOrderInput, ConversationUncheckedCreateWithoutOrderInput> | ConversationCreateWithoutOrderInput[] | ConversationUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutOrderInput | ConversationCreateOrConnectWithoutOrderInput[]
    createMany?: ConversationCreateManyOrderInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type OrderAddressUncheckedCreateNestedOneWithoutOrderInput = {
    create?: XOR<OrderAddressCreateWithoutOrderInput, OrderAddressUncheckedCreateWithoutOrderInput>
    connectOrCreate?: OrderAddressCreateOrConnectWithoutOrderInput
    connect?: OrderAddressWhereUniqueInput
  }

  export type GiftRecipientUncheckedCreateNestedOneWithoutOrderInput = {
    create?: XOR<GiftRecipientCreateWithoutOrderInput, GiftRecipientUncheckedCreateWithoutOrderInput>
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutOrderInput
    connect?: GiftRecipientWhereUniqueInput
  }

  export type ConversationUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<ConversationCreateWithoutOrderInput, ConversationUncheckedCreateWithoutOrderInput> | ConversationCreateWithoutOrderInput[] | ConversationUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutOrderInput | ConversationCreateOrConnectWithoutOrderInput[]
    createMany?: ConversationCreateManyOrderInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type EnumOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderStatus
  }

  export type EnumOrderModeFieldUpdateOperationsInput = {
    set?: $Enums.OrderMode
  }

  export type EnumPaymentTypeFieldUpdateOperationsInput = {
    set?: $Enums.PaymentType
  }

  export type NullableEnumStatusSourceFieldUpdateOperationsInput = {
    set?: $Enums.StatusSource | null
  }

  export type StoreUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: XOR<StoreCreateWithoutOrdersInput, StoreUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: StoreCreateOrConnectWithoutOrdersInput
    upsert?: StoreUpsertWithoutOrdersInput
    connect?: StoreWhereUniqueInput
    update?: XOR<XOR<StoreUpdateToOneWithWhereWithoutOrdersInput, StoreUpdateWithoutOrdersInput>, StoreUncheckedUpdateWithoutOrdersInput>
  }

  export type UserUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrdersInput
    upsert?: UserUpsertWithoutOrdersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOrdersInput, UserUpdateWithoutOrdersInput>, UserUncheckedUpdateWithoutOrdersInput>
  }

  export type OrderAddressUpdateOneWithoutOrderNestedInput = {
    create?: XOR<OrderAddressCreateWithoutOrderInput, OrderAddressUncheckedCreateWithoutOrderInput>
    connectOrCreate?: OrderAddressCreateOrConnectWithoutOrderInput
    upsert?: OrderAddressUpsertWithoutOrderInput
    disconnect?: OrderAddressWhereInput | boolean
    delete?: OrderAddressWhereInput | boolean
    connect?: OrderAddressWhereUniqueInput
    update?: XOR<XOR<OrderAddressUpdateToOneWithWhereWithoutOrderInput, OrderAddressUpdateWithoutOrderInput>, OrderAddressUncheckedUpdateWithoutOrderInput>
  }

  export type GiftRecipientUpdateOneWithoutOrderNestedInput = {
    create?: XOR<GiftRecipientCreateWithoutOrderInput, GiftRecipientUncheckedCreateWithoutOrderInput>
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutOrderInput
    upsert?: GiftRecipientUpsertWithoutOrderInput
    disconnect?: GiftRecipientWhereInput | boolean
    delete?: GiftRecipientWhereInput | boolean
    connect?: GiftRecipientWhereUniqueInput
    update?: XOR<XOR<GiftRecipientUpdateToOneWithWhereWithoutOrderInput, GiftRecipientUpdateWithoutOrderInput>, GiftRecipientUncheckedUpdateWithoutOrderInput>
  }

  export type ConversationUpdateManyWithoutOrderNestedInput = {
    create?: XOR<ConversationCreateWithoutOrderInput, ConversationUncheckedCreateWithoutOrderInput> | ConversationCreateWithoutOrderInput[] | ConversationUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutOrderInput | ConversationCreateOrConnectWithoutOrderInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutOrderInput | ConversationUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: ConversationCreateManyOrderInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutOrderInput | ConversationUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutOrderInput | ConversationUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type OrderAddressUncheckedUpdateOneWithoutOrderNestedInput = {
    create?: XOR<OrderAddressCreateWithoutOrderInput, OrderAddressUncheckedCreateWithoutOrderInput>
    connectOrCreate?: OrderAddressCreateOrConnectWithoutOrderInput
    upsert?: OrderAddressUpsertWithoutOrderInput
    disconnect?: OrderAddressWhereInput | boolean
    delete?: OrderAddressWhereInput | boolean
    connect?: OrderAddressWhereUniqueInput
    update?: XOR<XOR<OrderAddressUpdateToOneWithWhereWithoutOrderInput, OrderAddressUpdateWithoutOrderInput>, OrderAddressUncheckedUpdateWithoutOrderInput>
  }

  export type GiftRecipientUncheckedUpdateOneWithoutOrderNestedInput = {
    create?: XOR<GiftRecipientCreateWithoutOrderInput, GiftRecipientUncheckedCreateWithoutOrderInput>
    connectOrCreate?: GiftRecipientCreateOrConnectWithoutOrderInput
    upsert?: GiftRecipientUpsertWithoutOrderInput
    disconnect?: GiftRecipientWhereInput | boolean
    delete?: GiftRecipientWhereInput | boolean
    connect?: GiftRecipientWhereUniqueInput
    update?: XOR<XOR<GiftRecipientUpdateToOneWithWhereWithoutOrderInput, GiftRecipientUpdateWithoutOrderInput>, GiftRecipientUncheckedUpdateWithoutOrderInput>
  }

  export type ConversationUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<ConversationCreateWithoutOrderInput, ConversationUncheckedCreateWithoutOrderInput> | ConversationCreateWithoutOrderInput[] | ConversationUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutOrderInput | ConversationCreateOrConnectWithoutOrderInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutOrderInput | ConversationUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: ConversationCreateManyOrderInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutOrderInput | ConversationUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutOrderInput | ConversationUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type OrderCreateNestedOneWithoutOrderAddressInput = {
    create?: XOR<OrderCreateWithoutOrderAddressInput, OrderUncheckedCreateWithoutOrderAddressInput>
    connectOrCreate?: OrderCreateOrConnectWithoutOrderAddressInput
    connect?: OrderWhereUniqueInput
  }

  export type PhoneCreateNestedOneWithoutOrderAddressesInput = {
    create?: XOR<PhoneCreateWithoutOrderAddressesInput, PhoneUncheckedCreateWithoutOrderAddressesInput>
    connectOrCreate?: PhoneCreateOrConnectWithoutOrderAddressesInput
    connect?: PhoneWhereUniqueInput
  }

  export type EnumRecipientTypeFieldUpdateOperationsInput = {
    set?: $Enums.RecipientType
  }

  export type EnumAddressOriginFieldUpdateOperationsInput = {
    set?: $Enums.AddressOrigin
  }

  export type EnumConfirmedViaFieldUpdateOperationsInput = {
    set?: $Enums.ConfirmedVia
  }

  export type OrderUpdateOneRequiredWithoutOrderAddressNestedInput = {
    create?: XOR<OrderCreateWithoutOrderAddressInput, OrderUncheckedCreateWithoutOrderAddressInput>
    connectOrCreate?: OrderCreateOrConnectWithoutOrderAddressInput
    upsert?: OrderUpsertWithoutOrderAddressInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutOrderAddressInput, OrderUpdateWithoutOrderAddressInput>, OrderUncheckedUpdateWithoutOrderAddressInput>
  }

  export type PhoneUpdateOneRequiredWithoutOrderAddressesNestedInput = {
    create?: XOR<PhoneCreateWithoutOrderAddressesInput, PhoneUncheckedCreateWithoutOrderAddressesInput>
    connectOrCreate?: PhoneCreateOrConnectWithoutOrderAddressesInput
    upsert?: PhoneUpsertWithoutOrderAddressesInput
    connect?: PhoneWhereUniqueInput
    update?: XOR<XOR<PhoneUpdateToOneWithWhereWithoutOrderAddressesInput, PhoneUpdateWithoutOrderAddressesInput>, PhoneUncheckedUpdateWithoutOrderAddressesInput>
  }

  export type OrderCreateNestedOneWithoutGiftRecipientInput = {
    create?: XOR<OrderCreateWithoutGiftRecipientInput, OrderUncheckedCreateWithoutGiftRecipientInput>
    connectOrCreate?: OrderCreateOrConnectWithoutGiftRecipientInput
    connect?: OrderWhereUniqueInput
  }

  export type PhoneCreateNestedOneWithoutGiftRecipientsInput = {
    create?: XOR<PhoneCreateWithoutGiftRecipientsInput, PhoneUncheckedCreateWithoutGiftRecipientsInput>
    connectOrCreate?: PhoneCreateOrConnectWithoutGiftRecipientsInput
    connect?: PhoneWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutGiftRecipientsInput = {
    create?: XOR<UserCreateWithoutGiftRecipientsInput, UserUncheckedCreateWithoutGiftRecipientsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGiftRecipientsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumGiftRecipientStatusFieldUpdateOperationsInput = {
    set?: $Enums.GiftRecipientStatus
  }

  export type OrderUpdateOneRequiredWithoutGiftRecipientNestedInput = {
    create?: XOR<OrderCreateWithoutGiftRecipientInput, OrderUncheckedCreateWithoutGiftRecipientInput>
    connectOrCreate?: OrderCreateOrConnectWithoutGiftRecipientInput
    upsert?: OrderUpsertWithoutGiftRecipientInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutGiftRecipientInput, OrderUpdateWithoutGiftRecipientInput>, OrderUncheckedUpdateWithoutGiftRecipientInput>
  }

  export type PhoneUpdateOneRequiredWithoutGiftRecipientsNestedInput = {
    create?: XOR<PhoneCreateWithoutGiftRecipientsInput, PhoneUncheckedCreateWithoutGiftRecipientsInput>
    connectOrCreate?: PhoneCreateOrConnectWithoutGiftRecipientsInput
    upsert?: PhoneUpsertWithoutGiftRecipientsInput
    connect?: PhoneWhereUniqueInput
    update?: XOR<XOR<PhoneUpdateToOneWithWhereWithoutGiftRecipientsInput, PhoneUpdateWithoutGiftRecipientsInput>, PhoneUncheckedUpdateWithoutGiftRecipientsInput>
  }

  export type UserUpdateOneRequiredWithoutGiftRecipientsNestedInput = {
    create?: XOR<UserCreateWithoutGiftRecipientsInput, UserUncheckedCreateWithoutGiftRecipientsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGiftRecipientsInput
    upsert?: UserUpsertWithoutGiftRecipientsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGiftRecipientsInput, UserUpdateWithoutGiftRecipientsInput>, UserUncheckedUpdateWithoutGiftRecipientsInput>
  }

  export type OrderCreateNestedOneWithoutConversationsInput = {
    create?: XOR<OrderCreateWithoutConversationsInput, OrderUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutConversationsInput
    connect?: OrderWhereUniqueInput
  }

  export type EnumConversationTypeFieldUpdateOperationsInput = {
    set?: $Enums.ConversationType
  }

  export type EnumUserTypeFieldUpdateOperationsInput = {
    set?: $Enums.UserType
  }

  export type EnumConversationStatusFieldUpdateOperationsInput = {
    set?: $Enums.ConversationStatus
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type OrderUpdateOneRequiredWithoutConversationsNestedInput = {
    create?: XOR<OrderCreateWithoutConversationsInput, OrderUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutConversationsInput
    upsert?: OrderUpsertWithoutConversationsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutConversationsInput, OrderUpdateWithoutConversationsInput>, OrderUncheckedUpdateWithoutConversationsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumPhoneNumberTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PhoneNumberType | EnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.PhoneNumberType[] | ListEnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PhoneNumberType[] | ListEnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPhoneNumberTypeNullableFilter<$PrismaModel> | $Enums.PhoneNumberType | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumPhoneNumberTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PhoneNumberType | EnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.PhoneNumberType[] | ListEnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PhoneNumberType[] | ListEnumPhoneNumberTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPhoneNumberTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.PhoneNumberType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPhoneNumberTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumPhoneNumberTypeNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumEcommerceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EcommerceStatus | EnumEcommerceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EcommerceStatus[] | ListEnumEcommerceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EcommerceStatus[] | ListEnumEcommerceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEcommerceStatusFilter<$PrismaModel> | $Enums.EcommerceStatus
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumEcommerceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EcommerceStatus | EnumEcommerceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EcommerceStatus[] | ListEnumEcommerceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EcommerceStatus[] | ListEnumEcommerceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEcommerceStatusWithAggregatesFilter<$PrismaModel> | $Enums.EcommerceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEcommerceStatusFilter<$PrismaModel>
    _max?: NestedEnumEcommerceStatusFilter<$PrismaModel>
  }

  export type NestedEnumStorePlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.StorePlatform | EnumStorePlatformFieldRefInput<$PrismaModel>
    in?: $Enums.StorePlatform[] | ListEnumStorePlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.StorePlatform[] | ListEnumStorePlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumStorePlatformFilter<$PrismaModel> | $Enums.StorePlatform
  }

  export type NestedEnumStoreStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.StoreStatus | EnumStoreStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StoreStatus[] | ListEnumStoreStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoreStatus[] | ListEnumStoreStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStoreStatusFilter<$PrismaModel> | $Enums.StoreStatus
  }

  export type NestedEnumStorePlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StorePlatform | EnumStorePlatformFieldRefInput<$PrismaModel>
    in?: $Enums.StorePlatform[] | ListEnumStorePlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.StorePlatform[] | ListEnumStorePlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumStorePlatformWithAggregatesFilter<$PrismaModel> | $Enums.StorePlatform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStorePlatformFilter<$PrismaModel>
    _max?: NestedEnumStorePlatformFilter<$PrismaModel>
  }

  export type NestedEnumStoreStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StoreStatus | EnumStoreStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StoreStatus[] | ListEnumStoreStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoreStatus[] | ListEnumStoreStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStoreStatusWithAggregatesFilter<$PrismaModel> | $Enums.StoreStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStoreStatusFilter<$PrismaModel>
    _max?: NestedEnumStoreStatusFilter<$PrismaModel>
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedEnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type NestedEnumOrderModeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderMode | EnumOrderModeFieldRefInput<$PrismaModel>
    in?: $Enums.OrderMode[] | ListEnumOrderModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderMode[] | ListEnumOrderModeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderModeFilter<$PrismaModel> | $Enums.OrderMode
  }

  export type NestedEnumPaymentTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentType | EnumPaymentTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentType[] | ListEnumPaymentTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentType[] | ListEnumPaymentTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentTypeFilter<$PrismaModel> | $Enums.PaymentType
  }

  export type NestedEnumStatusSourceNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusSource | EnumStatusSourceFieldRefInput<$PrismaModel> | null
    in?: $Enums.StatusSource[] | ListEnumStatusSourceFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.StatusSource[] | ListEnumStatusSourceFieldRefInput<$PrismaModel> | null
    not?: NestedEnumStatusSourceNullableFilter<$PrismaModel> | $Enums.StatusSource | null
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type NestedEnumOrderModeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderMode | EnumOrderModeFieldRefInput<$PrismaModel>
    in?: $Enums.OrderMode[] | ListEnumOrderModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderMode[] | ListEnumOrderModeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderModeWithAggregatesFilter<$PrismaModel> | $Enums.OrderMode
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderModeFilter<$PrismaModel>
    _max?: NestedEnumOrderModeFilter<$PrismaModel>
  }

  export type NestedEnumPaymentTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentType | EnumPaymentTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentType[] | ListEnumPaymentTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentType[] | ListEnumPaymentTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentTypeWithAggregatesFilter<$PrismaModel> | $Enums.PaymentType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentTypeFilter<$PrismaModel>
    _max?: NestedEnumPaymentTypeFilter<$PrismaModel>
  }

  export type NestedEnumStatusSourceNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusSource | EnumStatusSourceFieldRefInput<$PrismaModel> | null
    in?: $Enums.StatusSource[] | ListEnumStatusSourceFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.StatusSource[] | ListEnumStatusSourceFieldRefInput<$PrismaModel> | null
    not?: NestedEnumStatusSourceNullableWithAggregatesFilter<$PrismaModel> | $Enums.StatusSource | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumStatusSourceNullableFilter<$PrismaModel>
    _max?: NestedEnumStatusSourceNullableFilter<$PrismaModel>
  }

  export type NestedEnumRecipientTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.RecipientType | EnumRecipientTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RecipientType[] | ListEnumRecipientTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RecipientType[] | ListEnumRecipientTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRecipientTypeFilter<$PrismaModel> | $Enums.RecipientType
  }

  export type NestedEnumAddressOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.AddressOrigin | EnumAddressOriginFieldRefInput<$PrismaModel>
    in?: $Enums.AddressOrigin[] | ListEnumAddressOriginFieldRefInput<$PrismaModel>
    notIn?: $Enums.AddressOrigin[] | ListEnumAddressOriginFieldRefInput<$PrismaModel>
    not?: NestedEnumAddressOriginFilter<$PrismaModel> | $Enums.AddressOrigin
  }

  export type NestedEnumConfirmedViaFilter<$PrismaModel = never> = {
    equals?: $Enums.ConfirmedVia | EnumConfirmedViaFieldRefInput<$PrismaModel>
    in?: $Enums.ConfirmedVia[] | ListEnumConfirmedViaFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConfirmedVia[] | ListEnumConfirmedViaFieldRefInput<$PrismaModel>
    not?: NestedEnumConfirmedViaFilter<$PrismaModel> | $Enums.ConfirmedVia
  }

  export type NestedEnumRecipientTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RecipientType | EnumRecipientTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RecipientType[] | ListEnumRecipientTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RecipientType[] | ListEnumRecipientTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRecipientTypeWithAggregatesFilter<$PrismaModel> | $Enums.RecipientType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRecipientTypeFilter<$PrismaModel>
    _max?: NestedEnumRecipientTypeFilter<$PrismaModel>
  }

  export type NestedEnumAddressOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AddressOrigin | EnumAddressOriginFieldRefInput<$PrismaModel>
    in?: $Enums.AddressOrigin[] | ListEnumAddressOriginFieldRefInput<$PrismaModel>
    notIn?: $Enums.AddressOrigin[] | ListEnumAddressOriginFieldRefInput<$PrismaModel>
    not?: NestedEnumAddressOriginWithAggregatesFilter<$PrismaModel> | $Enums.AddressOrigin
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAddressOriginFilter<$PrismaModel>
    _max?: NestedEnumAddressOriginFilter<$PrismaModel>
  }

  export type NestedEnumConfirmedViaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConfirmedVia | EnumConfirmedViaFieldRefInput<$PrismaModel>
    in?: $Enums.ConfirmedVia[] | ListEnumConfirmedViaFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConfirmedVia[] | ListEnumConfirmedViaFieldRefInput<$PrismaModel>
    not?: NestedEnumConfirmedViaWithAggregatesFilter<$PrismaModel> | $Enums.ConfirmedVia
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConfirmedViaFilter<$PrismaModel>
    _max?: NestedEnumConfirmedViaFilter<$PrismaModel>
  }

  export type NestedEnumGiftRecipientStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.GiftRecipientStatus | EnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GiftRecipientStatus[] | ListEnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GiftRecipientStatus[] | ListEnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGiftRecipientStatusFilter<$PrismaModel> | $Enums.GiftRecipientStatus
  }

  export type NestedEnumGiftRecipientStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GiftRecipientStatus | EnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GiftRecipientStatus[] | ListEnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GiftRecipientStatus[] | ListEnumGiftRecipientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGiftRecipientStatusWithAggregatesFilter<$PrismaModel> | $Enums.GiftRecipientStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGiftRecipientStatusFilter<$PrismaModel>
    _max?: NestedEnumGiftRecipientStatusFilter<$PrismaModel>
  }

  export type NestedEnumConversationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ConversationType | EnumConversationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConversationType[] | ListEnumConversationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConversationType[] | ListEnumConversationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConversationTypeFilter<$PrismaModel> | $Enums.ConversationType
  }

  export type NestedEnumUserTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeFilter<$PrismaModel> | $Enums.UserType
  }

  export type NestedEnumConversationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ConversationStatus | EnumConversationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ConversationStatus[] | ListEnumConversationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConversationStatus[] | ListEnumConversationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumConversationStatusFilter<$PrismaModel> | $Enums.ConversationStatus
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedEnumConversationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConversationType | EnumConversationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConversationType[] | ListEnumConversationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConversationType[] | ListEnumConversationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConversationTypeWithAggregatesFilter<$PrismaModel> | $Enums.ConversationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConversationTypeFilter<$PrismaModel>
    _max?: NestedEnumConversationTypeFilter<$PrismaModel>
  }

  export type NestedEnumUserTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeWithAggregatesFilter<$PrismaModel> | $Enums.UserType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTypeFilter<$PrismaModel>
    _max?: NestedEnumUserTypeFilter<$PrismaModel>
  }

  export type NestedEnumConversationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConversationStatus | EnumConversationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ConversationStatus[] | ListEnumConversationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConversationStatus[] | ListEnumConversationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumConversationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ConversationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConversationStatusFilter<$PrismaModel>
    _max?: NestedEnumConversationStatusFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type UserCreateWithoutPhoneInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderCreateNestedManyWithoutUserInput
    addresses?: AddressCreateNestedManyWithoutUserInput
    giftRecipients?: GiftRecipientCreateNestedManyWithoutRecipientUserInput
  }

  export type UserUncheckedCreateWithoutPhoneInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutUserInput
    addresses?: AddressUncheckedCreateNestedManyWithoutUserInput
    giftRecipients?: GiftRecipientUncheckedCreateNestedManyWithoutRecipientUserInput
  }

  export type UserCreateOrConnectWithoutPhoneInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPhoneInput, UserUncheckedCreateWithoutPhoneInput>
  }

  export type UserCreateManyPhoneInputEnvelope = {
    data: UserCreateManyPhoneInput | UserCreateManyPhoneInput[]
    skipDuplicates?: boolean
  }

  export type GiftRecipientCreateWithoutPhoneInput = {
    id?: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutGiftRecipientInput
    recipientUser: UserCreateNestedOneWithoutGiftRecipientsInput
  }

  export type GiftRecipientUncheckedCreateWithoutPhoneInput = {
    id?: string
    orderId: string
    recipientUserId: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GiftRecipientCreateOrConnectWithoutPhoneInput = {
    where: GiftRecipientWhereUniqueInput
    create: XOR<GiftRecipientCreateWithoutPhoneInput, GiftRecipientUncheckedCreateWithoutPhoneInput>
  }

  export type GiftRecipientCreateManyPhoneInputEnvelope = {
    data: GiftRecipientCreateManyPhoneInput | GiftRecipientCreateManyPhoneInput[]
    skipDuplicates?: boolean
  }

  export type OrderAddressCreateWithoutRecipientPhoneInput = {
    id?: string
    sourceAddressId?: string | null
    recipientType: $Enums.RecipientType
    recipientName: string
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    addressOrigin: $Enums.AddressOrigin
    confirmedAt: Date | string
    confirmedVia: $Enums.ConfirmedVia
    order: OrderCreateNestedOneWithoutOrderAddressInput
  }

  export type OrderAddressUncheckedCreateWithoutRecipientPhoneInput = {
    id?: string
    orderId: string
    sourceAddressId?: string | null
    recipientType: $Enums.RecipientType
    recipientName: string
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    addressOrigin: $Enums.AddressOrigin
    confirmedAt: Date | string
    confirmedVia: $Enums.ConfirmedVia
  }

  export type OrderAddressCreateOrConnectWithoutRecipientPhoneInput = {
    where: OrderAddressWhereUniqueInput
    create: XOR<OrderAddressCreateWithoutRecipientPhoneInput, OrderAddressUncheckedCreateWithoutRecipientPhoneInput>
  }

  export type OrderAddressCreateManyRecipientPhoneInputEnvelope = {
    data: OrderAddressCreateManyRecipientPhoneInput | OrderAddressCreateManyRecipientPhoneInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutPhoneInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutPhoneInput, UserUncheckedUpdateWithoutPhoneInput>
    create: XOR<UserCreateWithoutPhoneInput, UserUncheckedCreateWithoutPhoneInput>
  }

  export type UserUpdateWithWhereUniqueWithoutPhoneInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutPhoneInput, UserUncheckedUpdateWithoutPhoneInput>
  }

  export type UserUpdateManyWithWhereWithoutPhoneInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutPhoneInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    phoneId?: StringNullableFilter<"User"> | string | null
    firstName?: StringNullableFilter<"User"> | string | null
    lastName?: StringNullableFilter<"User"> | string | null
    email?: StringNullableFilter<"User"> | string | null
    preferredLanguage?: StringNullableFilter<"User"> | string | null
    isRegistered?: BoolFilter<"User"> | boolean
    registeredAt?: DateTimeNullableFilter<"User"> | Date | string | null
    lastInteractionAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isDeleted?: BoolFilter<"User"> | boolean
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type GiftRecipientUpsertWithWhereUniqueWithoutPhoneInput = {
    where: GiftRecipientWhereUniqueInput
    update: XOR<GiftRecipientUpdateWithoutPhoneInput, GiftRecipientUncheckedUpdateWithoutPhoneInput>
    create: XOR<GiftRecipientCreateWithoutPhoneInput, GiftRecipientUncheckedCreateWithoutPhoneInput>
  }

  export type GiftRecipientUpdateWithWhereUniqueWithoutPhoneInput = {
    where: GiftRecipientWhereUniqueInput
    data: XOR<GiftRecipientUpdateWithoutPhoneInput, GiftRecipientUncheckedUpdateWithoutPhoneInput>
  }

  export type GiftRecipientUpdateManyWithWhereWithoutPhoneInput = {
    where: GiftRecipientScalarWhereInput
    data: XOR<GiftRecipientUpdateManyMutationInput, GiftRecipientUncheckedUpdateManyWithoutPhoneInput>
  }

  export type GiftRecipientScalarWhereInput = {
    AND?: GiftRecipientScalarWhereInput | GiftRecipientScalarWhereInput[]
    OR?: GiftRecipientScalarWhereInput[]
    NOT?: GiftRecipientScalarWhereInput | GiftRecipientScalarWhereInput[]
    id?: StringFilter<"GiftRecipient"> | string
    orderId?: StringFilter<"GiftRecipient"> | string
    phoneId?: StringFilter<"GiftRecipient"> | string
    recipientUserId?: StringFilter<"GiftRecipient"> | string
    firstName?: StringFilter<"GiftRecipient"> | string
    lastName?: StringFilter<"GiftRecipient"> | string
    note?: StringNullableFilter<"GiftRecipient"> | string | null
    status?: EnumGiftRecipientStatusFilter<"GiftRecipient"> | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFilter<"GiftRecipient"> | Date | string
    updatedAt?: DateTimeFilter<"GiftRecipient"> | Date | string
  }

  export type OrderAddressUpsertWithWhereUniqueWithoutRecipientPhoneInput = {
    where: OrderAddressWhereUniqueInput
    update: XOR<OrderAddressUpdateWithoutRecipientPhoneInput, OrderAddressUncheckedUpdateWithoutRecipientPhoneInput>
    create: XOR<OrderAddressCreateWithoutRecipientPhoneInput, OrderAddressUncheckedCreateWithoutRecipientPhoneInput>
  }

  export type OrderAddressUpdateWithWhereUniqueWithoutRecipientPhoneInput = {
    where: OrderAddressWhereUniqueInput
    data: XOR<OrderAddressUpdateWithoutRecipientPhoneInput, OrderAddressUncheckedUpdateWithoutRecipientPhoneInput>
  }

  export type OrderAddressUpdateManyWithWhereWithoutRecipientPhoneInput = {
    where: OrderAddressScalarWhereInput
    data: XOR<OrderAddressUpdateManyMutationInput, OrderAddressUncheckedUpdateManyWithoutRecipientPhoneInput>
  }

  export type OrderAddressScalarWhereInput = {
    AND?: OrderAddressScalarWhereInput | OrderAddressScalarWhereInput[]
    OR?: OrderAddressScalarWhereInput[]
    NOT?: OrderAddressScalarWhereInput | OrderAddressScalarWhereInput[]
    id?: StringFilter<"OrderAddress"> | string
    orderId?: StringFilter<"OrderAddress"> | string
    sourceAddressId?: StringNullableFilter<"OrderAddress"> | string | null
    recipientType?: EnumRecipientTypeFilter<"OrderAddress"> | $Enums.RecipientType
    recipientName?: StringFilter<"OrderAddress"> | string
    recipientPhoneId?: StringFilter<"OrderAddress"> | string
    fullAddress?: StringFilter<"OrderAddress"> | string
    street?: StringFilter<"OrderAddress"> | string
    number?: StringNullableFilter<"OrderAddress"> | string | null
    block?: StringNullableFilter<"OrderAddress"> | string | null
    staircase?: StringNullableFilter<"OrderAddress"> | string | null
    floor?: StringNullableFilter<"OrderAddress"> | string | null
    door?: StringNullableFilter<"OrderAddress"> | string | null
    additionalInfo?: StringNullableFilter<"OrderAddress"> | string | null
    postalCode?: StringFilter<"OrderAddress"> | string
    city?: StringFilter<"OrderAddress"> | string
    province?: StringNullableFilter<"OrderAddress"> | string | null
    country?: StringFilter<"OrderAddress"> | string
    gmapsPlaceId?: StringNullableFilter<"OrderAddress"> | string | null
    addressOrigin?: EnumAddressOriginFilter<"OrderAddress"> | $Enums.AddressOrigin
    confirmedAt?: DateTimeFilter<"OrderAddress"> | Date | string
    confirmedVia?: EnumConfirmedViaFilter<"OrderAddress"> | $Enums.ConfirmedVia
  }

  export type StoreCreateWithoutEcommerceInput = {
    id?: string
    url: string
    name: string
    platform?: $Enums.StorePlatform
    defaultLanguage?: string
    defaultCurrency?: string
    timezone?: string
    logoUrl?: string | null
    status?: $Enums.StoreStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderCreateNestedManyWithoutStoreInput
  }

  export type StoreUncheckedCreateWithoutEcommerceInput = {
    id?: string
    url: string
    name: string
    platform?: $Enums.StorePlatform
    defaultLanguage?: string
    defaultCurrency?: string
    timezone?: string
    logoUrl?: string | null
    status?: $Enums.StoreStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutStoreInput
  }

  export type StoreCreateOrConnectWithoutEcommerceInput = {
    where: StoreWhereUniqueInput
    create: XOR<StoreCreateWithoutEcommerceInput, StoreUncheckedCreateWithoutEcommerceInput>
  }

  export type StoreCreateManyEcommerceInputEnvelope = {
    data: StoreCreateManyEcommerceInput | StoreCreateManyEcommerceInput[]
    skipDuplicates?: boolean
  }

  export type StoreUpsertWithWhereUniqueWithoutEcommerceInput = {
    where: StoreWhereUniqueInput
    update: XOR<StoreUpdateWithoutEcommerceInput, StoreUncheckedUpdateWithoutEcommerceInput>
    create: XOR<StoreCreateWithoutEcommerceInput, StoreUncheckedCreateWithoutEcommerceInput>
  }

  export type StoreUpdateWithWhereUniqueWithoutEcommerceInput = {
    where: StoreWhereUniqueInput
    data: XOR<StoreUpdateWithoutEcommerceInput, StoreUncheckedUpdateWithoutEcommerceInput>
  }

  export type StoreUpdateManyWithWhereWithoutEcommerceInput = {
    where: StoreScalarWhereInput
    data: XOR<StoreUpdateManyMutationInput, StoreUncheckedUpdateManyWithoutEcommerceInput>
  }

  export type StoreScalarWhereInput = {
    AND?: StoreScalarWhereInput | StoreScalarWhereInput[]
    OR?: StoreScalarWhereInput[]
    NOT?: StoreScalarWhereInput | StoreScalarWhereInput[]
    id?: StringFilter<"Store"> | string
    ecommerceId?: StringFilter<"Store"> | string
    url?: StringFilter<"Store"> | string
    name?: StringFilter<"Store"> | string
    platform?: EnumStorePlatformFilter<"Store"> | $Enums.StorePlatform
    defaultLanguage?: StringFilter<"Store"> | string
    defaultCurrency?: StringFilter<"Store"> | string
    timezone?: StringFilter<"Store"> | string
    logoUrl?: StringNullableFilter<"Store"> | string | null
    status?: EnumStoreStatusFilter<"Store"> | $Enums.StoreStatus
    createdAt?: DateTimeFilter<"Store"> | Date | string
    updatedAt?: DateTimeFilter<"Store"> | Date | string
  }

  export type EcommerceCreateWithoutStoresInput = {
    id?: string
    taxId: string
    legalName: string
    commercialName?: string | null
    email: string
    phone?: string | null
    country: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: Date | string | null
    status?: $Enums.EcommerceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EcommerceUncheckedCreateWithoutStoresInput = {
    id?: string
    taxId: string
    legalName: string
    commercialName?: string | null
    email: string
    phone?: string | null
    country: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: Date | string | null
    status?: $Enums.EcommerceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EcommerceCreateOrConnectWithoutStoresInput = {
    where: EcommerceWhereUniqueInput
    create: XOR<EcommerceCreateWithoutStoresInput, EcommerceUncheckedCreateWithoutStoresInput>
  }

  export type OrderCreateWithoutStoreInput = {
    id?: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutOrdersInput
    orderAddress?: OrderAddressCreateNestedOneWithoutOrderInput
    giftRecipient?: GiftRecipientCreateNestedOneWithoutOrderInput
    conversations?: ConversationCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutStoreInput = {
    id?: string
    userId: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderAddress?: OrderAddressUncheckedCreateNestedOneWithoutOrderInput
    giftRecipient?: GiftRecipientUncheckedCreateNestedOneWithoutOrderInput
    conversations?: ConversationUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutStoreInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutStoreInput, OrderUncheckedCreateWithoutStoreInput>
  }

  export type OrderCreateManyStoreInputEnvelope = {
    data: OrderCreateManyStoreInput | OrderCreateManyStoreInput[]
    skipDuplicates?: boolean
  }

  export type EcommerceUpsertWithoutStoresInput = {
    update: XOR<EcommerceUpdateWithoutStoresInput, EcommerceUncheckedUpdateWithoutStoresInput>
    create: XOR<EcommerceCreateWithoutStoresInput, EcommerceUncheckedCreateWithoutStoresInput>
    where?: EcommerceWhereInput
  }

  export type EcommerceUpdateToOneWithWhereWithoutStoresInput = {
    where?: EcommerceWhereInput
    data: XOR<EcommerceUpdateWithoutStoresInput, EcommerceUncheckedUpdateWithoutStoresInput>
  }

  export type EcommerceUpdateWithoutStoresInput = {
    id?: StringFieldUpdateOperationsInput | string
    taxId?: StringFieldUpdateOperationsInput | string
    legalName?: StringFieldUpdateOperationsInput | string
    commercialName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumEcommerceStatusFieldUpdateOperationsInput | $Enums.EcommerceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EcommerceUncheckedUpdateWithoutStoresInput = {
    id?: StringFieldUpdateOperationsInput | string
    taxId?: StringFieldUpdateOperationsInput | string
    legalName?: StringFieldUpdateOperationsInput | string
    commercialName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumEcommerceStatusFieldUpdateOperationsInput | $Enums.EcommerceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUpsertWithWhereUniqueWithoutStoreInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutStoreInput, OrderUncheckedUpdateWithoutStoreInput>
    create: XOR<OrderCreateWithoutStoreInput, OrderUncheckedCreateWithoutStoreInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutStoreInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutStoreInput, OrderUncheckedUpdateWithoutStoreInput>
  }

  export type OrderUpdateManyWithWhereWithoutStoreInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutStoreInput>
  }

  export type OrderScalarWhereInput = {
    AND?: OrderScalarWhereInput | OrderScalarWhereInput[]
    OR?: OrderScalarWhereInput[]
    NOT?: OrderScalarWhereInput | OrderScalarWhereInput[]
    id?: StringFilter<"Order"> | string
    storeId?: StringFilter<"Order"> | string
    userId?: StringFilter<"Order"> | string
    externalOrderId?: StringFilter<"Order"> | string
    externalOrderNumber?: StringNullableFilter<"Order"> | string | null
    totalAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"Order"> | string
    feePercentage?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    orderMode?: EnumOrderModeFilter<"Order"> | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFilter<"Order"> | $Enums.PaymentType
    isGift?: BoolFilter<"Order"> | boolean
    itemsSummary?: JsonNullableFilter<"Order">
    webhookReceivedAt?: DateTimeFilter<"Order"> | Date | string
    addressConfirmedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    syncedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    statusSource?: EnumStatusSourceNullableFilter<"Order"> | $Enums.StatusSource | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
  }

  export type PhoneCreateWithoutUsersInput = {
    id?: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country?: string | null
    numberType?: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational?: string | null
    formattedInternational?: string | null
    createdAt?: Date | string
    giftRecipients?: GiftRecipientCreateNestedManyWithoutPhoneInput
    orderAddresses?: OrderAddressCreateNestedManyWithoutRecipientPhoneInput
  }

  export type PhoneUncheckedCreateWithoutUsersInput = {
    id?: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country?: string | null
    numberType?: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational?: string | null
    formattedInternational?: string | null
    createdAt?: Date | string
    giftRecipients?: GiftRecipientUncheckedCreateNestedManyWithoutPhoneInput
    orderAddresses?: OrderAddressUncheckedCreateNestedManyWithoutRecipientPhoneInput
  }

  export type PhoneCreateOrConnectWithoutUsersInput = {
    where: PhoneWhereUniqueInput
    create: XOR<PhoneCreateWithoutUsersInput, PhoneUncheckedCreateWithoutUsersInput>
  }

  export type OrderCreateWithoutUserInput = {
    id?: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    store: StoreCreateNestedOneWithoutOrdersInput
    orderAddress?: OrderAddressCreateNestedOneWithoutOrderInput
    giftRecipient?: GiftRecipientCreateNestedOneWithoutOrderInput
    conversations?: ConversationCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutUserInput = {
    id?: string
    storeId: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderAddress?: OrderAddressUncheckedCreateNestedOneWithoutOrderInput
    giftRecipient?: GiftRecipientUncheckedCreateNestedOneWithoutOrderInput
    conversations?: ConversationUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutUserInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
  }

  export type OrderCreateManyUserInputEnvelope = {
    data: OrderCreateManyUserInput | OrderCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AddressCreateWithoutUserInput = {
    id?: string
    label?: string | null
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    isDefault?: boolean
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AddressUncheckedCreateWithoutUserInput = {
    id?: string
    label?: string | null
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    isDefault?: boolean
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AddressCreateOrConnectWithoutUserInput = {
    where: AddressWhereUniqueInput
    create: XOR<AddressCreateWithoutUserInput, AddressUncheckedCreateWithoutUserInput>
  }

  export type AddressCreateManyUserInputEnvelope = {
    data: AddressCreateManyUserInput | AddressCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type GiftRecipientCreateWithoutRecipientUserInput = {
    id?: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutGiftRecipientInput
    phone: PhoneCreateNestedOneWithoutGiftRecipientsInput
  }

  export type GiftRecipientUncheckedCreateWithoutRecipientUserInput = {
    id?: string
    orderId: string
    phoneId: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GiftRecipientCreateOrConnectWithoutRecipientUserInput = {
    where: GiftRecipientWhereUniqueInput
    create: XOR<GiftRecipientCreateWithoutRecipientUserInput, GiftRecipientUncheckedCreateWithoutRecipientUserInput>
  }

  export type GiftRecipientCreateManyRecipientUserInputEnvelope = {
    data: GiftRecipientCreateManyRecipientUserInput | GiftRecipientCreateManyRecipientUserInput[]
    skipDuplicates?: boolean
  }

  export type PhoneUpsertWithoutUsersInput = {
    update: XOR<PhoneUpdateWithoutUsersInput, PhoneUncheckedUpdateWithoutUsersInput>
    create: XOR<PhoneCreateWithoutUsersInput, PhoneUncheckedCreateWithoutUsersInput>
    where?: PhoneWhereInput
  }

  export type PhoneUpdateToOneWithWhereWithoutUsersInput = {
    where?: PhoneWhereInput
    data: XOR<PhoneUpdateWithoutUsersInput, PhoneUncheckedUpdateWithoutUsersInput>
  }

  export type PhoneUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    giftRecipients?: GiftRecipientUpdateManyWithoutPhoneNestedInput
    orderAddresses?: OrderAddressUpdateManyWithoutRecipientPhoneNestedInput
  }

  export type PhoneUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    giftRecipients?: GiftRecipientUncheckedUpdateManyWithoutPhoneNestedInput
    orderAddresses?: OrderAddressUncheckedUpdateManyWithoutRecipientPhoneNestedInput
  }

  export type OrderUpsertWithWhereUniqueWithoutUserInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutUserInput, OrderUncheckedUpdateWithoutUserInput>
    create: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutUserInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutUserInput, OrderUncheckedUpdateWithoutUserInput>
  }

  export type OrderUpdateManyWithWhereWithoutUserInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutUserInput>
  }

  export type AddressUpsertWithWhereUniqueWithoutUserInput = {
    where: AddressWhereUniqueInput
    update: XOR<AddressUpdateWithoutUserInput, AddressUncheckedUpdateWithoutUserInput>
    create: XOR<AddressCreateWithoutUserInput, AddressUncheckedCreateWithoutUserInput>
  }

  export type AddressUpdateWithWhereUniqueWithoutUserInput = {
    where: AddressWhereUniqueInput
    data: XOR<AddressUpdateWithoutUserInput, AddressUncheckedUpdateWithoutUserInput>
  }

  export type AddressUpdateManyWithWhereWithoutUserInput = {
    where: AddressScalarWhereInput
    data: XOR<AddressUpdateManyMutationInput, AddressUncheckedUpdateManyWithoutUserInput>
  }

  export type AddressScalarWhereInput = {
    AND?: AddressScalarWhereInput | AddressScalarWhereInput[]
    OR?: AddressScalarWhereInput[]
    NOT?: AddressScalarWhereInput | AddressScalarWhereInput[]
    id?: StringFilter<"Address"> | string
    userId?: StringFilter<"Address"> | string
    label?: StringNullableFilter<"Address"> | string | null
    fullAddress?: StringFilter<"Address"> | string
    street?: StringFilter<"Address"> | string
    number?: StringNullableFilter<"Address"> | string | null
    block?: StringNullableFilter<"Address"> | string | null
    staircase?: StringNullableFilter<"Address"> | string | null
    floor?: StringNullableFilter<"Address"> | string | null
    door?: StringNullableFilter<"Address"> | string | null
    additionalInfo?: StringNullableFilter<"Address"> | string | null
    postalCode?: StringFilter<"Address"> | string
    city?: StringFilter<"Address"> | string
    province?: StringNullableFilter<"Address"> | string | null
    country?: StringFilter<"Address"> | string
    gmapsPlaceId?: StringNullableFilter<"Address"> | string | null
    latitude?: DecimalNullableFilter<"Address"> | Decimal | DecimalJsLike | number | string | null
    longitude?: DecimalNullableFilter<"Address"> | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFilter<"Address"> | boolean
    isDeleted?: BoolFilter<"Address"> | boolean
    deletedAt?: DateTimeNullableFilter<"Address"> | Date | string | null
    createdAt?: DateTimeFilter<"Address"> | Date | string
    updatedAt?: DateTimeFilter<"Address"> | Date | string
  }

  export type GiftRecipientUpsertWithWhereUniqueWithoutRecipientUserInput = {
    where: GiftRecipientWhereUniqueInput
    update: XOR<GiftRecipientUpdateWithoutRecipientUserInput, GiftRecipientUncheckedUpdateWithoutRecipientUserInput>
    create: XOR<GiftRecipientCreateWithoutRecipientUserInput, GiftRecipientUncheckedCreateWithoutRecipientUserInput>
  }

  export type GiftRecipientUpdateWithWhereUniqueWithoutRecipientUserInput = {
    where: GiftRecipientWhereUniqueInput
    data: XOR<GiftRecipientUpdateWithoutRecipientUserInput, GiftRecipientUncheckedUpdateWithoutRecipientUserInput>
  }

  export type GiftRecipientUpdateManyWithWhereWithoutRecipientUserInput = {
    where: GiftRecipientScalarWhereInput
    data: XOR<GiftRecipientUpdateManyMutationInput, GiftRecipientUncheckedUpdateManyWithoutRecipientUserInput>
  }

  export type UserCreateWithoutAddressesInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone?: PhoneCreateNestedOneWithoutUsersInput
    orders?: OrderCreateNestedManyWithoutUserInput
    giftRecipients?: GiftRecipientCreateNestedManyWithoutRecipientUserInput
  }

  export type UserUncheckedCreateWithoutAddressesInput = {
    id?: string
    phoneId?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutUserInput
    giftRecipients?: GiftRecipientUncheckedCreateNestedManyWithoutRecipientUserInput
  }

  export type UserCreateOrConnectWithoutAddressesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAddressesInput, UserUncheckedCreateWithoutAddressesInput>
  }

  export type UserUpsertWithoutAddressesInput = {
    update: XOR<UserUpdateWithoutAddressesInput, UserUncheckedUpdateWithoutAddressesInput>
    create: XOR<UserCreateWithoutAddressesInput, UserUncheckedCreateWithoutAddressesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAddressesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAddressesInput, UserUncheckedUpdateWithoutAddressesInput>
  }

  export type UserUpdateWithoutAddressesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: PhoneUpdateOneWithoutUsersNestedInput
    orders?: OrderUpdateManyWithoutUserNestedInput
    giftRecipients?: GiftRecipientUpdateManyWithoutRecipientUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAddressesInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutUserNestedInput
    giftRecipients?: GiftRecipientUncheckedUpdateManyWithoutRecipientUserNestedInput
  }

  export type StoreCreateWithoutOrdersInput = {
    id?: string
    url: string
    name: string
    platform?: $Enums.StorePlatform
    defaultLanguage?: string
    defaultCurrency?: string
    timezone?: string
    logoUrl?: string | null
    status?: $Enums.StoreStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    ecommerce: EcommerceCreateNestedOneWithoutStoresInput
  }

  export type StoreUncheckedCreateWithoutOrdersInput = {
    id?: string
    ecommerceId: string
    url: string
    name: string
    platform?: $Enums.StorePlatform
    defaultLanguage?: string
    defaultCurrency?: string
    timezone?: string
    logoUrl?: string | null
    status?: $Enums.StoreStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoreCreateOrConnectWithoutOrdersInput = {
    where: StoreWhereUniqueInput
    create: XOR<StoreCreateWithoutOrdersInput, StoreUncheckedCreateWithoutOrdersInput>
  }

  export type UserCreateWithoutOrdersInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone?: PhoneCreateNestedOneWithoutUsersInput
    addresses?: AddressCreateNestedManyWithoutUserInput
    giftRecipients?: GiftRecipientCreateNestedManyWithoutRecipientUserInput
  }

  export type UserUncheckedCreateWithoutOrdersInput = {
    id?: string
    phoneId?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    addresses?: AddressUncheckedCreateNestedManyWithoutUserInput
    giftRecipients?: GiftRecipientUncheckedCreateNestedManyWithoutRecipientUserInput
  }

  export type UserCreateOrConnectWithoutOrdersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
  }

  export type OrderAddressCreateWithoutOrderInput = {
    id?: string
    sourceAddressId?: string | null
    recipientType: $Enums.RecipientType
    recipientName: string
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    addressOrigin: $Enums.AddressOrigin
    confirmedAt: Date | string
    confirmedVia: $Enums.ConfirmedVia
    recipientPhone: PhoneCreateNestedOneWithoutOrderAddressesInput
  }

  export type OrderAddressUncheckedCreateWithoutOrderInput = {
    id?: string
    sourceAddressId?: string | null
    recipientType: $Enums.RecipientType
    recipientName: string
    recipientPhoneId: string
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    addressOrigin: $Enums.AddressOrigin
    confirmedAt: Date | string
    confirmedVia: $Enums.ConfirmedVia
  }

  export type OrderAddressCreateOrConnectWithoutOrderInput = {
    where: OrderAddressWhereUniqueInput
    create: XOR<OrderAddressCreateWithoutOrderInput, OrderAddressUncheckedCreateWithoutOrderInput>
  }

  export type GiftRecipientCreateWithoutOrderInput = {
    id?: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    phone: PhoneCreateNestedOneWithoutGiftRecipientsInput
    recipientUser: UserCreateNestedOneWithoutGiftRecipientsInput
  }

  export type GiftRecipientUncheckedCreateWithoutOrderInput = {
    id?: string
    phoneId: string
    recipientUserId: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GiftRecipientCreateOrConnectWithoutOrderInput = {
    where: GiftRecipientWhereUniqueInput
    create: XOR<GiftRecipientCreateWithoutOrderInput, GiftRecipientUncheckedCreateWithoutOrderInput>
  }

  export type ConversationCreateWithoutOrderInput = {
    id?: string
    userId: string
    conversationType: $Enums.ConversationType
    userType: $Enums.UserType
    status?: $Enums.ConversationStatus
    isRegisteredAdresles?: boolean | null
    isRegisteredEcommerce?: boolean | null
    hasAddressAdresles?: boolean | null
    hasAddressEcommerce?: boolean | null
    startedAt?: Date | string
    completedAt?: Date | string | null
  }

  export type ConversationUncheckedCreateWithoutOrderInput = {
    id?: string
    userId: string
    conversationType: $Enums.ConversationType
    userType: $Enums.UserType
    status?: $Enums.ConversationStatus
    isRegisteredAdresles?: boolean | null
    isRegisteredEcommerce?: boolean | null
    hasAddressAdresles?: boolean | null
    hasAddressEcommerce?: boolean | null
    startedAt?: Date | string
    completedAt?: Date | string | null
  }

  export type ConversationCreateOrConnectWithoutOrderInput = {
    where: ConversationWhereUniqueInput
    create: XOR<ConversationCreateWithoutOrderInput, ConversationUncheckedCreateWithoutOrderInput>
  }

  export type ConversationCreateManyOrderInputEnvelope = {
    data: ConversationCreateManyOrderInput | ConversationCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type StoreUpsertWithoutOrdersInput = {
    update: XOR<StoreUpdateWithoutOrdersInput, StoreUncheckedUpdateWithoutOrdersInput>
    create: XOR<StoreCreateWithoutOrdersInput, StoreUncheckedCreateWithoutOrdersInput>
    where?: StoreWhereInput
  }

  export type StoreUpdateToOneWithWhereWithoutOrdersInput = {
    where?: StoreWhereInput
    data: XOR<StoreUpdateWithoutOrdersInput, StoreUncheckedUpdateWithoutOrdersInput>
  }

  export type StoreUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    platform?: EnumStorePlatformFieldUpdateOperationsInput | $Enums.StorePlatform
    defaultLanguage?: StringFieldUpdateOperationsInput | string
    defaultCurrency?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumStoreStatusFieldUpdateOperationsInput | $Enums.StoreStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ecommerce?: EcommerceUpdateOneRequiredWithoutStoresNestedInput
  }

  export type StoreUncheckedUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    ecommerceId?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    platform?: EnumStorePlatformFieldUpdateOperationsInput | $Enums.StorePlatform
    defaultLanguage?: StringFieldUpdateOperationsInput | string
    defaultCurrency?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumStoreStatusFieldUpdateOperationsInput | $Enums.StoreStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutOrdersInput = {
    update: XOR<UserUpdateWithoutOrdersInput, UserUncheckedUpdateWithoutOrdersInput>
    create: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOrdersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOrdersInput, UserUncheckedUpdateWithoutOrdersInput>
  }

  export type UserUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: PhoneUpdateOneWithoutUsersNestedInput
    addresses?: AddressUpdateManyWithoutUserNestedInput
    giftRecipients?: GiftRecipientUpdateManyWithoutRecipientUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addresses?: AddressUncheckedUpdateManyWithoutUserNestedInput
    giftRecipients?: GiftRecipientUncheckedUpdateManyWithoutRecipientUserNestedInput
  }

  export type OrderAddressUpsertWithoutOrderInput = {
    update: XOR<OrderAddressUpdateWithoutOrderInput, OrderAddressUncheckedUpdateWithoutOrderInput>
    create: XOR<OrderAddressCreateWithoutOrderInput, OrderAddressUncheckedCreateWithoutOrderInput>
    where?: OrderAddressWhereInput
  }

  export type OrderAddressUpdateToOneWithWhereWithoutOrderInput = {
    where?: OrderAddressWhereInput
    data: XOR<OrderAddressUpdateWithoutOrderInput, OrderAddressUncheckedUpdateWithoutOrderInput>
  }

  export type OrderAddressUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceAddressId?: NullableStringFieldUpdateOperationsInput | string | null
    recipientType?: EnumRecipientTypeFieldUpdateOperationsInput | $Enums.RecipientType
    recipientName?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    addressOrigin?: EnumAddressOriginFieldUpdateOperationsInput | $Enums.AddressOrigin
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedVia?: EnumConfirmedViaFieldUpdateOperationsInput | $Enums.ConfirmedVia
    recipientPhone?: PhoneUpdateOneRequiredWithoutOrderAddressesNestedInput
  }

  export type OrderAddressUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceAddressId?: NullableStringFieldUpdateOperationsInput | string | null
    recipientType?: EnumRecipientTypeFieldUpdateOperationsInput | $Enums.RecipientType
    recipientName?: StringFieldUpdateOperationsInput | string
    recipientPhoneId?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    addressOrigin?: EnumAddressOriginFieldUpdateOperationsInput | $Enums.AddressOrigin
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedVia?: EnumConfirmedViaFieldUpdateOperationsInput | $Enums.ConfirmedVia
  }

  export type GiftRecipientUpsertWithoutOrderInput = {
    update: XOR<GiftRecipientUpdateWithoutOrderInput, GiftRecipientUncheckedUpdateWithoutOrderInput>
    create: XOR<GiftRecipientCreateWithoutOrderInput, GiftRecipientUncheckedCreateWithoutOrderInput>
    where?: GiftRecipientWhereInput
  }

  export type GiftRecipientUpdateToOneWithWhereWithoutOrderInput = {
    where?: GiftRecipientWhereInput
    data: XOR<GiftRecipientUpdateWithoutOrderInput, GiftRecipientUncheckedUpdateWithoutOrderInput>
  }

  export type GiftRecipientUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: PhoneUpdateOneRequiredWithoutGiftRecipientsNestedInput
    recipientUser?: UserUpdateOneRequiredWithoutGiftRecipientsNestedInput
  }

  export type GiftRecipientUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneId?: StringFieldUpdateOperationsInput | string
    recipientUserId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationUpsertWithWhereUniqueWithoutOrderInput = {
    where: ConversationWhereUniqueInput
    update: XOR<ConversationUpdateWithoutOrderInput, ConversationUncheckedUpdateWithoutOrderInput>
    create: XOR<ConversationCreateWithoutOrderInput, ConversationUncheckedCreateWithoutOrderInput>
  }

  export type ConversationUpdateWithWhereUniqueWithoutOrderInput = {
    where: ConversationWhereUniqueInput
    data: XOR<ConversationUpdateWithoutOrderInput, ConversationUncheckedUpdateWithoutOrderInput>
  }

  export type ConversationUpdateManyWithWhereWithoutOrderInput = {
    where: ConversationScalarWhereInput
    data: XOR<ConversationUpdateManyMutationInput, ConversationUncheckedUpdateManyWithoutOrderInput>
  }

  export type ConversationScalarWhereInput = {
    AND?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
    OR?: ConversationScalarWhereInput[]
    NOT?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
    id?: StringFilter<"Conversation"> | string
    orderId?: StringFilter<"Conversation"> | string
    userId?: StringFilter<"Conversation"> | string
    conversationType?: EnumConversationTypeFilter<"Conversation"> | $Enums.ConversationType
    userType?: EnumUserTypeFilter<"Conversation"> | $Enums.UserType
    status?: EnumConversationStatusFilter<"Conversation"> | $Enums.ConversationStatus
    isRegisteredAdresles?: BoolNullableFilter<"Conversation"> | boolean | null
    isRegisteredEcommerce?: BoolNullableFilter<"Conversation"> | boolean | null
    hasAddressAdresles?: BoolNullableFilter<"Conversation"> | boolean | null
    hasAddressEcommerce?: BoolNullableFilter<"Conversation"> | boolean | null
    startedAt?: DateTimeFilter<"Conversation"> | Date | string
    completedAt?: DateTimeNullableFilter<"Conversation"> | Date | string | null
  }

  export type OrderCreateWithoutOrderAddressInput = {
    id?: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    store: StoreCreateNestedOneWithoutOrdersInput
    user: UserCreateNestedOneWithoutOrdersInput
    giftRecipient?: GiftRecipientCreateNestedOneWithoutOrderInput
    conversations?: ConversationCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutOrderAddressInput = {
    id?: string
    storeId: string
    userId: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    giftRecipient?: GiftRecipientUncheckedCreateNestedOneWithoutOrderInput
    conversations?: ConversationUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutOrderAddressInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutOrderAddressInput, OrderUncheckedCreateWithoutOrderAddressInput>
  }

  export type PhoneCreateWithoutOrderAddressesInput = {
    id?: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country?: string | null
    numberType?: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational?: string | null
    formattedInternational?: string | null
    createdAt?: Date | string
    users?: UserCreateNestedManyWithoutPhoneInput
    giftRecipients?: GiftRecipientCreateNestedManyWithoutPhoneInput
  }

  export type PhoneUncheckedCreateWithoutOrderAddressesInput = {
    id?: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country?: string | null
    numberType?: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational?: string | null
    formattedInternational?: string | null
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutPhoneInput
    giftRecipients?: GiftRecipientUncheckedCreateNestedManyWithoutPhoneInput
  }

  export type PhoneCreateOrConnectWithoutOrderAddressesInput = {
    where: PhoneWhereUniqueInput
    create: XOR<PhoneCreateWithoutOrderAddressesInput, PhoneUncheckedCreateWithoutOrderAddressesInput>
  }

  export type OrderUpsertWithoutOrderAddressInput = {
    update: XOR<OrderUpdateWithoutOrderAddressInput, OrderUncheckedUpdateWithoutOrderAddressInput>
    create: XOR<OrderCreateWithoutOrderAddressInput, OrderUncheckedCreateWithoutOrderAddressInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutOrderAddressInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutOrderAddressInput, OrderUncheckedUpdateWithoutOrderAddressInput>
  }

  export type OrderUpdateWithoutOrderAddressInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    store?: StoreUpdateOneRequiredWithoutOrdersNestedInput
    user?: UserUpdateOneRequiredWithoutOrdersNestedInput
    giftRecipient?: GiftRecipientUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutOrderAddressInput = {
    id?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    giftRecipient?: GiftRecipientUncheckedUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type PhoneUpsertWithoutOrderAddressesInput = {
    update: XOR<PhoneUpdateWithoutOrderAddressesInput, PhoneUncheckedUpdateWithoutOrderAddressesInput>
    create: XOR<PhoneCreateWithoutOrderAddressesInput, PhoneUncheckedCreateWithoutOrderAddressesInput>
    where?: PhoneWhereInput
  }

  export type PhoneUpdateToOneWithWhereWithoutOrderAddressesInput = {
    where?: PhoneWhereInput
    data: XOR<PhoneUpdateWithoutOrderAddressesInput, PhoneUncheckedUpdateWithoutOrderAddressesInput>
  }

  export type PhoneUpdateWithoutOrderAddressesInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutPhoneNestedInput
    giftRecipients?: GiftRecipientUpdateManyWithoutPhoneNestedInput
  }

  export type PhoneUncheckedUpdateWithoutOrderAddressesInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutPhoneNestedInput
    giftRecipients?: GiftRecipientUncheckedUpdateManyWithoutPhoneNestedInput
  }

  export type OrderCreateWithoutGiftRecipientInput = {
    id?: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    store: StoreCreateNestedOneWithoutOrdersInput
    user: UserCreateNestedOneWithoutOrdersInput
    orderAddress?: OrderAddressCreateNestedOneWithoutOrderInput
    conversations?: ConversationCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutGiftRecipientInput = {
    id?: string
    storeId: string
    userId: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderAddress?: OrderAddressUncheckedCreateNestedOneWithoutOrderInput
    conversations?: ConversationUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutGiftRecipientInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutGiftRecipientInput, OrderUncheckedCreateWithoutGiftRecipientInput>
  }

  export type PhoneCreateWithoutGiftRecipientsInput = {
    id?: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country?: string | null
    numberType?: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational?: string | null
    formattedInternational?: string | null
    createdAt?: Date | string
    users?: UserCreateNestedManyWithoutPhoneInput
    orderAddresses?: OrderAddressCreateNestedManyWithoutRecipientPhoneInput
  }

  export type PhoneUncheckedCreateWithoutGiftRecipientsInput = {
    id?: string
    e164: string
    countryCallingCode: string
    nationalNumber: string
    country?: string | null
    numberType?: $Enums.PhoneNumberType | null
    isValid: boolean
    formattedNational?: string | null
    formattedInternational?: string | null
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutPhoneInput
    orderAddresses?: OrderAddressUncheckedCreateNestedManyWithoutRecipientPhoneInput
  }

  export type PhoneCreateOrConnectWithoutGiftRecipientsInput = {
    where: PhoneWhereUniqueInput
    create: XOR<PhoneCreateWithoutGiftRecipientsInput, PhoneUncheckedCreateWithoutGiftRecipientsInput>
  }

  export type UserCreateWithoutGiftRecipientsInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone?: PhoneCreateNestedOneWithoutUsersInput
    orders?: OrderCreateNestedManyWithoutUserInput
    addresses?: AddressCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutGiftRecipientsInput = {
    id?: string
    phoneId?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutUserInput
    addresses?: AddressUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutGiftRecipientsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGiftRecipientsInput, UserUncheckedCreateWithoutGiftRecipientsInput>
  }

  export type OrderUpsertWithoutGiftRecipientInput = {
    update: XOR<OrderUpdateWithoutGiftRecipientInput, OrderUncheckedUpdateWithoutGiftRecipientInput>
    create: XOR<OrderCreateWithoutGiftRecipientInput, OrderUncheckedCreateWithoutGiftRecipientInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutGiftRecipientInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutGiftRecipientInput, OrderUncheckedUpdateWithoutGiftRecipientInput>
  }

  export type OrderUpdateWithoutGiftRecipientInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    store?: StoreUpdateOneRequiredWithoutOrdersNestedInput
    user?: UserUpdateOneRequiredWithoutOrdersNestedInput
    orderAddress?: OrderAddressUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutGiftRecipientInput = {
    id?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderAddress?: OrderAddressUncheckedUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type PhoneUpsertWithoutGiftRecipientsInput = {
    update: XOR<PhoneUpdateWithoutGiftRecipientsInput, PhoneUncheckedUpdateWithoutGiftRecipientsInput>
    create: XOR<PhoneCreateWithoutGiftRecipientsInput, PhoneUncheckedCreateWithoutGiftRecipientsInput>
    where?: PhoneWhereInput
  }

  export type PhoneUpdateToOneWithWhereWithoutGiftRecipientsInput = {
    where?: PhoneWhereInput
    data: XOR<PhoneUpdateWithoutGiftRecipientsInput, PhoneUncheckedUpdateWithoutGiftRecipientsInput>
  }

  export type PhoneUpdateWithoutGiftRecipientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutPhoneNestedInput
    orderAddresses?: OrderAddressUpdateManyWithoutRecipientPhoneNestedInput
  }

  export type PhoneUncheckedUpdateWithoutGiftRecipientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    e164?: StringFieldUpdateOperationsInput | string
    countryCallingCode?: StringFieldUpdateOperationsInput | string
    nationalNumber?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    numberType?: NullableEnumPhoneNumberTypeFieldUpdateOperationsInput | $Enums.PhoneNumberType | null
    isValid?: BoolFieldUpdateOperationsInput | boolean
    formattedNational?: NullableStringFieldUpdateOperationsInput | string | null
    formattedInternational?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutPhoneNestedInput
    orderAddresses?: OrderAddressUncheckedUpdateManyWithoutRecipientPhoneNestedInput
  }

  export type UserUpsertWithoutGiftRecipientsInput = {
    update: XOR<UserUpdateWithoutGiftRecipientsInput, UserUncheckedUpdateWithoutGiftRecipientsInput>
    create: XOR<UserCreateWithoutGiftRecipientsInput, UserUncheckedCreateWithoutGiftRecipientsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGiftRecipientsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGiftRecipientsInput, UserUncheckedUpdateWithoutGiftRecipientsInput>
  }

  export type UserUpdateWithoutGiftRecipientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: PhoneUpdateOneWithoutUsersNestedInput
    orders?: OrderUpdateManyWithoutUserNestedInput
    addresses?: AddressUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutGiftRecipientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutUserNestedInput
    addresses?: AddressUncheckedUpdateManyWithoutUserNestedInput
  }

  export type OrderCreateWithoutConversationsInput = {
    id?: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    store: StoreCreateNestedOneWithoutOrdersInput
    user: UserCreateNestedOneWithoutOrdersInput
    orderAddress?: OrderAddressCreateNestedOneWithoutOrderInput
    giftRecipient?: GiftRecipientCreateNestedOneWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutConversationsInput = {
    id?: string
    storeId: string
    userId: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderAddress?: OrderAddressUncheckedCreateNestedOneWithoutOrderInput
    giftRecipient?: GiftRecipientUncheckedCreateNestedOneWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutConversationsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutConversationsInput, OrderUncheckedCreateWithoutConversationsInput>
  }

  export type OrderUpsertWithoutConversationsInput = {
    update: XOR<OrderUpdateWithoutConversationsInput, OrderUncheckedUpdateWithoutConversationsInput>
    create: XOR<OrderCreateWithoutConversationsInput, OrderUncheckedCreateWithoutConversationsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutConversationsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutConversationsInput, OrderUncheckedUpdateWithoutConversationsInput>
  }

  export type OrderUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    store?: StoreUpdateOneRequiredWithoutOrdersNestedInput
    user?: UserUpdateOneRequiredWithoutOrdersNestedInput
    orderAddress?: OrderAddressUpdateOneWithoutOrderNestedInput
    giftRecipient?: GiftRecipientUpdateOneWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderAddress?: OrderAddressUncheckedUpdateOneWithoutOrderNestedInput
    giftRecipient?: GiftRecipientUncheckedUpdateOneWithoutOrderNestedInput
  }

  export type UserCreateManyPhoneInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    preferredLanguage?: string | null
    isRegistered?: boolean
    registeredAt?: Date | string | null
    lastInteractionAt?: Date | string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GiftRecipientCreateManyPhoneInput = {
    id?: string
    orderId: string
    recipientUserId: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderAddressCreateManyRecipientPhoneInput = {
    id?: string
    orderId: string
    sourceAddressId?: string | null
    recipientType: $Enums.RecipientType
    recipientName: string
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    addressOrigin: $Enums.AddressOrigin
    confirmedAt: Date | string
    confirmedVia: $Enums.ConfirmedVia
  }

  export type UserUpdateWithoutPhoneInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUpdateManyWithoutUserNestedInput
    addresses?: AddressUpdateManyWithoutUserNestedInput
    giftRecipients?: GiftRecipientUpdateManyWithoutRecipientUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPhoneInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutUserNestedInput
    addresses?: AddressUncheckedUpdateManyWithoutUserNestedInput
    giftRecipients?: GiftRecipientUncheckedUpdateManyWithoutRecipientUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutPhoneInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    preferredLanguage?: NullableStringFieldUpdateOperationsInput | string | null
    isRegistered?: BoolFieldUpdateOperationsInput | boolean
    registeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastInteractionAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GiftRecipientUpdateWithoutPhoneInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutGiftRecipientNestedInput
    recipientUser?: UserUpdateOneRequiredWithoutGiftRecipientsNestedInput
  }

  export type GiftRecipientUncheckedUpdateWithoutPhoneInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    recipientUserId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GiftRecipientUncheckedUpdateManyWithoutPhoneInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    recipientUserId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderAddressUpdateWithoutRecipientPhoneInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceAddressId?: NullableStringFieldUpdateOperationsInput | string | null
    recipientType?: EnumRecipientTypeFieldUpdateOperationsInput | $Enums.RecipientType
    recipientName?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    addressOrigin?: EnumAddressOriginFieldUpdateOperationsInput | $Enums.AddressOrigin
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedVia?: EnumConfirmedViaFieldUpdateOperationsInput | $Enums.ConfirmedVia
    order?: OrderUpdateOneRequiredWithoutOrderAddressNestedInput
  }

  export type OrderAddressUncheckedUpdateWithoutRecipientPhoneInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sourceAddressId?: NullableStringFieldUpdateOperationsInput | string | null
    recipientType?: EnumRecipientTypeFieldUpdateOperationsInput | $Enums.RecipientType
    recipientName?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    addressOrigin?: EnumAddressOriginFieldUpdateOperationsInput | $Enums.AddressOrigin
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedVia?: EnumConfirmedViaFieldUpdateOperationsInput | $Enums.ConfirmedVia
  }

  export type OrderAddressUncheckedUpdateManyWithoutRecipientPhoneInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sourceAddressId?: NullableStringFieldUpdateOperationsInput | string | null
    recipientType?: EnumRecipientTypeFieldUpdateOperationsInput | $Enums.RecipientType
    recipientName?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    addressOrigin?: EnumAddressOriginFieldUpdateOperationsInput | $Enums.AddressOrigin
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedVia?: EnumConfirmedViaFieldUpdateOperationsInput | $Enums.ConfirmedVia
  }

  export type StoreCreateManyEcommerceInput = {
    id?: string
    url: string
    name: string
    platform?: $Enums.StorePlatform
    defaultLanguage?: string
    defaultCurrency?: string
    timezone?: string
    logoUrl?: string | null
    status?: $Enums.StoreStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoreUpdateWithoutEcommerceInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    platform?: EnumStorePlatformFieldUpdateOperationsInput | $Enums.StorePlatform
    defaultLanguage?: StringFieldUpdateOperationsInput | string
    defaultCurrency?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumStoreStatusFieldUpdateOperationsInput | $Enums.StoreStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUpdateManyWithoutStoreNestedInput
  }

  export type StoreUncheckedUpdateWithoutEcommerceInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    platform?: EnumStorePlatformFieldUpdateOperationsInput | $Enums.StorePlatform
    defaultLanguage?: StringFieldUpdateOperationsInput | string
    defaultCurrency?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumStoreStatusFieldUpdateOperationsInput | $Enums.StoreStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutStoreNestedInput
  }

  export type StoreUncheckedUpdateManyWithoutEcommerceInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    platform?: EnumStorePlatformFieldUpdateOperationsInput | $Enums.StorePlatform
    defaultLanguage?: StringFieldUpdateOperationsInput | string
    defaultCurrency?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumStoreStatusFieldUpdateOperationsInput | $Enums.StoreStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateManyStoreInput = {
    id?: string
    userId: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateWithoutStoreInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOrdersNestedInput
    orderAddress?: OrderAddressUpdateOneWithoutOrderNestedInput
    giftRecipient?: GiftRecipientUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutStoreInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderAddress?: OrderAddressUncheckedUpdateOneWithoutOrderNestedInput
    giftRecipient?: GiftRecipientUncheckedUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateManyWithoutStoreInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateManyUserInput = {
    id?: string
    storeId: string
    externalOrderId: string
    externalOrderNumber?: string | null
    totalAmount: Decimal | DecimalJsLike | number | string
    currency?: string
    feePercentage: Decimal | DecimalJsLike | number | string
    feeAmount: Decimal | DecimalJsLike | number | string
    status?: $Enums.OrderStatus
    orderMode: $Enums.OrderMode
    paymentType: $Enums.PaymentType
    isGift?: boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt: Date | string
    addressConfirmedAt?: Date | string | null
    syncedAt?: Date | string | null
    statusSource?: $Enums.StatusSource | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AddressCreateManyUserInput = {
    id?: string
    label?: string | null
    fullAddress: string
    street: string
    number?: string | null
    block?: string | null
    staircase?: string | null
    floor?: string | null
    door?: string | null
    additionalInfo?: string | null
    postalCode: string
    city: string
    province?: string | null
    country: string
    gmapsPlaceId?: string | null
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    isDefault?: boolean
    isDeleted?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GiftRecipientCreateManyRecipientUserInput = {
    id?: string
    orderId: string
    phoneId: string
    firstName: string
    lastName: string
    note?: string | null
    status?: $Enums.GiftRecipientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    store?: StoreUpdateOneRequiredWithoutOrdersNestedInput
    orderAddress?: OrderAddressUpdateOneWithoutOrderNestedInput
    giftRecipient?: GiftRecipientUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderAddress?: OrderAddressUncheckedUpdateOneWithoutOrderNestedInput
    giftRecipient?: GiftRecipientUncheckedUpdateOneWithoutOrderNestedInput
    conversations?: ConversationUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    externalOrderId?: StringFieldUpdateOperationsInput | string
    externalOrderNumber?: NullableStringFieldUpdateOperationsInput | string | null
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    feePercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feeAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    orderMode?: EnumOrderModeFieldUpdateOperationsInput | $Enums.OrderMode
    paymentType?: EnumPaymentTypeFieldUpdateOperationsInput | $Enums.PaymentType
    isGift?: BoolFieldUpdateOperationsInput | boolean
    itemsSummary?: NullableJsonNullValueInput | InputJsonValue
    webhookReceivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addressConfirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statusSource?: NullableEnumStatusSourceFieldUpdateOperationsInput | $Enums.StatusSource | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AddressUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AddressUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AddressUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: StringFieldUpdateOperationsInput | string
    street?: StringFieldUpdateOperationsInput | string
    number?: NullableStringFieldUpdateOperationsInput | string | null
    block?: NullableStringFieldUpdateOperationsInput | string | null
    staircase?: NullableStringFieldUpdateOperationsInput | string | null
    floor?: NullableStringFieldUpdateOperationsInput | string | null
    door?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    postalCode?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    province?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    gmapsPlaceId?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GiftRecipientUpdateWithoutRecipientUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutGiftRecipientNestedInput
    phone?: PhoneUpdateOneRequiredWithoutGiftRecipientsNestedInput
  }

  export type GiftRecipientUncheckedUpdateWithoutRecipientUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    phoneId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GiftRecipientUncheckedUpdateManyWithoutRecipientUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    phoneId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumGiftRecipientStatusFieldUpdateOperationsInput | $Enums.GiftRecipientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationCreateManyOrderInput = {
    id?: string
    userId: string
    conversationType: $Enums.ConversationType
    userType: $Enums.UserType
    status?: $Enums.ConversationStatus
    isRegisteredAdresles?: boolean | null
    isRegisteredEcommerce?: boolean | null
    hasAddressAdresles?: boolean | null
    hasAddressEcommerce?: boolean | null
    startedAt?: Date | string
    completedAt?: Date | string | null
  }

  export type ConversationUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    conversationType?: EnumConversationTypeFieldUpdateOperationsInput | $Enums.ConversationType
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus
    isRegisteredAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    isRegisteredEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ConversationUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    conversationType?: EnumConversationTypeFieldUpdateOperationsInput | $Enums.ConversationType
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus
    isRegisteredAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    isRegisteredEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ConversationUncheckedUpdateManyWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    conversationType?: EnumConversationTypeFieldUpdateOperationsInput | $Enums.ConversationType
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus
    isRegisteredAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    isRegisteredEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressAdresles?: NullableBoolFieldUpdateOperationsInput | boolean | null
    hasAddressEcommerce?: NullableBoolFieldUpdateOperationsInput | boolean | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use PhoneCountOutputTypeDefaultArgs instead
     */
    export type PhoneCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PhoneCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EcommerceCountOutputTypeDefaultArgs instead
     */
    export type EcommerceCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EcommerceCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StoreCountOutputTypeDefaultArgs instead
     */
    export type StoreCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StoreCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderCountOutputTypeDefaultArgs instead
     */
    export type OrderCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PhoneDefaultArgs instead
     */
    export type PhoneArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PhoneDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EcommerceDefaultArgs instead
     */
    export type EcommerceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EcommerceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StoreDefaultArgs instead
     */
    export type StoreArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StoreDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AddressDefaultArgs instead
     */
    export type AddressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AddressDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderDefaultArgs instead
     */
    export type OrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderAddressDefaultArgs instead
     */
    export type OrderAddressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderAddressDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GiftRecipientDefaultArgs instead
     */
    export type GiftRecipientArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GiftRecipientDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConversationDefaultArgs instead
     */
    export type ConversationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConversationDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}