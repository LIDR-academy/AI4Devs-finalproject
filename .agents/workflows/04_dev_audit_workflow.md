# 🛡️ Meta-Prompt de Auditoría de Código y Calidad (VSDD Dev Quality Audit)

> **DIRECTIVA PARA EL AGENTE REVIEWER DE IA:**  
> Este documento contiene el meta-prompt oficial de auditoría de código y calidad. Cuando actúes en el rol de **Reviewer Independiente (Validación Cruzada)** para evaluar la implementación de un ticket técnico (`TK-XXX`), debes ejecutar estrictamente esta auditoría en 7 fases y emitir un veredicto formal (**APROBADO PARA COMMIT** / **RECHAZADO CON DEFECTOS**).
> 
> **PRINCIPIO AGNÓSTICO:** Este prompt deduce dinámicamente las herramientas de compilación, linters, runners de pruebas y esquemas de persitencia a partir de los archivos de gobernanza ubicados en `docs/04_governance_and_quality/rules/`.

---

## 📋 Prompt de Auditoría para el Reviewer Independiente

Copia y ejecuta la siguiente instrucción cuando vayas a evaluar una tarea de desarrollo:

```text
Actúa como un Principal Software Engineer, Lead Security Auditor y QA Architect en rol de Reviewer Independiente Adversarial. Tu objetivo es realizar una auditoría estricta e imparcial sobre el código implementado para el ticket [TK-XXX].

Sigue estrictamente la siguiente metodología de auditoría en 7 Fases:

---

### FASE 0: Descubrimiento Dinámico de Reglas del Proyecto
1. Inspecciona la carpeta `docs/04_governance_and_quality/rules/`.
2. Lee las directivas activas (`domain_rules.md`, `backend_rules.md`, `frontend_rules.md`, `database_rules.md`, `testing_rules.md`, `security_rules.md`, `git_rules.md`).
3. Identifica el runner de pruebas del proyecto, el motor de linters/compiladores y los estándares de sanitización.
4. **Cascada Spec-Antes-que-Código (Guard 26, TK-054):** confirma que existe un `TK-XXX.md` en `docs/05_agile_planning/12_tickets/` para el ticket auditado, con al menos 1 User Story (`US-XXX.md`) enlazada (o `N/A (Técnico)` justificado) y una fila correspondiente en `13_matriz_trazabilidad.md`. El `N/A (Técnico)` es legítimo para: (a) un habilitador de infraestructura base, o (b) un **ticket de remediación técnica** — corrección de un defecto en código entregado por un ticket ya `done` (bug, refactor, deuda de infra, o endurecer un comportamiento ya especificado pero mal implementado) que **no** introduce regla de negocio nueva ni comportamiento de cara al usuario no especificado (Guard 26, carve-out C-DEV-006-4). En el caso (b) el ticket DEBE citar en su frontmatter el informe de auditoría que lo motiva (`related_story: … · AUDIT-XXX`) y no reabrir el ticket original. Si el código ya existe pero estos artefactos de la Etapa 1 no — o se crearon después, como reconstrucción retroactiva en vez de spec previa — marca la fase como DEFECTUOSA: es la misma clase de gap que dejó sin Frontend a `TK-049`/`TK-050` hasta que una auditoría manual lo detectó.
5. **Reconciliación de Cambios de Origen Humano Sin Ticket Previo (si el punto 4 detectó el gap):** cuando el código auditado no viene de un ticket agotado por un skill de desarrollo, sino de un cambio que el humano hizo directamente (ej. un commit `[skip-tk]`, o cualquier diff sin `TK-XXX` previo), **no te detengas en marcar la fase como DEFECTUOSA y esperar** — ejecuta esta reconciliación antes de continuar a las Fases 1-6:
   - **a. Clasifica con el test decisivo de Guard 26:** ¿el dueño de producto o un usuario notaría una diferencia en las reglas de negocio o en el comportamiento de cara al usuario? **Sí** → detente aquí y exige la cascada completa (`01_cascading_spec_workflow.md`: PRD/US/TK) antes de seguir auditando. **No** (mismo comportamiento, corrección técnica/estructural) → continúa a (b).
   - **b. Crea el ticket de remediación técnica retroactivo** vía `SK-12`, citando esta auditoría en su frontmatter (`related_story: … · AUDIT-XXX`, carve-out C-DEV-006-4) — nunca reabras un ticket ya `done` para esto.
   - **c. Mapea qué documentación viva quedó potencialmente desactualizada**, según el área real que tocó el diff (reutiliza la taxonomía fija de `docs/`, no inventes una nueva):

     | Área del diff | Documento a verificar | Script de drift (Guard 27) |
     | :--- | :--- | :--- |
     | `prisma/schema.prisma` / migraciones (o ORM equivalente) | `docs/03_persistence_and_api/06_database_schema.md` | `check_schema_drift.sh` |
     | Rutas/contratos HTTP | `docs/03_persistence_and_api/openapi.yaml` (o equivalente) | `check_contract_drift.sh` |
     | Estilos/tokens de diseño, `DESIGN.md` | `docs/02_architecture_design/05_ui_ux_design_system.md` + `docs/04_governance_and_quality/rules/frontend_rules.md` | `npx -y @google/design.md lint DESIGN.md` |
     | `docs/00_stack_manifest.md` §6 (herramientas DevSecOps) | — | `check_devsecops_manifest_coverage.sh` |

   - **d. Ejecuta el/los script(s) de drift correspondientes** de la tabla — no asumas que "compila y pasan los tests" implica que la documentación sigue vigente; ese es exactamente el tipo de discrepancia que estos scripts existen para atrapar.
   - **e. Presenta el hallazgo al humano como una propuesta de diff a los documentos afectados, nunca los reescribas en silencio** — mismo gate de Human-in-the-Loop (PAUSA OBLIGATORIA) que el resto del framework.
   - **f. Solo tras la aprobación humana del punto (e)**, continúa normalmente a las Fases 1-6 sobre el ticket ya creado en (b).

---

### FASE 1: Auditoría Anti-Tautología de Pruebas (Mutation Testing)
1. Verifica que la suite de pruebas no contenga tests vacíos o aserciones triviales.
2. Ejecuta la herramienta de Pruebas de Mutación del proyecto (ej. Stryker, Mutmut, PITest).
3. Exige un Mutation Score mínimo del 70% en capas de dominio y casos de uso. Si sobreviven mutantes en lógica crítica, marca la fase como DEFECTUOSA.

---

### FASE 2: Auditoría de Arquitectura Hexagonal y Principios SOLID
1. Aislamiento del Dominio: Verifica que la capa de Dominio no importe frameworks HTTP, ORMs o librerías de infraestructura externa.
2. Mappers de Persistencia: Comprueba que los objetos ORM/BD no se expongan directamente en la API o en los casos de uso (uso obligatorio de Mappers).
3. Inversión de Dependencias (DIP): Verifica que los casos de uso dependan exclusivamente de interfaces o puertos abstractos.
4. Duplicación y Complejidad (Guard de Métricas, TK-036/TK-037/C-1): Ejecuta `bash docs/04_governance_and_quality/scripts/check_ticket_duplication.sh` — gate determinista **acotado al diff del ticket** (compara el set de clones del working tree contra el de HEAD y solo bloquea si el ticket introduce duplicación entre dos archivos que no la tenían antes). Marca la fase como DEFECTUOSA si falla. El comando repo-wide `pnpm run duplication` de `docs/00_stack_manifest.md` es el **backstop de CI**, pero a nivel repositorio es informativo para esta auditoría — un rojo por deuda de duplicación preexistente ajena al ticket NO marca la fase como DEFECTUOSA (mismo criterio que TK-037 para complexity/max-lines: gates nuevos acotados al diff, informativos a nivel repo). Ejecuta también `bash docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh` — gate determinista (no juicio subjetivo del reviewer) sobre `complexity`/`max-lines-per-function`/`max-depth` acotado a los archivos sin commitear del ticket auditado; marca la fase como DEFECTUOSA si falla. Deuda preexistente en archivos que el ticket no tocó no cuenta contra esta fase.
5. Código Muerto (Guard 5, TK-055): Ejecuta `bash docs/04_governance_and_quality/scripts/check_dead_code.sh` — gate determinista acotado a los archivos sin commitear del ticket, sobre exports/archivos/dependencias sin uso. Marca la fase como DEFECTUOSA si falla. Deuda preexistente fuera del diff del ticket es solo informativa.

---

### FASE 3: Auditoría Anti-Drift Arquitectónico y Estructura de Artefactos (Build)
1. Verifica que los esquemas físicos de persistencia/base de datos y los contratos de API expuestos coincidan de manera exacta con la especificación en `docs/`. Si el ticket toca el esquema físico o su spec DDL, ejecuta `bash docs/04_governance_and_quality/scripts/check_schema_drift.sh` (TK-055) — gate determinista acotado al diff. Si el módulo tocado tiene un documento de diseño con `status: approved` asociado y el código diverge sin que el script lo tenga documentado como riesgo residual, NO lo resuelvas en ninguna dirección por tu cuenta — repórtalo al humano como decisión explícita de alcance ([Antipatrón C, `.agents/rules/04_verified_implementation_standard.md`](../rules/04_verified_implementation_standard.md)).
2. Integridad del Artefacto de Build: Ejecuta `pnpm build` y confirma que la estructura generada en `dist/` coincida exactamente con el punto de entrada `package.json#main` (sin subdirectorios anidados causados por alterar `"rootDir"` en `tsconfig.json`).
3. Coincidencia de Persistencia CLI: Confirma que scripts CLI de ORM (ej. `prisma/seed.ts`) usen clientes de persistencia relacional física (`PrismaClient` con `upsert`) y no mocks in-memory efímeros — Y que estén realmente invocados en el flujo real de despliegue (Dockerfile/entrypoint/CI), no solo presentes en el repositorio sin llamarse desde ningún sitio.
4. Verificación de Ejecución Real: si el ticket toca un script de seed/bootstrap, el esquema físico o migraciones, ejecuta `bash docs/04_governance_and_quality/scripts/check_seed_idempotency.sh` (TK-055) — levanta un contenedor real, corre migrate+seed dos veces y confirma idempotencia real, no solo lectura de código. Si el ticket toca un Dockerfile o step de CI fuera del alcance de ese script, EJECÚTALO de verdad contra un entorno representativo antes de aprobar — una lectura de código que "se ve bien" no sustituye una ejecución real ([Antipatrón B, `.agents/rules/04_verified_implementation_standard.md`](../rules/04_verified_implementation_standard.md)). Si el entorno del reviewer no permite ejecutarlo (ej. sin Docker disponible), marca ese punto como NO VERIFICADO explícitamente en el informe, nunca como aprobado por omisión.
5. Si se detectan cambios "en caliente" en el código que no estén reflejados en la documentación viva de `docs/`, marca la fase como DEFECTUOSA.

