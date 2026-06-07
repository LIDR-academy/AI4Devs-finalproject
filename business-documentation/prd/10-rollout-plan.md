# 10. Rollout Plan

> [Back to PRD Index](../PRD.md) | [Previous: Risks & Assumptions](09-risks-assumptions.md) | [Next: Appendix](11-appendix.md)

---

## 10.1 Phased Rollout

| Phase | Timeline | Users | Goals | Success Criteria |
|-------|----------|-------|-------|-----------------|
| **Alpha** | Week 1-3 | Internal team (5-10) | Validate core flows, identify critical bugs | Zero P0/P1 bugs; all user stories pass |
| **Beta** | Week 4-7 | 50 engaged couples | Validate conversion funnel, gather NPS feedback | > 20% conversion; NPS > 40; < 5% error rate |
| **GA** | Week 8+ | Public (Spain) | Achieve 500 MAH by Month 3 | > 25% conversion; NPS > 50; EUR 4,500 MRR |

## 10.2 Alpha (Internal Testing)

| Aspect | Detail |
|--------|--------|
| **Duration** | 2 weeks |
| **Users** | Internal team (5-10 people) |
| **Scope** | Full MVP feature set |
| **Goals** | Validate core flows, identify critical bugs, test performance |
| **Success Criteria** | Zero P0/P1 bugs; all user stories pass acceptance criteria |
| **Rollback Criteria** | Any data loss, security vulnerability, or critical flow broken |

## 10.3 Beta (Closed Beta)

| Aspect | Detail |
|--------|--------|
| **Duration** | 3 weeks |
| **Users** | 50 engaged couples (recruited via social media, wedding forums) |
| **Scope** | Full MVP + analytics tracking |
| **Goals** | Validate conversion funnel, gather NPS feedback, test at scale |
| **Success Criteria** | > 20% draft-to-publish conversion; NPS > 40; < 5% API error rate |
| **Rollback Criteria** | Conversion < 10%; NPS < 20; critical user complaints |
| **Feature Flags** | Live Guest Journey (on/off); WhatsApp invitations (on/off) |

## 10.4 General Availability (GA)

| Aspect | Detail |
|--------|--------|
| **Duration** | Ongoing |
| **Users** | Public (Spain, Spanish language) |
| **Scope** | Full MVP + marketing campaign |
| **Goals** | Achieve 500 MAH (Monthly Active Hosts) by Month 3 |
| **Success Criteria** | > 25% draft-to-publish conversion; NPS > 50; EUR 4,500 MRR by Month 3 |
| **Rollback Criteria** | Revenue < EUR 1,000 by Month 2; critical security issue |

## 10.5 Feature Flags

| Feature | Flag | Default | Rollout Strategy |
|---------|------|---------|-----------------|
| Live Guest Journey | `feature.live-journey` | Off (Alpha) -> On (Beta) | Gradual rollout to 50% of beta users |
| WhatsApp Invitations | `feature.whatsapp` | Off (Alpha) -> On (Beta) | Requires WhatsApp API approval |
| Gift Registry | `feature.gift-registry` | Off | V3 feature; not enabled in MVP |
| Photo Upload | `feature.photo-upload` | Off | V3 feature; not enabled in MVP |
| Calendar Sync | `feature.calendar-sync` | On | Enabled at launch |

## 10.6 Rollback Criteria

| Trigger | Action |
|---------|--------|
| Data loss or corruption | Immediate rollback to last known good state; notify affected users |
| Security vulnerability | Hotfix within 24 hours; rollback if fix not ready |
| API error rate > 10% for 30 minutes | Investigate; rollback if root cause is recent deployment |
| WhatsApp delivery rate < 80% | Disable WhatsApp feature; fall back to email only |
| Payment processing failures > 5% | Investigate Stripe integration; rollback if code issue |
| NPS < 20 during beta | Pause launch; investigate user feedback; iterate |

---

> [Back to PRD Index](../PRD.md) | [Previous: Risks & Assumptions](09-risks-assumptions.md) | [Next: Appendix](11-appendix.md)
