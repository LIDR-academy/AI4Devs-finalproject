# Registro de Decisiones Arquitectónicas y de Producto

Este archivo documenta todas las decisiones importantes tomadas durante el desarrollo del proyecto. Funciona como un ADR (Architecture Decision Record) simplificado.

## 2025-12-19 - Implementación del Memory Bank
- **Contexto:** En un entorno multi-agente como Antigravity, múltiples instancias de Gemini pueden trabajar simultáneamente en diferentes partes del código. Sin un estado compartido, los agentes podrían entrar en conflicto o perder contexto.
- **Decisión:** Crear una estructura de "Memory Bank" con archivos markdown que sirvan como fuente única de verdad para el contexto del proyecto. Implementar reglas obligatorias (`.agent/rules/00-memory-bank.md`) que fuercen a todos los agentes a leer el contexto antes de trabajar.
- **Consecuencias:** 
  - ✅ **Ganamos:** Coherencia entre agentes, trazabilidad de cambios, contexto persistente.
  - ⚠️ **Perdemos:** Requiere disciplina para mantener actualizado, overhead inicial de documentación.

---

## 2025-12-19 - Separación del Market Analysis en Archivo Dedicado
- **Contexto:** La investigación de mercado genera mucha información táctica (pain points, competidores, propuestas). Incluirla en `productContext.md` lo haría excesivamente largo y difícil de mantener.
- **Decisión:** Crear `memory-bank/market-analysis.md` como archivo dedicado para toda la investigación de mercado y propuestas estratégicas. Mantener `productContext.md` enfocado en el contexto de negocio de alto nivel.
- **Consecuencias:**
  - ✅ **Ganamos:** Separación de concerns, fácil navegación, documentación especializada.
  - ⚠️ **Perdemos:** Un archivo más que mantener sincronizado.

---

## 2025-12-23 - Evaluación de Smart XREF como Candidato TFM
- **Contexto:** El pain point de XREF/Large Model Management identificado en market research (7k views en Discourse) parecía un candidato fuerte. Se requería validación técnica antes de comprometer 3 meses de TFM.
- **Decisión:** Realizar análisis de viabilidad profundo antes de comenzar desarrollo. Crear `feasibility-smart-xref.md` con evaluación crítica de: data gravity, limitaciones de rhino3dm, análisis competitivo (Speckle), y estrategias de indexado.
- **Consecuencias:**
  - ✅ **Ganamos:** Evitamos comprometer 3 meses en proyecto demasiado ambicioso. Descubrimos que la solución completa (granular loading) requiere custom file parser y equipo de 12-18 meses.
  - ✅ **Ganamos:** Identificamos MVP viable: metadata index (búsqueda sin carga granular) que es factible en 3 meses.
  - ⚠️ **Pendiente:** Decisión entre Smart XREF MVP (metadata index) o pivot a Semantic Rhino (clasificación AI de capas).

---

## 2025-12-23 - Evaluación Técnica: Deep Learning vs. Hybrid para Semantic Rhino
- **Contexto:** La propuesta original de Semantic Rhino sugería usar PointNet/Graph CNNs (redes neuronales geométricas). Se requería análisis crítico de viabilidad técnica para un TFM de 3 meses.
- **Decisión:** Rechazar enfoque de Deep Learning académico. Adoptar **arquitectura híbrida**: LLM (GPT-4/Gemini) para clasificación zero-shot + algoritmos geométricos clásicos (bounding box, normales, volumen) para validación.
- **Consecuencias:**
  - ✅ **Ganamos:** 
    - No requiere dataset etiquetado (PointNet necesita 1,000+ ejemplos por clase)
    - Timeline realista (2-3 semanas vs. 8-10 semanas)
    - Accuracy aceptable (75-85% vs. 90-95% teórico de DL)
    - Explainability (reglas transparentes vs. black box)
  - ⚠️ **Perdemos:** 
    - Menor "novedad académica" aparente
    - Dependencia de APIs externas (OpenAI/Google)
    - Costo operativo (~$5/día en API calls)
  - ✅ **Justificación Pragmática:** GPT-4 logra 95% accuracy en clasificación zero-shot sin entrenamiento. El objetivo es un producto funcional, no un paper de investigación.

