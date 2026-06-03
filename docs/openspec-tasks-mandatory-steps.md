---
description: Aplicar los pasos obligatorios de openspec/config.yaml al crear artefactos tasks.md y garantizar que el agente ejecute todas las pruebas manuales
alwaysApply: true
---

# OpenSpec Tasks: aplicación de pasos obligatorios

Al crear o actualizar artefactos `tasks.md` en cambios de OpenSpec, DEBES:

## 1. Leer openspec/config.yaml primero

**ANTES** de crear o actualizar cualquier archivo `tasks.md`, DEBES leer `openspec/config.yaml` para comprender:
- Pasos obligatorios específicos de backend y frontend
- Flujo Git: rama principal `develop`, ramas `feature/[ticket-id]-[ticket-name]`, **sin commits durante apply**, commit único al archivar (cuando el usuario acepta), **push de la rama feature al remoto**, merge a `develop` al archivar
- Requisitos de estructura de tareas
- Requisitos de pruebas y documentación

## 2. Pasos obligatorios

Todas las tareas de implementación DEBEN incluir estos pasos en el orden correcto:

### Paso 0: Crear rama de feature desde `develop` (DEBE SER EL PRIMERO)

- **Ubicación**: Debe ser el primer paso (Paso 0)
- **Rama principal del repositorio**: `develop` (todas las ramas de trabajo parten de aquí)
- **Cuándo crear la rama**: Al decidir aplicar cualquier cambio en el código (`/opsx:apply`, skill `openspec-apply-change` o implementación manual de `tasks.md`)
- **Nomenclatura de rama**: `feature/[ticket-id]-[ticket-name]`
  - `[ticket-id]`: identificador del ticket de desarrollo asociado al change (p. ej. `T-13-01`, `US-13`)
  - `[ticket-name]`: nombre corto del ticket en kebab-case (minúsculas, guiones, sin espacios ni caracteres especiales)
  - Ejemplo: `feature/T-13-01-habit-domain-types`
- **Validación previa (obligatoria)**: Antes de crear la rama, comprobar que **no existe** local ni remotamente:
  ```bash
  git fetch origin develop
  git branch --list "feature/[ticket-id]-[ticket-name]"
  git branch -r --list "origin/feature/[ticket-id]-[ticket-name]"
  ```
  Si la rama ya existe, **no** crear otra con el mismo nombre: cambiar a esa rama si corresponde al mismo trabajo, o acordar con el usuario un sufijo distinto.
- **Acción**:
  1. Actualizar `develop`: `git checkout develop` y `git pull origin develop` (si hay remoto)
  2. Crear y cambiar a la rama: `git checkout -b feature/[ticket-id]-[ticket-name]`
  3. Confirmar rama activa: `git branch --show-current`
- **Alcance**: **Todos** los cambios de código del change de OpenSpec deben realizarse **únicamente** en esta rama de feature, nunca directamente en `develop`

### Política de commits: solo al archivar (NO durante apply)

- **Durante `/opsx:apply` (implementación)**: el agente **NO debe ejecutar `git commit`**. Los cambios permanecen en el working tree de la rama de feature para que el usuario los revise.
- **Durante `/opsx:archive` (cierre)**: tras confirmar que el usuario acepta los cambios y que las pruebas obligatorias pasaron, hacer **un commit único** en la rama de feature con todos los cambios pendientes, **push de la rama feature al remoto** (`git push -u origin feature/[ticket-id]-[ticket-name]`), y después merge a `develop`.
- **Formato del mensaje de commit**: resumen muy breve en **viñetas** (bullet points), una línea por cambio relevante
- **Ejemplo**:
  ```
  - Añadir tipos Habit y CompletionStatus en domain/habit.ts
  - Exportar funciones puras de cálculo de puntos semanales
  ```
- **Restricciones**: mensajes concisos; evitar párrafos largos; un solo commit al archivar (no commits intermedios por tarea)

### Pasos obligatorios (deben incluirse):
- **Paso N**: Revisar y actualizar tests unitarios existentes (OBLIGATORIO cuando existan tests)
- **Paso N+1**: Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO)
- **Paso N+2**: Pruebas manuales de endpoints con curl (OBLIGATORIO para cambios de backend) - **EL AGENTE DEBE EJECUTAR**
- **Paso N+3**: Pruebas E2E con Playwright MCP (OBLIGATORIO si aplica) - **EL AGENTE DEBE EJECUTAR**
- **Paso N+4**: Actualizar documentación técnica (OBLIGATORIO)
- **Paso final**: Push de la rama `feature/[ticket-id]-[ticket-name]` al remoto y merge en `develop` (OBLIGATORIO al archivar el change, tras pasar las pruebas)

