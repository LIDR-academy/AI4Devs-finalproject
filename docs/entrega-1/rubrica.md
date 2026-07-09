# Rúbrica / Instrucciones del Proyecto Final – AI4Devs

> Documento de apoyo para organizar la entrega del Proyecto Final.  
> Resume la estructura esperada de `readme.md` y `prompts.md`, las restricciones principales y el flujo recomendado de entrega.

---

## 1. Archivos principales de entrega

La entrega debe contener, como mínimo, estos archivos en la raíz del repositorio:

```text
readme.md
prompts.md
```

Opcionalmente puede incluir:

```text
docs/
└── images/
```

para evidencias visuales, capturas, diagramas, dashboards o imágenes del proyecto.

---

## 2. Estructura esperada de `readme.md`

El archivo `readme.md` debe seguir esta estructura:

```text
0. Ficha del proyecto
1. Descripción general del producto
2. Arquitectura del sistema
3. Modelo de datos
4. Especificación de la API
5. Historias de usuario
6. Tickets de trabajo
7. Pull requests
```

---

## 3. Sección 0 — Ficha del proyecto

Debe incluir:

- nombre completo del alumno;
- nombre del proyecto;
- descripción breve del proyecto;
- URL del proyecto;
- URL o archivo comprimido del repositorio.

Si el repositorio es privado, se deben compartir accesos de manera segura o entregar un archivo comprimido si el curso lo permite.

---

## 4. Sección 1 — Descripción general del producto

Debe describir:

### 1.1. Objetivo

- propósito del producto;
- valor que aporta;
- problema que soluciona;
- usuario o beneficiario principal.

### 1.2. Características y funcionalidades principales

Debe enumerar y explicar las funcionalidades principales.

Para RoboDock AI:

- identificación de camión por QR;
- detección de cubos por color;
- control del MaxArm;
- registro de sesiones de descarga;
- dashboards;
- trazabilidad;
- modo real y modo simulado.

### 1.3. Diseño y experiencia de usuario

Debe incluir o referenciar imágenes, capturas o video mostrando la experiencia de usuario.

Ejemplos de imágenes:

```text
docs/images/dashboard_operacional.png
docs/images/dashboard_analytics.png
docs/images/dashboard_live_camera_spike.png
docs/images/zona_descarga_cenital.png
```

### 1.4. Instrucciones de instalación

Debe documentar cómo instalar y ejecutar el proyecto localmente:

- librerías;
- backend;
- frontend;
- servidor;
- base de datos;
- migraciones;
- semillas de datos;
- variables de entorno;
- ejecución local.

---

## 5. Sección 2 — Arquitectura del sistema

### 2.1. Diagrama de arquitectura

Debe incluir un diagrama de arquitectura, idealmente Mermaid.

Debe explicar:

- componentes principales;
- tecnologías utilizadas;
- patrón arquitectónico;
- por qué se eligió la arquitectura;
- beneficios;
- sacrificios o déficits.

### 2.2. Componentes principales

Debe describir componentes y responsabilidades.

Ejemplo:

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| Frontend | React + Vite + TypeScript | Dashboards y UI |
| Backend Core | Node.js + TypeScript | API y lógica de negocio |
| Base de datos | PostgreSQL | Persistencia |
| ORM | Prisma | Modelo y migraciones |
| Edge Service | Python + OpenCV | Visión y robot |

### 2.3. Estructura de ficheros

Debe representar la estructura del proyecto y explicar el propósito de carpetas principales:

```text
backend/
frontend/
edge-service/
docs/
experiments/
readme.md
prompts.md
```

### 2.4. Infraestructura y despliegue

Debe detallar:

- infraestructura local;
- Docker Compose;
- PostgreSQL;
- backend;
- frontend;
- edge service;
- posible evolución cloud.

### 2.5. Seguridad

Debe describir prácticas de seguridad principales.

Para RoboDock AI conviene separar:

#### Comprometido para MVP académico

- variables de entorno y `.env.example`;
- no subir `.env`;
- validación de payloads;
- uso de Prisma para prevenir SQL injection;
- modo simulado y modo real;
- validaciones de movimiento del MaxArm;
- trazabilidad con eventos, logs, acciones y pasos;
- consistencia por `EdgeNode`;
- control de `DropPosition` para evitar sobreposición;
- control de estados de sesión.

