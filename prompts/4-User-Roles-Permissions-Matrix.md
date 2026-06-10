# AAA Prompt — Generate User Roles & Permissions Matrix for EventFlow

## ACT — Role and Context

You are a Senior Business Analyst, Product Manager, Access Control Analyst, and Functional Documentation Specialist.

You are working on **EventFlow**, an AI-assisted event planning and vendor management platform.

EventFlow helps event organizers create event plans, generate AI-assisted checklists, manage budgets, discover vendors, request quotes, compare vendor responses, and track event progress.

The MVP must be built as an **AI-assisted event planning workspace** with a simplified vendor quote flow. It must **not** become a full transactional marketplace in v1.

You must generate a formal **User Roles & Permissions Matrix** document based only on the existing project documentation located in:

- `/docs/1-Domain-Discovery-Report.md`
- `/docs/2-Product-Owner-Decisions.md`
- `/docs/3-MVP-Scope-Definition.md`
- `/docs/4-Business-Rules-Document.md`

These documents are the source of truth.

Do not invent permissions that contradict the existing scope or business rules.

If a permission is not explicitly defined but can be reasonably inferred, mark it as **Derived** or **Recommended**.

If a permission belongs to a future version, clearly classify it as **Future** or **Out of Scope for MVP**.

---

## AIM — Objective

Generate a complete **User Roles & Permissions Matrix** document for EventFlow.

The document must define:

- System roles included in the MVP.
- Role responsibilities.
- Permissions by module and entity.
- Ownership rules.
- Access rules.
- Admin governance permissions.
- Future roles and future permissions.
- Out-of-scope permissions for the MVP.
- High-level authorization rules that the development team and QA can use.

The document must help the team answer:

- Who can do what?
- Who owns each resource?
- Who can view, create, update, delete, approve, reject, moderate, or respond?
- Which permissions are MVP?
- Which permissions are future?
- Which permissions are explicitly out of scope?

The output must be precise enough to support:

- FRD generation.
- Use case generation.
- User story generation.
- Backend authorization rules.
- Frontend route guards.
- QA test scenarios.
- Acceptance criteria.
- Admin workflow validation.

---

## ACTION — Instructions

Read and analyze the following source documents:

1. `/docs/1-Domain-Discovery-Report.md`
2. `/docs/2-Product-Owner-Decisions.md`
3. `/docs/3-MVP-Scope-Definition.md`
4. `/docs/4-Business-Rules-Document.md`

Then generate the document:

```text
/docs/5-User-Roles-Permissions-Matrix.md
````

The output must be written in **Spanish LATAM**.

Use a professional Product / Business Analyst tone.

Use tables extensively.

Clearly separate:

* MVP roles
* Future roles
* Out-of-scope role capabilities
* Permissions by module
* Permissions by entity
* Ownership and access rules

---

## Required Output Structure

Generate the document using this exact structure:

```markdown
# EventFlow — User Roles & Permissions Matrix

## 1. Propósito del documento

## 2. Alcance del documento

## 3. Fuentes utilizadas

## 4. Principios de autorización del MVP

## 5. Roles incluidos en el MVP

### 5.1 Organizador
### 5.2 Proveedor
### 5.3 Administrador

## 6. Roles futuros o fuera de alcance

### 6.1 Colaborador de evento
### 6.2 Super Admin
### 6.3 Moderador especializado
### 6.4 Proveedor multiusuario / equipo de proveedor
### 6.5 Invitado del evento

## 7. Resumen de responsabilidades por rol

## 8. Matriz general de permisos por módulo

## 9. Matriz de permisos por entidad

### 9.1 User
### 9.2 Role
### 9.3 Event
### 9.4 EventType
### 9.5 EventTask
### 9.6 Budget
### 9.7 BudgetItem
### 9.8 VendorProfile
### 9.9 VendorService
### 9.10 ServiceCategory
### 9.11 QuoteRequest
### 9.12 Quote
### 9.13 BookingIntent
### 9.14 Review
### 9.15 Notification
### 9.16 AIRecommendation
### 9.17 Location
### 9.18 Attachment
### 9.19 AdminAction

