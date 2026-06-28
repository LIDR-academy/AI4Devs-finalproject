# ADR-001

## Titulo

Stack tecnico minimo para el MVP de Entrega 2

## Fecha

2026-06-07

## Estado

Propuesta

---

## Contexto

RoboDock AI necesita demostrar en Entrega 2 un flujo funcional local: identificar camion, crear sesion, registrar cubos, registrar acciones simuladas del robot y visualizar estado en dashboard.

El proyecto ya definio como stack sugerido Node.js, Express, TypeScript, Prisma, PostgreSQL, React, Vite, Python y OpenCV. Las carpetas `backend/`, `frontend/` y `edge/` existen, pero aun no contienen implementacion productiva.

La decision debe favorecer software ejecutable, evitar sobreingenieria y mantener una ruta clara hacia integracion futura con camara y MaxArm.

---

## Alternativas evaluadas

### Opcion 1: Stack MVP local con Express, Prisma, PostgreSQL, React/Vite y Python Edge

Ventajas:

- Alineado con `AGENTS.md` y la arquitectura de Entrega 2.
- Facilita separar backend, frontend y edge.
- Prisma permite persistencia tipada con PostgreSQL.
- React/Vite permite un dashboard simple y rapido.
- Python conserva compatibilidad con los spikes de OpenCV y MaxArm.

Desventajas:

- Requiere coordinar tres componentes.
- PostgreSQL/Prisma agrega setup inicial.

### Opcion 2: Aplicacion monolitica sin separacion backend/edge/frontend

Ventajas:

- Menos piezas iniciales.
- Menor configuracion local.

Desventajas:

- No representa bien la arquitectura edge-first del proyecto.
- Dificulta reutilizar spikes de vision/robot.
- Debilita la trazabilidad entre API, dashboard y edge.

### Opcion 3: Arquitectura completa desde Entrega 1

Ventajas:

- Mas cercana a la vision final.
- Incluye entidades y controles avanzados desde el inicio.

Desventajas:

- Riesgo alto de no terminar el MVP funcional.
- Introduce modelos, seguridad y auditoria que no son necesarios para Entrega 2.
- Puede bloquear la demo academica.

---

## Decision

Usar un stack MVP local compuesto por:

- Backend: Node.js, Express y TypeScript.
- Persistencia: Prisma y PostgreSQL.
- Frontend: React, Vite y TypeScript.
- Edge: Python, con simulacion por defecto y adaptacion futura de OpenCV/MaxArm.

---

## Justificacion

Esta decision cubre las historias Must de Entrega 2 con una arquitectura simple y demostrable. Permite que el backend sea la fuente de verdad, que el frontend consuma datos reales y que el edge envie eventos en modo simulado sin depender de hardware.

El stack mantiene continuidad con los spikes existentes y con la vision final, pero evita implementar desde el inicio entidades o infraestructura que pertenecen a evolucion futura.

---

## Consecuencias

### Positivas

- Entrega incremental y verificable.
- Separacion clara de responsabilidades.
- Base tecnica compatible con Entrega Final.
- Persistencia real para sesiones, cubos y acciones.

### Negativas

- Requiere configurar backend, frontend, edge y base de datos.
- Puede haber friccion local con PostgreSQL si no se documenta bien.
- La separacion entre componentes exige contratos estables.

### Riesgos

- Que el backend crezca mas alla del modelo minimo.
- Que el setup de Prisma/PostgreSQL consuma demasiado tiempo.
- Que el dashboard avance antes de estabilizar contratos API.
