# Prompts del proyecto

> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

## Índice

- [Prompts del proyecto](#prompts-del-proyecto)
  - [Índice](#índice)
  - [1. Descripción general del producto](#1-descripción-general-del-producto)
  - [2. Arquitectura del Sistema](#2-arquitectura-del-sistema)
    - [**2.1. Diagrama de arquitectura:**](#21-diagrama-de-arquitectura)
    - [**2.2. Descripción de componentes principales:**](#22-descripción-de-componentes-principales)
    - [**2.3. Descripción de alto nivel del proyecto y estructura de ficheros**](#23-descripción-de-alto-nivel-del-proyecto-y-estructura-de-ficheros)
    - [**2.4. Infraestructura y despliegue**](#24-infraestructura-y-despliegue)
    - [**2.5. Seguridad**](#25-seguridad)
    - [**2.6. Tests**](#26-tests)
    - [3. Modelo de Datos](#3-modelo-de-datos)
    - [4. Especificación de la API](#4-especificación-de-la-api)
    - [5. Historias de Usuario](#5-historias-de-usuario)
    - [6. Tickets de Trabajo](#6-tickets-de-trabajo)
    - [7. Pull Requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**
"Genera una sección de Descripción General para un bot de forecasting de Metaculus orientado a torneos. Incluye: objetivo del producto, público objetivo (participantes de torneos e investigadores), principales beneficios (automatización, calidad de investigación, optimización de costos) y limitaciones conocidas. Mantén el texto en español y orientado a un README técnico. Cita brevemente componentes reales del repo como application/tournament_orchestrator.py, domain/entities/*.py y infrastructure/external_apis/*.py para anclar la descripción."

**Prompt 2:**
"Redacta las funcionalidades principales de un sistema multi-agente (Chain of Thought, Tree of Thought, ReAct, Ensemble), una capa de investigación con AskNews como proveedor primario y fallbacks a Perplexity/Exa/OpenRouter, y optimización de costos mediante Metaculus Proxy con fallback a OpenRouter. Incluye bullets breves y claros y referencia módulos reales: agents/react_agent.py, agents/tot_agent.py, agents/ensemble_agent_simple.py, infrastructure/external_apis/tournament_asknews_client.py, infrastructure/external_apis/metaculus_proxy_client.py, infrastructure/external_apis/llm_client.py."

**Prompt 3:**
"Escribe instrucciones de instalación y uso rápido para Python 3.11+: clonar repo, instalar requirements, configurar .env desde .env.example con ASKNEWS_CLIENT_ID/ASKNEWS_SECRET/OPENROUTER_API_KEY/METACULUS_TOKEN, y ejecutar por CLI con el script real cli/run_forecast.py (o equivalente documentado). Añade notas de prerequisitos y variables de entorno clave."

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
"Dibuja un diagrama Mermaid para un bot de torneos usando nombres reales del repo: CLI (cli/run_forecast.py) → TournamentOrchestrator (application/tournament_orchestrator.py) → Agentes (agents/react_agent.py, agents/tot_agent.py, agents/ensemble_agent_simple.py) → ResearchService (domain/services/research_service.py + infrastructure/external_apis/tournament_asknews_client.py con fallbacks Perplexity/Exa/OpenRouter) → LLM Layer (infrastructure/external_apis/metaculus_proxy_client.py, infrastructure/external_apis/llm_client.py). Mantén nombres cortos y legibles."

**Prompt 2:**
"Explica en 3-4 frases el patrón arquitectónico (DDD + Clean Architecture), su justificación (separación de responsabilidades, testabilidad, resiliencia) y trade-offs (complejidad inicial). Conecta cada capa con ficheros concretos: domain/entities/*.py, domain/services/ensemble_service.py y forecasting_service.py, application/dispatcher.py y forecast_service.py, infrastructure/external_apis/*.py y infrastructure/monitoring/metrics_service.py."

**Prompt 3:**
"Añade una breve lista de decisiones clave: uso de fallbacks con backoff exponencial, límites de cuota AskNews, y métricas/observabilidad. Incluye referencias a dónde viven: reliability/api_manager.py (reintentos/circuit breakers), infrastructure/config/budget_aware_operation_manager.py (presupuesto/cuotas), infrastructure/monitoring/metrics_service.py (métricas)."

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
"Describe el Orquestador de Torneo (asyncio, application/tournament_orchestrator.py), el sistema multi-agente (Strategy/Ensemble: agents/react_agent.py, agents/tot_agent.py, agents/ensemble_agent_simple.py), la capa de investigación (AskNews + fallbacks: infrastructure/external_apis/tournament_asknews_client.py), y la capa LLM (Metaculus Proxy + OpenRouter: infrastructure/external_apis/metaculus_proxy_client.py, infrastructure/external_apis/llm_client.py). Una frase por componente con tecnología principal."

**Prompt 2:**
"Especifica cómo se maneja la resiliencia: retries con backoff, circuit breakers, detección de cuota excedida y conmutación automática de proveedor. Señala módulos: reliability/api_manager.py (retries/circuit breakers), infrastructure/config/budget_manager.py y cost_monitor.py (límite de cuota/costos), tri_model_router.py (routing/estrategias)."

**Prompt 3:**
"Incluye un resumen de monitoreo: logs estructurados (infrastructure/logging/reasoning_logger.py), contadores de requests y métricas de éxito/fallback (infrastructure/monitoring/metrics_service.py, integrated_monitoring_service.py), tiempos de respuesta y consumo de créditos/proxy (logs/performance/*.json si aplica)."

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
"Genera una estructura de carpetas comentada basada en el repo real (ajusta prefijo si no hay src/):

- cli/run_forecast.py (entrada CLI)
- application/dispatcher.py, forecast_service.py, ingestion_service.py, tournament_orchestrator.py (casos de uso/orquestación)
- domain/entities/{question.py,prediction.py,research_report.py}, services/{ensemble_service.py,forecasting_service.py,validation_stage_service.py}, value_objects/* (núcleo de dominio)
- infrastructure/external_apis/{tournament_asknews_client.py,metaculus_client.py,metaculus_proxy_client.py,llm_client.py,search_client.py}, monitoring/{metrics_service.py,integrated_monitoring_service.py}, logging/reasoning_logger.py, config/* (adaptadores e infraestructura)
- agents/{react_agent.py,tot_agent.py,ensemble_agent_simple.py,tree_of_thought_agent.py} (estrategias/razonamiento)
- docs/*.md (documentación operativa)

Explica el propósito de cada carpeta en 1 línea."

**Prompt 2:**
"Relaciona la estructura con DDD/Clean Architecture (dónde viven entidades, servicios de dominio, adaptadores de infraestructura y casos de uso). Usa rutas reales: domain/entities/*, domain/services/*, application/*, infrastructure/external_apis/* y agentes como orquestadores de estrategias."

**Prompt 3:**
"Incluye una nota sobre convenciones de nombres y principios de diseño (SRP, separación de capas, testabilidad) y referencia ejemplos: forecasting_service.py (servicio de dominio), tournament_orchestrator.py (caso de uso), metaculus_proxy_client.py (adaptador externo)."

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
"Documenta el flujo CI/CD con GitHub Actions (tests automáticos y job de torneo). Añade un diagrama Mermaid simple DEV → GitHub Actions → Producción (Docker opcional). Cita workflows reales si existen: .github/workflows/test_bot.yaml y .github/workflows/run_bot_on_tournament.yaml."

**Prompt 2:**
"Escribe instrucciones de despliegue en Docker (build, run con variables de entorno) y referencia a docker-compose.* disponibles, apoyándote en docs/DEPLOYMENT.md y docs/EMERGENCY_DEPLOYMENT.md si aplican."

**Prompt 3:**
"Lista variables sensibles y su gestión como secretos; indica buenas prácticas (no comprometer .env, usar GitHub Secrets). Menciona OPENROUTER_API_KEY, ASKNEWS_CLIENT_ID/ASKNEWS_SECRET, METACULUS_TOKEN, y settings en infrastructure/config/settings.py."

### **2.5. Seguridad**

**Prompt 1:**
"Enumera prácticas de seguridad aplicadas: validación de entrada, manejo de secretos por entorno, sanitización de logs, límites de tasa, y mínimos privilegios en despliegue. Apóyate en infrastructure/external_apis/submission_validator.py (validación), infrastructure/logging/reasoning_logger.py (sanitización) y reliability/api_manager.py (rate limiting/circuit breakers)."

**Prompt 2:**
"Incluye ejemplos cortos de patrones seguros (no registrar claves, validar IDs de preguntas, manejar timeouts y errores de red) y referencia dónde se integrarían (metaculus_client.py para IDs/timeout, openrouter/metaculus_proxy_client.py para credenciales)."

**Prompt 3:**
"Propón 2-3 mejoras futuras: rotación de credenciales, escaneo SAST en CI, y alertas de seguridad. Sugiere integrar alert_system.py (monitoring) para notificaciones de seguridad."

### **2.6. Tests**

**Prompt 1:**
"Describe la estrategia de testing con pytest: unitarios por agente y servicios (carpetas agents y domain/services), integración end-to-end (scripts/validate_tournament_integration.py), y tests de configuración (OpenRouter/AskNews). Si existe htmlcov, menciona cobertura (htmlcov/index.html)."

**Prompt 2:**
"Proporciona 2 casos de prueba clave: (a) fallback automático cuando falla AskNews (tournament_asknews_client.py → fallback en llm_client.py/openrouter), (b) validación de configuración de OpenRouter (enhanced_llm_config.py/openrouter_startup_validator.py). Incluye criterios de aceptación."

**Prompt 3:**
"Indica cómo ejecutar los tests y cómo interpretar resultados (porcentaje de éxito, tiempos medios, tasa de fallback). Si aplica, referencia scripts de demo en examples/* para validar manualmente pipelines (p. ej., multi_stage_validation_pipeline_demo.py)."

---

### 3. Modelo de Datos

**Prompt 1:**
"Genera un diagrama Mermaid ER con entidades Question, Prediction y ResearchReport, incluyendo tipos, PK/FK, unique/not null, y relaciones. Añade status en Question y reasoning/created_at según corresponda. Indica su ubicación en el código: domain/entities/{question.py,prediction.py,research_report.py}."

**Prompt 2:**
"Escribe la descripción de las entidades con todos los campos y restricciones (tipos, enums, not null, unique, relaciones) y mapea a clases Python reales si existen en domain/entities/*.py."

**Prompt 3:**
"Incluye notas de diseño: cómo se mapea a modelos Python y consideraciones de crecimiento (índices por consultas frecuentes) y enlaza con repositories si existen (domain/repositories/*.py) para acceso/almacenamiento."

---

### 4. Especificación de la API

**Prompt 1:**
"Documenta en OpenAPI 3.0 tres endpoints de servicio: /health, /ready y /metrics (Prometheus). Deja claro que el forecasting se expone por CLI y API programática, no por HTTP por defecto. Si existe un módulo de servicio HTTP, referencia su ruta; si no, especifica que se trata de endpoints cuando se despliega como servicio."

**Prompt 2:**
"Describe la API programática anclando a módulos reales: application/forecast_service.py (servicio de forecasting) y application/tournament_orchestrator.py (orquestación). Explica métodos típicos (forecast_question, forecast_questions_batch, run_tournament) alineándolos con las funciones/clases existentes. Especifica inputs/outputs (prediction, confidence, reasoning) con ejemplos JSON."

**Prompt 3:**
"Añade ejemplos de uso por CLI: ejecución de torneo (cli/run_forecast.py), dry-run y validaciones (scripts/validate_tournament_integration.py)."

---

### 5. Historias de Usuario

**Prompt 1:**
"Redacta 3 historias de usuario: (a) participante quiere predicciones automáticas; (b) sistema quiere investigación multi-fuente; (c) operador quiere control de costos. Formato clásico (Como…, Quiero…, Para…)."

**Prompt 2:**
"Define criterios de aceptación medibles para cada historia (tasa de éxito, tiempo de respuesta, coste máximo por predicción)."

**Prompt 3:**
"Propón métricas de producto para evaluar el impacto (éxito de pronósticos, uso de cuotas, ratio de fallback) y conéctalas con métricas técnicas disponibles (infrastructure/monitoring/metrics_service.py)."

---

### 6. Tickets de Trabajo

**Prompt 1:**
"Escribe un ticket Backend: resiliencia de APIs externas con retries/backoff, circuit breakers y logging/metrics. Incluir pasos, criterios de done y riesgos. Referencia módulos objetivo: reliability/api_manager.py, infrastructure/monitoring/metrics_service.py, infrastructure/external_apis/*.py."

**Prompt 2:**
"Escribe un ticket Frontend: dashboard de monitoreo (métricas clave, uso de presupuesto, estado de componentes, log viewer con filtros). Definir endpoints de datos y mock si no hay backend. Usa como fuente de datos los endpoints /metrics y archivos logs/performance/*.json si existen."

**Prompt 3:**
"Escribe un ticket Bases de Datos: optimizar esquema con índices para consultas, particionado para tablas grandes y vistas materializadas para agregaciones. Añade migraciones/rollback. Conecta con domain/repositories/*.py (si existen) para impacto en acceso a datos."

---

### 7. Pull Requests

**Prompt 1:**
"Resume un PR que añada Metaculus Proxy con fallback a OpenRouter: objetivo, cambios principales, pruebas realizadas y riesgos. Cita archivos tocados: infrastructure/external_apis/metaculus_proxy_client.py, infrastructure/external_apis/llm_client.py, infrastructure/config/enhanced_llm_config.py."

**Prompt 2:**
"Resume un PR que incorpore el cliente Tournament AskNews con gestión de cuota: descripción, configuración necesaria y casos de prueba. Cita infrastructure/external_apis/tournament_asknews_client.py y cost_monitor.py/budget_manager.py."

**Prompt 3:**
"Resume un PR de dependencia (Dependabot): qué paquetes actualiza, justificación, pruebas de regresión y pasos de rollback. Indica ejecución de CI y pruebas clave (scripts/validate_tournament_integration.py) para asegurar compatibilidad."
