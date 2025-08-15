# 🐛 Known Bugs & Issues

## 🔴 High Priority
- [ ] **BUG-001**: Create transaction does not show category right away
  - **GitHub Issue**: #[TBD](https://github.com/user/repo/issues/TBD)
  - **Impact**: Users can't immediately see which category was selected after creating a transaction
  - **Steps to reproduce**: 
    1. Create a new transaction with a category
    2. Submit the form
    3. Transaction appears in list but category is not visible
  - **Expected behavior**: Transaction should display with the selected category name/color
  - **Actual behavior**: Category information is missing or not displayed
  - **Environment**: Frontend transaction creation flow
  - **Priority**: High
  - **Component**: TransactionForm, TransactionList

- [ ] **BUG-002**: Get a fail message when deleting a transaction but database works
  - **GitHub Issue**: #[TBD](https://github.com/user/repo/issues/TBD)
  - **Impact**: Users see error messages even when operations succeed, causing confusion
  - **Steps to reproduce**:
    1. Delete a transaction
    2. See error message about deletion failure
    3. Refresh page - transaction is actually gone from database
  - **Expected behavior**: Success message when transaction is deleted, or clear error if deletion fails
  - **Actual behavior**: Error message shown despite successful deletion
  - **Environment**: Frontend transaction deletion flow
  - **Priority**: High
  - **Component**: TransactionList, API service

- [ ] **BUG-003**: When change a transaction's category, it does not show right away
  - **GitHub Issue**: #[TBD](https://github.com/user/repo/issues/TBD)
  - **Impact**: Users can't immediately see category changes, requiring page refresh
  - **Steps to reproduce**:
    1. Edit an existing transaction
    2. Change the category
    3. Save the changes
    4. Category change is not reflected in the UI
  - **Expected behavior**: Category change should be immediately visible in the transaction list
  - **Actual behavior**: Old category still shows until page refresh
  - **Environment**: Frontend transaction editing flow
  - **Priority**: High
  - **Component**: TransactionForm, TransactionList, state management

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

## 📊 Bug Statistics
- **Total Bugs**: 5
- **Critical**: 0
- **High**: 5
- **Medium**: 0
- **Low**: 0
- **Fixed**: 0

## 🔍 **Common Patterns**
These bugs appear to be related to **state management** and **UI synchronization** issues:
- **BUG-001 & BUG-003**: UI not reflecting data changes immediately
- **BUG-002**: Error handling vs. actual operation success mismatch
- **BUG-004**: Data aggregation and real-time updates not working
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
*Total bugs tracked: 5*
