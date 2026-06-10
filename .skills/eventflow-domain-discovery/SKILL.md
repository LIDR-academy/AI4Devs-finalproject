---
name: eventflow-domain-discovery
description: Defines the business domain, MVP scope, AI opportunities, user journeys, domain entities, business rules, risks, and strategic recommendations for EventFlow, an AI-assisted event planning and vendor management platform. Use this skill for discovery, product definition, domain analysis, MVP planning, business analysis, and AI-assisted software development documentation for EventFlow.
license: MIT
metadata:
  author: Walter Cordero
  version: "1.0.0"
  project: "EventFlow"
  language: "Spanish LATAM"
---

# EventFlow Domain Discovery Skill

## Purpose

Use this skill to perform the Discovery Phase for **EventFlow**, an AI-assisted event planning and vendor management platform.

EventFlow is intended to be:

1. An academic final project for a Master’s program in AI-assisted Software Development.
2. A portfolio-quality software product.
3. A realistic MVP that could later become a commercial product.

The discovery output must help the product team define:

- Product vision
- Domain understanding
- MVP scope
- User segments
- Jobs To Be Done
- Business processes
- Domain entities
- Business rules
- AI opportunities
- Risks
- Success metrics
- Open product questions

---

## Product Context

EventFlow helps people organize social and personal events such as:

- Weddings
- Birthdays
- XV años / quinceañeras
- Baptisms
- Baby showers
- Graduations
- Corporate or social gatherings
- Small private celebrations

The platform should help event organizers:

- Create an event plan
- Generate checklists
- Manage tasks
- Control budget
- Discover vendors
- Request and compare quotes
- Track event progress

The platform should also support vendors such as:

- Catering providers
- Decoration providers
- Photographers
- Videographers
- DJs
- Venues
- Furniture rental providers
- Florists
- Cake and dessert providers
- Makeup and styling providers
- Entertainment providers
- Transportation providers
- Event planners

Long-term vision:

> EventFlow may become a marketplace and productivity platform for both event organizers and vendors.

Initial MVP vision:

> EventFlow should start as an AI-assisted event planning workspace, not as a full marketplace.

---

## Strategic Hypothesis

When performing discovery, validate or challenge this hypothesis:

> EventFlow is more viable if it starts as an AI-assisted planning workspace before becoming a full vendor marketplace.

The MVP should help users go from:

```text
“I want to organize an event”
````

to:

```text
“I have a structured event plan, checklist, budget, and vendor request flow”
```

in a few minutes.

The first version should focus on:

* AI-generated event planning
* AI-generated checklist
* Budget structure
* Recommended vendor categories
* Basic vendor directory
* Basic quote request flow
* Basic vendor response flow

The first version should avoid:

* Complex marketplace logic
* Real payments
* Legal contracts
* Full real-time chat
* Native mobile apps
* Advanced geolocation
* Commission management
* Complex tax or invoice handling
* Automated vendor verification

---

## When To Use This Skill

Use this skill when the user asks to:

* Define EventFlow’s domain
* Research the event planning market
* Analyze business viability
* Define MVP scope
* Generate a Discovery Report
* Identify domain entities
* Define business rules
* Analyze users and vendors
* Create Jobs To Be Done
* Define AI opportunities
* Compare competitors
* Identify risks
* Recommend product direction
* Prepare documentation for an AI-assisted software development project

---

## Discovery Method

When generating a discovery artifact, structure the analysis around these areas:

1. Domain overview
2. Market and competitor context
3. Target users
4. Jobs To Be Done
5. Business processes
6. Domain entities
7. Business rules
8. MVP scope
9. AI opportunities
10. Risks
11. Success metrics
12. Feature prioritization
13. Strategic recommendation
14. Product owner open questions
15. Domain glossary
16. Sources consulted, when research is used

---

## Research Requirements

When external research is available, use recent and reliable sources.

Prioritize:

* Official competitor websites
* Market research summaries
* Industry reports
* Product documentation
* Startup/product analysis
* Event planning platforms
* Wedding planning platforms
* Vendor marketplaces
* Local service marketplaces
* Event management SaaS tools

Do not invent:

* Market size
* Growth percentages
* Competitor features
* Regional adoption claims
* Legal or payment requirements

Clearly separate:

* Confirmed facts
* Reasonable assumptions
* Product hypotheses
* Open questions

---

## Output Language

Unless the user requests otherwise, return all outputs in:

> Spanish LATAM

Use clear, professional, practical language.

Avoid excessive academic theory.

Focus on usefulness for product definition and software development.

---

## Required Output Structure

When the user asks for a complete discovery report, use this structure:

# EventFlow — Domain Discovery Report

## 1. Resumen Ejecutivo
## 2. Descripción del Dominio
## 3. Contexto de Mercado y Competidores
## 4. Usuarios Objetivo
## 5. Jobs To Be Done
## 6. Procesos de Negocio
## 7. Entidades del Dominio
## 8. Reglas de Negocio
## 9. Alcance Recomendado del MVP
## 10. Oportunidades de IA
## 11. Riesgos y Mitigaciones
## 12. Métricas de Éxito
## 13. Priorización de Features
## 14. Recomendación Estratégica
## 15. Preguntas Abiertas para el Product Owner
## 16. Glosario del Dominio
## 17. Fuentes Consultadas
```

