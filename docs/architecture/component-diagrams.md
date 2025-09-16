# 🔧 Component Diagrams - Nura Microkernel Architecture

## 🏗️ Resumen Arquitectónico

La arquitectura de Nura implementa un **Microkernel Pattern híbrido** que integra **DDD + Screaming Architecture + Vertical Slicing + Clean Architecture**. El sistema se organiza en un **nura-core (kernel)** central que orquesta **plugins especializados**, donde cada plugin representa un Bounded Context con vertical slices internos.

### Principios de Diseño Híbridos

- **Microkernel Pattern**: nura-core como hub central, plugins como bounded contexts
- **DDD Integration**: Plugins = BCs, Kernel = Shared Kernel, Event-driven integration
- **Screaming Architecture**: Estructura revela intención a múltiples niveles (macro + micro)
- **Vertical Slicing**: Features completos end-to-end dentro de cada plugin
- **Clean Architecture**: Dependency inversion dentro de cada plugin
- **Plugin Extensibility**: Hot-swappable plugins con registration dinámico

---

## 🟣 Nura-Core (Microkernel)

**Responsabilidad**: Hub central que provee servicios de infraestructura compartidos y orquesta comunicación entre plugins.

### 🔧 Kernel Architecture Overview

```mermaid
graph TB
    subgraph "🟣 NURA-CORE (Microkernel)"
        subgraph "Core Services"
            NR[🔄 nura-router<br/>Intent Routing & Distribution]
            NPM[🔌 nura-plugin-manager<br/>Plugin Lifecycle Management]
            EB[📡 event-bus<br/>Async Pub/Sub Communication]
            CS[💾 context-store<br/>Shared Memory & Session State]
        end
        
        subgraph "Intelligence Services"
            VR[🔍 vector-retriever<br/>Vector Database Search Interface]
            VG[🤖 vector-generator<br/>Embedding Generation Service]
            LLM[🧠 nura-llm-gateway<br/>LLM Orchestration & Fallbacks]
            CONF[📊 nura-confidence-engine<br/>Response Quality Scoring]
        end
        
        subgraph "Infrastructure Services"
            SEC[🔒 nura-security<br/>Auth, RBAC, Rate Limiting]
            OAUTH[🔐 nura-oauth<br/>Social Auth & Corporate SSO]
            CFG[⚙️ nura-config<br/>Feature Flags & Tenant Config]
            TEL[📊 nura-telemetry<br/>Observability & Metrics]
            PER[💾 nura-persistence<br/>Data Layer Abstractions]
            API[📡 nura-api<br/>Public REST/WebSocket Surface]
        end
    end
    
    %% Core Service Dependencies
    NR --> EB
    NR --> CS
    NR --> CONF
    NPM --> EB
    NPM --> CFG
    
    %% Intelligence Service Dependencies  
    VR --> PER
    VG --> LLM
    LLM --> TEL
    CONF --> CS
    
    %% Infrastructure Dependencies
    API --> SEC
    API --> OAUTH
    API --> NR
    SEC --> OAUTH
    OAUTH --> PER
    OAUTH --> CFG
    TEL --> PER
    CFG --> PER
```

### 🔧 Kernel Components Deep Dive

#### Core Services Layer

**nura-router**

**Responsabilidad**: Análisis inteligente de intenciones de usuario y enrutamiento dinámico hacia plugins especializados con balanceo de carga

```mermaid
graph LR
    subgraph "nura-router"
        IR[🎯 Intent Recognition]
        PS[🔌 Plugin Selection]
        LB[⚖️ Load Balancing]
        RT[🔄 Request Transformation]
    end
    
    UserQuery[👤 User Query] --> IR
    IR --> PS
    PS --> LB
    LB --> RT
    RT --> TargetPlugin[🎯 Target Plugin]
    
    PluginRegistry[📋 Plugin Registry] --> PS
    RoutingRules[📏 Routing Rules] --> PS
```

**nura-plugin-manager**

**Responsabilidad**: Gestión completa del ciclo de vida de plugins incluyendo registro, dependencias, salud y hot-swapping

```mermaid
graph TB
    subgraph "nura-plugin-manager"
        PR[📋 Plugin Registry]
        LC[🔄 Lifecycle Controller]
        DC[🔗 Dependency Controller]
        HC[💓 Health Checker]
    end
    
    PluginManifest[📄 Plugin Manifest] --> PR
    PR --> LC
    LC --> DC
    DC --> HC
    
    LC --> PluginInstance[🔌 Plugin Instance]
    HC --> PluginStatus[📊 Plugin Status]
```

**event-bus**

**Responsabilidad**: Comunicación asíncrona inter-plugin con pub/sub, enrutamiento inteligente y manejo de fallos

```mermaid
graph TB
    subgraph "event-bus"
        EP[Event Publisher]
        ES[Event Subscriber]
        ER[Event Router]
        EQ[Event Queue]
    end
    
    Plugin1[Plugin 1] --> EP
    EP --> ER
    ER --> EQ
    EQ --> ES
    ES --> Plugin2[Plugin 2]
    
    EventFilters[Event Filters] --> ER
    RetryLogic[Retry Logic] --> EQ
```

**context-store**

**Responsabilidad**: Gestión centralizada de estado de sesión, contexto conversacional y preferencias con políticas de privacidad

```mermaid
graph TB
    subgraph "context-store"
        SM[Session Manager]
        CM[Context Manager]
        PM[Privacy Manager]
        EM[Expiration Manager]
    end
    
    SessionData[Session Data] --> SM
    ConversationContext[Conversation Context] --> CM
    UserPreferences[User Preferences] --> PM
    TTLPolicies[TTL Policies] --> EM
    
    SM --> SharedMemory[Shared Memory Store]
    CM --> SharedMemory
    PM --> SharedMemory
    EM --> SharedMemory
```

---

## 🚀 Advanced RAG Strategies Implementation

### 🔄 Late Chunking Strategy Component

**Responsabilidad**: Contextualización dinámica de chunks post-retrieval para mejora de relevancia

