# 📊 Informe de Auditoría de Código VSDD - Ticket TK-077 / TK-077-FE

* **ID Auditoría:** AUDIT-DEV-002
* **Fecha de Auditoría:** 2026-08-31
* **Reviewer:** Reviewer Independiente Adversarial (sesión de prueba de `.agents/` + `docs/`)
* **Ticket Evaluado:** TK-077 (backend) / TK-077-FE (frontend) — US-018, Recuperación de PIN de Administrador por Email

---

## 📋 Resumen por Fases:
- Fase 0 (Descubrimiento de Reglas): PASÓ (con nota menor)
- Fase 1 (Mutation Testing >= 70%): **FALLÓ** — agregado 78.81% (pasa), pero `RequestAdminPinResetUseCase.ts` aislado da 65.52%
- Fase 2 (Arquitectura Hexagonal / SOLID): PASÓ
- Fase 3 (Anti-Drift Arquitectónico): PASÓ (con nota menor)
- Fase 4 (Seguridad, Entornos y Sanitización): PASÓ
- Fase 5 (UI / WCAG 2.1 Ergonomía Táctil): PASÓ

## 🚨 Defectos Detectados:

### FASE 1 — Mutation Score real de `RequestAdminPinResetUseCase.ts`: 65.52% (< 70%)
Verificado en vivo con `stryker run --mutate` acotado a los 3 archivos domain/application que TK-077 introdujo. El score **agregado** (78.81%) pasa el umbral y esconde que uno de los 3 archivos, aislado, no lo alcanza:

| Archivo | Score aislado |
|---|---|
| `User.ts` | 86.89% |
| `ResetAdminPinUseCase.ts` | 75.00% |
| **`RequestAdminPinResetUseCase.ts`** | **65.52%** ❌ |

10 mutantes sobrevivieron, todos concentrados en 4 líneas cuya lógica nunca se ejercita con un valor que distinga el comportamiento correcto del mutado:
- `RequestAdminPinResetUseCase.ts:21` — `dto.email.trim().toLowerCase()`: ningún fixture de test usa un email con mayúsculas o espacios; `.trim()`/`.toLowerCase()` pueden borrarse o mutarse a `.toUpperCase()` sin que ningún test falle.
- `RequestAdminPinResetUseCase.ts:28` — `Date.now() + 15 * 60 * 1000`: el test solo verifica `resetTokenExpires.getTime() > Date.now()`, una aserción tan débil que sigue siendo cierta aunque el mutante reduzca la expiración a 15/60 segundos.
- `RequestAdminPinResetUseCase.ts:33` — `dto.clientOrigin || process.env.CLIENT_ORIGIN || 'http://localhost:8085'`: ningún test fija `clientOrigin` explícitamente ni valida `CLIENT_ORIGIN`; el test solo comprueba que `resetUrl` *contiene* el token, nunca el origin/host real, así que toda la cadena de fallback puede mutarse a `true`/`false`/string vacío sin fallar.
- `RequestAdminPinResetUseCase.ts:37` — `user.email || normalizedEmail`: el fixture siempre define `user.email`, así que `||` puede mutarse a `&&` sin diferencia observable.

**No es teatro de tests** (Guard 11) — las 4 escenas Gherkin de US-018 están genuinamente cubiertas — pero sí son *aserciones débiles*: verifican que "algo pasó" sin verificar el valor exacto de lo que pasó.

### FASE 0 / FASE 3 — Estado desactualizado en la matriz de trazabilidad
`docs/05_agile_planning/13_matriz_trazabilidad.md` línea 42 marca TK-077/TK-077-FE como `📋 Approved Spec`, pero el ticket ya está implementado, testeado y commiteado (`2b44bb5`..`57acd5a`). No bloqueante, pero es exactamente el tipo de drift silencioso entre `docs/` y la realidad que Guard 27 busca prevenir.

## 🔁 Candidatos a Regla Permanente (Filtro de Sistemicidad, FASE 6.1):

1. **`check_mutation_score.sh` (el script generado hoy mismo) tiene un defecto de diseño**: Stryker aplica `thresholds.break` solo sobre el score **agregado** de todos los archivos mutados en la corrida, nunca por archivo individual. Cuando un ticket toca 2+ archivos y uno compensa las debilidades del otro (como pasó recién: 86.89% + 75.00% + 65.52% = 78.81% agregado), el script actual reporta éxito aunque un archivo esté genuinamente por debajo del umbral. **Pasa el filtro de sistemicidad**: se repetiría en cualquier ticket futuro con más de un archivo de dominio/aplicación tocado. Destino propuesto: no es una Guard nueva (la Guard 11 ya existe y es correcta) — es un fix de implementación en `check_mutation_score.sh` (parsear el reporte por archivo, no solo el exit code de Stryker) + el bullet correspondiente en `SK-27_extract_project_rules.md`. Pendiente de aprobación humana antes de escribirse.
2. **Aserciones débiles en tests que verifican "ocurrió algo" en vez de "ocurrió el valor exacto X"** (fechas, URLs, strings compuestos) — patrón genérico, no específico de TK-077. No amerita una Guard nueva: la Guard 11 (Mutation Score) ya es el mecanismo que sistemáticamente expone este patrón cuando se aplica correctamente (ver candidato 1). Ninguna acción adicional más allá de arreglar el script.

## ⚖️ VEREDICTO FINAL:
**RECHAZADO CON DEFECTOS** — Fase 1 defectuosa en `RequestAdminPinResetUseCase.ts` (65.52% < 70%). El resto de fases (0, 2, 3, 4, 5) pasan sin objeciones bloqueantes.
