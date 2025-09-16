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
    "amount": -125.5,
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
    "amount": -500.0,
    "base_amount": -500.0,
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
        "amount": -125.5,
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
        "amount": -45.0,
        "base_amount": -48.6,
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
        "amount": 2500.0,
        "base_amount": 2700.0,
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
        "amount": -1200.0,
        "base_amount": -1296.0,
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
        "amount": -125.5,
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
      "total_income": 5000.0,
      "total_allocated": 5000.0,
      "total_spent": 1876.5,
      "total_remaining": 3123.5,
      "base_currency": {
        "code": "USD",
        "symbol": "$"
      }
    },
    "categories": {
      "needs": {
        "allocated_amount": 2500.0,
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
            "allocated": 1200.0,
            "spent": 800.0,
            "remaining": 400.0,
            "transactions_count": 1
          },
          {
            "category": {
              "id": 15,
              "name": "Groceries",
              "budget_type": "needs"
            },
            "allocated": 600.0,
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
            "allocated": 400.0,
            "spent": 0.0,
            "remaining": 400.0,
            "transactions_count": 0
          },
          {
            "category": {
              "id": 17,
              "name": "Utilities",
              "budget_type": "needs"
            },
            "allocated": 300.0,
            "spent": 0.0,
            "remaining": 300.0,
            "transactions_count": 0
          }
        ]
      },
      "wants": {
        "allocated_amount": 1500.0,
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
            "allocated": 300.0,
            "spent": 125.5,
            "remaining": 174.5,
            "transactions_count": 3
          },
          {
            "category": {
              "id": 25,
              "name": "Dining Out",
              "budget_type": "wants"
            },
            "allocated": 400.0,
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
            "allocated": 150.0,
            "spent": 0.0,
            "remaining": 150.0,
            "transactions_count": 0
          },
          {
            "category": {
              "id": 26,
              "name": "Shopping",
              "budget_type": "wants"
            },
            "allocated": 650.0,
            "spent": 0.0,
            "remaining": 650.0,
            "transactions_count": 0
          }
        ]
      },
      "savings": {
        "allocated_amount": 1000.0,
        "allocated_percentage": 20,
        "spent_amount": 300.0,
        "spent_percentage": 30.0,
        "remaining_amount": 700.0,
        "progress_percentage": 30.0,
        "envelopes": [
          {
            "category": {
              "id": 31,
              "name": "Emergency Fund",
              "budget_type": "savings"
            },
            "allocated": 500.0,
            "spent": 0.0,
            "remaining": 500.0,
            "transactions_count": 0
          },
          {
            "category": {
              "id": 35,
              "name": "Investment",
              "budget_type": "savings"
            },
            "allocated": 500.0,
            "spent": 300.0,
            "remaining": 200.0,
            "transactions_count": 1
          }
        ]
      }
    },
    "user_breakdown": {
      "user1": {
        "name": "Alice Johnson",
        "total_spent": 1050.25,
        "needs_spent": 625.5,
        "wants_spent": 275.25,
        "savings_spent": 150.0
      },
      "user2": {
        "name": "Bob Johnson",
        "total_spent": 826.25,
        "needs_spent": 500.25,
        "wants_spent": 175.5,
        "savings_spent": 150.0
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
      "total_income": 2500.0,
      "total_allocated": 2500.0,
      "total_spent": 1050.25,
      "total_remaining": 1449.75,
      "base_currency": {
        "code": "USD",
        "symbol": "$"
      }
    },
    "categories": {
      "needs": {
        "allocated_amount": 1250.0,
        "allocated_percentage": 50,
        "spent_amount": 625.5,
        "spent_percentage": 50.04,
        "remaining_amount": 624.5,
        "progress_percentage": 50.04,
        "envelopes": [
          {
            "category": {
              "id": 11,
              "name": "Housing",
              "budget_type": "needs"
            },
            "allocated": 600.0,
            "spent": 400.0,
            "remaining": 200.0,
            "transactions_count": 1
          },
          {
            "category": {
              "id": 15,
              "name": "Groceries",
              "budget_type": "needs"
            },
            "allocated": 300.0,
            "spent": 225.5,
            "remaining": 74.5,
            "transactions_count": 5
          }
        ]
      },
      "wants": {
        "allocated_amount": 750.0,
        "allocated_percentage": 30,
        "spent_amount": 275.25,
        "spent_percentage": 36.7,
        "remaining_amount": 474.75,
        "progress_percentage": 36.7,
        "envelopes": [
          {
            "category": {
              "id": 21,
              "name": "Entertainment",
              "budget_type": "wants"
            },
            "allocated": 150.0,
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
            "allocated": 200.0,
            "spent": 200.0,
            "remaining": 0.0,
            "transactions_count": 8
          }
        ]
      },
      "savings": {
        "allocated_amount": 500.0,
        "allocated_percentage": 20,
        "spent_amount": 150.0,
        "spent_percentage": 30.0,
        "remaining_amount": 350.0,
        "progress_percentage": 30.0,
        "envelopes": [
          {
            "category": {
              "id": 31,
              "name": "Emergency Fund",
              "budget_type": "savings"
            },
            "allocated": 250.0,
            "spent": 0.0,
            "remaining": 250.0,
            "transactions_count": 0
          },
          {
            "category": {
              "id": 35,
              "name": "Investment",
              "budget_type": "savings"
            },
            "allocated": 250.0,
            "spent": 150.0,
            "remaining": 100.0,
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
