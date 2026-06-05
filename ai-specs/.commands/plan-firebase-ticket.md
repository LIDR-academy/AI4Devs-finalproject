# Role

You are an expert software architect with extensive experience in Flutter + Firebase projects applying Clean Architecture in the data layer.

# Ticket ID

$ARGUMENTS

# Goal

Obtain a step-by-step plan for a Jira ticket (Firebase / data layer) that is ready to start implementing.

# Process and rules

1. Adopt the role of `ai-specs/.agents/firebase-developer.md`
2. Analyze the Jira ticket using the MCP. If the mention is a local file, avoid using MCP
3. Propose a step-by-step plan for the Firebase part, applying rules in `/ai-specs/specs` (`base-standards.mdc`, `firebase-standards.mdc`, `documentation-standards.mdc`)
4. Ensure the developer can implement end-to-end from the plan alone
5. Do not write code yet; output only the plan below
6. If asked to implement, branch first (`feature/[ticket-id]-firebase`) and follow `ai-specs/.commands/develop-ticket.md`

# Output format

Markdown at `ai-specs/changes/[jira_id]_firebase.md`:

## Firebase Implementation Plan Template

### 1. Header
- `# Firebase Implementation Plan: [TICKET-ID] [Feature Name]`

### 2. Overview
- Feature summary; Clean Architecture data layer; no REST API

### 3. Architecture Context
- Domain repository interfaces affected
- Datasources, models, mappers
- Firestore collections / Auth flows
- Security Rules impact

### 4. Implementation Steps

#### Step 0: Create Feature Branch
- Branch: `feature/[ticket-id]-firebase` (required; do not reuse a generic `[ticket-id]` branch)
- Workflow: see `ai-specs/specs/firebase-standards.mdc` and `mobile-standards.mdc` (Git workflow)

#### Step N: [Action Name]
- **File**, **Action**, **Signatures**, **Steps**, **Dependencies**, **Notes**

Common steps:
- Define/update domain repository interface
- Implement Firestore/Auth datasource
- Implement repository + mappers
- Update `firestore.rules` and `firestore.indexes.json`
- Unit tests (mocked datasource / `fake_cloud_firestore`)

#### Step N+1: Update Technical Documentation (mandatory)
1. Review all code changes
2. Update as needed:
   - `ai-specs/specs/data-model.md` — schema / collections
   - `ai-specs/specs/firebase-data-access.yml` — operaciones SDK / mapeo REST obsoleto
   - `ai-specs/specs/firebase-standards.mdc` — patterns or config
   - `ai-specs/specs/documentation-standards.mdc` — process
3. Write documentation in **Spanish**; keep code identifiers in English
4. Report which files were updated

### 5. Implementation Order
- Numbered list (starts with branch creation, ends with documentation)

### 6. Testing Checklist
- `flutter test`, emulator usage, rules validation

### 7. Error Handling
- Domain failure types; Firestore/Auth error mapping

### 8. Security & Rules
- Rule snippets or behavior to verify in emulator

### 9. Dependencies
- FlutterFire packages (only if required)

### 10. Notes
- Offline behavior, indexes, constraints

### 11. Next Steps After Implementation

### 12. Implementation Verification
- analyze, tests, rules, documentation complete