---

## 2025-12-24 - Rechazo de RL para SmartFabricator: Realidad de Taller
- **Contexto:** La propuesta original de SmartFabricator sugería usar Reinforcement Learning para optimización multi-objetivo (precisión vs. coste vs. velocidad). Se requería "reality check" técnico considerando limitaciones de hardware y seguridad.
- **Decisión:** **Rechazar** enfoque de Reinforcement Learning para TFM. **Condicionar** SmartFabricator solo como **Curve-to-Arc MVP** usando optimización clásica + ML para predicción de tolerancia.
- **Consecuencias:**
  - ❌ **Por qué NO RL:**
    - Requiere simulador de CNC físicamente preciso (8+ semanas solo para el simulador)
    - Necesita 100k-1M iteraciones de entrenamiento (semanas en GPU)
    - **Crítico**: Sin acceso a CNC para validación, todo es teórico sin prueba de realidad
    - **Seguridad**: RL podría "alucinar" G-code peligroso (colisiones físicas, daño a máquinas)
  - ✅ **Alternativa Viable (MVP Curve-to-Arc)**:
    - Usa optimización convexa clásica (determinista, garantías matemáticas)
    - ML solo para predicción de tolerancia óptima (low-risk, high-value)
    - Output: Geometría DXF limpia (NO G-code) → CAM software hace la conversión segura
    - Timeline: 12 semanas factibles
  - ⚠️ **Lección Clave**: "El papel lo aguanta todo, pero el taller no perdona bad G-code." La fabricación digital requiere validación física que no es viable en un TFM sin acceso a maquinaria industrial.

---

## 2025-12-26 - Rechazo de AEC Copilot para Producción: Ruleta Rusa Legal
- **Contexto:** La propuesta de AEC Interaction Copilot (Natural Language → RhinoScript execution) promete UX revolucionario pero requiere ejecutar código generado por LLM directamente en entorno de producción con archivos de $50k+.
- **Decisión:** **Aprobar SOLO como demo de investigación educativa**. **Rechazar rotundamente como herramienta de producción** para usuarios reales sin infraestructura de seguridad empresarial.
- **Consecuencias:**
  - ❌ **Por qué NO Producción:**
    - **Alucinación Destructiva**: LLM puede generar `rs.DeleteObjects(rs.AllObjects())` por error → 40 horas de trabajo perdidas
    - **Sandbox Escapes**: Investigación muestra que incluso contenedores Docker tienen vulnerabilidades explotables
    - **Prompt Injection**: Atacantes pueden manipular LLM para generar código malicioso
    - **Responsabilidad Legal**: Una eliminación accidental viral en Twitter = demanda que termina carrera
    - **Infraestructura Requerida**: Docker sandbox + security audit  + legal ToS = $20k+ y 6+ meses con equipo
  - ✅ **Viable como Demo TFM**:
    - Dry-run preview mode (geometría temporal en capa preview)
    - Whitelist estricto (SOLO operaciones seguras, NO `rs.DeleteObjects()`)
    - Disclaimers educativos ("Research prototype only")
    - Thesis focus en arquitectura de seguridad
    - **Nota de TFM**: 8-9/10 (innovación reconocida, scope limitado a investigación aceptado)
  - **comparativa Industria**: GitHub Copilot (oro estándar) tiene ejército de ingenieros de seguridad + disclaimers extensos + **NO auto-ejecución** (usuario debe copiar-pegar código). AEC Copilot propone ejecutar automáticamente = gap de responsabilidad inaceptable.
  - ⚠️ **Lección Clave**: "Natural Language + Code Execution = Ruleta Rusa Legal. Construye herramientas que los abogados no demandarán. Guarda esto para el PhD, no el TFM."

