# MVP Roadmap - Family Finance App

**Timeline**: 3.5 weeks (Due October 15th)  
**Scope**: Transaction tracking, multi-currency support, and basic budget automation for 2 users

## Epic 0: Development Environment & Project Scaffolding

**Priority**: Prerequisites (Already in progress)  
**MVP Scope**: Essential setup only - skip advanced CI/CD and comprehensive documentation

1. US0.1: Project Documentation and Planning ✓ (Completed - backlog created)
2. US0.2: Backend Development Environment Setup (In Progress)
3. US0.3: Frontend Development Environment Setup
4. US0.4: Database Setup and Migration System
5. US0.5: CI/CD Pipeline Foundation (Not required for MVP - basic testing only)
6. US0.6: Local HTTPS Development Setup (Not required for MVP - HTTP is fine locally)
7. US0.7: Development Standards and Documentation (Not required for MVP - minimal docs only)

## Epic 1: User Management & Authentication

**Priority**: Week 1 (Simplified)  
**MVP Scope**: Basic authentication and currency selection only

1. US1.1: Account Registration
2. US1.3: Base Currency Selection
3. US1.2: Partner Account Linking (Not required for MVP)
4. US1.4: Secure Password Reset (Not required for MVP)
5. US1.5: Role-Based Permissions (Not required for MVP)

## Epic 2: Transaction Management Core

**Priority**: Week 1  
**MVP Scope**: Basic CRUD operations with predefined categories

1. US2.1: Add Transaction
2. US2.2: Categorize Transactions
3. US2.4: Transaction Search
4. US2.5: Edit Transaction History
5. US2.3: Personal vs Shared Transactions (Not required for MVP)

## Epic 4: Multi-Currency Engine

**Priority**: Week 2  
**MVP Scope**: Record transactions in multiple currencies with auto-conversion

1. US4.1: Multi-Currency Transactions
2. US4.2: Real-Time Currency Conversion
3. US4.3: Multi-Currency Accounts (Not required for MVP)
4. US4.4: Currency Rate History (Not required for MVP)

## Epic 3: Automated Budget Engine

**Priority**: Week 3  
**MVP Scope**: Basic 50/30/20 budget split on income

1. US3.1: Automatic 50/30/20 Budget Creation
2. US3.2: Envelope Budget Tracking
3. US3.3: Budget Alerts (Not required for MVP)
4. US3.4: Partner Budget Views (Not required for MVP)

## Epic 7: Privacy & Security Infrastructure (Not required for MVP)

**Priority**: Minimal implementation only  
**MVP Scope**: Basic password hashing and HTTPS only

1. US7.1: Data Encryption (Not required for MVP)
2. US7.2: Audit Logging (Not required for MVP)
3. US7.3: Data Export (Not required for MVP)
4. US7.4: Automated Backups (Not required for MVP)

## Epic 5: Bank Data Integration (Not required for MVP)

**Priority**: Post-MVP  
**MVP Scope**: Manual entry only

1. US5.1: CSV Bank Import (Not required for MVP)
2. US5.2: Import Rules (Not required for MVP)
3. US5.3: OFX/QFX Support (Not required for MVP)
4. US5.4: Import Review (Not required for MVP)

## Epic 6: Analytics & Reporting (Not required for MVP)

**Priority**: Post-MVP  
**MVP Scope**: Basic transaction list and budget status only

1. US6.1: Financial Dashboard (Not required for MVP)
2. US6.2: Spending Analysis (Not required for MVP)
3. US6.3: Multi-Currency Reports (Not required for MVP)
4. US6.4: Goal Progress Tracking (Not required for MVP)

## Epic 8: Collaboration Features (Not required for MVP)

**Priority**: Post-MVP  
**MVP Scope**: Separate accounts for each user

1. US8.1: Expense Splitting (Not required for MVP)
2. US8.2: Shared Notes (Not required for MVP)
3. US8.3: Financial Goals (Not required for MVP)
4. US8.4: Activity Feed (Not required for MVP)
5. US8.5: Approval Workflows (Not required for MVP)

---

## MVP Summary

### Pre-Week 1: Environment Setup (Current Status)

- **Epic 0**: US0.1 ✓ + US0.2 (In Progress) + US0.3 + US0.4
- Already completed: Project documentation and planning
- Currently working on: Backend environment setup
- Still needed: Frontend setup, Database setup

### Week 1 Focus (5 days)

- **Epic 1**: US1.1 (Registration) + US1.3 (Base Currency)
- **Epic 2**: US2.1 (Add Transaction) + US2.2 (Categories) + US2.4 (Search) + US2.5 (Edit)

### Week 2 Focus (5 days)

- **Epic 4**: US4.1 (Multi-Currency Transactions) + US4.2 (Real-Time Conversion)

### Week 3 Focus (4 days)

- **Epic 3**: US3.1 (Automatic 50/30/20 Budget) + US3.2 (Envelope Budget Tracking)

### Week 3.5 Focus (3 days)

- Polish, Docker setup, deployment preparation

### Total MVP User Stories: 14 out of 39

- Epic 0: 4/7 stories (Foundation - partially complete)
- Epic 1: 2/5 stories
- Epic 2: 4/5 stories
- Epic 3: 2/4 stories (including envelope budgeting)
- Epic 4: 2/4 stories
- Epic 5: 0/4 stories
- Epic 6: 0/4 stories
- Epic 7: 0/4 stories
- Epic 8: 0/5 stories

This focused approach delivers a working finance tracker with multi-currency support and basic budget automation in 3.5 weeks.
