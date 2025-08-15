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

## 📊 Bug Statistics
- **Total Bugs**: 3
- **Critical**: 0
- **High**: 3
- **Medium**: 0
- **Low**: 0
- **Fixed**: 0

## 🔍 **Common Patterns**
These bugs appear to be related to **state management** and **UI synchronization** issues:
- **BUG-001 & BUG-003**: UI not reflecting data changes immediately
- **BUG-002**: Error handling vs. actual operation success mismatch

## 🎯 **Next Steps**
1. **Investigate state management** in React components
2. **Check API response handling** for proper success/error states
3. **Verify optimistic updates** are working correctly
4. **Test error boundaries** and error handling flows

---
*Last updated: $(date)*
*Total bugs tracked: 3*
