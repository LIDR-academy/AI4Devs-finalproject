# ADR-0002 — Autenticación y contrato de errores de la API (Clickoteca MVP)

- **Estado:** Aceptado.
- **Fecha:** 2026-07-04
- **Decisores:** Xavier Vergés (owner).
- **Contexto de origen:** complementa `ADR-0001-arquitectura-mvp.md` (arquitectura
  de la app) con dos decisiones transversales de la **API REST**: cómo se autentica
  y qué forma tienen sus errores. La concurrencia del dominio se decide aparte en
  `openspec/changes/clickoteca-mvp/design.md` D12.

---

## Contexto

La API es pública (Route Handlers de Next.js en `app/api/*`) y da servicio a la
misma app Next, con dos superficies segmentadas por rol (`ADR-0001` §2–§3). El
despliegue es **mismo origen** (`ADR-0001` §5, hoy `ADR-0003`): front y API salen
del mismo despliegue —Vercel— y las imágenes del catálogo son URLs externas, lo que
simplifica las decisiones de sesión. El criterio de éxito del MVP es la **cobertura de caminos de error** (PRD
§10), lo que exige un contrato de errores **estable y máquina-legible**, no solo
códigos HTTP.

---

## Decisión

### 1. Autenticación: sesión server-side por cookie

- **Sesión opaca server-side**: el identificador de sesión viaja en una cookie
  `httpOnly` + `Secure` + `SameSite=Lax` (`Strict` donde aplique). El estado de
  sesión se persiste en Postgres (tabla de sesiones). Que la base sea local o
  gestionada no cambia nada aquí: el cambio de hosting (`ADR-0003`) no toca este ADR.
- **Passwords con argon2id** (bcrypt aceptable como alternativa).
- **Autorización por rol** (`SUBSCRIBER | OPERATOR | ADMIN`) en middleware
  **server-side**: es la **frontera de seguridad real**. La segmentación por rol
  del back-office en Next (route groups + middleware, `ADR-0001` §3) es
  *defense-in-depth*/UX, no seguridad.
- **CSRF**: `SameSite=Lax` cubre el grueso; al ser despliegue **mismo origen**
  (`ADR-0001` §5) no hay POST cross-site en el MVP. Si se añadieran, se incorpora
  token CSRF.

**Por qué no JWT.** Con sesión server-side la **revocación es trivial** (se borra la
sesión); JWT exigiría lista de revocación o *refresh tokens* — ceremonia
innecesaria para el alcance. El **mismo origen** hace la cookie *first-party*, sin
la complejidad cross-origin que tendría un split PaaS.

### 2. Contrato de errores: RFC 9457 (Problem Details) + `code`

- Toda respuesta de error usa **`application/problem+json`** con la forma RFC 9457:
  `{ type, title, status, detail, instance }`.
- **Miembro de extensión `code`**: enum de dominio **estable y cerrado**, p. ej.
  `COPY_STATE_CONFLICT`, `QUEUE_LIMIT_EXCEEDED`, `OFFER_EXPIRED`, `NOT_ELIGIBLE`,
  `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `INTERNAL`.
- **Validación** (422): array `errors[]` de `{ field, issue }`.
- **Mapa dominio → HTTP centralizado** (un `errorMap`): 401 no-auth, 403 rol, 404,
  **409 conflictos CAS** (`design.md` D12), 422 validación, 400 request malformada.
- **500 nunca filtra interno**: `code: INTERNAL` + un `instance`/trace-id para
  correlacionar en logs; sin *stack traces* al cliente.
- Se documenta **una sola vez** como `components.responses.Problem` en el OpenAPI y
  todos los endpoints lo referencian.

Ejemplo (conflicto de transición de estado, D12):

```json
// HTTP 409  Content-Type: application/problem+json
{
  "type": "https://clickoteca/errors/copy-state-conflict",
  "title": "Transición de estado no válida",
  "status": 409,
  "code": "COPY_STATE_CONFLICT",
  "detail": "La copia 405 ya no está EN_INSPECCION.",
  "instance": "/copies/405/transitions"
}
```

**Por qué.** Un `code` estable y máquina-legible permite: (a) **testear por código**
(no por texto), directamente al servicio del criterio de cobertura de errores del
PRD §10; (b) que el **frontend renderice por código** — el texto se localiza en
cliente, compatible con i18n / WCAG; (c) **desacoplar** el mensaje humano
(`title`/`detail`, solo *fallback*) del contrato. Dos ejes ortogonales: `status`
para el transporte, `code` para el dominio.

---

## Alternativas consideradas

| Eje | Alternativa | Por qué se descarta (para el MVP) |
|---|---|---|
| Auth | JWT (stateless) | Revocación cara (blacklist / refresh); innecesario con sesión server-side y mismo origen. |
| Auth | OAuth/OIDC con IdP externo | Sobra para el alcance; añade dependencia y complejidad. |
| Errores | *Envelope* propio `{ error: { code, message } }` | Reinventa un estándar que ya resuelve esto igual de barato. |
| Errores | JSON:API errors | Más pesado y orientado a toda la spec JSON:API, que no se usa. |

---

## Consecuencias

**Positivas**
- Contrato de errores **estable y testeable**; el frontend y los tests dependen del
  `code`, no del texto.
- Auth **simple** con revocación trivial; el mismo origen elimina CORS y
  CSRF-cross-origin.

**Negativas / trade-offs**
- La sesión server-side requiere **almacenamiento de sesiones** (tabla en Postgres)
  — una consulta por petición, que con la base gestionada de `ADR-0003` paga red.
- El enum de `code` **es contrato**: ampliarlo es seguro, cambiar/eliminar valores
  es *breaking* y hay que versionarlo.

---

## Referencias

- RFC 9457 — Problem Details for HTTP APIs.
- `documents/ADR-0001-arquitectura-mvp.md` — arquitectura de la app (mismo origen, §5).
- `openspec/changes/clickoteca-mvp/design.md` — D12 (concurrencia por CAS).
- `documents/PRD.md` — PRD (§10 criterios, §14.2 roles).
