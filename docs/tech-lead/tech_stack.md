# SplitEat: Technical Stack & Rationale

This document defines and justifies the chosen technology stack for SplitEat, detailing why each component was selected and analyzing security audits (CVEs) and architecture tradeoffs.

---

## 1. Technical Stack Overview

SplitEat is built as a **Single Page Application (SPA)** with Progressive Web App (PWA) capabilities to support its offline-first mission, backed by a serverless backend.

| Layer | Technology | Selected Version | Role & Description |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React + TypeScript | `react@18.2.0` | Declarative UI, state management, and component architecture. |
| **Build Tooling** | Vite | `vite@5.0.0` | High-performance bundler for fast development and optimized asset builds. |
| **Styling System** | Vanilla CSS | Custom standard | Native CSS Variables, Flexbox, and Grid for minimal bundle size and maximum runtime speed. |
| **Local Database** | Dexie.js | `dexie@4.0.0` | Safe wrapper over IndexedDB with TypeScript types, active transactions, and index support. |
| **Offline OCR** | Tesseract.js | `tesseract.js@5.0.0` | Client-side WebAssembly OCR engine for fully offline receipt parsing. |
| **Cloud OCR API** | GCloud Vision API | Cloud API | High-accuracy Optical Character Recognition when an internet connection is available. |
| **Backend API Gate** | Firebase Functions | Node.js 20 | Serverless environment to proxy cloud OCR requests and generate Bizum payment codes. |
| **Cloud Database** | Cloud Firestore | Cloud NoSQL | Real-time NoSQL cloud storage to sync history and settings for authenticated users. |
| **Authentication** | Firebase Auth | Cloud Auth | Managed authentication system supporting Google, Email, and Anonymous login. |

---

## 2. Component Justification & Decision Log

### 2.1 React 18.2.0 & TypeScript
- **Why**: React is chosen due to its robust ecosystem and support for complex, state-driven UI features (such as dragging items onto participants, real-time allocation calculations, and canvas-based spinners). TypeScript adds static type safety for complex data structures like tickets, users, and allocations.
- **Alternatives Considered**: 
  - *Svelte*: While Svelte yields smaller bundle sizes, React's ecosystem for drag-and-drop libraries and IndexedDB integration is more mature.
  - *Vanilla JS*: Too tedious for managing the dynamic UI state of multiple items and participants.

### 2.2 Vanilla CSS
- **Why**: Pure CSS ensures no library styling overhead, reducing the PWA download size. It provides instant rendering and leverages CSS variables for a seamless, fast dark-mode system. Avoids dependency bloat and performance lag on low-end mobile devices.
- **Alternatives Considered**: 
  - *TailwindCSS*: Adds configuration and post-processing complexity. Vanilla CSS guarantees direct, performant layouts with CSS Grid/Flexbox without external build constraints.

### 2.3 Dexie.js (IndexedDB Wrapper)
- **Why**: LocalStorage is limited to ~5MB and lacks indexes or complex querying. Raw IndexedDB is notoriously complex to write and lacks transactional guarantees. Dexie.js offers a clean Promise-based API, reactive bindings (hooks), and safe transaction tracking.
- **Alternatives Considered**: 
  - *SQL.js (SQLite WASM)*: Too large (~3MB WASM bundle), which would slow down initial page loads on cellular connections.

### 2.4 Hybrid OCR (Tesseract.js & Google Cloud Vision)
- **Why**: 
  - **Tesseract.js (Local)**: Essential for offline-first compliance. It runs purely on the client side using WebAssembly.
  - **Google Cloud Vision (Cloud)**: Crucial for high accuracy when online. It handles complex multi-column receipt formats and low-light receipt photos better than local Tesseract.js.

---

## 3. Dependency Security (CVE Audit)

The core client dependencies are audited for known security issues:

1. **`react` & `react-dom` (@18.2.0)**:
   - *Security Status*: Safe. No active high/critical vulnerabilities.
2. **`dexie` (@4.0.0)**:
   - *Security Status*: Safe. Database operations are run completely in the client's local sandbox, posing zero SQL injection risk on the cloud.
3. **`tesseract.js` (@5.0.0)**:
   - *Security Status*: Safe. The WebAssembly workers are executed in separate threads, preventing potential remote code execution (RCE) bugs from affecting the main UI thread.
4. **`vite` (@5.0.0)**:
   - *Security Status*: Safe. Development-only dependency. It has zero impact on the production bundle security.

---

## 4. Architectural Tradeoffs & Mitigations

### 4.1 Client-side WASM Payload vs. Network Speed
- **Tradeoff**: Tesseract.js requires downloading a ~1.5MB WASM binary and ~1MB language training files (e.g. Spanish/English) to perform OCR offline.
- **Mitigation**: 
  - Lazy load the Tesseract.js WASM resources only when the user clicks "Scan Receipt" *and* the device is offline.
  - Cache the WASM binary and language assets in the Service Worker Cache (PWA) during initial installation so it is never re-downloaded.

### 4.2 Browser Storage Eviction Policies
- **Tradeoff**: Mobile operating systems (especially iOS Safari) automatically clear IndexedDB and local storage if the app is not added to the home screen and has not been accessed for 7-14 days.
- **Mitigation**:
  - Implement a visible "Download JSON Backup" button on the history screen.
  - Keep data payloads extremely light.
  - Encourage users with more than 3 tickets to sign up for free Cloud Sync.

### 4.3 Firebase Cloud Function Execution Cold Starts
- **Tradeoff**: Google Cloud Vision queries routed through serverless Firebase Functions may experience 2-4 second latency delays during cold starts.
- **Mitigation**:
  - Implement a loading UI ("Analyzing receipt layout in the cloud...") with micro-animations.
  - Fall back to the client-side parser immediately if the function takes longer than 6 seconds to respond.
