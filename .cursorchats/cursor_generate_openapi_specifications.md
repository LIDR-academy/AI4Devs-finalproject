# Generate OpenAPI specifications for financial app
_Exported on 31/08/2025 at 4:14:04 CEST from Cursor (1.5.7)_

---

**User**

You are a senior backend engineer specializing in RESTful API design and OpenAPI specifications.

## Task

Generate OpenAPI 3.0 @OpenAPI 3.0 specifications for the THREE most critical API endpoints of the application described in @## 1. General Product Description with the following data model @## 3. Data Model 

## Requirements for Each Endpoint

For each endpoint, provide:
- Complete OpenAPI specification including:
  - Path and HTTP method
  - Summary and description
  - Request parameters (path, query, body)
  - Request body schema (if applicable)
  - Response schemas for all status codes
  - Security requirements (JWT Bearer token)
  - Tags for API organization
- Realistic example request and response 
- Consider multi-currency scenarios and partner permissions

## Specific Considerations

1. All monetary amounts should include currency information
2. Responses should handle both account currency and user's base currency
3. Include proper error responses for unauthorized access to partner's personal data
4. Date formats should follow ISO 8601
5. Pagination should be implemented for list endpoints
6. Include filtering capabilities where appropriate

## Output Format

Present the API specification in YAML format following OpenAPI 3.0 standards, with example requests and responses.

---

**Cursor**

I'll analyze the financial management application and create OpenAPI 3.0 specifications for the three most critical API endpoints based on the product description and data model.