#### Evolución futura

- autenticación;
- RBAC;
- rate limiting;
- HTTPS;
- secret manager;
- auditoría avanzada;
- privacidad y retención de datos;
- multi-tenant SaaS.

### 2.6. Tests

Debe describir tests realizados o planificados:

- unitarios;
- integración;
- E2E simulado.

Ejemplos:

- validación QR;
- conteo por color;
- selección de `DropPosition`;
- generación de códigos funcionales;
- transiciones de estado;
- persistencia con Prisma/PostgreSQL;
- dashboard con datos mock.

---

## 6. Sección 3 — Modelo de datos

### 3.1. Diagrama del modelo de datos

Se recomienda usar Mermaid `erDiagram`.

Debe incluir:

- entidades;
- relaciones;
- claves primarias;
- claves foráneas;
- atributos;
- tipos;
- restricciones principales.

### 3.2. Descripción de entidades principales

Debe incluir para cada entidad:

- nombre;
- propósito;
- atributos principales;
- tipos;
- PK;
- FK;
- relaciones;
- restricciones;
- notas de diseño.

Para RoboDock AI, las entidades principales son:

```text
Site
EdgeNode
CameraDevice
CameraCalibrationProfile
RobotArm
RobotPose
RobotCalibrationProfile
DropZone
DropPosition
Truck
UnloadSession
DetectedCube
RobotAction
RobotActionStep
Event
SystemLog
```

Criterio de identificadores:

```text
id   = identificador técnico interno UUID
code = identificador funcional o de negocio
```

---

## 7. Sección 4 — Especificación de la API

Se deben describir los endpoints principales.

Restricción importante:

```text
máximo 3 endpoints principales
```

Formato recomendado:

```text
OpenAPI / YAML
```

Para RoboDock AI, los 3 endpoints principales propuestos son:

```text
POST /api/unload-sessions/start
POST /api/edge-events
GET  /api/dashboard/operational
```

---

## 8. Sección 5 — Historias de usuario

Se deben documentar 3 historias de usuario principales.

Formato recomendado:

```text
Como [rol],
quiero [necesidad],
para [beneficio].
```

Cada historia debe incluir criterios de aceptación.

Para RoboDock AI:

1. iniciar sesión de descarga con identificación de camión;
2. detectar cubos y asignar posiciones de descarga;
3. ejecutar y trazar una acción de descarga con MaxArm.

---

## 9. Sección 6 — Tickets de trabajo

Se deben documentar 3 tickets principales:

1. uno de backend;
2. uno de frontend;
3. uno de base de datos.

Cada ticket debe incluir:

- título;
- tipo;
- prioridad;
- historia asociada;
- descripción;
- alcance;
- criterios de aceptación.

Para RoboDock AI:

```text
Ticket 1 — Backend
Implementar flujo de sesión de descarga y eventos del Edge Service.

Ticket 2 — Frontend
Implementar dashboard operacional de RoboDock AI.

Ticket 3 — Base de datos
Implementar modelo Prisma inicial de RoboDock AI.
```

---

## 10. Sección 7 — Pull Requests

Se deben documentar 3 Pull Requests realizadas o planificadas.

Para RoboDock AI:

```text
PR 1 — Entrega 1: documentación técnica inicial de RoboDock AI
Rama: feature-entrega1-ASP

PR 2 — Entrega 2: MVP funcional de RoboDock AI
Rama: feature-entrega2-ASP

PR 3 — Entrega final: integración completa y demo de RoboDock AI
Rama: finalproject-ASP
```

Cada PR debe incluir:

- título;
- rama;
- contenido;
- estado.

---

## 11. `prompts.md`

El archivo `prompts.md` debe detallar los prompts principales utilizados durante la creación del proyecto.

Debe justificar el uso de asistentes de código en todas las fases del ciclo de vida.

Restricciones:

```text
máximo 3 prompts por sección
```

Debe incluir principalmente:

- prompts de creación inicial;
- prompts de corrección;
- prompts de adición de funcionalidades relevantes.

