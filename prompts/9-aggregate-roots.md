# DDD Module Structure - Personal Finance Management System

## Overview

This document organizes the Domain-Driven Design (DDD) structure by modules,
showing all aggregates, value objects, and domain services for each module. The
focus is on the **Transaction** and **User** modules.

---

##  Transaction Module

### **Aggregates**

#### 1. **Transaction** (Aggregate Root)

**Purpose**: Core financial transaction entity that manages all
transaction-related operations.

**Key Properties**:

- `id`: Unique identifier
- `amount`: Transaction amount (positive for income, negative for expense)
- `type`: Transaction type (income/expense)
- `currency`: ISO 4217 currency code
- `date`: Transaction date and time
- `description`: Human-readable description
- `frequency`: Recurrence pattern (one-time, daily, weekly, monthly, yearly)
- `status`: Current state (pending, completed, cancelled, failed)
- `categoryId`: Reference to category
- `userId`: Reference to user
- `bankAccountId`: Optional bank account reference
- `installmentCount`: Number of installments (if applicable)
- `installmentNumber`: Current installment number

**Business Rules**:

- Amount must be positive for income transactions, negative for expense
  transactions
- Currency must be valid ISO 4217 format
- Transaction date cannot be in the future for completed transactions
- Status transitions follow specific lifecycle rules
- Installment transactions must have valid installment count and current number

**Repository**: `TransactionRepository`

#### 2. **TransactionItem** (Entity within Transaction Aggregate)

**Purpose**: Individual line items within a composed transaction.

**Key Properties**:

- `id`: Unique identifier
- `description`: Item description
- `amount`: Item amount
- `type`: Item type (income/expense)
- `transactionId`: Reference to parent transaction
- `deductionType`: Type of deduction (tax, insurance, etc.)
- `grossAmount`: Original amount before deductions
- `netAmount`: Final amount after deductions

**Business Rules**:

- Sum of all items must equal parent transaction amount
- Each item must have valid amount and type
- Deduction calculations must be accurate

#### 3. **TransactionAttachment** (Entity within Transaction Aggregate)

**Purpose**: Manages receipts, invoices, and supporting documents.

**Key Properties**:

- `id`: Unique identifier
- `fileUrl`: Cloud storage URL
- `fileName`: Original file name
- `fileType`: MIME type
- `fileSize`: File size in bytes
- `transactionId`: Reference to parent transaction
- `uploadedAt`: Upload timestamp
- `description`: Optional description

**Business Rules**:

- File types must be in allowed list (PDF, JPG, PNG, etc.)
- File size must be within limits (e.g., 10MB max)
- Files must be stored securely in cloud storage

### **Value Objects**

#### **Money**

- `amount`: Decimal value
- `currency`: ISO 4217 currency code
- **Methods**: `add()`, `subtract()`, `multiply()`, `convert()`

#### **TransactionType**

- **Enum**: `INCOME`, `EXPENSE`
- **Validation**: Must be one of the defined values

#### **Frequency**

- **Enum**: `ONE_TIME`, `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`, `CUSTOM`
- **Methods**: `getNextOccurrence()`, `isRecurring()`

#### **TransactionStatus**

- **Enum**: `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`
- **State transitions** with validation

#### **InstallmentInfo**

- `totalCount`: Total number of installments
- `currentNumber`: Current installment number
- `remainingAmount`: Amount remaining to be paid
- **Methods**: `isComplete()`, `getNextDueDate()`

### **Domain Services**

#### **TransactionCalculator**

**Purpose**: Handles complex financial calculations.

**Methods**:

- `calculateNetAmount(grossAmount: Money, deductions: Money[]): Money`
- `calculateInstallments(totalAmount: Money, count: number): Money[]`
- `calculateRecurringTotal(transaction: Transaction, period: DateRange): Money`
- `calculateTaxDeductions(amount: Money, taxRate: number): Money`

#### **RecurrenceHandler**

**Purpose**: Manages recurring transaction logic.

**Methods**:

- `generateNextOccurrence(transaction: Transaction): Date`
- `validateRecurrencePattern(frequency: Frequency, customRule?: string): boolean`
- `calculateSeriesEnd(startDate: Date, frequency: Frequency, count?: number): Date`
- `shouldGenerateNext(transaction: Transaction, currentDate: Date): boolean`

#### **CurrencyConverter**

**Purpose**: Handles currency conversions using external APIs.

**Methods**:

- `convert(amount: Money, targetCurrency: string): Money`
- `getExchangeRate(fromCurrency: string, toCurrency: string): number`
- `updateRates(): Promise<void>`
- `isRateValid(currency: string): boolean`

#### **TransactionValidator**

**Purpose**: Validates transaction business rules.

**Methods**:

- `validateAmount(amount: Money, type: TransactionType): boolean`
- `validateCurrency(currency: string): boolean`
- `validateInstallments(count: number, amount: Money): boolean`
- `validateRecurrence(frequency: Frequency, endDate?: Date): boolean`

---

## 👤 User Module

### **Aggregates**

#### 1. **User** (Aggregate Root)

**Purpose**: Core user identity and authentication management.

**Key Properties**:

