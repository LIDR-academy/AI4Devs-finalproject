# 1. Product overview

## **1.1. Goals:**
**RealSaveFooding** exists to help people **stop wasting food and money** by making it easy to **know what food they have, when it expires, and what to do with it before it goes bad**—with as much automation as possible (e.g., receipt scanning + AI).

---

## Value it adds (the outcomes it creates)
- **Less food waste**: fewer items forgotten in the fridge/pantry and thrown away.
- **Money saved**: reduces repeated “buy-and-throw” cycles and helps users buy smarter.
- **Time saved**: automates manual tracking (receipt ingestion, suggested expiry dates, reminders).
- **Better daily decisions**: “What should I cook/eat next?” based on what will expire soon.
- **Shared coordination**: avoids duplicate purchases and confusion when multiple people consume the same pantry items.

---

## What problem it solves (pain points)
1. **People don’t have a reliable inventory of what they own**
    - Food gets buried, duplicated, or forgotten.
2. **Expiration management is hard and inconsistent**
    - Dates are not always clear, differ by product, and people don’t want to track them manually.
    - Your improvement: align suggested expiry windows with **Spanish supermarket norms**, and learn a user’s preferred expiry window per product over time.
3. **Users lack “next best action” guidance**
    - Knowing something expires soon isn’t enough; users need recipe ideas, consumption suggestions, and prioritization.
4. **Households are multi-user**
    - One person buys, another consumes; without shared visibility, waste increases.
5. **Waste is invisible**
    - People underestimate how much they waste. The product makes waste measurable (food + €), trackable over time, and explorable by category/time.

---

## For who (target users)
Primary target segments:
- **Households and couples/families** who share groceries and want a shared pantry (multi-account).
- **Busy individuals** who buy groceries but forget what they have.
- **Budget-conscious shoppers** who want to reduce monthly spend by cutting waste and comparing prices.
- **Sustainability-motivated consumers** who want to reduce environmental impact via waste reduction.

Secondary / later segments:
- **Meal planners / fitness-focused users** (structured consumption, recipe suggestions).
- Potentially **small food-related organizations** (less likely initially unless you pivot B2B).


## **1.2. Main features and functionalities:**

### Main features (product traits)

- **AI-assisted & automation-first**: receipt analysis, smart suggestions, minimal manual entry.
- **Localized for Spain**: shelf-life/expiry suggestions aligned with **Spanish supermarket norms**.
- **Personalized learning**: remembers the user’s chosen expiry window per product and suggests it next time.
- **Transparent confidence**: if AI can’t infer expiry reliably, it flags it as an **estimate** and asks the user to confirm.
- **Multi-user household support**: shared pantry across accounts (e.g., with a partner).
- **Insight-driven**: analytics that quantify waste in both **food units** and **€**.
- **Notification-centric**: proactive reminders and alerts (expiry, price drops, consumed-by-others).
- **Apple-like UX**: clean, simple, “iOS design language” style UI.
- **Cross-device sync**: not part of the current MVP documentation; keep the provider choice open for future iterations.
- **Privacy & security controls**: account, password, ad-privacy preferences, delete account.

---

### Main functionalities (what it does)

#### 1) Pantry / inventory management

- Create and maintain a **pantry inventory** of purchased items.
- Track **quantities**, consumption, and what’s currently available.
- **Long-press item actions**:
    - Compare prices
    - Alternatives
    - Change expiration date
    - Change default expiration date for that food

#### 2) Receipt ingestion + AI classification

- Scan/analyze receipts to:
    - Identify products purchased
    - Suggest **expiration windows** per product
- Learns from prior user inputs to improve future suggestions.

#### 3) Expiration tracking + smart reminders

- Expiration date management per item (and defaults per product).
- Reminders/alerts for items **at risk of expiring soon**.
- Clear handling when expiry is uncertain (estimate + user confirmation).

#### 4) Recipes & “what to use next”

- Suggest recipes based on:
    - Items available
    - Items expiring soon (prioritization)
- Guidance to reduce waste through consumption planning.

#### 5) Price intelligence

- **Compare prices** across supermarkets/brands for selected products.
- Price-drop notifications (configurable).

#### 6) Waste analytics (food + money)

- Dashboard of:
    - **Wasted food and €**
    - **At-risk** items likely to be wasted soon
- Detailed breakdowns grouped by:
    - Time (day/week/month)
    - Food type / specific entries
- “Top 10 most wasted foods” for the user.

#### 7) Accounts, sharing, and settings

- Authentication flows:
    - Sign up / log in / password recovery (username or email)
- Shared pantry with another account.
- Settings:
    - Notification types (expiry / price drop / consumed items)
    - Cloud sync provider
    - Profile (name, age, email, address fields)
    - Privacy & security (ad privacy, change password, delete account)
    - Appearance (dark/light/system)
    - App info + contact by email

## **1.3. Design and UX**

See the detailed wireframes and screenshots in the design folder: [Design and UX](./../design/readme.md).


## **1.5. Post-MVP Product Roadmap**

The extended product roadmap covering all non-MVP features, gap analysis, and phased release plan is documented in:

- [5_Extended-Non-MVP-PRD.md](./5_Extended-Non-MVP-PRD.md)

Strategic capabilities that are out of scope even for the extended MVP (native app, ML prediction, supermarket QR, cross-user benchmarking) are documented in:

- [6_Future-Capabilities.md](./6_Future-Capabilities.md)

Key phases:
- **Phase 1 (GA Readiness):** real notification delivery, CI/CD pipeline, production infrastructure, observability. Infrastructure work is done last, after all feature tickets.
- **Phase 2 (Growth):** recipe suggestions (TheMealDB free API), barcode scan (Open Food Facts + @zxing/browser), expiry learning (data-driven algorithm), live Mercadona price comparison, gamification, consumption automation.
- **Future:** native mobile app, ML-based expiration prediction, supermarket QR partnerships, cross-user benchmarking — documented in [6_Future-Capabilities.md](./6_Future-Capabilities.md) (out of scope for Extended MVP).

---

## **1.4. Installation instructions:**

To run the frontend application locally (folder `front`):

1. Prerequisites
    - Node.js `20+` installed.
    - Recommended: Bun `1.2+` (the project includes `bun.lock` and `bunfig.toml`).

2. Clone the repository

```bash
git clone https://github.com/jesramgue/JRG-AI4Devs-finalproject.git
cd JRG-AI4Devs-finalproject/front
```

3. Install dependencies

Recommended option (Bun):

```bash
bun install
```

Alternative (npm):

```bash
npm install
```

4. Start the development environment

With Bun:

```bash
bun run dev
```

With npm:

```bash
npm run dev
```

5. Open in your browser
    - Default local URL: `http://localhost:5173`

6. Useful scripts

```bash
# production build
bun run build

# preview build
bun run preview

# lint
bun run lint

# format code
bun run format
```

Notes:
- If you prefer npm, you can run the same scripts by replacing `bun run` with `npm run`.
- If port `5173` is busy, Vite will automatically assign another port and show it in the terminal.


---
