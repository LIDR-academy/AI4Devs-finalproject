# SplitEat: System Architecture (C4 Model)

This document provides a detailed view of the SplitEat architecture using the **C4 Model** (Context, Container, and Component) to illustrate how the mobile and offline-first restaurant bill-splitting application is structured.

---

## 1. Level 1: System Context Diagram

The System Context diagram shows how SplitEat interacts with users (comensales) and external services.

```mermaid
graph TD
    %% Users
    Carlos["Carlos (El Organizador)<br>[User - Social Consumer]"]
    Elena["Elena (La Familiar)<br>[User - Family/Group rep]"]

    %% Systems
    SplitEat["SplitEat App<br>[Mobile Web App / PWA]<br>Allows group bill splitting, visual item allocation, and offline operation."]
    
    %% External systems
    GoogleVision["Google Cloud Vision API<br>[External Service]<br>Performs high-accuracy OCR on receipt image."]
    BizumQRCode["Bizum Payment Generator<br>[External Service]<br>Generates QR codes for Bizum peer-to-peer transfers."]

    %% Relationships
    Carlos -->|Takes receipt photo, assigns items, shares total| SplitEat
    Elena -->|Groups family items, views total, pays shares| SplitEat
    SplitEat -->|Requests image text extraction| GoogleVision
    SplitEat -->|Generates dynamic QR codes| BizumQRCode
```

---

## 2. Level 2: Container Diagram

The Container diagram decomposes SplitEat into its frontend application (running in the client's mobile browser) and backend services (Firebase cloud infrastructure). It highlights the **offline-first** design where the client holds the state and database locally.

```mermaid
graph TB
    subgraph ClientMobile ["Client (Mobile Web Browser / PWA)"]
        SPA["React SPA Container<br>[React, Vite, TypeScript]<br>Provides interactive UI, Drag & Drop table, Penny Adjustment, and Local OCR."]
        DexieDB[("IndexedDB (Dexie.js)<br>[Local Database]<br>Stores receipts, items, participants, and offline session state.")]
        TesseractLocal["Tesseract.js Engine<br>[WebAssembly WASM]<br>Performs client-side local OCR when offline."]
    end

    subgraph FirebaseCloud ["Backend (Cloud Services - Firebase)"]
        FirebaseAuth["Firebase Authentication<br>[Auth Service]<br>Handles optional user login & session verification."]
        Firestore[("Cloud Firestore DB<br>[NoSQL DB]<br>Stores synced receipt history, contacts, and preferences for registered users.")]
        CloudFunctions["Firebase Cloud Functions<br>[Node.js Serverless]<br>Acts as the secure API gateway for cloud services."]
    end

    subgraph ExternalServices ["External Systems"]
        VisionAPI["Google Cloud Vision API<br>[Google Cloud API]<br>Extracts raw receipt text from uploaded images."]
    end

    %% Client Internal Connections
    SPA -->|Read / Write State| DexieDB
    SPA -->|Processes offline image| TesseractLocal

    %% Client to Cloud Connections
    SPA -->|User Authentication| FirebaseAuth
    SPA -->|Schedules cloud sync| Firestore
    SPA -->|Uploads receipt photo for OCR| CloudFunctions

    %% Cloud Internal & External Connections
    CloudFunctions -->|Extracts text| VisionAPI
    DexieDB -.->|Syncs data on auth success| Firestore
```

---

## 3. Level 3: Component Diagram

This diagram decomposes the **React SPA** (client-side container) and the **Firebase Cloud Functions** (serverless API container) into their internal logical components.

### 3.1 Client Components (React SPA)

```mermaid
graph TD
    subgraph SPA_Frontend ["React Single Page Application"]
        UI_Router["App Router<br>[React Router]<br>Controls views (Capture, Split Board, Dictation, History)."]
        
        %% State & Logic
        StateManager["Core State Manager<br>[React Context / Custom Hooks]<br>Orchestrates items, participants, and allocations."]
        RoundingEngine["Rounding & Adjustment Engine<br>[TS Helper]<br>Runs Penny Adjustment Algorithm to ensure matching totals."]
        
        %% OCR pipeline
        OCRController["OCR Parser & Controller<br>[TS Service]<br>Decides between Local WASM and Cloud OCR based on connectivity status."]
        RegexParser["Receipt Regex Engine<br>[TS Helper]<br>Parses raw OCR text into items, prices, and taxes."]

        %% UI Components
        SplitBoard["Interactive Split Board<br>[React Component]<br>Render drag-and-drop table and assign items to participants."]
        DictationView["Dictation Mode View<br>[React Component]<br>Generates card-based screen for reading totals to waiter."]
        GamificationWheel["Spinner Wheel Component<br>[Canvas / CSS]<br>Runs 'La Ruleta del Pagador' game for unassigned cents/dishes."]

        %% Data Wrapper
        LocalDBRepo["Local Database Repo<br>[Dexie.js Wrapper]<br>Performs CRUD transactions with IndexedDB."]
        SyncManager["Cloud Sync Manager<br>[TS Service]<br>Reconciles IndexedDB diffs with Firestore on login."]
    end

    %% UI Connections
    UI_Router --> SplitBoard
    UI_Router --> DictationView
    UI_Router --> GamificationWheel

    %% Logical flow
    SplitBoard --> StateManager
    StateManager --> RoundingEngine
    OCRController --> RegexParser
    RegexParser --> StateManager
    StateManager --> LocalDBRepo
    LocalDBRepo --> SyncManager
```

### 3.2 Backend Components (Firebase Functions)

```mermaid
graph TD
    subgraph ServerlessBackend ["Firebase Cloud Functions"]
        AuthGuard["Auth & Rate Limit Middleware<br>[Express Middleware]<br>Validates tokens and enforces API quotas."]
        
        OCRHandler["OCR Processing Handler<br>[Cloud Function]<br>Receives base64 image, uploads to Cloud Storage, and queries Cloud Vision API."]
        
        BizumHandler["Bizum QR Generator Handler<br>[Cloud Function]<br>Generates secure Bizum dynamic QR codes based on telephone and amount."]
    end

    %% Internal Routing
    AuthGuard --> OCRHandler
    AuthGuard --> BizumHandler
```

---

## 4. Level 4: Code Diagram (Selected Module)

For the critical **Penny Adjustment Algorithm** (mitigating decimal rounding discrepancies), the logical structure is detailed below.

```mermaid
classDiagram
    class BillSplittingController {
        +items: Item[]
        +participants: Participant[]
        +adjustPennyDiscrepancy()
        +allocateItem(itemId, participantId, proportion)
    }

    class Item {
        +id: String
        +name: String
        +price: Number
        +allocations: Allocation[]
        +getSplitShares()
    }

    class Allocation {
        +participantId: String
        +percentage: Number
        +calculatedAmount: Number
    }

    class AllocationUpdate {
        +participantId: String
        +adjustedDifference: Number
    }

    class PennyAdjustmentAlgorithm {
        +adjust(totalBill: Number, participants: Participant[]): AllocationUpdate[]
    }

    BillSplittingController --> Item : manages
    Item --> Allocation : composed of
    BillSplittingController ..> PennyAdjustmentAlgorithm : uses
    PennyAdjustmentAlgorithm ..> AllocationUpdate : creates
```
