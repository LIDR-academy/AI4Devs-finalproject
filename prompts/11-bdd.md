# Behavior Driven Development (BDD) Scenarios

## Personal Finance Management System

This document contains Gherkin scenarios for the user stories defined in the
Personal Finance Management System.

---

## Epic 1: User Module (Mock Implementation)

### User Story 1.1: Basic User Setup

**Scenario: Mock user is created with default profile**

```
Given the system is initialized
When the application starts
Then a mock user should be created with default profile
And the user should have basic settings (timezone, currency, language)
And the user profile should include financial preferences (hourly rate, income frequency)
And the system should use single mock user for all operations
```

**Scenario: User has basic settings configured**

```
Given a mock user exists in the system
When the user profile is accessed
Then the user should have timezone set to default
And the user should have currency set to default
And the user should have language set to default
```

**Scenario: User profile includes financial preferences**

```
Given a mock user exists in the system
When the user profile is viewed
Then the profile should display hourly rate
And the profile should display income frequency
And the profile should display employment status
```

### User Story 1.2: User Profile Management

**Scenario: View current profile information**

```
Given a mock user exists in the system
When the user requests their profile information
Then the system should return the user's personal details
And the system should return the user's financial preferences
And the system should return the user's basic settings
```

**Scenario: Edit personal details**

```
Given a mock user exists in the system
When the user updates their name
And the user updates their timezone
And the user updates their currency
Then the changes should be saved to the profile
And the updated information should be returned
```

**Scenario: Set financial preferences**

```
Given a mock user exists in the system
When the user sets their hourly rate
And the user sets their employment status
And the user sets their income frequency
Then the financial preferences should be saved
And the updated preferences should be returned
```

**Scenario: Validate input fields**

```
Given a mock user exists in the system
When the user enters invalid data for any field
Then the system should return validation errors
And the changes should not be saved
```

---

## Epic 2: Transaction Module (Core Functionality)

### User Story 2.1: Basic Transaction Creation

**Scenario: Create income transaction**

```
Given a mock user exists in the system
When the user creates a new transaction with positive amount
And the user sets transaction date and description
And the user chooses a predefined category
Then the income transaction should be created successfully
And the transaction should be stored in the database
```

**Scenario: Create expense transaction**

```
Given a mock user exists in the system
When the user creates a new transaction with negative amount
And the user sets transaction date and description
And the user chooses a predefined category
Then the expense transaction should be created successfully
And the transaction should be stored in the database
```

**Scenario: Validate transaction data**

```
Given a mock user exists in the system
When the user attempts to create a transaction with invalid data
Then the system should return validation errors
And the transaction should not be created
```

### User Story 2.2: Transaction Categories

**Scenario: View list of available categories**

```
Given categories exist in the system
When the user requests the list of categories
Then the system should return all available categories
And each category should have a name and color
```

**Scenario: Create custom category**

```
Given a mock user exists in the system
When the user creates a new custom category
And the user provides a name and color for the category
Then the custom category should be created successfully
And the category should be available for transaction assignment
```

**Scenario: Assign category to transaction**

```
Given a transaction exists in the system
And categories are available
When the user assigns a category to the transaction
Then the transaction should be updated with the selected category
```

**Scenario: Edit existing category**

```
Given a category exists in the system
When the user edits the category name or color
Then the category should be updated successfully
And all transactions using this category should reflect the changes
```

**Scenario: Delete unused category**

```
Given a category exists in the system
And no transactions are using this category
When the user deletes the category
Then the category should be removed from the system
```

### User Story 2.3: Transaction Frequency

**Scenario: Set one-time transaction**

```
Given a mock user exists in the system
When the user creates a transaction with one-time frequency
Then the transaction should be created as a single occurrence
And no recurring instances should be generated
```

**Scenario: Set recurring daily transaction**

```
Given a mock user exists in the system
When the user creates a transaction with daily frequency
And the user sets a start date
Then the system should generate recurring instances daily
And the next occurrences should be created automatically
```

**Scenario: Set recurring weekly transaction**

```
Given a mock user exists in the system
When the user creates a transaction with weekly frequency
And the user sets a start date
Then the system should generate recurring instances weekly
And the next occurrences should be created automatically
```

**Scenario: Set recurring monthly transaction**

```
Given a mock user exists in the system
When the user creates a transaction with monthly frequency
And the user sets a start date
Then the system should generate recurring instances monthly
And the next occurrences should be created automatically
```

**Scenario: Set recurring yearly transaction**

```
Given a mock user exists in the system
When the user creates a transaction with yearly frequency
And the user sets a start date
Then the system should generate recurring instances yearly
And the next occurrences should be created automatically
```

**Scenario: View upcoming recurring transactions**

```
Given recurring transactions exist in the system
When the user requests upcoming recurring transactions
Then the system should return all future recurring instances
And the transactions should be sorted by date
```

**Scenario: Edit recurring transaction**

```
Given a recurring transaction exists in the system
When the user edits the recurring transaction
Then the changes should be applied to all future instances
And past instances should remain unchanged
```

**Scenario: Cancel recurring transaction**

```
Given a recurring transaction exists in the system
When the user cancels the recurring transaction
Then no new instances should be generated
And existing future instances should be removed
```

### User Story 2.4: Transaction Composition

**Scenario: Create composed transaction with salary and bonus**

