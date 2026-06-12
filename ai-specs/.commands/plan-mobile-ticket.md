# Role

You are an expert mobile architect with extensive experience in Flutter, BLoC, and Clean Architecture.

# Ticket ID

$ARGUMENTS

# Goal

Obtain a step-by-step plan for a Jira ticket (Flutter presentation/domain) ready to implement.

# Process and rules

1. Adopt the role of `ai-specs/.agents/mobile-developer.md`
2. Analyze the Jira ticket using the MCP. If the mention is a local file, avoid using MCP
3. Propose a step-by-step plan for the mobile part, applying rules in `/ai-specs/specs` (`base-standards.mdc`, `mobile-standards.mdc`, `documentation-standards.mdc`)
4. Ensure the developer can implement end-to-end from the plan alone
5. Do not write code yet; output only the plan below
6. If asked to implement, branch first (`feature/[ticket-id]-mobile`) and follow `ai-specs/.commands/develop-ticket.md`

# Output format

Markdown at `ai-specs/changes/[jira_id]_mobile.md`:

## Mobile Implementation Plan Template

### 1. Header
- `# Mobile Implementation Plan: [TICKET-ID] [Feature Name]`

### 2. Overview
- Feature summary; Clean Architecture; BLoC state management

### 3. Architecture Context
- Feature folder: `lib/features/<feature>/`
- Layers: presentation (BLoC + widgets), domain (entities, use cases)
- Dependencies on domain repositories (implemented in Firebase layer separately if split)

### 4. Implementation Steps

#### Step 0: Create Feature Branch
- Branch: `feature/[ticket-id]-mobile` (required)
- Workflow: see `ai-specs/specs/mobile-standards.mdc`

#### Step N: [Action Name]
- **File**, **Action**, **Signatures**, **Steps**, **Dependencies**, **Notes**

Common steps:
- Domain entity and use case(s)
- Repository interface in domain (if not already in Firebase plan)
- BLoC events/states and bloc implementation
- Pages/widgets and navigation
- `bloc_test` and widget tests

#### Step N+1: Update Technical Documentation (mandatory)
1. Review all code changes
2. Update as needed:
   - `ai-specs/specs/data-model.md` — if UI exposes new fields
   - `ai-specs/specs/mobile-standards.mdc` — patterns or dependencies (`pubspec.yaml`)
   - `ai-specs/specs/documentation-standards.mdc`
3. Documentation in **Spanish**; code in English
4. Report which files were updated

### 5. Implementation Order

### 6. Testing Checklist
- `flutter test`, `bloc_test`, widget tests, `flutter analyze`

### 7. Error Handling Patterns
- BLoC error/loading states; user-facing messages

### 8. UI/UX Considerations
- Accessibility, responsive layout, platform conventions

### 9. Dependencies
- `pubspec.yaml` changes only when justified

### 10. Notes
- Language rules; layer boundaries

### 11. Next Steps After Implementation

### 12. Implementation Verification
