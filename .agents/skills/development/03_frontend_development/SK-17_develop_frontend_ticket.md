---
name: SK-17_develop_frontend_ticket
description: "Guía el desarrollo atómico de tickets de Frontend aplicando Clean Architecture en cliente, SOLID (<150 líneas por componente), WCAG 2.2, Core Web Vitals (INP/LCP/CLS) y seguridad defensiva."
version: "4.6.0"
category: "development/03_frontend_development"
inputs:
  - ticket_id: "ID o ruta del ticket técnico de frontend (ej. TK-007 o docs/05_agile_planning/12_tickets/...)"
required_rules:
  - "docs/04_governance_and_quality/rules/frontend_rules.md"
  - "docs/04_governance_and_quality/rules/domain_rules.md"
  - "docs/04_governance_and_quality/rules/security_rules.md"
  - "docs/04_governance_and_quality/rules/testing_rules.md"
outputs:
  - "Componentes UI modulares (<150 líneas) e integrados"
  - "Módulos de estado y adaptadores de repositorio UI desacoplados"
  - "Verificación de compilación, CWV preventivos y seguridad aprobada"
  - "Gate ticket-scoped de complejidad/longitud/profundidad y gate de duplicación (jscpd) en verde"
---

# 🎨 SK-17: Desarrollador de Tickets Frontend (v4.6.0 SOTA 2026)

Actúa como un **Senior Frontend Engineer** y **UI/UX Clean Architecture Advocate**. Tu objetivo es implementar de forma atómica el ticket técnico especificado en `ticket_id`, respetando la arquitectura de cliente desacoplada, los principios SOLID y la excelencia de ingeniería frontend 2026.

Sigue estrictamente este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Pila Tecnológica, UI & Core Web Vitals
1. **Analizar Especificación del Ticket:** Lee el ticket técnico en `docs/05_agile_planning/12_tickets/{ticket_id}` y comprende los criterios de aceptación (BDD/Gherkin).
   - **Fail-Fast Obligatorio (Guard 26, `AGENTS.md`):** si `{ticket_id}` no existe como archivo — porque te pidieron implementar una funcionalidad nueva sin ticket previo — DETENTE. No implementes primero y documentes después: informa al humano que falta la Etapa 1 (`01_cascading_spec_workflow.md`: `SK-02`/`SK-11`/`SK-12`/`SK-13`/`SK-14`) y espera a que exista el `TK-XXX.md` antes de continuar con este skill.
2. **Consultar Comandos Oficiales:** Consulta `AGENTS.md` para extraer los comandos declarados del proyecto para compilación (`build`), linter (`lint`) y runner de pruebas UI.
3. **Descubrir Reglas de UX/UI, CWV y Pila Cliente (Guard 29, `AGENTS.md`):** Consulta obligatoriamente `DESIGN.md` en la raíz del espacio de trabajo y las directivas declaradas en `required_rules` (especialmente `docs/04_governance_and_quality/rules/frontend_rules.md` y `docs/02_architecture_design/05_ui_ux_design_system.md`) para identificar:
   - Framework cliente y motor de formateo/linter oficial.
   - Sistema de diseño, tokens de color (variables HSL/CSS) y diseño responsive basado en componentes. Prohibido hardcodear literales hexadecimales/RGB en inline `style={...}`.
   - **Ubicación real de cada token/componente antes de tocar código:** si `05_ui_ux_design_system.md` ya incluye su sección "🗂️ Mapa de Ubicación en Código" (SK-05 ≥ 3.9.0), consúltala primero para saber en qué archivo/mecanismo real (partial de `index.css`, módulo de tema, etc.) vive cada categoría — evita añadir un token nuevo en el lugar equivocado o duplicar uno ya existente en otro partial.
   - Especificaciones de ergonomía táctil y objetivos **WCAG 2.2 AA/AAA** (contraste, foco visible y navegación por teclado).
   - Metas preventivas de Core Web Vitals: LCP < 2.5s, INP < 200ms (responsividad táctil/teclado) y CLS < 0.1 (cero saltos de layout).
   - Los 4 estados defensivos obligatorios de UI: Carga/Loading, Estado Vacío/Empty, Errores con reintento y Banner Offline.

---

## 📱 FASE 2: Plan Estructurado & Desacoplamiento (SOLID & Granularidad)
1. **Plan Previo de Componentes:** Definir y discutir la estructura de componentes antes de escribir código para evitar refactorizaciones ciegas.
2. **Regla de Granularidad (~150 líneas):** Si un componente supera ~150 líneas de código o asume más de un concepto visual/lógico, descomponerlo en subcomponentes componibles (*Compound Components* / *Atomic Design*).
3. **Inversión de Dependencias (DIP) & SRP:** Abstraer el consumo de API mediante interfaces de repositorio y separar los módulos de estado/persistencia local de la presentación pura.
4. **Auditoría de Reuso Previa (obligatoria antes de escribir código nuevo):** Antes de crear un cliente HTTP, un Value Object de dominio, un custom hook o un primitivo de UI (ej. shell de modal), revisa el directorio de capa compartida declarado en `docs/04_governance_and_quality/rules/frontend_rules.md` (típicamente `shared/` o equivalente). Si ya existe una implementación equivalente, reutilízala en vez de reimplementarla. Si el mismo concepto ya se repite en 2+ features sin haber sido extraído, extráelo a la capa compartida como parte de este ticket en vez de añadir una tercera copia.

