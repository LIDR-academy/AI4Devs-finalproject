# 🧪 Testing Checklist - Delete Functionality

**Feature**: Complete DELETE functionality for Templates, Versions, and Comparisons  
**Date**: November 8, 2025  
**Purpose**: Manual testing verification guide

---

## 📋 Pre-Testing Setup

### Environment Requirements

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] PostgreSQL database running
- [ ] User authenticated in the application
- [ ] Test data available (templates, versions, comparisons)

### Test Data Preparation

```bash
# Ensure you have:
- At least 2 templates with multiple versions each
- At least 1 comparison between versions
- Current version marked correctly (is_current=True)
```

---

## 🗂️ Task 9.1: CASCADE Deletion Test

**Objective**: Verify that deleting a non-current version cascades to comparisons

### Steps

1. [x] Create a template with at least 2 versions
   - Version 1 (older, not current)
   - Version 2 (current)
2. [x] Create a comparison using Version 1 (source or target)
3. [x] Note the comparison ID
4. [x] Navigate to Templates page
5. [x] Click "View version history" for the template
6. [x] Click delete (🗑️) icon on Version 1
7. [x] Confirm deletion in modal
8. [x] Verify success message appears
9. [x] Navigate to Comparisons page
10. [x] Verify the comparison using Version 1 is **deleted** (not visible)

### Expected Results

- ✅ Version 1 deleted successfully
- ✅ Green success notification shown
- ✅ Comparison automatically deleted (CASCADE)
- ✅ No orphaned comparison records

### Database Verification (Optional)

```sql
-- Check comparison is gone
SELECT * FROM comparisons WHERE id = <comparison_id>;
-- Should return 0 rows

-- Check comparison_fields are gone
SELECT * FROM comparison_fields WHERE comparison_id = <comparison_id>;
-- Should return 0 rows
```

---

## 🚫 Task 9.2: Current Version Protection Test

**Objective**: Verify that attempting to delete the current version fails with error 400

### Steps

1. [x] Navigate to Templates page
2. [x] Click "View version history" for any template
3. [x] Identify the current version (blue badge "Current")
4. [x] Observe the delete button for current version
5. [x] Verify button is **disabled** (grayed out)
6. [x] Hover over disabled button
7. [x] Verify tooltip shows "Cannot delete current version"
8. [x] Attempt to inspect and force-enable the button (browser dev tools)
9. [x] If forced to click, verify backend returns 400 error

### Expected Results

- ✅ Current version delete button is **disabled**
- ✅ Tooltip explains why deletion is prevented
- ✅ If bypassed, backend returns 400 error
- ✅ Error message: "Cannot delete current version. Please delete the entire template instead."

### Backend API Test (Optional)

```bash
# Try to delete current version via API
curl -X DELETE http://localhost:8000/api/v1/templates/{template_id}/versions/{current_version_id} \
  -H "Authorization: Bearer {token}"

# Expected response: 400 Bad Request
# {"detail": "Cannot delete current version..."}
```

---

## 🗑️ Task 9.3: Template Complete Deletion Test

**Objective**: Verify that deleting a template removes all versions, fields, comparisons, and files

### Steps

1. [x] Create a new template with 2 versions (or use existing)
2. [x] Note the template ID and version IDs
3. [x] Check physical files exist in `backend/uploads/`:
   ```bash
   ls -la backend/uploads/ | grep <template_id>
   ```
4. [x] Navigate to Templates page
5. [x] Click delete (🗑️) icon for the template
6. [x] Read confirmation modal carefully
7. [x] Confirm deletion
8. [x] Verify success message appears
9. [x] Verify template is removed from list
10. [x] Check physical files are deleted:
    ```bash
    ls -la backend/uploads/ | grep <template_id>
    ```

### Expected Results

- ✅ Template deleted from database
- ✅ All versions deleted (CASCADE)
- ✅ All template_fields deleted (CASCADE)
- ✅ All comparisons using any version deleted (CASCADE)
- ✅ **All PDF files deleted** from filesystem
- ✅ Green success notification shown
- ✅ Page refreshes and template is gone

### Database Verification (Optional)

```sql
-- Check template is gone
SELECT * FROM pdf_templates WHERE id = <template_id>;
-- Should return 0 rows

-- Check all versions are gone
SELECT * FROM template_versions WHERE template_id = <template_id>;
-- Should return 0 rows

-- Check all fields are gone
SELECT * FROM template_fields WHERE version_id IN (
  SELECT id FROM template_versions WHERE template_id = <template_id>
);
-- Should return 0 rows
```

