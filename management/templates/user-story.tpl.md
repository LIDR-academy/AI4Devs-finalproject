# 🧾 User Story: <TITLE>

## 🆔 Metadata

| Field              | Value                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| ID                 | US-<XXX>                                                                                                  |
| Epic               | <Epic Name>                                                                                               |
| Feature            | <Feature Name>                                                                                            |
| Module / Domain    | <Auth / Events / AI / Vendors / Quotes / Booking / Reviews / Admin / I18N / Notifications / Seed / Other> |
| User Role          | <Organizer / Vendor / Admin / System / Anonymous>                                                         |
| Priority           | <Must Have / Should Have / Could Have / Won't Have / WSJF / RICE Score>                                   |
| Status             | <Draft / Ready / In Progress / In Review / Done>                                                          |
| Owner              | <PM / BA / PO / Tech Lead>                                                                                |
| Sprint / Milestone | <Sprint X / MVP / Demo / Future>                                                                          |
| Created Date       | <YYYY-MM-DD>                                                                                              |
| Last Updated       | <YYYY-MM-DD>                                                                                              |

---

## 🎯 User Story

**As a** <type of user>
**I want** <goal / action>
**So that** <business value / outcome>

---

## 🧠 Business Context

Describe the domain context necessary to understand this story.

### Context Summary

<Explain why this story exists, what user problem it solves, and how it contributes to the EventFlow MVP.>

### Related Domain Concepts

* <Concept 1>
* <Concept 2>
* <Concept 3>

### Assumptions

* <Assumption 1>
* <Assumption 2>

### Dependencies

* <Dependency 1>
* <Dependency 2>

---

## 🔗 Traceability

| Source                 | Reference                                           |
| ---------------------- | --------------------------------------------------- |
| FRD Requirement(s)     | <FR-XXX-001, FR-XXX-002>                            |
| Use Case(s)            | <UC-XXX-001, UC-XXX-002>                            |
| Business Rule(s)       | <BR-XXX-001, BR-XXX-002>                            |
| Permission Rule(s)     | <Role / permission reference>                       |
| Data Entity / Entities | <Event, User, QuoteRequest, AIRecommendation, etc.> |
| API Endpoint(s)        | <GET /api/v1/... / POST /api/v1/...>                |
| NFR Reference(s)       | <NFR-SEC-001, NFR-AI-001, NFR-DEMO-001>             |
| Related ADR(s)         | <ADR-API-001, ADR-SEC-001, ADR-AI-001>              |
| Related Document(s)    | </docs/...>                                         |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: <In Scope / Out of Scope / Future / Requires PO Decision>
* MVP Relevance: <Must Have / Should Have / Could Have>

### Explicitly Out of Scope

* <Out-of-scope item 1>
* <Out-of-scope item 2>
* <Out-of-scope item 3>

### Scope Notes

<Clarify what this story must not introduce to avoid scope creep.>

Example:

* This story must not introduce real payments.
* This story must not introduce real-time chat.
* This story must not introduce WhatsApp integration.
* This story must not bypass human validation for AI-generated outputs.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: <Happy path title>

**Given** <initial context>
**When** <user action>
**Then** <expected system behavior>

### AC-02: <Happy path title>

**Given** <initial context>
**When** <user action>
**Then** <expected system behavior>

---

## ⚠️ Edge Cases

### EC-01: <Edge case name>

**Given** <context>
**When** <action or exceptional condition>
**Then** <expected behavior>

#### Handling

* <How the system should behave>
* <Error, warning, fallback, restriction or empty state>

---

### EC-02: <Edge case name>

**Given** <context>
**When** <action or exceptional condition>
**Then** <expected behavior>

#### Handling

* <How the system should behave>
* <Error, warning, fallback, restriction or empty state>

---

## 🚫 Validation Rules