```mermaid
graph TB
    subgraph "🟢 late-chunking-service/ (Feature Slice)"
        subgraph "Presentation Layer"
            LCA[Late Chunking API Handler]
            LCE[Late Chunking Events Handler]
        end
        subgraph "Application Layer"
            LCO[Late Chunking Orchestrator]
            CBA[Contextual Boundary Analyzer]
            DCR[Dynamic Chunk Reconstructor]
        end
        subgraph "Domain Layer"
            LC[Late Chunking Strategy]
            CB[Contextual Boundaries]
            CEE[Chunk Expansion Engine]
        end
        subgraph "Infrastructure Layer"
            ChunkRepo[Chunk Repository]
            ContextCache[Context Cache]
            SemanticAnalyzer[Semantic Analyzer]
        end
    end
    
    %% External dependencies
    VR[vector-retriever] --> LCA
    LCA --> LCO
    LCO --> CBA
    LCO --> DCR
    CBA --> CB
    DCR --> CEE
    CEE --> ChunkRepo
    CB --> ContextCache
    CBA --> SemanticAnalyzer
    
    %% Output flow
    DCR --> ContextualizedChunks[Contextualized Chunks]
    ContextualizedChunks --> LLM[nura-llm-gateway]
```

### 🎯 Contextual Retrieval Strategy Component

**Responsabilidad**: Enriquecimiento contextual de chunks antes del embedding y híbrido BM25+semantic

```mermaid
graph TB
    subgraph "🟢 contextual-retrieval/ (Feature Slice)"
        subgraph "Presentation Layer"
            CRA[Contextual Retrieval API Handler]
            CRE[Contextual Retrieval Events Handler]
        end
        subgraph "Application Layer"
            CRO[Contextual Retrieval Orchestrator]
            CPE[Context Prefix Engine]
            HSE[Hybrid Search Engine]
            QEE[Query Expansion Engine]
        end
        subgraph "Domain Layer"
            CR[Contextual Retrieval Strategy]
            CP[Context Prefixing]
            HS[Hybrid Search Algorithm]
            QE[Query Expansion]
        end
        subgraph "Infrastructure Layer"
            BM25[BM25 Index]
            VectorDB[Vector Database]
            CrossRefEngine[Cross-Reference Engine]
            ContextExtractor[Context Extractor]
        end
    end
    
    %% Input flow
    UserQuery[User Query] --> CRA
    DocumentCorpus[Document Corpus] --> ContextExtractor
    
    %% Processing flow
    CRA --> CRO
    CRO --> CPE
    CRO --> HSE
    CRO --> QEE
    
    %% Context enrichment
    CPE --> CP
    CP --> ContextExtractor
    ContextExtractor --> EnrichedChunks[Context-Enriched Chunks]
    
    %% Hybrid search
    HSE --> HS
    HS --> BM25
    HS --> VectorDB
    BM25 --> HybridResults[Hybrid Search Results]
    VectorDB --> HybridResults
    
    %% Query expansion
    QEE --> QE
    QE --> ExpandedQuery[Expanded Query Context]
    
    %% Cross-referencing
    CrossRefEngine --> RelatedChunks[Cross-Referenced Chunks]
    
    %% Final output
    HybridResults --> FinalResults[Contextual Search Results]
    RelatedChunks --> FinalResults
    EnrichedChunks --> VG[vector-generator]
```

### 🤖 Advanced RAG Integration Flow

```mermaid
sequenceDiagram
    participant User
    participant CR as Contextual Retrieval
    participant VG as Vector Generator
    participant VR as Vector Retriever
    participant LC as Late Chunking
    participant LLM as LLM Gateway

    Note over User,LLM: Enhanced RAG Pipeline with Late Chunking + Contextual Retrieval
    
    %% Ingestion Phase (Contextual Retrieval)
    User->>CR: Document ingestion request
    CR->>CR: Extract document context
    CR->>CR: Generate contextual prefixes
    CR->>CR: Create enriched chunks
    CR->>VG: Generate embeddings for enriched chunks
    VG->>VG: Store context-enhanced embeddings
    
    %% Query Phase (Hybrid Search)
    User->>CR: Search query
    CR->>CR: Expand query with context
    CR->>CR: Execute hybrid BM25+Vector search
    CR->>VR: Retrieve candidate chunks
    
    %% Late Chunking Phase
    VR->>LC: Raw retrieved chunks
    LC->>LC: Analyze contextual boundaries
    LC->>LC: Dynamic chunk reconstruction
    LC->>LC: Expand chunks with missing context
    LC->>LC: Re-contextualize based on query
    
    %% Final Processing
    LC->>LLM: Contextualized, expanded chunks
    LLM->>LLM: Generate enhanced response
    LLM->>User: Contextually-aware answer
    
    Note over CR,LC: Cross-reference engine ensures chunk relationships preserved
    Note over LC,LLM: Late chunking maximizes context without embedding size limits
```

---

## 🔌 Plugin Architecture Overview

### Plugin Ecosystem

**Responsabilidad**: Arquitectura completa de plugins organizados por bounded contexts con comunicación bidireccional con kernel central

```mermaid
graph TB
    subgraph "🟣 NURA-CORE"
        KERNEL[Microkernel Services]
    end
    
    subgraph "🔵 AGENTS PLUGINS (BC)"
        DevAgent[dev-agent]
        PMAgent[pm-agent] 
        ArchAgent[architect-agent]
    end
    
    subgraph "🔵 ORCHESTRATION PLUGINS (BC)"
        AgentTeams[agent-teams]
        Workflows[workflows]
    end
    
    subgraph "🔵 CONNECTORS PLUGINS (BC)"
        AWSConn[aws-connector]
        ConfConn[confluence-connector]
        BitConn[bitbucket-connector]
    end
    
    subgraph "🔵 INTERFACES PLUGINS (BC)"
        StreamlitUI[streamlit-interface]
        ReactUI[react-interface]
    end
    
    subgraph "🟢 RESOURCES PLUGINS (BC)"
        PostgresDB[postgresql]
        RedisCache[redis]
        Templates[templates]
        Tasks[tasks]
        Checklists[checklists]
        Data[data]
    end
    
    subgraph "🟣 MODELS PLUGINS (BC)"
        AWSBedrock[aws-bedrock]
        AWSSageMaker[aws-sagemaker]
    end
    
    KERNEL <==> DevAgent
    KERNEL <==> PMAgent
    KERNEL <==> ArchAgent
    KERNEL <==> AgentTeams
    KERNEL <==> Workflows
    KERNEL <==> AWSConn
    KERNEL <==> ConfConn
    KERNEL <==> BitConn
    KERNEL <==> StreamlitUI
    KERNEL <==> ReactUI
    KERNEL <==> PostgresDB
    KERNEL <==> RedisCache
    KERNEL <==> Templates
    KERNEL <==> Tasks
    KERNEL <==> Checklists
    KERNEL <==> Data
    KERNEL <==> AWSBedrock
    KERNEL <==> AWSSageMaker
```

