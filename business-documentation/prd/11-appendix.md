# 11. Appendix

> [Back to PRD Index](../PRD.md) | [Previous: Rollout Plan](10-rollout-plan.md)

---

## 11.1 Glossary

| Term | Definition |
|------|-----------|
| **Host** | The person creating and managing the event (couple, planner) |
| **Guest** | An invitee to the event |
| **Accomplice** | A trusted person with limited access to send live updates (best man, bridesmaid) |
| **Microsite** | The static invitation page served via CDN to guests |
| **Magic Link** | A one-time authentication token sent via email (passwordless login) |
| **Slug** | URL-friendly identifier for an event (e.g., `maria-y-juan-2026`) |
| **SSG** | Static Site Generator - service that generates HTML/CSS/JS per event |
| **JAMstack** | JavaScript, APIs, Markup - architecture pattern for static sites |
| **ULID** | Universally Unique Lexicographically Sortable Identifier |
| **RSVP** | Repondez s'il vous plait - guest response to invitation |
| **IKEA Effect** | Cognitive bias where users value things they've invested effort in creating |
| **MVP** | Minimum Viable Product - smallest feature set that delivers core value |
| **MoSCoW** | Prioritization method: Must have, Should have, Could have, Won't have |
| **NPS** | Net Promoter Score - measure of user satisfaction and loyalty |
| **MRR** | Monthly Recurring Revenue - predictable monthly income |
| **MAH** | Monthly Active Hosts - unique hosts who logged in during the month |

## 11.2 Competitive Matrix

| Feature | Aura | Zankyou | Bodas.net | WithJoy | Paperless Post |
|---------|------|---------|-----------|---------|----------------|
| Digital invitations | Yes | Yes | Yes | Yes | Yes |
| RSVP tracking | Yes | Yes | Yes | Yes | Yes |
| Guest management | Yes | Yes | Yes | Yes | No |
| Template customization | Yes | Yes | Yes | Yes | Yes |
| WhatsApp invitations | Yes | No | No | No | No |
| Live event updates | Yes | No | No | No | No |
| Accomplice mode | Yes | No | No | No | No |
| Swipe-to-send | Yes | No | No | No | No |
| Static site (fast) | Yes | No | No | No | No |
| One-time payment | Yes | No | No | Yes | No |
| Free draft mode | Yes | No | No | Yes | No |
| 30-day auto-delete | Yes | No | No | No | No |
| Gift registry | No (V3) | Yes | Yes | Yes | No |
| Photo upload | No (V3) | Yes | Yes | Yes | No |
| Multi-language | No (V2) | Yes | Yes | Yes | Yes |
| Vendor marketplace | No (V3) | Yes | Yes | No | No |

## 11.3 Open Decisions Log

| ID | Decision | Options | Status | Owner | Deadline |
|----|----------|---------|--------|-------|----------|
| D-01 | Accomplice onboarding flow | A: Link-only, B: Full account, C: Lightweight profile | Open | Product | Week 2 |
| D-02 | Template customization depth | Colors/fonts only vs. layout too | Open | Design | Week 2 |
| D-03 | Static site build pipeline | Razor templates vs. string interpolation | Open | Backend | Week 3 |
| D-04 | WhatsApp API provider | Direct Meta API vs. BSP (Twilio) | Open | Backend | Week 2 |
| D-05 | Encryption at rest | SQLCipher vs. application-level AES-256 | Open | Backend | Week 3 |
| D-06 | CDN provider | CloudFront vs. Cloudflare | Open | DevOps | Week 3 |
| D-07 | Hosting provider | Azure App Service vs. AWS vs. Railway | Open | DevOps | Week 3 |
| D-08 | Publishing price | EUR 19 vs. EUR 29 vs. tiered | Open | Product | Week 2 |
| D-09 | Number of launch templates | 3 vs. 5 | Open | Design | Week 2 |
| D-10 | RSVP form fields | Minimum (attendance) vs. comprehensive (all fields) | Open | UX | Week 2 |
| D-11 | Default message templates | 5 vs. 8 | Open | Product | Week 3 |
| D-12 | Calendar sync scope | Google only vs. Google + Apple + Outlook | Open | Frontend | Week 4 |
| D-13 | JWT storage | httpOnly cookie vs. Bearer token | Open | Backend | Week 3 |
| D-14 | Primary key type | ULID vs. GUID vs. integer | Open | Backend | Week 3 |
| D-15 | GDPR cookie banner | Required vs. not needed (no third-party cookies) | Open | Legal | Week 4 |
| D-16 | Background service architecture | Single BackgroundService vs. distributed queue | Open | Backend | Week 4 |
| D-17 | Error tracking tool | Sentry vs. Application Insights | Open | DevOps | Week 3 |
| D-18 | Onboarding wizard steps | Mandatory vs. skippable | Open | UX | Week 2 |

## 11.4 Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Backend API** | .NET 10 (ASP.NET Core Web API) | High performance, strong typing, excellent EF Core support |
| **Host Dashboard** | Angular 22 (Standalone components) | Enterprise-grade SPA, signals for reactive state, strict typing |
| **Guest Microsites** | Static HTML/JS/CSS (JAMstack) | Zero server cost per visit, CDN-cached, ultra-fast |
| **Accomplice Panel** | Angular 22 (embedded in dashboard) | Reuses host SPA infrastructure, token-based access |
| **Database** | SQLite + EF Core | Zero-ops, file-based, sufficient for MVP scale (<10K events) |
| **Authentication** | Magic links + JWT | Passwordless UX, reduced attack surface |
| **Email** | AWS SES | Cost-effective ($0.10/1K emails), high deliverability |
| **WhatsApp** | Meta Cloud API | Official channel, template messages, delivery receipts |
| **Payments** | Stripe | PCI-compliant, webhooks, one-time payments |
| **Maps** | Google Maps API | Embeds, geocoding, directions - generous free tier |
| **CDN** | CloudFront / Cloudflare | Static site distribution, HTTPS, edge caching |

## 11.5 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-08 | Senior Product Manager | Initial PRD creation |

## 11.6 Reference Documents

- Business Requirements: [Aura.MD](../Aura.MD)
- Technical Conventions: `conventions/technical-conventions.md`
- Git Conventions: `conventions/git-conventions.md`
- Technical Architecture Analysis: `.tmp/technical-architecture-analysis.md`
- PO Assistant Analysis: (generated during planning session)

---

> [Back to PRD Index](../PRD.md) | [Previous: Rollout Plan](10-rollout-plan.md)
