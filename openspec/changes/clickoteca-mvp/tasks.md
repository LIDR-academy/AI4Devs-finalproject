# Tasks: Clickoteca MVP

> Tests no negociables: cada capability incluye su batería de pruebas. Se prioriza
> cubrir caminos de error y casos límite, no sólo el camino feliz.

## 1. Fundaciones
- [x] 1.1 Scaffolding del proyecto **Next.js** (App Router, TypeScript): Portal del Suscriptor + Back-office segmentados por rol (route groups + `proxy.ts` de auth); API REST pública en `app/api/*` (Route Handlers + Zod → OpenAPI); capa de dominio/casos de uso agnóstica del framework; scheduler como proceso Node aparte (node-cron). Ver ADR-0001 §2–§4 y `documents/C4-architecture.md`. **Hecho:** Next 16 + React 19 + Tailwind v4 + shadcn/ui + Prisma 7 (driver adapter pg) + Vitest/Playwright/Testcontainers; `build`, `typecheck`, `lint` y tests humo en verde (ver AGENTS.md)
- [x] 1.2 Modelo de datos en `prisma/schema.prisma` (PostgreSQL + Prisma; ver PRD §15 y design.md D10). Núcleo: `User`, `Set`, `Copy`, `Subscription`, `Rental`, `ReservationQueueEntry`, `ReservationOffer`. Operación/trazabilidad: `ConditionReport`, `Incident`, `CopyStateTransition`, `AuditLog`, `Notification`, `Shipment`. Configuración/pagos: `Plan`, `SystemSetting`, `RetentionReminderConfig`, `PaymentMethod`, `Payment`, `Address`, `Theme`, `MediaAsset`. **Hecho:** 22 modelos / 18 enums — se añadió `Session` (tabla de sesiones que exige ADR-0002 §1, ausente en el borrador). Primera migración `20260811220146_init` aplicada, con el **índice único parcial** "una oferta activa por copia" (D12) añadido en SQL porque Prisma no expresa índices parciales
- [x] 1.3 Semillas/datos de prueba (sets, copias, usuarios de cada rol); catálogo semilla desde el dataset público de Rebrickable (nombre, año, tema, nº piezas, foto de la caja); edad recomendada y dificultad curadas a mano para el subconjunto semilla. **Hecho:** `prisma/seed.ts` idempotente + `prisma/seed-data/sets.json` (35 sets reales de Rebrickable, commiteado para sembrar sin red). Siembra 2 planes (D9), 7 `SystemSetting`, 5 usuarios (uno por rol + 3 suscriptores con antigüedades distintas para ejercitar D7), 20 temas, 35 sets y 61 copias con su auditoría de transición. Hashing argon2id en `src/domain/auth/password.ts` (ADR-0002 §1)

## 2. Cuentas y roles (`accounts-roles`)
- [x] 2.1 Autenticación y modelo de 3 roles (suscriptor/operador/admin). **Hecho:** sesión opaca server-side (ADR-0002 §1) — cookie `httpOnly`/`SameSite=Lax` con token aleatorio del que la tabla `Session` solo guarda el **hash**; login/logout/session en `app/api/auth/*`; dominio en `src/domain/auth/{session,roles,password}.ts`; puerto `AuthRepository` + adaptador Prisma; casos de uso `login`/`logout`/`authenticate`. El **`proxy`** resuelve la sesión y corta por superficie (`/portal` → SUBSCRIBER, `/backoffice` → OPERATOR|ADMIN), con `requireSurfacePage` en los layouts como respaldo y `requireSession`/`requireSurface` para `/api`. Contrato de errores **RFC 9457** centralizado en `src/http/problem.ts` (mapa `code` → status). Página `/login` mínima. 34 tests nuevos (40 en total)
- [x] 2.2 Autorización por acción según matriz de permisos. **Hecho:** `src/domain/auth/permissions.ts` implementa la tabla de PRD §3 como **fuente única de verdad** (15 permisos × 3 roles); el admin se construye a partir del operador, así que una acción nueva del operador no puede olvidarse de dársela al admin. La frontera de superficies de `roles.ts` pasa a **derivarse** de la matriz (`portal.access` / `backoffice.access`) en vez de mantener su propia tabla. Guarda `requirePermission()` en `src/http/auth-context.ts` — los handlers preguntan por la acción, no por el rol. `GET /api/auth/session` devuelve también los permisos, para que el cliente decida qué ofrecer. 25 tests nuevos, con la matriz entera (permitidos y denegados)
- [ ] 2.3 Baja de copia restringida a admin
- [ ] 2.4 Registro de auditoría "quién/cuándo" en transiciones y acciones admin
- [ ] 2.5 Alta de suscriptor (adulto + tarjeta simulada + dirección de envío/contacto + condiciones lorem ipsum)
- [ ] 2.6 Acceso público del visitante (actor no autenticado): proyección pública del catálogo + planes/condiciones + alta; gating que exige login para acciones de suscriptor y back-office (ver design.md D13)
- [ ] 2.7 Tests: permisos por rol, rechazo de baja por operador, registro de auditoría, alta bloqueada sin dirección de envío, visitante bloqueado en acciones reservadas