```yaml
openapi: 3.0.3
info:
  title: Couple's Financial Management API
  description: |
    A self-hosted financial management system for couples, supporting multi-currency transactions,
    automated 50/30/20 budgeting, and privacy-respecting shared/personal account management.
  version: 1.0.0
  contact:
    name: API Support
    email: support@couplefi.local
servers:
  - url: https://api.couplefi.local/v1
    description: Production server (self-hosted)
security:
  - bearerAuth: []
tags:
  - name: transactions
    description: Transaction management operations
  - name: accounts
    description: Account balance and transaction history
  - name: budgets
    description: Budget tracking and envelope management

paths:
  /transactions:
    post:
      tags:
        - transactions
      summary: Create a new transaction
      description: |
        Records a new financial transaction with multi-currency support. Automatically converts
        to user's base currency and enforces 50/30/20 categorization rules. For transfers between
        accounts, creates linked transactions automatically.
      operationId: createTransaction
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTransactionRequest'
            examples:
              expense:
                summary: Grocery expense from shared account
                value:
                  account_id: 42
                  amount: -125.50
                  transaction_date: "2024-01-15"
                  description: "Whole Foods - Weekly groceries"
                  category_id: 15
                  transaction_type: "expense"
              transfer:
                summary: Transfer between accounts
                value:
                  account_id: 10
                  amount: -500.00
                  transaction_date: "2024-01-15"
                  description: "Transfer to savings"
                  transaction_type: "transfer"
                  target_account_id: 25
      responses:
        '201':
          description: Transaction created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransactionResponse'
              example:
                data:
                  id: 1234
                  account_id: 42
                  amount: -125.50
                  base_amount: -135.75
                  transaction_date: "2024-01-15"
                  description: "Whole Foods - Weekly groceries"
                  category:
                    id: 15
                    name: "Groceries"
                    budget_type: "needs"
                    parent:
                      id: 1
                      name: "Needs"
                  transaction_type: "expense"
                  currency:
                    code: "EUR"
                    symbol: "€"
                  base_currency:
                    code: "USD"
                    symbol: "$"
                  exchange_rate: 1.08
                  created_by:
                    id: 1
                    name: "Alice Johnson"
                  created_at: "2024-01-15T14:30:00Z"
                  updated_at: "2024-01-15T14:30:00Z"
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '422':
          $ref: '#/components/responses/UnprocessableEntity'

  /accounts/{accountId}/balance:
    get:
      tags:
        - accounts
      summary: Get account balance with recent transactions
      description: |
        Retrieves current balance and transaction history for an account. Includes multi-currency
        conversion to user's base currency. Respects partner permissions - returns 403 for
        unauthorized access to partner's personal accounts.
      operationId: getAccountBalance
      parameters:
        - name: accountId
          in: path
          required: true
          description: The account ID to retrieve balance for
          schema:
            type: integer
            minimum: 1
          example: 42
        - name: page
          in: query
          description: Page number for transaction pagination
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          description: Number of transactions per page
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
          example: 20
        - name: start_date
          in: query
          description: Filter transactions from this date (inclusive)
          schema:
            type: string
            format: date
          example: "2024-01-01"
        - name: end_date
          in: query
          description: Filter transactions until this date (inclusive)
          schema:
            type: string
            format: date
          example: "2024-01-31"
        - name: category_id
          in: query
          description: Filter by category ID
          schema:
            type: integer
          example: 15
      responses:
        '200':
          description: Account balance retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AccountBalanceResponse'
              example:
                data:
                  account:
                    id: 42
                    name: "Joint Checking"
                    account_type: "checking"
                    ownership_type: "shared"
                    currency:
                      code: "EUR"
                      symbol: "€"
                    is_active: true
                  balance:
                    current_balance: 3456.78
                    current_balance_base_currency: 3733.32
                    currency:
                      code: "EUR"
                      symbol: "€"
                    base_currency:
                      code: "USD"
                      symbol: "$"
                    exchange_rate: 1.08
                    as_of: "2024-01-15T14:45:00Z"
                  transactions:
                    - id: 1234
                      amount: -125.50
                      base_amount: -135.75
                      transaction_date: "2024-01-15"
                      description: "Whole Foods - Weekly groceries"
                      category:
                        id: 15
                        name: "Groceries"
                        budget_type: "needs"
                      transaction_type: "expense"
                      created_at: "2024-01-15T14:30:00Z"
                    - id: 1233
                      amount: 2500.00
                      base_amount: 2700.00
                      transaction_date: "2024-01-10"
                      description: "Salary deposit"
                      category:
                        id: 50
                        name: "Salary"
                        budget_type: null
                      transaction_type: "income"
                      created_at: "2024-01-10T09:00:00Z"
                  pagination:
                    current_page: 1
                    per_page: 20
                    total_items: 156
                    total_pages: 8
                    has_next: true
                    has_previous: false
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

  /budgets/current/status:
    get:
      tags:
        - budgets
      summary: Get current budget status with 50/30/20 breakdown
      description: |
        Retrieves the active budget status showing spending against 50/30/20 allocations.
        Includes both individual and combined views for partners, with multi-currency
        consolidation in user's base currency.
      operationId: getCurrentBudgetStatus
      parameters:
        - name: view
          in: query
          description: View perspective for budget data
          schema:
            type: string
            enum: [combined, personal, partner]
            default: combined
          example: combined
        - name: include_transactions
          in: query
          description: Include recent transactions per envelope
          schema:
            type: boolean
            default: false
          example: true
      responses:
        '200':
          description: Budget status retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BudgetStatusResponse'
              example:
                data:
                  budget:
                    id: 10
                    name: "January 2024 Budget"
                    period_type: "monthly"
                    start_date: "2024-01-01"
                    end_date: "2024-01-31"
                    days_remaining: 16
                  overview:
                    total_income: 5000.00
                    total_allocated: 5000.00
                    total_spent: 1876.50
                    total_remaining: 3123.50
                    base_currency:
                      code: "USD"
                      symbol: "$"
                  categories:
                    needs:
                      allocated_amount: 2500.00
                      allocated_percentage: 50
                      spent_amount: 1125.75
                      spent_percentage: 45.03
                      remaining_amount: 1374.25
                      progress_percentage: 45.03
                      envelopes:
                        - category:
                            id: 11
                            name: "Housing"
                          allocated: 1200.00
                          spent: 800.00
                          remaining: 400.00
                          transactions_count: 1
                        - category:
                            id: 15
                            name: "Groceries"
                          allocated: 600.00
                          spent: 325.75
                          remaining: 274.25
                          transactions_count: 8
                    wants:
                      allocated_amount: 1500.00
                      allocated_percentage: 30
                      spent_amount: 450.75
                      spent_percentage: 30.05
                      remaining_amount: 1049.25
                      progress_percentage: 30.05
                      envelopes:
                        - category:
                            id: 21
                            name: "Entertainment"
                          allocated: 300.00
                          spent: 125.50
                          remaining: 174.50
                          transactions_count: 3
                        - category:
                            id: 25
                            name: "Dining Out"
                          allocated: 400.00
                          spent: 325.25
                          remaining: 74.75
                          transactions_count: 12
                    savings:
                      allocated_amount: 1000.00
                      allocated_percentage: 20
                      spent_amount: 300.00
                      spent_percentage: 30.00
                      remaining_amount: 700.00
                      progress_percentage: 30.00
                      envelopes:
                        - category:
                            id: 31
                            name: "Emergency Fund"
                          allocated: 500.00
                          spent: 0.00
                          remaining: 500.00
                          transactions_count: 0
                        - category:
                            id: 35
                            name: "Investment"
                          allocated: 500.00
                          spent: 300.00
                          remaining: 200.00
                          transactions_count: 1
                  user_breakdown:
                    user1:
                      name: "Alice Johnson"
                      total_spent: 1050.25
                      needs_spent: 625.50
                      wants_spent: 275.25
                      savings_spent: 150.00
                    user2:
                      name: "Bob Johnson"
                      total_spent: 826.25
                      needs_spent: 500.25
                      wants_spent: 175.50
                      savings_spent: 150.00
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          description: No active budget found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: "BUDGET_NOT_FOUND"
                  message: "No active budget found for the current period"

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from authentication endpoint

  schemas:
    CreateTransactionRequest:
      type: object
      required:
        - account_id
        - amount
        - transaction_date
        - description
        - transaction_type
      properties:
        account_id:
          type: integer
          description: ID of the account for this transaction
          minimum: 1
        amount:
          type: number
          format: decimal
          description: |
            Transaction amount in account currency. Negative for expenses,
            positive for income, negative for transfer out
        transaction_date:
          type: string
          format: date
          description: Date when the transaction occurred
        description:
          type: string
          minLength: 1
          maxLength: 500
          description: Transaction description
        category_id:
          type: integer
          description: Category ID (required for income/expense, not for transfers)
          minimum: 1
        transaction_type:
          type: string
          enum: [income, expense, transfer]
          description: Type of transaction
        target_account_id:
          type: integer
          description: Target account ID (required only for transfers)
          minimum: 1

    TransactionResponse:
      type: object
      properties:
        data:
          $ref: '#/components/schemas/Transaction'

    Transaction:
      type: object
      properties:
        id:
          type: integer
        account_id:
          type: integer
        amount:
          type: number
          format: decimal
        base_amount:
          type: number
          format: decimal
          description: Amount converted to user's base currency
        transaction_date:
          type: string
          format: date
        description:
          type: string
        category:
          $ref: '#/components/schemas/Category'
        transaction_type:
          type: string
          enum: [income, expense, transfer]
        currency:
          $ref: '#/components/schemas/Currency'
        base_currency:
          $ref: '#/components/schemas/Currency'
        exchange_rate:
          type: number
          format: decimal
        linked_transaction_id:
          type: integer
          nullable: true
        created_by:
          $ref: '#/components/schemas/UserSummary'
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    AccountBalanceResponse:
      type: object
      properties:
        data:
          type: object
          properties:
            account:
              $ref: '#/components/schemas/Account'
            balance:
              $ref: '#/components/schemas/Balance'
            transactions:
              type: array
              items:
                $ref: '#/components/schemas/TransactionSummary'
            pagination:
              $ref: '#/components/schemas/Pagination'

    BudgetStatusResponse:
      type: object
      properties:
        data:
          type: object
          properties:
            budget:
              $ref: '#/components/schemas/BudgetSummary'
            overview:
              $ref: '#/components/schemas/BudgetOverview'
            categories:
              $ref: '#/components/schemas/BudgetCategories'
            user_breakdown:
              type: object
              additionalProperties:
                $ref: '#/components/schemas/UserBudgetBreakdown'

    Account:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        account_type:
          type: string
          enum: [checking, savings, credit_card, investment]
        ownership_type:
          type: string
          enum: [personal_user1, personal_user2, shared]
        currency:
          $ref: '#/components/schemas/Currency'
        is_active:
          type: boolean

    Balance:
      type: object
      properties:
        current_balance:
          type: number
          format: decimal
        current_balance_base_currency:
          type: number
          format: decimal
        currency:
          $ref: '#/components/schemas/Currency'
        base_currency:
          $ref: '#/components/schemas/Currency'
        exchange_rate:
          type: number
          format: decimal
        as_of:
          type: string
          format: date-time

    TransactionSummary:
      type: object
      properties:
        id:
          type: integer
        amount:
          type: number
          format: decimal
        base_amount:
          type: number
          format: decimal
        transaction_date:
          type: string
          format: date
        description:
          type: string
        category:
          $ref: '#/components/schemas/CategorySummary'
        transaction_type:
          type: string
          enum: [income, expense, transfer]
        created_at:
          type: string
          format: date-time

    BudgetSummary:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        period_type:
          type: string
          enum: [monthly, annual, custom]
        start_date:
          type: string
          format: date
        end_date:
          type: string
          format: date
        days_remaining:
          type: integer

    BudgetOverview:
      type: object
      properties:
        total_income:
          type: number
          format: decimal
        total_allocated:
          type: number
          format: decimal
        total_spent:
          type: number
          format: decimal
        total_remaining:
          type: number
          format: decimal
        base_currency:
          $ref: '#/components/schemas/Currency'

    BudgetCategories:
      type: object
      properties:
        needs:
          $ref: '#/components/schemas/BudgetCategoryDetail'
        wants:
          $ref: '#/components/schemas/BudgetCategoryDetail'
        savings:
          $ref: '#/components/schemas/BudgetCategoryDetail'

    BudgetCategoryDetail:
      type: object
      properties:
        allocated_amount:
          type: number
          format: decimal
        allocated_percentage:
          type: number
        spent_amount:
          type: number
          format: decimal
        spent_percentage:
          type: number
        remaining_amount:
          type: number
          format: decimal
        progress_percentage:
          type: number
        envelopes:
          type: array
          items:
            $ref: '#/components/schemas/EnvelopeStatus'

    EnvelopeStatus:
      type: object
      properties:
        category:
          $ref: '#/components/schemas/CategorySummary'
        allocated:
          type: number
          format: decimal
        spent:
          type: number
          format: decimal
        remaining:
          type: number
          format: decimal
        transactions_count:
          type: integer

    UserBudgetBreakdown:
      type: object
      properties:
        name:
          type: string
        total_spent:
          type: number
          format: decimal
        needs_spent:
          type: number
          format: decimal
        wants_spent:
          type: number
          format: decimal
        savings_spent:
          type: number
          format: decimal

    Category:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        budget_type:
          type: string
          enum: [needs, wants, savings]
          nullable: true
        parent:
          $ref: '#/components/schemas/CategorySummary'
          nullable: true

    CategorySummary:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        budget_type:
          type: string
          enum: [needs, wants, savings]
          nullable: true

    Currency:
      type: object
      properties:
        code:
          type: string
          pattern: '^[A-Z]{3}$'
        symbol:
          type: string

    UserSummary:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string

    Pagination:
      type: object
      properties:
        current_page:
          type: integer
        per_page:
          type: integer
        total_items:
          type: integer
        total_pages:
          type: integer
        has_next:
          type: boolean
        has_previous:
          type: boolean

    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
              additionalProperties: true

  responses:
    BadRequest:
      description: Bad request - Invalid input data
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "INVALID_REQUEST"
              message: "The request body is invalid"
              details:
                amount: "Amount must be negative for expenses"

    Unauthorized:
      description: Unauthorized - Invalid or missing authentication
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "UNAUTHORIZED"
              message: "Invalid or expired authentication token"

    Forbidden:
      description: Forbidden - No permission to access resource
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "FORBIDDEN"
              message: "You don't have permission to access this partner's personal account"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "NOT_FOUND"
              message: "Account with ID 42 not found"

    UnprocessableEntity:
      description: Unprocessable entity - Business logic validation failed
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "VALIDATION_FAILED"
              message: "Category is required for expense transactions"
              details:
                category_id: "This field is required for expense type"
```

