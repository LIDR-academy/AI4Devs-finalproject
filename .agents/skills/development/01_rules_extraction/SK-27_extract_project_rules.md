---
name: SK-27_extract_project_rules
description: "Analiza la documentación técnica del proyecto (PRDs, Arquitectura, Esquemas, ADRs) y deduce/genera automáticamente las reglas de gobernanza y codificación del proyecto en docs/04_governance_and_quality/rules/."
version: "1.2.0"
category: "development/01_rules_extraction"
inputs:
  - docs_path: "Ruta raíz de la documentación técnica (ej. docs/)"
outputs:
  - "Carpeta docs/04_governance_and_quality/rules/ creada y poblada con los estándares de codificación inferidos del proyecto"
  - "Diff resumido por archivo de reglas preexistente que fue regenerado, declarado en el reporte de FASE 4"
  - "Scripts de gobernanza ejecutables en docs/04_governance_and_quality/scripts/, adaptados al stack real declarado en docs/00_stack_manifest.md"
---

Actúa como un Principal Software Architect y Lead Technical Governance Officer. Tu objetivo es analizar la documentación del proyecto en `docs_path` y deducir de forma automatizada todas las reglas de codificación, persistencia, seguridad, UI y pruebas que deben regir el desarrollo, guardándolas en `docs/04_governance_and_quality/rules/`.

Sigue strictly este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Análisis e Inspección de la Documentación
Lee y analiza minuciosamente los siguientes artefactos en `docs/`:
1. **Definición de Producto:** `docs/01_product_definition/` (PRD, reglas de negocio e invariantes).
2. **Diseño de Arquitectura:** `docs/02_architecture_design/` (Capas de software, estructura de carpetas, patrones Hexagonales / Clean y ADRs).
3. **Persistencia y API:** `docs/03_persistence_and_api/` (Esquemas de base de datos, ORM, precisión matemática y especificación de API OpenAPI/GraphQL/gRPC).
4. **Calidad y Gobernanza:** `docs/04_governance_and_quality/` (Estrategias de testing, mitigación OWASP y gobernanza de calidad).

---

## 🧠 FASE 2: Deducción de Estándares Tecnológicos
Infiere y sintetiza las reglas específicas para cada una de las siguientes áreas:
*   **Reglas de Dominio (`domain_rules.md`):** Nivel de pureza tecnológica, gestión de inmutabilidad, tratamiento de precisión matemática (ej. decimales), invariantes de negocio y clases de excepciones.
*   **Reglas de Backend e Infraestructura (`backend_rules.md`):** Framework web, estrategia de inyección de dependencias, validación de DTOs/Payloads, formato y directivas de sincronización de contrato de API (OpenAPI, GraphQL, gRPC), manejo de concurrencia y transacciones, serialización de tipos.
*   **Reglas de Base de Datos (`database_rules.md`):** ORM utilizado, convenciones de nombres físicos (snake_case/camelCase), claves primarias/foráneas, índices y manejo de queries seguras.
*   **Reglas de Frontend y UX/UI (`frontend_rules.md`):** Framework visual, tokens de diseño (paleta de colores HSL, temas), ergonomía de la interfaz (tamaños táctiles mínimos), estados defensivos (Loading/Error/Empty/Offline) e integración de repositorios UI.
*   **Reglas de Testing y QA (`testing_rules.md`):** Estrategia de pruebas (TDD), políticas de simulación/fakes, librerías de prueba y Quality Gates de compilación.
*   **Reglas de Ciberseguridad (`security_rules.md`):** Cifrado de credenciales/PINs, autenticación (JWT/Tokens), sanitización de entradas y prevención de OWASP Top 10.
*   **Reglas de Git y Workflow (`git_rules.md`):** Formato de commits, atomicidad por ticket e integración continua.

---