---

## 2025-12-26 - Rechazo de AEC-NeuralSync para TFM: Complejidad PhD + Riesgo de Privacidad Comprobado
- **Contexto:** La propuesta de AEC-NeuralSync (Federated Learning + LoRA Weights Exchange) promete un sistema revolucionario donde estudios de arquitectura entrenan modelos privados localmente y solo comparten pesos LoRA para mejorar un "Modelo Maestro". La hipótesis clave era: "Los pesos LoRA no permiten reverse-engineering de los datos originales."
- **Decisión:** **Rechazar rotundamente** AEC-NeuralSync como opción TFM. **Condicionar** SOLO como tema de **PhD (3-5 años)** o **startup post-TFM con financiación ($500k+)**.
- **Consecuencias:**
  - ❌ **Claim de Privacidad DESMENTIDO por investigación**:
    - **Membership Inference Attacks (MIA)**: Éxito >90% determinando si datos específicos estuvieron en entrenamiento (LoRA-Leak framework)
    - **Reconstructión de Datos**: Posible extraer código/imágenes originales desde pesos compartidos (Diffusion Models 2024)
    - **Extracción de Modelos**: Replicar funcionalidad completa del adaptador LoRA
    - **Escenario Legal Real**: Estudio A entrena en fachadas propietarias → Competidor B (también cliente) ejecuta MIA → Descubre patrones específicos de A → **Demanda por robo de IP** → Startup muere
  - ❌ **4 Componentes Nivel-PhD Requeridos**:
    1. **Differential Privacy**: 8-12 semanas (gradient clipping + ruido gaussiano calibrado, matemática avanzada)
    2. **LoRA Merging sin Catastrophic Forgetting**: 8-12 semanas (problema de investigación activo 2024, sin garantías)
    3. **Serialización DAG-to-Sequence**: 4-6 semanas (Grasshopper es grafo, LLMs procesan texto secuencial)
    4. **Infraestructura Federated Learning**: 12-16 semanas (sistemas distribuidos complejos)
  - ❌ **Timeline Realista**: 40-60 semanas (18+ meses) vs. 3 meses TFM
  - ❌ **Probabilidad de Éxito TFM**: 10-20% (vs. 85% Semantic Rhino)
  - ❌ **Riesgo Legal Comprobado**: Si competidor extrae diseños propietarios desde pesos compartidos = demandas millonarias
  - ✅ **Alcance Viable (SI se ignoran advertencias)**: 
    - **SOLO** RAG local (búsqueda semántica archivos .gh)
    - **SOLO** LoRA local single-client (NO merging, NO weights exchange)
    - **ABANDONAR** completamente federated learning y claims de privacidad
    - Tesis se convierte en: "Knowledge Base Local para Diseño Paramétrico" (factible 12 semanas)
  - ⚠️ **Comparativa con Industria**: 
    - Google Federated Learning: Equipos de 50+ investigadores PhD, años de desarrollo
    - Apple Differential Privacy: Infraestructura masiva, presupuestos multi-millón
    - **Tu propuesta**: 1 estudiante, 3 meses, 0 financiación → **Scope mismatch extremo**
  - ⚠️ **Lección Clave**: "Intentar construir Tesla Roadster cuando necesitas primero una bicicleta funcional. Semantic Rhino ES la bicicleta. AEC-NeuralSync es el Roadster. Construye la bicicleta, gradúate, LUEGO levanta $10M para construir el Roadster."

---