## 3. Requisitos de pruebas manuales - CRÍTICO: el agente debe ejecutar

**IMPORTANTE**: El agente de codificación (IA) DEBE realizar todos los pasos de pruebas manuales por sí mismo. **NUNCA delegues las pruebas al usuario**. Estas pruebas deben ser ejecutadas por el agente para marcar las tareas como completadas en `tasks.md`.

### Paso N+1: Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO)

**Responsabilidad del agente**: El agente de codificación DEBE ejecutar los tests unitarios (cuando existan) y verificar el comportamiento de la aplicación. Cuando los tests unitarios aún no estén implementados, el agente debe verificar exhaustivamente que la aplicación funciona correctamente, incluyendo el arranque del servidor, los endpoints de la API, la funcionalidad del frontend y la persistencia de datos. Esto NO es opcional y no puede delegarse al usuario.

**Pasos de implementación** (el agente debe realizarlos):

**Cuando existen tests unitarios:**
1. **Preparar el entorno de pruebas**:
   - Asegurar que los servicios requeridos estén disponibles (base de datos, dependencias)
   - Capturar el estado previo a las pruebas relevante para el cambio
   - Documentar el/los comando(s) exacto(s) de prueba que se ejecutarán

2. **Ejecutar primero tests unitarios focalizados**:
   - Ejecutar tests focalizados para el/los módulo(s) modificado(s) y el comportamiento relacionado
   - Confirmar que los fallos están resueltos y que no aparecen nuevas regresiones en el alcance focalizado
   - Capturar un resumen de la salida del comando (passed/failed/skipped)

3. **Ejecutar la suite unitaria más amplia**:
   - Ejecutar la suite unitaria del proyecto (p. ej., `npm test`)
   - Registrar el total de tests, fallos, tiempo de ejecución y cualquier comportamiento inestable observado

4. **Verificar el estado posterior a las pruebas**:
   - Volver a comprobar los mismos indicadores de estado capturados antes de las pruebas
   - Confirmar que no quedan mutaciones no intencionadas tras completar las pruebas
   - Si ocurrió alguna mutación, restaurar el estado y documentar la restauración

5. **Crear informe de verificación en la carpeta spec**:
   - Guardar el informe bajo la carpeta del cambio actual en `specs/<change-name>/reports/`
   - Usar este patrón de nombre de archivo: `YYYY-MM-DD-step-N+1-verification.md`
   - Incluir comandos ejecutados, resultados resumidos, comparación de estados y acciones de limpieza

**Cuando los tests unitarios AÚN NO existen (estado actual de ConRutina):**
1. **Verificar el arranque del servidor backend**:
   - Iniciar la API backend: `npm run dev:api`
   - Verificar que el servidor arranca sin errores
   - Verificar que la conexión a la base de datos es exitosa
   - Revisar la consola por errores o advertencias de arranque

2. **Verificar el arranque del servidor frontend**:
   - Iniciar el frontend: `npm run dev`
   - Verificar que el servidor de desarrollo Vite arranca sin errores
   - Revisar la consola por errores de compilación
   - Verificar que no hay errores de TypeScript

3. **Verificar la funcionalidad básica de la aplicación**:
   - Abrir el navegador en `http://localhost:5173`
   - Verificar que la aplicación carga sin errores
   - Revisar la consola del navegador por errores de JavaScript
   - Verificar que la tarjeta de perfil de usuario carga (conexión API funcionando)
   - Verificar que hábitos y recompensas se muestran correctamente
   - Probar interacciones básicas (alternar hábito, acciones de añadir/eliminar)

4. **Verificar persistencia de datos (si aplica)**:
   - Para cambios en base de datos: verificar que los datos se persisten correctamente
   - Para cambios en API: verificar que los endpoints devuelven los datos esperados
   - Para cambios en frontend: verificar que la gestión de estado funciona correctamente

5. **Crear informe de verificación en la carpeta spec**:
   - Guardar el informe bajo la carpeta del cambio actual en `specs/<change-name>/reports/`
   - Usar este patrón de nombre de archivo: `YYYY-MM-DD-step-N+1-verification.md`
   - Incluir pasos de verificación realizados, observaciones y cualquier problema encontrado

6. **Marcar la tarea como completada**: Solo después de que la verificación pase y el informe esté creado, marcar el Paso N+1 como completado en `tasks.md`.

