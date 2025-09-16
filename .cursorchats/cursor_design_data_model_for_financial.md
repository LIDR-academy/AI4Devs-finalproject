# Design data model for financial management app
_Exported on 19/08/2025 at 8:46:32 CEST from Cursor (1.4.5)_

---

**User**

You are a database architect expert. Let's discuss the data model for a couple's financial management web application with the following requirements:

**Application Context:**
- Two user system for couples to track shared and personal finances
- Supports multiple currencies with automatic conversion
- Implements 50/30/20 budgeting rule (Needs/Wants/Savings) with sub-envelopes
- Tracks transactions with categorization (auto and manual)
- Supports CSV/OFX bank data imports
- Maintains audit trail for all changes
- Has role-based permissions (individual vs shared access)
- Self-hosted on SQLite database

**Special Considerations:**
- Support for multi-currency with base currency conversion
- Flexible categorization system with parent/child categories
- Audit trail that tracks who changed what and when
- Privacy controls (what each partner can see)
- Budget periods (monthly, annual, etc.)

Propose me a high level view of the simplest datamodel that would fulfill these requirements. This is totally theoretical. There is nothing implemented yet.

---

**Cursor**

I'll design a simple yet comprehensive data model for your couple's financial management application. Let me break this down into the core entities and their relationships.

## Core Entities

### 1. **Users**
```sql
users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    base_currency_id INTEGER REFERENCES currencies(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### 2. **Currencies & Exchange Rates**
```sql
currencies (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- USD, EUR, etc.
    name TEXT NOT NULL,
    symbol TEXT NOT NULL
)

exchange_rates (
    id INTEGER PRIMARY KEY,
    from_currency_id INTEGER REFERENCES currencies(id),
    to_currency_id INTEGER REFERENCES currencies(id),
    rate DECIMAL(10,6) NOT NULL,
    date DATE NOT NULL,
    UNIQUE(from_currency_id, to_currency_id, date)
)
```

### 3. **Accounts**
```sql
accounts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL, -- checking, savings, credit_card, etc.
    currency_id INTEGER REFERENCES currencies(id),
    initial_balance DECIMAL(10,2) DEFAULT 0,
    ownership_type TEXT NOT NULL, -- 'personal_user1', 'personal_user2', 'shared'
    owner_user_id INTEGER REFERENCES users(id), -- NULL if shared
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### 4. **Categories (Hierarchical)**
```sql
categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    budget_type TEXT, -- 'needs', 'wants', 'savings' (for top-level)
    is_system BOOLEAN DEFAULT FALSE, -- for default categories
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP
)
```

### 5. **Transactions**
```sql
transactions (
    id INTEGER PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    amount DECIMAL(10,2) NOT NULL, -- in account currency
    base_amount DECIMAL(10,2) NOT NULL, -- converted to user's base currency
    transaction_date DATE NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    transaction_type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
    linked_transaction_id INTEGER REFERENCES transactions(id), -- for transfers
    import_id TEXT, -- for tracking imported transactions
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### 6. **Budgets**
```sql
budgets (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    period_type TEXT NOT NULL, -- 'monthly', 'annual', 'custom'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP
)

