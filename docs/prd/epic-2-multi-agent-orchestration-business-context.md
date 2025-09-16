# Epic 2: Multi-Agent Orchestration + Business Context

**Objetivo Expandido**: Completar el value proposition diferenciador de Nura agregando PM Agent + Architect Agent + orquestación inteligente + business context integration. Transforma el single-agent proof en experiencia multi-agente completa que distingue Nura de competidores como GitHub Copilot.

## Story 2.1: PM Agent Plugin + Business Context Integration
**Como** desarrollador que necesita entender el "por qué" empresarial de features,  
**Quiero** un agente que explique contexto de negocio y decisiones técnicas,  
**Para que** pueda implementar código que alinee con objetivos empresariales reales.

### ✅ Acceptance Criteria
1. PM Agent plugin se registra con Nura Core usando Llama-3.1-70B
2. Procesa consultas sobre reglas de negocio, procesos, y contexto funcional
3. Integra documentación Confluence indexada para business context
4. Respuestas conectan features técnicos con objetivos de negocio específicos
5. Formato educativo explica "por qué se tomó esta decisión técnica"

## Story 2.2: Architect Agent Plugin + Dependency Analysis  
**Como** desarrollador que necesita entender arquitectura del sistema,  
**Quiero** un agente que analice dependencias y genere vistas estructurales,  
**Para que** pueda hacer cambios informados sin romper componentes relacionados.

### ✅ Acceptance Criteria
1. Architect Agent plugin integrado usando Claude-3.5 Sonnet
2. Analiza imports, package.json, y dependencies para mapeo estructural
3. Genera vistas de "¿qué impacto tiene cambiar esta API?" 
4. Identifica consumers/producers de servicios específicos
5. Explica coupling entre componentes con recomendaciones de design

## Story 2.3: Nura Core Orchestration Intelligence
**Como** usuario haciendo preguntas diversas a Nura,  
**Quiero** que el sistema dirija mi consulta al agente más apropiado,  
**Para que** reciba la respuesta más especializada sin tener que elegir manualmente.

### ✅ Acceptance Criteria  
1. Nura Core analiza intent de queries y determina agente apropiado
2. Routing inteligente: código → Dev Agent, negocio → PM Agent, arquitectura → Architect Agent
3. Maneja consultas híbridas que requieren multiple agents coordination
4. Implementa fallback si agent primario falla o no tiene confianza
5. Response aggregation cuando multiple agents necesarios

## Story 2.4: Confluence Connector + Business Knowledge Base
**Como** PM Agent que necesita contexto empresarial actualizado,  
**Quiero** acceso a documentación de negocio y procesos organizacionales,  
**Para que** pueda proporcionar respuestas precisas sobre rules y workflows empresariales.

### ✅ Acceptance Criteria
1. Connector plugin indexa documentación Confluence manualmente
2. Búsqueda semántica en business docs usando BGE-M3 consistent embeddings
3. Categorización automática: technical docs vs business processes vs requirements
4. PM Agent accede business context para enrichar respuestas técnicas
5. Handle Confluence permissions y document access control básico

## Story 2.5: Enhanced Chat Interface + Agent Visibility
**Como** usuario interactuando con sistema multi-agente,  
**Quiero** ver cuál agente está procesando mi consulta y por qué,  
**Para que** entienda el sistema y confíe en la especialización de respuestas.

### ✅ Acceptance Criteria
1. Streamlit interface muestra "Dev Agent thinking..." during processing
2. Response headers indican cuál agent(s) generaron la respuesta
3. Agent reasoning visible: "Dirigido a Architect Agent porque mencionaste dependencies"
4. Chat history differencia visualmente respuestas por agent type
5. Basic metrics dashboard: queries por agent, response times

## Story 2.6: Cross-Agent Learning + Context Sharing
**Como** sistema multi-agente inteligente,  
**Quiero** que agents compartan context relevante entre consultas,  
**Para que** proporcionen respuestas más coherentes y aprovechen knowledge acumulado.

### ✅ Acceptance Criteria
1. Nura Core mantiene conversation context shared entre agents
2. Dev Agent puede referenciar business context del PM Agent en responses
3. Architect Agent usa code context del Dev Agent para dependency analysis  
4. Context expiration después de 1 hora para prevent information staleness
5. Privacy controls: sensitive business context no shared inappropriately