## 3. Catálogo e inventario (`catalog-inventory`)
- [ ] 3.1 CRUD de Set (incluye valor de referencia) y de Copia; relación Set↔Copias
- [ ] 3.2 Máquina de estados de la copia y validación de transiciones
- [ ] 3.3 Flujo de alta (INTAKE → DISPONIBLE)
- [ ] 3.4 Ramas INCOMPLETA / BAJA
- [ ] 3.5 Tests: transiciones válidas e inválidas, varias copias por set, ramas de error, publicación bloqueada sin valor de referencia
- [ ] 3.6 Proyección pública vs. autenticada del catálogo (la pública oculta disponibilidad y cola y solo muestra Sets publicados) + tests

## 4. Suscripciones (`subscriptions`)
- [ ] 4.1 Planes basic/premium, límites de sets simultáneos y precio mensual configurable por plan
- [ ] 4.2 Regla "no nuevo set hasta devolución completada"
- [ ] 4.3 Antigüedad mínima para sets restringidos (configurable)
- [ ] 4.4 No cancelar/pausar con set fuera
- [ ] 4.5 Recordatorios de retención (configurable por set/admin)
- [ ] 4.6 Alquiler puntual sin suscripción (precio = % configurable del valor de referencia del Set)
- [ ] 4.7 Tests: límites de plan, bloqueos de elegibilidad, antigüedad, cancelación bloqueada, precio por plan, cálculo de precio del alquiler puntual

## 5. Alquileres y devoluciones (`rentals-returns`)
- [ ] 5.1 Solicitud y asignación de copia (camino con disponibilidad)
- [ ] 5.2 Registro de condición en la entrega (checklist/foto) antes del envío + confirmación tácita o discrepancia del suscriptor
- [ ] 5.3 Inicio de devolución + registro de recogida (logística simulada)
- [ ] 5.4 Recepción e inspección por operador
- [ ] 5.5 Higienización como paso separado
- [ ] 5.6 Liberación que dispara oferta a cola tras inspección OK (A1)
- [ ] 5.7 Tests: E2E entrega(+condición)→alquiler→devolución→inspección→higiene→disponible; discrepancia en la entrega genera incidencia sin imputar al suscriptor; recepción registra operador

## 6. Cola de reservas (`reservation-queue`)
- [ ] 6.1 Encolado por Set con marca de tiempo
- [ ] 6.2 Ordenación por `effectiveEntryAt` inmutable (`enqueuedAt − bono_aplicado`), calculada al encolar, sin recálculo periódico (ver design.md D11)
- [ ] 6.3 Elegibilidad al ofrecer (saltar no elegibles)
- [ ] 6.4 Ventana de confirmación: aceptar/rechazar, recordatorio a mitad, caducidad → final con prioridad reducida
- [ ] 6.5 Límite de colas simultáneas por usuario (configurable)
- [ ] 6.6 Tests: basic adelanta a premium con el tiempo, empates, rechazo libera al instante, caducidad re-encola, salto de no elegibles

## 7. Notificaciones (`notifications`)
- [ ] 7.1 Motor de notificaciones dirigido por eventos de dominio
- [ ] 7.2 Eventos al suscriptor (te toca, recordatorios, devolución recibida/completada, confirmación)
- [ ] 7.3 Eventos internos (incompleta detectada, baja)
- [ ] 7.4 Tests: cada evento dispara su notificación; no se duplican/pierden

## 8. Back-office y cierre
- [ ] 8.1 Panel de operador (cola de trabajo de copias por estado)
- [ ] 8.2 Panel de admin (configuración de reglas/parámetros, gestión de empleados, vista de clientes)
- [ ] 8.3 Vista de lectura limitada de cliente para operador
- [ ] 8.4 Recorrido E2E completo demostrable (suscriptor + back-office)
- [ ] 8.5 `openspec validate clickoteca-mvp --strict` en verde
