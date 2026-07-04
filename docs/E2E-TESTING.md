# RunMarket — Informe de Tests E2E (Playwright)

## Resumen

| | |
|---|---|
| Suite | `e2e/` (Playwright, Chromium) |
| Specs | 4 |
| Tests | 15 |
| Resultado | **15/15 en verde** |
| Última ejecución | 2026-07-03 — `npx playwright test --reporter=list` |
| Sistema verificado | Frontend `:3000`, Backend `:4000`, PostgreSQL `:5432` (seed cargado), local |

Detalle de tareas, decisiones de diseño de cada spec y hallazgos de seguridad asociados:
`docs/backlog/US-014.md` (o su versión archivada en `docs/backlog/archive/US-014.md` tras
el cierre de la US).

## Cobertura por escenario

| Spec | Test | Criterio de aceptación cubierto | Resultado |
|---|---|---|---|
| `catalog.spec.ts` | el catálogo muestra productos del seed | US-014 AC-1 (productos visibles) | ✅ Pass |
| `catalog.spec.ts` | activar un filtro de distancia cambia los resultados | US-014 AC-1 (filtro de distancia cambia resultados) | ✅ Pass |
| `catalog.spec.ts` | combinar filtros sin resultados muestra el estado vacío | US-014 AC-1 (estado vacío) | ✅ Pass |
| `product.spec.ts` | navega del catálogo a la ficha y muestra nombre, precio y atributos | US-014 AC-2 (navegación, nombre/precio/atributos, botón «Volver») | ✅ Pass |
| `product.spec.ts` | un id de producto inexistente muestra el estado 404 | US-014 AC-2 (estado 404) | ✅ Pass |
| `product.spec.ts` | un producto sin stock muestra el botón Agotado deshabilitado | Escenario alternativo CU2 (producto agotado) | ✅ Pass |
| `product.spec.ts` | añadir al carrito sin seleccionar talla muestra aviso inline | Escenario alternativo CU2 (variante obligatoria) | ✅ Pass |
| `purchase.spec.ts` | completa el ciclo carrito → checkout → confirmación | US-014 AC-3 (carrito → checkout → confirmación → número de pedido → carrito vacío) | ✅ Pass |
| `purchase.spec.ts` | un carrito vacío muestra el estado vacío sin opción de tramitar pedido | Escenario alternativo CU3 (carrito vacío) | ✅ Pass |
| `purchase.spec.ts` | datos de envío inválidos muestran error inline y no avanzan al paso 2 | Escenario alternativo CU3 (validación de envío) | ✅ Pass |
| `purchase.spec.ts` | tarjeta inválida muestra error inline y no avanza al paso 3 | Escenario alternativo CU3 (validación de pago) | ✅ Pass |
| `security-headers.spec.ts` | GET / incluye Content-Security-Policy | US-016 TASK-05 (CSP presente) | ✅ Pass |
| `security-headers.spec.ts` | GET / incluye X-Frame-Options: DENY | US-016 TASK-05 (X-Frame-Options) | ✅ Pass |
| `security-headers.spec.ts` | GET / incluye X-Content-Type-Options: nosniff | US-016 TASK-05 (X-Content-Type-Options) | ✅ Pass |
| `security-headers.spec.ts` | GET / incluye Referrer-Policy | US-016 TASK-05 (Referrer-Policy) | ✅ Pass |

AC-4 (specs en headless), AC-5 (config de Playwright) y AC-6 (documentación) no son
escenarios ejecutables — se verifican por inspección, ver `docs/backlog/US-014.md`. Los
4 escenarios alternativos se añadieron en el commit `9317ef8`, posterior al cierre de
US-014; no mapean a un AC de esa US sino a gaps de cobertura detectados en QA sobre CU2/CU3.

## Resultado de la última ejecución

```
$ npx playwright test --reporter=list

Running 15 tests using 5 workers

  ✓  [chromium] › tests/catalog.spec.ts:4:7 › Catálogo de productos › el catálogo muestra productos del seed (1.6s)
  ✓  [chromium] › tests/product.spec.ts:23:7 › Ficha de producto › un id de producto inexistente muestra el estado 404 (1.6s)
  ✓  [chromium] › tests/product.spec.ts:4:7 › Ficha de producto › navega del catálogo a la ficha y muestra nombre, precio y atributos (2.2s)
  ✓  [chromium] › tests/product.spec.ts:31:7 › Ficha de producto › un producto sin stock muestra el botón Agotado deshabilitado (824ms)
  ✓  [chromium] › tests/catalog.spec.ts:11:7 › Catálogo de productos › activar un filtro de distancia cambia los resultados (2.5s)
  ✓  [chromium] › tests/product.spec.ts:43:7 › Ficha de producto › añadir al carrito sin seleccionar talla muestra aviso inline (859ms)
  ✓  [chromium] › tests/catalog.spec.ts:27:7 › Catálogo de productos › combinar filtros sin resultados muestra el estado vacío (3.4s)
  ✓  [chromium] › tests/security-headers.spec.ts:4:7 › US-016-TASK-05: Security headers en frontend (Next.js) › GET / incluye Content-Security-Policy (152ms)
  ✓  [chromium] › tests/purchase.spec.ts:57:7 › Ciclo de compra › un carrito vacío muestra el estado vacío sin opción de tramitar pedido (1.1s)
  ✓  [chromium] › tests/security-headers.spec.ts:11:7 › US-016-TASK-05: Security headers en frontend (Next.js) › GET / incluye X-Frame-Options: DENY (213ms)
  ✓  [chromium] › tests/security-headers.spec.ts:16:7 › US-016-TASK-05: Security headers en frontend (Next.js) › GET / incluye X-Content-Type-Options: nosniff (184ms)
  ✓  [chromium] › tests/security-headers.spec.ts:21:7 › US-016-TASK-05: Security headers en frontend (Next.js) › GET / incluye Referrer-Policy (200ms)
  ✓  [chromium] › tests/purchase.spec.ts:4:7 › Ciclo de compra › completa el ciclo carrito → checkout → confirmación (2.1s)
  ✓  [chromium] › tests/purchase.spec.ts:65:7 › Ciclo de compra › datos de envío inválidos muestran error inline y no avanzan al paso 2 (2.3s)
  ✓  [chromium] › tests/purchase.spec.ts:86:7 › Ciclo de compra › tarjeta inválida muestra error inline y no avanza al paso 3 (2.3s)

  15 passed (5.1s)
```