| ID    | Rule              | Message / Behavior             |
| ----- | ----------------- | ------------------------------ |
| VR-01 | <Validation rule> | <Expected message or behavior> |
| VR-02 | <Validation rule> | <Expected message or behavior> |
| VR-03 | <Validation rule> | <Expected message or behavior> |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                        |
| ------ | --------------------------------------------------------------------------- |
| SEC-01 | <Who can perform this action?>                                              |
| SEC-02 | <What ownership rule applies?>                                              |
| SEC-03 | <What should happen if the user is unauthorized?>                           |
| SEC-04 | <Any captcha, rate limit, session, cookie, upload, or sensitive data rule?> |

### Negative Authorization Scenarios

* <User with wrong role cannot perform action>
* <User cannot access another user's resource>
* <Anonymous user must be redirected or rejected>
* <Admin action must be audited if applicable>

---

## 🤖 AI Behavior

> Complete this section only if the story involves AI-assisted functionality.

### AI Involvement

* AI Feature: <AI-001 / AI-002 / AI-003 / None>
* Provider Layer: <LLMProvider / MockAIProvider / OpenAIProvider / Not applicable>
* Human Validation Required: <Yes / No>
* Persist AIRecommendation: <Yes / No>
* Fallback Required: <Yes / No>

### AI Input

* <Input field 1>
* <Input field 2>
* <Input field 3>

### AI Output

* <Expected structured output>
* <Expected JSON / UI suggestion / generated checklist / generated brief>

### Human-in-the-loop Rules

* <User must accept, edit, reject, regenerate or discard the suggestion>
* <AI output must not become official data without confirmation>
* <Edited AI output must be tracked if applicable>

### AI Error / Fallback Behavior

* <Timeout behavior>
* <Invalid JSON behavior>
* <Provider error behavior>
* <MockAIProvider/demo behavior>

---

## 🎨 UX / UI Notes

| Area                | Notes                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| Screen / Route      | </example/route>                                                      |
| Main UI Pattern     | <Wizard / Dashboard / Form / Modal / Table / Cards / Comparison View> |
| Primary Action      | <Button or main interaction>                                          |
| Secondary Actions   | <Cancel / Back / Save Draft / Regenerate / Edit / Delete>             |
| Empty State         | <Expected empty state>                                                |
| Loading State       | <Expected loading state>                                              |
| Error State         | <Expected error state>                                                |
| Success State       | <Expected success state>                                              |
| Accessibility Notes | <Keyboard, focus, labels, ARIA, contrast>                             |
| Responsive Notes    | <Mobile / tablet / desktop behavior>                                  |
| i18n Notes          | <Text must support es-LATAM, es-ES, pt, en>                           |
| Currency Notes      | <Currency display rules if applicable>                                |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * <Route or page>
* Components:

  * <Component 1>
  * <Component 2>
* State Management:

  * <TanStack Query / local state / form state / session state>
* Forms:

  * <React Hook Form / Zod / validation notes>
* API Client:

  * <Expected client method or query>

### Backend

* Use Case / Service:

  * <Application use case>
* Controller / Route:

  * <Controller or route>
* Authorization Policy:

  * <RBAC / ownership / admin-scoped / assignment-based>
* Validation:

  * <DTO / Zod schema / service validation>
* Transaction Required:

  * <Yes / No / Explain>

### Database

* Main Tables:

  * <Table 1>
  * <Table 2>
* Constraints:

  * <Constraint 1>
  * <Constraint 2>
* Index Considerations:

  * <Index or query pattern>

### API

| Method | Endpoint      | Purpose   |
| ------ | ------------- | --------- |
| GET    | `/api/v1/...` | <Purpose> |
| POST   | `/api/v1/...` | <Purpose> |
| PATCH  | `/api/v1/...` | <Purpose> |
| DELETE | `/api/v1/...` | <Purpose> |

### Observability / Audit

* Correlation ID Required: <Yes / No>
* Log Event Required: <Yes / No>
* AdminAction Required: <Yes / No>
* AIRecommendation Required: <Yes / No>

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario               | Type                             |
| ----- | ---------------------- | -------------------------------- |
| TS-01 | <Scenario description> | <Unit / Integration / API / E2E> |
| TS-02 | <Scenario description> | <Unit / Integration / API / E2E> |