## 2025-12-30 - Aprobación Condicional de GH-Copilot: GitHub Copilot para Grasshopper con Backup Plan
- **Contexto:** GH-Copilot es la 6ª opción TFM. Propone un sistema de predicción de nodos en tiempo real para Grasshopper usando fine-tuning LoRA o RAG sobre biblioteca privada de archivos `.gh`. Es una variante "scoped-down" que evita los dos asesinos: ejecución arbitraria de código (AEC Copilot) y federated learning multi-cliente (AEC-NeuralSync).
- **Decisión:** **Aprobar CONDICIONAL** como opción TFM #2-3 (empate con SmartFabricator-MVP). **REQUIERE backup plan obligatorio**: Si serialización DAG falla en Semana 6 → pivot a Semantic Rhino.
- **Consecuencias:**
  - ✅ **Evita Problemas Críticos de Opciones Previas**:
    - **NO** ejecución de código (vs. AEC Copilot) → Cero riesgo legal por `DeleteObjects()`
    - **NO** federated learning (vs. AEC-NeuralSync) → Cero riesgo extracción IP entre competidores
    - **SÍ** entrenamiento local single-client → Privacidad garantizada (datos nunca salen del servidor)
  - ✅ **Propuesta de Valor Clara**: "GitHub Copilot para Grasshopper" (analogía viral)
  - ✅ **Probabilidad Éxito**: 70-75% (variante RAG), **superior** a AEC Copilot (10% producción) y AEC-NeuralSync (10-20%)
  - ⚠️ **CUELLO DE BOTELLA CRÍTICO**: **Calidad Serialización DAG** (60% riesgo fallo)
    - Grasshopper usa Data Trees (`{0;1}`, `{0;2}`) y estructuras de grafo paralelas
    - Si serialización pierde esta info → modelo aprende basura → precisión <50%
    - **Mitigación**: Invertir 2-3 semanas extra en serialización robusta con metadata de data trees
  - ✅ **Recomendaciones Técnicas Mandatorias**:
    1. **Approach**: **RAG (NO LoRA)** para MVP
       - **Por qué**: 6 semanas más rápido, funciona con datasets pequeños (50+ .gh files OK)
       - **LoRA**: Requiere 500+ graphs, 2-4 horas entrenamiento GPU, riesgo overfitting
    2. **Serialización**: **Pseudo-sintaxis** (`Point->Circle->Extrude`) mejor que JSON
       - **Por qué**: 70% menos tokens, LLM aprende patrones naturalmente
    3. **UX**: **Side Panel (NO Ghost Nodes)**
       - **Por qué**: Ghost Nodes requieren 6-8 semanas (hacking GH SDK internals, muy arriesgado)
       - Side Panel: 2-3 semanas, Eto.Forms estándar, cero riesgo
    4. **Stack**:
       - Backend: Python (ChromaDB + Flask API)
       - Frontend: C# GH Plugin (Eto.Forms + HttpClient)
       - Parser: GH_IO.dll (mapeo GUID → Component Type)
  - ⚠️ **Plan de Contingencia OBLIGATORIO**:
    - **Semana 6 Decision Gate**: Medir precisión retrieval/predicción
      - SI < 50% precisión → **PIVOT INMEDIATO a Semantic Rhino** (no negociable)
      - SI 60%+ precisión → Continuar con GH-Copilot
    - **Rational**: Evitar sunk-cost fallacy. Mejor cambiar a Semana 6 que entregar TFM incompleto Semana 12.
  - ✅ **Comparativa Risk/Reward**:
    - **Semantic Rhino**: 85% éxito, menor wow-factor, **MÁS SEGURO**
    - **GH-Copilot**: 70-75% éxito, mayor wow-factor (viral en Twitter), **MÁS COOL PERO RIESGOSO**
  - ⚠️ **Lección Clave**: "GH-Copilot es el ÚNICO 'Copilot' variant achievable en 3 meses. Es GitHub Copilot scoped correctamente. Si falla DAG serialization, tienes Semantic Rhino como red de seguridad sólida."

---