Ejecuciones adicionales registradas durante el desarrollo (ver `docs/backlog/US-014.md`,
detalle de cada tarea): cada spec se ejecutó al menos dos veces de forma aislada para
confirmar estabilidad, además de la ejecución conjunta de arriba.

## Incidencias encontradas y resueltas durante la implementación

| Incidencia | Causa | Resolución |
|---|---|---|
| `.check()` fallaba en checkbox de distancia y radio de categoría | Remount del `FilterPanel` (`Suspense` + `startTransition`) entre el clic y la confirmación de estado — no perceptible para un usuario real | Sustituido por `.click()` + `expect(locator).toBeChecked()` (aserción auto-retry) |
| `getByRole('link', { name: /catálogo/i })` ambiguo en la página 404 | Coincide con el link de navegación global «Catálogo» y con «Volver al catálogo» | Nombre accesible exacto: «Volver al catálogo» |
| `getByLabel('Email', { exact: true })` no encontraba el campo | El `<label>` incluye el asterisco de obligatoriedad en el texto comparado, aunque esté en un `span aria-hidden` | Quitado `exact: true` |
| Timeout de 30 s superado en `purchase.spec.ts` | El journey completo (4 páginas + 2 formularios + 1 checkout real) agota el timeout por defecto de Playwright | `timeout: 60_000` añadido a `playwright.config.ts` |
| 8 de 11 tests previos rompían al añadir la CSP (US-016) | `script-src 'self' 'unsafe-inline'` no incluye `'unsafe-eval'`, que el servidor de desarrollo de Next.js necesita para HMR y compilación dinámica | `next.config.mjs` añade `'unsafe-eval'` a `script-src` cuando `NODE_ENV !== 'production'`; en build de producción la directiva queda estricta |

Ninguna incidencia reveló un defecto real de la aplicación — todas eran ajustes del propio
spec o de su configuración. Detalle completo de cada una: `docs/backlog/US-014.md`.

## Cómo reproducir

**Precondición — sistema completo levantado en local:**

```bash
docker compose up -d        # PostgreSQL en :5432
cd backend && npm run dev   # API Express en :4000
cd frontend && npm run dev  # Next.js en :3000
```

La base de datos debe tener el seed cargado (`npx prisma db seed` desde `backend/`, ver
`docs/backlog/archive/US-000.md`).

**Ejecutar:**

```bash
cd e2e
npx playwright test
```

- `npx playwright test catalog.spec.ts` — un único spec.
- `E2E_BASE_URL=http://localhost:3000 npx playwright test` — apuntar a un `baseURL`
  distinto del valor por defecto (opcional).

## Configuración y notas de fiabilidad

- `e2e/playwright.config.ts`: `baseURL` configurable vía `E2E_BASE_URL`; un único
  proyecto Chromium; `timeout: 60_000`; `retries` solo bajo `process.env.CI`; artefactos
  de fallo (`trace`, `screenshot`, `video`) activados en `e2e/test-results/` (excluido de
  git, ver hallazgo SEC-01 en `docs/backlog/US-014.md`).
- `purchase.spec.ts` crea un pedido real en cada ejecución: usa datos de envío únicos por
  run (`Date.now()`) para no colisionar entre ejecuciones, y no asume conteos absolutos
  de pedidos — solo verifica el pedido recién creado. Los datos generados no se limpian
  tras la ejecución (deuda aceptada para el MVP).
- **Consumo de stock real (desde US-015):** el test principal de `purchase.spec.ts`
  compra una unidad del primer producto del catálogo en cada ejecución, y desde US-015
  esa compra descuenta el stock real del producto (antes era un no-op). No se reseedea
  desde el propio spec — haría falta seedear la base de datos directamente desde un
  test, lo que viola la *black-box rule* de `.claude/skills/e2e-playwright/SKILL.md`.
  Si tras muchas ejecuciones locales el stock de ese producto llega a 0, `npx prisma db
  seed` (idempotente, vía `upsert`) lo restaura — mantenimiento de entorno esperado,
  mismo espíritu que la deuda de pedidos sin limpiar.
