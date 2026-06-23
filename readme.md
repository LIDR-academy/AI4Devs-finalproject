# DiviDox — Dividend Portfolio Tracker

## Index

0. [Project Information](#0-project-information)
1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Data Model](#3-data-model)
4. [API Specification](#4-api-specification)
5. [User Stories](#5-user-stories)
6. [Work Tickets](#6-work-tickets)
7. [CI/CD Pipeline & Automation](#7-cicd-pipeline--automation)
8. [Delivery Status](#8-delivery-status)
9. [AI Tools & Engineering](#9-ai-tools--engineering)
10. [Prompts](#10-prompts)

---

## 0. Project Information

### **0.1. Full Name:**
Javier Camarena Triguero

### **0.2. Project Name:**
DiviDox — Dividend Portfolio Tracker

### **0.3. Project Description:**
DiviDox is a cross-platform application (Android, iOS, Desktop) built with **Kotlin Multiplatform (KMP)** that enables individual investors to manage, analyze, and project their passive income from dividends. It provides detailed position tracking, historical dividend analysis, annual income projections, and performance comparisons.

<p align="center">
  <img src="docs/images/multiplatform.png" alt="DiviDox running on Android, iOS and Desktop" width="800"/>
</p>

### **0.4. Project URLs:**

| Resource | URL |
|----------|-----|
| **Code Repository** | https://github.com/javiercamarenatriguero/dividox *(public)* |
| **GitHub Project Board** | https://github.com/users/javiercamarenatriguero/projects/1 |
| **CI/CD Dashboard** | https://github.com/javiercamarenatriguero/dividox/actions |
| **UI Prototype** | https://stitch.withgoogle.com/projects/10568397103146599411 *(Stitch)* |

### **0.5. Tools Used:**
- **Claude Code (CLI):** Primary AI coding assistant — implementation, architecture, documentation, code review, and agent orchestration
- **GitHub Copilot:** Complementary AI support via shared `.ai-context/` symlinks
- **Stitch (Google AI for UI):** AI-powered Material Design 3 screen generation and design system management
- **Gemini:** Image generation for documentation and promotional graphics
- **[Looka](https://looka.com/):** Logo design and brand identity
- **GitHub Projects:** Issue tracking, kanban board, project workflow
- **MCP Servers:** Stitch, GitHub, Context7, Linear, lean-ctx — connected to Claude Code for external service integration

### **0.6. How to Run / Access the App:**

| Platform | How to Access |
|----------|---------------|
| **Android** | APK available via **Firebase App Distribution** (access granted to reviewers). |
| **iOS** | Clone the [repository](https://github.com/javiercamarenatriguero/dividox), open `iosApp/iosApp.xcworkspace` in Xcode, and run on simulator or device. |
| **macOS (Desktop/JVM)** | Download the Desktop artifact from [CI — On Merge workflow](https://github.com/javiercamarenatriguero/dividox/actions/workflows/on-merge.yml) or run locally with `./gradlew :composeApp:run`. |

---

## 1. Product Overview

### **1.1. Objective:**

**DiviDox** solves a critical problem for dividend investors: comprehensive visibility of passive income.

**What it solves:**
- Traditional brokerage portals don't provide portfolio-level dividend projections
- Lack of detailed historical analysis (payment trends, yield changes)
- Difficulty estimating annual passive income accurately
- No tracking of "watchlist" positions before purchasing

**User value:**
- Real-time visualization of expected annual dividend income
- Comparative yield analysis across holdings
- Future cash flow projections
- Historical payment trend analysis (5+ years)
- Cross-platform management (phone, tablet, desktop) from a single codebase

### **1.2. Key Features:**

1. **Portfolio Management**
   - Add/edit positions with purchase price, share quantity, currency, and date
   - View current value, unrealized gain/loss, gain %
   - Track daily portfolio changes

2. **Dividend Analysis**
   - Historical dividends per stock (5-10 years)
   - Annual dividend income projection at portfolio level
   - Auto-calculated yield
   - Next ex-dividend and payment dates

3. **Watchlist (Security Tracking)**
   - Add stocks to track without ownership
   - Compare yield, price, fundamentals before investing
   - Historical price and dividend data

4. **Authentication & Account**
   - Google and Email/Password login
   - Cloud sync via Firebase
   - Base currency management (USD, EUR, etc.)

5. **Technical & Fundamental Analysis**
   - Interactive price charts (1D, 1W, 1M, 1Y, YTD, ALL)
   - Fundamental metrics: P/E, Market Cap, Dividend Payout Ratio

### **1.3. User Experience Design:**

**Main Flow:**
1. **Splash Screen** — Welcome animation (2s)
2. **Auth Flow** — Google Sign-In / Email signup
3. **Dashboard** — Main view with portfolio summary, favorites, period selector
4. **Portfolio Screen** — Complete holdings list with gain/loss, converted currency
5. **Security Detail** — Analysis screen: price chart, metrics, dividends, fundamentals
6. **Favorites/Watchlist** — Manage favorite securities

**Design System:**
- **Material Design 3** with dynamic color palette (Material You)
- Adaptive dark/light mode
- Compose Multiplatform components for cross-platform consistency
- Visual prototype: https://stitch.withgoogle.com/projects/10568397103146599411

---

### **1.3.1. Design Prototype (Stitch - Interactive UI):**

**🎨 Complete Design System & All Screens:**

<div align="center">
  <a href="https://stitch.withgoogle.com/projects/10568397103146599411">
    <img src="docs/images/stitch.png" width="1000" alt="DiviDox Stitch UI Prototype - Interactive Design System" />
  </a>
  <p><strong>👉 Click image or <a href="https://stitch.withgoogle.com/projects/10568397103146599411">open live prototype</a> to explore interactive mockups</strong></p>
</div>

---

### **1.3.2. App Screenshots:**

| Screen | Description |
|--------|-------------|
| <img src="docs/images/auth.png" width="250"/> | **Authentication** — Google Sign-In and Email/Password login screens with Material Design 3 styling |
| <img src="docs/images/dashboard-android.png" width="250"/> | **Dashboard** — Portfolio overview with total value, today's metrics, favorites quick access, and period selector |
| <img src="docs/images/portfolio.png" width="250"/> | **Portfolio** — Holdings list showing ticker, company name, current value, position size, and gain/loss % |
| <img src="docs/images/stock-analysis.png" width="250"/> | **Analysis** — Detailed security view with price chart (multiple timeframes), fundamental metrics (P/E, Market Cap, Yield) |
| <img src="docs/images/dividends.png" width="250"/> | **Dividends** — Income projections, historical payment timeline, ex-dividend dates, frequency and yield comparison |
| <img src="docs/images/settings.png" width="250"/> | **Settings** — Profile management, currency selection, biometric lock, notifications, data export & account deletion |

### **1.4. Installation Instructions:**

**Prerequisites:**
- JDK 17+ (Kotlin 2.0+)
- Android Studio 2024.2+ with Kotlin Multiplatform Plugin
- Xcode 15+ (for iOS)
- Firebase project created (Authentication + Firestore)

**Local Setup Steps:**

```bash
# 1. Clone repository
git clone https://github.com/javiercamarenatriguero/dividox.git
cd dividox

# 2. Configure Firebase
# - Create project in Firebase Console
# - Download google-services.json (Android)
# - Create GoogleService-Info.plist (iOS)
# - Place in composeApp/src/androidMain/res/google-services.json
#   and iosApp/iosApp/GoogleService-Info.plist

# 3. Configure Yahoo Finance API
# - Register on RapidAPI: https://rapidapi.com/
# - Get API key for "Yahoo Finance" endpoint
# - Add to local.properties: YAHOO_API_KEY=xxx

# 4. Build & Run Android
./gradlew :composeApp:assembleDebug
# Or from Android Studio: Run > Run 'composeApp'

# 5. Build & Run Desktop (JVM)
./gradlew :composeApp:run

# 6. Build & Run iOS
# Open iosApp/iosApp.xcworkspace in Xcode
# Select target "iosApp" and run on simulator/device
```

**Optional Seed Data:**
- App generates test holdings on first login
- Real market data from Yahoo Finance API

---

## 2. System Architecture

### **2.0. High-Level Integration Diagram:**

```mermaid
graph LR
    App["📱 DiviDox App<br/>(Kotlin Multiplatform)"]
    
    Auth["🔐 Firebase Auth<br/>• Email/Password<br/>• Google Sign-In<br/>• JWT Management"]
    
    Firestore["☁️ Firestore<br/>• Users<br/>• Holdings<br/>• Watchlist"]
    
    Room["💾 Room DB<br/>• Price Cache<br/>• Dividend History<br/>• User Prefs"]
    
    Yahoo["📉 Yahoo Finance API<br/>• Stock Quotes<br/>• Historical Data<br/>• Dividends"]
    
    App -->|Login/Register| Auth
    Auth -->|Token| App
    
    App -->|Read/Write| Firestore
    Firestore -->|User Data| App
    
    App -->|Cache| Room
    Room -->|Cached Data| App
    
    App -->|Fetch Prices<br/>Dividends<br/>Fundamentals| Yahoo
    Yahoo -->|Market Data| App

    style App fill:#1E88E5,stroke:#0D47A1,stroke-width:2px,color:#fff,font-weight:bold
    style Auth fill:#D32F2F,stroke:#B71C1C,stroke-width:2px,color:#fff,font-weight:bold
    style Firestore fill:#F57C00,stroke:#E65100,stroke-width:2px,color:#fff,font-weight:bold
    style Room fill:#388E3C,stroke:#1B5E20,stroke-width:2px,color:#fff,font-weight:bold
    style Yahoo fill:#7B1FA2,stroke:#4A148C,stroke-width:2px,color:#fff,font-weight:bold
```

**Data Flow Summary:**
- **Auth:** Firebase handles login & token refresh via `common:auth` module
- **Cloud Storage:** Firestore stores user data (holdings, watchlist) via `component:security` 
- **Local Cache:** Room DB caches market data (prices, dividends) via `component:market`
- **External Data:** Yahoo Finance API fetches real-time quotes and historical data via Ktor HTTP client

---

### **2.1. Layered Modular Architecture:**

```mermaid
graph TB
    subgraph App["APP LAYER"]
        Nav["Navigation<br/>RootGraph"] --> DI["DI Setup<br/>Koin"]
    end

    subgraph Features["PRESENTATION LAYER"]
        Auth["auth"] --> Dashboard["dashboard"] --> Portfolio["portfolio"] --> Analysis["analysis"] --> Other["...others"]
    end

    subgraph Integration["INTEGRATION LAYER"]
        IMD["integration:market-data"]
        IS["integration:security"]
        ID["integration:dividend"]
    end

    subgraph Components["DOMAIN + DATA LAYER"]
        CA["component:auth"]
        CM["component:market"]
        CS["component:security"]
        CD["component:dividend"]
    end

    subgraph Common["SHARED UTILITIES LAYER"]
        CAuth["common:auth<br/>Firebase SDK"]
        CNet["common:network<br/>Ktor"]
        CSet["common:settings<br/>DataStore"]
        CUI["common:ui-resources<br/>Material Design 3"]
    end

    Firebase["Firebase<br/>Auth + Firestore"]
    Room["Room DB<br/>Local Cache"]
    Yahoo["Yahoo Finance<br/>REST API"]

    App --> Features
    Features --> Integration
    Features --> Common
    Integration --> Components
    Integration --> Common
    Components --> Common

    CAuth --> Firebase
    IMD --> Yahoo
    IMD --> Room
    IS --> Firebase
    CA --> Firebase

    style App fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000,font-weight:bold
    style Features fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000,font-weight:bold
    style Components fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000,font-weight:bold
    style Integration fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000,font-weight:bold
    style Common fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000,font-weight:bold
    style Firebase fill:#eeeeee,stroke:#424242,stroke-width:1px,color:#000
    style Room fill:#eeeeee,stroke:#424242,stroke-width:1px,color:#000
    style Yahoo fill:#eeeeee,stroke:#424242,stroke-width:1px,color:#000
```

**Layer Responsibilities:**

| Layer | Purpose | Examples |
|-------|---------|----------|
| **App** | Entry point, navigation routing, dependency injection | `:composeApp` with RootGraph & Koin |
| **Features** | UI screens only (pure presentation) | `:feature:auth`, `:feature:dashboard`, `:feature:portfolio` |
| **Integration** | Shared business logic & data access | `:integration:market-data`, `:integration:security`, `:integration:dividend` |
| **Components** | Domain models & data repositories | `:component:auth`, `:component:market`, `:component:security` |
| **Common** | Cross-platform utilities | `:common:auth` (Firebase), `:common:network` (Ktor), `:common:ui-resources` |
| **External** | Third-party services | Firebase (Auth, Firestore), Room DB (local cache), Yahoo Finance API |

**Pattern: Clean Architecture + Kotlin Multiplatform (KMP) Modules**

**Why this architecture:**
- **Clear separation of concerns:** App layer handles navigation & DI; Feature layers expose only screens (dumb UI); Component layers contain domain & data logic
- **Feature isolation:** Each `:feature:*` is a screen UI module that depends on domain/data (`:component:*`), but features never depend on each other
- **Domain-first design:** Business logic lives in `:component:*` (domain + data), reusable by multiple features
- **Cross-platform:** Kotlin Multiplatform allows writing domain + data once (`:component:*`, `:common:*`) and reusing across Android/iOS/Desktop
- **Testability:** Domain logic in `:component:*` is pure Kotlin with no Android/iOS deps → easy unit testing

### **2.2. Main Components:**

#### **App Layer (:composeApp)**

| Component | Technology | Responsibility |
|---|---|---|
| **Navigation** | Compose Navigation 3 + Kotlin Serialization | Type-safe routing (RootNavGraph, nested graphs per feature) |
| **DI Setup** | Koin startKoin() | Initialize all modules, register singletons, factories |

#### **Feature Layer (:feature:*) — Screens Only**

| Component | Technology | Responsibility |
|---|---|---|
| **Presentation (UI)** | Compose Multiplatform + Material Design 3 | Screen rendering, MVI state management, user input |
| **MVI Contract** | Sealed interfaces | State (immutable data class), Event (user actions), Effect (side effects) |
| **ViewModel** | Android lifecycle-viewmodel-compose | Orchestrate use cases, manage state, emit effects |

#### **Component Layer (:component:*) — Domain + Data**

| Component | Technology | Responsibility |
|---|---|---|
| **Domain Layer** | Pure Kotlin (no Android/iOS deps) | Business logic (use cases, models, interfaces) |
| **Data Layer** | Repositories (impl of domain interfaces) | External API access, local storage, sync logic |
| **Data Sources** | expect/actual (platform-specific) | Platform-native access (Firebase, Room, Keychain, etc) |

#### **Integration Layer (:integration:*) — Shared Integrations**

| Component | Technology | Responsibility |
|---|---|---|
| **Market Data** | Yahoo Finance API (via Ktor) | Fetch historical prices, fundamentals, dividends; cache strategy |
| **Security Data** | Firestore + Room | Holdings, portfolio calculations, watchlist |
| **Dividend Calculations** | Pure Kotlin functions | Projections, CAGR, yield computations |

#### **Common Layer (:common:*) — Reusable Utilities**

| Component | Technology | Responsibility |
|---|---|---|
| **Auth** | Firebase Auth + Google Sign-In | Session management, tokens, expect/actual platform SDKs |
| **Network** | Ktor HTTP Client | HTTP configuration, interceptors, error handling |
| **UI Resources** | Material Design 3 theme | Colors, typography, shapes, components (ButtonDefaults, etc) |
| **Settings** | EncryptedSharedPreferences / Datastore | User preferences, encrypted local storage |
| **Local Storage** | Room DB (Android/iOS) + File I/O (Desktop) | Price cache, holdings, preferences (expect/actual) |

### **2.3. Project Structure & Module Layers:**

```
dividox/
├── composeApp/                        # APP LAYER
│   ├── src/commonMain/
│   │   ├── kotlin/com/akole/dividox/
│   │   │   ├── di/                    # DI setup (Koin)
│   │   │   └── navigation/            # Navigation graphs & routes
│   │   ├── androidMain/               # Android entry point
│   │   ├── iosMain/                   # iOS entry point
│   │   └── jvmMain/                   # Desktop entry point
│
├── feature/                           # PRESENTATION LAYER (Screens only)
│   ├── auth/                          # Authentication screens
│   ├── dashboard/                     # Dashboard screens
│   ├── portfolio/                     # Portfolio screens
│   ├── analysis/                      # Security analysis screens
│   ├── dividends/                     # Dividend activity screens
│   ├── search/                        # Search & discovery screens
│   ├── settings/                      # Settings screens
│   └── favorites/                     # Favorites/watchlist screens
│
├── component/                         # DOMAIN + DATA LAYER
│   ├── auth/                          # Auth domain + data (DVX-TK-011)
│   │   └── src/commonMain/kotlin/component/auth/
│   │       ├── domain/                # Use cases, models, interfaces
│   │       ├── data/                  # Repositories, data sources
│   │       ├── androidMain/           # Android expect/actual
│   │       ├── iosMain/               # iOS expect/actual
│   │       ├── jvmMain/               # Desktop expect/actual
│   │       └── di/                    # Koin module
│   │
│   ├── market/                        # Market data domain + data (DVX-TK-015)
│   │   └── src/commonMain/kotlin/component/market/
│   │       ├── domain/
│   │       ├── data/
│   │       ├── [platform mains]/
│   │       └── di/
│   │
│   ├── security/                      # Holdings & portfolio
│   │   └── src/commonMain/kotlin/component/security/
│   │       ├── domain/
│   │       ├── data/
│   │       └── di/
│   │
│   └── dividend/                      # Dividend calculations
│       └── src/commonMain/kotlin/component/dividend/
│           ├── domain/
│           ├── data/
│           └── di/
│
├── common/                            # SHARED LAYER (Utilities)
│   ├── auth/                          # Firebase Auth SDK
│   ├── network/                       # Ktor HTTP client
│   ├── ui-resources/                  # Material Design 3 theme
│   ├── settings/                      # Preferences storage
│   └── mvi/                           # MVI base classes
│
├── docs/                              # Documentation
│   ├── adr/                           # Architecture Decision Records
│   ├── prd/                           # Product Requirements Documents
│   └── tickets/                       # Work tickets reference
│
└── settings.gradle.kts                # Module registration
```

**Module Dependencies (Layered & Unidirectional):**

```
composeApp (App Layer)
  ↓ depends on
feature:* (Presentation Layer) —→ only expose Screens, no domain logic
  ↓ depends on
component:* (Domain + Data Layer) —→ domain logic, repositories, use cases
  ↓ depends on
common:* (Shared Layer) —→ utilities, Firebase, Ktor, etc
integration:* (optional, for shared integrations)
  ↓ depends on
External (Firebase, Yahoo Finance)
```

**Isolation Rules:**
- `:feature:*` modules **do NOT depend on each other** (no auth → dashboard imports)
- `:component:*` modules **can depend on other components** (e.g., portfolio → market data)
- `:common:*` modules **have no internal dependencies** (utilities only)
- `:integration:*` modules **are shared and reusable** by multiple components

### **2.4. Infrastructure & Deployment:**

**Backend (Firebase + REST APIs):**
```
┌─────────────────┐
│ Firebase Console │
├─────────────────┤
│ • Authentication│ ← Google Sign-In, Email auth
│ • Firestore DB  │ ← Holdings, portfolios, settings
│ • Storage       │ ← User avatars (v2+)
└─────────────────┘
         ▲
         │ (SDK)
    ┌────┴────┐
    │ DiviDox │
    │  App    │
    └────┬────┘
         │ (REST)
    ┌─────────────────┐
    │ Yahoo Finance   │
    │ (RapidAPI)      │ ← Prices, dividend history
    └─────────────────┘
```

**Build Targets (Multiplatform):**
- **Android:** API 24+ (Gradle compilation, Play Store publish)
- **iOS:** iOS 14+ (Xcode compilation, App Store publish)
- **Desktop:** macOS/Windows/Linux (JAR or installer distribution)

**Deployment Status:**
- ✅ Successful compilation for all targets (Android, iOS, Desktop)
- ✅ Firebase project configured (auth + Firestore)
- ✅ CI/CD with GitHub Actions (3 workflows: On Pull Request, On Merge, On Distribute)
- ✅ Firebase App Distribution for Android APK delivery
- ✅ Desktop JAR artifact available from CI

### **2.5. Security:**

1. **Authentication:**
   - Firebase Auth manages JWT tokens (auto-refresh)
   - Google Sign-In via Credential Manager (Android) / GoogleSignIn SDK (iOS)
   - Session storage: EncryptedSharedPreferences (Android), Keychain (iOS), AES-256-GCM (JVM)

2. **Credential Storage:**
   - Passwords never stored locally (Firebase manages tokens)
   - Session tokens encrypted with AES-256-GCM
   - IV (Initialization Vector) randomly generated, never fixed

3. **Communication:**
   - HTTPS mandatory (Ktor + Certificate Pinning in v2+)
   - Yahoo Finance API keys stored on backend (not in APK)

4. **Input Validation:**
   - Form input sanitization (email, numbers)
   - Server-side rate limiting on APIs

### **2.6. Testing:**

**Unit Tests (Domain layer / Presentation layer):**
All the MVI components and domain/data classes should be covered by Unit Tests.
- ViewModels
- UseCases
- Repositories
- DataSources
- Mappers
- Algorithms
- Converters: Currency, Dividends calculation...

**Integration Tests:**
- Firebase Authentication emulator (local testing)
- Firestore emulator (test data, no prod touch)

---

## 3. Data Model

### **3.1. Entity Relationship Diagram:**

```mermaid
erDiagram
    USER ||--o{ HOLDING : "owns"
    USER ||--o{ WATCHLIST_ENTRY : "watches"
    USER {
        string user_id PK "Firebase UID"
        string email UK
        string display_name
        string currency_code "Base currency (USD, EUR)"
        timestamp created_at
        timestamp updated_at
    }
    
    HOLDING {
        string holding_id PK "Auto-generated UUID"
        string user_id FK "References USER.user_id"
        string ticker UK "Stock symbol (AAPL, MSFT)"
        float purchase_price "Purchase price per share"
        int shares "Share quantity"
        string currency_code "Purchase currency"
        timestamp purchase_date
        timestamp created_at
        timestamp updated_at
    }
    
    WATCHLIST_ENTRY {
        string watchlist_id PK "Auto-generated UUID"
        string user_id FK "References USER.user_id"
        string ticker UK "Stock symbol"
        timestamp added_at
    }
    
    SECURITY {
        string ticker PK "Stock symbol"
        string company_name
        float current_price "Latest close price"
        string currency
        float market_cap
        float pe_ratio "Price-to-Earnings"
        float dividend_yield "Annual yield %"
        timestamp last_updated
    }
    
    SECURITY ||--o{ DIVIDEND_HISTORY : "has"
    DIVIDEND_HISTORY {
        string dividend_id PK
        string ticker FK "References SECURITY.ticker"
        float amount "Dividend per share"
        timestamp ex_date "Ex-dividend date"
        timestamp pay_date "Payment date"
        int frequency "Annual frequency"
    }
    
    SECURITY ||--o{ PRICE_HISTORY : "has"
    PRICE_HISTORY {
        string price_id PK
        string ticker FK "References SECURITY.ticker"
        float price "Close price"
        timestamp date
        int volume
    }
```

### **3.2. Main Entities:**

#### **USER**
Authenticated DiviDox user.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|------------|
| `user_id` | String | PK, NOT NULL | Firebase UID |
| `email` | String | UNIQUE, NOT NULL | Login email |
| `display_name` | String | - | Display name |
| `currency_code` | String | NOT NULL | Base currency for conversions (USD, EUR, GBP) |
| `created_at` | Timestamp | NOT NULL | Registration date |
| `updated_at` | Timestamp | NOT NULL | Last update |

---

#### **HOLDING**
User's equity position.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|------------|
| `holding_id` | String | PK, NOT NULL | Auto-generated UUID |
| `user_id` | String | FK, NOT NULL | Owner |
| `ticker` | String | UNIQUE (per user), NOT NULL | Stock symbol (AAPL, MSFT) |
| `purchase_price` | Float | NOT NULL | Cost per share |
| `shares` | Integer | NOT NULL, > 0 | Share quantity |
| `currency_code` | String | NOT NULL | Purchase currency |
| `purchase_date` | Timestamp | NOT NULL | Purchase date |
| `created_at` | Timestamp | NOT NULL | Creation timestamp |
| `updated_at` | Timestamp | NOT NULL | Last edit timestamp |

---

#### **WATCHLIST_ENTRY**
Securities tracked without ownership.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|------------|
| `watchlist_id` | String | PK, NOT NULL | Auto-generated UUID |
| `user_id` | String | FK, UNIQUE (per user+ticker) | Owner |
| `ticker` | String | NOT NULL | Stock symbol |
| `added_at` | Timestamp | NOT NULL | Addition date |

---

#### **SECURITY**
Market data cache (local + Firestore).

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|------------|
| `ticker` | String | PK, NOT NULL | AAPL, MSFT, GOOGL, etc. |
| `company_name` | String | - | Apple Inc. |
| `current_price` | Float | NOT NULL | Last close price |
| `currency` | String | NOT NULL | Quote currency (USD) |
| `market_cap` | Float | - | Market capitalization |
| `pe_ratio` | Float | - | Price-to-Earnings ratio |
| `dividend_yield` | Float | - | Annual yield (%) |
| `last_updated` | Timestamp | NOT NULL | Last Yahoo Finance fetch |

---

#### **DIVIDEND_HISTORY**
Historical dividend payments (5-10 years).

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|------------|
| `dividend_id` | String | PK, NOT NULL | Auto-generated UUID |
| `ticker` | String | FK, NOT NULL | Security reference |
| `amount` | Float | NOT NULL | Dividend per share |
| `ex_date` | Timestamp | NOT NULL | Ex-dividend date |
| `pay_date` | Timestamp | NOT NULL | Payment date |
| `frequency` | Integer | NOT NULL | Annual frequency (1, 2, 4, 12) |

---

#### **PRICE_HISTORY**
Daily price time series.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|------------|
| `price_id` | String | PK, NOT NULL | Auto-generated UUID |
| `ticker` | String | FK, NOT NULL | Security reference |
| `price` | Float | NOT NULL | Close price |
| `date` | Timestamp | UNIQUE (ticker, date), NOT NULL | Quote date |
| `volume` | Integer | - | Transaction volume |

**Composite Index:** (ticker, date) for fast period queries

---

**Storage:**
- **Firestore** (cloud): USER, HOLDING, WATCHLIST_ENTRY
- **Room Database** (local cache): SECURITY, DIVIDEND_HISTORY, PRICE_HISTORY
- Sync: Nightly or on-demand Firestore → Room

---

## 4. API Specification

DiviDox is primarily a client application. Firebase handles auth + Firestore (proprietary API). External integration is **Yahoo Finance REST API** via RapidAPI.

### **4.1. Yahoo Finance API — Market Data**

**Endpoint 1: Get Latest Quote**
```
GET https://yh-finance.p.rapidapi.com/stock/{ticker}/quote
Headers:
  x-rapidapi-key: {API_KEY}
  x-rapidapi-host: yh-finance.p.rapidapi.com
```

**Request:**
```http
GET /stock/AAPL/quote HTTP/1.1
Host: yh-finance.p.rapidapi.com
```

**Response (200 OK):**
```json
{
  "quote": {
    "symbol": "AAPL",
    "longName": "Apple Inc.",
    "regularMarketPrice": 182.52,
    "regularMarketChange": 1.52,
    "regularMarketChangePercent": 0.84,
    "marketCap": 2800000000000,
    "trailingPE": 29.5,
    "trailingAnnualDividendRate": 0.92,
    "trailingAnnualDividendYield": 0.005,
    "currency": "USD"
  }
}
```

---

**Endpoint 2: Get Historical Data**
```
GET https://yh-finance.p.rapidapi.com/stock/{ticker}/historical-data
Params: interval=1mo (monthly aggregation)
```

**Request:**
```http
GET /stock/AAPL/historical-data?interval=1mo HTTP/1.1
Host: yh-finance.p.rapidapi.com
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "date": "2025-05-15",
      "adjclose": 185.20,
      "close": 185.20,
      "high": 186.50,
      "low": 184.80,
      "open": 185.00,
      "volume": 45000000,
      "dividend": 0.23
    }
  ]
}
```

---

**Endpoint 3: Get Dividend Calendar**
```
GET https://yh-finance.p.rapidapi.com/stock/{ticker}/div-dates
```

**Response (200 OK):**
```json
{
  "upcoming": [
    {
      "exDate": "2025-08-08",
      "payDate": "2025-08-21",
      "amount": 0.24,
      "frequency": "quarterly"
    }
  ],
  "past": [
    {
      "exDate": "2025-05-10",
      "payDate": "2025-05-23",
      "amount": 0.24
    }
  ]
}
```

---

### **4.2. Firebase Firestore — Backend (Proprietary)**

**Main Documents:**

```
/users/{userId}
  - email: string
  - displayName: string
  - baseCurrency: string (USD|EUR)
  - createdAt: timestamp
  - updatedAt: timestamp

/users/{userId}/holdings/{holdingId}
  - ticker: string (AAPL)
  - purchasePrice: number
  - shares: number
  - purchaseCurrency: string
  - purchaseDate: timestamp

/users/{userId}/watchlist/{watchlistId}
  - ticker: string
  - addedAt: timestamp
```

**Firestore Data Model (ERD):**

```mermaid
erDiagram
    USER ||--o{ HOLDING : "owns"
    USER ||--o{ WATCHLIST : "tracks"
    
    USER {
        string userId PK "Firebase UID"
        string email UK "Unique email"
        string displayName
        string baseCurrency "USD, EUR, etc."
        timestamp createdAt
        timestamp updatedAt
    }
    
    HOLDING {
        string holdingId PK "Sub-collection document"
        string userId FK "Parent user reference"
        string ticker UK "Stock symbol"
        number purchasePrice "Cost per share"
        number shares "Share quantity"
        string purchaseCurrency
        timestamp purchaseDate
    }
    
    WATCHLIST {
        string watchlistId PK "Sub-collection document"
        string userId FK "Parent user reference"
        string ticker UK "Stock symbol"
        timestamp addedAt
    }
```

---

## 5. User Stories

For detailed user stories, see [docs/user-stories.md](docs/user-stories.md).

**Key Stories in Delivery 1:**

- **DVX-US-001** — Secure authentication with Google Sign-In
- **DVX-US-006** — View portfolio summary in Dashboard
- **DVX-US-010** — Analyze historical dividend data of a security

Each story includes acceptance criteria, test cases, and story points.

---

## 6. Work Tickets

For detailed work tickets and technical specifications, see [docs/tickets/](docs/tickets/).

**Complete Work Tickets Roadmap (33 tickets):**

| Phase | Ticket ID | Module | Title |
|-------|-----------|--------|-------|
| **Setup** | TK-001 | infra | Initial Setup |
| | TK-002 | infra | Skills Assessment |
| | TK-003 | infra | Symlinks Configuration |
| | TK-004 | infra | Pipeline Setup |
| | TK-005 | infra | Pipeline Rename |
| **Foundation** | TK-006 | gradle | Koin Upgrade |
| | TK-007 | design | Design System Font |
| | TK-008 | docs | Documentation |
| | TK-009 | planning | Ticket Planning |
| | TK-010 | foundation | Session State Foundation |
| **Delivery 1 (Core)** | **TK-011** | **:component:auth** | **Firebase Auth + Google Sign-In** |
| | **TK-012** | **:component:auth** | **Session Lifecycle** |
| | TK-013 | :feature:auth | Feature Auth |
| | **TK-015** | **:integration:market-data** | **Yahoo Finance API + Room Cache** |
| | TK-014 | :component:security | Portfolio Component |
| | TK-016 | :component:security | Watchlist Component |
| | **TK-018** | **:feature:dashboard** | **Dashboard Screen + BottomNav** |
| **Delivery 2 (Features)** | TK-017 | :integration:security | Security Integration |
| | TK-019 | :feature:portfolio | Portfolio Screen |
| | TK-020 | :feature:portfolio | Add/Edit Holdings |
| | TK-021 | :component:dividend | Dividend Component |
| | TK-022 | :integration:dividend | Dividend Integration |
| | TK-023 | :feature:dividends | Dividend Activity Screen |
| | TK-024 | :feature:analysis | Analysis Screen |
| | TK-025 | :feature:favorites | Favorites Feature |
| | TK-026 | :feature:search | Search Feature |
| **Polish & Advanced** | TK-028 | :feature:auth | Biometric Authentication |
| | TK-029 | :feature:settings | Settings Screen |
| | TK-030 | :feature:settings | Export Portfolio |
| | TK-031 | :feature:settings | Delete Account |
| | TK-032 | :feature:settings | About/Terms/Privacy |
| | TK-033 | :feature:notifications | Push Notifications |
| | TK-035 | :feature:dashboard | Market Indices Carousel |

**Highlighted Delivery 1 Tickets (MVP):** TK-011, TK-012, TK-015, TK-018

Each ticket includes:
- Detailed subtasks & acceptance criteria
- Testing requirements & DoD checklist
- Estimated effort (T-shirt sizing)
- Dependencies & relationships

---

## 7. CI/CD Pipeline & Automation

### **7.1. GitHub Actions Workflows**

Three automated GitHub Actions workflows are in place:

| Workflow | Trigger | What it Does |
|----------|---------|--------------|
| [**On Pull Request**](https://github.com/javiercamarenatriguero/dividox/actions/workflows/on-pull-request.yml) | Every PR | Build, detekt, unit tests, security scan |
| [**On Merge**](https://github.com/javiercamarenatriguero/dividox/actions/workflows/on-merge.yml) | Merge to main | Full build + artifact upload (Android APK, Desktop JAR) |
| [**On Distribute**](https://github.com/javiercamarenatriguero/dividox/actions/workflows/on-distribute.yml) | Manual dispatch | Build signed APK + distribute via Firebase App Distribution |

Supporting reusable workflows: `distribute-android-action.yml`, `distribute-desktop-action.yml`.

**CI/CD Dashboard:** https://github.com/javiercamarenatriguero/dividox/actions

| GitHub Actions Overview | On Merge Workflow Detail |
|:-----------------------:|:-----------------------:|
| <img src="docs/images/actions.png" width="500"/> | <img src="docs/images/on_merge_action.png" width="500"/> |

### **7.2. Pull Request Flow**

```
Developer Push
    ↓
[On Pull Request] Compile all platforms + detekt + tests + security scan
    ↓ (fail/pass)
✅ PR Checks Pass → Ready to merge
    ↓
Code Review Approval
    ↓
Merge to main
    ↓
[On Merge] Full build + upload artifacts (APK, Desktop JAR)
    ↓
[On Distribute] (manual) → Firebase App Distribution
```

### **7.3. GitHub Project Board (Kanban)**

All work is tracked on the GitHub Project board with full ticket lifecycle:

**Project Board:** https://github.com/users/javiercamarenatriguero/projects/1

<img src="docs/images/github_project.png" width="800" alt="GitHub Project Board — Kanban" />

---

## 8. Delivery Status

### **8.1. What was delivered in Delivery 1**

- Technical scaffold and project structure (Kotlin Multiplatform)
- CI/CD pipelines (GitHub Actions: On Pull Request, On Merge, On Distribute)
- Firebase Authentication (Email/Password + Google Sign-In)
- Session lifecycle management (token refresh, persist, expiry redirect)
- Market data integration (Yahoo Finance API via RapidAPI + Room cache)
- Dashboard screen with portfolio summary and bottom navigation

### **8.2. What is delivered now — Complete Functional MVP**

**DiviDox is a complete functional MVP deployed and distributed.**

- Sign in with Email/Password or Google (Firebase Auth)
- View portfolio dashboard with key metrics and period selector
- Manage holdings: add new positions, edit existing ones
- Analyze securities with real market data (price charts, fundamentals, dividend metrics)
- Track dividend activity with projections, upcoming payments, and history
- Manage a watchlist of favorite securities
- Search for new securities with real-time suggestions
- Configure settings: default currency, biometric lock, notifications
- Export portfolio data (CSV via native share sheet)
- Delete account with full data cleanup
- Onboarding carousel for new users
- Market indices carousel on dashboard
- News feed on dashboard
- MASVS security tooling
- Native About, Terms of Service, and Privacy Policy screens

The app runs natively on **Android**, **iOS**, and **macOS Desktop** — all from a single Kotlin Multiplatform codebase.

### **8.3. PRD Phases Delivered**

| Phase | Status |
|-------|--------|
| **Setup** — Initial scaffold, skills, symlinks, pipelines | ✅ Delivered in Delivery 1 |
| **Foundation** — Koin, design system, documentation, planning, session state | ✅ Delivered in Delivery 1 |
| **Delivery 1 (Core)** — Auth, session, market data, dashboard | ✅ Delivered in Delivery 1 |
| **Delivery 2 (Features)** — Portfolio, dividends, analysis, favorites, search | ✅ **Complete** |
| **Polish & Advanced** — Biometric, settings, export, delete, about/terms/privacy | ✅ **Complete** |
| **Beyond PRD** — Onboarding, market indices, news feed, security tooling | ✅ **Complete** |

### **8.4. 34 User Stories Implemented**

The backlog comprises 34 user stories across 8 domains — all implemented with Gherkin acceptance criteria. Full details in [`docs/user-stories.md`](docs/user-stories.md).

| Domain | Stories | Tickets |
|--------|---------|---------|
| **Authentication** | DVX-US-001 – 004 | DVX-TK-011 |
| **Dashboard** | DVX-US-005 – 010 | DVX-TK-018 |
| **My Holdings** | DVX-US-011 – 015 | DVX-TK-019, TK-020, TK-014 |
| **Dividend Activity** | DVX-US-016 – 019 | DVX-TK-021, TK-022, TK-023 |
| **Security Analysis** | DVX-US-020 – 022 | DVX-TK-024 |
| **Favorites & Search** | DVX-US-023 – 026 | DVX-TK-025, TK-026, TK-016 |
| **Settings & Security** | DVX-US-027 – 032 | DVX-TK-028, TK-029, TK-030, TK-031, TK-032 |
| **Session Management** | DVX-US-033 – 034 | DVX-TK-012 |

### **8.5. Pull Requests — Complete History**

All PRs are merged to `main` in the [dividox repository](https://github.com/javiercamarenatriguero/dividox/pulls?q=is%3Apr+is%3Amerged).

#### Setup & Foundation (Delivery 1)

| PR | Ticket | Title | Status |
|----|--------|-------|--------|
| [#1](https://github.com/javiercamarenatriguero/dividox/pull/1) | DVX-2 | Add new Skills | ✅ Merged |
| [#2](https://github.com/javiercamarenatriguero/dividox/pull/2) | DVX-3 | Use symlinks | ✅ Merged |
| [#3](https://github.com/javiercamarenatriguero/dividox/pull/3) | DVX-4 | Create on merge & on deploy pipelines | ✅ Merged |
| [#4](https://github.com/javiercamarenatriguero/dividox/pull/4) | DVX-5 | Rename pipelines | ✅ Merged |
| [#5](https://github.com/javiercamarenatriguero/dividox/pull/5) | DVX-6 | Upgrade Koin version | ✅ Merged |
| [#6](https://github.com/javiercamarenatriguero/dividox/pull/6) | DVX-7 | Apply FontText | ✅ Merged |
| [#7](https://github.com/javiercamarenatriguero/dividox/pull/7) | DVX-8 | Create ADRs, PRDs & STs for the given Stitch design | ✅ Merged |
| [#8](https://github.com/javiercamarenatriguero/dividox/pull/8) | DVX-9 | Add tasks and redefine favourites | ✅ Merged |
| [#9](https://github.com/javiercamarenatriguero/dividox/pull/9) | DVX-9 | Update Design kit instructions | ✅ Merged |
| [#10](https://github.com/javiercamarenatriguero/dividox/pull/10) | DVX-10 | Implement SessionState and fix some issues | ✅ Merged |

#### Delivery 1 — Core (Auth, Market, Dashboard)

| PR | Ticket | Title | Status |
|----|--------|-------|--------|
| [#40](https://github.com/javiercamarenatriguero/dividox/pull/40) | DVX-TK-011 | Domain & Data Layer for Authentication | ✅ Merged |
| [#41](https://github.com/javiercamarenatriguero/dividox/pull/41) | DVX-TK-012 | Firebase Auth integration | ✅ Merged |
| [#42](https://github.com/javiercamarenatriguero/dividox/pull/42) | DVX-TK-013 | Auth Screens | ✅ Merged |
| [#43](https://github.com/javiercamarenatriguero/dividox/pull/43) | DVX-TK-014 | Portfolio Component | ✅ Merged |
| [#44](https://github.com/javiercamarenatriguero/dividox/pull/44) | DVX-TK-015 | Component Market | ✅ Merged |
| [#45](https://github.com/javiercamarenatriguero/dividox/pull/45) | DVX-TK-016 | Component Watchlist | ✅ Merged |
| [#47](https://github.com/javiercamarenatriguero/dividox/pull/47) | DVX-TK-018 | Feature Dashboard | ✅ Merged |

#### Delivery 2 — Features (Portfolio, Dividends, Analysis, Favorites, Search)

| PR | Ticket | Title | Status |
|----|--------|-------|--------|
| [#46](https://github.com/javiercamarenatriguero/dividox/pull/46) | DVX-TK-017 | Integration security | ✅ Merged |
| [#48](https://github.com/javiercamarenatriguero/dividox/pull/48) | DVX-TK-019 | Add Portfolio screen | ✅ Merged |
| [#49](https://github.com/javiercamarenatriguero/dividox/pull/49) | DVX-TK-020 | Add/Edit holding & currency converter | ✅ Merged |
| [#50](https://github.com/javiercamarenatriguero/dividox/pull/50) | DVX-TK-021 | Component dividend | ✅ Merged |
| [#51](https://github.com/javiercamarenatriguero/dividox/pull/51) | DVX-TK-022 | Scaffold integration Dividend | ✅ Merged |
| [#52](https://github.com/javiercamarenatriguero/dividox/pull/52) | DVX-TK-023 | Dividends Activity screen | ✅ Merged |
| [#53](https://github.com/javiercamarenatriguero/dividox/pull/53) | DVX-TK-024 | Security detail screen | ✅ Merged |
| [#54](https://github.com/javiercamarenatriguero/dividox/pull/54) | DVX-TK-025 | Feature favorites | ✅ Merged |
| [#55](https://github.com/javiercamarenatriguero/dividox/pull/55) | DVX-TK-026 | Feature search | ✅ Merged |

#### Polish & Advanced

| PR | Ticket | Title | Status |
|----|--------|-------|--------|
| [#56](https://github.com/javiercamarenatriguero/dividox/pull/56) | DVX-TK-027 | Edit holding from security detail | ✅ Merged |
| [#57](https://github.com/javiercamarenatriguero/dividox/pull/57) | DVX-TK-028 | Biometric authenticator | ✅ Merged |
| [#58](https://github.com/javiercamarenatriguero/dividox/pull/58) | DVX-TK-029 | Feature settings | ✅ Merged |
| [#59](https://github.com/javiercamarenatriguero/dividox/pull/59) | DVX-TK-030 | Export Portfolio | ✅ Merged |
| [#60](https://github.com/javiercamarenatriguero/dividox/pull/60) | DVX-TK-031 | Delete Account | ✅ Merged |
| [#66](https://github.com/javiercamarenatriguero/dividox/pull/66) | DVX-TK-032 | Native About / Terms / Privacy Screens | ✅ Merged |

#### Beyond Original PRD

| PR | Ticket | Title | Status |
|----|--------|-------|--------|
| [#68](https://github.com/javiercamarenatriguero/dividox/pull/68) | DVX-TK-035 | Market Indices Carousel | ✅ Merged |
| [#70](https://github.com/javiercamarenatriguero/dividox/pull/70) | DVX-TK-036 | Onboarding Carousel | ✅ Merged |
| [#72](https://github.com/javiercamarenatriguero/dividox/pull/72) | DVX-TK-037 | News Feed on Dashboard | ✅ Merged |
| [#76](https://github.com/javiercamarenatriguero/dividox/pull/76) | DVX-TK-038 | MASVS Security tooling | ✅ Merged |
| [#77](https://github.com/javiercamarenatriguero/dividox/pull/77) | DVX-TK-039 | Prompt YAML file fixed and disable iOS deployment | ✅ Merged |
| [#79](https://github.com/javiercamarenatriguero/dividox/pull/79) | DVX-TK-041 | Add images for the README | ✅ Merged |

**Total: 37 PRs merged** — all implemented with Claude Code as the primary AI coding assistant.

---

## 9. AI Tools & Engineering

DiviDox was built entirely with AI-assisted development. Every phase — from product vision to architecture decisions, UI design, implementation, code review, and security auditing — was driven by AI tooling.

### **9.1. Claude Code — Primary Development Environment**

**Claude Code** (CLI) was the primary coding assistant, used for all implementation, architecture design, documentation, and code review. The project uses two configuration files:

- **`CLAUDE.md`** — Project-level instructions: build commands, architecture rules, convention plugins, spacing/string resource rules, security references, tech stack versions.
- **`AGENTS.md`** — Agent orchestration guide: skill inventory, agent definitions, workflow patterns, and project conventions.

### **9.2. GitHub Copilot — Complementary AI Support**

**GitHub Copilot** is supported in parallel via **symlinks** that share the same context with Claude Code:

```
.ai-context/                          ← Single source of truth
  ├── agents/                         ← Agent definitions
  ├── skills/                         ← All skill definitions
  └── security-instructions.md        ← MASVS security context

.claude/agents   → ../.ai-context/agents      (symlink)
.claude/skills   → ../.ai-context/skills      (symlink)
.github/agents   → ../.ai-context/agents      (symlink)
.github/skills   → ../.ai-context/skills      (symlink)
.github/copilot-instructions.md → ../.ai-context/security-instructions.md (symlink)
```

This ensures **both Claude Code and GitHub Copilot share identical context** — agents, skills, and security instructions — without duplication.

Additionally, a **GitHub Copilot prompt file** (`.github/prompts/masvs-audit.prompt.yml`) provides a structured MASVS security audit prompt for use in Copilot Chat.

### **9.3. `.ai-context/` — Skills & Agents Suite**

The project includes a comprehensive suite of **29 custom skills** and **3 specialized agents**, organized under `.ai-context/`:

**Agents (3):**

| Agent | Role | Skills Used |
|-------|------|-------------|
| **PO (Product Owner)** | Requirements, user stories, tickets, estimation, roadmap | `write-meta-prompt`, `user-story-writer`, `story-map-generator`, `ticket-writer`, `estimate-effort`, `task-planner` |
| **Developer** | Full-stack KMP engineer: domain, UI, DI, navigation, tests | `implement-domain`, `implement-ui`, `implement-di`, `implement-navigation`, `write-unit-test`, `module-organization`, `manage-git-flow`, `audit-compose-performance`, `owasp-security-review` |
| **Code Reviewer** | Architecture compliance, code quality, security, Compose performance | `audit-compose-performance`, `manage-git-flow`, `owasp-security-review` |

**Skills by Category:**

| Category | Skills | Purpose |
|----------|--------|---------|
| **Product & Requirements** | `write-meta-prompt`, `generate-prd`, `product-description`, `product-roadmap`, `user-story-writer`, `story-map-generator`, `ticket-writer`, `estimate-effort`, `task-planner` | Transform ideas into structured requirements, user stories, tickets, and roadmaps |
| **Architecture & Design** | `generate-adr`, `design-c4`, `design-data-model`, `design-md`, `design-system`, `stitch-design`, `module-organization` | Document architecture decisions, generate C4 diagrams, design data models, manage KMP module structure |
| **Implementation** | `implement-domain`, `implement-ui`, `implement-di`, `implement-navigation`, `write-unit-test`, `audit-compose-performance` | Scaffold domain layers, build Compose UI with MVI, wire Koin DI, set up navigation routes, write tests |
| **Quality & Security** | `owasp-security-review`, `manage-git-flow`, `full-doc`, `skill-creator` | OWASP Top 10 review, git flow validation, documentation generation |
| **MASVS Security Suite** | `masvs-checklist`, `masvs-auth-assessment`, `masvs-secure-storage-audit`, `masvs-crypto-review`, `masvs-network-security-check`, `masvs-platform-interaction-review`, `masvs-code-quality-scan`, `masvs-privacy-audit`, `masvs-resilience-assessment`, `masvs-mobile-threat-model` | Full OWASP MASVS v2 compliance suite — 10 specialized security audit skills covering all MASVS categories for a Tier 2 fintech app |

**Typical Feature Workflow:**

```
1. PO Agent       → write-meta-prompt → user-story-writer → story-map-generator
2. PO Agent       → ticket-writer → estimate-effort
3. Developer Agent → implement-domain → implement-ui → implement-di → implement-navigation → write-unit-test
4. Code Reviewer  → owasp-security-review → audit-compose-performance → manage-git-flow
```

### **9.4. MCP Servers (Model Context Protocol)**

The project connects to external services via MCP:

| MCP Server | Purpose |
|------------|---------|
| **Stitch** (`.mcp.json`) | Google's AI design tool — generate, edit, and manage UI screens directly from Claude Code |
| **GitHub** (global plugin) | Repository management, PR operations, issue tracking |
| **Context7** (global plugin) | Up-to-date library documentation lookup during development |
| **Linear** (global plugin) | Issue tracking integration (used during early project planning) |
| **lean-ctx** (global plugin) | Context compression and token-efficient file reading |

### **9.5. Stitch (Google AI) — UX Design Tool**

**[Stitch](https://stitch.withgoogle.com/projects/10568397103146599411)** was used as the primary UI/UX design tool. It generates high-fidelity Material Design 3 screens from text prompts, with a full design system including color palette, typography, spacing, and component definitions.

The project includes:
- A **`.stitch/DESIGN.md`** file — auto-generated design system document with color tokens, typography scale, spacing units, and creative philosophy ("The Financial Architect" theme)
- A **`stitch-design` skill** with 3 workflows: `text-to-design`, `edit-design`, and `generate-design-md`
- All 6 app screens were designed in Stitch and served as the reference for Compose implementation

### **9.6. Gemini — Image Generation**

**Google Gemini** was used to generate images for the project, including promotional graphics and visual assets for documentation.

### **9.7. Looka — Logo Design**

**[Looka](https://looka.com/)** was used to create the DiviDox logo and brand identity.

---

## 10. Prompts

The full prompt catalog covering all project phases is in [`prompts.md`](prompts.md) — 8 sections with 11 prompts covering vision, requirements, architecture, design, tickets, CI/CD, feature implementation, and security tooling.

**Delivery 2 implementation prompt examples** (Section 8 in prompts.md):

| Prompt | Ticket | What It Does |
|--------|--------|--------------|
| **8.1** | DVX-TK-023 | Dividends Activity screen — full MVI scaffold with collapsible month groups and 12-month projection chart |
| **8.2** | DVX-TK-026 | Search feature — 250ms debounced search with SecurityCard results and FAB wiring |
| **8.3** | DVX-TK-035 | Market Indices Carousel — horizontal carousel of 6 global indices loading independently on Dashboard |
| **8.4** | DVX-TK-038 | MASVS Security Tooling — 10 OWASP MASVS v2 audit skills + GitHub Copilot prompt |

---

## License

This project is part of the AI4Devs final practice. All code and documentation are provided for educational purposes.