## 10. Reglas de propiedad y acceso

## 11. Reglas de permisos para el organizador

## 12. Reglas de permisos para el proveedor

## 13. Reglas de permisos para el administrador

## 14. Permisos sobre funcionalidades de IA

## 15. Permisos sobre cotizaciones y booking intent

## 16. Permisos sobre reseñas y moderación

## 17. Permisos sobre idioma, moneda y configuración

## 18. Permisos sobre datos seed y demo

## 19. Reglas de autorización para rutas y pantallas

## 20. Reglas de autorización para API/backend

## 21. Permisos explícitamente fuera de alcance del MVP

## 22. Matriz CRUD consolidada

## 23. Matriz RACI simplificada

## 24. Escenarios de validación para QA

## 25. Preguntas abiertas o decisiones pendientes

## 26. Resumen final
```

---

## Permission Notation

Use the following permission notation:

| Code | Meaning          |
| ---- | ---------------- |
| C    | Create           |
| R    | Read/View        |
| U    | Update/Edit      |
| D    | Delete           |
| A    | Approve          |
| X    | Reject           |
| M    | Moderate         |
| S    | Send/Submit      |
| RESP | Respond          |
| COMP | Compare          |
| OWN  | Own resource     |
| SIM  | Simulated action |
| N/A  | Not allowed      |

Use this scope notation:

| Scope     | Meaning                          |
| --------- | -------------------------------- |
| Own       | Only resources owned by the user |
| Assigned  | Resources assigned to the user   |
| Public    | Public/approved data             |
| All       | All platform data                |
| Seed/Demo | Seed or demo data                |
| Future    | Future version only              |
| N/A       | Not applicable                   |

Use this status notation:

| Status       | Meaning                             |
| ------------ | ----------------------------------- |
| MVP          | Included in MVP                     |
| Future       | Planned for future version          |
| Out of Scope | Explicitly excluded from MVP        |
| Recommended  | Recommended but should be confirmed |

---

## MVP Roles to Include

The MVP must include these roles:

### Organizer

The organizer is the user who creates and manages events.

The organizer should be able to:

* Create their own events.
* View their own events.
* Edit their own events.
* Generate AI-assisted plans for their own events.
* Generate AI-assisted checklists for their own events.
* Manage checklist tasks for their own events.
* Manage budget and budget items for their own events.
* View approved vendor profiles.
* Send quote requests to approved vendors.
* View quotes received for their own events.
* Compare quotes received for their own events.
* Create a simulated booking intent from a valid quote.
* Create reviews when allowed by business rules.
* View their own notifications.
* Change language preference or use app language options.
* Use currency display at event level.

The organizer must not be able to:

* View or edit events owned by other organizers.
* Approve vendors.
* Manage service categories.
* Moderate reviews.
* Respond as a vendor unless they also have a vendor role in a future version.
* Access admin features.
* Process payments.

### Vendor

The vendor is the user who offers event-related services.

The vendor should be able to:

* Create or manage their own vendor profile.
* Manage their own vendor services or packages.
* View quote requests addressed to their vendor profile.
* Respond to quote requests addressed to them.
* View their own quote history.
* View their own reviews.
* Receive notifications related to their vendor profile.
* Optionally use AI assistance to generate profile or quote text if included in MVP or marked as Could Have.

The vendor must not be able to:

* View quote requests addressed to other vendors.
* View private event details unless included in a quote request brief.
* Edit client events.
* Approve their own vendor profile.
* Moderate reviews.
* Access admin features.
* Process real payments in MVP.

### Admin

The admin is responsible for demo governance, platform quality, and basic moderation.

The admin should be able to:

* View platform users relevant to demo/admin operations.
* Manage service categories.
* Manage event types if included in MVP.
* Approve, reject, or hide vendor profiles.
* View vendor profiles.
* Moderate or remove offensive reviews/comments.
* View admin dashboard or demo data.
* Manage seed/demo data if included in the scope.
* View quote/request data for support or demo purposes if explicitly allowed.
* View or create AdminAction logs, or have actions logged automatically.

The admin must not be treated as a normal marketplace participant unless explicitly using a demo account.

---

## Future or Out-of-Scope Roles

Document these roles as future or out-of-scope unless the source documents explicitly include them:

* Event collaborator
* Co-organizer
* Family member collaborator
* Super Admin
* Dedicated moderator
* Vendor team member
* Guest/invitee
* Payment manager
* Finance/accounting user
* External auditor

For each future role, include:

* Description
* Why it is useful
* Why it is not part of the MVP
* Possible permissions in a future version

---

## Key Authorization Principles

The document must include these principles:

1. **Ownership-based access:** Users can only manage resources they own or that are assigned to them.
2. **Least privilege:** Each role receives only the permissions needed for the MVP.
3. **Human-in-the-loop for AI:** AI suggestions require user confirmation before becoming official data.
4. **Admin-controlled moderation:** Admin can moderate content manually in the MVP.
5. **No real payments:** No role can process payments, commissions, invoices, or refunds in the MVP.
6. **No WhatsApp integration:** No role can trigger WhatsApp-based workflows in the MVP.
7. **No native mobile role-specific permissions:** The MVP is web responsive only.
8. **Vendor approval required:** Vendor profiles must be approved before appearing in public search.
9. **Quote visibility restriction:** Vendors can only see quote requests addressed to them.
10. **Event privacy:** Organizers cannot see other organizers’ private events.

---

## Required Permission Areas

The permissions matrix must cover at minimum:

### Authentication and account

* Register
* Login
* Logout
* View own profile
* Edit own profile
* Change language
* Change currency preference if applicable

### Events

* Create event
* View own event
* Edit own event
* Delete/cancel own event
* Change event status
* View event dashboard

### AI features

* Generate event plan
* Accept AI plan
* Edit AI plan
* Reject AI plan
* Generate checklist
* Accept AI checklist
* Edit AI-generated tasks
* Generate budget suggestion
* Accept/edit budget suggestion
* Generate quote brief
* Generate quote comparison summary
* Use MockAIProvider in demo/testing

### Checklist and tasks

* Create task
* View task
* Edit task
* Delete task
* Change task status
* View event progress

### Budget

* Create budget
* View budget
* Edit budget
* Create budget item
* Edit budget item
* View warnings
* View committed amount

### Vendor directory

* View approved vendors
* Filter vendors
* View vendor profile
* Save/favorite vendor if included
* Create vendor profile
* Edit own vendor profile
* Submit vendor profile for approval
* Approve/reject vendor profile
* Hide vendor profile

### Services and categories

* View service categories
* Manage service categories
* Create vendor service
* Edit own vendor service
* Delete own vendor service
* Assign vendor service to category

### Quote flow

* Create quote request
* View own quote requests
* View assigned quote requests
* Respond to quote request
* Edit quote response before submission if applicable
* View quote comparison
* Mark quote as preferred
* Create booking intent

### Booking intent

* Create simulated booking intent
* View own booking intents
* Confirm booking intent if vendor-side confirmation exists
* Cancel booking intent
* Process payment — must be Out of Scope

### Reviews and moderation

* Create review
* View public reviews
* View own reviews
* Edit own review if allowed
* Delete own review if allowed
* Hide/remove offensive review
* AI sentiment moderation — must be Future/Out of Scope

### Notifications

* View own notifications
* Mark notification as read
* Trigger in-app notification
* Trigger simulated email notification
* Trigger WhatsApp notification — Out of Scope

### Admin

* Manage categories
* Manage vendors
* Moderate reviews
* View demo data
* Manage seed/demo data
* View admin logs
* Export data — Future unless source documents include it

---

## Matrix Requirements

Include at least these tables:

### 1. Role Summary Table

| Role | Description | MVP/Future | Main responsibility | Access scope |
| ---- | ----------- | ---------- | ------------------- | ------------ |

### 2. Module Permission Matrix

| Module | Organizer | Vendor | Admin | Notes |
| ------ | --------- | ------ | ----- | ----- |

### 3. Entity CRUD Matrix

| Entity | Organizer | Vendor | Admin | Notes |
| ------ | --------- | ------ | ----- | ----- |

### 4. AI Permissions Matrix

| AI Feature | Organizer | Vendor | Admin | MVP/Future | Human validation required |
| ---------- | --------- | ------ | ----- | ---------- | ------------------------- |

### 5. Quote Flow Permissions Matrix

| Action | Organizer | Vendor | Admin | Rule |
| ------ | --------- | ------ | ----- | ---- |

### 6. Review Moderation Permissions Matrix

| Action | Organizer | Vendor | Admin | Rule |
| ------ | --------- | ------ | ----- | ---- |

### 7. Out-of-Scope Permissions Matrix

| Permission | Role impacted | Reason excluded from MVP | Future consideration |
| ---------- | ------------- | ------------------------ | -------------------- |

### 8. Route/Screen Authorization Matrix

| Screen / Route | Organizer | Vendor | Admin | Access rule |
| -------------- | --------- | ------ | ----- | ----------- |

### 9. API Authorization Matrix

| API Resource | Organizer | Vendor | Admin | Authorization rule |
| ------------ | --------- | ------ | ----- | ------------------ |

### 10. QA Validation Matrix

| Scenario | Expected authorization behavior | Priority |
| -------- | ------------------------------- | -------- |

---

## Route / Screen Suggestions

Use these routes as references if applicable. Mark as recommendation if not explicitly defined:

```text
/login
/register
/dashboard
/events
/events/new
/events/:eventId
/events/:eventId/plan
/events/:eventId/checklist
/events/:eventId/budget
/vendors
/vendors/:vendorId
/quotes
/quotes/:quoteRequestId
/vendor/dashboard
/vendor/profile
/vendor/services
/vendor/quotes
/admin/dashboard
/admin/categories
/admin/vendors
/admin/reviews
/admin/demo-data
```

Do not treat these routes as final technical architecture. They are functional authorization suggestions.

---

## API Authorization Suggestions

Use these resources as references if applicable. Mark as recommendation if not explicitly defined:

```text
/auth
/users
/events
/event-tasks
/budgets
/vendors
/vendor-services
/service-categories
/quote-requests
/quotes
/booking-intents
/reviews
/notifications
/ai
/admin
```

Do not over-specify implementation details. Keep the focus on authorization behavior.

---

## Quality Requirements

The document must:

* Be written in Spanish LATAM.
* Be formal and structured.
* Be consistent with all source documents.
* Avoid contradictory permissions.
* Clearly separate MVP permissions from future permissions.
* Clearly identify out-of-scope permissions.
* Be useful for QA, development, FRD, use cases, and acceptance criteria.
* Avoid overengineering.
* Avoid turning EventFlow into a full marketplace.
* Use clear and testable authorization language.
* Include enough detail to derive backend authorization and frontend route guards later.

---

## Final Validation Before Output

Before finalizing the document, verify:

1. Each MVP role has a clear responsibility.
2. Every major MVP module has permissions.
3. Organizer permissions are limited to owned events.
4. Vendor permissions are limited to own profile and assigned quote requests.
5. Admin permissions include category/vendor/review moderation.
6. AI permissions include human validation.
7. Real payments are explicitly out of scope.
8. WhatsApp permissions are explicitly out of scope.
9. Native mobile permissions are explicitly out of scope.
10. Multi-collaborator event access is future scope.
11. Quote visibility rules are clear.
12. Vendor approval rules are clear.
13. Seed/demo data permissions are defined.
14. No permission contradicts the Business Rules Document.

---

## Final Instruction

Generate the full **EventFlow — User Roles & Permissions Matrix** now and save it as:

```text
/docs/5-User-Roles-Permissions-Matrix.md
```