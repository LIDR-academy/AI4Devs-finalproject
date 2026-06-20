# RealSaveFooding — Future Capabilities

**Status:** Out of scope for Extended MVP. For reference and long-term planning only.  
**Date:** 2026-06-20

These capabilities were evaluated during the Extended MVP phase and classified as strategically valuable but requiring significant infrastructure investment, partner agreements, or user-base scale that is not yet available. They should be revisited once Phase 2 (Growth) metrics are achieved.

---

## FC-001: Supermarket QR code collaboration

**Problem Statement:**  
The most frictionless receipt ingestion path would be a QR code at checkout that pushes the full basket directly into the app, including exact expiry dates from the supermarket's system.

**User Story:**  
As a user, I want to scan a QR code at the checkout of a partner supermarket, so that my entire purchase is imported instantly with accurate expiry dates.

**Business Value:**  
Eliminates OCR uncertainty and manual review entirely for partner transactions. Creates a B2B partnership revenue opportunity.

**Why deferred:**  
Requires a formal commercial agreement with at least one supermarket chain. No viable technical path without a partner. Revisit after app reaches meaningful user volume as negotiating leverage.

**Acceptance Criteria (for future reference):**
- Partner supermarket posts a basket payload to a RealSaveFooding webhook.
- Webhook authenticates and maps line items to pantry items for the linked user account.
- Expiry dates from the supermarket's system override OCR estimates with HIGH confidence.
- User receives a push notification confirming the basket import.

**Dependencies:** Partner API agreement, webhook endpoint, user-level supermarket account linking.  
**Effort:** High

---

## FC-002: ML-based expiration prediction

**Problem Statement:**  
The current rules-based estimation uses fixed category windows. An ML model trained on anonymized user overrides could produce significantly better estimates, especially for categories with high variance.

**User Story:**  
As a user, I want expiry estimates that improve across the user base, so that suggestions reflect real-world patterns for Spanish products.

**Business Value:**  
Better expiry estimates improve the confidence distribution and reduce override rate, which is a direct input metric for OCR acceptance (success metric: 80%).

**Why deferred:**  
Requires a sufficient dataset of user overrides (thousands of data points per category) for statistical validity. Data collection starts with P2-003 (weighted-average algorithm). Once enough data is accumulated, a proper model becomes viable. Also requires ML training infrastructure (SageMaker or equivalent) and an inference endpoint.

**Acceptance Criteria (for future reference):**
- A model is trained on anonymized user override data per category.
- Model predictions are served via a dedicated inference endpoint.
- Confidence level reflects model certainty, not just rule coverage.
- Model is retrained on a weekly cadence.
- A/B experiment framework allows comparing ML vs rules estimates.

**Dependencies:** P2-003 (data collection), anonymized data pipeline, ML training infrastructure.  
**Effort:** High

---

## FC-003: Cross-user waste benchmarking

**Problem Statement:**  
Users know their own waste stats but have no external reference. Benchmarking against similar households would contextualize the data and motivate reduction.

**User Story:**  
As a user, I want to see how my waste compares to similar households, so that I understand whether I am doing well or have room to improve.

**Business Value:**  
Social comparison is a strong behavioral lever for habit change. Benchmarking is cited in the original product vision ("Top wasted food: you vs average").

**Why deferred:**  
Requires a sufficient user base for statistical validity (minimum ~1,000 active households per cohort to produce meaningful percentiles). Also requires a GDPR compliance review for anonymized aggregation before any cross-user data is processed.

**Acceptance Criteria (for future reference):**
- User can opt into anonymized benchmarking.
- Dashboard shows user's waste percentile within their household size cohort.
- Benchmark is shown as a range (low / average / high waste household), not individual user comparison.
- Data is fully anonymized before aggregation; opt-out removes user from the cohort.

**Dependencies:** Sufficient user base, GDPR compliance review, aggregation pipeline.  
**Effort:** High

---

## FC-004: Native mobile app (iOS and Android)

**Problem Statement:**  
The current frontend is a PWA. Push notifications, camera access, and barcode scan performance are limited compared to a native app.

**User Story:**  
As a user, I want a native app on my phone so that I get real push notifications, faster camera access, and a home-screen experience.

**Business Value:**  
Native push notifications have 4–7× higher click-through rates than web push. App Store presence drives organic discovery. Barcode scan speed and reliability are significantly better in a native shell.

**Why deferred:**  
The PWA covers the core experience adequately for the current phase. Native app investment is justified once retention metrics (week-4 waste reduction, DAU) validate product-market fit. PWA web push (P1-001) and `@zxing/browser` barcode scanning (P2-002) close the most critical gaps at much lower cost.

**Acceptance Criteria (for future reference):**
- Native shells (React Native or Capacitor wrapping existing React frontend) for iOS and Android.
- Push notification delivery uses APNs (iOS) and FCM (Android).
- Camera barcode scanner uses native APIs.
- App is submitted to App Store and Google Play.

**Dependencies:** P1-001 (notifications), P2-002 (barcode scan), React Native or Capacitor expertise, developer program accounts ($99/year iOS, $25 one-time Android).  
**Effort:** High

---

## Revisit Criteria

Consider scheduling these features when any of the following thresholds are met:

| Trigger | Capability to revisit |
|---|---|
| ≥ 5,000 monthly active users | FC-003 (benchmarking), FC-004 (native app) |
| ≥ 50,000 expiry overrides collected | FC-002 (ML prediction) |
| First supermarket partner outreach | FC-001 (QR collaboration) |
| Week-4 retention ≥ 40% | FC-004 (native app), FC-001 (QR) |
