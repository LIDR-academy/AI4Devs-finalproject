# 🔄 Core Workflows - Nura System

## 🔄 Workflows Críticos del Sistema

Los siguientes diagramas de secuencia ilustran los workflows críticos identificados del PRD, mostrando interacciones entre Bounded Contexts, APIs externas, y flujos de error.

---

## 1. 🤝 Workflow: Consulta Técnica con Contexto de Negocio

**User Journey**: Developer hace pregunta técnica → Nura proporciona respuesta enriquecida con business context

```mermaid
sequenceDiagram
    participant U as 👨‍💻 Developer
    participant UI as 📱 User Interfaces BC
    participant AO as 🤖 Agent Orchestration BC
    participant DM as 🎓 Developer Mentorship BC
    participant BI as 📈 Business Intelligence BC
    participant KM as 📁 Knowledge Management BC
    participant LLM as ☁️ AWS Bedrock

    U->>UI: POST /chat/message {"query": "¿Por qué usamos este patrón de auth?"}
    UI->>UI: Create Conversation + ChatMessage
    UI->>AO: POST /orchestration/query + Intent Analysis
    
    AO->>AO: Analyze Intent → "technical_question_with_business_context"
    AO->>DM: GET /mentorship/technical-question
    AO->>BI: GET /business/context/auth-patterns
    
    par Technical Search
        DM->>KM: POST /search/semantic {"query": "auth patterns", "domain": "technical"}
    and Business Search
        BI->>KM: POST /search/semantic {"query": "auth business rules", "domain": "business"}
    end
    
    KM->>KM: Vector search en embeddings separados por dominio
    KM-->>DM: Return technical context
    KM-->>BI: Return business context
    
    DM->>DM: Generate technical explanation
    BI->>BI: Extract relevant business rules
    
    DM-->>AO: Technical answer + Learning path update
    BI-->>AO: Business context + Compliance requirements
    
    AO->>AO: Combine responses + Generate unified answer
    AO->>LLM: POST /bedrock/claude {"context": combined, "query": original}
    LLM-->>AO: Enhanced response with business rationale
    
    AO->>AO: Log LLM call (model, tokens, cost)
    AO-->>UI: Complete answer with tech + business context
    
    UI->>UI: Update Conversation with LLM metadata
    UI-->>U: Display enriched response
    
    Note over U,LLM: Error Handling Path
    alt LLM Service Unavailable
        AO->>AO: Fallback to combined BC responses
        AO-->>UI: Response without LLM enhancement
        UI->>UI: Log degraded service
    end
    
    alt Knowledge Base Empty
        KM-->>DM: Empty results
        DM->>DM: Generate basic technical answer
        DM-->>AO: Basic response + Suggestion to update KB
    end
```

---

## 2. 🏗️ Workflow: Análisis Arquitectónico Integral

**User Journey**: Architect solicita análisis de componente → Nura proporciona análisis completo con recommendations

```mermaid
sequenceDiagram
    participant A as 🏗️ Architect
    participant UI as 📱 User Interfaces BC
    participant AO as 🤖 Agent Orchestration BC
    participant AG as 🏗️ Architectural Guidance BC
    participant KM as 📁 Knowledge Management BC
    participant LLM as ☁️ AWS Bedrock
    participant CB as 💻 Codebase Repository

    A->>UI: POST /chat/message {"query": "Analiza arquitectura del módulo auth"}
    UI->>AO: POST /orchestration/query
    
    AO->>AO: Intent Analysis → "architectural_analysis"
    AO->>AG: POST /architecture/analyze {"component": "auth"}
    
    AG->>CB: Scan codebase for auth-related files
    CB-->>AG: File paths + Basic structure
    
    AG->>AG: Static analysis + Pattern detection
    AG->>KM: POST /search/semantic {"query": "auth architecture patterns", "domain": "architectural"}
    
    KM->>KM: Search architectural patterns
    KM-->>AG: Best practices + Pattern recommendations
    
    AG->>AG: Generate quality assessment + Dependency analysis
    
    alt Complex Analysis Required
        AG->>LLM: POST /bedrock/claude {"context": "architecture_analysis", "code": codebase_context}
        LLM-->>AG: Enhanced architectural insights
    end
    
    AG->>AG: Generate recommendations + Technical debt analysis
    AG-->>AO: Complete architectural report
    
    AO->>AO: Log analysis execution + LLM usage
    AO-->>UI: Structured architectural analysis
    
    UI->>UI: Update conversation with analysis metadata
    UI-->>A: Display comprehensive architecture report
    
    Note over A,CB: Error Handling Paths
    alt Codebase Access Failed
        AG->>AG: Generate analysis based on Knowledge Base only
        AG-->>AO: Partial analysis + Warning about limited scope
    end
    
    alt Pattern Detection Failed
        AG->>AG: Skip pattern matching
        AG->>AG: Focus on static analysis results only
    end
```

