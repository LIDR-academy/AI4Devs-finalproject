# 📑 Vision and Strategy Document: Aura Planning

## 1. Project Summary
**Aura Planning** is a SaaS (Software as a Service) platform designed for managing digital invitations and real-time event storytelling. While the initial market is weddings, the brand is built to scale to any celebration (birthdays, corporate events, baptisms).

* **Name:** Aura Planning.

* **Slogan:** "Design your event's narrative, manage the logistics effortlessly."
* **Purpose:** To replace paper invitations with an interactive digital ecosystem that eliminates logistical stress and generates anticipation (hype) among guests.

---

## 2. Product Features (MVP)

### A. Management Panel (Host)
* **Template Editor:** A visual tool for customizing colors, typography, and photos.

* * **Guest Manager:** Bulk import (CSV/Excel) and segmentation by category (family, friends, etc.).

* **Control Dashboard:** Track RSVPs, no-shows, and manage allergens or transportation needs.

### B. Guest Microsite (Mobile-First Experience)
* **Static Sites:** Ultra-fast and lightweight navigation from the mobile browser (no app download required).

* **Smart RSVP Form:** Capture of critical data (dietary requirements, bus attendance).

* **Dynamic Logistics:** Integrated maps (Google Maps/Waze) and synchronization with personal calendars.

### C. Communication System
* **Multichannel Invitations:** Sending via custom email or direct WhatsApp link.

* **Reminders:** Automated notifications for guests who have not yet RSVP'd.

* **Post-Event Thank Yous:** Automated digital thank you cards (via email or WhatsApp) for attendees, with the option to include links to external photo galleries (Drive, Pixieset) since the platform does not host images at this stage. This serves as a final point of contact and reinforces branding.

---

## 3. The "Killer Feature": Live Guest Journey
Live narrative experience through notifications throughout the day of the event.

* **Main Channel:** WhatsApp (via official API).

* **The "Accomplice Mode":** Secure access via **Magic Link** (no password required) for a trusted person (best man or bridesmaid).

* **Remote Control Panel:** Simplified interface with pre-configured buttons that require a **swipe** to prevent accidental sending.

* * **Live Messages:** "The bride is leaving the hotel," "They said yes!", "Let the dancing begin!"

> **💡 Strategic Justification:** This feature differentiates us from the giants (Zankyou, Bodas.net) by focusing on the **hype** and immediacy demanded by young audiences (Millennials/Gen Z). Using a "partner" ensures that the couple can enjoy their day without technical distractions.

---

## 4. Business Strategy and Monetization

### Model: "Try-Before-You-Buy" (IKEA Effect)
The user has full access to the design tool for free, but the event remains in **"Draft Mode"**.

* **Publishing Paywall:** A one-time payment is required to obtain the public URL and activate the RSVP system.

* **Technical Limitation:** The free mode allows you to add up to 5 guests for internal testing.

> **💡 Strategic Justification:** By allowing users to configure all their wedding details for free, we generate very high **switching friction**. Once they've invested time on our platform, users will prefer to pay rather than start from scratch on another. Furthermore, we eliminate the cost of providing free service to users who have no intention of converting.

### Proposal Under Evaluation: Gift Registry / Cash Fund (Fintech)
*Currently under consideration to add a new revenue stream.*
Allow guests to send cash gifts directly from the RSVP form.

* **Operating Model:** Integration with **Stripe Connect** so that the money goes directly from the guest to the host's (the couple's) bank account. * **Legal Advantage:** Aura **never** retains or touches the main funds, legally avoiding becoming a bank or money transmitter, thus eliminating complex compliance (KYC/AML) responsibilities for the platform.

* **Additional Monetization:** Aura charges a small "platform fee" (e.g., 1.5%–2%) per transaction, automatically deducted by Stripe before sending the money to the host.

* **Infrastructure Costs:** Stripe charges a monthly fee per "active connected account" (the host), which is easily covered by the commission retained by the platform.

---

## 5. Technical Architecture and Cost Optimization

* **Static Site Generation (JAMstack):** The guest site does not consume database resources on each visit; it is a static resource (HTML/JS/CSS) served via CDN.

* **Transactional Backend:** The server only handles the administration panel and sending/receiving data.

* **Photo Album Exclusion (V1):** Guests are not allowed to upload photos in this phase.

> **💡 Strategic Justification:** This architecture drastically reduces bandwidth and storage costs. By not allowing photos in V1, we avoid the most critical expense (data egress and storage) and simplify legal compliance (GDPR).

---

## 6. Projected Cost Structure

| Category | Concept | Cost Impact |

| :--- | :--- | :--- |
| **Infrastructure** | Hosting for Admin and Database (PostgreSQL/Node). | Low/Medium |

| **Sending APIs** | WhatsApp Business API (pay per conversation) and Email (AWS SES). | Variable (depending on volume) |

| **Financial** | Payment Gateway Fees (Stripe/PayPal ~3%). | Proportional to sales |

| **Maps** | Google Maps API (map uploads). | Low (with free quota) |

| **Operations** | Customer support and SSL certificate maintenance. | Medium (Human time) |

---

## 7. Growth Roadmap
1. **V1 (MVP):** Focus on weddings, pay per post, basic RSVP notifications.

2. **V2 (Live):** WhatsApp API integration and deployment of "Partner Mode".

3. **V3 (Diversification):** Opening up to corporate events, birthdays, and baptisms under the "Aura" brand.

---

**Additional Notes:**
* **Data Deletion:** To optimize costs and comply with privacy regulations, all sensitive data will be automatically deleted 30 days after the event date.

* **Design:** The interface should be minimalist, elegant, and convey the peace suggested by the name "Aura."