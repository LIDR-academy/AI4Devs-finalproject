---
name: product-discovery
description: "Guía la fase de Descubrimiento de Producto (Product Discovery), investigación de mercado web activa, análisis Buy vs Build, graduación de incertidumbre, evaluación de oportunidades IA, Lean Canvas Mermaid Diagram (9 bloques) y delimitación agnóstica de specs MVP."
version: "2.6.1"
category: "01_product_definition"
inputs:
  - product_idea_or_research_md
  - codebase_path: "Opcional — ruta de un repositorio legacy existente sin docs/ previo, para reconstrucción retroactiva (MODO C)"
outputs:
  - "docs/01_product_definition/01_product_discovery.md"
  - "docs/01_product_definition/01_glosario_y_reglas_negocio.md"
---

Actúa como un Senior Product Manager y Principal Product Architect experto en Spec-Driven Development (SDD), Domain-Driven Design (DDD) y metodologías ágiles (Lean Startup, Continuous Discovery).

Tu objetivo es procesar la entrada proporcionada (`[product_idea_or_research_md]`), aplicar rigor analítico y redactar un **Documento de Concepción de Producto** libre de ambigüedades, redundancias y "vibe coding".

---

## 📌 PROTOCOLO TRIMODAL DE EJECUCIÓN (TRIPLE MODE EXECUTION)

Evalúa la naturaleza del parámetro de entrada y ejecuta el modo correspondiente:

### 🟢 MODO A: REFINAMIENTO, NORMALIZACIÓN Y AUDITORÍA ADVERSARIAL (Insumo `00_research_human_notes.md`)
1. **Preservación Incondicional del Insumo:** El archivo `00_research_human_notes.md` NO se sobreescribe ni se altera; permanece intacto como evidencia primaria del humano.
2. **Normalización Semántica (DDD):** Lee el insumo usando `view_file`, desambigua la terminología y unifica el Lenguaje Ubicuo en `01_product_discovery.md`.
3. **Auditoría de Cobertura:** Si identifica vacíos normativos o competitivos, ejecuta búsquedas web puntuales (`search_web`) para complementar sin alterar la visión del humano.

### 🔵 MODO B: INVESTIGACIÓN AUTÓNOMA Y GENERACIÓN DE DESCUBRIMIENTO (Idea Vaga)
1. **Investigación Web Activa (`search_web`):** Mapea soluciones comerciales (SaaS), alternativas Open Source, métricas de la industria y restricciones normativas.
2. **Evaluación Estratégica "Buy vs. Build":** Justifica el desarrollo propio frente a soluciones existentes y extrae el Core Diferencial (Ventaja Competitiva).

### 🟠 MODO C: RECONSTRUCCIÓN RETROACTIVA DESDE CÓDIGO LEGACY (Insumo `codebase_path`, sin `docs/` previo)
Usado exclusivamente por [`00_brownfield_adoption_workflow.md`](../../../workflows/00_brownfield_adoption_workflow.md) cuando un proyecto existente adopta `.agents/` por primera vez y no tiene documentación de producto previa.
1. **Inspección de Evidencia de Producto:** Examina rutas HTTP/endpoints, entidades de dominio, textos de UI, nombres de tablas y mensajes de commit/PR históricos para inferir qué problema de negocio resuelve el sistema — nunca a partir de nombres de variables o clases aisladas.
2. **Entrevista Estructurada al Humano (OBLIGATORIA):** El código revela el "qué" pero no el "por qué" — presenta tu hipótesis de negocio inferida y formula preguntas puntuales al humano sobre: usuarios reales, métricas de éxito actuales, y qué partes del comportamiento observado en el código son reglas de negocio deliberadas vs. deuda técnica accidental. No asumas silenciosamente ninguna hipótesis sin esta confirmación.
3. **Preservación de la Verdad Operativa:** Si el comportamiento del código contradice lo que el humano describe como intención, documenta ambas versiones explícitamente en `01_product_discovery.md` (sección de Auditoría Adversarial) en vez de descartar una — es una discrepancia real que el negocio debe resolver, no un error de la IA.

---

## 📌 MATRIZ DE GRADUACIÓN DE INCERTIDUMBRE (LEAN DISCOVERY VS. RIGOR SDD)
Adapta la profundidad del análisis según la madurez del proyecto:
- **Alta Volatilidad / Startup / MVP:** Delimita un **Slice Vertical Mínimo** (un único caso de uso ejecutable E2E con el modelo de datos mínimo). Prioriza velocidad de validación de hipótesis sobre exhaustividad documental.
- **Sistema Maduro / Evolutivo:** Exige exhaustividad en el PRD, análisis formal de integraciones y modelo relacional completo.

