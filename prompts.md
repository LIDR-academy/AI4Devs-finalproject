# Bitácora de prompts — Desarrollo asistido por IA de Valer.IA

**Proyecto Fin de Máster (PFM)** · Máster en Inteligencia Artificial para el desarrollo (AI4Devs)
**Producto:** Valer.IA — Agente de certificación y control de margen para subcontrata de fontanería en obra nueva

---

## 1. Propósito de este documento

Este fichero documenta el **proceso de elaboración de Valer.IA mediante interacción dirigida con un asistente de IA**. No reproduce literalmente las instrucciones dadas, sino que sintetiza, para cada iteración, el *objetivo perseguido*, las *decisiones tomadas* y los *artefactos resultantes*, de manera que el proceso sea revisable y evaluable.

Su finalidad es evidenciar que el proyecto no es el resultado de una única petición, sino de un **trabajo iterativo de descubrimiento, especificación, diseño y refinamiento**, en el que el criterio humano dirige, cuestiona y valida cada salida del asistente.

## 2. Nota metodológica

El desarrollo siguió un patrón de **diálogo iterativo con validación humana en cada paso**, equivalente al ciclo *prompt → propuesta → revisión crítica → corrección*. Tres rasgos lo caracterizan y son relevantes para su evaluación:

- **Descubrimiento progresivo del problema.** No se partió de una solución cerrada. La primera propuesta del asistente (orientada a captación de clientes) fue **descartada y reorientada** al confirmarse el modelo de negocio real (subcontrata B2B en obra nueva), hasta acotar el verdadero punto de dolor: certificación y control de margen.
- **Revisión crítica del usuario.** Varias iteraciones consistieron en detectar y corregir incoherencias, ambigüedades o decisiones discutibles de las salidas del asistente (p. ej. una contradicción en el requisito de captura, una discordancia entre stack y prerrequisitos, o el modelo de despliegue). Esto demuestra una postura activa y no de aceptación acrítica.
- **Coherencia con la filosofía del propio producto.** El método empleado reproduce el principio rector de Valer.IA: *la IA propone, una persona valida*. La dirección y la decisión final fueron siempre humanas.

## 3. Bitácora por fases

### Fase 0 — Identificación y acotación de la oportunidad

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 0.1 | Identificar la herramienta agéntica más necesaria en una empresa familiar de fontanería de ~15 empleados. | Primera hipótesis (front-office de captación), planteada como punto de partida a validar. |
| 0.2 | Corregir el contexto: la empresa no atiende a particulares; trabaja como subcontrata para constructoras en obra nueva. | Reorientación de la hipótesis hacia el **control de obra**: certificación, margen y planning. |
| 0.3 | Priorizar el punto de dolor entre las alternativas propuestas. | Foco definitivo en **certificación y control de margen**. |

*Valor académico:* ejercicio de **análisis de requisitos y encuadre del problema**, con descarte explícito de una hipótesis inicial al contrastarla con el dominio real.

### Fase 1 — Análisis del dominio y de los sistemas existentes

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 1.1 | Encajar la solución con las herramientas en uso: Presto, Factucom y certificación en Excel. | Decisión clave de arquitectura: **no sustituir Presto**, sino alimentar su módulo de certificación vía BC3/FIEBDC; eliminar el Excel. |
| 1.2 | Incorporar el control de material, hoy inexistente (las horas ya se registran en Google Forms). | Diseño de la **captura de material por albaranes** (proxy de consumo), evitando el conteo manual. |
| 1.3 | Resolver que los albaranes llegan en PDF y en papel. | Doble vía de captura (buzón dedicado + foto con OCR) y **conciliación albarán–factura**. |

*Valor académico:* **estudio del sistema existente** y diseño de integración respetando las restricciones reales (software de escritorio, formatos estándar del sector).

### Fase 2 — Especificación de requisitos (PRD)

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 2.1 | Elaborar un plan por fases y un **PRD** del producto. | PRD inicial con alcance, roles, flujo, requisitos funcionales, reglas de negocio, riesgos y KPIs. |
| 2.2 | Corregir la fuente de datos de campo (Excel del Google Form en lugar de voz/foto), detallar la facturación en Factucom (pasos 5 y 8) y la conciliación (RF-5.4); entregar en Markdown. | Revisión mayor del PRD; aclaración de los mecanismos de integración. |
| 2.3 | Resolver una **incoherencia detectada por el usuario**: el desplegable se presentaba como obligatorio cuando el texto libre era igualmente válido. | Reescritura del RF-1.6 (requisito real = describir el trabajo) y degradación del desplegable a recomendación (RF-1.6b). |

*Valor académico:* **ingeniería de requisitos** con control de versiones del documento y **detección y corrección de inconsistencias** como ejercicio de calidad documental.

### Fase 3 — Diseño técnico

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 3.1 | Proponer cómo se implementaría el agente para cumplir el PRD. | Definición del **principio rector**: frontera estricta entre razonamiento del LLM (lo difuso) y código determinista (lo exacto y auditable). |
| 3.2 | Redactar el **Documento de Diseño Técnico (DDT)** y detallar el modelo de imputación trabajo→partida. | DDT con arquitectura en capas, modelo de datos y desarrollo en profundidad del motor de imputación (recuperación híbrida, selección por el agente, reconciliación de unidades, bucle de aprendizaje). |

*Valor académico:* **diseño de arquitectura de software** y justificación de decisiones técnicas, con un núcleo algorítmico documentado.