**Plantilla de informe** (guardar en `specs/<change-name>/reports/`):
```markdown
# Informe Paso N+1 - Verificación

- Fecha: YYYY-MM-DD
- Cambio: <change-name>
- Agente: <agent-name>

## Tipo de verificación
- [ ] Tests unitarios (cuando estén implementados)
- [x] Verificación manual de la aplicación (enfoque actual de ConRutina)

## Pasos de verificación realizados

### Verificación backend
- Arranque del servidor backend: PASS/FAIL
- Conexión a base de datos: PASS/FAIL
- Errores en consola: NINGUNO / <listar errores>
- Endpoints API accesibles: PASS/FAIL

### Verificación frontend
- Arranque del servidor frontend: PASS/FAIL
- Compilación Vite: PASS/FAIL
- Errores TypeScript: NINGUNO / <listar errores>
- Errores en consola del navegador: NINGUNO / <listar errores>

### Funcionalidad de la aplicación
- La aplicación carga: PASS/FAIL
- El perfil de usuario se muestra: PASS/FAIL (API funcionando)
- Los hábitos se muestran: PASS/FAIL
- Las recompensas se muestran: PASS/FAIL
- Las interacciones de usuario funcionan: PASS/FAIL

### Persistencia de datos (si aplica)
- Cambios en base de datos verificados: PASS/FAIL/N/A
- Respuestas API correctas: PASS/FAIL/N/A
- Gestión de estado funcionando: PASS/FAIL/N/A

## Observaciones
<Cualquier nota, advertencia o problema observado>

## Resultado
- Estado del Paso N+1: PASS/FAIL
- Problemas bloqueantes: <ninguno o listar>
```

**Dependencias**:
- Node.js y npm instalados
- PostgreSQL en ejecución (Docker o local)
- Variables de entorno configuradas (archivo .env)
- Permiso para crear archivos de informe en `specs/<change-name>/reports/`

**Notas**:
- **El agente DEBE verificar la aplicación por sí mismo** — nunca pedir al usuario que pruebe
- Este paso es obligatorio incluso cuando los cambios de código parecen pequeños
- Cuando se implementen tests unitarios (Vitest), actualizar este paso para ejecutarlos
- La nomenclatura de informes debe seguir el patrón requerido para trazabilidad
- **La tarea en tasks.md solo puede marcarse como completada tras crear el informe**

### Paso N+2: Pruebas manuales de endpoints con curl (OBLIGATORIO para cambios de backend)

**Responsabilidad del agente**: El agente de codificación DEBE ejecutar todos los comandos curl y verificar las respuestas para cambios en la API backend. Esto NO es opcional y no puede delegarse al usuario.

**Cuándo aplica**:
- Cualquier cambio en endpoints de la API backend
- Nuevos endpoints de API añadidos
- Modificaciones en endpoints existentes
- Cambios en el formato de request/response de la API

**Endpoints API actuales de ConRutina**:
- `GET /api/profile` - Obtener perfil de usuario (devuelve usuario con id=1)

**Pasos de implementación** (el agente debe realizarlos):

1. **Preparar el entorno de pruebas**:
   - Asegurar que el servidor backend está en ejecución: `npm run dev:api`
   - Verificar que PostgreSQL está en ejecución: `docker ps` o `npm run docker:logs`
   - Verificar que la conexión a la base de datos está activa
   - Anotar el estado actual de la base de datos (si se prueban endpoints CREATE/UPDATE/DELETE)

2. **Probar endpoints GET**:
   ```bash
   # Ejemplo: probar endpoint de perfil de usuario
   curl -X GET http://localhost:3001/api/profile
   ```
   - Verificar código de estado de la respuesta (200, 404, etc.)
   - Verificar estructura y contenido del cuerpo de la respuesta
   - Documentar el comando curl y la respuesta

3. **Probar endpoints POST** (operaciones CREATE — cuando estén implementados):
   ```bash
   curl -X POST http://localhost:3001/api/habits \
     -H "Content-Type: application/json" \
     -d '{"emoji":"💪","name":"Exercise","pointsPerDay":10,"penalty":5}'
   ```
   - Ejecutar el comando curl y capturar la respuesta
   - Verificar código de estado de la respuesta (201, 400, 422, etc.)
   - Verificar que el cuerpo de la respuesta contiene el recurso creado
   - **Restaurar estado de la base de datos**: Eliminar el registro creado para restaurar la base de datos
   - Documentar el comando curl, la respuesta y la acción de limpieza

