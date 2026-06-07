# 8. Success Metrics & KPIs

> [Back to PRD Index](../PRD.md) | [Previous: Work Breakdown](07-work-breakdown.md) | [Next: Risks & Assumptions](09-risks-assumptions.md)

---

## 8.1 Activation Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Registration Completion Rate** | % of users who enter email and verify via magic link | > 70% | Analytics funnel |
| **Event Creation Rate** | % of registered users who create at least one event | > 60% | Analytics funnel |
| **Onboarding Completion Rate** | % of users who complete the onboarding wizard | > 50% | Analytics funnel |
| **Time-to-First-Event** | Median time from registration to first event creation | < 10 minutes | Analytics |

## 8.2 Conversion Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Draft to Publish Conversion** | % of draft events that are published (paid) | > 25% | Analytics + Stripe |
| **Average Guests per Event** | Mean number of guests per published event | > 80 | Database query |
| **Publish Revenue per Event** | Average revenue per published event | EUR 25-29 | Stripe data |
| **Time-to-Publish** | Median time from event creation to publishing | < 30 minutes | Analytics |

## 8.3 Engagement Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **RSVP Response Rate** | % of invited guests who submit an RSVP | > 70% | Database query |
| **RSVP Completion Time** | Median time from invitation to RSVP submission | < 48 hours | Database query |
| **WhatsApp Delivery Rate** | % of WhatsApp messages successfully delivered | > 95% | WhatsApp webhook data |
| **Email Open Rate** | % of emails opened (via tracking pixel) | > 60% | SES tracking |
| **Live Messages per Event** | Average number of live messages sent per event | > 5 | Database query |

## 8.4 Quality Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Microsite Load Time** | 95th percentile load time on mobile 3G | < 2 seconds | Lighthouse / RUM |
| **API Error Rate** | % of API requests returning 5xx errors | < 1% | Monitoring |
| **RSVP Form Error Rate** | % of RSVP submissions that fail validation | < 5% | Analytics |
| **NPS Score** | Net Promoter Score from post-event survey | > 50 | Survey tool |

## 8.5 Business Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Monthly Active Hosts** | Unique hosts who logged in this month | 500 (Month 3) | Analytics |
| **Monthly Published Events** | Events published per month | 150 (Month 3) | Database query |
| **Monthly Recurring Revenue** | Revenue from publishing fees | EUR 4,500 (Month 3) | Stripe data |
| **Customer Acquisition Cost** | Marketing spend / new registered users | < EUR 5 | Marketing analytics |
| **Churn Rate** | % of hosts who don't create a second event (N/A for weddings) | N/A (single-use) | - |

---

> [Back to PRD Index](../PRD.md) | [Previous: Work Breakdown](07-work-breakdown.md) | [Next: Risks & Assumptions](09-risks-assumptions.md)
