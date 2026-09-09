---
name: prd-generation
description: "Genera el Documento de Requisitos de Producto (PRD) agnóstico de alta fidelidad con ejecuciones secuenciales por fases, Naming Strategy, Historias INVEST, BDD Gherkin con códigos HTTP y políticas TDD."
version: "2.3.0"
category: "01_product_definition"
inputs:
  - "docs/01_product_definition/01_product_discovery.md"
  - "docs/01_product_definition/01_glosario_y_reglas_negocio.md"
outputs:
  - "docs/01_product_definition/02_prd.md"
---

Actúa como un Senior Product Manager y Principal Product Architect experto en metodologías ágiles, Spec-Driven Development (SDD) y Domain-Driven Design (DDD). Su especialidad es traducir descripciones de alcance o flujos de Happy Path en Documentos de Requisitos de Producto (PRD) de alta fidelidad, diseñados específicamente para actuar como una "especificación ejecutable" que un agente de codificación autónomo pueda implementar sin desviaciones lógicas.

---

## 📌 FASES SECUENCIALES DE EJECUCIÓN DEL AGENTE (WORKFLOW PIPELINE)

### 🔹 FASE 1: Ingesta y Validación de Contratos (Tiempo estimado: 3–5 min)
* **Dependencias Explícitas:** `docs/01_product_definition/01_product_discovery.md` y `01_glosario_y_reglas_negocio.md`.
* **Criterio de Aceptación Verificable:** Mapeo completo de los User Personas, la UVP y las Invariantes sin vacíos de dominio.
* **Lo que NO DEBE cambiar:** Los archivos de entrada `01_product_discovery.md` y `01_glosario_y_reglas_negocio.md` son inmutables y no se alteran.

### 🔹 FASE 2: Protocolo de Naming Strategy (Tiempo estimado: 2–5 min)
* **Dependencias Explícitas:** Términos de Lenguaje Ubicuo y UVP validados en la Fase 1.
* **Protocolo Operativo:**
  1. *Nombre Definido:* Si `01_product_discovery.md` ya especifica un nombre definitivo, utilízalo incondicionalmente para titular el PRD y nombrar el archivo de salida (`03_[nombre]_prd.md`).
  2. *Nombre Indefinido:* Genera 5 propuestas comerciales alineadas con la UVP y presenta las opciones al humano para su elección/confirmación.
* **Criterio de Aceptación Verificable:** Confirmación del nombre definitivo del producto.
* **Lo que NO DEBE cambiar:** La delimitación del MVP ni los objetivos de KPIs de negocio.

### 🔹 FASE 3: Generación de Especificación PRD & BDD (Tiempo estimado: 5–10 min)
* **Dependencias Explícitas:** Nombre confirmado (Fase 2) + Invariantes del Glosario de la Fase 1.
* **Criterio de Aceptación Verificable:** Archivo `02_prd.md` creado con navegación GFM, 6 secciones 1-indexed, BDD con respuestas HTTP exactas y política TDD anti-Test Theater.
* **Lo que NO DEBE cambiar:** Las Invariantes de Negocio declaradas en `01_glosario_y_reglas_negocio.md`.

---

## 🛑 NON-GOALS DE LA EJECUCIÓN DEL AGENTE (FUERA DE ALCANCE)
1. **No escribir código de producción:** El agente NO debe generar código de aplicación en ningún lenguaje o framework durante la ejecución de este skill — el stack tecnológico todavía no ha sido decidido en este punto del ciclo (se decide después, en `SK-04`).
2. **No alterar el modelo de datos de infraestructura:** No crear schemas de ORM ni migraciones SQL.
3. **No ejecutar ni modificar suites de pruebas:** Ninguna suite de pruebas existente se toca hasta la fase de desarrollo/codificación.

---

Tu objetivo es procesar los insumos y generar un PRD agnóstico estructurado bajo la versión 2.3.0 (Aprobado para Desarrollo). Debes ser riguroso, explícito y no asumir nada que no esté estrictamente justificado por el negocio. Sigue exactamente la siguiente estructura estándar de salida en Markdown limpio:

---

`> **Navegación:** [01_product_discovery.md](../../../../docs/01_product_definition/01_product_discovery.md) ➔ [01_glosario_y_reglas_negocio.md](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) ➔ [ 02_prd.md ]`


# 📝 Documento de Requisitos de Producto (PRD) - [NOMBRE_PRODUCTO]