4. **Probar endpoints PUT/PATCH** (operaciones UPDATE — cuando estén implementados):
   ```bash
   curl -X PUT http://localhost:3001/api/habits/123 \
     -H "Content-Type: application/json" \
     -d '{"name":"Updated name"}'
   ```
   - Ejecutar el comando curl y capturar la respuesta
   - Verificar código de estado de la respuesta (200, 404, 400, etc.)
   - Verificar que el cuerpo de la respuesta contiene el recurso actualizado
   - **Restaurar estado de la base de datos**: Revertir el registro actualizado a los valores originales
   - Documentar el comando curl, la respuesta y la acción de limpieza

5. **Probar endpoints DELETE** (cuando estén implementados):
   ```bash
   curl -X DELETE http://localhost:3001/api/habits/123
   ```
   - Ejecutar el comando curl y capturar la respuesta
   - Verificar código de estado de la respuesta (200, 204, 404, etc.)
   - Verificar que la eliminación fue exitosa
   - **Restaurar estado de la base de datos**: Recrear el registro eliminado con los valores originales
   - Documentar el comando curl, la respuesta y la acción de limpieza

6. **Probar casos de error**:
   - Probar con datos inválidos (errores de validación)
   - Probar con recursos inexistentes (errores 404)
   - Probar con JSON malformado
   - Verificar que el formato de respuesta de error coincide con la especificación de la API

7. **Crear informe de pruebas de endpoints**:
   - Guardar el informe en `specs/<change-name>/reports/`
   - Usar nombre de archivo: `YYYY-MM-DD-step-N+2-endpoint-testing.md`
   - Incluir todos los comandos curl, respuestas y observaciones

8. **Marcar la tarea como completada**: Solo después de que todas las pruebas curl pasen y el estado de la base de datos esté restaurado, marcar la tarea como completada en `tasks.md`

**Plantilla de informe** (guardar en `specs/<change-name>/reports/`):
```markdown
# Informe Paso N+2 - Pruebas manuales de endpoints

- Fecha: YYYY-MM-DD
- Cambio: <change-name>
- Agente: <agent-name>
- URL Backend: http://localhost:3001

## Endpoints probados

### GET /api/profile
```bash
curl -X GET http://localhost:3001/api/profile
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Código de estado:** 200 OK
**Verificación:** PASS - Datos de perfil devueltos correctamente

### [Otros endpoints según aplique]

## Pruebas de casos de error

### Usuario inexistente
```bash
curl -X GET http://localhost:3001/api/profile
# (después de eliminar usuario con id=1)
```

**Respuesta:**
```json
{
  "error": "Usuario con id 1 no encontrado"
}
```

**Código de estado:** 404 Not Found
**Verificación:** PASS - El manejo de errores funciona correctamente

## Gestión del estado de la base de datos
- Estado previo a pruebas: <descripción>
- Estado posterior a pruebas: <descripción>
- Estado restaurado: Sí/No
- Acciones de restauración: <si las hubiera>

## Observaciones
<Cualquier nota, problema o advertencia>