### Plugin Registration Pattern

**Responsabilidad**: Protocolo estandardizado de registro y activación de plugins con validación de dependencias y capacidades

```mermaid
sequenceDiagram
    participant Plugin
    participant PluginManager as nura-plugin-manager
    participant EventBus as event-bus
    participant Router as nura-router
    
    Plugin->>PluginManager: register(manifest)
    PluginManager->>PluginManager: validate_dependencies()
    PluginManager->>EventBus: subscribe_to_events(plugin_events)
    PluginManager->>Router: register_capabilities(plugin_capabilities)
    PluginManager->>Plugin: registration_complete(plugin_id)
    
    Note over Plugin,Router: Plugin is now discoverable and can receive events
    
    Router->>Plugin: route_request(user_query)
    Plugin->>EventBus: publish_event(response_event)
    EventBus->>Router: notify_completion()
```

#### Infrastructure Services Layer

**nura-oauth (Social Authentication & Corporate SSO)**

**Responsabilidad**: Autenticación corporativa integrada con Google Workspace, mapeo de dominios y gestión de sesiones SSO

```mermaid
graph TB
    subgraph "nura-oauth"
        subgraph "OAuth Flow Management"
            OFM[OAuth Flow Manager]
            TC[Token Controller]
            RC[Refresh Controller]
            CB[Callback Handler]
        end
        
        subgraph "Provider Integration"
            GP[Google Provider]
            GSK[Google Workspace Integration]
            AD[Admin Directory API]
            GM[Google Groups Mapping]
        end
        
        subgraph "Corporate Domain Management"
            DV[Domain Validator]
            DM[Domain Manager]
            RM[Role Mapper]
            PS[Profile Synchronizer]
        end
        
        subgraph "Session Management"
            SSO[SSO Controller]
            SM[Session Manager]
            AL[Account Linker]
            SH[Security Handler]
        end
    end
    
    %% External Dependencies
    GoogleAPI[Google OAuth 2.0 API]
    GoogleWS[Google Workspace Admin SDK]
    Redis[(Redis Session Store)]
    DB[(OAuth Database)]
    
    %% Flow connections
    OFM --> GP
    OFM --> CB
    TC --> RC
    CB --> TC
    
    %% Provider connections
    GP --> GoogleAPI
    GSK --> GoogleWS
    AD --> GoogleWS
    GM --> GoogleWS
    
    %% Domain management
    DV --> DM
    RM --> GM
    PS --> AD
    
    %% Session management
    SSO --> SM
    SM --> AL
    AL --> SH
    
    %% Storage connections
    TC --> Redis
    SM --> Redis
    DM --> DB
    PS --> DB
    AL --> DB
    
    %% Security integration
    SH --> SEC[nura-security]
```

**nura-oauth Integration with nura-security**

**Responsabilidad**: Integración fluida entre autenticación OAuth y sistema de seguridad para validación y creación de contexto

```mermaid
graph LR
    subgraph "OAuth Integration Flow"
        OAuth[nura-oauth] --> Auth{Authentication Type}
        Auth -->|Social Login| OAuthFlow[OAuth 2.0 Flow]
        Auth -->|Account Linking| LinkFlow[Account Link Flow]
        Auth -->|SSO| SSOFlow[Single Sign-On Flow]
        
        OAuthFlow --> TokenValidation[Token Validation]
        LinkFlow --> TokenValidation
        SSOFlow --> TokenValidation
        
        TokenValidation --> Security[nura-security]
        Security --> RBAC[Role Assignment]
        Security --> SessionCreation[JWT Session Creation]
        
        RBAC --> UserContext[User Security Context]
        SessionCreation --> UserContext
        UserContext --> AuthSuccess[Authenticated User]
    end
    
    subgraph "External Integrations"
        GoogleAPI[Google OAuth API]
        GoogleWS[Google Workspace]
        Redis[(Session Store)]
        DB[(User Database)]
    end
    
    OAuthFlow --> GoogleAPI
    LinkFlow --> GoogleWS
    SSOFlow --> Redis
    TokenValidation --> DB
```

---

## 🔵 Agent Plugins (Bounded Context)

### Dev Agent Plugin

**Responsabilidad**: Mentoring técnico contextual con educación de negocio integrada

```mermaid
graph TB
    subgraph "🔵 dev-agent Plugin (BC)"
        subgraph "🟢 mentoring/ (Feature Slice)"
            subgraph "Presentation Layer"
                MA[Mentoring API Handler]
                ME[Mentoring Events Handler]
            end
            subgraph "Application Layer"  
                MO[Mentoring Orchestrator]
                BCM[Business Context Mixer]
            end
            subgraph "Domain Layer"
                MS[Mentorship Session]
                LP[Learning Path]
            end
            subgraph "Infrastructure Layer"
                MR[Mentoring Repository]
                KI[Knowledge Indexer]
            end
        end
        
        subgraph "🟢 code-analysis/ (Feature Slice)"
            subgraph "Presentation Layer"
                CAA[Code Analysis API Handler]
                CAE[Code Analysis Events Handler]
            end
            subgraph "Application Layer"
                CAS[Code Analysis Service]
                QAS[Quality Assessment Service]
            end
            subgraph "Domain Layer"
                CA[Code Analysis]
                QM[Quality Metrics]
            end
            subgraph "Infrastructure Layer"
                CR[Code Repository Interface]
                AST[AST Parser]
            end
        end
        
        subgraph "🟢 learning-paths/ (Feature Slice)"
            subgraph "Presentation Layer"
                LPA[Learning Path API Handler]
                LPE[Learning Path Events Handler]
            end
            subgraph "Application Layer"
                LPM[Learning Path Manager]
                SA[Skill Assessor]
            end
            subgraph "Domain Layer"
                LearningPath[Learning Path Entity]
                Skill[Skill Assessment]
            end
            subgraph "Infrastructure Layer"
                LPR[Learning Path Repository]
                PT[Progress Tracker]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    MA --> MO
    ME --> MO
    MO --> MS
    MO --> BCM
    MS --> MR
    BCM --> KI
    
    CAA --> CAS  
    CAE --> CAS
    CAS --> CA
    CAS --> QAS
    CA --> CR
    QAS --> AST
    
    LPA --> LPM
    LPE --> LPM
    LPM --> LearningPath
    SA --> Skill
    LearningPath --> LPR
    Skill --> PT
```