---

### FASE 4: Auditoría de Seguridad, Sanitización, Entornos y Resiliencia HTTP (Guards 14-19)
1. Sanitización y Control de Acceso: Valida que todo payload externo sea filtrado con esquemas de validación estrictos (ej. Zod) y que todas las rutas de mutación/reportes contengan middleware de autenticación (JWT/Bearer) y rate limiting en autenticación.
2. Gestión de Entornos & Secretos (Fail-Fast): Confirma que no existan credenciales o llaves secretas incrustadas en duro en el código ni fallbacks por defecto (`env.SECRET || 'default'`). Exige validación Fail-Fast.
2.1. Hardening de Contenedores/IaC (Guard 25, TK-042): Si el ticket toca `Dockerfile`/`docker-compose.yml`/módulos IaC, ejecuta `bash docs/04_governance_and_quality/scripts/check_container_security.sh` — gate determinista acotado a esos archivos sin commitear: runtime pineado según `docs/00_stack_manifest.md` §1, usuario no-root, y cero secretos hardcodeados. Ejecuta también `bash docs/04_governance_and_quality/scripts/check_iac_syntax.sh` (TK-055) si el proyecto declaró un motor de IaC — valida sintaxis HCL real con el binario del motor, no solo lectura visual. Marca la fase como DEFECTUOSA si falla. Deuda preexistente en Dockerfile/IaC que el ticket no tocó no cuenta contra esta fase.
2.2. Auditoría de Dependencias con Riesgo Residual Documentado (Guard 25, TK-043/C-1): Ejecuta `bash docs/04_governance_and_quality/scripts/check_dependency_audit.sh`. Si **el ticket añadió o subió una dependencia**, es bloqueante ante cualquier vulnerabilidad `High`/`Critical` NO documentada en su lista de riesgo residual aceptado (ver `SK-23` fase 3), y verifica además que `SK-23` fue invocado antes de instalarla → marca la fase como DEFECTUOSA. Si **el ticket no tocó dependencias** (o solo añadió paquetes sin advisories), un rojo de este script por vulnerabilidades preexistentes en dependencias ajenas al diff (típicamente transitivas de otro workspace) es informativo, NO marca la fase como DEFECTUOSA — pero debe quedar registrado como deuda de repo con su propio ticket de saneamiento.
2.3. Configuración Validada pero No Consumida (TK-055): Ejecuta `bash docs/04_governance_and_quality/scripts/check_env_usage.sh` — gate determinista (no juicio subjetivo) que localiza, para toda variable de entorno declarada en el validador oficial, al menos un call-site real que la LEA y la use para alterar comportamiento, no solo el punto donde se valida su formato. Una variable validada estrictamente pero nunca consumida por ningún middleware/lógica de negocio es teatro de seguridad; marca la fase como DEFECTUOSA si el script falla ([Antipatrón A, `.agents/rules/04_verified_implementation_standard.md`](../rules/04_verified_implementation_standard.md)).
3. Precisión Aritmética Arbitraria: Confirma la ausencia de `parseFloat` o aritmética flotante primitiva en cálculos de inventarios/costos (uso obligatorio de `DecimalQuantity` / `decimal.js`).
4. Inyección de Dependencias y RFC 7807: Valida que las rutas no instancien repositorios directamente (uso de DIP) y que las respuestas de error cumplan estrictamente con la norma RFC 7807 Problem Details.
5. Sandboxed Execution & Error Swallowing: Confirma que no existan bloques `catch {}` vacíos y que la ejecución de comandos se mantenga dentro del workspace aislado.

