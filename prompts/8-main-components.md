# Transaction and User Modules Specification

## Overview

This document describes the core Transaction and User modules for the personal
finance management system. The modules follow Domain-Driven Design (DDD)
principles and are designed to handle complex financial transactions with
composition capabilities.

## Transaction Module

### Core Types

```typescript
// Transaction Types
type TransactionType = "INCOME" | "EXPENSE";

type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY";

// Calculation type for composition
type Calculation = string; // Mathematical expression referencing other transaction IDs

// Installment object
type Installment = {
  current: number;
  total: number;
  interest: number;
};

// Freelance object for hourly work
type Freelance = {
  rate: number;
  totalHours: number;
  chargedHours: number;
};

// Bank Account Type
type BankAccountType = "CHECKING" | "SAVINGS" | "CREDIT" | "INVESTMENT";

// Transaction Entity
type Transaction = {
  id: UUID;
  userId: UUID;
  name: string;
  description?: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  categoryId: UUID;
  bankAccountId?: UUID;
  frequency: CronString;
  isActive: boolean;
  date: Date;
  dueDate?: Date;
  installment?: Installment;
  freelance?: Freelance;
  attachments?: TransactionAttachment[];
  calculations?: Calculation[]; // For composition
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// Transaction Attachment
type TransactionAttachment = {
  id: UUID;
  transactionId: UUID;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// Category
type Category = {
  id: UUID;
  userId: UUID;
  name: string;
  description?: string;
  color: string;
  icon: string;
  parentCategoryId?: UUID;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// Bank Account
type BankAccount = {
  id: UUID;
  userId: UUID;
  name: string;
  bankName: string;
  accountNumber?: string;
  accountType: BankAccountType;
  balance: number;
  currency: Currency;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};
```

### Service Layer

```typescript
// Transaction Service Interface
type TransactionService = {
  // CRUD Operations
  createTransaction(transaction: CreateTransactionDto): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction>;
  updateTransaction(
    id: string,
    updates: UpdateTransactionDto
  ): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;

  // Query Operations
  getTransactionsByUser(filters?: TransactionFilters): Promise<Transaction[]>;
  getTransactionsByCategory(categoryId: string): Promise<Transaction[]>;
  getTransactionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]>;

  // Composition Operations
  calculateComposition(calculations: Calculation[]): Promise<number>;
  validateCalculations(calculations: Calculation[]): Promise<boolean>;

  // Business Logic
  processRecurringTransactions(): Promise<void>;
  processInstallments(): Promise<void>;
  calculateNetAmount(transaction: Transaction): Promise<number>;

  // Attachments
  uploadAttachment(
    transactionId: string,
    file: File
  ): Promise<TransactionAttachment>;
  deleteAttachment(attachmentId: string): Promise<void>;
};

// DTOs
type CreateTransactionDto = {
  name: string;
  description?: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  categoryId: string;
  bankAccountId?: string;
  frequency: CronString;
  date: Date;
  dueDate?: Date;
  installment?: Installment;
  freelance?: Freelance;
  calculations?: Calculation[];
};

type UpdateTransactionDto = Partial<CreateTransactionDto>;

type TransactionFilters = {
  type?: TransactionType;
  categoryId?: string;
  bankAccountId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isActive?: boolean;
};
```

## User Module

### Core Types

```typescript
// User Types
type UserRole = "USER" | "PREMIUM" | "ADMIN";

type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

type NotificationPreference = {
  email: boolean;
  push: boolean;
  sms: boolean;
};

// User Entity
type User = {
  id: UUID;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneNumber?: string;
  dateOfBirth?: Date;
  profile: UserProfile;
  settings: UserSettings;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  deletedAt?: Date;
};

// User Profile
type UserProfile = {
  id: UUID;
  userId: UUID;
  avatar?: string;
  bio?: string;
  location?: string;
  timezone: string;
  language: string;
  occupation?: string;
  employer?: string;
  annualIncome?: number;
  primaryCurrency: Currency;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// User Settings
type UserSettings = {
  id: UUID;
  userId: UUID;
  notifications: NotificationPreference;
  privacy: {
    shareData: boolean;
    publicProfile: boolean;
    allowAnalytics: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
  };
  display: {
    theme: "LIGHT" | "DARK" | "AUTO";
    dateFormat: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
    timeFormat: "12H" | "24H";
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// User Preferences
type UserPreferences = {
  id: UUID;
  userId: UUID;
  budgetAlerts: {
    enabled: boolean;
    threshold: Calculation;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  };
  paydayReminders: {
    enabled: boolean;
    daysInAdvance: number;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};
```

