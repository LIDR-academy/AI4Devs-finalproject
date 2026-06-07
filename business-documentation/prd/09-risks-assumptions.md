# 9. Risks, Assumptions & Dependencies

> [Back to PRD Index](../PRD.md) | [Previous: Success Metrics](08-success-metrics.md) | [Next: Rollout Plan](10-rollout-plan.md)

---

## 9.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| WhatsApp API approval delays | Medium | High | Pre-submit templates 1 week before launch; email-only fallback for V1 | Backend |
| SQLite performance bottleneck at scale | Low | Medium | Monitor query performance; plan PostgreSQL migration at 10K MAU | Backend |
| Static site regeneration slow for large events | Low | Medium | Full regeneration for MVP (fast enough for <200 guests); optimize later | Frontend |
| Stripe webhook failures | Low | High | Idempotent webhook handlers; retry logic; manual reconciliation dashboard | Backend |
| CDN cache not invalidating properly | Medium | Medium | File-based cache busting (timestamp in filename); manual invalidation endpoint | DevOps |
| Magic link email delivery failures | Medium | Medium | AWS SES bounce handling; retry with alternative email if available | Backend |

## 9.2 Business Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| Low draft-to-publish conversion rate | Medium | High | Optimize paywall UX; offer limited-time discount; A/B test pricing | Product |
| Competitor copies Live Guest Journey | Medium | Medium | Build brand loyalty; iterate quickly; patent swipe-to-confirm UX if possible | Product |
| Pricing too high for Spanish market | Medium | High | Research competitor pricing; A/B test EUR 19 vs. EUR 29; offer early-bird discount | Product |
| Insufficient marketing reach | High | High | Partner with wedding planners; SEO optimization; social media presence | Marketing |
| Seasonal demand (wedding season peaks) | High | Medium | Auto-scaling infrastructure; load testing before peak season | DevOps |

## 9.3 Operational Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| GDPR non-compliance | Low | Critical | Engage legal counsel early; implement data protection by design; DPA with vendors | Legal |
| AWS SES sandbox limits during testing | High | Low | Request production access early; use Mailtrap for development | DevOps |
| WhatsApp template rejection by Meta | Medium | High | Submit templates early; have fallback email templates; follow Meta guidelines | Product |
| Data breach (PII exposure) | Low | Critical | Application-level encryption; least-privilege access; regular security audits | Security |
| Key personnel dependency | Medium | Medium | Documentation; code reviews; knowledge sharing; cross-training | Engineering |

## 9.4 Key Assumptions

| # | Assumption | Validation Plan |
|---|-----------|-----------------|
| A1 | Couples are willing to pay EUR 19-29 for digital invitations | Survey 50 engaged couples; A/B test pricing at launch |
| A2 | Guests will RSVP via a mobile web form (no app) | Usability testing with 10 guests; measure completion rate |
| A3 | WhatsApp is the preferred communication channel for Spanish weddings | Market research; survey target audience |
| A4 | Accomplices (best man/bridesmaid) will actively use the live panel | Interviews with 10 recent wedding party members |
| A5 | SQLite is sufficient for <10K events | Load testing; monitor query performance; set migration trigger |
| A6 | 30-day data deletion is acceptable to users | Include in Terms of Service; survey user acceptance |
| A7 | Static sites load in <2s on mobile 3G | Lighthouse testing; RUM monitoring post-launch |

## 9.5 External Dependencies

| Dependency | Provider | Status | Impact if Unavailable |
|-----------|----------|--------|----------------------|
| WhatsApp Business API | Meta | Approval needed | Cannot send WhatsApp invitations or live messages |
| AWS SES | Amazon | Sandbox -> Production request needed | Cannot send emails (magic links, invitations) |
| Stripe | Stripe | Account setup needed | Cannot process payments (publishing paywall) |
| Google Maps API | Google | API key needed | Cannot embed maps or provide directions |
| CDN | CloudFront/Cloudflare | Setup needed | Static sites served from origin (slower) |
| Domain & SSL | Registrar | DNS configuration needed | Cannot serve sites over HTTPS |

---

> [Back to PRD Index](../PRD.md) | [Previous: Success Metrics](08-success-metrics.md) | [Next: Rollout Plan](10-rollout-plan.md)