---

## 3. 👨‍💻 Workflow: Onboarding de Nuevo Developer

**User Journey**: Nuevo developer inicia sesión → Nura crea learning path personalizado → Progress tracking

```mermaid
sequenceDiagram
    participant ND as 👶 New Developer
    participant UI as 📱 User Interfaces BC
    participant AO as 🤖 Agent Orchestration BC
    participant DM as 🎓 Developer Mentorship BC
    participant BI as 📈 Business Intelligence BC
    participant KM as 📁 Knowledge Management BC

    ND->>UI: POST /user/preferences {"role": "junior", "domain": "backend"}
    UI->>UI: Create user profile + Initial conversation
    
    ND->>UI: POST /chat/message {"query": "Necesito entender cómo funciona este proyecto"}
    UI->>AO: POST /orchestration/query
    
    AO->>AO: Intent Analysis → "onboarding_request"
    AO->>DM: POST /mentorship/create-session
    
    DM->>DM: Initialize MentorshipSession + Skill assessment
    DM->>KM: POST /search/semantic {"query": "project overview backend", "domain": "technical"}
    DM->>BI: GET /business/context/project-overview
    
    KM-->>DM: Technical documentation + Code examples
    BI-->>DM: Business context + Project objectives
    
    DM->>DM: Generate personalized learning path
    DM->>DM: Create skill assessment baseline
    
    DM-->>AO: Learning path + First recommendations
    AO-->>UI: Structured onboarding plan
    
    UI-->>ND: Display personalized learning path
    
    loop Progress Tracking
        ND->>UI: POST /chat/message {"query": "¿Cómo implemento autenticación?"}
        UI->>AO: POST /orchestration/query
        AO->>DM: POST /mentorship/progress-question
        
        DM->>DM: Update learning progress + Assess skill development
        DM->>KM: POST /search/semantic {"query": "auth implementation", "domain": "technical"}
        
        KM-->>DM: Implementation examples + Best practices
        DM->>DM: Generate contextual answer + Update learning path
        DM-->>AO: Answer + Progress update
        AO-->>UI: Response + Updated learning status
        UI-->>ND: Contextual answer + Progress feedback
    end
    
    Note over ND,KM: Success Metrics Tracking
    DM->>DM: Calculate learning velocity + Engagement metrics
    DM->>DM: Update personalized recommendations
```

---

## 4. 🤖 Workflow: Multi-Agent Collaboration

**User Journey**: Complex query requiring multiple agents → Master Orchestrator coordinates response