### PM Agent Plugin

**Responsabilidad**: Business context, requirements analysis, y project management guidance

```mermaid
graph TB
    subgraph "🔵 pm-agent Plugin (BC)"
        subgraph "🟢 requirements/ (Feature Slice)"
            subgraph "Presentation Layer"
                RA[Requirements API Handler]
                RE[Requirements Events Handler]
            end
            subgraph "Application Layer"
                RAn[Requirements Analyzer]
                VS[Validation Service]
            end
            subgraph "Domain Layer"
                Req[Requirement Entity]
                AC[Acceptance Criteria]
            end
            subgraph "Infrastructure Layer"
                RR[Requirements Repository]
                CT[Confluence Tool]
            end
        end
        
        subgraph "🟢 business-context/ (Feature Slice)"
            subgraph "Presentation Layer"
                BCA[Business Context API Handler]
                BCE[Business Context Events Handler]
            end
            subgraph "Application Layer"
                BCAn[Business Context Analyzer]
                RM[Rules Mapper]
            end
            subgraph "Domain Layer"
                BC[Business Context]
                BR[Business Rule]
            end
            subgraph "Infrastructure Layer"
                BCR[Business Context Repository]
                BI[Business Intelligence Store]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    RA --> RAn
    RE --> RAn
    RAn --> Req
    VS --> AC
    Req --> RR
    AC --> CT
    
    BCA --> BCAn
    BCE --> BCAn
    BCAn --> BC
    RM --> BR
    BC --> BCR
    BR --> BI
```

### Architect Agent Plugin

**Responsabilidad**: Architectural guidance, pattern recommendations, system design

```mermaid
graph TB
    subgraph "🔵 architect-agent Plugin (BC)"
        subgraph "🟢 system-design/ (Feature Slice)"
            subgraph "Presentation Layer"
                SDA[System Design API Handler]
                SDE[System Design Events Handler]
            end
            subgraph "Application Layer"
                SDAn[System Design Analyzer]
                PA[Pattern Advisor]
            end
            subgraph "Domain Layer"
                SD[System Design]
                AP[Architecture Pattern]
            end
            subgraph "Infrastructure Layer"
                SDR[System Design Repository]
                PR[Pattern Repository]
            end
        end
        
        subgraph "🟢 quality-assessment/ (Feature Slice)"
            subgraph "Presentation Layer"
                QAA[Quality Assessment API Handler]
                QAE[Quality Assessment Events Handler]
            end
            subgraph "Application Layer"
                QAAn[Quality Analyzer]
                DA[Debt Analyzer]
            end
            subgraph "Domain Layer"
                QA[Quality Attribute]
                TD[Technical Debt]
            end
            subgraph "Infrastructure Layer"
                QAR[Quality Assessment Repository]
                MA[Metrics Aggregator]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    SDA --> SDAn
    SDE --> SDAn
    SDAn --> SD
    PA --> AP
    SD --> SDR
    AP --> PR
    
    QAA --> QAAn
    QAE --> QAAn
    QAAn --> QA
    DA --> TD
    QA --> QAR
    TD --> MA
```

---

## 🔵 Interface Plugins (Bounded Context)

### Streamlit Interface Plugin (MVP)

**Responsabilidad**: Interface minimalista para validación rápida de hipótesis

```mermaid
graph TB
    subgraph "🔵 streamlit-interface Plugin (BC)"
        subgraph "🟢 chat-experience/ (Feature Slice)"
            subgraph "Presentation Layer"
                CI[Chat Interface Component]
                MI[Message Input Component]
            end
            subgraph "Application Layer"
                CM[Chat Manager]
                RM[Response Manager]
            end
            subgraph "Domain Layer"
                ChatSession[Chat Session]
                Message[Message Entity]
            end
            subgraph "Infrastructure Layer"
                SS[Session State Manager]
                WS[WebSocket Client]
            end
        end
        
        subgraph "🟢 conversation-history/ (Feature Slice)"
            subgraph "Presentation Layer"
                CL[Conversation List Component]
                CS[Conversation Sidebar]
            end
            subgraph "Application Layer"
                ConvManager[Conversation Manager]
            end
            subgraph "Domain Layer"
                Conversation[Conversation Entity]
            end
            subgraph "Infrastructure Layer"
                ConvStore[Conversation Store]
            end
        end
        
        subgraph "🟢 agent-status/ (Feature Slice)"
            subgraph "Presentation Layer"
                ASC[Agent Status Component]
                MC[Metrics Component]
            end
            subgraph "Application Layer"
                SM[Status Manager]
            end
            subgraph "Domain Layer"
                AgentStatus[Agent Status]
            end
            subgraph "Infrastructure Layer"
                SC[Status Cache]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            SC[Streamlit Config]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    CI --> CM
    MI --> RM
    CM --> ChatSession
    RM --> Message
    ChatSession --> SS
    Message --> WS
    
    CL --> ConvManager
    CS --> ConvManager
    ConvManager --> Conversation
    Conversation --> ConvStore
    
    ASC --> SM
    MC --> SM
    SM --> AgentStatus
    AgentStatus --> SC
```

### React Interface Plugin (Future)

**Responsabilidad**: Interface avanzada para producción con features empresariales

