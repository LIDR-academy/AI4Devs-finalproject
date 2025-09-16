# Epic 1: MVP Vertical Slice + Single Agent Proof

**Objetivo Expandido**: Entregar en 2-3 semanas un vertical slice funcional que permita a developers hacer preguntas sobre código y recibir respuestas contextuales, validando la hipótesis core de que "AI contextual elimina miedo al fracaso mejor que documentación tradicional". Este epic prioriza speed-to-feedback sobre arquitectura perfecta.

## Story 1.1: Nura Core Kernel Mínimo
**Como** desarrollador que necesita ayuda técnica,  
**Quiero** que existe un sistema core que pueda recibir mis preguntas,  
**Para que** tenga un punto de entrada confiable para obtener información contextual.

### ✅ Acceptance Criteria
1. Nura Core puede recibir queries de texto via API REST
2. Implementa plugin registration básico para single agent
3. Maneja routing simple: pregunta → Dev Agent → respuesta
4. Incluye logging básico para debugging y métricas iniciales
5. FastAPI server running en localhost con health check endpoint

## Story 1.2: Dev Agent Plugin Básico
**Como** desarrollador junior/mid-level con preguntas técnicas,  
**Quiero** un agente especializado que entienda código y proporcione contexto,  
**Para que** pueda aprender sin exposición social o miedo al juicio.

### ✅ Acceptance Criteria  
1. Dev Agent plugin se registra automáticamente con Nura Core
2. Procesa preguntas sobre código usando CodeLlama-70B via AWS Bedrock
3. Responde con contexto técnico + business context cuando relevante
4. Implementa formato "Te recuerdo que..." para enseñanza sin condescendencia
5. Maneja errores gracefully con fallback a respuesta genérica

## Story 1.3: Indexación Código Básica
**Como** developer que quiere respuestas sobre mi codebase específico,  
**Quiero** que el sistema tenga conocimiento del código actual,  
**Para que** las respuestas sean relevantes a mi proyecto real.

### ✅ Acceptance Criteria
1. Script manual indexa archivos .py, .js, .ts del proyecto local  
2. Usa BGE-M3 embeddings via SageMaker endpoint básico
3. Almacena vectors en PostgreSQL + pgvector (single table MVP)
4. Indexa mínimo 80% de archivos core del codebase
5. Retrieval búsqueda devuelve top-5 resultados relevantes por query

## Story 1.4: Streamlit Interface Ultra-Básico  
**Como** usuario final que quiere interactuar con Nura,  
**Quiero** una interfaz simple donde hacer preguntas,  
**Para que** pueda comenzar a usar el sistema inmediatamente.

### ✅ Acceptance Criteria
1. Streamlit app con input text + chat history display
2. Submit button conecta a Nura Core API 
3. Muestra respuestas del Dev Agent en formato conversational
4. Incluye indicador visual de "processing" durante requests
5. Error handling básico si Nura Core no responde

## Story 1.5: Conexión AWS Bedrock + SageMaker
**Como** sistema que necesita capacidades AI,  
**Quiero** integración funcional con AWS managed services,  
**Para que** pueda proporcionar respuestas inteligentes sin manejar infrastructure AI.

### ✅ Acceptance Criteria
1. Conexión estable a CodeLlama-70B via AWS Bedrock SDK
2. SageMaker endpoint BGE-M3 responde a embedding requests <500ms
3. Maneja AWS credential management y region configuration  
4. Implementa retry logic básico para service timeouts
5. Cost monitoring alerts si usage excede $100/mes en Epic 1

## Story 1.6: Infrastructure as Code + Deployment Automation
**Como** development team que necesita deployment reproducible y escalable,  
**Quiero** infrastructure completamente automatizada usando IaC patterns,  
**Para que** tenga foundation sólida para scaling y environment consistency desde el MVP.

### ✅ Acceptance Criteria
1. **Terraform IaC**: Complete AWS EKS cluster provisioning con networking, security groups, IAM roles
2. **ArgoCD GitOps**: Deployment automation usando ArgoCD con values.yml configuration management
3. **Jenkins Pipeline**: Jenkinsfile implementado para CI/CD workflow - build → test → deploy → ArgoCD sync
4. **Helm Charts**: Kubernetes manifests usando Helm para Nura Core + PostgreSQL + supporting services
5. **Environment Management**: Separación dev/staging/prod environments con promotion workflow
