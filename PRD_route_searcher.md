# PRD: Route Searcher - AI4Devs Final Project

## 1. Project Overview

The Route Searcher project aims to overhaul the current route discovery experience for corporate commuters. The primary focus is on landing pages to allow for rapid iteration and validation before moving to native mobile applications.

## 2. Problem Statement

Current users struggle with a limited and unintuitive route search interface.

* **Friction:** Users must browse long lists of irrelevant options.
* **Lack of Filters:** There is no current way to filter by day or time.
* **Ambiguity:** Users do not understand the logic or search radius used to match routes to their location.
* **Impact:** Increased user drop-off and low confidence in choosing the best route.

## 3. Goals & Objectives

* **Design a "Smarter" Discovery:** Enable users to quickly identify the best route for their specific commute.
* **Minimize Confusion:** Provide clarity on why routes are shown and improve the UI for schedule management.
* **Iterative Validation:** Start with web landings to test mental models and filter placement.

## 4. Key Product Principles

* **Context:** Corporate commuting follows a strict Home → Work → Home pattern.
* **Assumption:** The system will prioritize the sequential flow (Outbound → Return) as it matches the user's mental model.

## 5. Functional Requirements

### 5.1 Journey Types (Proposal 1)

The system must support three explicit journey types:

1. **Outbound** (Home → Work).
2. **Return** (Work → Home).
3. **Round-trip** (Home → Work → Home).

### 5.2 Search and Filtering Logic

* **Search Radius:** Configurable maximum radius per site to determine stop availability.
* **Contextual Filters:**
  * **Origin/Destination:** Supports both free Google Search and fixed site-defined stops.
  * **Date:** Users can select a specific day; the system must not allow different dates for outbound and return within the same search.
  * **Time (Arrival/Departure):**
    * "Departure after XX:XXh".
    * "Arrival before XX:XXh".
* **Stop Assignment:** Automatically assign the closest stop to the user's selected address.

### 5.3 Results Visualization & Sorting

* **Sorting:** Results must be ordered by ascending departure time.
* **Route Information:**
  * Display the schedule for single-expedition routes.
  * Display the primary schedule + "+ other schedules" for multi-expedition routes.
* **Filtering Behavior:** If an expedition does not meet the time filters at the user's assigned stop, the route must not appear.

## 6. User Experience (UX) Considerations

* **Sequential Selection:** Users should select the outbound trip first, filter results, and then proceed to the return trip to avoid UI overcomplication.
* **Visual Feedback:** Show messages if the user's location exceeds the search radius.
* **Testing Priorities:** Validate if users prefer a List View vs. a Map View and evaluate the placement of time filters.

## 7. Risks & Uncertainties

* **UI Complexity:** Adding multiple filters (Day/Time) might clutter the mobile/landing experience.
* **Backend Dependencies:** Some filtering logic (like real-time schedule matching) requires backend extensions.
* **Consistency:** Ensuring the logic remains consistent across landings, apps, and third-party integrations.

## 8. Success Metrics (KPIs)

* **Reduction in Search Time:** Time taken from landing to route selection.
* **Search Accuracy:** Percentage of users who find a route matching their specific schedule.
* **Drop-off Rate:** Decrease in users leaving the page during the filtering/selection process.
* **User Preference:** Qualitative data from testing (List vs. Map).