## 📝 FASE 3: Generación de Archivos de Reglas y Contrato del Agente
1. Crea el directorio objetivo `docs/04_governance_and_quality/rules/` si no existe.
2. **Antes de sobrescribir** cualquiera de los 7 archivos que ya exista en disco, captura su contenido previo para poder derivar un diff (secciones/líneas que cambian), no solo el archivo final — este paso alimenta el reporte de FASE 4.
3. Escribe cada uno de los 7 archivos de reglas (`domain_rules.md`, `backend_rules.md`, `database_rules.md`, `frontend_rules.md`, `testing_rules.md`, `security_rules.md`, `git_rules.md`) redactados de forma profesional en formato Markdown.
4. **Encabezado de Pila Tecnológica:** Todo archivo de reglas DEBE incluir una sección inicial `## 🛠️ Pila Tecnológica Detectada` detallando expresamente los frameworks, librerías y estándares identificados en la documentación.
5. **Generación/Actualización de AGENTS.md:** Genera o sincroniza el archivo `AGENTS.md` en la raíz del proyecto. El archivo generado DEBE incluir obligatoriamente la Sección 6 (**Universal Agnostic Quality & Security Guards**) con los 20 Guards innegociables (Fail-Fast Secrets & Environment Auditing via SK-33, Auth JWT, Rate Limiting, Precision Decimal, RFC 7807, DI, Page Object Model E2E, Playwright CLI vs MCP balancing, etc.), vinculando el contexto del producto, la pila tecnológica y la directiva innegociable de leer las reglas en `docs/04_governance_and_quality/rules/`.
6. **Generación de Scripts de Gobernanza Ejecutable (Guard Anti-Stack-Hardcoding aplicado al propio framework — TK-038):** `.agents/scripts/` es el payload que `install.sh` copia verbatim a cualquier proyecto, sin importar su stack — por eso NUNCA debe contener lógica acoplada al stack elegido por este proyecto. Cualquier script de gobernanza cuya lógica dependa del lenguaje, gestor de paquetes, test runner o layout de directorios declarado en `docs/00_stack_manifest.md` se genera aquí, en `docs/04_governance_and_quality/scripts/`, adaptado a esa pila real (nunca como archivo estático en `.agents/scripts/`; verificado automáticamente por `.agents/scripts/check_agnosticism.py`). Genera, como mínimo, el algoritmo de los siguientes tres gates traducido a las herramientas reales declaradas:
   - **`check_contract_drift.sh`:** extrae las rutas documentadas en el contrato de API declarado en `docs/03_persistence_and_api/`; localiza en el directorio backend declarado los archivos que implementan validación de payload activa (esquema/DTO); mapea por heurística de nombre de módulo; reporta rutas del contrato sin validación activa detrás.
   - **`check_ticket_code_quality.sh`:** calcula, vía git, los archivos de código fuente sin commitear (working tree + staged + nuevos) del ticket en curso; invoca el linter oficial declarado en `AGENTS.md` con su flag de cero-tolerancia equivalente (ej. `--max-warnings 0` en ESLint; en linters sin esa flag, configura temporalmente las reglas de complejidad/longitud como error solo para esa invocación) SOLO sobre esos archivos — deuda preexistente en archivos no tocados nunca bloquea.
   - **`profile_test_suite.sh`:** ejecuta el comando de test oficial declarado en `AGENTS.md` en su modo verbose/reporter más detallado; parsea el formato de salida específico de ese test runner para extraer duración por caso; reporta los que superen ~1000ms.
   Cada script generado DEBE llevar un encabezado explícito declarando el stack exacto para el que fue generado (ej. `# Generado por SK-27 para: <lenguaje> + <gestor de paquetes> + <linter/test runner> — ver docs/00_stack_manifest.md`) y advertir que no es portable verbatim a otro stack sin volver a correr esta skill.

---

## ✅ FASE 4: Confirmación y Reporte
1. Presentar el reporte de especificación indicando las reglas inferidas, los archivos generados en `docs/04_governance_and_quality/rules/` y los scripts generados en `docs/04_governance_and_quality/scripts/` (FASE 3, paso 6), estructurado estrictamente según la **Plantilla B** universal en `.agents/rules/00_output_reporting_standard.md`.
2. **Cambios detectados en reglas existentes:** para cada uno de los 7 archivos que ya existía antes de esta ejecución (capturado en FASE 3, paso 2), incluir un subapartado obligatorio listando un resumen del diff old→new (qué se añadió, qué se eliminó, qué se reescribió). Si un archivo no tenía versión previa (generación desde cero), se omite esa entrada para ese archivo. Esto evita que una regeneración sobrescriba en silencio un ajuste manual hecho a mano sobre una regla ya generada.