## 2026-01-13 - Aprobación de Sagrada Familia Parts Manager: Opción Enterprise / Systems Architect
- **Contexto:** Surgió una 7ª opción enfocada en un caso real "Enterprise": Sistema de Gestión de Piezas para la Sagrada Familia. Se aleja de la idea de "producto SaaS" para enfocarse en "Solución a Medida / Digital Twin".
- **Decisión:** **Aprobar como Opción Tier 1 (Empate con Semantic Rhino)**.
- **Consecuencias:**
  - ✅ **Portfolio Value**: Posiciona el TFM como "Senior Systems Architect" (Full Stack + 3D + Cloud + Data).
  - ✅ **Viabilidad**: Alta (90%). No hay riesgos "científicos" (como RL o Serialización de Grafos), solo retos de Ingeniería (optimización 3D, concurrencia DB).
  - ✅ **Diferenciación**: Se compite por calidad de ejecución, no por novedad algorítmica.
  - ⚠️ **Trade-off**: Menos "AI Core" (LangGraph es potente pero no es un LLM entrenado desde cero).
  - ✅ **Stack Recomendado**:
    - **Frontend**: React + Three.js (Instancing clave para performance).
    - **Backend**: Python (FastAPI + rhino3dm).
    - **Data**: PostgreSQL (Supabase) para RBAC y Relacional.
    - **AI**: LangChain/LangGraph para clasificación automática (Agente "Librarian").
  - ⚠️ **Elección de Carrera**:
    - Si el objetivo es **AI Engineer** puro → **Semantic Rhino**.
    - Si el objetivo es **Tech Lead / Solutions Architect** → **Sagrada Familia**.

---

## 2026-01-20 - SELECCIÓN OFICIAL DE PROYECTO: Sagrada Familia Parts Manager
- **Contexto:** Tras analizar 7 opciones viable (desde algoritmos puros hasta herramientas SaaS), se debe elegir el proyecto único para el TFM del máster ai4devs.
- **Decisión:** **Seleccionar "Sagrada Familia Parts Manager"** como el proyecto definitivo.
- **Alternativas Descartadas:**
  - *Semantic Rhino*: Excelente SaaS, pero enfocado más en ML/Algoritmia pura. Menor componente de "Arquitectura de Sistemas".
  - *GH-Copilot*: Alto riesgo técnico (DAG Serialization) y enfoque "Startup", menos alineado con perfil "Solutions Architect".
- **Justificación:**
  1. **Alineación Profesional**: Este proyecto demuestra habilidades de **Senior Systems Architect** (Full Stack + 3D + Data + AI Integration), un perfil altamente demandado en la industria moderna (Industry 4.0).
  2. **Caso de Uso Real**: Simular un cliente de patrimonio crítico (Sagrada Familia) fuerza decisiones de diseño más robustas y realistas (Alta Disponibilidad, Data Integrity) que un "Toy Project".
  3. **AI Pragmática**: Implementa Agentes (LangGraph) para tareas de "Limpieza y Clasificación de Datos", un caso de uso de AI mucho más implantable hoy en día que la generación generativa pura en CAD.
- **Consecuencias:**
  - El TFM deja de ser una exploración de startups.
  - El foco técnico pasa a: **Optimización 3D (Three.js)**, **Integración Rhino3dm Backend**, y **Agentes de Orquestación**.
  - Se cierra la fase de "Ideación" y comienza "Definición de Producto (PRD)".

---

## 2026-01-26 - Kickoff Oficial: README como Single Source of Truth Técnico
- **Contexto:** Con el proyecto oficializado (Sagrada Familia Parts Manager), necesitamos centralizar toda la especificación técnica en un documento maestro que sirva como:
  1. Referencia arquitectónica completa para desarrollo
  2. Documentación técnica para presentación a inversores/stakeholders
  3. Guía de implementación para el roadmap MVP
- **Decisión:** Crear **README.md** como documento centralizado conteniendo:
  - Arquitectura completa del sistema (Frontend/Backend/Data/AI)
  - Stack tecnológico definitivo con justificación de cada elección
  - Modelo de datos PostgreSQL detallado
  - Roadmap de features priorizado por valor de negocio (P0-MVP → P1-Scale → P2-Enterprise)
  - User personas extendidas con pain points específicos de Oficina Técnica SF