## Resultado
- Estado del Paso N+2: PASS/FAIL
- Todos los endpoints probados: Sí/No
- Base de datos restaurada: Sí/No/N/A
- Problemas bloqueantes: <ninguno o listar>
```

**Dependencias**:
- Servidor backend en ejecución (`npm run dev:api`)
- PostgreSQL accesible
- Herramienta de línea de comandos curl
- Acceso a base de datos para restauración de estado

**Notas**:
- **El agente DEBE ejecutar todos los comandos curl por sí mismo** — nunca pedir al usuario
- Todas las operaciones CREATE/UPDATE/DELETE deben restaurar la base de datos al estado original
- Documentar todos los comandos curl y respuestas en el informe
- Verificar que el estado de la base de datos coincide con el estado previo a las pruebas tras la limpieza
- Este paso es OBLIGATORIO para todos los cambios en la API backend
- **La tarea en tasks.md solo puede marcarse como completada tras la ejecución exitosa y la creación del informe**

### Paso N+3: Pruebas E2E con Playwright MCP (OBLIGATORIO si aplica)

**Responsabilidad del agente**: El agente de codificación DEBE ejecutar todas las pruebas E2E usando las herramientas Playwright MCP. Esto NO es opcional y no puede delegarse al usuario.

**Cuándo aplica**:
- Cambios en frontend que afectan flujos de usuario
- Integración entre frontend y endpoints backend
- Funcionalidades orientadas al usuario que requieren interacción en navegador

**Pasos de implementación** (el agente debe realizarlos):
1. **Preparar el entorno de pruebas**:
   - Asegurar que los servidores frontend y backend están en ejecución (iniciarlos si es necesario)
   - Verificar que la base de datos está en un estado conocido
   - Comprobar las herramientas Playwright MCP disponibles usando el sistema de archivos MCP

2. **Navegar a la aplicación**:
   - Usar Playwright MCP `browser_navigate` para abrir la URL de la aplicación
   - Esperar a que la página cargue completamente
   - Tomar una captura (snapshot) para verificar el estado inicial

3. **Ejecutar flujos de usuario**:
   - Usar herramientas Playwright MCP para interactuar con la UI:
     - `browser_click` para clics en botones y navegación
     - `browser_type` o `browser_fill` para entradas en formularios
     - `browser_snapshot` para verificar cambios de estado
     - `browser_wait` para operaciones asíncronas
   - Probar el flujo de usuario completo de principio a fin
   - Verificar los resultados esperados en cada paso

4. **Probar escenarios de error**:
   - Probar errores de validación de formularios
   - Probar que los mensajes de error se muestran correctamente
   - Probar flujos de recuperación ante errores

5. **Verificar persistencia de datos**:
   - Tras crear/actualizar datos a través de la UI, verificar que se persisten correctamente
   - Comprobar que el estado de la base de datos coincide con el estado de la UI
   - Verificar que los datos aparecen correctamente en listas/vistas de detalle

6. **Restaurar el entorno de pruebas**:
   - Limpiar cualquier dato de prueba creado durante las pruebas E2E
   - Restaurar la base de datos al estado original
   - Cerrar sesiones del navegador

7. **Marcar la tarea como completada**: Solo después de que todas las pruebas E2E pasen y el entorno esté restaurado, marcar la tarea como completada en `tasks.md`

**Dependencias**:
- Servidor frontend en ejecución (el agente debe iniciarlo si es necesario)
- Servidor backend en ejecución (el agente debe iniciarlo si es necesario)
- Herramientas Playwright MCP disponibles
- Acceso a base de datos para verificación y limpieza

**Notas**:
- **El agente DEBE ejecutar todas las pruebas E2E por sí mismo** — nunca pedir al usuario que ejecute tests
- Usar esperas incrementales (1-3 segundos) con comprobaciones de snapshot en lugar de esperas largas
- Restaurar siempre el estado de la base de datos tras tests que modifiquen datos
- Documentar escenarios de prueba y resultados en un informe en la carpeta spec con la nomenclatura adecuada
- **La tarea en tasks.md solo puede marcarse como completada tras la ejecución exitosa de todas las pruebas E2E**

## 4. Lista de verificación

Antes de finalizar cualquier archivo `tasks.md`, verificar:
- [ ] El Paso 0 (Crear rama de feature desde `develop`) es el PRIMER paso
- [ ] El Paso 0 indica la rama principal `develop` y la nomenclatura `feature/[ticket-id]-[ticket-name]`
- [ ] El Paso 0 incluye validación de que la rama no existe antes de crearla
- [ ] Todos los pasos obligatorios de config.yaml están incluidos
- [ ] Los pasos están numerados secuencialmente
- [ ] Los pasos obligatorios están claramente marcados con la etiqueta "(OBLIGATORIO)" / "(MANDATORY)"
- [ ] La nomenclatura de rama sigue la convención: `feature/[ticket-id]-[ticket-name]` (p. ej. `feature/T-13-01-habit-domain-types`)
- [ ] Las tareas de implementación **no** incluyen commits intermedios (el commit es solo en el paso final de archivado)
- [ ] El paso final de cierre incluye commit único + push de la rama feature + merge a `develop` al archivar, tras aceptación del usuario
- [ ] El Paso N+1 incluye la ruta y convención de nomenclatura del informe en `specs/<change-name>/reports/`
- [ ] Los pasos de pruebas manuales indican explícitamente "EL AGENTE DEBE EJECUTAR" / "AGENT MUST EXECUTE"
- [ ] Las tareas incluyen pasos de restauración del estado de la base de datos
- [ ] El paso de pruebas E2E está incluido si hay cambios de frontend

## 5. Cuándo aplica

Esta regla aplica cuando:
- Se crea un change desde un ticket del backlog mediante `/opsx-propose-ticket` o la skill `propose-from-ticket`
- Se crea `tasks.md` mediante `/opsx:propose` o la skill `openspec-propose`
- Se crea `tasks.md` mediante `/opsx:ff` (fast-forward) o la skill `openspec-ff-change`
- Se crea `tasks.md` mediante `/opsx:continue` (continuar cambio) o la skill `openspec-continue-change`
- Se actualizan archivos `tasks.md` existentes
- Cualquier creación de tareas que implique cambios de backend
- Se implementan tareas de `tasks.md` mediante `/opsx:apply` o la skill `openspec-apply-change` — el agente debe crear la rama desde `develop`, implementar en ella **sin commits**, y ejecutar las pruebas manuales
- Se archiva un change mediante `/opsx:archive` o la skill `openspec-archive-change` — tras aceptación del usuario y pruebas OK: commit único en la rama de feature, push de la rama feature al remoto, merge contra `develop`, archivado OpenSpec y **intento** de marcar el ticket como ✅ Implementado en `docs/product-backlog.md` (`npm run openspec:mark-ticket`; si falla, el archivado sigue siendo válido)

## 6. Estructura de ejemplo

```markdown
## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO - PRIMER PASO)