budget_envelopes (
    id INTEGER PRIMARY KEY,
    budget_id INTEGER REFERENCES budgets(id),
    category_id INTEGER REFERENCES categories(id),
    allocated_amount DECIMAL(10,2) NOT NULL,
    currency_id INTEGER REFERENCES currencies(id),
    envelope_type TEXT NOT NULL -- 'needs', 'wants', 'savings'
)
```

### 7. **Permissions**
```sql
permissions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    resource_type TEXT NOT NULL, -- 'account', 'transaction', 'budget'
    resource_id INTEGER NOT NULL,
    permission_type TEXT NOT NULL, -- 'view', 'edit', 'delete'
    UNIQUE(user_id, resource_type, resource_id, permission_type)
)
```

### 8. **Audit Trail**
```sql
audit_log (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL, -- 'create', 'update', 'delete'
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### 9. **Import History**
```sql
imports (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_id INTEGER REFERENCES accounts(id),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'csv', 'ofx'
    transaction_count INTEGER,
    status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
    error_message TEXT,
    imported_at TIMESTAMP
)
```

## Key Design Decisions:

1. **Multi-Currency Support**: 
   - Each account has its own currency
   - Transactions store both original and base currency amounts
   - Exchange rates table maintains historical rates

2. **Hierarchical Categories**:
   - Self-referencing parent_id allows unlimited nesting
   - Top-level categories map to 50/30/20 rule

3. **Privacy & Permissions**:
   - Accounts have ownership_type (personal vs shared)
   - Granular permissions table for fine-grained access control

4. **Audit Trail**:
   - Generic audit_log table captures all changes
   - Stores old/new values as JSON for flexibility

5. **Budget Flexibility**:
   - Separate budgets and budget_envelopes tables
   - Supports different period types
   - Links to category hierarchy

This model provides a solid foundation while keeping complexity manageable for a SQLite-based application. It supports all your requirements while remaining extensible for future features.

```sql
users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    base_currency_id INTEGER REFERENCES currencies(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

```sql
currencies (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- USD, EUR, etc.
    name TEXT NOT NULL,
    symbol TEXT NOT NULL
)

exchange_rates (
    id INTEGER PRIMARY KEY,
    from_currency_id INTEGER REFERENCES currencies(id),
    to_currency_id INTEGER REFERENCES currencies(id),
    rate DECIMAL(10,6) NOT NULL,
    date DATE NOT NULL,
    UNIQUE(from_currency_id, to_currency_id, date)
)
```

```sql
accounts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL, -- checking, savings, credit_card, etc.
    currency_id INTEGER REFERENCES currencies(id),
    initial_balance DECIMAL(10,2) DEFAULT 0,
    ownership_type TEXT NOT NULL, -- 'personal_user1', 'personal_user2', 'shared'
    owner_user_id INTEGER REFERENCES users(id), -- NULL if shared
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

```sql
categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    budget_type TEXT, -- 'needs', 'wants', 'savings' (for top-level)
    is_system BOOLEAN DEFAULT FALSE, -- for default categories
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP
)
```

```sql
transactions (
    id INTEGER PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    amount DECIMAL(10,2) NOT NULL, -- in account currency
    base_amount DECIMAL(10,2) NOT NULL, -- converted to user's base currency
    transaction_date DATE NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    transaction_type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
    linked_transaction_id INTEGER REFERENCES transactions(id), -- for transfers
    import_id TEXT, -- for tracking imported transactions
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

```sql
budgets (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    period_type TEXT NOT NULL, -- 'monthly', 'annual', 'custom'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP
)

budget_envelopes (
    id INTEGER PRIMARY KEY,
    budget_id INTEGER REFERENCES budgets(id),
    category_id INTEGER REFERENCES categories(id),
    allocated_amount DECIMAL(10,2) NOT NULL,
    currency_id INTEGER REFERENCES currencies(id),
    envelope_type TEXT NOT NULL -- 'needs', 'wants', 'savings'
)
```

```sql
permissions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    resource_type TEXT NOT NULL, -- 'account', 'transaction', 'budget'
    resource_id INTEGER NOT NULL,
    permission_type TEXT NOT NULL, -- 'view', 'edit', 'delete'
    UNIQUE(user_id, resource_type, resource_id, permission_type)
)
```

```sql
audit_log (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL, -- 'create', 'update', 'delete'
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

```sql
imports (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_id INTEGER REFERENCES accounts(id),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'csv', 'ofx'
    transaction_count INTEGER,
    status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
    error_message TEXT,
    imported_at TIMESTAMP
)
```

---

**User**

Generate a mermaid diagram for this data model. Use all allowed parameters for details such as primary and foreign keys

---

**Cursor**

I'll create a comprehensive Mermaid Entity Relationship Diagram for the financial management data model:

I've created a comprehensive Mermaid ERD diagram for the financial management data model. The diagram includes:

## Key Features Shown:
- **Primary Keys (PK)**: Marked for each table's unique identifier
- **Foreign Keys (FK)**: Shows all relationships between tables
- **Unique Keys (UK)**: Like email in the users table
- **Self-referencing relationships**: 
  - Categories can have parent categories (hierarchical structure)
  - Transactions can link to other transactions (for transfers)

## Relationship Notations:
- `||--o{` = One-to-many (one required, many optional)
- `||--o|` = One-to-zero-or-one

## Key Design Patterns Visible:
1. **Multi-currency support**: Through currencies table linked to users, accounts, and budget_envelopes
2. **Audit trail**: audit_log table connected to users tracking all changes
3. **Permission system**: Flexible permissions table for role-based access
4. **Import tracking**: imports table for CSV/OFX file history
5. **Budget structure**: Separate budgets and budget_envelopes for flexibility

The diagram clearly shows how all entities relate to each other while maintaining data integrity through foreign key constraints. This visual representation makes it easy to understand the data flow and relationships in the couple's financial management system.

---

**User**

Describe each entity.
- Include the name and type of each attribute. 
- Sort description
- Primary and foreign keys
- Relalations and their type
- Restriction

---

**Cursor**

I'll provide a detailed description of each entity in the data model:

## 1. **Users**
**Short Description**: Core user accounts for the two partners in the financial management system.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `email` (TEXT) - Unique constraint, user's email address
- `name` (TEXT) - User's display name
- `base_currency_id` (INTEGER) - Foreign Key to currencies table
- `created_at` (TIMESTAMP) - Account creation timestamp
- `updated_at` (TIMESTAMP) - Last modification timestamp

**Relations**:
- **Has one** base currency (currencies)
- **Has many** accounts (one-to-many)
- **Has many** created categories (one-to-many)
- **Has many** created transactions (one-to-many)
- **Has many** created budgets (one-to-many)
- **Has many** permissions (one-to-many)
- **Has many** audit log entries (one-to-many)
- **Has many** imports (one-to-many)

**Restrictions**:
- Email must be unique across all users
- Base currency is required

---

## 2. **Currencies**
**Short Description**: Supported currencies for multi-currency transaction tracking.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `code` (TEXT) - Unique constraint, ISO currency code (USD, EUR, etc.)
- `name` (TEXT) - Full currency name
- `symbol` (TEXT) - Currency symbol ($, €, etc.)

**Relations**:
- **Used by many** users as base currency (one-to-many)
- **Used by many** accounts (one-to-many)
- **Used by many** budget envelopes (one-to-many)
- **Has many** exchange rates as source (one-to-many)
- **Has many** exchange rates as target (one-to-many)

**Restrictions**:
- Currency code must be unique

---

## 3. **Exchange Rates**
**Short Description**: Historical exchange rates for currency conversion.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `from_currency_id` (INTEGER) - Foreign Key to currencies (source)
- `to_currency_id` (INTEGER) - Foreign Key to currencies (target)
- `rate` (DECIMAL(10,6)) - Exchange rate value
- `date` (DATE) - Date of the exchange rate

**Relations**:
- **Belongs to** one source currency (many-to-one)
- **Belongs to** one target currency (many-to-one)

**Restrictions**:
- Unique constraint on (from_currency_id, to_currency_id, date)
- Rate must be positive

---

## 4. **Accounts**
**Short Description**: Bank accounts, credit cards, and other financial accounts.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `name` (TEXT) - Account name/description
- `account_type` (TEXT) - Type (checking, savings, credit_card, etc.)
- `currency_id` (INTEGER) - Foreign Key to currencies
- `initial_balance` (DECIMAL(10,2)) - Starting balance, default 0
- `ownership_type` (TEXT) - 'personal_user1', 'personal_user2', or 'shared'
- `owner_user_id` (INTEGER) - Foreign Key to users (NULL if shared)
- `is_active` (BOOLEAN) - Active status, default TRUE
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last modification timestamp

**Relations**:
- **Belongs to** one currency (many-to-one)
- **Belongs to** one user if personal (many-to-one, optional)
- **Has many** transactions (one-to-many)
- **Has many** imports (one-to-many)

**Restrictions**:
- If ownership_type is 'personal_user1' or 'personal_user2', owner_user_id must be set
- If ownership_type is 'shared', owner_user_id must be NULL

---

## 5. **Categories**
**Short Description**: Hierarchical transaction categories supporting the 50/30/20 budget rule.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `name` (TEXT) - Category name
- `parent_id` (INTEGER) - Foreign Key to categories (self-referencing)
- `budget_type` (TEXT) - 'needs', 'wants', or 'savings' (for top-level)
- `is_system` (BOOLEAN) - System-defined category flag, default FALSE
- `created_by` (INTEGER) - Foreign Key to users
- `created_at` (TIMESTAMP) - Creation timestamp

**Relations**:
- **Belongs to** one parent category (many-to-one, optional)
- **Has many** child categories (one-to-many)
- **Created by** one user (many-to-one)
- **Used by many** transactions (one-to-many)
- **Used by many** budget envelopes (one-to-many)

**Restrictions**:
- Parent categories cannot create circular references
- Top-level categories should have budget_type set

---

## 6. **Transactions**
**Short Description**: Financial transactions with multi-currency support and categorization.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `account_id` (INTEGER) - Foreign Key to accounts
- `amount` (DECIMAL(10,2)) - Amount in account currency
- `base_amount` (DECIMAL(10,2)) - Amount converted to user's base currency
- `transaction_date` (DATE) - Date of transaction
- `description` (TEXT) - Transaction description
- `category_id` (INTEGER) - Foreign Key to categories
- `transaction_type` (TEXT) - 'income', 'expense', or 'transfer'
- `linked_transaction_id` (INTEGER) - Foreign Key to transactions (self-referencing)
- `import_id` (TEXT) - External ID for imported transactions
- `created_by` (INTEGER) - Foreign Key to users
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last modification timestamp

**Relations**:
- **Belongs to** one account (many-to-one)
- **Belongs to** one category (many-to-one, optional)
- **Created by** one user (many-to-one)
- **Linked to** one other transaction for transfers (one-to-one, optional)

**Restrictions**:
- Amount must match transaction_type (positive for income, negative for expense)
- Linked transactions must be paired (transfer in/out)

---

## 7. **Budgets**
**Short Description**: Budget periods for financial planning.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `name` (TEXT) - Budget name
- `period_type` (TEXT) - 'monthly', 'annual', or 'custom'
- `start_date` (DATE) - Budget period start
- `end_date` (DATE) - Budget period end
- `is_active` (BOOLEAN) - Active status, default TRUE
- `created_by` (INTEGER) - Foreign Key to users
- `created_at` (TIMESTAMP) - Creation timestamp

**Relations**:
- **Created by** one user (many-to-one)
- **Has many** budget envelopes (one-to-many)

**Restrictions**:
- End date must be after start date
- Only one active budget per period

---

## 8. **Budget Envelopes**
**Short Description**: Budget allocations for specific categories within a budget period.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `budget_id` (INTEGER) - Foreign Key to budgets
- `category_id` (INTEGER) - Foreign Key to categories
- `allocated_amount` (DECIMAL(10,2)) - Budget allocation
- `currency_id` (INTEGER) - Foreign Key to currencies
- `envelope_type` (TEXT) - 'needs', 'wants', or 'savings'

**Relations**:
- **Belongs to** one budget (many-to-one)
- **Belongs to** one category (many-to-one)
- **Uses** one currency (many-to-one)

**Restrictions**:
- Allocated amount must be positive
- Envelope type must match category's budget type

---

## 9. **Permissions**
**Short Description**: Granular access control for resources between partners.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `user_id` (INTEGER) - Foreign Key to users
- `resource_type` (TEXT) - 'account', 'transaction', or 'budget'
- `resource_id` (INTEGER) - ID of the specific resource
- `permission_type` (TEXT) - 'view', 'edit', or 'delete'

**Relations**:
- **Belongs to** one user (many-to-one)

**Restrictions**:
- Unique constraint on (user_id, resource_type, resource_id, permission_type)
- Resource_id must exist in the corresponding table

---

## 10. **Audit Log**
**Short Description**: Complete audit trail of all data changes.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `user_id` (INTEGER) - Foreign Key to users
- `action` (TEXT) - 'create', 'update', or 'delete'
- `table_name` (TEXT) - Name of affected table
- `record_id` (INTEGER) - ID of affected record
- `old_values` (TEXT) - JSON of previous values
- `new_values` (TEXT) - JSON of new values
- `timestamp` (TIMESTAMP) - Action timestamp, default CURRENT_TIMESTAMP

**Relations**:
- **Created by** one user (many-to-one)

**Restrictions**:
- Old_values is NULL for create actions
- New_values is NULL for delete actions

---

## 11. **Imports**
**Short Description**: History of bank data imports from CSV/OFX files.

**Attributes**:
- `id` (INTEGER) - Primary Key
- `user_id` (INTEGER) - Foreign Key to users
- `account_id` (INTEGER) - Foreign Key to accounts
- `file_name` (TEXT) - Name of imported file
- `file_type` (TEXT) - 'csv' or 'ofx'
- `transaction_count` (INTEGER) - Number of transactions imported
- `status` (TEXT) - 'pending', 'completed', or 'failed'
- `error_message` (TEXT) - Error details if failed
- `imported_at` (TIMESTAMP) - Import timestamp

**Relations**:
- **Performed by** one user (many-to-one)
- **Imports to** one account (many-to-one)

**Restrictions**:
- Transaction_count must be non-negative
- Error_message only set when status is 'failed'

