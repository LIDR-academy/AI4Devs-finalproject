# 🐛 Known Bugs & Issues

Follow this template:

- [ ] **BUG-XXX**: Title
  - **GitHub Issue**: #[TBD](https://github.com/user/repo/issues/TBD)
  - **Impact**: LOREM
  - **Steps to reproduce**:
    1. LOREM
    2. IMPSUM
  - **Expected behavior**: LOREM
  - **Actual behavior**: LOREM
  - **Environment**: LOREM
  - **Priority**: High/Medium/Low
  - **Component**: LOREM

When an issue is solved, change [ ] to [x] and remove everything from the template but the title

## 🔴 High Priority
- [ ] **BUG-010**: Missing end-to-end tests for critical user flows
  - **GitHub Issue**: #[TBD](https://github.com/user/repo/issues/TBD)
  - **Impact**: No confidence that user journeys work correctly across frontend, backend, and database layers
  - **Steps to reproduce**:
    1. Run test suite
    2. Notice only unit and integration tests exist
    3. No end-to-end tests covering complete user workflows
  - **Expected behavior**: End-to-end tests should cover critical user flows like transaction creation, editing, deletion, and dashboard updates
  - **Actual behavior**: Missing end-to-end tests for complete user journeys
  - **Environment**: Test suite and CI/CD pipeline
  - **Priority**: High
  - **Component**: Test infrastructure, user workflow validation

- [x] **BUG-001**: Transaction list does not show category after creating transaction

- [x] **BUG-002**: Get a fail message when deleting a transaction but database works

- [x] **BUG-003**: Transaction list does not show category change immediately after editing

- [ ] **BUG-004**: Dashboard cards not connected to database or wrong user data
  - **GitHub Issue**: #[TBD](https://github.com/user/repo/issues/TBD)
  - **Impact**: Users see incorrect financial summaries that don't reflect actual transaction data
  - **Steps to reproduce**:
    1. View dashboard with total income, total expenses, and net amount cards
    2. Create/delete transactions
    3. Dashboard cards don't update or show wrong user's data
  - **Expected behavior**: Dashboard cards should always reflect all transactions respecting current filters
  - **Actual behavior**: Cards show stale data, wrong user data, or don't update with transactions
  - **Environment**: Frontend dashboard display
  - **Priority**: High
  - **Component**: Dashboard cards, transaction aggregation logic

- [ ] **BUG-005**: Frontend not pulling all transactions respecting filters
  - **GitHub Issue**: #[TBD](https://github.com/user/repo/issues/TBD)
  - **Impact**: Users don't see complete transaction data, potentially missing important financial information
  - **Steps to reproduce**:
    1. Apply filters to transaction list
    2. Check if all matching transactions are displayed
    3. Verify no pagination is applied
  - **Expected behavior**: Frontend should pull all transactions respecting filters with no pagination
  - **Actual behavior**: Some transactions may be missing or pagination is applied
  - **Environment**: Frontend transaction listing and filtering
  - **Priority**: High
  - **Component**: TransactionList, API service, filtering logic

- [x] **BUG-006**: Users cannot filter transactions by category and frequency

- [x] **BUG-007**: Transaction duplication when switching between edit and create modes

- [ ] **BUG-008**: Dashboard amounts not normalized by frequency for monthly view
  - **GitHub Issue**: #[TBD](https://github.com/user/repo/issues/TBD)
  - **Impact**: Dashboard shows incorrect monthly totals by not accounting for transaction frequency, leading to misleading financial summaries
  - **Steps to reproduce**:
    1. Create a weekly transaction of $100
    2. Create a monthly transaction of $500
    3. View dashboard total income/expenses
    4. Weekly transaction shows as $100 instead of $400 (4 weeks × $100)
  - **Expected behavior**: Dashboard should normalize all amounts to monthly view (weekly × 4, yearly ÷ 12, etc.)
  - **Actual behavior**: Dashboard shows raw transaction amounts without frequency normalization
  - **Environment**: Frontend dashboard calculation
  - **Priority**: High
  - **Component**: Dashboard cards, transaction aggregation logic, frequency calculation

- [x] **BUG-009**: Overview cards disappear when transaction panel opens

## 📊 Bug Statistics
- **Total Bugs**: 9
- **Critical**: 0
- **High**: 4
- **Medium**: 0
- **Low**: 0
- **Fixed**: 6

## 🔍 **Common Patterns**
These bugs appear to be related to **state management** and **UI synchronization** issues:
- **BUG-001 & BUG-003**: UI not reflecting data changes immediately
- **BUG-002**: Error handling vs. actual operation success mismatch
- **BUG-004 & BUG-008**: Data aggregation and real-time updates not working, frequency normalization missing
- **BUG-005**: Incomplete data fetching and filter application

## 🎯 **Next Steps**
1. **Investigate state management** in React components
2. **Check API response handling** for proper success/error states
3. **Verify optimistic updates** are working correctly
4. **Test error boundaries** and error handling flows
5. **Fix dashboard data aggregation** and real-time updates
6. **Ensure complete transaction fetching** with proper filter application

---

*Last updated: $(date)*

*Total bugs tracked: 9*
