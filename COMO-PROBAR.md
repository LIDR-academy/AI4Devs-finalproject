# Cómo probar el proyecto SIGQ

Guía paso a paso para levantar el entorno y probar las funcionalidades principales.

---

## 1. Requisitos

- **Node.js** 18+
- **PostgreSQL** 15+ (por ejemplo con Docker)
- **npm** 9+

Opcional: Redis y Keycloak si usas autenticación completa (ver backend). Para desarrollo rápido se puede usar el **login de desarrollo** del backend.

---

## 2. Base de datos

### Con Docker (recomendado)

```bash
cd docker
docker compose up -d postgres
# Esperar unos segundos a que PostgreSQL arranque
```

Variables por defecto: `sigq_user` / `sigq_password_change_in_prod` / `sigq_db` en `localhost:5432`.

### Sin Docker

Crea una base PostgreSQL y un usuario con acceso a una base `sigq_db`. Configura en el `.env` del backend (ver más abajo).

---

## 3. Backend

```bash
cd backend

# Instalar dependencias (si no lo has hecho)
npm install

# Variables de entorno
# Crea backend/.env con al menos (o usa los valores por defecto):
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_USER=sigq_user
# POSTGRES_PASSWORD=sigq_password_change_in_prod
# POSTGRES_DB=sigq_db

# Crear tablas (migraciones, en este orden automático):
# 1) HCE  2) Planning  3) Checklists  4) Resources  5) Notifications  6) Followup  7) Documentations
# Son idempotentes: si las tablas ya existen (p. ej. por synchronize), no fallan.
npm run migration:run
# Esquema detallado de tablas y columnas: docs/database-schema.md

# Rollback (deshacer migraciones): ejecutar desde backend/
# Cada "migration:revert" deshace la ÚLTIMA migración aplicada (en orden inverso al de ejecución).
# Orden recomendado si quieres deshacer todas: 7→6→5→4→3→2→1 (Documentations, Followup, Notifications, Resources, Checklists, Planning, HCE).
# npm run migration:revert   # repetir por cada migración que quieras deshacer
# Ver más: docs/database-schema.md § Rollback de migraciones.

# Cargar datos de prueba (pacientes, quirófanos, cirugías, evolución, plan de alta)
npm run seed

# Si ya tenías datos y quieres resetear y volver a cargar:
# npm run seed -- --force

# Arrancar el servidor
npm run start:dev
```

El backend quedará en **http://localhost:3000**.  
Documentación API: **http://localhost:3000/api/docs** (Swagger).

---

## 4. Frontend

En otra terminal:

```bash
cd frontend

npm install
npm run dev
```

La app se abre en **http://localhost:5173**.

---

## 5. Login (modo desarrollo)

El backend tiene un **login de desarrollo** que no requiere Keycloak:

- **Email:** `test@example.com`
- **Contraseña:** `test123`

En la pantalla de login del frontend introduce esas credenciales. Deberías entrar al dashboard.

---

## 6. Qué probar (flujos principales)

### Pacientes (HCE)

1. Menú **Pacientes** → lista de pacientes (verás los 2 del seed: María García, Juan Martínez).
2. Crear nuevo paciente, buscar, abrir detalle y editar.

### Planificación y cirugías

1. Menú **Planificación** (o **Cirugías**).
2. Ver lista de cirugías (las 2 del seed: Colecistectomía, Herniorrafia).
3. Entrar a una cirugía → ver detalle, checklist, botones **Documentación** y **Seguimiento / Alta**.
4. Las cirugías del seed tienen **hora de inicio y fin** (mañana 09:00–11:00 y dentro de 7 días 10:00–12:00) para que aparezcan en el **Calendario de quirófanos** con franjas horarias.

### Checklist quirúrgico

1. Desde **Planificación** → **Checklists** o desde el detalle de una cirugía.
2. Abrir un checklist y completar fases (pre-inducción, pre-incisión, post-procedimiento).

### Documentación intraoperatoria (y dictado por voz)

1. En el detalle de una cirugía, pulsar **Documentación**.
2. Comprobar pestañas Preoperatorio / Intraoperatorio / Postoperatorio.
3. Escribir en las notas y ver el indicador de “Guardado” y estado de conexión.
4. **Dictado por voz:** pulsar **Dictar** (si el navegador soporta Web Speech API, p. ej. Chrome). Hablar y comprobar que el texto se inserta. Pulsar **Detener** para parar.

### Seguimiento y plan de alta

1. En el detalle de una cirugía, pulsar **Seguimiento / Alta**.
2. **Evoluciones:** pestaña “Evolución diaria” → añadir evolución (fecha, notas) y guardar.
3. **Plan de alta:** pestaña “Plan de alta”:
   - Crear plan: rellenar resumen e instrucciones y **Guardar plan de alta**, o usar **Generar plan de alta**.
   - Editar y guardar de nuevo.
   - **Descargar PDF**: comprobar que se descarga y abre bien.
   - Opcional: **Finalizar plan**.

### Quirófanos

1. Menú **Planificación** → **Quirófanos** (o enlace equivalente).
2. Listar y editar quirófanos (p. ej. Q1, Q2 del seed).

---

## 7. Probar por API (Swagger)

1. Abre **http://localhost:3000/api/docs**.
2. Ejecuta **POST /api/v1/auth/login** con:
   ```json
   { "email": "test@example.com", "password": "test123" }
   ```
3. Copia el `accessToken` de la respuesta.
4. En Swagger, **Authorize** → pega: `Bearer <accessToken>`.
5. Prueba los endpoints que quieras (pacientes, cirugías, followup, documentación, etc.).

---

## 8. Tests automáticos

### Backend (unitarios, Jest)

```bash
cd backend
npm test
# Un solo módulo:
npm test -- --testPathPattern="followup"
npm test -- --testPathPattern="documentation"
npm test -- --testPathPattern="checklist"
npm test -- --testPathPattern="planning"
npm test -- --testPathPattern="notifications"
npm test -- --testPathPattern="resources"
```

### Frontend (unitarios, Vitest)

```bash
cd frontend
npm test
# Un solo archivo:
npm test -- --run src/services/planning.service.spec.ts
```

### E2E (Playwright)

**Siempre ejecutar desde `frontend/`** (no desde la raíz del repo):

```bash
cd frontend
npm run test:e2e
# Solo planning/checklist (más rápido, un navegador):
npm run test:e2e:planning
# Un archivo concreto:
npm run test:e2e -- e2e/planning-checklist.spec.ts
```

Requisito: **backend y frontend en marcha** (o Playwright arranca el frontend con `webServer`; los tests que llaman al API necesitan backend en `http://localhost:3000`). Login de prueba: `test@example.com` / `test123`.

Si el comando "no hace nada" o falla al arrancar el servidor: en otra terminal ejecuta `npm run dev` dentro de `frontend/` y vuelve a lanzar los E2E; Playwright reutilizará el servidor. Verás progreso en consola (reporter `list`).

Archivos E2E: `auth.spec.ts`, `navigation.spec.ts`, `patients.spec.ts`, `planning-checklist.spec.ts` (flujo Planificación → Cirugía → Checklist WHO), `calendar.spec.ts` (calendario de quirófanos).

---

## Resumen de URLs

| Qué        | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:5173      |
| Backend   | http://localhost:3000     |
| Swagger   | http://localhost:3000/api/docs |
| Login dev | test@example.com / test123 |

Si algo falla, revisa que PostgreSQL esté levantado, que las migraciones se hayan ejecutado y que el seed se haya corrido al menos una vez.