---

## 📁 Task 9.4: Physical File Deletion Verification

**Objective**: Verify that PDF files are actually deleted from the filesystem

### Steps

1. [ ] Before deletion, list files in uploads directory:
   ```bash
   ls -la backend/uploads/ > before.txt
   ```
2. [ ] Delete a template with known PDF files
3. [ ] After deletion, list files again:
   ```bash
   ls -la backend/uploads/ > after.txt
   diff before.txt after.txt
   ```
4. [ ] Verify the specific PDF files are removed

### Expected Results

- ✅ PDF files for deleted template are **physically removed**
- ✅ No orphaned files remain
- ✅ Other templates' files are **unaffected**

### File Naming Convention

```
uploads/
├── template_{id}_version_{version_id}.pdf
└── ...
```

---

## 📊 Task 9.5: Activity Logging Verification

**Objective**: Verify that all deletion operations are logged in the activity table

### Steps

1. [ ] Perform the following deletions:
   - Delete a comparison
   - Delete a version (non-current)
   - Delete a template
2. [ ] Navigate to Activity page (if available) or check database
3. [ ] Verify each deletion has a corresponding activity log entry

### Expected Results

- ✅ `COMPARISON_DELETED` activity logged
- ✅ `VERSION_DELETED` activity logged
- ✅ `TEMPLATE_DELETED` activity logged
- ✅ Each log includes:
  - User email
  - Entity name/ID
  - Timestamp
  - Descriptive message

### Database Verification

```sql
-- Check activity logs
SELECT
  activity_type,
  description,
  user_email,
  created_at
FROM activities
WHERE activity_type IN ('TEMPLATE_DELETED', 'VERSION_DELETED', 'COMPARISON_DELETED')
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔐 Task 9.6: Authorization Test

**Objective**: Verify that users can only delete their own resources

### Steps

1. [ ] Create a template as User A
2. [ ] Logout and login as User B
3. [ ] Navigate to Templates page
4. [ ] Attempt to delete User A's template
5. [ ] Verify you receive a 403 Forbidden error
6. [ ] Verify error message: "You do not have permission to delete this template"

### Test All Three Entities

- [ ] Templates (403 forbidden)
- [ ] Versions (403 forbidden)
- [ ] Comparisons (403 forbidden)

### Expected Results

- ✅ 403 Forbidden error for unauthorized deletion
- ✅ User-friendly error message displayed
- ✅ Resource remains intact
- ✅ No data leakage

### API Test (Optional)

```bash
# As User B, try to delete User A's template
curl -X DELETE http://localhost:8000/api/v1/templates/{user_a_template_id} \
  -H "Authorization: Bearer {user_b_token}"

# Expected: 403 Forbidden
```

---

## 🌓 Task 9.7: Dark Mode UI Test

**Objective**: Verify that all delete buttons and modals work correctly in dark mode

### Steps

1. [ ] Toggle dark mode in application
2. [ ] Navigate to Templates page
3. [ ] Verify delete button (🗑️) is visible and styled correctly
4. [ ] Click delete button
5. [ ] Verify confirmation modal appears with proper dark mode styling
6. [ ] Check all text is readable (contrast)
7. [ ] Verify buttons have correct hover states
8. [ ] Repeat for:
   - [ ] Comparisons page
   - [ ] Version History modal

### Expected Results

- ✅ Delete icons visible in dark mode
- ✅ Hover states work (red highlight)
- ✅ Modal background is dark
- ✅ Text has sufficient contrast
- ✅ Buttons styled correctly
- ✅ Warning banner readable

---

## ⌨️ Task 9.8: Keyboard Accessibility Test

**Objective**: Verify that all delete operations are fully keyboard accessible

### Steps

1. [ ] Navigate to Templates page using only keyboard (Tab key)
2. [ ] Tab to delete button
3. [ ] Press Enter to open modal
4. [ ] Verify focus is trapped inside modal
5. [ ] Tab through modal elements (Cancel, Delete buttons)
6. [ ] Press ESC key to close modal
7. [ ] Reopen modal and press Enter on Delete button
8. [ ] Verify deletion proceeds

### Test All Three UIs

- [ ] Templates list page
- [ ] Comparisons list page
- [ ] Version History modal

### Expected Results

- ✅ All delete buttons reachable via Tab
- ✅ Enter key opens confirmation modal
- ✅ Focus trapped inside modal
- ✅ ESC key closes modal
- ✅ Tab order is logical
- ✅ Enter key confirms deletion
- ✅ Visible focus indicators

---

## 🧪 Task 9.9: Backend Unit Tests

**Objective**: Verify all backend tests pass

### Steps

```bash
cd backend
source venv/bin/activate