```
Given a mock user exists in the system
When the user creates a composed transaction with salary + bonus
Then the system should calculate the total amount
And the transaction should reference the component transactions
And the breakdown should be visible
```

**Scenario: Reference existing transactions in calculations**

```
Given existing transactions exist in the system
When the user creates a composed transaction referencing existing transactions
Then the system should use the referenced transaction amounts
And the calculation should be performed correctly
```

**Scenario: View breakdown of composed transactions**

```
Given a composed transaction exists in the system
When the user views the composed transaction details
Then the system should show the breakdown of components
And the total calculated amount should be displayed
```

**Scenario: Validate calculation expressions**

```
Given a mock user exists in the system
When the user enters an invalid calculation expression
Then the system should return validation errors
And the composed transaction should not be created
```

**Scenario: Calculate totals automatically**

```
Given a composed transaction exists in the system
When any component transaction amount changes
Then the total amount should be recalculated automatically
And the updated total should be reflected in the composed transaction
```

### User Story 2.5: Bank Account Integration

**Scenario: Create bank account**

```
Given a mock user exists in the system
When the user creates a new bank account
And the user provides name, type, and currency
Then the bank account should be created successfully
And the account should be available for transaction linking
```

**Scenario: Link transaction to specific account**

```
Given a transaction exists in the system
And a bank account exists in the system
When the user links the transaction to the bank account
Then the transaction should be associated with the account
And the account balance should be updated accordingly
```

**Scenario: View account balances**

```
Given bank accounts exist in the system
When the user requests account balances
Then the system should return current balance for each account
And the balances should reflect all linked transactions
```

**Scenario: Track account-specific transactions**

```
Given a bank account exists in the system
And transactions are linked to the account
When the user requests transactions for a specific account
Then the system should return only transactions linked to that account
And the transactions should be sorted by date
```

**Scenario: Support multiple account types**

```
Given a mock user exists in the system
When the user creates different account types (checking, savings, credit)
Then each account should be created with the correct type
And the system should support different features for each account type
```

---

## Epic 3: Basic Reporting

### User Story 3.1: Transaction Overview

**Scenario: View total income and expenses for a period**

```
Given transactions exist in the system
When the user requests transaction overview for a specific period
Then the system should return total income for the period
And the system should return total expenses for the period
And the system should calculate net income/expense
```

**Scenario: Filter transactions by date range**

```
Given transactions exist in the system
When the user filters transactions by date range
Then the system should return only transactions within the specified range
And the transactions should be sorted by date
```

**Scenario: Filter by transaction type**

```
Given transactions exist in the system
When the user filters by income transactions
Then the system should return only income transactions
When the user filters by expense transactions
Then the system should return only expense transactions
```

**Scenario: Sort transactions**

```
Given transactions exist in the system
When the user sorts transactions by date
Then the transactions should be ordered by date (newest first)
When the user sorts transactions by amount
Then the transactions should be ordered by amount (highest first)
When the user sorts transactions by category
Then the transactions should be grouped by category
```

### User Story 3.2: Category Analysis

**Scenario: View total spending per category**

```
Given transactions exist in the system
And transactions are categorized
When the user requests category analysis
Then the system should return total spending for each category
And the amounts should be calculated correctly
```

**Scenario: See percentage breakdown by category**

```
Given transactions exist in the system
And transactions are categorized
When the user requests category analysis
Then the system should return percentage breakdown for each category
And the percentages should total 100%
```

**Scenario: Filter category analysis by date range**

```
Given transactions exist in the system
And transactions are categorized
When the user filters category analysis by date range
Then the system should return category totals only for the specified period
And the percentages should be calculated based on the filtered data
```

**Scenario: Sort categories by amount**

```
Given transactions exist in the system
And transactions are categorized
When the user sorts categories by amount
Then the categories should be ordered by total amount (highest first)
And the user should be able to sort in ascending or descending order
```

**Scenario: View transaction count per category**

```
Given transactions exist in the system
And transactions are categorized
When the user requests category analysis
Then the system should return transaction count for each category
And the count should reflect the actual number of transactions
```

---

## Additional Scenarios

### Error Handling Scenarios

**Scenario: Handle invalid transaction data**

```
Given a mock user exists in the system
When the user attempts to create a transaction with invalid amount
Then the system should return a validation error
And the transaction should not be created
```

**Scenario: Handle circular reference in composed transactions**

```
Given existing transactions exist in the system
When the user creates a composed transaction with circular reference
Then the system should detect the circular reference
And the composed transaction should not be created
And an appropriate error message should be returned
```

**Scenario: Handle database connection issues**

```
Given the system is running
When the database connection fails
Then the system should return an appropriate error message
And the operation should not complete
```

### Performance Scenarios

**Scenario: Handle large number of transactions**

```
Given a large number of transactions exist in the system
When the user requests transaction overview
Then the response should be returned within 500ms
And the data should be accurate
```

**Scenario: Handle concurrent transaction creation**

```
Given multiple users are creating transactions simultaneously
When transactions are created concurrently
Then all transactions should be created successfully
And no data should be lost or corrupted
```

---

## Notes

- All scenarios assume a mock user approach until authentication is implemented
- Database operations should be atomic
- All scenarios should be covered by integration tests
- Error handling should be comprehensive and user-friendly
- Performance requirements: < 500ms response time for all operations
