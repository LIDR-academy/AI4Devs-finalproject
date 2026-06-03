# Tasks — T-03-01 · Instalar Prisma y definir esquema completo (todos los modelos del PRD)

**Ticket:** T-03-01 · **User Story:** US-03 · **Change:** `t-03-01-prisma-schema` · **Rama:** `feature/T-03-01-prisma-schema`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-03-01-prisma-schema"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-03-01-prisma-schema"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-03-01-prisma-schema`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-03-01-prisma-schema`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Verificar dependencias Prisma (DoD: prisma init / paquetes instalados)

- [x] 1.1 Confirmar `prisma` y `@prisma/client` en `package.json` raíz (versiones compatibles 5.x)
- [x] 1.2 Confirmar bloque `"prisma": { "schema": "backend/prisma/schema.prisma" }` en `package.json`
- [x] 1.3 Confirmar datasource `provider = "postgresql"` y `url = env("DATABASE_URL")` en `backend/prisma/schema.prisma`
- [x] 1.4 Si falta alguna dependencia, instalar con `npm install` desde la raíz (sin duplicar en `backend/package.json`)

## 2. Definir esquema completo del dominio (DoD: modelos PRD)

- [x] 2.1 Eliminar modelo heredado `Calendar` del schema
- [x] 2.2 Ampliar `User` con `avatarUrl`, `createdAt @default(now())` y relaciones `weeks`, `habits`, `rewards`
- [x] 2.3 Añadir modelo `Week` con campos PRD, defaults (`isLocked`, `totalPointsEarned`, `totalPenalties`) e índice `@@index([userId, startDate])`
- [x] 2.4 Añadir modelo `Habit` con campos PRD, `isActive @default(true)` y relación a `User`
- [x] 2.5 Añadir modelo `WeekHabit` con snapshot fields, `@@index([weekId])` y `@@unique([weekId, habitId])`
- [x] 2.6 Declarar enum `CompletionStatus { pending completed failed }`
- [x] 2.7 Añadir modelo `HabitEntry` con `status CompletionStatus @default(pending)`, `updatedAt @updatedAt`, `@@index([weekHabitId])`
- [x] 2.8 Añadir modelo `Reward` con campos PRD e `isActive @default(true)`
- [x] 2.9 Añadir modelo `RewardRedemption` con `@@index([weekId])` y relaciones a `Week` y `Reward`
- [x] 2.10 Revisar `@relation` y `onDelete` según `design.md` (CASCADE en hijos de User/Week; Restrict en referencias históricas)

## 3. Validar y generar cliente Prisma (DoD: prisma validate)

- [x] 3.1 Ejecutar `npx prisma validate` desde la raíz → exit code 0
- [x] 3.2 Ejecutar `npm run prisma:generate` → cliente regenerado sin errores
- [x] 3.3 Revisión manual: checklist US-03 Scenario 5 (7 modelos, campos clave, sin `Calendar`)
- [x] 3.4 Ejecutar `npm run typecheck` y confirmar que `backend/src` compila (p. ej. `prismaUserRepository.ts`)

## 4. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 4.1 Buscar tests que referencien `schema.prisma`, modelos Prisma o `@prisma/client`
- [x] 4.2 Si no hay tests aplicables, documentar "N/A — ticket de schema Prisma" en el informe del paso 5

## 5. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque T-03-01 (Schema): validar Prisma, typecheck/lint; smoke test opcional de API sin exigir tablas nuevas.**

- [x] 5.1 Ejecutar `npm run lint` y confirmar exit code 0
- [x] 5.2 Ejecutar `npm run test` (Vitest) y documentar resultado (pass/skip/N/A)
- [x] 5.3 (Opcional) `npm run db:up` + `npm run dev:api` — verificar que el API arranca con schema ampliado (tablas nuevas aún no existen hasta T-03-02; conexión BD puede seguir usando solo `User` si ya existe)
- [x] 5.4 (Opcional) `npm run dev:web` — smoke test sin regresión de compilación Vite
- [x] 5.5 Crear informe `openspec/changes/t-03-01-prisma-schema/reports/YYYY-MM-DD-step-05-verification.md` con salida de `prisma validate`, `prisma:generate`, `typecheck` y `lint`
- [x] 5.6 Marcar paso completado solo tras PASS y existir el informe

## 6. Pruebas manuales de endpoints con curl (N/A — sin cambios de API)

Este ticket define schema Prisma; no modifica endpoints.

- [x] 6.1 Documentar en el informe del paso 5: "Paso curl N/A — T-03-01 no altera la API"

## 7. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)

- [x] 7.1 Documentar en el informe del paso 5: "Paso E2E N/A — T-03-01 solo afecta schema Prisma"

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 Actualizar `docs/data-model.md`: tabla "Estado de persistencia" — entidades definidas en Prisma (migración pendiente T-03-02)
- [x] 8.2 Eliminar o actualizar nota sobre modelo `Calendar` heredado
- [x] 8.3 Revisar `docs/development_guide.md` § Prisma: confirmar ruta del schema y comandos `validate` / `generate` (sin añadir migración/seed de T-03-02/03)
- [x] 8.4 Verificar consistencia entre `docs/data-model.md`, `docs/prd.md` §5.1 y `backend/prisma/schema.prisma`
- [x] 8.5 No modificar `docs/api-spec.yml` salvo que sea estrictamente necesario (no esperado en este ticket)

## 9. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas del paso 5 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [x] 9.1 Confirmar que no quedan tareas de implementación pendientes en este archivo
- [x] 9.2 Confirmar informe del paso 5 en estado PASS
- [ ] 9.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 9.4 Hacer **commit único** en `feature/T-03-01-prisma-schema` con mensaje en viñetas (p. ej. `- Definir schema Prisma completo del dominio ConRutina`, `- Añadir enum CompletionStatus e índices del DoD`, `- Eliminar modelo Calendar heredado`, `- Actualizar docs/data-model.md`)
- [ ] 9.5 Subir la rama al remoto: `git push -u origin feature/T-03-01-prisma-schema` (OBLIGATORIO si existe remoto)
- [ ] 9.6 Cambiar a `develop`: `git checkout develop` y `git pull origin develop`
- [ ] 9.7 Integrar: `git merge feature/T-03-01-prisma-schema`
- [ ] 9.8 Verificar mínimo: `npx prisma validate`, `npm run prisma:generate`, `npm run lint`, `npm run typecheck`
- [ ] 9.9 (Opcional) Push de `develop`: `git push origin develop`
- [ ] 9.10 Archivar change OpenSpec: `/opsx:archive t-03-01-prisma-schema`
- [ ] 9.11 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-03-01-prisma-schema`