### Service Layer

```typescript
// User Service Interface
type UserService = {
  // CRUD Operations
  createUser(userData: CreateUserDto): Promise<User>;
  getUserById(id: string): Promise<User>;
  updateUser(id: string, updates: UpdateUserDto): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Authentication & Authorization
  authenticateUser(email: string, password: string): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  logout(userId: string): Promise<void>;
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void>;

  // Profile Management
  updateProfile(
    userId: string,
    profile: Partial<UserProfile>
  ): Promise<UserProfile>;
  updateSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<UserSettings>;
  updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences>;

  // Security
  enableTwoFactor(userId: string): Promise<TwoFactorSetup>;
  verifyTwoFactor(userId: string, token: string): Promise<boolean>;
  disableTwoFactor(userId: string, password: string): Promise<void>;

  // Account Management
  verifyEmail(token: string): Promise<void>;
  resendVerificationEmail(email: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
  confirmPasswordReset(token: string, newPassword: string): Promise<void>;

  // Analytics & Insights
  getUserInsights(userId: string): Promise<UserInsights>;
  getUserActivity(
    userId: string,
    dateRange: DateRange
  ): Promise<UserActivity[]>;
};

// DTOs
type CreateUserDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
};

type UpdateUserDto = Partial<Omit<CreateUserDto, "password">>;

type AuthResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type TwoFactorSetup = {
  secret: string;
  qrCode: string;
  backupCodes: string[];
};

type UserInsights = {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  savingsRate: number;
  topCategories: CategoryTotal[];
  recentActivity: UserActivity[];
};

type UserActivity = {
  id: UUID;
  userId: UUID;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
};

type DateRange = {
  startDate: Date;
  endDate: Date;
};

type CategoryTotal = {
  categoryId: UUID;
  categoryName: string;
  total: number;
  count: number;
};
```

## Module Interactions

### Transaction-User Relationships

1. **Ownership**: All transactions belong to a specific user
2. **Categories**: Users can create custom categories, with system defaults and
   hierarchical structure
3. **Bank Accounts**: Users can link multiple bank accounts with different types
4. **Preferences**: User preferences affect transaction display and calculations
5. **Security**: Users can only access their own transactions

### Composition Feature

The composition feature allows users to create complex transactions by
referencing other transaction IDs in mathematical expressions:

```typescript
// Example calculations
type CalculationExamples = {
  salary: "TXN_001 + TXN_002 + TXN_003"; // Salary + bonus + overtime
  totalExpenses: "TXN_004 + TXN_005 + TXN_006"; // Rent + utilities + groceries
  netIncome: "TXN_001 - TXN_007 - TXN_008"; // Gross salary - taxes - deductions
  monthlyBudget: "TXN_009 * 0.5 + TXN_010 * 0.3 + TXN_011 * 0.2"; // 50/30/20 rule
  budgetAlert: "TXN_012 + TXN_013 + TXN_014 > 1000"; // Alert if expenses exceed 1000
};
```

### Validation Rules

1. **Transaction Validation**:

   - Amount must be positive for income, negative for expenses
   - Date cannot be in the future (except for scheduled transactions)
   - Category must exist and belong to the user
   - Bank account must belong to the user
   - Cron string must be valid format
   - Installment current cannot exceed total
   - Freelance charged hours cannot exceed total hours

2. **User Validation**:

   - Email must be unique and valid format
   - Password must meet security requirements
   - Username must be unique if provided
   - Phone number must be valid format if provided

3. **Composition Validation**:
   - All referenced transaction IDs must exist
   - Referenced transactions must belong to the same user
   - Mathematical expressions must be valid
   - No circular references allowed

## Error Handling

```typescript
type ModuleError = {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  module?: "TRANSACTION" | "USER";
};

type TransactionError = ModuleError & {
  transactionId?: string;
  userId?: string;
};

type UserError = ModuleError & {
  userId?: string;
  email?: string;
};
```

This specification provides a solid foundation for implementing the Transaction
and User modules with proper separation of concerns, type safety, and
extensibility for future features.
