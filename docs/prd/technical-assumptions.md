# ⚙️ Technical Assumptions

## 📁 Repository Structure: Monorepo

**Decisión**: Monorepo con estructura clara separando frontend, backend, agents, y shared utilities

**Rationale**: 
- Facilita desarrollo coordenado de múltiples agentes especializados
- Simplifica deployment y versionado durante MVP rapid iteration
- Permite shared types/interfaces entre Nura Core y agentes especializados
- Alineado con team size pequeño y Python-first constraint del brief

## 🏗️ Service Architecture

**Patrón Arquitectónico**: **Monolítico Microkernel (Plugin Architecture)**

**Nura Core (Kernel)**:
- Núcleo central que maneja orchestration, routing, y plugin lifecycle management
- Provee APIs estándares para plugin registration, communication, y resource sharing  
- Mantiene shared services: authentication, logging, configuration, vector database access
- Implementa plugin discovery, loading, y health monitoring

**Plugin Ecosystem**:
- **Agent Plugins**: Dev Agent, PM Agent, Architect Agent como plugins independientes
- **Connector Plugins**: Bitbucket Connector, Confluence Connector, AWS Service Mapper
- **Interface Plugins**: Streamlit WebApp, Future VS Code Extension, React Frontend
- **Extension Plugins**: Confidence Scoring, Business Context Enhancer, Metrics Collector

**CRITICAL DECISION Rationale**: 
- **Escalabilidad Incremental**: Agregar nuevos agentes o conectores sin modificar Nura Core
- **Desarrollo Paralelo**: Diferentes plugins pueden desarrollarse independientemente
- **Testing Isolation**: Cada plugin testeable por separado, core kernel estable
- **Deployment Flexibility**: Plugins pueden activarse/desactivarse dinámicamente
- **Future Extensions**: VS Code plugin, nuevos LLM providers, enterprise connectors como plugins adicionales

## 🧪 Testing Requirements

**MVP Phase**: Unit + Integration testing focused
- **Unit Tests**: 80%+ coverage para agent logic y Nura Core orchestration
- **Integration Tests**: API endpoints + PostgreSQL vector operations + SageMaker integration
- **Manual E2E**: User acceptance testing con 5 target developers (según brief MVP success criteria)

**Post-MVP Expansion**: Full Testing Pyramid
- **E2E Automated**: Playwright para UI workflows y multi-agent conversations
- **Performance Testing**: Load testing para 50+ concurrent users con benchmarks
- **Security Testing**: Penetration testing antes de multi-tenant launch

## ⚙️ Additional Technical Assumptions and Requests

**Technology Stack - Fully Specified from Brief Analysis:**

```yaml
backend_stack:
  web_framework: "FastAPI 0.104.1"
  database_orm: "SQLAlchemy 2.0 with async support" 
  vector_search: "PostgreSQL + pgvector (1024 dimensions)"
  ai_framework: "DSPy 2.4+ (auto-optimization) + LangGraph 0.0.25"
  
frontend_evolution:
  mvp_phase: "Streamlit 1.28.2 (10x faster development)"
  production_phase: "React + shadcn + AI SDK (responsive)"
  
embedding_strategy:
  primary: "BGE-M3 via AWS SageMaker (100% consistency, fully managed)"
  instance_type: "ml.g4dn.large (cost-optimized)"
  scaling: "Auto-scaling 0-5 instances"
  fallback: "OpenAI text-embedding-3-large (critical only)"
  
llm_configuration:
  dev_agent: "CodeLlama-70B (AWS Bedrock) → GPT-4 fallback"
  pm_agent: "Llama-3.1-70B → Claude-3.5 fallback"
  architect_agent: "Claude-3.5 → Llama-3.1 backup"
  
infrastructure:
  deployment: "AWS EKS"
  managed_services: "RDS PostgreSQL + ElastiCache + SageMaker"
  cost_target: "$500-670/mes (SageMaker + Bedrock optimized)"
  
security_compliance:
  authentication: "OAuth2 + JWT (python-jose)"
  data_encryption: "PostgreSQL encryption at rest"
  multi_tenant_future: "Complete data isolation (Phase 3)"
```

**Plugin Architecture Implementation Strategy:**

```yaml
plugin_architecture:
  core_kernel: "FastAPI + SQLAlchemy como base estable"
  plugin_interface: "Python abstract base classes para standardization"
  plugin_discovery: "Dynamic loading via importlib + configuration registry"
  communication: "Event bus pattern + shared memory para performance"
  
plugin_lifecycle:
  registration: "Auto-discovery + health check + capability advertisement"
  activation: "Lazy loading + resource allocation + dependency resolution"
  monitoring: "Health checks + performance metrics + error isolation"
  updates: "Hot-swapping + version management + rollback capability"
```

**Post-MVP Plugin Expansion - Visión Completa:**

```yaml
phase_2_plugins (Months 4-6):
  agents:
    - qa_agent_plugin
    - devops_agent_plugin
    - security_agent_plugin
  connectors:
    - aws_infrastructure_connector_plugin  # Análisis infraestructura + service mapping
    - jenkins_pipeline_connector_plugin    # Deploy actions + pipeline visibility
    - sonarqube_quality_connector_plugin   # Code quality + technical debt analysis
    - jira_integration_plugin             # Ticket sync + story management
  interfaces:
    - react_frontend_plugin
    - vscode_extension_plugin
  extensions:
    - metrics_analytics_plugin
    - business_intelligence_plugin

phase_3_enterprise_plugins (Months 7-12):
  connectors:
    - google_drive_connector_plugin       # Document sync + search
    - slack_notification_plugin          # Team communication integration
    - datadog_monitoring_plugin          # APM + infrastructure monitoring
    - kubernetes_orchestration_plugin    # Container management + scaling
  agents:
    - compliance_agent_plugin           # GDPR, SOC2, regulatory requirements
    - cost_optimization_agent_plugin    # AWS cost analysis + recommendations
  extensions:
    - predictive_analytics_plugin       # Financial forecasting + capacity planning
    - enterprise_security_plugin       # Multi-tenant isolation + audit trails
```