---

## Domain Overview Instructions

Explain:

* How event planning works
* Common event types
* Typical event lifecycle
* Main actors
* Common services required
* How clients find vendors
* How vendors manage requests, quotes, bookings, and schedules
* Pain points for clients
* Pain points for vendors
* Differences between informal event planning and professional event planning

Keep the explanation practical and connected to product design.

---

## Target Users

Analyze these users:

### Event Organizer

A person who wants to organize an event and needs guidance, structure, vendors, budget control, and task management.

Analyze:

* Goals
* Needs
* Frustrations
* Budget sensitivity
* Trust concerns
* Emotional stress points
* Jobs To Be Done
* Decision criteria

### Vendor / Service Provider

A professional, freelancer, small business, or company that provides event-related services.

Analyze:

* Goals
* Needs
* Frustrations
* Sales challenges
* Operational challenges
* Reputation needs
* Lead management issues
* Quote response process
* Availability management

### Platform Admin

A user responsible for keeping the platform organized and trustworthy.

Analyze:

* Goals
* Responsibilities
* Category management
* Vendor quality control
* Moderation needs
* Platform integrity concerns

---

## Jobs To Be Done Format

Use this format:

```text
When [situation],
I want to [motivation],
so I can [expected outcome].
```

For a full discovery report, include at least:

* 6 JTBD for event organizers
* 6 JTBD for vendors
* 4 JTBD for admins

Make each JTBD specific, realistic, and directly related to EventFlow.

---

## Business Processes

Analyze these core processes:

* Event creation
* AI-assisted event planning
* Checklist generation
* Budget planning
* Vendor discovery
* Quote request
* Quote response
* Quote comparison
* Booking intent
* Event progress tracking
* Vendor onboarding
* Admin category management
* Admin vendor management

For each process include:

* Trigger
* Actors
* Input
* Main steps
* Output
* Key business rules
* MVP relevance

---

## Domain Entities

Analyze these entities:

* User
* Role
* Event
* EventType
* EventTask
* Budget
* BudgetItem
* VendorProfile
* VendorService
* ServiceCategory
* QuoteRequest
* Quote
* BookingIntent
* Review
* Notification
* AIRecommendation
* Location
* Availability
* Attachment
* AdminAction

For each entity include:

* Description
* Key attributes
* Main relationships
* MVP or future classification
* Reason for inclusion or deferral

If a missing entity is important, propose it.

---

## Business Rules

Define MVP and future business rules for:

* Event ownership
* Event status
* Checklist task status
* Budget calculation
* Vendor visibility
* Quote requests
* Quote expiration
* Quote responses
* Booking intent
* Reviews
* Notifications
* Admin approval
* User permissions
* AI-generated suggestions

