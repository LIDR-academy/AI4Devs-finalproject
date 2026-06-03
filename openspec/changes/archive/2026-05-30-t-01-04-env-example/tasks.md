# Tasks — T-01-04 · Crear .env.example con todas las variables documentadas

**Ticket:** T-01-04 · **User Stories:** US-01, US-23 · **Change:** `t-01-04-env-example` · **Rama:** `feature/T-01-04-env-example`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-01-04-env-example"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-01-04-env-example"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-01-04-env-example`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-01-04-env-example`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Crear `.env.example` en la raíz (DoD: 8 variables con comentarios)

- [x] 1.1 Crear `.env.example` en la raíz del monorepo
- [x] 1.2 Incluir `DATABASE_URL` con comentario de una línea (conexión Prisma/API)
- [x] 1.3 Incluir `API_PORT=3001` con comentario (puerto Express / proxy Vite)
- [x] 1.4 Incluir `CORS_ORIGIN=http://localhost:5173` con comentario (origen SPA en desarrollo)
- [x] 1.5 Incluir `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` con comentarios (Docker Compose)
- [x] 1.6 Incluir `NODE_ENV=development` con comentario (entorno Node)
- [x] 1.7 Asegurar coherencia: `DATABASE_URL` usa las mismas credenciales/puerto/base que `POSTGRES_*` y el default `conrutina` de `docker-compose.yml`
- [x] 1.8 Usar solo valores de desarrollo seguros (sin secretos de producción)

## 2. Verificar exclusión de `.env` en Git (DoD: `.env` en `.gitignore`)

- [x] 2.1 Confirmar en `.gitignore` que `.env` está ignorado
- [x] 2.2 Confirmar que `.env.example` **no** está ignorado (`!.env.example` o ausencia de regla que lo excluya)
- [x] 2.3 Ejecutar `git check-ignore -v .env` y documentar que el fichero real quedaría ignorado
- [x] 2.4 Ejecutar `git check-ignore -v .env.example` y confirmar que **no** aparece como ignorado

## 3. Actualizar `README.md` — sección Instalación (DoD)

- [x] 3.1 En **Instalación**, sustituir la instrucción genérica de “crear `.env`” por copiar desde plantilla:
  ```bash
  cp .env.example .env
  ```
  (Windows: `copy .env.example .env`)
- [x] 3.2 Eliminar la advertencia “no hay un archivo `.env.example` versionado”
- [x] 3.3 Mantener enlace a la sección Configuración para detalle de cada variable

## 4. Alinear `docs/development_guide.md` (OBLIGATORIO — consistencia documental)

- [x] 4.1 En §2 Configuración del entorno, referenciar `.env.example` como fuente canónica
- [x] 4.2 Reemplazar el bloque `.env` embebido (`ConRutinaUser`/`ConRutina2`) por instrucción de copiar la plantilla o un extracto coherente con `.env.example`
- [x] 4.3 Verificar que no se documentan credenciales distintas a las de la plantilla sin explicación

## 5. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 5.1 Buscar tests que validen ficheros de configuración o env
- [x] 5.2 Si no hay tests aplicables, documentar "N/A — ticket de documentación/infra" en el informe del paso 6

## 6. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque T-01-04 (Infra + Docs): verificar plantilla, gitignore y arranque opcional con `.env` copiado.**

- [x] 6.1 Ejecutar `npm run lint` y confirmar exit code 0 (sin regresiones por nuevos ficheros)
- [x] 6.2 Verificar contenido de `.env.example`: las 8 variables y comentarios presentes (`Select-String` / revisión manual)
- [x] 6.3 Copiar temporalmente `.env.example` → `.env` en la rama de trabajo (no commitear `.env`)
- [x] 6.4 Si PostgreSQL está disponible (`docker compose up -d` o contenedor existente): ejecutar `npm run dev:api` y confirmar arranque sin error de variables faltantes
- [x] 6.5 Si PostgreSQL no está disponible: documentar en el informe verificación estática de plantilla + gitignore como PASS condicional
- [x] 6.6 Ejecutar `npm run dev:web` y confirmar que Vite arranca (no depende de `.env`)
- [x] 6.7 Eliminar o restaurar `.env` local de prueba; confirmar que `.env` no queda staged en Git (`git status`)
- [x] 6.8 Crear informe `openspec/changes/t-01-04-env-example/reports/YYYY-MM-DD-step-06-verification.md`
- [x] 6.9 Marcar paso completado solo tras PASS y existir el informe

## 7. Pruebas manuales de endpoints con curl (N/A — sin cambios de API)

Este ticket es **Infra + Docs**; no modifica endpoints.

- [x] 7.1 Documentar en el informe del paso 6: "Paso curl N/A — T-01-04 no altera la API"

## 8. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)

Este ticket no modifica componentes ni flujos de usuario.

- [x] 8.1 Documentar en el informe del paso 6: "Paso E2E N/A — T-01-04 solo afecta plantilla de entorno y documentación"

## 9. Actualizar documentación técnica (OBLIGATORIO)

- [x] 9.1 Confirmar `README.md` actualizado (paso 3)
- [x] 9.2 Confirmar `docs/development_guide.md` alineado (paso 4)
- [x] 9.3 Revisar `docs/infrastructure.md` §7: si menciona variables sin `.env.example`, añadir referencia breve (solo si hay inconsistencia evidente)
- [x] 9.4 Verificar consistencia entre README, development_guide y `.env.example`

## 10. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas del paso 6 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [x] 10.1 Confirmar que no quedan tareas de implementación pendientes en este archivo
- [x] 10.2 Confirmar informe del paso 6 en estado PASS
- [ ] 10.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 10.4 Hacer **commit único** en `feature/T-01-04-env-example` con mensaje en viñetas (p. ej. `- Añadir .env.example con variables documentadas`, `- Actualizar README y development_guide`)
- [ ] 10.5 Subir la rama al remoto: `git push -u origin feature/T-01-04-env-example` (OBLIGATORIO si existe remoto)
- [ ] 10.6 Cambiar a `develop`: `git checkout develop` y `git pull origin develop`
- [ ] 10.7 Integrar: `git merge feature/T-01-04-env-example`
- [ ] 10.8 Verificar mínimo: `npm run lint` y revisión de que `.env.example` está versionado y `.env` no
- [ ] 10.9 (Opcional) Push de `develop`: `git push origin develop`
- [ ] 10.10 Archivar change OpenSpec: `/opsx:archive t-01-04-env-example`
- [ ] 10.11 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-01-04-env-example`