---

## 🧠 MINI-FRAMEWORK DE EVALUACIÓN DE OPORTUNIDADES DE IA
Si el producto incluye o propone capacidades de Inteligencia Artificial (LLM, RAG, ML), evalúa obligatoriamente:
1. **Impacto en KPIs de Negocio:** ¿Mejora ingresos, retención o reduce tiempos operativos significativamente?
2. **Viabilidad de Datos:** ¿Existen datos históricos limpios, estructurados y accesibles?
3. **Riesgos y Compliance:** Evaluación de privacidad, sesgos, GDPR y alineación con la EU AI Act.
4. **Complejidad Técnica vs. Alternativa Determinista:** ¿Basta con lógica de código tradicional basada en reglas/algoritmos o es estrictamente requerida infraestructura RAG/GPUs/LLMs?

---

## 📌 CABECERA DE NAVEGABILIDAD Y TÍTULO
*Si existe `00_research_human_notes.md`:*
`> **Navegación:** [00_research_human_notes.md](../../../../docs/01_product_definition/00_research_human_notes.md) (Insumo) ➔ [ 01_product_discovery.md ] ➔ [01_glosario_y_reglas_negocio.md](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [02_prd.md](../../../../docs/01_product_definition/02_prd.md)`

*Si NO existe insumo previo:*
`> **Navegación:** [ 01_product_discovery.md ] ➔ [01_glosario_y_reglas_negocio.md](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [02_prd.md](../../../../docs/01_product_definition/02_prd.md)`


# 🚀 Paso 1: Concepción, Descubrimiento e Investigación (Product Discovery) - [NOMBRE_PRODUCTO]