---

## 💻 FASE 3: Implementación Defensiva del Código
1. **Modelos & DTOs:** Crear o extender DTOs e interfaces del cliente con tipado estricto (evitando casting inseguro o `any`), respetando la sintaxis del lenguaje cliente.
2. **Desarrollo de Interfaz & Container Queries:** Aplicar estilos responsivos basados en el contenedor padre (`@container`) y optimización LCP/CLS (dimensiones explícitas y lazy loading inteligente).
3. **Navegación & Manejo de Estado:** Conectar vistas en el enrutador y servicios del cliente.

---

## 🔄 FASE 4: Bucle de Auto-Reflexión & Seguridad Defensiva Anti-IA
Antes de entregar el ticket, ejecuta esta lista de cotejo interna:
- [ ] **Cumplimiento Design System (Guard 29):** ¿Leí `DESIGN.md` antes de maquetar? ¿Cero colores hexadecimales hardcodeados en inline `style={...}`?
- [ ] **Granularidad:** ¿Todos los componentes miden < ~150 líneas de código y cumplen SRP?
- [ ] **Ergonomía & A11y:** ¿Se cumplen las dimensiones táctiles y el contraste de texto WCAG 2.2?
- [ ] **Core Web Vitals:** ¿Se garantiza estabilidad de layout (CLS < 0.1) y responsividad (INP < 200ms)?
- [ ] **Estados Defensivos:** ¿Están presentes los 4 estados (Loading, Empty, Error, Offline)?
- [ ] **Seguridad Cliente:** ¿Se audita que NINGÚN secreto o API Key privada esté expuesta en el código cliente y que las entradas HTML tengan sanitización anti-XSS?
- [ ] **Reuso:** ¿Confirmé que ningún servicio HTTP, VO de dominio, hook o primitivo de UI de este ticket duplica algo que ya existe en la capa compartida? ¿Extraje a la capa compartida cualquier patrón que ya se repetía en 2+ features?

---

## 🚨 FASE 5: Verificación, Auditoría Visual y Quality Gate
1. **Compilación del Proyecto:** Corre el comando de build oficial declarado en `AGENTS.md` para asegurar 0 errores de compilación.
2. **Análisis Estático (Ticket-Scoped, obligatorio):** Ejecuta `bash docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh` — verifica, con `--max-warnings 0`, que los archivos sin commitear de este ticket no violen la regla de granularidad (`complexity`/`max-lines-per-function`/`max-depth`, alineada con la regla de ~150 líneas por componente de FASE 2). Deuda preexistente en archivos que este ticket no tocó no bloquea el cierre (ver `docs/00_stack_manifest.md`). Además, ejecuta el linter oficial de `AGENTS.md` sobre todo el proyecto para confirmar **0 errores**.
3. **Auditoría de Accesibilidad Opcional:** Ejecutar la verificación a11y mediante `.agents/skills/development/06_visual_qa/SK-21_audit_ui_accessibility.md`.
4. **Duplicación:** Ejecuta primero `pnpm run duplication` (jscpd) — gate bloqueante real, umbral declarado en `docs/00_stack_manifest.md`. Complementa con un chequeo ligero manual: compara estructuralmente los archivos nuevos/modificados contra sus pares en features hermanas (mismos imports, mismos bloques de estilo/lógica repetidos con nombres distintos) — jscpd detecta copy-paste literal pero no el mismo patrón reescrito. Si detectas 2+ instancias del mismo patrón sin extraer, decide entre extraerlo ahora a la capa compartida o documentar la deuda explícitamente en el reporte del ticket. Para una auditoría exhaustiva multi-ángulo de reuso a nivel de todo el repositorio, el humano puede solicitar adicionalmente una revisión de código dedicada fuera del alcance atómico de este ticket.
5. **Presupuesto de Bundle (TK-055):** si el ticket agrega una dependencia nueva o un chunk nuevo, confirma que el build no exceda el presupuesto de tamaño declarado en `docs/00_stack_manifest.md` (ej. `build.chunkSizeWarningLimit` en `vite.config.ts` del proyecto, o el mecanismo equivalente del bundler real). El valor exacto del presupuesto es una decisión de stack tomada por el humano, nunca un número fijo asumido por esta skill — si el manifest no declara uno todavía, repórtalo como gap en vez de inventar un umbral.
6. **Implementación Verificada, no solo leída (obligatorio):** antes de reportar el ticket como terminado, autoaplica los 3 checks de [`.agents/rules/04_verified_implementation_standard.md`](../../../rules/04_verified_implementation_standard.md) — en frontend aplica sobre todo el (a): toda variable `VITE_*`/config que valides o leas debe tener un call-site real que la consuma, no solo un `.env.example` documentándola.
7. **Reporte al Humano:** Presentar los componentes creados/modificados y los resultados del pase de calidad estructurados estrictamente según la **Plantilla A** universal en `.agents/rules/00_output_reporting_standard.md`.