- `id`: Unique identifier
- `email`: User email address
- `username`: Unique username
- `passwordHash`: Encrypted password
- `status`: Account status (active, suspended, deleted)
- `createdAt`: Account creation timestamp
- `lastLoginAt`: Last login timestamp
- `emailVerified`: Email verification status
- `twoFactorEnabled`: 2FA status
- `failedLoginAttempts`: Count of failed login attempts
- `lockedUntil`: Account lock timestamp (if applicable)

**Business Rules**:

- Email must be unique across all users
- Username must be unique across all users
- Password must meet security requirements
- Account status transitions follow specific rules
- Failed login attempts trigger account lockout
- Email verification required for full access

**Repository**: `UserRepository`

#### 2. **UserProfile** (Entity within User Aggregate)

**Purpose**: Stores user personal and financial information.

**Key Properties**:

- `firstName`: User's first name
- `lastName`: User's last name
- `dateOfBirth`: Birth date
- `phoneNumber`: Contact phone number
- `defaultCurrency`: Preferred currency for transactions
- `timezone`: User's timezone
- `hourlyRate`: Hourly wage rate (for income calculations)
- `employmentStatus`: Employment type (full-time, part-time, freelance, etc.)
- `incomeFrequency`: Primary income frequency (weekly, bi-weekly, monthly)
- `taxRate`: Estimated tax rate for calculations

**Business Rules**:

- Personal information must be valid and complete
- Phone number must be in valid format
- Default currency must be supported by the system
- Timezone must be valid IANA identifier
- Hourly rate must be positive if provided

#### 3. **UserSettings** (Entity within User Aggregate)

**Purpose**: Manages user preferences and system configuration.

**Key Properties**:

- `notificationPreferences`: Email/push notification settings
- `privacySettings`: Data sharing and privacy controls
- `theme`: UI theme preference (light, dark, auto)
- `language`: Preferred language
- `dateFormat`: Date display format
- `currencyDisplay`: Currency display format
- `budgetAlerts`: Budget threshold alerts
- `goalReminders`: Financial goal reminder settings
- `exportPreferences`: Data export format preferences

**Business Rules**:

- Notification preferences must be valid combinations
- Privacy settings must comply with data protection regulations
- Theme and language must be supported by the application
- Date and currency formats must be valid

### **Value Objects**

#### **Email**

- `value`: Email address string
- **Validation**: RFC 5322 format, unique across system
- **Methods**: `isValid()`, `getDomain()`, `normalize()`

#### **Password**

- `hash`: Encrypted password hash
- `salt`: Random salt for security
- **Methods**: `verify(plainPassword: string): boolean`,
  `hash(plainPassword: string): string`,
  `meetsRequirements(plainPassword: string): boolean`

#### **Currency**

- `code`: ISO 4217 currency code
- **Validation**: Must be supported by system
- **Methods**: `isSupported()`, `getSymbol()`, `getDecimalPlaces()`

#### **Timezone**

- `identifier`: IANA timezone identifier
- **Validation**: Must be valid timezone
- **Methods**: `getOffset()`, `isValid()`, `getCurrentTime()`

#### **PhoneNumber**

- `value`: Phone number string
- `countryCode`: Country calling code
- **Validation**: E.164 format
- **Methods**: `isValid()`, `format()`, `getCountryCode()`

#### **UserStatus**

- **Enum**: `ACTIVE`, `SUSPENDED`, `DELETED`, `PENDING_VERIFICATION`
- **State transitions** with validation

### **Domain Services**

#### **UserValidator**

**Purpose**: Validates user data and business rules.

**Methods**:

- `validateEmail(email: string): boolean`
- `validatePassword(password: string): boolean`
- `validateProfile(profile: UserProfile): ValidationResult`
- `validateSettings(settings: UserSettings): ValidationResult`
- `checkUsernameAvailability(username: string): boolean`

#### **UserEmailManager**

**Purpose**: Handles email verification and notifications.

**Methods**:

- `sendVerificationEmail(user: User): Promise<void>`
- `sendPasswordReset(user: User): Promise<void>`
- `sendWelcomeEmail(user: User): Promise<void>`
- `sendAccountLockedNotification(user: User): Promise<void>`
- `verifyEmailToken(token: string): Promise<boolean>`

#### **PermissionChecker**

**Purpose**: Manages user permissions and access control.

**Methods**:

- `hasPermission(userId: string, permission: string): boolean`
- `checkRole(userId: string, role: string): boolean`
- `validateAccess(userId: string, resourceId: string, action: string): boolean`
- `getUserPermissions(userId: string): Permission[]`
- `grantPermission(userId: string, permission: string): void`

#### **UserAuthenticationService**

**Purpose**: Handles authentication and session management.

**Methods**:

- `authenticate(email: string, password: string): AuthenticationResult`
- `refreshToken(refreshToken: string): AuthenticationResult`
- `logout(userId: string): Promise<void>`
- `validateSession(sessionToken: string): boolean`
- `lockAccount(userId: string, reason: string): void`

---

## Summary

This modular DDD structure provides:

1. **Clear Boundaries**: Each module has its own aggregates, value objects, and
   services
2. **Maintainability**: Changes in one module don't affect others
3. **Testability**: Each module can be tested independently
4. **Scalability**: New modules can be added without affecting existing ones
5. **Business Focus**: Each module reflects real business domains

The **Transaction** and **User** modules form the core of the system, with
ommited supporting modules for **Budget**, **Goal**, **Category**, and
**Notification** management.