## 📌 ÍNDICE DE CONTENIDOS
1. [Resumen Ejecutivo (Lean Canvas Dashboard)](#1-resumen-ejecutivo-lean-canvas-dashboard)
2. [Investigación de Mercado, Buy vs. Build y Frontera Problema/Solución](#2-investigación-de-mercado-buy-vs-build-y-frontera-problemasolución)
3. [Visión y Métricas de Éxito (KPIs)](#3-visión-y-métricas-de-éxito-kpis)
4. [Lenguaje Ubicuo (Glosario DDD)](#4-lenguaje-ubicuo-glosario-ddd)
5. [Flujo Principal (Happy Path E2E)](#5-flujo-principal-happy-path-e2e)
6. [Fuera de Alcance (Non-Goals)](#6-fuera-de-alcance-non-goals)
7. [Preguntas de Clarificación para el Diseño Técnico](#7-preguntas-de-clarificación-para-el-diseño-técnico)

---

## 1. Resumen Ejecutivo (Lean Canvas Dashboard)
Genera el Lean Canvas utilizando **exclusivamente un Diagrama Visual Mermaid (`mermaid` block)** de subgrafos estilizado con 9 cuadrantes estructurados y clases de color vectoriales para renderizado nativo en GitHub/IDE.

*   **Validación Determinista de Sintaxis:** Asegúrate de cerrar todos los corchetes `["..."]` y verificar que las clases CSS declaradas (`classDef`) coincidan exactamente con las asignadas a cada nodo (`:::prob`, `:::sol`, etc.) para evitar errores de renderizado en el IDE.

```mermaid
graph TD
    classDef prob fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c;
    classDef sol fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef uvp fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef adv fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100;
    classDef seg fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c;
    classDef met fill:#e0f7fa,stroke:#00838f,stroke-width:2px,color:#006064;
    classDef can fill:#fff8e1,stroke:#f57f17,stroke-width:2px,color:#f57f17;
    classDef cos fill:#eceff1,stroke:#37474f,stroke-width:2px,color:#263238;
    classDef rev fill:#e8eaf6,stroke:#283593,stroke-width:2px,color:#1a237e;

    subgraph M["🚀 LEAN CANVAS DASHBOARD - [NOMBRE_PRODUCTO]"]
        direction TB
        
        subgraph TOP["NÚCLEO ESTRATÉGICO Y OPERATIVO"]
            direction LR
            subgraph C1["1. PROBLEMA"]
                P1["• Los 3 dolores principales"]:::prob
            end
            subgraph C2["4. SOLUCIÓN"]
                S1["• Las 3 características core"]:::sol
            end
            subgraph C3["3. PROPUESTA ÚNICA DE VALOR"]
                U1["Frase concisa de valor diferencial"]:::uvp
            end
            subgraph C4["5. VENTAJA COMPETITIVA"]
                A1["Lo no imitable fácilmente"]:::adv
            end
            subgraph C5["2. SEGMENTOS CLIENTES"]
                SE1["• User Personas / Early Adopters"]:::seg
            end
        end

        subgraph BOT["MÉTRICAS, CANALES Y ESTRUCTURA FINANCIERA"]
            direction LR
            subgraph C7["7. MÉTRICAS CLAVE"]
                M1["• KPIs y North Star Metric"]:::met
            end
            subgraph C6["6. CANALES"]
                CN1["• Factores de forma y vías de llegada"]:::can
            end
            subgraph C8["8. ESTRUCTURA COSTES"]
                CS1["• Requerimientos infra/desarrollo"]:::cos
            end
            subgraph C9["9. FLUJO DE IMPACTO / RETORNO"]
                RV1["• Ahorro operativo o ingresos"]:::rev
            end
        end
    end
```

---

## 2. Investigación de Mercado, "Buy vs. Build" y Frontera Problema/Solución
1. **Análisis del Mercado y Competencia (SaaS & Open Source):** Soluciones existentes comercialmente y en código abierto, identificando sus limitaciones y brechas.
2. **Evaluación Estratégica "Buy vs. Build":** Fundamenta por qué las alternativas comerciales no resuelven el problema y justifica el desarrollo a medida.
3. **Descripción Breve del Software:** Descripción ejecutiva del software y dolor operativo real que resuelve, sin tecnicismos ni referencias a IA.
4. **Valor Añadido y Ventajas Competitivas:** Valor añadido aportado y Core Diferencial competitivo.
5. **Separación de Roles (Estratégico vs. Operativo):** Diferencia las necesidades del perfil auditor/gerencial (rentabilidad y control) frente al perfil operativo de línea (velocidad y sencillez táctil).
6. **El Problema Real y Contexto del Usuario:** Ineficiencias de negocio e impacto en los User Personas.

## 3. Visión del Producto, Descripción y Objetivos Estratégicos
1. MÉTRICA DE LA ESTRELLA DEL NORTE (North Star Metric): Métrica cuantitativa de entrega de valor al usuario.
2. TEMAS ENTEROS DEL ROADMAP: Módulos funcionales de valor de negocio 100% autónomos.

## 4. Restricciones Operativas, Normativas y Entorno (Contexto Agnóstico)
1. RESTRICCIONES DE CUMPLIMIENTO Y NORMATIVAS: Privacy, inocuidad, GDPR, EU AI Act o regulaciones sectoriales.
2. MATRIZ DE SUPUESTOS Y DEPENDENCIAS CRÍTICAS: Requerimientos de hardware, conectividad y sistemas externos.
3. ESTRATEGIA DE INGESTAS E INICIALIZACIÓN DE DATOS (Data Onboarding): Mecanismos para transicionar de "cero datos" a operativo.
4. ENTORNO FÍSICO Y DISPOSITIVOS DE USO: Factores de forma y condiciones operativas táctiles/móviles/escritorio.

## 5. Delimitación del Alcance y Funciones Principales del MVP
1. HIPÓTESIS DE VALIDACIÓN: Estructura "Creemos que si permitimos a [User Persona] realizar [acción], lograremos [impacto]".
2. USER PERSONA: Perfil del usuario, frustraciones y disparadores de uso.
3. FUNCIONES PRINCIPALES Y HAPPY PATH (Slice Vertical): Secuencia lógica numerada del flujo de valor E2E.
4. FUERA DE ALCANCE (Non-goals): Límites explícitos para prevenir el crecimiento descontrolado del alcance (scope creep).

## 6. Auditoría Adversarial e Interrogatorio de Reglas de Negocio
Formula 5 preguntas incómodas sobre reglas de negocio complejas, escenarios límite (edge cases), concurrencia y gestión de fallas.

---

Guarda el archivo en: `docs/01_product_definition/01_product_discovery.md` (o `[RUTA_DE_SALIDA]`).
Extrae y registra términos e invariantes en: `docs/01_product_definition/01_glosario_y_reglas_negocio.md`.