```mermaid
graph TB
    subgraph "🔵 react-interface Plugin (BC)"
        subgraph "🟢 advanced-chat/ (Feature Slice)"
            subgraph "Presentation Layer"
                ACI[Advanced Chat Interface]
                RTM[Real-time Messaging]
                VI[Voice Interface]
            end
            subgraph "Application Layer"
                ACM[Advanced Chat Manager]
                WM[WebSocket Manager]
                VM[Voice Manager]
            end
            subgraph "Domain Layer"
                AdvancedSession[Advanced Chat Session]
                VoiceMessage[Voice Message]
            end
            subgraph "Infrastructure Layer"
                RTStore[Real-time Store]
                VAI[Voice AI Interface]
            end
        end
        
        subgraph "🟢 analytics-dashboard/ (Feature Slice)"
            subgraph "Presentation Layer"
                AD[Analytics Dashboard]
                UD[Usage Dashboard]
                CD[Cost Dashboard]
            end
            subgraph "Application Layer"
                AM[Analytics Manager]
                UM[Usage Manager]
                CoM[Cost Manager]
            end
            subgraph "Domain Layer"
                Analytics[Analytics Entity]
                Usage[Usage Metrics]
                Cost[Cost Tracking]
            end
            subgraph "Infrastructure Layer"
                ADB[Analytics Database]
                TS[Time Series Store]
            end
        end
        
        subgraph "🟢 user-preferences/ (Feature Slice)"
            subgraph "Presentation Layer"
                UPC[User Preferences Component]
                TC[Theme Controller]
            end
            subgraph "Application Layer"
                UPM[User Preference Manager]
                TM[Theme Manager]
            end
            subgraph "Domain Layer"
                UserPref[User Preferences]
                Theme[Theme Settings]
            end
            subgraph "Infrastructure Layer"
                UPS[User Preference Store]
                LS[Local Storage]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            RC[React Config]
            SM[State Manager - Zustand]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    ACI --> ACM
    RTM --> WM
    VI --> VM
    ACM --> AdvancedSession
    WM --> RTStore
    VM --> VAI
    
    AD --> AM
    UD --> UM
    CD --> CoM
    AM --> Analytics
    UM --> Usage
    CoM --> Cost
    Analytics --> ADB
    Usage --> TS
    
    UPC --> UPM
    TC --> TM
    UPM --> UserPref
    TM --> Theme
    UserPref --> UPS
    Theme --> LS
```

---

## 🔵 Orchestration Plugins (Bounded Context)

### Agent Teams Plugin

**Responsabilidad**: Gestión de equipos de agentes preconfigurados para propósitos específicos

```mermaid
graph TB
    subgraph "🔵 agent-teams Plugin (BC)"
        subgraph "🟢 team-management/ (Feature Slice)"
            subgraph "Presentation Layer"
                TMA[Team Management API Handler]
                TME[Team Management Events Handler]
            end
            subgraph "Application Layer"
                TMM[Team Manager]
                TC[Team Coordinator]
            end
            subgraph "Domain Layer"
                Team[Agent Team]
                TeamConfig[Team Configuration]
            end
            subgraph "Infrastructure Layer"
                TR[Team Repository]
                AR[Agent Registry]
            end
        end
        
        subgraph "🟢 team-execution/ (Feature Slice)"
            subgraph "Presentation Layer"
                TEA[Team Execution API Handler]
                TEE[Team Execution Events Handler]
            end
            subgraph "Application Layer"
                TEM[Team Execution Manager]
                SO[Synchronization Orchestrator]
            end
            subgraph "Domain Layer"
                TeamExecution[Team Execution]
                SyncStrategy[Sync Strategy]
            end
            subgraph "Infrastructure Layer"
                TER[Team Execution Repository]
                ESM[Execution State Manager]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    TMA --> TMM
    TME --> TMM
    TMM --> Team
    TC --> TeamConfig
    Team --> TR
    TeamConfig --> AR
    
    TEA --> TEM
    TEE --> TEM
    TEM --> TeamExecution
    SO --> SyncStrategy
    TeamExecution --> TER
    SyncStrategy --> ESM
```

### 🔄 Workflows Plugin

**Responsabilidad**: Definición y ejecución de workflows YAML con secuencias de pasos y condiciones

```mermaid
graph TB
    subgraph "🔵 workflows Plugin (BC)"
        subgraph "🟢 workflow-definition/ (Feature Slice)"
            subgraph "Presentation Layer"
                WDA[Workflow Definition API Handler]
                WDE[Workflow Definition Events Handler]
            end
            subgraph "Application Layer"
                WDM[Workflow Definition Manager]
                YP[YAML Parser]
            end
            subgraph "Domain Layer"
                WorkflowDef[Workflow Definition]
                Step[Workflow Step]
            end
            subgraph "Infrastructure Layer"
                WDR[Workflow Definition Repository]
                YS[YAML Store]
            end
        end
        
        subgraph "🟢 workflow-execution/ (Feature Slice)"
            subgraph "Presentation Layer"
                WEA[Workflow Execution API Handler]
                WEE[Workflow Execution Events Handler]
            end
            subgraph "Application Layer"
                WEM[Workflow Execution Manager]
                CE[Condition Evaluator]
            end
            subgraph "Domain Layer"
                WorkflowExecution[Workflow Execution]
                ExecutionContext[Execution Context]
            end
            subgraph "Infrastructure Layer"
                WER[Workflow Execution Repository]
                SM[State Machine]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    WDA --> WDM
    WDE --> WDM
    WDM --> WorkflowDef
    YP --> Step
    WorkflowDef --> WDR
    Step --> YS
    
    WEA --> WEM
    WEE --> WEM
    WEM --> WorkflowExecution
    CE --> ExecutionContext
    WorkflowExecution --> WER
    ExecutionContext --> SM
```

---

## 🟢 Resource Plugins (Bounded Context)

### Templates Plugin

**Responsabilidad**: Gestión de plantillas reutilizables (PRDs, historias de usuario, specs técnicas)