- [ ] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [ ] 0.2 Comprobar que no existe la rama `feature/T-13-01-habit-domain-types` (local ni `origin/`)
- [ ] 0.3 Crear y cambiar a la rama: `git checkout -b feature/T-13-01-habit-domain-types`
- [ ] 0.4 Verificar rama activa con `git branch --show-current`
- [ ] 0.5 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Backend: Modelo de dominio (TDD - cuando existan tests)
...

## 8. Backend: Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)
- [ ] 8.1 Revisar archivos de test existentes para los módulos afectados
- [ ] 8.2 Actualizar tests para cubrir la nueva funcionalidad
- [ ] 8.3 Asegurar cobertura de tests para casos límite
...

## 9. Backend: Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO)

**Cuando existen tests unitarios:**
- [ ] 9.1 Capturar estado previo a pruebas para entidades impactadas
- [ ] 9.2 Ejecutar tests unitarios focalizados para módulos modificados
- [ ] 9.3 Ejecutar la suite unitaria más amplia requerida por config
- [ ] 9.4 Verificar estado posterior a pruebas y restaurar si es necesario
- [ ] 9.5 Crear informe `specs/<change-name>/reports/YYYY-MM-DD-step-09-verification.md`
- [ ] 9.6 Marcar paso completado solo tras pasar tests y existir el informe

**Cuando los tests unitarios NO existen (estado actual de ConRutina):**
- [ ] 9.1 Iniciar servidor backend: `npm run dev:api`
- [ ] 9.2 Verificar que el servidor arranca sin errores y la base de datos conecta
- [ ] 9.3 Iniciar servidor frontend: `npm run dev`
- [ ] 9.4 Verificar que Vite compila sin errores de TypeScript
- [ ] 9.5 Abrir navegador en http://localhost:5173
- [ ] 9.6 Verificar que la aplicación carga sin errores
- [ ] 9.7 Probar que la tarjeta de perfil de usuario carga (conexión API funcionando)
- [ ] 9.8 Probar que hábitos y recompensas se muestran correctamente
- [ ] 9.9 Probar interacciones básicas (toggle, add, delete)
- [ ] 9.10 Verificar persistencia de datos si aplica
- [ ] 9.11 Crear informe `specs/<change-name>/reports/YYYY-MM-DD-step-09-verification.md`
- [ ] 9.12 Marcar paso completado solo tras pasar la verificación y existir el informe

## 10. Backend: Pruebas manuales de endpoints con curl (OBLIGATORIO para cambios de backend - EL AGENTE DEBE EJECUTAR)
- [ ] 10.1 Asegurar que el servidor backend está en ejecución: `npm run dev:api`
- [ ] 10.2 Verificar que PostgreSQL está en ejecución: `docker ps`
- [ ] 10.3 Probar GET /api/profile con curl y verificar respuesta
- [ ] 10.4 Probar endpoints nuevos/modificados con curl
- [ ] 10.5 Probar endpoints POST (si los hay), verificar creación y restaurar estado de base de datos
- [ ] 10.6 Probar endpoints PUT/PATCH (si los hay), verificar actualizaciones y restaurar estado de base de datos
- [ ] 10.7 Probar endpoints DELETE (si los hay), verificar eliminación y restaurar estado de base de datos
- [ ] 10.8 Probar casos de error (errores de validación, 404, JSON malformado)
- [ ] 10.9 Crear informe `specs/<change-name>/reports/YYYY-MM-DD-step-10-endpoint-testing.md`
- [ ] 10.10 Documentar todos los comandos curl y respuestas
- [ ] 10.11 Verificar que el estado de la base de datos coincide con el estado previo a pruebas
- [ ] 10.12 Marcar paso completado solo tras pasar todas las pruebas y existir el informe