```markdown
# API Examples - Couple's Financial Management System

## 1. Create Transaction Endpoint

### Endpoint: `POST /transactions`

This endpoint handles the creation of financial transactions with multi-currency support and automatic 50/30/20 categorization.

### Example 1: Creating an Expense Transaction

**Request:**
```http
POST /v1/transactions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "account_id": 42,
  "amount": -125.50,
  "transaction_date": "2024-01-15",
  "description": "Whole Foods - Weekly groceries",
  "category_id": 15,
  "transaction_type": "expense"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": 1234,
    "account_id": 42,
    "amount": -125.50,
    "base_amount": -135.75,
    "transaction_date": "2024-01-15",
    "description": "Whole Foods - Weekly groceries",
    "category": {
      "id": 15,
      "name": "Groceries",
      "budget_type": "needs",
      "parent": {
        "id": 1,
        "name": "Needs"
      }
    },
    "transaction_type": "expense",
    "currency": {
      "code": "EUR",
      "symbol": "€"
    },
    "base_currency": {
      "code": "USD",
      "symbol": "$"
    },
    "exchange_rate": 1.08,
    "created_by": {
      "id": 1,
      "name": "Alice Johnson"
    },
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

### Example 2: Creating a Transfer Between Accounts

**Request:**
```http
POST /v1/transactions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "account_id": 10,
  "amount": -500.00,
  "transaction_date": "2024-01-15",
  "description": "Monthly savings transfer",
  "transaction_type": "transfer",
  "target_account_id": 25
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": 1235,
    "account_id": 10,
    "amount": -500.00,
    "base_amount": -500.00,
    "transaction_date": "2024-01-15",
    "description": "Monthly savings transfer",
    "category": null,
    "transaction_type": "transfer",
    "currency": {
      "code": "USD",
      "symbol": "$"
    },
    "base_currency": {
      "code": "USD",
      "symbol": "$"
    },
    "exchange_rate": 1.0,
    "linked_transaction_id": 1236,
    "created_by": {
      "id": 2,
      "name": "Bob Johnson"
    },
    "created_at": "2024-01-15T15:00:00Z",
    "updated_at": "2024-01-15T15:00:00Z"
  }
}
```