- **Justificación del Enfoque Architecture & Systems**:
  - **Portfolio Value**: Demuestra capacidad Senior Systems Architect (vs. SaaS/Startup scope más limitado)
  - **Viabilidad Controlada**: 90% probabilidad éxito (vs. 70-75% GH-Copilot con riesgo serialización DAG)
  - **Impacto Real**: Simula delivery cliente enterprise crítico (patrimonio UNESCO) forzando decisiones de diseño robustas
  - **AI Pragmática**: Agentes para validación/clasificación datos (alta implantabilidad) vs. generación código (alta aleatoriedad)
- **Consecuencias:**
  - ✅ **Ganamos:**
    - Documentación viva que evoluciona con el código
    - Claridad arquitectónica desde semana 1 (evita re-arquitecturas tardías)
    - Material de presentación técnica directamente reutilizable
    - Decisiones técnicas trackeadas en mismo documento (monorepo, storage, async processing)
  - ✅ **Estrategia MVP para Inversores:**
    - P0 (Semanas 1-6): Upload + Validation + 3D Viewer → **Demo funcional presentable**
    - P1 (Semanas 7-9): Search + RBAC + Audit → **Escalabilidad enterprise**
    - P2 (Semanas 10-12): API + Integraciones → **Extensibilidad ecosistema**
  - ⚠️ **Trade-offs:**
    - README extenso (estimado 800-1200 líneas) requiere disciplina de actualización
    - Riesgo de "documentación adelantada al código" si no se sincroniza
  - ✅ **Mitigación:** Protocolo AGENTS.md obliga actualizar systemPatterns.md/techContext.md ante cambios arquitectónicos
- **Decisiones Técnicas Bloqueantes Identificadas (Requieren Resolución Semana 1):**
  1. **Estructura Monorepo**: Turborepo vs. Nx vs. monorepo simple con workspaces
  2. **Storage Archivos Pesados**: Git LFS vs. Supabase Storage vs. AWS S3 (análisis costo/latencia)
  3. **Async Processing**: Celery+Redis vs. BullMQ vs. Temporal (complejidad setup vs. features)
  4. **Autenticación**: Supabase Auth (integrado) vs. JWT custom (control total)
  5. **Testing Strategy**: Jest+Pytest vs. Vitest+Pytest (velocidad vs. compatibilidad)

---

## 2026-02-09 - Adopción de Clean Architecture para Backend (T-004-BACK Refactor)
- **Contexto:** El código de T-0004-BACK tenía toda la lógica de negocio (verificación de storage, creación de eventos) mezclada directamente en el endpoint del router. Esto viola el principio de Separation of Concerns y hace difícil:
  - Unit testing de lógica de negocio sin levantar servidor HTTP
  - Reutilizar lógica desde workers/CLI/otros contextos
  - Mantener y evolucionar código a medida que crece el proyecto
- **Decisión:** Refactorizar backend siguiendo **Clean Architecture con tres capas**:
  1. **API Layer (`api/`)**: Solo manejo de HTTP (routing, validation, error mapping)
  2. **Service Layer (`services/`)**: Toda la lógica de negocio y orquestación
  3. **Constants (`constants.py`)**: Centralización de magic strings/numbers
- **Implementación Concreta**:
  - Creado `src/backend/services/upload_service.py` con clase `UploadService`
  - Extraídos métodos: `verify_file_exists_in_storage()`, `create_upload_event()`, `confirm_upload()`
  - Creado `src/backend/constants.py` con: `STORAGE_BUCKET_RAW_UPLOADS`, `EVENT_TYPE_UPLOAD_CONFIRMED`, `TABLE_EVENTS`, `ALLOWED_EXTENSION`
  - Reducido endpoint `/confirm` a 15 líneas (coordinación HTTP solamente)