```mermaid
graph TB
    subgraph "🟢 templates Plugin (BC)"
        subgraph "🟢 template-management/ (Feature Slice)"
            subgraph "Presentation Layer"
                TmpA[Template API Handler]
                TmpE[Template Events Handler]
            end
            subgraph "Application Layer"
                TmpM[Template Manager]
                TV[Template Validator]
            end
            subgraph "Domain Layer"
                Template[Template Entity]
                TemplateVar[Template Variable]
            end
            subgraph "Infrastructure Layer"
                TmpR[Template Repository]
                FS[File System Store]
            end
        end
        
        subgraph "🟢 template-rendering/ (Feature Slice)"
            subgraph "Presentation Layer"
                TRA[Template Rendering API Handler]
                TRE[Template Rendering Events Handler]
            end
            subgraph "Application Layer"
                TRM[Template Rendering Manager]
                RE[Rendering Engine]
            end
            subgraph "Domain Layer"
                RenderedDoc[Rendered Document]
                RenderContext[Render Context]
            end
            subgraph "Infrastructure Layer"
                RDR[Rendered Document Repository]
                TE[Template Engine]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    TmpA --> TmpM
    TmpE --> TmpM
    TmpM --> Template
    TV --> TemplateVar
    Template --> TmpR
    TemplateVar --> FS
    
    TRA --> TRM
    TRE --> TRM
    TRM --> RenderedDoc
    RE --> RenderContext
    RenderedDoc --> RDR
    RenderContext --> TE
```

### Checklists Plugin

**Responsabilidad**: Listas de verificación de calidad para distintos roles (PO, Architect, etc.)

```mermaid
graph TB
    subgraph "🟢 checklists Plugin (BC)"
        subgraph "🟢 checklist-management/ (Feature Slice)"
            subgraph "Presentation Layer"
                CLA[Checklist API Handler]
                CLE[Checklist Events Handler]
            end
            subgraph "Application Layer"
                CLM[Checklist Manager]
                RoleValidator[Role Validator]
            end
            subgraph "Domain Layer"
                Checklist[Checklist Entity]
                CheckItem[Check Item]
                Role[Role Definition]
            end
            subgraph "Infrastructure Layer"
                CLR[Checklist Repository]
                RR[Role Repository]
            end
        end
        
        subgraph "🟢 checklist-execution/ (Feature Slice)"
            subgraph "Presentation Layer"
                CEA[Checklist Execution API Handler]
                CEE[Checklist Execution Events Handler]
            end
            subgraph "Application Layer"
                CEM[Checklist Execution Manager]
                PT[Progress Tracker]
            end
            subgraph "Domain Layer"
                ChecklistExecution[Checklist Execution]
                CheckResult[Check Result]
            end
            subgraph "Infrastructure Layer"
                CER[Checklist Execution Repository]
                PS[Progress Store]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    CLA --> CLM
    CLE --> CLM
    CLM --> Checklist
    RoleValidator --> Role
    Checklist --> CLR
    Role --> RR
    
    CEA --> CEM
    CEE --> CEM
    CEM --> ChecklistExecution
    PT --> CheckResult
    ChecklistExecution --> CER
    CheckResult --> PS
```

### Data Plugin

**Responsabilidad**: Conocimiento central, preferencias técnicas e información clave del proyecto

```mermaid
graph TB
    subgraph "🟢 data Plugin (BC)"
        subgraph "🟢 knowledge-base/ (Feature Slice)"
            subgraph "Presentation Layer"
                KBA[Knowledge Base API Handler]
                KBE[Knowledge Base Events Handler]
            end
            subgraph "Application Layer"
                KBM[Knowledge Base Manager]
                KS[Knowledge Searcher]
            end
            subgraph "Domain Layer"
                Knowledge[Knowledge Entity]
                KnowledgeItem[Knowledge Item]
            end
            subgraph "Infrastructure Layer"
                KBR[Knowledge Base Repository]
                IS[Index Store]
            end
        end
        
        subgraph "🟢 project-preferences/ (Feature Slice)"
            subgraph "Presentation Layer"
                PPA[Project Preferences API Handler]
                PPE[Project Preferences Events Handler]
            end
            subgraph "Application Layer"
                PPM[Project Preferences Manager]
                PV[Preference Validator]
            end
            subgraph "Domain Layer"
                ProjectPref[Project Preference]
                TechStandard[Technical Standard]
            end
            subgraph "Infrastructure Layer"
                PPR[Project Preferences Repository]
                TS[Technical Standards Store]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    KBA --> KBM
    KBE --> KBM
    KBM --> Knowledge
    KS --> KnowledgeItem
    Knowledge --> KBR
    KnowledgeItem --> IS
    
    PPA --> PPM
    PPE --> PPM
    PPM --> ProjectPref
    PV --> TechStandard
    ProjectPref --> PPR
    TechStandard --> TS
```

---

## 🤖 Models Plugins (Bounded Context)

### AWS Bedrock Plugin

**Responsabilidad**: Servicio administrado de modelos de lenguaje en AWS

```mermaid
graph TB
    subgraph "🟣 aws-bedrock Plugin (BC)"
        subgraph "🟢 model-management/ (Feature Slice)"
            subgraph "Presentation Layer"
                MMA[Model Management API Handler]
                MME[Model Management Events Handler]
            end
            subgraph "Application Layer"
                MMM[Model Manager]
                MC[Model Catalog]
            end
            subgraph "Domain Layer"
                BedrockModel[Bedrock Model]
                ModelCapability[Model Capability]
            end
            subgraph "Infrastructure Layer"
                BMR[Bedrock Model Repository]
                BC[Bedrock Client]
            end
        end
        
        subgraph "🟢 inference-service/ (Feature Slice)"
            subgraph "Presentation Layer"
                ISA[Inference Service API Handler]
                ISE[Inference Service Events Handler]
            end
            subgraph "Application Layer"
                ISM[Inference Service Manager]
                CT[Cost Tracker]
            end
            subgraph "Domain Layer"
                InferenceRequest[Inference Request]
                InferenceResponse[Inference Response]
            end
            subgraph "Infrastructure Layer"
                IR[Inference Repository]
                MT[Metrics Tracker]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    MMA --> MMM
    MME --> MMM
    MMM --> BedrockModel
    MC --> ModelCapability
    BedrockModel --> BMR
    ModelCapability --> BC
    
    ISA --> ISM
    ISE --> ISM
    ISM --> InferenceRequest
    CT --> InferenceResponse
    InferenceRequest --> IR
    InferenceResponse --> MT
```