---

### FASE 5: Auditoría Frontend, Accesibilidad y Ergonomía Táctil (Si Afecta UI)
1. Ergonomía Táctil: Verifica que todos los elementos interactivos cumplan con el tamaño mínimo accesible (≥48px × 48px).
2. Cumplimiento WCAG 2.1: Comprueba contraste de colores HSL, atributos ARIA y manejo de estados defensivos (carga, error, vacíos).

---

### FASE 6: Emisión y Persistencia del Veredicto Formal de Código

1. **Filtro de sistemicidad (antes de redactar el informe):** para cada defecto detectado en las Fases 0-5, pregúntate explícitamente *"¿este defecto podría repetirse en un archivo o ticket distinto si no queda codificado en algún lado?"* Si la respuesta es sí, no lo dejes solo como línea del informe de este ticket — proponlo como candidato a Guard nueva/actualizada en `AGENTS.md` (o regla en `docs/04_governance_and_quality/rules/`, o paso de workflow, según corresponda) siguiendo el mismo procedimiento de clasificación + aprobación humana explícita de la FASE 5.C de [02_cascading_dev_workflow.md](02_cascading_dev_workflow.md) — nunca lo escribas sin esa confirmación. La mayoría de los defectos NO deben pasar este filtro; es para el patrón sistémico, no para el error puntual.
2. Genera el informe final en pantalla, incluyendo la sección `## 🔁 Candidatos a Regla Permanente` (ver plantilla abajo) aunque esté vacía.
3. **MANDATORIO:** Guarda obligatoriamente el informe completo como un archivo Markdown en `docs/audits/AUDIT-XXX-[ticket-id]-quality-report.md`.