## 11. Frontend: Pruebas E2E con Playwright MCP (OBLIGATORIO si hay cambios de frontend - EL AGENTE DEBE EJECUTAR)
- [ ] 11.1 Asegurar que los servidores frontend y backend están en ejecución
- [ ] 11.2 Navegar a la aplicación usando Playwright MCP browser_navigate
- [ ] 11.3 Ejecutar flujo de usuario completo usando herramientas Playwright MCP
- [ ] 11.4 Probar escenarios de error y validación
- [ ] 11.5 Verificar persistencia de datos y estado de la UI
- [ ] 11.6 Restaurar entorno de pruebas y estado de la base de datos
- [ ] 11.7 Crear informe `specs/<change-name>/reports/YYYY-MM-DD-step-11-e2e-testing.md`
- [ ] 11.8 Documentar escenarios de prueba y resultados
- [ ] 11.9 Marcar paso completado solo tras pasar pruebas E2E y existir el informe

## 16. Actualizar documentación técnica (OBLIGATORIO)
- [ ] 16.1 Actualizar docs/api-spec.yml si cambiaron endpoints de API
- [ ] 16.2 Actualizar docs/data-model.md si cambió el esquema de base de datos
- [ ] 16.3 Actualizar docs/backend-standards.md si cambiaron patrones de backend
- [ ] 16.4 Actualizar docs/frontend-standards.md si cambiaron patrones de frontend
- [ ] 16.5 Actualizar docs/development_guide.md si cambió setup/flujo de trabajo
- [ ] 16.6 Actualizar README.md si hay cambios orientados al usuario
- [ ] 16.7 Verificar que toda la documentación es consistente y está actualizada

## 17. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo**: Al archivar el change con OpenSpec (`/opsx:archive`, skill `openspec-archive-change`) **después** de que todos los pasos de prueba obligatorios hayan pasado (Paso N+1, N+2, N+3 según aplique) **y el usuario haya aceptado los cambios**.

**IMPORTANTE**: No ejecutar `git commit` durante `/opsx:apply`. Los commits ocurren **solo** en este paso de cierre.

- [ ] 17.1 Confirmar que no quedan tareas de implementación pendientes en `tasks.md`
- [ ] 17.2 Confirmar que los informes de verificación/pruebas están creados y en estado PASS
- [ ] 17.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 17.4 Hacer **commit único** en la rama de feature con todos los cambios pendientes (mensaje en viñetas breves)
- [ ] 17.5 Subir la rama de feature al remoto: `git push -u origin feature/T-13-01-habit-domain-types` (OBLIGATORIO si existe remoto; conserva el histórico de ramas en GitHub)
- [ ] 17.6 Cambiar a `develop` y actualizarla: `git checkout develop` y `git pull origin develop`
- [ ] 17.7 Integrar la rama de feature: `git merge feature/T-13-01-habit-domain-types` (resolver conflictos si los hay)
- [ ] 17.8 Verificar que `develop` compila y pasa las comprobaciones mínimas acordadas en el change
- [ ] 17.9 (Opcional) Push de `develop` al remoto si el flujo del equipo lo requiere: `git push origin develop`
- [ ] 17.10 Proceder con el archivado OpenSpec del change (`mv` a `openspec/changes/archive/YYYY-MM-DD-<name>/`)
- [ ] 17.11 Intentar marcar el ticket en `docs/product-backlog.md` como **✅ Implementado** (último paso tras archivar; **no bloqueante**):
  ```bash
  npm run openspec:mark-ticket -- --change <change-name>
  ```
  Si tiene éxito, verificar que `**Estado en código:**` del ticket `T-XX-YY` (sección 4) quedó en `✅ Implementado`. Si falla, **no** impedir el cierre del change: documentar el error y corregir el backlog manualmente o re-ejecutar el script después.
