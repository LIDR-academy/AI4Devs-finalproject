# ProjectScope AI

> Plataforma web para estimar proyectos de software considerando tanto el **esfuerzo humano** como el **uso de inteligencia artificial**.

---

## 📑 Tabla de contenidos

- [Descripción](#-descripción)
- [Objetivo del MVP](#-objetivo-del-mvp)
- [Problema y solución](#-problema-y-solución)
- [Usuarios objetivo](#-usuarios-objetivo)
- [Flujo E2E](#-flujo-e2e)
- [Autenticación y permisos (RBAC)](#-autenticación-y-permisos-rbac)
- [Alcance del MVP — Historias de usuario](#-alcance-del-mvp--historias-de-usuario)
- [Arquitectura](#️-arquitectura)
- [Decisiones de arquitectura](#-decisiones-de-arquitectura)
- [Trade-offs](#️-trade-offs)
- [Modelo de datos](#️-modelo-de-datos)
- [API](#-api)
- [Stack tecnológico](#-stack-tecnológico)
- [Testing](#-testing)
- [Infraestructura y despliegue](#-infraestructura-y-despliegue)
- [Estrategia de estimación de tokens](#-estrategia-de-estimación-de-tokens)
- [Uso de IA](#-uso-de-ia)
- [Limitaciones del sistema](#-limitaciones-del-sistema)
- [Supuestos y riesgos](#️-supuestos-y-riesgos)
- [Evolución futura](#-evolución-futura)
- [Tickets y trazabilidad](#-tickets-y-trazabilidad)
- [Pull Requests planificados](#-pull-requests-planificados)

---

## 📌 Descripción

**ProjectScope AI** es una plataforma web que, a partir de la descripción de un proyecto y sus casos de uso, permite:

- Priorizar funcionalidades por impacto
- Generar un roadmap con fases, hitos y entregables
- Proponer un equipo de trabajo
- Estimar horas por rol
- Estimar consumo de tokens según uso de IA
- Calcular un costo aproximado

El objetivo es ayudar a equipos técnicos y de negocio a construir estimaciones más realistas en contextos donde **la IA forma parte del proceso de desarrollo**.

---

## 🎯 Objetivo del MVP

Construir una aplicación web end-to-end que permita:

- Definir un proyecto con sus casos de uso
- Generar automáticamente un roadmap
- Estimar esfuerzo por fase
- Estimar uso de IA (tokens)
- Visualizar un reporte claro y estructurado

> El MVP prioriza **un único flujo completo con valor real**, evitando complejidad innecesaria.

---

## 🔍 Problema y solución

### Problema

Las estimaciones tradicionales de software:

| Carencia                           | Consecuencia                                |
| ---------------------------------- | ------------------------------------------- |
| No contemplan el uso de IA         | Estimaciones irreales en proyectos modernos |
| Asumen desarrollo 100% manual      | Desvíos de tiempo                           |
| No consideran costos de tokens     | Desvíos de presupuesto                      |
| Carecen de estructuración temprana | Falta de visibilidad en planificación       |

### Solución

**ProjectScope AI** combina tres dimensiones en una sola plataforma:

1. **Planificación de proyecto** — roadmap estructurado
2. **Estimación de esfuerzo humano** — por rol y fase
3. **Estimación de uso de IA** — tokens y costo asociado

El sistema permite estructurar un proyecto antes de estimarlo, generando:

- Fases claras con entregables definidos
- Estimación por rol
- Supuestos explícitos
- Riesgos identificados

---

## 👥 Usuarios objetivo

- Desarrolladores
- Tech leads
- Project managers
- Consultoras tecnológicas
- Equipos que trabajan con IA en desarrollo

---

## 🔄 Flujo E2E

### Resumen del flujo prioritario

```
Crear proyecto → Definir casos de uso → Generar roadmap → Estimar por fase → Visualizar reporte
```

### Detalle paso a paso

| Paso | Actor   | Acción                | Datos involucrados                                |
| ---- | ------- | --------------------- | ------------------------------------------------- |
| 1    | Usuario | Crea un proyecto      | Nombre, descripción                               |
| 2    | Usuario | Agrega casos de uso   | Título, descripción, prioridad                    |
| 3    | Usuario | Define parámetros     | Roles, complejidad, modelo de IA (opcional)       |
| 4    | Usuario | Ejecuta la estimación | —                                                 |
| 5    | Sistema | Procesa con IA        | Prompt estructurado → Azure OpenAI                |
| 6    | Sistema | Genera resultados     | Roadmap, esfuerzo, tokens                         |
| 7    | Usuario | Visualiza el reporte  | Fases, equipo, horas, costos, supuestos y riesgos |

---

## 🔐 Autenticación y permisos (RBAC)

El MVP incluye autenticación por token (access + refresh) y control de acceso por rol.

### Flujo de autenticación

1. El usuario inicia sesión en el frontend con `actorId` y contraseña.
2. El backend valida la contraseña contra `AUTH_LOGIN_PASSWORD`.
3. Se devuelve `accessToken` + `refreshToken` + rol resuelto (`SUPERADMIN`, `ADMIN`, `USER`).
4. El frontend envía `Authorization: Bearer <accessToken>` en requests protegidas.
5. Ante `401`, el frontend intenta `POST /auth/refresh` automáticamente.
6. `POST /auth/logout` invalida la sesión rotando versión de sesión.

### Resolución de roles

- `AUTH_SUPERADMIN_ACTOR_IDS`: lista de actor IDs con rol `SUPERADMIN`.
- `AUTH_ADMIN_ACTOR_IDS`: lista de actor IDs con rol `ADMIN`.
- Si un actor no está en esas listas, queda con rol `USER`.

### Permisos principales

| Capacidad | SUPERADMIN | ADMIN | USER |
| --- | --- | --- | --- |
| Crear proyecto (`POST /projects`) | ✅ | ✅ | ❌ |
| Listar/consultar proyectos asignados | ✅ | ✅ | ✅ |
| Agregar casos de uso en proyectos permitidos | ✅ | ✅ | ✅ |
| Ejecutar estimación en proyectos permitidos | ✅ | ✅ | ✅ |

---

## 📦 Alcance del MVP — Historias de usuario

### Must-Have

---

#### HU-01 — Crear proyecto

> Como usuario, quiero crear un proyecto con su descripción para iniciar una estimación.

**Criterios de aceptación:**

- Se puede ingresar nombre y descripción
- El proyecto se guarda correctamente

---

#### HU-02 — Cargar casos de uso

> Como usuario, quiero agregar casos de uso para contextualizar la estimación.

**Criterios de aceptación:**

- Se pueden agregar múltiples casos de uso
- Cada caso tiene título, descripción y prioridad

---

#### HU-03 — Seleccionar roles

> Como usuario, quiero indicar qué roles participan para obtener estimación por perfil.

**Criterios de aceptación:**

- Se puede seleccionar al menos un rol
- Los roles se envían al backend correctamente

---

#### HU-04 — Generar roadmap y estimación

> Como usuario, quiero generar una estimación asistida por IA para obtener fases, horas y consumo de IA.

**Criterios de aceptación:**

- Se genera el roadmap
- Se estiman las horas por rol y fase
- Se estiman los tokens consumidos

---

#### HU-05 — Visualizar reporte

> Como usuario, quiero ver un reporte estructurado para entender el resultado.

**Criterios de aceptación:**

- Se muestran las fases del roadmap
- Se muestran los roles y sus horas
- Se muestran los costos estimados
- Se muestran los supuestos del proyecto

---

### ⭐ Should-Have

#### SH-01 — Recalcular estimación

Permite modificar datos y volver a estimar sin crear un proyecto nuevo.

#### SH-02 — Selección de modelo IA

Permite elegir el modelo de IA para ajustar la estimación de tokens y costos.

---

## 🏗️ Arquitectura

```mermaid
graph TD
    subgraph Frontend["🖥️ Frontend (React + Vite)"]
        F1[Formulario de proyecto]
        F2[Carga de casos de uso]
        F3[Visualización de resultados]
    end

    subgraph Backend["⚙️ Backend (Node.js + Express)"]
        B1[API REST]
        B2[Lógica de estimación]
        B3[Construcción de prompts]
        B4[Integración con IA]
    end

    subgraph DB["🗄️ Base de datos (PostgreSQL + Prisma)"]
        D1[Proyectos]
        D2[Estimaciones]
    end

    subgraph AI["🤖 IA (Azure OpenAI)"]
        A1[Generación de roadmap]
        A2[Estimación de esfuerzo]
        A3[Cálculo de tokens]
    end

    F1 & F2 & F3 --> B1
    B1 --> B2 --> B3 --> B4
    B2 --> D1 & D2
    B4 --> A1 & A2 & A3
```

### Componentes

| Capa              | Componentes                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| **Frontend**      | Formulario de proyecto, carga de casos de uso, visualización de resultados  |
| **Backend**       | API REST, lógica de estimación, construcción de prompts, integración con IA |
| **Base de datos** | Persistencia de proyectos y estimaciones                                    |
| **IA**            | Generación de roadmap, estimación de esfuerzo, cálculo de tokens            |

---

## 🧭 Decisiones de arquitectura

> Decisiones tomadas con foco en **simplicidad, velocidad de entrega y alineación con el alcance del MVP** (~30 horas de desarrollo).

---

### 1. Arquitectura cliente-servidor desacoplada

**Decisión:** frontend y backend como aplicaciones independientes, comunicadas por REST.

**Justificación:**

- Separa responsabilidades de forma clara sin añadir complejidad operacional
- Permite desarrollar y desplegar cada capa de forma independiente
- Evita la sobrecarga de soluciones como GraphQL o microservicios, innecesarias a esta escala

---

### 2. React + Vite para el frontend

**Decisión:** SPA con React y TypeScript, empaquetada con Vite.

**Justificación:**

- Vite ofrece arranque instantáneo y builds rápidos, priorizando la velocidad de desarrollo
- React permite componer la UI por componentes sin necesidad de frameworks más complejos
- TypeScript añade seguridad de tipos con coste de configuración mínimo

> **Descartado:** Next.js — el SSR/SSG no aporta valor en un MVP de estimación interna sin requisitos de SEO.

---

### 3. Express como servidor HTTP minimalista

**Decisión:** API REST construida sobre Node.js + Express.

**Justificación:**

- Express tiene una curva de entrada mínima y cero opinión sobre estructura, adecuado para un MVP acotado
- Evita la verbosidad de frameworks como NestJS, cuya potencia no se justifica en esta escala
- El equipo puede añadir capas de estructura (routers, middlewares, servicios) de forma incremental

> **Descartado:** NestJS — el scaffolding y los decoradores añaden tiempo de setup sin beneficio real en el MVP.

---

### 4. PostgreSQL + Prisma como capa de datos

**Decisión:** base de datos relacional con ORM tipado.

**Justificación:**

- El modelo de datos tiene relaciones claras (`Project → Estimation → Phase → RoleEstimate`), lo que favorece un modelo relacional sobre una base documental
- Prisma genera tipos TypeScript automáticamente a partir del schema, eliminando errores de integración entre ORM y API
- Las migraciones declarativas de Prisma simplifican la evolución del esquema durante el desarrollo

> **Descartado:** MongoDB — la flexibilidad de un esquema dinámico no compensa la pérdida de integridad referencial en este modelo.

---

### 5. Integración con Azure OpenAI mediante llamadas directas

**Decisión:** el backend construye el prompt y llama directamente a la API de Azure OpenAI. Sin colas ni procesamiento asíncrono.

**Justificación:**

- La estimación es un proceso síncrono en el MVP: el usuario espera el resultado antes de continuar
- Añadir una cola (BullMQ, RabbitMQ) introduciría complejidad operacional no justificada en esta etapa
- Si el tiempo de respuesta resulta elevado, se puede añadir feedback visual de carga sin cambiar la arquitectura

> **Deuda técnica identificada:** si el volumen crece o las respuestas superan los 30 s, migrar a procesamiento asíncrono con polling o WebSocket.

---

### 6. Prompt engineering centralizado en el backend

**Decisión:** la construcción del prompt es responsabilidad exclusiva del backend, no del frontend.

**Justificación:**

- Evita exponer la lógica del prompt al cliente (seguridad y mantenibilidad)
- Facilita iterar el prompt sin requerir cambios en el frontend
- El prompt puede evolucionar independientemente de la interfaz

---

### 7. Despliegue en plataformas gestionadas (Vercel + Render)

**Decisión:** frontend en Vercel, backend en Render.

**Justificación:**

- Ambas plataformas ofrecen CI/CD automático desde el repositorio sin configuración de infraestructura
- Eliminan la necesidad de gestionar servidores, certificados SSL o pipelines de despliegue en el MVP
- El coste en los tiers gratuitos es suficiente para validar el producto

> **Evolución prevista:** si el proyecto escala, migrar el backend a Azure App Service para colocarlo junto a Azure OpenAI y reducir latencia.

---

### Resumen de decisiones

| Decisión                  | Alternativa descartada | Razón principal                              |
| ------------------------- | ---------------------- | -------------------------------------------- |
| React + Vite              | Next.js                | Sin requisitos de SSR en el MVP              |
| Express                   | NestJS                 | Menor setup, mayor velocidad inicial         |
| PostgreSQL + Prisma       | MongoDB                | Modelo relacional con integridad referencial |
| Llamada síncrona a OpenAI | Cola asíncrona         | Flujo lineal, sin necesidad de async en MVP  |
| Vercel + Render           | AWS / Azure IaaS       | Zero-config, CI/CD integrado                 |

---

## ⚖️ Trade-offs

> Decisiones conscientes donde se priorizó un atributo a costa de otro, alineadas con las restricciones del MVP.

---

### 1. Simplicidad de estimación vs. precisión

| Priorizado                             | Sacrificado                            |
| -------------------------------------- | -------------------------------------- |
| Un resultado útil generado en segundos | Exactitud matemática de horas y costos |

La estimación se delega a un modelo de lenguaje a partir de una descripción textual. Esto produce resultados **razonables y estructurados**, pero no auditables con métodos formales (COCOMO, puntos de función). El sistema es una herramienta de orientación, no de cálculo exacto. Esta limitación se declara explícitamente en los supuestos.

---

### 2. Flujo síncrono vs. escalabilidad de la integración con IA

| Priorizado                                                    | Sacrificado                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| Simplicidad de implementación y experiencia de usuario lineal | Capacidad de manejar tiempos de respuesta largos o alta concurrencia |

La llamada a Azure OpenAI es síncrona: el usuario espera el resultado en la misma request. Esto simplifica el backend y elimina la necesidad de colas, workers o WebSockets. Si las respuestas superan los 30 s o el sistema crece en usuarios concurrentes, esta decisión deberá revisarse.

---

### 3. Prompt único vs. modularidad del motor de estimación

| Priorizado                                          | Sacrificado                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| Velocidad de desarrollo y menor superficie de error | Flexibilidad para ajustar fases del análisis de forma independiente |

El roadmap, la estimación de esfuerzo y el cálculo de tokens se generan en una única llamada al modelo. Separar cada dimensión en prompts distintos daría más control sobre cada resultado, pero triplicaría la complejidad de orquestación y el costo en tokens. Para el MVP, un prompt bien estructurado es suficiente.

---

### 4. Estimación de tokens aproximada vs. medición real

| Priorizado                                          | Sacrificado                               |
| --------------------------------------------------- | ----------------------------------------- |
| Rapidez para dar una referencia de costo al usuario | Reflejo exacto del consumo real de la API |

El consumo de tokens que se muestra en el reporte es una **estimación proyectada** basada en el tamaño del proyecto, no el conteo exacto del uso de la API. La medición exacta requeriría instrumentar cada llamada y persistir los valores de `usage` de la respuesta. Esto puede incorporarse en una iteración posterior sin cambios de arquitectura.

---

### 5. MVP acotado vs. recalculabilidad libre

| Priorizado                                                     | Sacrificado                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| Entregar un flujo completo y funcional en el tiempo disponible | Capacidad de editar y recalcular libremente sin restricciones |

La funcionalidad de recalcular una estimación (SH-01) quedó fuera del Must-Have. En el MVP, una nueva estimación implica modificar los datos del proyecto y ejecutar el proceso nuevamente. La edición inline con recálculo incremental se pospone a la siguiente iteración.

---

### 6. Despliegue en tiers gratuitos vs. disponibilidad de producción

| Priorizado                          | Sacrificado                              |
| ----------------------------------- | ---------------------------------------- |
| Coste cero para validar el producto | SLA garantizado y cold starts eliminados |

Render y Vercel en tiers gratuitos introducen **cold starts** y límites de cómputo. Esto es aceptable para un MVP en fase de validación, pero incompatible con un entorno de producción real. La migración a tiers pagos o a Azure App Service es un paso claro y previsto.

---

## 🗃️ Modelo de datos

```mermaid
erDiagram
    Project {
        string id PK
        string name
        string description
        string complexity
        datetime createdAt
    }

    UseCase {
        string id PK
        string projectId FK
        string title
        string description
        string priority
    }

    Estimation {
        string id PK
        string projectId FK
        float totalHours
        float totalCost
        string assumptions
        string risks
    }

    Phase {
        string id PK
        string estimationId FK
        string name
        string description
        int order
    }

    RoleEstimate {
        string id PK
        string phaseId FK
        string role
        float hours
    }

    TokenEstimate {
        string id PK
        string estimationId FK
        string model
        int tokens
        float cost
    }

    Project ||--o{ UseCase : "tiene"
    Project ||--o{ Estimation : "genera"
    Estimation ||--o{ Phase : "contiene"
    Phase ||--o{ RoleEstimate : "incluye"
    Estimation ||--o{ TokenEstimate : "calcula"
```

### Entidades

| Entidad           | Campos principales                                                   |
| ----------------- | -------------------------------------------------------------------- |
| **Project**       | `id`, `name`, `description`, `complexity`, `createdAt`               |
| **UseCase**       | `id`, `projectId`, `title`, `description`, `priority`                |
| **Estimation**    | `id`, `projectId`, `version`, `totalHours`, `totalCost`, `assumptions`, `risks` |
| **Phase**         | `id`, `estimationId`, `name`, `description`, `order`                 |
| **RoleEstimate**  | `role`, `hours`                                                      |
| **TokenEstimate** | `model`, `tokens`, `cost`                                            |

> **Nota técnica — `TokenEstimate`:** en el MVP, el consumo de tokens se registra a nivel de `Estimation` (una entrada por estimación completa), no por `Phase`. Esta decisión simplifica el modelo de datos y es suficiente para mostrar un costo total al usuario. En versiones futuras, `TokenEstimate` podría asociarse también a `Phase` para ofrecer un desglose de consumo por fase del roadmap, útil en proyectos donde distintas etapas tienen perfiles de uso de IA muy diferentes.

---

## 🔌 API

| Método | Endpoint                 | Descripción                         |
| ------ | ------------------------ | ----------------------------------- |
| `POST` | `/auth/login`            | Iniciar sesión y obtener tokens     |
| `POST` | `/auth/refresh`          | Renovar access token con refresh token |
| `POST` | `/auth/logout`           | Cerrar sesión y revocar sesión actual |
| `POST` | `/projects`              | Crear un nuevo proyecto             |
| `GET`  | `/projects`              | Listar todos los proyectos          |
| `GET`  | `/projects/:id`          | Obtener detalle con la estimación más reciente |
| `POST` | `/projects/:id/use-cases`| Crear caso de uso en proyecto       |
| `POST` | `/projects/:id/estimate` | Generar roadmap + guardar una nueva versión de estimación |

Notas de versionado:

- Cada nueva ejecución de `POST /projects/:id/estimate` crea una nueva versión (`version` incremental) y no sobrescribe la anterior.
- `GET /projects/:id` devuelve por defecto la versión más reciente.

Notas de seguridad:

- Con `AUTH_ENABLED=true`, la API requiere bearer token para endpoints de negocio.
- Los permisos dependen del rol y de la pertenencia/asignación de proyecto.

---

## 🧰 Stack tecnológico

| Capa              | Tecnología              |
| ----------------- | ----------------------- |
| **Frontend**      | React, TypeScript, Vite |
| **Backend**       | Node.js, Express        |
| **Base de datos** | PostgreSQL, Prisma      |
| **IA**            | Azure OpenAI            |

---

## 🧪 Testing

### Niveles de prueba

| Nivel | Herramienta | Alcance |
|-------|-------------|---------|
| **Unit tests** | Vitest | Lógica de negocio, servicios, construcción de prompts |
| **Integration tests** | Supertest | Endpoints de la API REST y acceso a base de datos |
| **E2E tests** | Playwright | Flujo completo de usuario en el navegador |

### Comandos de testing

- Backend unit + integration: `cd app/backend && npm run test`
- Frontend unit: `cd app/frontend && npm run test`
- Frontend E2E: `cd app/frontend && npm run test:e2e`

### Flujo E2E cubierto

```
1. Iniciar sesión
2. Crear proyecto
3. Agregar caso de uso
4. Generar estimación
5. Visualizar reporte
```

Incluye escenario de error:

- Modelo de estimación inválido (validación backend y alerta de error en UI)

---

## 🚀 Infraestructura y despliegue

### Evidencia de entrega final

Estado de validaciones en rama `v1.0-final-GV`:

- Backend: `npm run typecheck` ✅
- Backend: `npm run test` ✅ (16/16)
- Frontend: `npm run test` ✅ (4/4)
- Frontend: `npm run build` ✅
- E2E Playwright BDD (T11): `npm run test:e2e --prefix app/frontend` ✅ (2/2) usando PostgreSQL local `projectscope_e2e_local`.

Enlace a entorno público:

- Frontend: pendiente de publicación (completar URL al desplegar).
- Backend: pendiente de publicación (completar URL al desplegar).

Si no se usa entorno público, adjuntar capturas en `docs/evidence/` y referenciarlas aquí.

Registro de ejecución de validaciones: `docs/evidence/final-validation.md`.

Historial de cambios de entrega: `CHANGELOG.md`.

### Plataformas

| Componente        | Plataforma       | Notas |
| ----------------- | ---------------- | ----- |
| **Frontend**      | Vercel           | Deploy automático desde rama `main` |
| **Backend**       | Render / Azure   | Deploy automático desde rama `main` |
| **Base de datos** | PostgreSQL       | Instancia gestionada (Render Postgres o Azure Database) |

### CI/CD

El repositorio incluye CI mínimo en GitHub Actions:

- Workflow: `.github/workflows/ci.yml`
- Checks backend: prisma generate, typecheck, tests, build
- Checks frontend: lint, tests, build

Deploy continuo:

- Push a `main` puede disparar deploy automático en Vercel (frontend) y Render (backend)
- Si los checks fallan, la release debe bloquearse hasta corregir errores

### Gestión de secretos

Las credenciales y configuraciones sensibles se gestionan exclusivamente mediante variables de entorno, nunca hardcodeadas en el repositorio:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `AZURE_OPENAI_API_KEY` | Clave de API de Azure OpenAI |
| `AZURE_OPENAI_ENDPOINT` | Endpoint del recurso Azure OpenAI |
| `AZURE_OPENAI_DEPLOYMENT` | Nombre del deployment del modelo |

- En **Vercel** y **Render**, las variables se configuran desde el panel de cada servicio
- El repositorio incluye ejemplos de variables en `app/backend/.env.example` y `app/frontend/.env.example`
- El archivo `.env` está incluido en `.gitignore`

Runbooks operativos:

- Variables de entorno: `docs/operations/environment-variables.md`
- Deploy y rollback: `docs/operations/release-runbook.md`

### Reproducción E2E local (T11)

Requisitos:

- Docker Desktop ejecutándose
- Puerto `55432` libre

Pasos:

1. Levantar PostgreSQL temporal:

```bash
docker run --rm -d --name psai-e2e-db \
    -e POSTGRES_DB=projectscope_e2e \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 55432:5432 postgres:16
```

2. Aplicar migraciones:

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/projectscope_e2e?schema=public" npm run prisma:migrate:deploy --prefix app/backend
```

3. Instalar navegador Playwright (una sola vez):

```bash
npm run test:e2e:install --prefix app/frontend
```

4. Ejecutar E2E:

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/projectscope_e2e?schema=public" npm run test:e2e --prefix app/frontend
```

5. Apagar base temporal:

```bash
docker rm -f psai-e2e-db
```

---

## 🪙 Estrategia de estimación de tokens

> El sistema no mide tokens en tiempo real durante la estimación del proyecto. En su lugar, proyecta un **consumo aproximado** basado en el tamaño y complejidad del proyecto, usando promedios empíricos por tipo de tarea.

---

### Principio de funcionamiento

Cuando el usuario ejecuta una estimación, el backend:

1. Clasifica las tareas del proyecto por tipo (generación de código, debugging, testing, documentación)
2. Asigna un rango de tokens promedio a cada tipo de tarea
3. Pondera ese rango según la complejidad declarada del proyecto y la cantidad de casos de uso
4. Produce un valor estimado total expresado en miles de tokens y su costo de referencia

El resultado es una **orientación de orden de magnitud**, no un valor exacto.

---

### Tipos de tarea y rangos de referencia

| Tipo de tarea                     | Tokens estimados (por unidad) | Variabilidad                                   |
| --------------------------------- | ----------------------------- | ---------------------------------------------- |
| **Generación de código**          | 1.500 – 4.000 tokens          | Alta — depende de la complejidad del módulo    |
| **Debugging y corrección**        | 800 – 2.000 tokens            | Media — depende de la profundidad del análisis |
| **Testing (generación de tests)** | 600 – 1.500 tokens            | Baja-media — estructuralmente predecible       |
| **Documentación**                 | 400 – 1.200 tokens            | Baja — menos variabilidad entre proyectos      |

> Los rangos son promedios basados en el uso típico de modelos GPT-4 class para tareas de desarrollo. No representan valores exactos del modelo configurado.

---

### Factores de ajuste

El sistema aplica multiplicadores sobre los rangos base según las siguientes variables:

| Factor                         | Ajuste aplicado                  |
| ------------------------------ | -------------------------------- |
| **Complejidad baja**           | × 0.7 sobre el rango base        |
| **Complejidad media**          | × 1.0 (sin ajuste)               |
| **Complejidad alta**           | × 1.5 sobre el rango base        |
| **Cada caso de uso adicional** | + 10–15% sobre el total estimado |

---

### Cálculo del costo de referencia

Una vez obtenido el total de tokens proyectado, el sistema calcula un costo indicativo aplicando el precio por token del modelo seleccionado (o el modelo por defecto si no se especifica).

```
costo_estimado = (tokens_input × precio_input) + (tokens_output × precio_output)
```

- Los precios se almacenan como valores de referencia configurables en el backend
- Se asume una proporción aproximada de 30% tokens de entrada / 70% tokens de salida, típica en tareas de generación
- El costo resultante se muestra en USD con dos decimales de precisión

---

### Limitaciones conocidas de esta estrategia

- Los rangos no se adaptan automáticamente al modelo seleccionado (GPT-4o vs GPT-4 turbo vs GPT-3.5 tienen perfiles de uso distintos)
- La proporción input/output es fija y puede no reflejar el comportamiento real del prompt diseñado
- No se contabilizan tokens de sistema (system prompt) en la estimación proyectada, aunque sí se consumen en la llamada real
- La estimación no se recalibra con el consumo real de la llamada a Azure OpenAI realizada durante la generación del roadmap

---

## 🤖 Uso de IA

### En tiempo de ejecución (runtime)

Funcionalidades del sistema que invocan Azure OpenAI durante el uso de la plataforma:

- Generación de roadmap
- Estimación de esfuerzo por rol y fase
- Estimación de consumo de tokens

### En tiempo de desarrollo

IA utilizada como herramienta de apoyo durante la construcción del producto:

- Generación y refinamiento de prompts
- Documentación técnica

### Criterio humano

- Validación de resultados generados
- Ajuste y control de prompts
- Control de alcance del MVP
- Revisión de coherencia entre secciones

---

## 🚧 Limitaciones del sistema

> Esta sección describe de forma honesta las limitaciones actuales del sistema, con el objetivo de establecer expectativas claras sobre el alcance y la fiabilidad de los resultados.

---

### Limitaciones de la IA

- **Los resultados dependen de la calidad del modelo.** Azure OpenAI puede producir estimaciones inconsistentes entre ejecuciones con los mismos inputs. El sistema no garantiza reproducibilidad exacta.
- **El modelo no tiene conocimiento del equipo real.** Las horas estimadas asumen un perfil genérico de desarrollador semi-senior. Equipos con composición, experiencia o contexto distintos obtendrán resultados menos ajustados.
- **El modelo puede alucinar.** En proyectos con descripción ambigua o muy corta, el roadmap generado puede incluir fases o entregables que no corresponden al contexto real del proyecto.
- **No hay mecanismo de feedback.** El sistema no aprende de estimaciones pasadas ni ajusta su comportamiento según los resultados anteriores del mismo usuario.

---

### Limitaciones de la estimación

- **Las horas son una orientación, no una promesa.** El sistema no aplica metodologías formales de estimación (COCOMO, puntos de función, story points). Los valores generados son aproximaciones basadas en lenguaje natural.
- **No considera factores organizacionales.** Vacaciones, rotación de equipo, deuda técnica acumulada, curvas de aprendizaje o procesos de revisión no están modelados.
- **Las fases del roadmap no son mutuamente excluyentes.** El sistema no calcula dependencias entre tareas ni detecta paralelismo real; genera una secuencia razonable, no un plan de proyecto ejecutable.
- **No hay ajuste por tecnología específica.** Un mismo caso de uso estimado sobre React puede diferir significativamente de uno sobre Angular o Vue; el sistema no distingue estas variantes a menos que se especifiquen explícitamente.

---

### Limitaciones de los datos de entrada

- **El sistema es tan bueno como la descripción recibida.** Inputs vagos, incompletos o ambiguos producen estimaciones de baja calidad. El sistema no valida la coherencia interna del proyecto antes de estimar.
- **No hay validación de dominio.** El sistema acepta cualquier descripción sin verificar si es técnicamente viable, si los casos de uso son coherentes entre sí o si el alcance es realista.
- **Los roles se seleccionan manualmente.** Si el usuario omite un rol necesario (por ejemplo, QA o DevOps), esas horas no estarán representadas en el resultado.

---

### Limitaciones de precisión

- **El consumo de tokens mostrado es una estimación proyectada**, no el valor real extraído de la respuesta de la API. Puede diferir del costo real facturado por Azure.
- **Los costos calculados son referenciales.** Los precios por token varían según el modelo, la región de Azure y los acuerdos comerciales. El sistema usa valores fijos de referencia que pueden quedar desactualizados.
- **No detecta proyectos duplicados ni similares.** Si el mismo proyecto se estima dos veces con descripciones ligeramente distintas, el sistema generará dos estimaciones independientes sin correlacionarlas.

---

## ⚠️ Supuestos y riesgos

### Supuestos

- Las estimaciones son aproximadas, no garantizadas
- Los tokens son estimados, no exactos
- El equipo asumido es de nivel semi-senior
- Sin integraciones complejas con sistemas externos

### Riesgos

| Riesgo                           | Descripción                                         |
| -------------------------------- | --------------------------------------------------- |
| **Subestimación de complejidad** | El scope real puede exceder lo estimado             |
| **Cambios de alcance**           | Modificaciones tardías impactan el roadmap          |
| **Dependencia excesiva de IA**   | Resultados sin revisión humana pueden ser inexactos |

---

## 🔭 Evolución futura

> Mejoras planificadas para iteraciones posteriores al MVP, priorizadas por valor de negocio y viabilidad técnica.

---

### 1. Integración con Jira y GitHub

Exportar el roadmap generado directamente como epics e issues en Jira, o como milestones y tareas en GitHub Projects. Elimina la fricción de trasladar manualmente la estimación al sistema de gestión del equipo y convierte el output del sistema en trabajo accionable de forma inmediata.

---

### 2. Histórico de estimaciones y análisis comparativo

Permitir al usuario comparar estimaciones del mismo proyecto a lo largo del tiempo o entre proyectos similares. Incluye métricas de desviación entre lo estimado y lo real (si el usuario registra el cierre del proyecto), generando un baseline de calibración progresiva por tipo de proyecto y equipo.

---

### 3. Plantillas de proyecto por industria y tipo de sistema

Ofrecer plantillas predefinidas para contextos frecuentes: e-commerce, SaaS B2B, aplicación móvil, plataforma de datos. Cada plantilla incluye casos de uso base, roles típicos y rangos de complejidad recomendados, reduciendo el tiempo de configuración inicial y mejorando la calidad del input al modelo.

---

### 4. Modo multi-modelo con comparación de costos

Ejecutar la misma estimación contra varios modelos (GPT-4o, GPT-4 Turbo, GPT-3.5) y presentar un comparativo de calidad de output vs. costo de tokens. Permite a los equipos tomar decisiones informadas sobre qué modelo usar según su presupuesto y la criticidad de la estimación.

---

### 5. Autenticación y espacios de trabajo por organización

Añadir autenticación de usuarios y soporte multi-tenant con espacios de trabajo aislados por organización. Habilita el uso del sistema en contextos enterprise, donde múltiples equipos necesitan gestionar sus proyectos y estimaciones de forma independiente con control de acceso por rol.

---

### 6. Recalibración automática con datos reales

Permitir que los usuarios registren el esfuerzo real al cerrar un proyecto. El sistema usa esa información para ajustar sus rangos de estimación futuros, generando un modelo de calibración específico por tipo de proyecto, tecnología y perfil de equipo. Convierte la herramienta de estimación puntual en un sistema de aprendizaje continuo.

---

## 📋 Tickets y trazabilidad

### Tickets

| ID  | Descripción |
| --- | ----------- |
| T01 | Definir modelo de datos y schema Prisma (Project, UseCase, Estimation, Phase, RoleEstimate, TokenEstimate) |
| T02 | Implementar API REST: endpoints `POST /projects`, `GET /projects`, `GET /projects/:id` |
| T03 | Implementar endpoint `POST /projects/:id/estimate` con integración a Azure OpenAI |
| T04 | Diseñar y construir prompt estructurado para generación de roadmap y estimación |
| T05 | Desarrollar formulario de creación de proyecto (nombre, descripción, complejidad) |
| T06 | Desarrollar formulario de carga de casos de uso (título, descripción, prioridad) |
| T07 | Desarrollar paso de selección de roles e inicio de estimación |
| T08 | Desarrollar vista de reporte: fases, roles, horas, tokens, costos, supuestos y riesgos |
| T09 | Escribir unit tests (Vitest) para lógica de estimación y construcción de prompt |
| T10 | Escribir integration tests (Supertest) para endpoints de la API |
| T11 | Escribir test E2E (Playwright) para el flujo completo: crear proyecto → estimar → ver reporte |
| T12 | Configurar despliegue en Vercel (frontend) y Render (backend), variables de entorno y `.env.example` |

### Trazabilidad HU → Tickets

| Historia de usuario                  | Tickets relacionados |
| ------------------------------------ | -------------------- |
| HU-01 — Crear proyecto               | T01, T02, T05        |
| HU-02 — Cargar casos de uso          | T06                  |
| HU-03 — Seleccionar roles            | T07                  |
| HU-04 — Generar roadmap y estimación | T03, T04             |
| HU-05 — Visualizar reporte           | T08                  |
| Transversal — Calidad                | T09, T10, T11        |
| Transversal — Infraestructura        | T12                  |

---

## 🔀 Pull Requests planificados

| PR | Rama | Objetivo | Tickets |
|----|------|----------|---------|
| PR-01 | `feat/data-model` | Definir schema Prisma y ejecutar migraciones iniciales | T01 |
| PR-02 | `feat/api-projects` | Implementar endpoints CRUD de proyectos y casos de uso | T02 |
| PR-03 | `feat/estimation-engine` | Integrar Azure OpenAI, construir prompt y endpoint de estimación | T03, T04 |
| PR-04 | `feat/frontend-forms` | Formularios de proyecto, casos de uso y selección de roles | T05, T06, T07 |
| PR-05 | `feat/report-view` | Vista de reporte con fases, horas, tokens, costos y supuestos | T08 |
| PR-06 | `feat/testing` | Unit tests (Vitest), integration tests (Supertest) y E2E (Playwright) | T09, T10, T11 |
| PR-07 | `feat/deploy` | Configuración de despliegue, variables de entorno y `.env.example` | T12 |

> Las ramas parten de `develop` y se integran a `main` mediante PR con revisión. El flujo de despliegue se activa automáticamente al merge en `main`.