### Example 3: Error - Accessing Partner's Personal Account Without Permission

**Request:**
```http
POST /v1/transactions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "account_id": 55,
  "amount": -50.00,
  "transaction_date": "2024-01-15",
  "description": "Coffee shop",
  "category_id": 25,
  "transaction_type": "expense"
}
```

**Response (403 Forbidden):**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to create transactions in this partner's personal account",
    "details": {
      "account_id": 55,
      "ownership_type": "personal_user2",
      "required_permission": "edit"
    }
  }
}
```

## 2. Get Account Balance Endpoint

### Endpoint: `GET /accounts/{accountId}/balance`

This endpoint retrieves the current balance and recent transactions for an account with multi-currency support.

### Example 1: Get Shared Account Balance with Transactions

**Request:**
```http
GET /v1/accounts/42/balance?page=1&limit=5&start_date=2024-01-01
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "data": {
    "account": {
      "id": 42,
      "name": "Joint Checking",
      "account_type": "checking",
      "ownership_type": "shared",
      "currency": {
        "code": "EUR",
        "symbol": "€"
      },
      "is_active": true
    },
    "balance": {
      "current_balance": 3456.78,
      "current_balance_base_currency": 3733.32,
      "currency": {
        "code": "EUR",
        "symbol": "€"
      },
      "base_currency": {
        "code": "USD",
        "symbol": "$"
      },
      "exchange_rate": 1.08,
      "as_of": "2024-01-15T14:45:00Z"
    },
    "transactions": [
      {
        "id": 1234,
        "amount": -125.50,
        "base_amount": -135.75,
        "transaction_date": "2024-01-15",
        "description": "Whole Foods - Weekly groceries",
        "category": {
          "id": 15,
          "name": "Groceries",
          "budget_type": "needs"
        },
        "transaction_type": "expense",
        "created_at": "2024-01-15T14:30:00Z"
      },
      {
        "id": 1233,
        "amount": -89.99,
        "base_amount": -97.19,
        "transaction_date": "2024-01-14",
        "description": "Netflix subscription",
        "category": {
          "id": 22,
          "name": "Subscriptions",
          "budget_type": "wants"
        },
        "transaction_type": "expense",
        "created_at": "2024-01-14T10:00:00Z"
      },
      {
        "id": 1232,
        "amount": -45.00,
        "base_amount": -48.60,
        "transaction_date": "2024-01-13",
        "description": "Gas station",
        "category": {
          "id": 16,
          "name": "Transportation",
          "budget_type": "needs"
        },
        "transaction_type": "expense",
        "created_at": "2024-01-13T18:30:00Z"
      },
      {
        "id": 1231,
        "amount": 2500.00,
        "base_amount": 2700.00,
        "transaction_date": "2024-01-10",
        "description": "Alice salary deposit",
        "category": {
          "id": 50,
          "name": "Salary",
          "budget_type": null
        },
        "transaction_type": "income",
        "created_at": "2024-01-10T09:00:00Z"
      },
      {
        "id": 1230,
        "amount": -1200.00,
        "base_amount": -1296.00,
        "transaction_date": "2024-01-05",
        "description": "Rent payment",
        "category": {
          "id": 11,
          "name": "Housing",
          "budget_type": "needs"
        },
        "transaction_type": "expense",
        "created_at": "2024-01-05T12:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 5,
      "total_items": 156,
      "total_pages": 32,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

### Example 2: Filter Transactions by Category

**Request:**
```http
GET /v1/accounts/42/balance?category_id=15&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "data": {
    "account": {
      "id": 42,
      "name": "Joint Checking",
      "account_type": "checking",
      "ownership_type": "shared",
      "currency": {
        "code": "EUR",
        "symbol": "€"
      },
      "is_active": true
    },
    "balance": {
      "current_balance": 3456.78,
      "current_balance_base_currency": 3733.32,
      "currency": {
        "code": "EUR",
        "symbol": "€"
      },
      "base_currency": {
        "code": "USD",
        "symbol": "$"
      },
      "exchange_rate": 1.08,
      "as_of": "2024-01-15T14:45:00Z"
    },
    "transactions": [
      {
        "id": 1234,
        "amount": -125.50,
        "base_amount": -135.75,
        "transaction_date": "2024-01-15",
        "description": "Whole Foods - Weekly groceries",
        "category": {
          "id": 15,
          "name": "Groceries",
          "budget_type": "needs"
        },
        "transaction_type": "expense",
        "created_at": "2024-01-15T14:30:00Z"
      },
      {
        "id": 1220,
        "amount": -78.25,
        "base_amount": -84.51,
        "transaction_date": "2024-01-08",
        "description": "Trader Joe's",
        "category": {
          "id": 15,
          "name": "Groceries",
          "budget_type": "needs"
        },
        "transaction_type": "expense",
        "created_at": "2024-01-08T16:45:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 2,
      "total_pages": 1,
      "has_next": false,
      "has_previous": false
    }
  }
}
```

### Example 3: Error - Unauthorized Access to Partner's Personal Account

**Request:**
```http
GET /v1/accounts/55/balance
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (403 Forbidden):**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to view this partner's personal account",
    "details": {
      "account_id": 55,
      "ownership_type": "personal_user2",
      "required_permission": "view"
    }
  }
}
```

## 3. Get Current Budget Status Endpoint

### Endpoint: `GET /budgets/current/status`

This endpoint provides a comprehensive view of the current budget with 50/30/20 breakdown and spending analysis.

### Example 1: Get Combined Budget Status

**Request:**
```http
GET /v1/budgets/current/status?view=combined
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "data": {
    "budget": {
      "id": 10,
      "name": "January 2024 Budget",
      "period_type": "monthly",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "days_remaining": 16
    },
    "overview": {
      "total_income": 5000.00,
      "total_allocated": 5000.00,
      "total_spent": 1876.50,
      "total_remaining": 3123.50,
      "base_currency": {
        "code": "USD",
        "symbol": "$"
      }
    },
    "categories": {
      "needs": {
        "allocated_amount": 2500.00,
        "allocated_percentage": 50,
        "spent_amount": 1125.75,
        "spent_percentage": 45.03,
        "remaining_amount": 1374.25,
        "progress_percentage": 45.03,
        "envelopes": [
          {
            "category": {
              "id": 11,
              "name": "Housing",
              "budget_type": "needs"
            },
            "allocated": 1200.00,
            "spent": 800.00,
            "remaining": 400.00,
            "transactions_count": 1
          },
          {
            "category": {
              "id": 15,
              "name": "Groceries",
              "budget_type": "needs"
            },
            "allocated": 600.00,
            "spent": 325.75,
            "remaining": 274.25,
            "transactions_count": 8
          },
          {
            "category": {
              "id": 16,
              "name": "Transportation",
              "budget_type": "needs"
            },
            "allocated": 400.00,
            "spent": 0.00,
            "remaining": 400.00,
            "transactions_count": 0
          },
          {
            "category": {
              "id": 17,
              "name": "Utilities",
              "budget_type": "needs"
            },
            "allocated": 300.00,
            "spent": 0.00,
            "remaining": 300.00,
            "transactions_count": 0
          }
        ]
      },
      "wants": {
        "allocated_amount": 1500.00,
        "allocated_percentage": 30,
        "spent_amount": 450.75,
        "spent_percentage": 30.05,
        "remaining_amount": 1049.25,
        "progress_percentage": 30.05,
        "envelopes": [
          {
            "category": {
              "id": 21,
              "name": "Entertainment",
              "budget_type": "wants"
            },
            "allocated": 300.00,
            "spent": 125.50,
            "remaining": 174.50,
            "transactions_count": 3
          },
          {
            "category": {
              "id": 25,
              "name": "Dining Out",
              "budget_type": "wants"
            },
            "allocated": 400.00,
            "spent": 325.25,
            "remaining": 74.75,
            "transactions_count": 12
          },
          {
            "category": {
              "id": 22,
              "name": "Subscriptions",
              "budget_type": "wants"
            },
            "allocated": 150.00,
            "spent": 0.00,
            "remaining": 150.00,
            "transactions_count": 0
          },
          {
            "category": {
              "id": 26,
              "name": "Shopping",
              "budget_type": "wants"
            },
            "allocated": 650.00,
            "spent": 0.00,
            "remaining": 650.00,
            "transactions_count": 0
          }
        ]
      },
      "savings": {
        "allocated_amount": 1000.00,
        "allocated_percentage": 20,
        "spent_amount": 300.00,
        "spent_percentage": 30.00,
        "remaining_amount": 700.00,
        "progress_percentage": 30.00,
        "envelopes": [
          {
            "category": {
              "id": 31,
              "name": "Emergency Fund",
              "budget_type": "savings"
            },
            "allocated": 500.00,
            "spent": 0.00,
            "remaining": 500.00,
            "transactions_count": 0
          },
          {
            "category": {
              "id": 35,
              "name": "Investment",
              "budget_type": "savings"
            },
            "allocated": 500.00,
            "spent": 300.00,
            "remaining": 200.00,
            "transactions_count": 1
          }
        ]
      }
    },
    "user_breakdown": {
      "user1": {
        "name": "Alice Johnson",
        "total_spent": 1050.25,
        "needs_spent": 625.50,
        "wants_spent": 275.25,
        "savings_spent": 150.00
      },
      "user2": {
        "name": "Bob Johnson",
        "total_spent": 826.25,
        "needs_spent": 500.25,
        "wants_spent": 175.50,
        "savings_spent": 150.00
      }
    }
  }
}
```

### Example 2: Get Personal Budget View

**Request:**
```http
GET /v1/budgets/current/status?view=personal
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "data": {
    "budget": {
      "id": 10,
      "name": "January 2024 Budget",
      "period_type": "monthly",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "days_remaining": 16
    },
    "overview": {
      "total_income": 2500.00,
      "total_allocated": 2500.00,
      "total_spent": 1050.25,
      "total_remaining": 1449.75,
      "base_currency": {
        "code": "USD",
        "symbol": "$"
      }
    },
    "categories": {
      "needs": {
        "allocated_amount": 1250.00,
        "allocated_percentage": 50,
        "spent_amount": 625.50,
        "spent_percentage": 50.04,
        "remaining_amount": 624.50,
        "progress_percentage": 50.04,
        "envelopes": [
          {
            "category": {
              "id": 11,
              "name": "Housing",
              "budget_type": "needs"
            },
            "allocated": 600.00,
            "spent": 400.00,
            "remaining": 200.00,
            "transactions_count": 1
          },
          {
            "category": {
              "id": 15,
              "name": "Groceries",
              "budget_type": "needs"
            },
            "allocated": 300.00,
            "spent": 225.50,
            "remaining": 74.50,
            "transactions_count": 5
          }
        ]
      },
      "wants": {
        "allocated_amount": 750.00,
        "allocated_percentage": 30,
        "spent_amount": 275.25,
        "spent_percentage": 36.70,
        "remaining_amount": 474.75,
        "progress_percentage": 36.70,
        "envelopes": [
          {
            "category": {
              "id": 21,
              "name": "Entertainment",
              "budget_type": "wants"
            },
            "allocated": 150.00,
            "spent": 75.25,
            "remaining": 74.75,
            "transactions_count": 2
          },
          {
            "category": {
              "id": 25,
              "name": "Dining Out",
              "budget_type": "wants"
            },
            "allocated": 200.00,
            "spent": 200.00,
            "remaining": 0.00,
            "transactions_count": 8
          }
        ]
      },
      "savings": {
        "allocated_amount": 500.00,
        "allocated_percentage": 20,
        "spent_amount": 150.00,
        "spent_percentage": 30.00,
        "remaining_amount": 350.00,
        "progress_percentage": 30.00,
        "envelopes": [
          {
            "category": {
              "id": 31,
              "name": "Emergency Fund",
              "budget_type": "savings"
            },
            "allocated": 250.00,
            "spent": 0.00,
            "remaining": 250.00,
            "transactions_count": 0
          },
          {
            "category": {
              "id": 35,
              "name": "Investment",
              "budget_type": "savings"
            },
            "allocated": 250.00,
            "spent": 150.00,
            "remaining": 100.00,
            "transactions_count": 1
          }
        ]
      }
    }
  }
}
```

### Example 3: No Active Budget Found

**Request:**
```http
GET /v1/budgets/current/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (404 Not Found):**
```json
{
  "error": {
    "code": "BUDGET_NOT_FOUND",
    "message": "No active budget found for the current period",
    "details": {
      "current_date": "2024-01-15",
      "suggestion": "Create a new budget for the current period"
    }
  }
}
```

## Authentication

All API endpoints require JWT Bearer token authentication. The token should be included in the Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Token Payload Example:
```json
{
  "sub": "1",
  "email": "alice@example.com",
  "name": "Alice Johnson",
  "base_currency_id": 1,
  "exp": 1705339200,
  "iat": 1705332000
}
```

## Common Error Responses

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token"
  }
}
```

### 422 Unprocessable Entity
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The provided data failed business logic validation",
    "details": {
      "field": "specific validation error message"
    }
  }
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "request_id": "req_1234567890"
  }
}
```
```