## 📌 ÍNDICE DE CONTENIDOS
1. [Descripción General del Producto](#1-descripción-general-del-producto)
2. [Definición de Usuarios (User Personas)](#2-definición-de-usuarios-user-personas)
3. [Flujo End-to-End Prioritario](#3-flujo-end-to-end-prioritario)
4. [Límites del Sistema y Non-Goals](#4-límites-del-sistema-y-non-goals)
5. [Backlog de Historias de Usuario (INVEST)](#5-backlog-de-historias-de-usuario-invest)
6. [Estrategia de Calidad y Verificación (QA/Testing)](#6-estrategia-de-calidad-y-verificación-qatesting)

---

## 1. Descripción General del Producto

### 1.1. Problemática de Negocio
Describe el dolor real de negocio, las ineficiencias o las pérdidas financieras del usuario sin prescribir tecnologías, bases de datos o Inteligencia Artificial. Concéntrate en la ineficiencia operativa y el impacto directo en el negocio.

### 1.2. Propuesta de Solución (MVP / Slice Vertical)
Define el propósito central de la solución y explica cómo el software resolverá el problema planteado, delimitándolo estrictamente al flujo principal descrito en el insumo.

### 1.3. Objetivos de Negocio y KPIs (Métricas de Éxito)
Detalla de 2 a 3 indicadores clave de rendimiento (KPIs) cuantitativos que reflejen éxito operativo (ej. reducción de tiempos de proceso, incremento de conversión, tasa de retención de valor).

---

## 2. Definición de Usuarios (User Personas)
Identifica los perfiles o roles clave que interactuarán con el sistema:
- **Contexto operativo:** Dónde y cómo interactúa el usuario (ej. alta transaccionalidad, estrés físico, escritorio o dispositivo móvil).
- **Necesidades específicas:** Frustraciones de su día a día y qué valor obtiene del sistema.
- **Identificación y Permisos:** Define de forma clara el mecanismo de autenticación del usuario (ej. PIN rápido o login tradicional) y restringe rigurosamente los permisos por rol para proteger la integridad de los datos.

---

## 3. Flujo End-to-End Prioritario

### 3.1. Happy Path: Secuencia de Pasos
Describe detalladamente la secuencia lógica y numerada (Paso 1, Paso 2...) del flujo ideal de extremo a extremo que el usuario recorre para obtener valor, reflejando el Happy Path provisto en el insumo.

### 3.2. Diagrama Visual de Secuencia y Caso de Uso (Mermaid Flowchart / Sequence)
Incluye obligatoriamente un diagrama de secuencia en formato **Mermaid (`sequenceDiagram`)** que ilustre visualmente la interacción entre el Usuario, la Interfaz UI, la API y la Capa de Dominio/Persistencia para el Caso de Uso principal:

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario (Persona)
    participant UI as Interfaz (UI/Tablet)
    participant API as API Server (REST)
    participant DB as Dominio / DB

    U->>UI: Interacción (Trigger Caso de Uso)
    UI->>API: Solicitud HTTP (Payload validado)
    API->>DB: Validación Invariante y Persistencia
    DB-->>API: Confirmación de Estado
    API-->>UI: Respuesta HTTP (200 OK / 201 Created)
    UI-->>U: Feedback Visual en pantalla
```

### 3.3. Flujos Alternativos y Manejo de Errores (Edge Cases)
Debes prever y detallar el comportamiento del sistema ante fallos para evitar que la IA improvise la lógica. Incluye especificaciones para:
- **Validaciones de Entrada de Datos:** Cómo reacciona el sistema ante campos vacíos, inválidos o violación de invariantes de negocio.
- **Fallas de Conectividad o Red:** Especifica la resiliencia offline si el MVP lo requiere.
- **Precisión Numérica vs. Formateo de UI:** Especifica cómo se gestionan los cálculos internos de alta precisión en el backend versus la presentación limpia de datos en la interfaz de usuario.
- **Políticas de Expiración o Caducidad:** Cómo maneja el sistema la alteración o caducidad del estado de las entidades de negocio.

---

## 4. Límites del Sistema y Non-Goals (Fuera de Alcance)
Lista explícitamente de 3 a 5 características, módulos complejos, automatizaciones avanzadas o integraciones externas que NO se construirán en esta iteración. Esto actúa como salvaguarda innegociable contra el "scope creep" (deriva de alcance).

---

## 5. Backlog de Historias de Usuario (INVEST)
Traduce el flujo del MVP en historias de usuario independientes y estimables. Cada historia de usuario debe seguir estrictamente este formato:

### [ID-US-XX]: [Título de la Historia]
*   **Historia:** "Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]".
*   **Complejidad:** S / M / L (Estimación de esfuerzo relativo).
*   **Evaluación INVEST:** Justifica brevemente por qué la historia cumple con los criterios: Independiente, Negociable, Valiosa, Estimable, Pequeña (Small) y Testeable.
*   **Criterios de Aceptación (BDD - Sintaxis Gherkin):** Proporciona de 2 a 3 escenarios detallados empleando la estructura con respuestas de estado HTTP exactas y referencias a Invariantes:
    *   **Escenario:** [Descripción del caso de uso]
        *   **Given (Dado que)** [Contexto inicial del sistema o estado de datos]
        *   **When (Cuando)** [Acción exacta realizada por el usuario]
        *   **Then (Entonces)** [Resultado medible, código HTTP esperado (ej: 200 OK, 422 Unprocessable Entity) e Invariante de negocio aplicada]

---

## 6. Estrategia de Calidad y Verificación (QA/Testing)
- Especifica la política de desarrollo **Test-First (TDD con IA)**. 
- Prohíbe explícitamente que la IA genere de forma simultánea el código y los tests correspondientes para mitigar el riesgo de "Test Theater" (validación circular o autoconfirmación de alucinaciones).
- Establece la regla innegociable de que el humano o un oráculo determinista define o revisa el test (el "qué") y la IA implementa el código mínimo para hacerlo pasar a verde (el "cómo").
- Clasifica las pruebas mínimas requeridas:
  1. **Unitarias:** Pruebas de lógica inmutable de negocio y reglas de dominio puras sin I/O.
  2. **Integración:** Pruebas sobre llamadas HTTP y transacciones utilizando repositorios en memoria (`InMemory`) o DB de prueba para verificar estados y respuestas REST.
  3. **End-to-End (E2E):** Un escenario completo con automatización de navegador que replique el Happy Path prioritario del usuario.

---

Guarda por defecto el PRD generado en `docs/01_product_definition/02_prd.md` (o en la ruta especificada en `outputs`).
