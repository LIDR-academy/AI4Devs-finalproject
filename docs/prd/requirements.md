# 📋 Requirements

## ✨ Functional

**MVP Core (Months 1-3)**

**FR1**: **Nura Core** debe delegar consultas automáticamente al agente especializado apropiado (dev agent, pm agent, architect agent) basado en análisis de intent del usuario

**FR2**: **WebApp Ultra-Minimalista** debe implementar chat interface usando Streamlit donde Nura Core responde consultas sobre código, arquitectura y contexto de negocio usando knowledge base indexado

**FR3**: El Dev Agent debe proporcionar respuestas técnicas que incluyan contexto de negocio relevante cuando aplique, educando al desarrollador sobre reglas empresariales implícitas en el código

**FR4**: El PM Agent debe explicar el "por qué" empresarial detrás de decisiones técnicas, conectando features con objetivos de negocio usando documentación Confluence indexada

**FR5**: El Architect Agent debe analizar dependencias de código y generar vistas estructurales básicas desde imports y package.json

**FR6**: Todos los agentes deben implementar confidence scoring (1-10) mostrando nivel de confianza en cada respuesta para prevenir crisis de información incorrecta

**FR7**: El sistema debe indexar manualmente código Bitbucket + documentación Confluence con búsqueda semántica usando BGE-M3 embeddings (indexación inicial, no sync tiempo real)

**Post-MVP Phase 2 (Months 4-6)**

**FR8**: Nura debe mantener historial contextual de conversaciones permitiendo referencias a intercambios previos para mentorship continuado

**FR9**: El sistema debe detectar y prevenir preguntas duplicadas, sugiriendo búsquedas en knowledge base antes de procesar nueva consulta

**FR10**: Nura debe implementar formato de respuesta "Te recuerdo que..." para enseñanza sin condescendencia, reforzando debilidades detectadas

**FR11**: Sincronización automática en tiempo real con Bitbucket merges y actualizaciones Confluence

**Post-MVP Phase 3 (Months 7-9)**

**FR12**: El sistema debe generar métricas de adopción y independencia (reducción de preguntas a seniors) con dashboards analytics

**FR13**: Implementar multi-tenancy con segregación completa por empresa/cuenta y control granular de acceso por roles

**FR14**: Plugin IDE (VS Code/CursorAI) con preguntas contextuales directas y auto-sugerencias basadas en patrones

## ⚙️ Non Functional

**MVP Core (Months 1-3)**

**NFR1**: Tiempo de respuesta debe ser <2 segundos para consultas básicas, <5 segundos para análisis arquitectónicos usando Streamlit interface

**NFR2**: Accuracy de respuestas debe mantener >97% según validación de usuarios para evitar crisis de confianza

**NFR3**: Costo operacional AWS debe mantenerse <$670/mes durante MVP (SageMaker + Bedrock optimizado)

**NFR4**: Context coverage debe alcanzar >80% del codebase core y documentación técnica crítica (indexación manual inicial)

**Post-MVP Phase 2 (Months 4-6)**

**NFR5**: El sistema debe soportar 50+ consultas concurrentes sin degradación usando PostgreSQL + pgvector optimizado

**NFR6**: Vector search debe generar embeddings en <100ms usando SageMaker BGE-M3 endpoint con auto-scaling

**NFR7**: Migración a React + shadcn + AI SDK debe mantener <1s page load con streaming responses

**Post-MVP Phase 3 (Months 7-9)**

**NFR8**: Uptime de conectores automáticos debe ser >99% para mantener knowledge base sincronizado

**NFR9**: Sistema debe implementar graceful degradation completo: single-agent fallback, multi-model fallback, offline mode

**NFR10**: Soporte para 10+ tenants con complete data isolation y horizontal scaling