```markdown
# API Design Summary - Couple's Financial Management System

## Overview

This document outlines the design decisions and key features of the three most critical API endpoints for the couple's financial management application.

## Selected Endpoints

### 1. **POST /transactions** - Create Transaction
**Rationale:** Core functionality for recording all financial activity. This is the most frequently used endpoint as every financial interaction flows through it.

### 2. **GET /accounts/{accountId}/balance** - Get Account Balance
**Rationale:** Essential for displaying current financial status. Users need to frequently check balances and recent transactions to make informed decisions.

### 3. **GET /budgets/current/status** - Get Budget Status
**Rationale:** Critical for the 50/30/20 rule enforcement, which is a key differentiator of the application. Provides comprehensive budget tracking and analysis.

## Key Design Decisions

### 1. Multi-Currency Architecture

Every monetary response includes both account currency and base currency representations:

```yaml
amount: -125.50          # Transaction in EUR
base_amount: -135.75     # Converted to user's USD base currency
exchange_rate: 1.08      # Applied exchange rate
```

**Benefits:**
- Users can see exact transaction amounts as they appear on statements
- Automatic conversion enables unified budgeting across currencies
- Historical exchange rates ensure accurate reporting

### 2. Permission-Based Access Control

The API enforces strict permissions for partner's personal accounts:

```yaml
# Attempting to access partner's personal account
GET /accounts/55/balance
# Returns 403 Forbidden with detailed error
```

**Implementation:**
- Shared accounts: Both partners have full access
- Personal accounts: Require explicit permissions
- Audit trail: All access attempts are logged

### 3. 50/30/20 Budget Automation

Budget endpoints automatically categorize and track spending:

```yaml
categories:
  needs:
    allocated_percentage: 50
    spent_percentage: 45.03
  wants:
    allocated_percentage: 30
    spent_percentage: 30.05
  savings:
    allocated_percentage: 20
    spent_percentage: 30.00