### AWS SageMaker Plugin

**Responsabilidad**: Plataforma de entrenamiento e inferencia de modelos en AWS

```mermaid
graph TB
    subgraph "🟣 aws-sagemaker Plugin (BC)"
        subgraph "🟢 endpoint-management/ (Feature Slice)"
            subgraph "Presentation Layer"
                EMA[Endpoint Management API Handler]
                EME[Endpoint Management Events Handler]
            end
            subgraph "Application Layer"
                EMM[Endpoint Manager]
                HS[Health Monitor]
            end
            subgraph "Domain Layer"
                SMEndpoint[SageMaker Endpoint]
                EndpointConfig[Endpoint Configuration]
            end
            subgraph "Infrastructure Layer"
                SMR[SageMaker Repository]
                SMC[SageMaker Client]
            end
        end
        
        subgraph "🟢 embedding-service/ (Feature Slice)"
            subgraph "Presentation Layer"
                ESA[Embedding Service API Handler]
                ESE[Embedding Service Events Handler]
            end
            subgraph "Application Layer"
                ESM[Embedding Service Manager]
                EC[Embedding Cache]
            end
            subgraph "Domain Layer"
                EmbeddingRequest[Embedding Request]
                EmbeddingResponse[Embedding Response]
            end
            subgraph "Infrastructure Layer"
                ER[Embedding Repository]
                VectorCache[Vector Cache]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            CM[Config Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    EMA --> EMM
    EME --> EMM
    EMM --> SMEndpoint
    HS --> EndpointConfig
    SMEndpoint --> SMR
    EndpointConfig --> SMC
    
    ESA --> ESM
    ESE --> ESM
    ESM --> EmbeddingRequest
    EC --> EmbeddingResponse
    EmbeddingRequest --> ER
    EmbeddingResponse --> VectorCache
```

---

## 🔵 Connector Plugins (Bounded Context)

### AWS Connector Plugin

**Responsabilidad**: Integration con servicios AWS (Bedrock, SageMaker, S3)

```mermaid
graph TB
    subgraph "🔵 aws-connector Plugin (BC)"
        subgraph "🟢 bedrock-integration/ (Feature Slice)"
            subgraph "Presentation Layer"
                BA[Bedrock API Handler]
                BE[Bedrock Events Handler]
            end
            subgraph "Application Layer"
                BM[Bedrock Manager]
                LLMProxy[LLM Proxy Service]
            end
            subgraph "Domain Layer"
                BedrockModel[Bedrock Model]
                LLMRequest[LLM Request]
            end
            subgraph "Infrastructure Layer"
                BC[Bedrock Client]
                CT[Cost Tracker]
            end
        end
        
        subgraph "🟢 sagemaker-integration/ (Feature Slice)"
            subgraph "Presentation Layer"
                SA[SageMaker API Handler]
                SE[SageMaker Events Handler]
            end
            subgraph "Application Layer"
                SM[SageMaker Manager]
                ES[Embedding Service]
            end
            subgraph "Domain Layer"
                SMEndpoint[SageMaker Endpoint]
                Embedding[Embedding Request]
            end
            subgraph "Infrastructure Layer"
                SMC[SageMaker Client]
                EC[Embedding Cache]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            AC[AWS Config]
            Creds[Credentials Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    BA --> BM
    BE --> BM
    BM --> BedrockModel
    LLMProxy --> LLMRequest
    BedrockModel --> BC
    LLMRequest --> CT
    
    SA --> SM
    SE --> SM
    SM --> SMEndpoint
    ES --> Embedding
    SMEndpoint --> SMC
    Embedding --> EC
```

### Confluence Connector Plugin

**Responsabilidad**: Sincronización y indexación de documentación empresarial

```mermaid
graph TB
    subgraph "🔵 confluence-connector Plugin (BC)"
        subgraph "🟢 content-sync/ (Feature Slice)"
            subgraph "Presentation Layer"
                CSA[Content Sync API Handler]
                CSE[Content Sync Events Handler]
            end
            subgraph "Application Layer"
                CSM[Content Sync Manager]
                IS[Indexing Service]
            end
            subgraph "Domain Layer"
                Page[Confluence Page]
                Space[Confluence Space]
            end
            subgraph "Infrastructure Layer"
                CC[Confluence Client]
                CI[Content Indexer]
            end
        end
        
        subgraph "🟢 knowledge-extraction/ (Feature Slice)"
            subgraph "Presentation Layer"
                KEA[Knowledge Extraction API Handler]
                KEE[Knowledge Extraction Events Handler]
            end
            subgraph "Application Layer"
                KEM[Knowledge Extraction Manager]
                NLP[NLP Service]
            end
            subgraph "Domain Layer"
                Knowledge[Knowledge Entity]
                BusinessRule[Business Rule]
            end
            subgraph "Infrastructure Layer"
                KS[Knowledge Store]
                BRS[Business Rules Store]
            end
        end
        
        subgraph "Plugin Infrastructure"
            PI[Plugin Interface]
            EM[Event Manager]
            ConC[Confluence Config]
            Auth[Auth Manager]
        end
    end
    
    %% Event-driven communication with kernel
    PI <==> KERNEL[🟣 nura-core]
    EM <==> KERNEL
    
    %% Internal plugin communication
    CSA --> CSM
    CSE --> CSM
    CSM --> Page
    IS --> Space
    Page --> CC
    Space --> CI
    
    KEA --> KEM
    KEE --> KEM
    KEM --> Knowledge
    NLP --> BusinessRule
    Knowledge --> KS
    BusinessRule --> BRS
```

---

## Event-Driven Communication Patterns

### 🔄 Global Event Flow

**Responsabilidad**: Flujo completo de eventos desde consulta de usuario hasta respuesta final con coordinación multi-agente