# 📊 Informe de Auditoría de Código VSDD - Ticket [TK-XXX]

* **ID Auditoría:** AUDIT-XXX
* **Fecha de Auditoría:** [YYYY-MM-DD]
* **Reviewer:** Subagente Independiente
* **Ticket Evaluado:** [TK-XXX]

## 📋 Resumen por Fases:
- Fase 0 (Descubrimiento de Reglas): [PASÓ / FALLÓ]
- Fase 1 (Mutation Testing >= 70%): [PASÓ / FALLÓ]
- Fase 2 (Arquitectura Hexagonal / SOLID): [PASÓ / FALLÓ]
- Fase 3 (Anti-Drift Arquitectónico): [PASÓ / FALLÓ]
- Fase 4 (Seguridad, Entornos y Sanitización): [PASÓ / FALLÓ]
- Fase 5 (UI / WCAG 2.1 Ergonomía Táctil): [N/A / PASÓ / FALLÓ]

## 🚨 Defectos Detectados (Si los hay):
- [Lista detallada de hallazgos indicando archivo y línea]

## 🔁 Candidatos a Regla Permanente (Filtro de Sistemicidad, FASE 6.1):
- [Para cada defecto que pasó el filtro: descripción, destino propuesto (Guard en AGENTS.md / regla en docs/04_governance_and_quality/rules/ / paso de workflow), y si requiere script de verificación. "Ninguno" si nada pasó el filtro — no omitir esta sección.]

## ⚖️ VEREDICTO FINAL:
[ APROBADO PARA COMMIT | RECHAZADO CON DEFECTOS ]
```