```

**Features:**
- Automatic allocation based on income
- Real-time progress tracking
- Envelope-based sub-categories
- Partner breakdown for transparency

### 4. Comprehensive Error Handling

All endpoints provide detailed, actionable error responses:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Category is required for expense transactions",
    "details": {
      "category_id": "This field is required for expense type"
    }
  }
}
```

**Error Categories:**
- 400: Malformed requests
- 401: Authentication failures
- 403: Permission violations
- 422: Business logic violations
- 404: Resource not found

### 5. Transaction Integrity

Transfer operations maintain referential integrity:

```yaml
# Single API call creates two linked transactions
POST /transactions
{
  "transaction_type": "transfer",
  "target_account_id": 25
}
# Creates both debit and credit entries atomically
```

### 6. Pagination and Filtering

List endpoints support flexible data retrieval:

```yaml
parameters:
  - page: 1
  - limit: 20
  - start_date: "2024-01-01"
  - end_date: "2024-01-31"
  - category_id: 15
```

**Benefits:**
- Efficient data loading
- Reduced bandwidth usage
- Customizable views

## Security Considerations

### Authentication
- JWT Bearer tokens for all endpoints
- Token includes user context (ID, base currency)
- Short-lived tokens with refresh mechanism

### Data Privacy
- Partner permissions checked on every request
- Personal account isolation
- Audit logging for compliance

