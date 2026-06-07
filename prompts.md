# Prompts utilizados durante el desarrollo

> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.  
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras.

---

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

```text
Quiero evaluar ideas para el proyecto final del curso que tengan frontend, backend, base de datos, flujo E2E, tests y despliegue. Tengo experiencia previa con RoboGo y un brazo MaxArm. Dame alternativas de proyecto que sean realizables en el plazo del curso, pero que destaquen frente a un CRUD tradicional.
```

**Prompt 2:**

```text
Qué tal hacer un proyecto donde pueda usar el MaxArm que ya tengo y sé cómo utilizarlo. Por ejemplo, que el MaxArm descargue un camión con cubos de diferentes colores, lea un QR en la cabina y registre cuántos cubos de cada color trae el camión en una base de datos. Evalúa si esto sirve como proyecto final.
```

**Prompt 3:**

```text
Necesito un resumen del proyecto RoboDock AI para la Entrega 1, explicando objetivo, funcionalidades, valor del producto, hardware necesario, dashboards, uso de cámara cenital, MaxArm, PostgreSQL y modo simulado.
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

```text
Diseña la arquitectura de RoboDock AI considerando que la cámara y el MaxArm van conectados a un laptop o edge node. El backend debe registrar datos en PostgreSQL y el frontend debe mostrar dashboards. Propón una arquitectura edge-first y justifica sus ventajas.
```

**Prompt 2:**

```text
Actualiza la arquitectura considerando que usaremos Prisma + PostgreSQL para el backend core. Separa responsabilidades entre Backend Core Node.js/TypeScript y Edge Service Python para cámara, OpenCV y MaxArm.
```

**Prompt 3:**

```text
Genera un diagrama Mermaid para representar la arquitectura MVP de RoboDock AI con Frontend React, Backend Core, Prisma, PostgreSQL, Edge Service Python, cámara USB y MaxArm.
```

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

```text
Describe los componentes principales de RoboDock AI: frontend, backend core, Prisma, PostgreSQL, edge service, cámara y MaxArm. Indica tecnología, responsabilidad y relación entre componentes.
```

**Prompt 2:**

```text
Explica por qué no conviene mezclar toda la lógica de visión y robótica dentro del backend de negocio y por qué es mejor separar Edge Service y Backend Core.
```

**Prompt 3:**

```text
Ajusta la descripción de componentes para que considere buenas prácticas de desarrollo, modularidad, validación, testing, logs, modo simulado y trazabilidad.
```

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

```text
Propón una estructura de carpetas para RoboDock AI separando backend, frontend, edge-service, docs y experiments. El backend usará Prisma, el frontend React/Vite y el edge service Python/OpenCV.
```

**Prompt 2:**

```text
Ajusta la estructura de ficheros para que sea entendible en el README de Entrega 1 y explique el propósito de cada carpeta principal.
```

**Prompt 3:**

```text
Incluye en la estructura una carpeta experiments con los spikes realizados: vision_color_detection, truck_code_detection, integrated_vision_detection, dashboard_live_camera, dynamic_pickup_detection y dynamic_pickup_maxarm_pick.
```

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

```text
Define la infraestructura local para el MVP de RoboDock AI usando Docker Compose con PostgreSQL, Backend Core, Frontend y Edge Service. Explica cómo se desplegaría localmente.
```

**Prompt 2:**

```text
Propón una evolución futura para que el frontend y backend puedan ir a cloud, manteniendo el edge service local por la cámara y el MaxArm.
```

**Prompt 3:**

```text
Escribe instrucciones de instalación local para RoboDock AI: dependencias, backend, frontend, base de datos, migraciones, seeds, edge service, modo simulado y modo real.
```

### **2.5. Seguridad**

**Prompt 1:**

```text
Enumera las prácticas de seguridad principales para RoboDock AI considerando variables de entorno, modo simulado, control de estados, validación de payloads, trazabilidad y protección de movimientos del robot.
```

**Prompt 2:**

```text
Considera que el MaxArm puede moverse físicamente. Propón medidas de seguridad de software para evitar movimientos accidentales, incluyendo dry_run, safe_z, reset y validación de poses.
```

**Prompt 3:**

```text
Ajusta la sección de seguridad para incluir que cámara, robot, calibraciones y sesión deben pertenecer al mismo EdgeNode.
```

### **2.6. Tests**

**Prompt 1:**

```text
Define una estrategia de testing para RoboDock AI con tests unitarios, integración y E2E simulado. Considera QR, conteo por color, drop positions, secuencia robot, Prisma/PostgreSQL y dashboard.
```

**Prompt 2:**

```text
Propón tests de integración para validar el modelo de datos: crear Site, EdgeNode, CameraDevice, RobotArm, calibraciones, DropZones, DropPositions, UnloadSession, DetectedCube, RobotAction y RobotActionStep.
```

**Prompt 3:**

```text
Define un flujo E2E simulado para probar RoboDock AI sin cámara ni robot real, usando datos mock para camión, cubos, acciones robot y dashboard.
```

---

### 3. Modelo de Datos

**Prompt 1:**

```text
Diseña un modelo de datos para RoboDock AI usando Prisma y PostgreSQL. Considera sitios, edge nodes, cámaras, robots, poses, calibraciones, camiones, sesiones de descarga, cubos detectados, acciones robot, pasos de robot, eventos y logs.
```

**Prompt 2:**

```text
Revisa el modelo de datos propuesto. Ajusta para que id sea identificador técnico interno UUID y code sea identificador funcional de negocio. Agrega @db.Uuid en Prisma y usa code para dashboards, QR, logs y trazabilidad.
```

**Prompt 3:**

```text
Ajusta el modelo para incluir Site, CameraDevice, CameraCalibrationProfile, RobotCalibrationProfile, DropZone y DropPosition. DropZone debe ser una zona lógica por color y DropPosition debe contener múltiples coordenadas físicas disponibles dentro de cada zona.
```

---

### 4. Especificación de la API

**Prompt 1:**

```text
Define los endpoints principales de la API de RoboDock AI, pero limita la documentación a máximo 3 endpoints principales para la Entrega 1. Deben cubrir inicio de sesión, eventos del edge y dashboard operacional.
```

**Prompt 2:**

```text
Escribe la especificación OpenAPI para POST /api/unload-sessions/start, POST /api/edge-events y GET /api/dashboard/operational, incluyendo ejemplos de request y response.
```

**Prompt 3:**

```text
Ajusta la API para que use edgeNodeCode y truckCode como identificadores funcionales de entrada, pero retorne id UUID y code funcional de la sesión creada.
```

---

### 5. Historias de Usuario

**Prompt 1:**

```text
Genera 3 historias de usuario principales para RoboDock AI siguiendo buenas prácticas de producto: una para iniciar descarga con QR, una para detectar cubos y asignar posiciones, y una para ejecutar descarga con MaxArm.
```

**Prompt 2:**

```text
Agrega criterios de aceptación verificables para cada historia, considerando estados de sesión, calibraciones activas, drop positions disponibles, eventos y trazabilidad.
```

**Prompt 3:**

```text
Reduce las historias a las 3 más importantes para la Entrega 1, evitando listar todas las funcionalidades secundarias.
```

---

### 6. Tickets de Trabajo

**Prompt 1:**

```text
Genera 3 tickets de trabajo principales para RoboDock AI: uno de backend, uno de frontend y uno de base de datos. Cada ticket debe tener descripción, alcance y criterios de aceptación.
```

**Prompt 2:**

```text
Ajusta el ticket de base de datos para que incluya Prisma, PostgreSQL, migración inicial, seeds y las entidades Site, EdgeNode, CameraDevice, RobotArm, calibraciones, DropZone y DropPosition.
```

**Prompt 3:**

```text
Ajusta el ticket de frontend para implementar el dashboard operacional con cámara, sesión, conteo por color, estado robot, últimas acciones y estados de error.
```

---

### 7. Pull Requests

**Prompt 1:**

```text
Propón 3 Pull Requests para el proyecto RoboDock AI: uno para Entrega 1 con documentación, uno para backend con Prisma/PostgreSQL y uno para frontend/dashboard con modo simulado.
```

**Prompt 2:**

```text
Redacta el contenido esperado de cada PR indicando rama, objetivo, archivos incluidos y estado planificado.
```

**Prompt 3:**

```text
Ajusta los PRs para alinearlos con las etapas del proyecto final: Entrega 1, Entrega 2 y Entrega final.
```
