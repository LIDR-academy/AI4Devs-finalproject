# Research — Portal de Verificación

**Feature**: `007-portal-verificacion` | **Date**: 2026-07-30

## R1 — Consumo del API público (006) sin modificar backend

**Decision**: El portal es cliente exclusivo de `GET /api/v1/verificaciones/{codigo}`, `GET .../documento` y `POST .../registros` según contratos de feature `006`. Base URL configurable por environment (`apiBaseUrl`). Sin BFF, sin Cognito, sin llamadas a S3.

**Rationale**: Spec FR-003 / assumptions; TKT-067 depende de TKT-010..013. Separación de responsabilidades: reglas de vigencia y auditoría en el servicio; UX y orquestación en el SPA.

**Alternatives considered**: Proxy BFF — añade superficie y despliegue sin beneficio para canal anónimo; reimplementar vigencia en FE — divergiría del servicio y rompería single source of truth.

## R2 — Stack UI: SCSS corporativo vs PrimeNG ahora

**Decision**: Implementar el flujo con controles nativos HTML + Angular Reactive Forms + clases/tokens CCB ya portados (`src/styles/ccb/`). **No** añadir PrimeNG ni Tailwind en esta feature. Documentar la desviación acotada respecto a ADR-0001 en Complexity Tracking del plan.

**Rationale**: ADR-0001 busca fidelidad corporativa evitando Material; el shell/tema ya cumplen esa meta. El portal de verificación es un único formulario + visor; PrimeNG unstyled añadiría peso y setup en contra de RNF-32. `portal-certificados` (más transaccional) es el consumidor natural de PrimeNG.

**Alternatives considered**: Instalar PrimeNG unstyled + Tailwind ya — alineación literal al ADR, pero costo/bundle injustificado para TKT-067; Angular Material — prohibido por ADR-0001 y FR-020.

## R3 — Visor PDF: `pdfjs-dist` con carga diferida

**Decision**: Usar `pdfjs-dist` (Mozilla PDF.js) dentro de `PdfViewerComponent`. Importación dinámica / lazy route o `import()` del worker+lib **solo tras** verificación exitosa con documento disponible (FR-022). Contenedor `.pdf-viewer-frame`. Descarga vía Blob/`URL.createObjectURL` del mismo contenido Base64.

**Rationale**: TKT-067, AGENTS.md, regla Angular y ADR-0002 asumen pdf.js sobre Base64. Lazy-load es el mecanismo explícito de FR-022 si el peso impide &lt;3s en 3G.

**Alternatives considered**: `ng2-pdf-viewer` / wrappers Angular — capa extra y versiones a menudo desfasadas; solo `<object>`/`iframe` — control visual y a11y más débiles frente al marco corporativo.

## R4 — Normalización y validación de código en cliente

**Decision**: Antes de validar formato: `trim` de extremos + `toUpperCase()`. Luego regex `^[A-Z0-9]{14}$`. Si falla: error inline, **cero** HTTP. Si pasa: enviar el código ya normalizado en el path.

**Rationale**: Clarificación Q1 de la spec (FR-004a / FR-005). El API 006 también exige `^[A-Z0-9]{14}$` y trata minúsculas como 400; normalizar en FE evita rechazos por pegado con espacios/minúsculas y alinea UX al sitio actual.

**Alternatives considered**: Enviar sin normalizar — peor UX y más 400; strip de espacios internos — contradice FR-004a (clarificación: no eliminar espacios internos).

## R5 — Orquestación del flujo feliz (tres pasos)

**Decision**: Tras T&C + formato OK: (1) `validar` → si no vigente/errores, stop con mensaje mapeado; (2) si vigente, `obtenerDocumento`; si falla documento, mensaje de indisponibilidad **sin** POST registros; (3) si documento OK, mostrar visor y `registrar` en fire-and-forget / catch silencioso (sin mensaje UI).

**Rationale**: Clarificaciones Q3/Q4 y FR-008a / FR-016..018. Orden alineado a auditoría “solo tras éxito con documento” del servicio público.