```mermaid
sequenceDiagram
    participant U as User
    participant UI as 📱 User Interfaces BC
    participant AO as 🤖 Agent Orchestration BC
    participant DM as 🎓 Developer Mentorship BC
    participant AG as 🏗️ Architectural Guidance BC
    participant BI as 📈 Business Intelligence BC
    participant LLM as ☁️ AWS Bedrock

    U->>UI: POST /chat/message {"query": "¿Deberíamos refactorizar el auth module? ¿Cuál es el impact de negocio?"}
    UI->>AO: POST /orchestration/query
    
    AO->>AO: Intent Analysis → "complex_multi_domain_query"
    AO->>AO: Determine execution strategy → Multi-agent collaboration
    
    AO->>AO: Create WorkflowExecution + Agent team assignment
    
    par Architecture Analysis
        AO->>AG: POST /architecture/refactoring-analysis {"component": "auth"}
    and Business Analysis
        AO->>BI: POST /business/impact-analysis {"component": "auth"}
    and Mentorship Guidance
        AO->>DM: POST /mentorship/implementation-guidance {"topic": "refactoring"}
    end
    
    AG->>AG: Analyze technical debt + Refactoring complexity
    BI->>BI: Assess business risk + Compliance implications
    DM->>DM: Evaluate team readiness + Learning opportunities
    
    AG-->>AO: Technical analysis + Refactoring recommendations
    BI-->>AO: Business impact + Risk assessment
    DM-->>AO: Implementation strategy + Team development plan
    
    AO->>AO: Synthesize multi-agent responses
    AO->>LLM: POST /bedrock/claude {"context": "multi_agent_synthesis", "responses": [tech, business, mentorship]}
    
    LLM-->>AO: Comprehensive recommendation with balanced perspective
    
    AO->>AO: Log complex workflow execution + Multi-agent coordination
    AO-->>UI: Unified response with technical + business + implementation perspectives
    
    UI->>UI: Update conversation with workflow metadata
    UI-->>U: Display comprehensive multi-perspective analysis
    
    Note over U,LLM: Error Handling for Multi-Agent
    alt Agent Failure
        AO->>AO: Continue with available agents
        AO->>AO: Note partial analysis in response
        AO-->>UI: Partial response + Service degradation notice
    end
    
    alt LLM Synthesis Fails
        AO->>AO: Present individual agent responses
        AO->>AO: Add manual coordination notes
        AO-->>UI: Multi-section response without synthesis
    end
```

---

## 5. 🔄 Workflow: Knowledge Base Update y Re-indexing

**User Journey**: System administrator updates knowledge base → Automatic re-indexing across domains

```mermaid
sequenceDiagram
    participant Admin as ⚙️ System Admin
    participant UI as 📱 User Interfaces BC
    participant KM as 📁 Knowledge Management BC
    participant CB as 💻 Codebase Repository
    participant CF as 📄 Confluence API
    participant VDB as 🗄️ Vector Database (pgvector)
    participant AWS as ☁️ AWS Bedrock Embeddings

    Admin->>UI: POST /admin/knowledge/update {"source": "confluence", "trigger": "manual"}
    UI->>KM: POST /knowledge/index-update
    
    KM->>KM: Initialize indexing workflow + Create batch jobs
    
    par Codebase Retrieval
        KM->>CB: GET /codebase/changes-since/{last_update}
    and Documentation Retrieval
        KM->>CF: GET /confluence/pages/modified-since/{last_update}
    end
    
    CB-->>KM: Modified code files + Documentation
    CF-->>KM: Updated business documentation
    
    KM->>KM: Process documents + Extract content by domain
    
    loop Domain-Separated Processing
        KM->>KM: Classify content → technical | business | architectural
        KM->>AWS: POST /bedrock/embeddings {"text": content, "model": "amazon.titan-embed-text-v1"}
        AWS-->>KM: Vector embeddings
        
        KM->>VDB: INSERT INTO embeddings (domain, content, vector, metadata)
        VDB-->>KM: Indexing confirmation
    end
    
    KM->>KM: Update search indexes + Optimize vector similarity
    KM->>KM: Generate indexing report + Performance metrics
    
    KM-->>UI: Indexing complete + Updated knowledge statistics
    UI-->>Admin: Display indexing results + Domain coverage metrics
    
    Note over Admin,AWS: Error Handling for Indexing
    alt Confluence API Unavailable
        KM->>KM: Skip Confluence update
        KM->>KM: Continue with codebase indexing only
        KM-->>UI: Partial indexing completed + Source unavailable notice
    end
    
    alt Embedding Generation Fails
        KM->>KM: Retry with exponential backoff
        alt Retry Failed
            KM->>KM: Queue for later processing
            KM-->>UI: Indexing incomplete + Retry scheduled
        end
    end
    
    alt Vector DB Performance Degraded
        KM->>KM: Switch to batch insertion mode
        KM->>KM: Optimize query performance post-indexing
    end
```

