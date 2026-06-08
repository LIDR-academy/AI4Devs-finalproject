> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.

**Herramientas utilizadas**: Gemini 2.5 Pro (IDE integration), Claude Opus 4.6 (IDE integration via Antigravity). Se usó un sistema de "skills" (instrucciones reutilizables para el agente) y archivado automático de conversaciones para trazabilidad.

> Las conversaciones completas están archivadas en `.user/conversation-history/` del [repositorio del proyecto](https://github.com/jnchacon/components-db).

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

**Prompt 1: Definición de la idea inicial (Sesión 001)**

> *Contexto: Primera sesión del proyecto. Se usó una skill personalizada `/define-idea` que guía al agente a hacer preguntas iterativas hasta agotar la ambigüedad.*

```
Quiero crear un sistema de gestión de componentes eléctricos para una empresa que fabrica equipos de calidad de energía. La información está dispersa en PDFs, carpetas compartidas y hojas de cálculo. Necesito centralizar las especificaciones técnicas, la documentación y los precios.

[El agente hizo ~15 preguntas iterativas sobre el dominio, los roles de usuario, la estructura del árbol documental, el modelo de datos de parámetros, el versionamiento de documentos, etc. Cada respuesta refinó el modelo conceptual.]
```

**Cómo guié al asistente**: Le proporcioné ejemplos concretos del dominio (estructura de catálogo de Siemens, jerarquía de interruptores ABB) y lo dejé proponer vocabulario del dominio que yo validaba o corregía. La skill `/define-idea` forzaba al agente a no asumir nada y preguntar hasta tener claridad total.

**Prompt 2: Creación del PRD (Sesión 004)**

> *Contexto: Se usó la skill `/create-prd` que guía la creación de un PRD modular en 5 fases iterativas.*

```
@[/create-prd]
@[idea-inicial.md]
```

**Cómo guié al asistente**: El prompt fue mínimo — la skill y el documento de idea hacían el trabajo pesado. El agente propuso 7 historias de usuario que yo expandí a 9 añadiendo el rol de Administrador. Rechacé la propuesta de 8 fases y negocié hasta 12 fases más granulares. Corregí definiciones de dominio (ej: un componente NO tiene su propio árbol, es una hoja del árbol).

**Prompt 3: Resolución de preguntas abiertas del PRD**

```
Mis respuestas a las preguntas abiertas:
1. Idioma de la interfaz: Inglés
2. Proveedor de IA: Endpoint en AWS Bedrock o deployment en Azure
3. ¿Los parámetros pueden ser multivaluados?: No. Cada parámetro tiene un único valor por componente.
4. ¿Nomenclatura de Árboles Documentales sigue algún estándar?: No, libre.
```

**Cómo guié al asistente**: Proporcioné decisiones directas y concisas. El agente las incorporó al PRD y generó un "readiness check" con 34 verificaciones que todas pasaron.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1: Decisión de eliminar React a favor de HTMX (Sesión 006)**

```
Estamos en la Fase 3 del SRS (Arquitectura y Tech Stack). La decisión de frontend es clave. En el PRD dijimos "HTMX preferido, React como plan B".

Necesito que analices si HTMX + Alpine.js pueden cubrir TODAS las interfaces del PRD (incluido el editor de árbol con drag-and-drop y los formularios con dependencias entre campos) sin necesidad de React.
```

**Cómo guié al asistente**: El agente produjo un ADR-003 con análisis de 3 alternativas (SPA React, Django + React islands, Django + HTMX + Alpine.js). Incluía 5 patrones de implementación detallados para las interfaces más complejas. Acepté la recomendación de HTMX+Alpine.js sin React, lo que eliminó la necesidad de un build pipeline JS.

**Prompt 2: Diagramas C4 de arquitectura**

```
Genera los diagramas C4 (Level 1 Context y Level 2 Container) en Mermaid para el sistema. Recuerda que es un monolito modular Django, no microservicios.
```

**Cómo guié al asistente**: El primer intento era demasiado complejo. Pedí simplificarlo para reflejar que es un solo proceso Django con PostgreSQL y almacenamiento de archivos. El resultado final tiene 2 diagramas limpios.

### **2.2. Descripción de componentes principales:**

**Prompt 1: Tech stack completo (Sesión 006)**

> *Implícito en el flujo de la skill `/create-srs`, fase 3.*

El agente propuso el tech stack basándose en las restricciones del PRD (Python/Django, on-premise Proxmox, <10 usuarios). Yo confirmé cada decisión:
- python-decouple vs django-environ → acepté python-decouple
- django-treebeard vs django-mptt → acepté treebeard (Materialized Path)
- psycopg3 vs psycopg2 → acepté psycopg3

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1: Estructura del proyecto (Sesión 007)**

```
Diseña la estructura completa de directorios del proyecto Django. Sigue el patrón "nested layout" de Two Scoops of Django con src/ separado de docs/, docker/ y tests/. Cada app debe tener la misma estructura interna estándar.
```

**Cómo guié al asistente**: El agente propuso una estructura inicial que incluía un directorio `frontend/` para React. Le recordé que ADR-003 eliminó React y pedí que lo quitara. También pedí que documentara las reglas de dependencia entre apps (qué app puede importar de cuál).

### **2.4. Infraestructura y despliegue**

**Prompt 1: Definición de infraestructura (Sesión 006)**

```
La infraestructura es on-premise en Proxmox con Docker. Para almacenamiento de archivos usaremos el filesystem local en desarrollo y MinIO (S3-compatible) en producción. El CI/CD será con GitHub Actions (mientras estemos en GitHub) y luego GitLab CI.
```

**Cómo guié al asistente**: Proporcioné las restricciones de infraestructura como decisiones cerradas. El agente las incorporó directamente.

### **2.5. Seguridad**

**Prompt 1: Requisitos de seguridad (Sesión 007)**

> *Generado como parte de la skill `/create-srs`, fase 7.*

```
Para seguridad, ten en cuenta: es una app interna con <10 usuarios. No hay datos de clientes externos. Las protecciones deben ser las estándar de Django (CSRF, XSS, SQL injection) sin sobreingeniería.
```

**Cómo guié al asistente**: Revisé la propuesta y eliminé lo que era excesivo para el contexto (rate limiting, WAF, 2FA). Mantuve las protecciones que Django trae por defecto.

### **2.6. Tests**

**Prompt 1: Estrategia de testing (Sesión 007)**

```
Define la estrategia de testing. Recuerda que el equipo tiene conocimiento limitado de JavaScript, así que los E2E deben ser mínimos y asistidos por IA. Los unit tests deben enfocarse en la capa de servicios.
```

**Cómo guié al asistente**: Acepté la propuesta de 3 niveles (unit/integration/E2E) y los objetivos de cobertura (80% services, 60% global, 5 smoke E2E). Pedí que Playwright generara los tests con ayuda de IA.

---

### 3. Modelo de Datos

**Prompt 1: Diseño del modelo EAV para parámetros (Sesión 006)**

```
Para los valores de parámetros de componentes, necesito un modelo que permita:
1. Cada tipo de componente define qué parámetros aplican
2. Cada componente tiene valores concretos para esos parámetros
3. Los parámetros son de tipos variados (numérico, texto, booleano, enum)
4. La búsqueda paramétrica debe ser eficiente (ej: Ur >= 24 kV AND Ir >= 2000 A)

Analiza las alternativas y recomienda la mejor opción.
```

**Cómo guié al asistente**: El agente analizó 3 alternativas: EAV con texto puro, JSONB por componente, y EAV con columnas tipadas. Produjo el ADR-006 con análisis detallado. Acepté la opción de columnas tipadas por las ventajas en búsquedas sin CAST e índices nativos.

**Prompt 2: ERD completo (Sesión 006)**

```
Genera el ERD completo en Mermaid con todas las entidades, claves primarias, foráneas y relaciones. Incluye las 15 entidades del sistema.
```

**Cómo guié al asistente**: El primer ERD tenía la relación Componente-Árbol como M2M. Corregí que debe ser 1:1 (un componente = una hoja). También pedí que documentara el constraint bidireccional "componentes solo en hojas" con las 4 superficies de validación.

**Prompt 3: Extensiones planificadas (EXT-01 y EXT-02)**

```
Documenta como extensiones futuras dos necesidades que detectamos con el equipo de Compras:
1. Saber qué fabricantes PUEDEN suministrar qué tipos de componentes (independientemente de que estén registrados)
2. Registrar en qué rangos de parámetros puede producir un fabricante, incluyendo dependencias entre parámetros (ej: si Ur está entre 1-2 kV, entonces Qr está entre 50-100 kVAr)
```

**Cómo guié al asistente**: Proporcioné el ejemplo concreto de Hitachi con condensadores fuseless y los rangos de Ur vs Qr. El agente propuso un diseño en dos fases (M2M simple → detalle por parámetros) que acepté.

---

### 4. Especificación de la API

**Prompt 1: Definición de rutas (Sesión 006)**

```
Define todas las rutas Django del sistema, agrupadas por app. Para cada ruta indica: método HTTP, tipo de respuesta (página, HTMX parcial, JSON), descripción y permisos. Recuerda que NO hay API REST — es SSR con HTMX.
```

**Cómo guié al asistente**: El agente produjo ~48 rutas organizadas por 7 apps. Revisé y ajusté las rutas HTMX para que siguieran la convención `htmx/` como prefijo. También pedí que detallara los endpoints OOB swap para el formulario de componentes.

**Prompt 2: Diagramas de secuencia (Sesión 006)**

```
Genera diagramas de secuencia Mermaid para los 5 flujos más complejos del sistema, especialmente los que involucran HTMX y OOB swaps.
```

**Cómo guié al asistente**: Revisé los diagramas y pedí que uno de ellos (crear componente con extracción IA) mostrara explícitamente el flujo OOB swap donde HTMX actualiza tanto los campos de parámetros como la sección de sugerencias IA en una sola respuesta.

---

### 5. Historias de Usuario

**Prompt 1: Propuesta inicial de historias (Sesión 004)**

```
[Dentro del flujo de /create-prd, Fase 2]

Propón las historias de usuario principales. Hay 3 roles identificados: Ingeniero de Producto, Ingeniero de Proyectos, Analista de Compras. Falta el Administrador que también necesita gestionar usuarios y permisos.
```

**Cómo guié al asistente**: El agente propuso 7 historias. Yo añadí US-08 (extracción IA) y US-09 (gestión de usuarios y permisos por el Admin). También añadí el rol de Administrador con su columna en la tabla de roles.

**Prompt 2: Casos de uso críticos (Sesión 006)**

```
[Dentro del flujo de /create-srs, Fase 2]

Define los 5 casos de uso más críticos del sistema con: actor, precondiciones, flujo principal, flujo alternativo, flujo de error y postcondiciones.
```

**Cómo guié al asistente**: Acepté los 5 casos de uso propuestos (crear componente, búsqueda paramétrica, registrar oferta, subir documento, gestionar árbol) sin cambios significativos.

---

### 6. Tickets de Trabajo

**Prompt 1: Tickets de trabajo para la Entrega 1 (Sesión 012 — esta sesión)**

```
Crea 3 tickets de trabajo detallados para el desarrollo: 1 de backend, 1 de frontend, y 1 de base de datos. Cada ticket debe tener ID, tipo, historia asociada, prioridad, estimación, rama, descripción, tareas detalladas, criterios de aceptación y dependencias.
```

**Cómo guié al asistente**: Los tickets fueron generados en esta sesión como parte de la preparación de la plantilla de entrega. Los revisé para asegurar que las tareas fueran lo suficientemente granulares y que los criterios de aceptación fueran verificables.

---

### 7. Pull Requests

**Prompt 1: Documentación de PRs existentes (Sesión 012 — esta sesión)**

```
Documenta las 3 Pull Requests más representativas del proyecto. Usa `gh pr view` para obtener los detalles de cada una.
```

**Cómo guié al asistente**: El agente consultó las PRs reales del repositorio con GitHub CLI y las documentó con: URL, rama, estado, cambios (+/-), descripción e impacto. Seleccioné las PRs #1, #3 y #6 por ser las más representativas del progreso del proyecto.