### Self-Hosting Benefits
- Data remains on user's NAS
- No third-party data exposure
- Complete control over security policies

## Performance Optimizations

### Response Efficiency
- Calculated fields (base_amount) stored, not computed on-the-fly
- Pagination limits to prevent large responses
- Selective field inclusion based on query parameters

### Caching Strategies
- Exchange rates cached daily
- Budget calculations cached and invalidated on transaction changes
- Account balances use materialized views

## Future Extensibility

The API design supports future enhancements:

1. **Recurring Transactions**: Add recurrence patterns to transaction creation
2. **Budget Templates**: Save and reuse budget configurations
3. **Advanced Analytics**: Additional endpoints for spending trends
4. **Mobile Optimization**: Lightweight endpoints for mobile apps
5. **Webhook Support**: Real-time notifications for transactions

## Best Practices Implemented

1. **RESTful Design**: Proper use of HTTP verbs and status codes
2. **Consistent Naming**: Snake_case for JSON fields
3. **ISO Standards**: Dates (ISO 8601) and currency codes (ISO 4217)
4. **Versioning**: API version in URL path (/v1/)
5. **Documentation**: OpenAPI 3.0 specification with examples
6. **Idempotency**: Support for idempotent operations where applicable
```

```markdown
# Couple's Financial Management API Documentation