### Fase 4 — Identidad de producto

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 4.1 | Proponer textos para construir el acrónimo del nombre Valer.IA. | Acrónimo adoptado: **Val**oración **A**utomatizada de Lo **E**jecutado y la **R**entabilidad, con doble lectura del sufijo *.IA*. |
| 4.2 | Incorporar el nombre y el acrónimo a la documentación. | Actualización de cabeceras de PRD y DDT. |

### Fase 5 — Documentación de ingeniería (README del PFM)

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 5.1 | Generar el `readme.md` siguiendo la plantilla de proyecto final del máster, con diagramas C4 y Mermaid, **planteando dudas antes de redactar**. | Clarificación previa de cuatro decisiones (enfoque, datos personales, stack, UX) y posterior README completo. |
| 5.2 | Corregir la **legibilidad de los diagramas C4** y sustituir GitHub Actions por **GitLab CI/CD**. | Rediseño de los diagramas como flujos legibles; actualización de la cadena de CI/CD. |
| 5.3 | Resolver **discordancias detectadas** (Node.js vs. React+Vite; referencia a `/docs`) y decidir el modelo de despliegue (imagen vs. artefacto) y la ubicación del registro. | Aclaraciones de coherencia y adopción de **despliegue basado en imágenes** publicadas en el **GitLab Container Registry**. |

*Valor académico:* **documentación técnica normalizada** y **pensamiento crítico** (el asistente recibió la instrucción explícita de preguntar antes de asumir, y el usuario verificó la coherencia interna del resultado).

### Fase 6 — Infraestructura y despliegue

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 6.1 | Generar el pipeline `.gitlab-ci.yml` con etapas test → build → publish → deploy. | Pipeline con tests de backend y frontend, build/publicación de imágenes y despliegue manual. |
| 6.2 | Generar los `Dockerfile` de backend y frontend y el `docker-compose.yml` del host. | Imagen de backend compartida por API y worker; frontend con Nginx; compose de despliegue. |
| 6.3 | Generar el `.env.example`. | Plantilla de variables con separación entre secretos de aplicación y variables de CI/CD. |

*Valor académico:* **prácticas de DevOps** (IaC ligera, CI/CD, contenedorización, gestión de secretos).

### Fase 7 — Persistencia

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 7.1 | Generar el esquema SQL inicial y la primera migración de Alembic del modelo del DDT; reflejar los nuevos ficheros en la estructura del proyecto. | `schema.sql` y migración `0001`; tablas, restricciones, índices (incluido pgvector y FTS) y actualización del árbol de ficheros. |

*Valor académico:* **modelado de datos** y **gestión de migraciones** coherentes con el diseño.

### Fase 8 — Metodología y trazabilidad

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 8.1 | Completar el README con el testing de frontend, la gestión de tickets en **Jira** y el uso de **SDD con OpenSpec** (con su estructura de carpetas). | Sección de tests ampliada; nota de Jira; introducción de OpenSpec y su árbol `openspec/`. |
| 8.2 | Explicitar el encaje entre los tres niveles de especificación. | Aclaración del reparto: **PRD/DDT** (porqué y diseño), **OpenSpec** (qué vigente), **Jira** (cuándo y quién). |
| 8.3 | Generar `openspec/project.md` y la primera spec de capacidad (`imputacion`). | Contexto de proyecto y spec con requisitos en formato Given/When/Then. |

*Valor académico:* **metodología de desarrollo (Spec-Driven Development)** y diseño de la **trazabilidad** especificación → ticket → código.

### Fase 9 — Materialización del repositorio

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 9.1 | Crear la estructura de carpetas definida y ubicar en ella todos los artefactos generados. | Árbol completo del proyecto empaquetado para su despliegue local, con esqueletos para las piezas pendientes. |

### Fase 10 — Evidencia del proceso

| Iteración | Objetivo de la solicitud (síntesis) | Resultado |
|---|---|---|
| 10.1 | Elaborar este documento de bitácora como evidencia académica del proceso. | El presente `prompts.md`. |

## 4. Inventario de artefactos generados

| Artefacto | Tipo | Fase |
|---|---|---|
| `docs/PRD.md` | Documento de requisitos | 2 |
| `docs/DDT.md` | Documento de diseño técnico | 3 |
| `readme.md` | Documentación de ingeniería (plantilla PFM) | 5, 8 |
| `.gitlab-ci.yml` | Pipeline CI/CD | 6 |
| `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf` | Contenedorización | 6 |
| `docker-compose.yml`, `.env.example` | Despliegue y configuración | 6 |
| `backend/db/schema.sql`, `backend/alembic/versions/0001_initial_schema.py` | Modelo de datos y migración | 7 |
| `openspec/project.md`, `openspec/specs/imputacion/spec.md` | Spec-Driven Development | 8 |
| `prompts.md` | Bitácora del proceso | 10 |

## 5. Reflexión final

El proceso ilustra un uso del asistente de IA **como acelerador bajo dirección experta**, no como sustituto del criterio. Las contribuciones de mayor valor no fueron las generaciones automáticas, sino los **puntos de decisión humana**: la reorientación del problema, la detección de incoherencias, la elección de arquitectura (no sustituir las herramientas del cliente; frontera LLM/determinista) y las decisiones de ingeniería (despliegue por imágenes, SDD, trazabilidad). Esa supervisión es, además, coherente con el propio diseño de Valer.IA, cuyo principio es que la IA propone y una persona valida.
