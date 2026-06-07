# 3. User Personas

> [Back to PRD Index](../PRD.md) | [Previous: Problem Statement](02-problem-opportunity.md) | [Next: Vision & Strategy](04-vision-strategy.md)

---

## 3.1 Persona 1: Maria & Juan — The Couple (Host)

| Attribute | Detail |
|-----------|--------|
| **Age** | 29 & 31 |
| **Location** | Madrid, Spain |
| **Occupation** | Maria: Marketing Manager; Juan: Software Engineer |
| **Tech Savviness** | High — both use smartphones daily, comfortable with SaaS |
| **Wedding Budget** | EUR 28,000 |
| **Guest Count** | 120 |

### Jobs-to-be-Done
1. *"Help us create beautiful invitations without hiring a designer"*
2. *"Let us track who's coming so we can plan seating and catering"*
3. *"Keep our guests informed on the wedding day without us having to manage it"*
4. *"Save money compared to paper invitations"*

### Pain Points
- Paper invitations cost EUR 800-1,200 for 120 guests (design + print + postage)
- Tracking RSVPs via WhatsApp/phone is chaotic and error-prone
- Guests constantly ask for venue directions and schedule details
- Couple wants to enjoy their day, not manage logistics

### Success Criteria
- Invitations designed and sent in under 2 hours
- All RSVPs tracked in one dashboard
- Zero guest questions about logistics on the wedding day
- Total cost under EUR 50 (vs. EUR 1,000+ for paper)
- Guests feel excited and informed throughout the experience

### User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-H-01 | As a host, I want to select and customize an invitation template so that I can create a beautiful invitation without design skills | Must |
| US-H-02 | As a host, I want to import guests from a CSV file so that I can quickly add my guest list | Must |
| US-H-03 | As a host, I want to see real-time RSVP statistics so that I can plan catering and seating | Must |
| US-H-04 | As a host, I want to send invitations via email and WhatsApp so that guests receive them on their preferred channel | Should |
| US-H-05 | As a host, I want to designate an accomplice who can send live updates on the wedding day so that I can enjoy my day | Should |
| US-H-06 | As a host, I want to see which guests have dietary restrictions so that I can coordinate with the caterer | Must |
| US-H-07 | As a host, I want to send automated reminders to guests who haven't RSVP'd so that I don't have to follow up manually | Should |

---

## 3.2 Persona 2: Carlos — The Guest

| Attribute | Detail |
|-----------|--------|
| **Age** | 30 |
| **Location** | Barcelona, Spain |
| **Occupation** | Architect |
| **Tech Savviness** | Medium-High — uses WhatsApp daily, comfortable with web forms |
| **Relationship to Couple** | College friend of Juan |

### Jobs-to-be-Done
1. *"Let me quickly RSVP without creating an account"*
2. *"Show me the venue location and how to get there"*
3. *"Let me add the event to my calendar with one click"*
4. *"Keep me updated on the wedding day so I don't miss anything"*

### Pain Points
- Hates creating accounts for one-time interactions
- Often forgets event details after RSVPing
- Misses real-time updates (e.g., "ceremony starting now")
- Doesn't want to download an app for a single event

### Success Criteria
- RSVP completed in under 60 seconds on mobile
- Venue directions accessible with one tap
- Event added to calendar automatically
- Receives timely WhatsApp updates on the day
- No app download required

### User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-G-01 | As a guest, I want to RSVP via a mobile-friendly form without creating an account so that I can respond quickly | Must |
| US-G-02 | As a guest, I want to see the venue on a map with directions so that I know how to get there | Must |
| US-G-03 | As a guest, I want to add the event to my calendar with one click so that I don't forget | Should |
| US-G-04 | As a guest, I want to receive live updates via WhatsApp on the event day so that I don't miss key moments | Should |
| US-G-05 | As a guest, I want to indicate my dietary restrictions so that the hosts can accommodate me | Must |
| US-G-06 | As a guest, I want to indicate if I need transportation so that the hosts can arrange it | Must |

---

## 3.3 Persona 3: Laura — The Accomplice

| Attribute | Detail |
|-----------|--------|
| **Age** | 28 |
| **Location** | Madrid, Spain |
| **Occupation** | Graphic Designer |
| **Tech Savviness** | High — early adopter, comfortable with new tools |
| **Relationship to Couple** | Maria's maid of honor |

### Jobs-to-be-Done
1. *"Let me send live updates to guests on behalf of the couple"*
2. *"Make it impossible to accidentally send the wrong message"*
3. *"Give me a simple interface I can use while at the wedding"*
4. *"Let me access everything without remembering a password"*

### Pain Points
- Couple is busy; guests keep asking Laura for updates
- Accidentally sending wrong messages would be embarrassing
- Needs to work on mobile while moving around the venue
- Doesn't want to manage another password

### Success Criteria
- Access accomplice panel via magic link (no password)
- Send pre-configured messages with one swipe
- Zero accidental sends
- Works perfectly on mobile in any lighting condition
- Can see which messages have been delivered

### User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-A-01 | As an accomplice, I want to access my panel via a magic link so that I don't need to create a password | Must |
| US-A-02 | As an accomplice, I want to send pre-configured live messages with a swipe gesture so that I can't accidentally send them | Must |
| US-A-03 | As an accomplice, I want to see which messages have been delivered so that I know guests received updates | Should |
| US-A-04 | As an accomplice, I want to view the RSVP summary so that I can answer guest questions | Should |

---

## 3.4 Persona 4: Elena — The Wedding Planner (Future V3)

| Attribute | Detail |
|-----------|--------|
| **Age** | 35 |
| **Location** | Valencia, Spain |
| **Occupation** | Independent Wedding Planner |
| **Tech Savviness** | Medium — uses planning software but prefers simplicity |
| **Client Load** | 15-20 weddings per year |

### Jobs-to-be-Done
1. *"Let me manage multiple couples' invitations from one dashboard"*
2. *"Give my clients a professional-looking invitation without me designing it"*
3. *"Track RSVPs across all my events in one place"*
4. *"Charge my clients for the invitation service as part of my package"*

### Pain Points
- Currently uses different tools for each couple
- Spends 5-10 hours per couple on invitation logistics
- Clients expect digital solutions but she lacks the tools
- No unified view of all her events

### Success Criteria (V3)
- Multi-event dashboard
- White-label option (planner's branding)
- Bulk operations across events
- Client billing integration
- Time savings: 50% reduction in invitation management time

> **Note:** This persona is out of scope for MVP. Architecture should be designed to support multi-event management in the future.

---

> [Back to PRD Index](../PRD.md) | [Previous: Problem Statement](02-problem-opportunity.md) | [Next: Vision & Strategy](04-vision-strategy.md)
