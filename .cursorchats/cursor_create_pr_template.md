# Create PR template

_Exported on 17/09/2025 at 9:03:55 CEST from Cursor (1.5.11)_

_**User (2025-09-15 12:35Z)**_

Let's add a PR template to @branch-strategy.md

---

_**Assistant**_

Great idea! Let me add a PR template section to the branch strategy document. I'll add it after the merge strategy section.

---

<details><summary>Edit file: docs/branch-strategy.md</summary>

undefined

**Chunk 1**
Lines added: 69, lines removed: undefined

````diff
@@ -169,4 +169,73 @@
  1. Task → User Story (with code review)
  2. User Story → Epic (with code review)
+
+ ## Pull Request Template
+
+ ### PR Title Format
+ Follow conventional commit format:
+ - `feat:` for new features
+ - `fix:` for bug fixes
+ - `docs:` for documentation changes
+ - `refactor:` for code refactoring
+ - `test:` for test additions/changes
+ - `chore:` for maintenance tasks
+
+ ### PR Description Template
+
+ ```markdown
+ ## Summary
+
+ Brief description of what this PR accomplishes.
+
+ ## Changes
+
+ - List of key changes made
+ - Files added/modified/deleted
+ - New features or fixes implemented
+
+ ## Type of PR
+
+ - [ ] Epic → Dev
+ - [ ] Dev → UAT
+ - [ ] UAT → Production
+ - [ ] Story → Epic
+ - [ ] Task → Story
+
+ ## Acceptance Criteria
+
+ - [ ] All acceptance criteria from user story/task met
+ - [ ] Code follows project standards
+ - [ ] Tests pass (if applicable)
+ - [ ] Documentation updated (if needed)
+
+ ## Testing
+
+ - [ ] Manual testing completed
+ - [ ] Unit tests added/updated
+ - [ ] Integration tests pass
+ - [ ] No regressions introduced
+
+ ## Screenshots/Demo
+
+ Include screenshots or demo links for UI changes.
+
+ ## Related Issues/Stories
+
+ - Closes #[issue-number]
+ - Related to [Epic/Story ID]
+
+ ## Deployment Notes
+
+ Any special deployment considerations or environment variables needed.
+
+ ## Checklist
+
+ - [ ] Code follows style guidelines
+ - [ ] Self-review completed
+ - [ ] Comments added for complex logic
+ - [ ] Documentation updated
+ - [ ] No console.log or debug statements
+ - [ ] Ready for review
+ ```

  ## Best Practices
````

</details>

---

Perfect! Now let's commit this addition to the branch strategy document:

---

```bash
cd /Users/jose.garcia/code/lidr/finalproject-JAGM && git add docs/branch-strategy.md
```

---

_**User (2025-09-15 12:35Z)**_

1. PR Title should be `Jira issue: [Ticket description]`
2. Add a Jira section before Summary with link to the issue
3. No need for type or PR
4. No acceptance criteria
5. Add a coverage table in the Testing section
6. Add Jira links to Related Issues/Stories

---

_**Assistant**_

I'll update the PR template according to your requirements. Let me modify the template section:

---

The string to replace was not found in the file.

---

Let me read the current file to see the exact formatting and then make the replacement:

---

Read file: undefined

---

Now I'll make the replacement with the exact formatting:

---

<details><summary>Edit file: docs/branch-strategy.md</summary>

undefined

**Chunk 1**
Lines added: 8, lines removed: 8

````diff
@@ -174,16 +174,16 @@
  ### PR Title Format

- Follow conventional commit format:
-
- - `feat:` for new features
- - `fix:` for bug fixes
- - `docs:` for documentation changes
- - `refactor:` for code refactoring
- - `test:` for test additions/changes
- - `chore:` for maintenance tasks
+ Use Jira issue format:
+ - `AI4DFP-123: [Ticket description]`

  ### PR Description Template

  ```markdown
+ ## Jira
+
+ - **Issue**: [AI4DFP-123](https://your-jira-instance.atlassian.net/browse/AI4DFP-123)
+ - **Epic**: [AI4DFP-1](https://your-jira-instance.atlassian.net/browse/AI4DFP-1) - Epic Name
+ - **Story**: [AI4DFP-124](https://your-jira-instance.atlassian.net/browse/AI4DFP-124) - Story Name
+
  ## Summary

````

**Chunk 2**
Lines added: 8, lines removed: 18

```diff
@@ -195,26 +195,16 @@
  - Files added/modified/deleted
  - New features or fixes implemented
-
- ## Type of PR
-
- - [ ] Epic → Dev
- - [ ] Dev → UAT
- - [ ] UAT → Production
- - [ ] Story → Epic
- - [ ] Task → Story
-
- ## Acceptance Criteria
-
- - [ ] All acceptance criteria from user story/task met
- - [ ] Code follows project standards
- - [ ] Tests pass (if applicable)
- - [ ] Documentation updated (if needed)

  ## Testing

- - [ ] Manual testing completed
- - [ ] Unit tests added/updated
- - [ ] Integration tests pass
+ | Test Type | Status | Coverage | Notes |
+ |-----------|--------|----------|-------|
+ | Unit Tests | ✅/❌ | XX% | |
+ | Integration Tests | ✅/❌ | XX% | |
+ | Manual Testing | ✅/❌ | - | |
+ | E2E Tests | ✅/❌ | XX% | |
+
  - [ ] No regressions introduced
+ - [ ] All tests pass

  ## Screenshots/Demo
```

**Chunk 3**
Lines added: 3, lines removed: 2

```diff
@@ -224,6 +214,7 @@
  ## Related Issues/Stories

- - Closes #[issue-number]
- - Related to [Epic/Story ID]
+ - **Epic**: [AI4DFP-1](https://your-jira-instance.atlassian.net/browse/AI4DFP-1) - Epic Name
+ - **Story**: [AI4DFP-124](https://your-jira-instance.atlassian.net/browse/AI4DFP-124) - Story Name
+ - **Task**: [AI4DFP-125](https://your-jira-instance.atlassian.net/browse/AI4DFP-125) - Task Name

  ## Deployment Notes
```

</details>

---

Perfect! ✅ **PR Template Updated Successfully!**

## ✅ Changes Made to PR Template:

1. **✅ PR Title Format**: Changed to `AI4DFP-123: [Ticket description]`
2. **✅ Added Jira Section**: New section with links to Issue, Epic, and Story
3. **✅ Removed Type of PR**: No longer needed
4. **✅ Removed Acceptance Criteria**: Simplified template
5. **✅ Added Coverage Table**: Testing section now includes a coverage table with status and coverage percentages
6. **✅ Enhanced Related Issues/Stories**: Now includes proper Jira links with formatted structure

## 📋 Updated PR Template Features:

- **Jira Integration**: Direct links to Jira issues, epics, and stories
- **Testing Coverage Table**: Structured table showing test types, status, coverage, and notes
- **Simplified Structure**: Removed unnecessary sections for cleaner workflow
- **Jira-Focused**: Aligned with your Jira-based project management approach

Now you can use this updated template when creating your PR from `story/US0.1-project-documentation-and-planning` to `epic/epic-0-development-environment`. The template will help ensure consistent and comprehensive PR descriptions that align with your Jira workflow.

Would you like me to commit this change to the branch strategy document, or would you prefer to create the PR first using this new template?