```mermaid
sequenceDiagram
    participant UI as streamlit-interface
    participant Router as nura-router
    participant EventBus as event-bus
    participant DevAgent as dev-agent
    participant PMAgent as pm-agent
    participant AWS as aws-connector
    
    UI->>Router: user_query_event
    Router->>Router: analyze_intent()
    Router->>EventBus: route_to_agents_event
    
    EventBus->>DevAgent: technical_question_event
    EventBus->>PMAgent: business_context_request_event
    
    DevAgent->>AWS: llm_request_event
    PMAgent->>EventBus: business_context_response_event
    
    AWS->>DevAgent: llm_response_event
    DevAgent->>EventBus: technical_response_event
    
    EventBus->>UI: combined_response_event
    UI->>UI: render_response()
```

### Plugin Lifecycle Events

**Responsabilidad**: Gestión de eventos del ciclo completo de plugins desde startup hasta shutdown con monitoreo continuo

```mermaid
graph TB
    subgraph "Plugin Lifecycle Events"
        PE[plugin_registered]
        PS[plugin_started]
        PR[plugin_ready]
        PH[plugin_health_check]
        PU[plugin_updated]
        PSt[plugin_stopped]
        PUn[plugin_unregistered]
    end
    
    subgraph "System Events"
        SS[system_startup]
        SR[system_ready]
        SSD[system_shutdown]
        CB[circuit_breaker_opened]
        CC[circuit_breaker_closed]
    end
    
    subgraph "Business Events"
        UQ[user_query_received]
        QP[query_processed]
        QR[query_responded]
        CE[conversation_ended]
        US[user_session_started]
    end
    
    SS --> PE
    PE --> PS
    PS --> PR
    PR --> PH
    PH --> PU
    PU --> PSt
    PSt --> PUn
    
    UQ --> QP
    QP --> QR
    QR --> CE
```

---

## Migration Strategy: Streamlit → React

### Interface Plugin Coexistence

**Responsabilidad**: Estrategia de migración gradual permitiendo coexistencia de interfaces Streamlit y React con routing inteligente

```mermaid
graph TB
    subgraph "Migration Phase 1: Coexistence"
        subgraph "🟡 streamlit-interface (Active)"
            SCI[Chat Interface]
            SCH[Conversation History]  
            SAS[Agent Status]
        end
        
        subgraph "🟡 react-interface (Development)"
            RCI[Advanced Chat Interface]
            RAD[Analytics Dashboard]
            RUP[User Preferences]
        end
        
        subgraph "🟣 NURA-CORE"
            Router[nura-router]
            EventBus[event-bus]
        end
        
        SCI <==> Router
        SCH <==> EventBus
        SAS <==> EventBus
        
        RCI <==> Router
        RAD <==> EventBus
        RUP <==> EventBus
    end
    
    subgraph "Migration Phase 2: Transition"
        subgraph "Feature Flagging"
            FF[Feature Flags]
            UT[User Toggle]
            AB[A/B Testing]
        end
        
        FF --> SCI
        FF --> RCI
        UT --> ReactRouting[Route to React]
        AB --> StreamlitRouting[Route to Streamlit]
    end
    
    subgraph "Migration Phase 3: Complete"
        subgraph "🟡 react-interface (Production)"
            RACI[Advanced Chat Interface]
            RCAD[Analytics Dashboard] 
            RCUP[User Preferences]
        end
        
        RACI <==> Router
        RCAD <==> EventBus
        RCUP <==> EventBus
        
        Note1[streamlit-interface plugin retired]
    end
```

### Plugin Hot-Swapping Strategy

**Responsabilidad**: Implementación de hot-swapping sin downtime usando feature flags y migración gradual de tráfico

```mermaid
sequenceDiagram
    participant PM as nura-plugin-manager
    participant SUI as streamlit-interface
    participant RUI as react-interface  
    participant Router as nura-router
    participant Users as Active Users
    
    Note over PM,Users: Phase 1: Install React Plugin
    PM->>RUI: install_plugin()
    RUI->>PM: registration_complete()
    PM->>Router: register_capabilities(react-ui)
    
    Note over PM,Users: Phase 2: Feature Flag Routing
    Users->>Router: user_request
    Router->>Router: check_feature_flag(user_id)
    alt Feature Enabled
        Router->>RUI: route_request()
    else Feature Disabled  
        Router->>SUI: route_request()
    end
    
    Note over PM,Users: Phase 3: Gradual Migration
    Router->>Router: increase_react_traffic(10% → 50% → 100%)
    
    Note over PM,Users: Phase 4: Retirement
    PM->>SUI: graceful_shutdown()
    SUI->>PM: shutdown_complete()
    PM->>Router: unregister_capabilities(streamlit-ui)
```

---

## Benefits of Microkernel + DDD Hybrid

### **Architectural Benefits**

1. **🟣 Centralized Orchestration**: nura-core provides single point of control
2. **🔵 Domain Isolation**: Plugins encapsulate bounded contexts completamente  
3. **🟢 Feature Clarity**: Screaming architecture a multiple niveles
4. **⚡ Hot-Swappable**: Plugins can be updated without system restart
5. **🔗 Event-Driven**: Loose coupling via async event communication
6. **📊 Unified Observability**: Centralized telemetry and monitoring

### **Development Benefits**

1. **🏗️ Independent Teams**: Each plugin can be developed by different teams
2. **🚀 Rapid MVP**: Streamlit plugin enables fast validation
3. **📈 Gradual Evolution**: React plugin for enterprise features
4. **🧪 A/B Testing**: Multiple interface plugins enable experimentation
5. **🔒 Security Isolation**: Plugin sandboxing and controlled communication
6. **📚 Clear Contracts**: Well-defined event interfaces between plugins

### **Operational Benefits**

1. **🎯 Targeted Scaling**: Scale individual plugins based on load
2. **🛠️ Selective Updates**: Update plugins independently
3. **📊 Granular Monitoring**: Plugin-level metrics and health checks
4. **🔄 Fault Isolation**: Plugin failures don't cascade
5. **⚙️ Configuration Management**: Centralized config with plugin-specific overrides
6. **🚨 Circuit Breakers**: Automatic fallback when plugins fail

Este diseño híbrido mantiene la **flexibilidad del microkernel** con la **organización clara del DDD**, permitiendo **evolución gradual** de Streamlit MVP a React enterprise mientras preserva **screaming architecture** y **vertical slicing** a múltiples niveles.