### Negative Tests

| ID    | Scenario                           | Expected Result  |
| ----- | ---------------------------------- | ---------------- |
| NT-01 | <Invalid input / forbidden action> | <Expected error> |
| NT-02 | <Unauthorized access>              | <Expected error> |

### AI Tests

> Complete only if applicable.

| ID       | Scenario                                | Expected Result           |
| -------- | --------------------------------------- | ------------------------- |
| AI-TS-01 | <MockAIProvider returns valid response> | <Expected behavior>       |
| AI-TS-02 | <AI provider timeout or invalid output> | <Fallback/error behavior> |

### Authorization Tests

| ID         | Scenario                                       | Expected Result                 |
| ---------- | ---------------------------------------------- | ------------------------------- |
| AUTH-TS-01 | <Allowed role performs action>                 | <Success>                       |
| AUTH-TS-02 | <Wrong role performs action>                   | <403 Forbidden>                 |
| AUTH-TS-03 | <User tries to access another user's resource> | <403 Forbidden / 404 Not Found> |

### Accessibility Tests

* <Keyboard navigation>
* <Focus management>
* <Labels and ARIA>
* <Color contrast if applicable>

---

## 📊 Business Impact

| Field               | Value                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| KPI Affected        | <Activation / Time to Plan / Quote Response Rate / Demo Completion / Admin Review Time / Other> |
| Expected Impact     | <Qualitative or quantitative impact>                                                            |
| Success Criteria    | <Metric + target>                                                                               |
| Academic Demo Value | <How this story supports the final project demo>                                                |

---

## 🧩 Task Breakdown Readiness

> This section prepares the story to be converted into development tasks later.

### Potential Frontend Tasks

* <Frontend task 1>
* <Frontend task 2>
* <Frontend task 3>

### Potential Backend Tasks

* <Backend task 1>
* <Backend task 2>
* <Backend task 3>

### Potential Database Tasks

* <Database task 1>
* <Database task 2>

### Potential AI / PromptOps Tasks

* <AI task 1>
* <AI task 2>

### Potential QA Tasks

* <QA task 1>
* <QA task 2>

### Potential DevOps / Config Tasks

* <DevOps task 1>
* <DevOps task 2>

---

## ✅ Definition of Ready

A User Story is ready for development when:

* [ ] The user role is clearly identified.
* [ ] The user goal and business value are clear.
* [ ] Related FRD, Use Case and Business Rules are linked.
* [ ] Required permissions and ownership rules are identified.
* [ ] Relevant data entities are listed.
* [ ] Acceptance Criteria are written in Given / When / Then format.
* [ ] Edge cases are documented.
* [ ] Validation rules are clear.
* [ ] Out-of-scope items are explicit.
* [ ] Dependencies are known.
* [ ] UX states are identified.
* [ ] API expectations are known or marked as pending.
* [ ] Test scenarios are defined.
* [ ] PO / BA has reviewed the story.

---

## 🏁 Definition of Done

A User Story is done when:

* [ ] Functional behavior is implemented.
* [ ] Acceptance Criteria are satisfied.
* [ ] Backend authorization is enforced.
* [ ] Frontend route guards or UX restrictions are applied where needed.
* [ ] Validation rules are implemented on frontend and backend where applicable.
* [ ] Required API endpoints are implemented or updated.
* [ ] Database constraints or migrations are completed if needed.
* [ ] AI behavior follows human-in-the-loop rules if applicable.
* [ ] Error, empty, loading and success states are handled.
* [ ] Required tests are added or updated.
* [ ] Security and authorization negative cases are tested.
* [ ] i18n and currency behavior are considered where applicable.
* [ ] Accessibility basics are covered.
* [ ] Observability, logging or audit records are added where applicable.
* [ ] Documentation is updated if the contract, behavior or scope changed.
* [ ] PO / reviewer validates the story.
* [ ] Story is merged and available in the target environment.

---

## 📝 Notes

* <Additional clarification>
* <Open question>
* <Decision needed>
* <Implementation warning>
* <QA reminder>