---

## 6. 🚨 Workflow: Error Recovery y Fallback

**User Journey**: System degradation → Graceful fallback maintaining core functionality

```mermaid
sequenceDiagram
    participant U as User
    participant UI as 📱 User Interfaces BC
    participant AO as 🤖 Agent Orchestration BC
    participant DM as 🎓 Developer Mentorship BC
    participant KM as 📁 Knowledge Management BC
    participant LLM as ☁️ AWS Bedrock
    participant Monitor as 📊 System Monitor

    U->>UI: POST /chat/message {"query": "¿Cómo debugging este error de auth?"}
    UI->>AO: POST /orchestration/query
    
    AO->>AO: Intent Analysis → "technical_debugging"
    AO->>DM: POST /mentorship/debug-assistance
    
    DM->>KM: POST /search/semantic {"query": "auth debugging", "domain": "technical"}
    
    Note over KM: Knowledge Base Degraded
    KM->>KM: Vector search timeout detected
    KM->>Monitor: ALERT system_degradation {"service": "vector_search", "severity": "high"}
    
    Monitor->>Monitor: Circuit breaker activated for Knowledge Management
    Monitor-->>AO: Service degradation notification
    
    AO->>AO: Activate fallback strategy → Direct agent response
    AO->>DM: POST /mentorship/debug-assistance {"fallback_mode": true}
    
    DM->>DM: Generate response using cached knowledge + Basic patterns
    DM-->>AO: Basic debugging guidance + Limited context
    
    AO->>LLM: POST /bedrock/claude {"context": "debugging_fallback", "limited_context": true}
    
    alt LLM Also Unavailable
        AO->>AO: Complete fallback to cached responses
        AO->>AO: Generate basic structured response
        AO-->>UI: Minimal debugging guidance + Service notice
    else LLM Available
        LLM-->>AO: Enhanced debugging response
        AO-->>UI: Debugging guidance + Service degradation notice
    end
    
    UI->>UI: Update conversation + Add service status metadata
    UI-->>U: Display response + "Limited functionality" notice
    
    Note over Monitor: Recovery Process
    Monitor->>Monitor: Attempt service recovery
    Monitor->>KM: POST /health/recovery-check
    
    alt Recovery Successful
        KM->>KM: Vector search restored
        Monitor->>Monitor: Circuit breaker reset
        Monitor->>AO: Service recovery notification
        AO->>AO: Resume full functionality
    else Recovery Failed
        Monitor->>Monitor: Schedule retry + Escalate alert
        Monitor->>Monitor: Maintain fallback mode
    end
```

---

## Consideraciones de Performance y Escalabilidad

### **Async Operations**
- Knowledge base indexing ejecuta en background jobs
- Multi-agent workflows utilizan parallel processing
- Vector searches tienen caching agresivo por 1 hora

### **Error Handling Patterns**
- **Circuit Breaker**: Previene cascading failures entre BCs
- **Exponential Backoff**: Reintentos inteligentes con jitter
- **Graceful Degradation**: Core functionality mantiene disponibilidad

### **Monitoring y Observability**
- Cada workflow genera métricas de performance
- LLM calls tracked completamente (model, tokens, cost)
- Real-time health checks para todos los BC dependencies

### **Optimization Strategies**
- Conversación context se mantiene en memoria durante sesión activa
- Vector embeddings cached por dominio para queries frecuentes
- Agent responses cached para queries similares durante 24h

Estos workflows representan el **80% de los user journeys críticos** identificados en el PRD, con emphasis en robustez, observabilidad, y user experience durante degradation scenarios.