Important rule:

> AI-generated suggestions must require user validation before becoming official event data.

---

## MVP Scope Guidelines

The MVP should include:

* Authentication
* Event creation
* AI event plan generation
* AI checklist generation
* Budget categories
* Vendor directory
* Vendor profiles
* Quote requests
* Quote responses
* Quote comparison
* Event progress dashboard
* Admin category management
* Admin vendor management

The MVP should exclude:

* Real payments
* Legal contracts
* Full real-time chat
* Native mobile apps
* Advanced geolocation
* Complex logistics
* Automated vendor verification
* Commission management
* Complex tax or invoice handling

The MVP may simulate:

* Payments
* Booking confirmation
* Vendor verification
* Notifications
* Vendor availability
* Vendor quote responses

---

## AI Opportunity Guidelines

Analyze AI use cases such as:

* Event plan generation
* Checklist generation
* Budget suggestions
* Vendor category recommendations
* Quote comparison
* Message generation
* Task prioritization
* Event summary
* Vendor profile generation

For each AI use case include:

* Problem solved
* Required input
* Expected output
* Business value
* MVP feasibility
* Risk
* Human validation required
* MVP or future recommendation

AI should assist decisions, not fully automate high-trust decisions.

---

## Risk Analysis Format

For each risk include:

```text
Risk:
Description:
Impact: Low / Medium / High
Probability: Low / Medium / High
Mitigation:
MVP or future impact:
```

Consider:

* Product risk
* Technical risk
* Business risk
* Marketplace risk
* Trust and safety risk
* Data privacy risk
* AI risk
* MVP scope risk
* Vendor quality risk
* Adoption risk

---

## Success Metrics

Define metrics across:

### Product

* Events created
* Checklists generated
* Quote requests created
* Vendor responses received
* Event progress percentage
* User activation rate

### Vendor

* Active vendors
* Quote response rate
* Average response time
* Vendor profile completion

### AI

* AI plan acceptance rate
* Checklist usefulness
* Recommendation acceptance rate
* AI output edit rate
* User satisfaction with AI suggestions

### Technical

* Availability
* Response time
* Error rate
* Test coverage
* AI response latency

---

## Feature Prioritization

Use this scale:

```text
Must Have / Should Have / Could Have / Won’t Have for MVP
```

Prioritize at least:

* Event creation
* AI plan generation
* AI checklist generation
* Budget categories
* Vendor directory
* Vendor profiles
* Quote requests
* Quote responses
* Quote comparison
* Admin category management
* Admin vendor management
* Notifications
* Reviews
* Real payments
* Real-time chat
* Mobile app
* Advanced marketplace monetization

---

## Strategic Recommendation Requirements

Always provide a clear recommendation.

Answer:

1. Is EventFlow viable?
2. Is it suitable for an academic final project?
3. Is it suitable as a portfolio project?
4. Is it realistic as a future commercial MVP?
5. Should it start as an AI planning workspace or as a full marketplace?
6. What should be avoided in v1?
7. What is the strongest differentiator?
8. How should AI be used without overcomplicating the product?
9. What is the recommended positioning?
10. What is the next step after discovery?

Use this format:

```text
Recommendation: Build / Do not build / Build with constraints
```

Also include:

```text
Recommended MVP positioning:
EventFlow should start as a [type of product] for [target user] who need to [main job], using AI to [main AI value], while keeping [main human-controlled process] under user control.
```

Default recommendation hypothesis:

> Build with constraints. Start with an AI-assisted event planning workspace and a simplified vendor quote flow. Do not start as a full marketplace.

This default recommendation can be challenged if research evidence suggests otherwise.

---

## Quality Bar

Every output should be:

* Practical
* Structured
* Clear
* Useful for software development
* Focused on MVP feasibility
* Honest about risks
* Clear about assumptions
* Avoidant of overengineering

Do not produce generic product advice.

Do not expand the MVP unnecessarily.

Do not suggest complex features unless clearly marked as future scope.