# Run delete tests
pytest tests/test_delete_comparison.py -v
pytest tests/test_delete_version.py -v
pytest tests/test_delete_template.py -v

# Or run all at once
pytest tests/test_delete*.py -v
```

### Expected Results

- ✅ All 23 tests pass
- ✅ No warnings or errors
- ✅ Test coverage includes:
  - Successful deletions
  - Authorization checks
  - 404 errors
  - 400 errors (current version)
  - Activity logging
  - File deletion

---

## 🎨 Task 9.10: Frontend Linter Check

**Objective**: Verify no linting errors in frontend code

### Steps

```bash
cd frontend

# Run linter
npm run lint

# Or with auto-fix
npm run lint:fix

# Type check
npm run type-check
```

### Expected Results

- ✅ No linting errors
- ✅ No type errors
- ✅ All imports resolved
- ✅ All props correctly typed

---

## 📱 Bonus: Mobile Responsiveness Test

**Objective**: Verify delete functionality works on mobile devices

### Steps

1. [ ] Open browser DevTools
2. [ ] Toggle device emulation (mobile view)
3. [ ] Navigate to Templates page
4. [ ] Verify delete buttons are touchable (not too small)
5. [ ] Click delete button
6. [ ] Verify modal is readable and functional
7. [ ] Test on actual mobile device if possible

### Expected Results

- ✅ Delete icons visible and clickable
- ✅ Modal fits on mobile screen
- ✅ Text is readable (not too small)
- ✅ Buttons are touch-friendly (min 44x44px)
- ✅ No horizontal scrolling required

---

## ✅ Final Checklist

### Core Functionality

- [ ] Templates can be deleted (Task 9.3)
- [ ] Versions can be deleted (Task 9.1)
- [ ] Comparisons can be deleted
- [ ] Current version cannot be deleted (Task 9.2)
- [ ] CASCADE deletion works (Task 9.1)
- [ ] Physical files are deleted (Task 9.4)

### Security & Authorization

- [ ] Only owners can delete (Task 9.6)
- [ ] JWT authentication required
- [ ] 403 errors for unauthorized access
- [ ] 404 errors for non-existent resources

### User Experience

- [ ] Confirmation modals work
- [ ] Success notifications appear
- [ ] Error messages are clear
- [ ] Loading states show correctly
- [ ] Dark mode works (Task 9.7)
- [ ] Keyboard accessible (Task 9.8)
- [ ] Mobile responsive (Bonus)

### Data Integrity

- [ ] Activity logs created (Task 9.5)
- [ ] No orphaned records
- [ ] CASCADE rules work correctly
- [ ] Database constraints respected

### Testing

- [ ] Backend tests pass (Task 9.9)
- [ ] Frontend linter passes (Task 9.10)
- [ ] Manual tests completed
- [ ] Edge cases tested

---

## 🐛 Known Issues / Limitations

Document any issues found during testing:

1. **Issue**: ****\*\*\*\*****\_****\*\*\*\*****
   - **Severity**: Critical / High / Medium / Low
   - **Steps to reproduce**: ****\*\*\*\*****\_****\*\*\*\*****
   - **Expected**: ****\*\*\*\*****\_****\*\*\*\*****
   - **Actual**: ****\*\*\*\*****\_****\*\*\*\*****
   - **Fix required**: Yes / No

---

## 📝 Testing Notes

Use this space to document any observations or additional testing performed:

```
Date: ___________
Tester: ___________

Notes:
-
-
-

```

---

## ✨ Sign-Off

**Testing completed by**: **\*\*\*\***\_\_\_**\*\*\*\***  
**Date**: **\*\*\*\***\_\_\_**\*\*\*\***  
**Status**: ⬜ Passed / ⬜ Failed / ⬜ Needs Fixes  
**Ready for Production**: ⬜ Yes / ⬜ No

**Comments**:

```


```

---

**Generated**: 2025-11-08  
**Spec Location**: `.agent-os/specs/2025-11-08-01-delete-functionality/`