```

## 7. Requisitos de ejecución del agente

**CRÍTICO**: Al implementar tareas de `tasks.md` (mediante la skill `openspec-apply-change` o el comando `/opsx:apply`), el agente de codificación DEBE:

0. **Gestionar ramas correctamente (sin commits durante apply)**:
   - Usar `develop` como rama base; nunca implementar cambios de código directamente en `develop`
   - Crear la rama `feature/[ticket-id]-[ticket-name]` desde `develop` **antes** del primer cambio de código (Paso 0)
   - Validar que la rama no existe antes de crearla
   - Realizar **todo** el código del change en la rama de feature
   - **NO ejecutar `git commit` durante la implementación** — los cambios quedan sin commitear para revisión del usuario
   - El commit único (mensaje en viñetas breves) se hace **solo al archivar**, tras aceptación del usuario

1. **Ejecutar todas las pruebas manuales**: Nunca pedir al usuario que ejecute comandos curl o pruebas E2E. El agente debe:
   - Iniciar servidores si es necesario (backend, frontend)
   - Ejecutar todos los comandos curl para pruebas de endpoints
   - Ejecutar todas las pruebas E2E usando herramientas Playwright MCP
   - Verificar todas las respuestas y resultados
   - Restaurar el estado de la base de datos tras las pruebas

2. **Marcar tareas como completadas**: Las tareas SOLO pueden marcarse como completadas (`[x]`) en `tasks.md` DESPUÉS de:
   - Que el agente haya ejecutado con éxito todas las pruebas requeridas
   - Que todos los resultados de las pruebas hayan sido verificados
   - Que el estado de la base de datos haya sido restaurado (para operaciones CREATE/UPDATE/DELETE)
   - Que todos los resultados de las pruebas hayan sido documentados

3. **Nunca delegar las pruebas**: El agente nunca debe:
   - Pedir al usuario que ejecute comandos curl
   - Pedir al usuario que pruebe endpoints manualmente
   - Pedir al usuario que ejecute pruebas E2E
   - Marcar tareas como completadas sin ejecutar las pruebas
   - Omitir pasos de pruebas manuales

4. **Documentar la ejecución de pruebas**: El agente debe documentar:
   - Todos los comandos curl ejecutados
   - Todas las respuestas recibidas
   - Todos los escenarios de prueba E2E ejecutados
   - Acciones de restauración del estado de la base de datos
   - Cualquier problema encontrado y su resolución

**CRÍTICO — al archivar el change**: Tras completar implementación y pruebas obligatorias, y **cuando el usuario acepte los cambios**, el agente (o quien archive) DEBE: (1) hacer commit único en la rama de feature, (2) **push de la rama feature al remoto** antes del merge, (3) integrar la rama en `develop`, (4) archivar el change OpenSpec (`mv` a `archive/`), y (5) como **último paso** intentar marcar el ticket en `docs/product-backlog.md` con `npm run openspec:mark-ticket -- --change <name>`. No archivar dejando el código solo en la rama de feature sin merge ni sin push remoto, ni hacer commits durante apply. Si el paso (5) falla, el change se considera **terminado** igualmente; registrar la advertencia y corregir el backlog aparte.

### Flujo Git resumido

```mermaid
flowchart LR
  develop["develop\n(rama principal)"]
  feature["feature/[ticket-id]-[ticket-name]"]
  apply["/opsx:apply\nImplementación sin commits"]
  review["Usuario revisa\ny acepta cambios"]
  tests["Pruebas obligatorias\nPASS"]
  gitClose["commit + push feature + merge"]
  specArchive["mv change → archive/"]
  backlog["openspec:mark-ticket\n✅ en product-backlog.md"]

  develop --> feature
  feature --> apply
  apply --> tests
  tests --> review
  review --> gitClose
  gitClose --> specArchive
  specArchive --> backlog
```

| Fase | Rama activa | Acción |
|------|-------------|--------|
| Inicio apply | `develop` | `git pull origin develop` |
| Paso 0 | `feature/...` | Crear rama si no existe; checkout |
| Implementación | `feature/...` | Código en working tree **sin commits** |
| Revisión | `feature/...` | Usuario acepta o pide ajustes |
| Archivo (tests OK + aceptación) | `feature/...` → `develop` | Commit único + push feature + merge → `develop` |
| Archivo OpenSpec | — | Mover change a `openspec/changes/archive/` |
| Backlog | — | Intentar `npm run openspec:mark-ticket` → ✅ Implementado (fallo = advertencia, no bloquea) |

## Incumplimiento

Si creas tareas sin seguir estos pasos obligatorios, el usuario tendrá que corregir manualmente el archivo tasks.md. Lee siempre `openspec/config.yaml` primero y asegúrate de que todos los pasos obligatorios estén incluidos.

**Si implementas tareas sin ejecutar tú mismo las pruebas manuales, estás incumpliendo esta regla. El agente debe ejecutar todas las pruebas para marcar las tareas como completadas.**

**Si implementas código sin crear la rama desde `develop`, sin la nomenclatura `feature/[ticket-id]-[ticket-name]`, haces commits durante apply, o archivas el change sin commit+push de la rama feature+merge a `develop`, también estás incumpliendo esta regla.**