**Alternatives considered**: Validar+documento en paralelo — puede pedir documento tras rechazo; registrar antes del documento — viola clarificación del API y de la spec; omitir registro si falla red — aceptable (silencioso), no reintentar en bucle.

## R6 — Estado UI con signals (sin NgRx global)

**Decision**: Feature store con Angular signals (`isLoading`, `terminosAceptados`, `codigo`, `resultado`, `documentoBase64`, `errorMensaje`, etc.). Reactive form o signals binding para input/checkbox. Persistir aceptación de T&C en el store de la visita (no `localStorage`); al limpiar resultado, mantener `terminosAceptados === true`.

**Rationale**: Regla `angular-frontend.mdc` (signals primero). Un solo feature: SignalStore global del monorepo es overkill. FR-006b exige conservar T&C en la misma visita.

**Alternatives considered**: NgRx SignalStore compartido — innecesario para una pantalla; BehaviorSubject — desalineado a la regla del repo; `sessionStorage` para T&C — persistiría más allá de lo pedido y complica privacidad.

## R7 — Mapeo HTTP → mensajes orientativos

**Decision**: Centralizar en `VerificacionService` (o mapper puro testeable) el mapeo:

| HTTP / condición | Mensaje UX (orientativo) |
|---|---|
| Formato inválido (cliente) | Error inline de formato (sin HTTP) |
| 404 `CODIGO_NO_ENCONTRADO` | Código no existe |
| 410 `CODIGO_EXPIRADO` | Código ha expirado (vigencia 60 días) |
| 404 `ARCHIVO_NO_ENCONTRADO` / contenido vacío | Documento no disponible |
| 429 | Reintentar más tarde |
| 503 / red / 5xx | Error temporal genérico |
| Fallo POST registros | Sin mensaje al usuario |

Alinear textos a [error-mapping.md](../006-servicio-publico-verificacion/contracts/error-mapping.md) sin copiar detalles técnicos ni `correlationId` a la UI.

**Rationale**: SC-003/004/010 y edge cases de rate limit/red. Evita lógica de mensajes en el template.

**Alternatives considered**: Mostrar `error.message` crudo del API — riesgo de inconsistencia/enumeración; toasts genéricos únicos — empeora SC-010.

## R8 — Anti doble envío y campo editable

**Decision**: Mientras `isLoading`, deshabilitar solo el botón verificar + indicador de carga; input de código permanece habilitado. No iniciar segunda orquestación desde el CTA hasta resolver la actual. Al editar el código de forma que invalide el resultado mostrado, limpiar resultado/visor (T&C se mantienen).

**Rationale**: Clarificación Q2 / FR-006a y edge cases de doble clic.

**Alternatives considered**: Deshabilitar todo el form — peor UX si el usuario quiere corregir el código; debounce sin disable — aún permite doble disparo.

## R9 — Correlation ID y configuración

**Decision**: Interceptor HTTP que añade `X-Correlation-Id` (UUID) si no existe. `provideHttpClient(withInterceptors(...))` en `app.config`. Environments: `apiBaseUrl` apuntando a `:8083` en dev y al host público en prod. Sin interceptor de Authorization.

**Rationale**: Constitución X / headers CORS expuestos; facilita soporte cruzado con logs del API. Spec prohíbe Cognito en este portal.

**Alternatives considered**: Sin correlation id — pierde trazabilidad FE↔BE; meter JWT “por si acaso” — viola FR-001/FR-003.

## R10 — Accesibilidad y checklist visual

**Decision**: Controles con labels asociados, estados `aria-disabled`/`aria-busy` en CTA, errores anunciables (`role="alert"` o `aria-live`), foco visible con estilos CCB, contraste según tokens. Validar checklist §6 de la guía de imagen en quickstart. Licencia TradeGothic: fallback Helvetica/Arial si no confirmada (assumption de spec).

**Rationale**: FR-019..021 / SC-008 / SC-009 / RNF-33.

**Alternatives considered**: Diferir a11y a fase posterior — rechazado: es criterio de aceptación del ticket.