- **Consecuencias:**
  - ✅ **Ganamos:**
    - **Testabilidad**: Servicios probables sin HTTP layer (unit tests aislados)
    - **Reusabilidad**: Lógica accesible desde Celery workers, CLI tools, otros endpoints
    - **Mantenibilidad**: Cambios de reglas de negocio no afectan routing
    - **Escalabilidad**: Patrón replicable para todas las features futuras (T-001-BACK, etc.)
    - **Code Review**: Funciones pequeñas, responsabilidades claras  
  - ⚠️ **Trade-offs**:
    - Más archivos (complejidad aparente inicial para proyecto pequeño)
    - Requiere disciplina para no volver a mezclar lógica en routers
  - ✅ **Validación**: 7/7 tests siguen pasando post-refactor (verificación anti-regresión exitosa)
- **Enforcement Going Forward**: 
  - Todo nuevo endpoint DEBE seguir este patrón
  - Code review rechazará lógica de negocio en routers
  - `systemPatterns.md` actualizado con ejemplos y guías

---

## 2026-02-09 - Mejora del Proceso de Logging con Snippets de Espanso
- **Contexto:** Durante auditoría de codebase (prompt #048), se detectó que el prompt original fue registrado como `:audit-master` (trigger de espanso) en lugar del texto expandido completo. Esto genera pérdida de contexto en prompts.md, violando el principio de trazabilidad completa del proyecto.
- **Root Cause:** AGENTS.md no tenía regla específica sobre cómo manejar snippets de text expansion. El AI intentó "adivinar" si era un snippet pero registró el formato incorrecto.
- **Decisión:** Estandarizar el manejo de snippets de espanso en el workflow de logging:
  1. **Regla en AGENTS.md**: AI DEBE registrar SIEMPRE el texto expandido completo que ve en userRequest, NUNCA solo el trigger
  2. **Formato Estándar** para snippets:
     ```markdown
     **Prompt Original (Snippet expandido):**
     > :trigger-name
     >
     > [Texto completo expandido del snippet]
     ```
  3. **Guía de Best Practices**: Crear `.github/AI-BEST-PRACTICES.md` con patrones para:
     - Uso correcto de snippets en prompts
     - Workflow TDD (RED → GREEN → REFACTOR)
     - Validación de cambios
     - Memory Bank management
     - Auditorías periódicas
     - Troubleshooting
- **Implementación**:
  - ✅ Actualizado AGENTS.md sección 1.B con nota "IMPORTANTE - Snippets de Espanso"
  - ✅ Creado `.github/AI-BEST-PRACTICES.md` (335 líneas, 10 secciones)
  - ✅ Actualizado README.md con sección "Desarrollo Asistido por IA" referenciando guías
  - ✅ Corregido prompt #048 con texto expandido completo
- **Consecuencias:**
  - ✅ **Ganamos:**
    - **Trazabilidad completa**: Prompts registrados con contexto completo
    - **Onboarding mejorado**: Nuevos colaboradores/agentes pueden seguir best practices documentadas
    - **Menos errores de proceso**: Reglas claras reducen ambigüedad
    - **Escalabilidad del workflow**: Guía replicable para otros proyectos
  - ⚠️ **Trade-offs**:
    - Requiere que usuario informe al AI si detecta errores de registro
    - Documentación adicional a mantener
  - ✅ **Validación**: Formato de prompt #048 corregido y verificado
- **Enforcement Going Forward**:
  - AI verificará presencia de triggers (`:nombre`) y registrará texto completo
  - Usuario puede usar formato de nota explícita cuando use snippets complejos
  - Code review de prompts.md verificará que entradas tengan contexto completo

---

## Plantilla para Nuevas Decisiones
```markdown
## [FECHA] - [TÍTULO CORTO]
- **Contexto:** Qué problema teníamos.
- **Decisión:** Qué elegimos (ej. usar Tailwind en lugar de CSS puro).
- **Consecuencias:** 
  - ✅ **Ganamos:** [beneficios]
  - ⚠️ **Perdemos:** [trade-offs]
```