This directory contains the OpenAPI 3.0 specifications and documentation for the three most critical API endpoints of the couple's financial management system.

## Files

1. **`api-specifications.yaml`** - Complete OpenAPI 3.0 specification
   - Formal API definition following OpenAPI standards
   - Can be imported into tools like Swagger UI or Postman
   - Includes all schemas, parameters, and responses

2. **`api-examples.md`** - Detailed request/response examples
   - Real-world usage scenarios for each endpoint
   - Success and error response examples
   - Multi-currency and permission scenarios

3. **`api-design-summary.md`** - Design decisions and architecture
   - Rationale for endpoint selection
   - Key architectural decisions
   - Security and performance considerations

## Critical Endpoints

### 1. Create Transaction
- **POST** `/v1/transactions`
- Records financial transactions with multi-currency support
- Enforces 50/30/20 categorization
- Handles transfers between accounts

### 2. Get Account Balance
- **GET** `/v1/accounts/{accountId}/balance`
- Retrieves current balance and transaction history
- Supports pagination and filtering
- Enforces partner permission boundaries

### 3. Get Budget Status
- **GET** `/v1/budgets/current/status`
- Provides 50/30/20 budget breakdown
- Shows spending progress by category
- Includes partner spending analysis

## Key Features

- 🌍 **Multi-Currency Support**: All amounts shown in both account and base currencies
- 🔒 **Privacy-First**: Partner permissions enforced on personal accounts
- 📊 **50/30/20 Automation**: Automatic budget allocation and tracking
- 🏠 **Self-Hosted**: Designed for NAS deployment
- 📝 **Audit Trail**: Comprehensive logging of all operations

## Usage

### Viewing the API Documentation

1. **Swagger UI**: Import `api-specifications.yaml` into [Swagger Editor](https://editor.swagger.io/)
2. **Postman**: Import the YAML file to generate a Postman collection
3. **ReDoc**: Use ReDoc for a clean, readable API documentation

### Authentication

All endpoints require JWT Bearer authentication:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Base URL

```
https://api.couplefi.local/v1
```

## Quick Start Example

```bash
# Create a transaction
curl -X POST https://api.couplefi.local/v1/transactions \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": 42,
    "amount": -125.50,
    "transaction_date": "2024-01-15",
    "description": "Grocery shopping",
    "category_id": 15,
    "transaction_type": "expense"
  }'
```

## Development Notes

- All monetary values use DECIMAL type for precision
- Dates follow ISO 8601 format (YYYY-MM-DD)
- Currency codes follow ISO 4217 standard
- Response times should be < 200ms for optimal UX
- Batch operations planned for v2 API
```

## Summary

I've successfully generated comprehensive OpenAPI 3.0 specifications for the three most critical API endpoints of your couple's financial management system:

### Created Files:

1. **`api-specifications.yaml`** - Complete OpenAPI 3.0 specification with:
   - Full endpoint definitions for transaction creation, account balance retrieval, and budget status
   - Detailed request/response schemas
   - Multi-currency support in all monetary responses
   - Permission-based access control
   - Comprehensive error handling
   - JWT Bearer authentication

2. **`api-examples.md`** - Real-world examples showing:
   - Multiple scenarios for each endpoint
   - Success responses with realistic data
   - Error responses for unauthorized access
   - Multi-currency conversions
   - Partner permission enforcement

3. **`api-design-summary.md`** - Design documentation covering:
   - Rationale for endpoint selection
   - Key architectural decisions
   - Security and privacy considerations
   - Performance optimizations
   - Future extensibility

4. **`API-README.md`** - Quick reference guide for using the API documentation

### Key Design Features:

✅ **Multi-Currency Architecture**: Every response includes both account currency and base currency amounts with exchange rates
✅ **50/30/20 Automation**: Budget endpoints automatically track and categorize spending according to the rule
✅ **Partner Privacy**: Strict permission enforcement prevents unauthorized access to personal accounts
✅ **Transaction Integrity**: Transfers create linked transactions atomically
✅ **Comprehensive Error Handling**: Detailed error responses with actionable information
✅ **Self-Hosted Security**: Designed for secure NAS deployment

The API design prioritizes the core user needs while maintaining data privacy, supporting multi-currency scenarios, and enforcing the 50/30/20 budgeting rule that's central to your application's value proposition.