Opcionalmente se puede adjuntar o enlazar la conversación completa.

---

## 12. Estructura esperada de `prompts.md`

Debe seguir estas secciones:

```text
1. Descripción general del producto
2. Arquitectura del sistema
3. Modelo de datos
4. Especificación de la API
5. Historias de usuario
6. Tickets de trabajo
7. Pull requests
```

En arquitectura, debe cubrir:

```text
2.1. Diagrama de arquitectura
2.2. Descripción de componentes principales
2.3. Estructura de ficheros
2.4. Infraestructura y despliegue
2.5. Seguridad
2.6. Tests
```

---

## 13. Criterio para seleccionar prompts

Los prompts deben demostrar uso de IA en fases clave:

| Fase | Ejemplo |
|---|---|
| Ideación | selección de idea, alcance MVP, comparación de alternativas |
| Arquitectura | edge-first, separación Backend Core / Edge Service |
| Modelo de datos | Prisma, PostgreSQL, ERD, UUID vs code |
| API | endpoints principales, OpenAPI |
| Historias | historias principales y criterios de aceptación |
| Tickets | backend, frontend y BD |
| PRs | planificación de ramas y entregas |
| Spikes | visión, QR, dashboard, MaxArm |

---

## 14. Entrega con repositorio público o privado

### Repositorio público

Se entrega la URL del repositorio o Pull Request.

### Repositorio privado

Se debe asegurar acceso a evaluadores:

- invitar colaboradores;
- compartir acceso de forma segura;
- entregar zip si está permitido.

---

## 15. Flujo recomendado de entrega con Git

### Rama

```bash
git checkout -b feature-entrega1-ASP
```

### Archivos

```text
readme.md
prompts.md
docs/images/
```

### Commit

```bash
git add readme.md prompts.md docs
git commit -m "Entrega 1: documentación técnica inicial de RoboDock AI"
```

### Push

```bash
git push -u origin feature-entrega1-ASP
```

### Pull Request

Crear PR desde:

```text
afspage/AI4Devs-finalproject:feature-entrega1-ASP
```

hacia:

```text
LIDR-academy/AI4Devs-finalproject:main
```

Título sugerido:

```text
Entrega 1: documentación técnica inicial de RoboDock AI
```

---

## 16. Checklist Entrega 1

- [ ] `readme.md` en raíz.
- [ ] `prompts.md` en raíz.
- [ ] Ficha completa.
- [ ] URL del repo correcta.
- [ ] Descripción general del producto.
- [ ] Instrucciones de instalación.
- [ ] Diagrama de arquitectura.
- [ ] Estructura de carpetas.
- [ ] Infraestructura/despliegue.
- [ ] Seguridad.
- [ ] Tests.
- [ ] ERD Mermaid con columnas.
- [ ] Descripción de entidades.
- [ ] Máximo 3 endpoints.
- [ ] 3 historias de usuario.
- [ ] 3 tickets: backend, frontend y BD.
- [ ] 3 PRs documentados.
- [ ] `prompts.md` con máximo 3 prompts por sección.
- [ ] Imágenes disponibles en `docs/images`.
- [ ] No subir `.env`.
- [ ] No subir secretos.
- [ ] Commit realizado.
- [ ] Push realizado.
- [ ] PR creado o listo para crear.

---

## 17. Preparación para Entrega 2 y Entrega Final

El `readme.md` debe funcionar como documentación viva.

### Entrega 1

```text
documentación técnica, arquitectura, modelo, API, historias, tickets y prompts
```

### Entrega 2

```text
MVP funcional, backend, frontend, PostgreSQL, Prisma, modo simulado y tests básicos
```

### Entrega Final

```text
integración real con cámara y MaxArm, dashboards completos, trazabilidad, tests finales y demo
```

---

## 18. Notas específicas para RoboDock AI

Aspectos importantes a demostrar:

- arquitectura edge-first;
- separación Backend Core / Edge Service;
- modelo de datos sólido;
- PostgreSQL + Prisma;
- cámara cenital y visión computacional;
- control del MaxArm;
- modo real y modo simulado;
- trazabilidad completa;
- dashboards;
- uso documentado de IA;
- planificación clara por etapas.
