Eres un experto en Producto (Product Manager) especializado en sistemas orientados a metadatos, además de Analista de Software Senior y Planificador de Proyectos.

Tu misión: generar el BACKLOG COMPLETO y la documentación base del proyecto usando como fuente principal:
- Requerimientos/funcionalidad: @funcionalidad_core.md 
- Contexto global del proyecto: @Project.md 
- Modelo de datos existente: @Database/ (revísalo y, si detectas inconsistencias o faltantes, propón cambios concretos)

NOTA: Como es un proyecto muy largo, la @funcionalidad_core.md es la funcionalidad que necesitamos para poder completar este proyecto, al menos esta funcionalidad, sabemos que se va a tomar mas tiempo pero este seria nuestro primer entregable.

REGLAS GENERALES
- NO inventes features. Si algo no está definido, márcalo como “Pendiente por definir (PpD)” y sugiere preguntas puntuales.
- Sé específico y accionable: nombres claros, criterios verificables, y tickets implementables.
- Mantén consistencia terminológica entre documentos.
- Escribe en español neutro.
- Entrega todo en Markdown, con encabezados H1/H2/H3.
- Usa listas y tablas cuando ayuden a claridad.
- Prioriza por valor de negocio y dependencias técnicas.

OUTPUT: Genera los siguientes entregables, EN ESTE ORDEN:

# 1) Ficha del proyecto
Incluye:
- Nombre del proyecto
- Problema que resuelve
- Objetivo principal y objetivos secundarios
- Stakeholders / usuarios objetivo
- Supuestos y restricciones
- Alcance (in-scope / out-of-scope)
- Dependencias (internas/externas)
- Riesgos principales y mitigaciones
- Métricas de éxito (KPIs)
- Estado actual (según archivos) y próximos pasos

# 2) Descripción general del producto
Incluye:
- Resumen ejecutivo (1–2 párrafos)
- Propuesta de valor
- Casos de uso principales
- Flujos principales (alto nivel)
- Roles y permisos (si aplica; si no, PpD)
- Requerimientos no funcionales (seguridad, performance, auditoría, observabilidad, disponibilidad, compliance) según contexto
- Glosario de términos (orientado a metadatos)

# 3) Arquitectura
Incluye:
- Diagrama textual (tipo “C4” en texto): Contexto → Contenedores → Componentes (solo texto)
- Decisiones de arquitectura (ADRs resumidos)
- Integraciones externas (si existen)
- Observabilidad (logs, métricas, trazas)
- Seguridad (autenticación/autorización, manejo de secretos, auditoría)
- Consideraciones de escalabilidad y resiliencia
- Entornos (dev/stage/prod) y configuración

# 4) Modelo de datos
- Resume el modelo existente en @Database/ (tablas/colecciones, entidades, relaciones, claves)
- Detecta gaps o inconsistencias vs. @funcionalidad_core.md
- Si propones cambios:
  - Lista de cambios sugeridos (con motivo)
  - Impacto en APIs y migraciones
  - Nuevas entidades/campos con definición y constraints
- Incluye un diccionario de datos (tabla por entidad con campos, tipo, nullable, descripción)

# 5) APIs
Define las APIs necesarias en formato claro (REST o GraphQL según el proyecto; si no está definido, sugiere la opción y marca PpD).
Para cada endpoint/operación incluye:
- Método + ruta (o query/mutation)
- Descripción
- Auth requerida (sí/no, tipo)
- Request (schema ejemplo)
- Response (schema ejemplo)
- Errores comunes
- Notas (paginación, filtros, sorting, idempotencia)
Además:
- Convenciones (versionado, naming, códigos de error)
- Requisitos de auditoría y trazabilidad

# 6) Historias de usuario
Crea historias completas (INVEST) basadas en @funcionalidad_core.md:
Para cada historia:
- ID (US-###)
- Título
- Como [rol] quiero [funcionalidad] para [beneficio]
- Descripción
- Criterios de aceptación (Given/When/Then)
- Prioridad (P0/P1/P2)
- Dependencias
- Riesgos / consideraciones
- Métricas o evento de analítica (si aplica)
Incluye al final un “Mapa de historias” agrupado por épicas.

# 7) Tickets de trabajo
Convierte las historias en tickets implementables (Backend/Frontend/Infra/Data/QA/Docs).
Para cada ticket:
- ID (TK-###)
- Tipo (BE/FE/INFRA/DATA/QA/DOCS)
- Título
- Descripción técnica
- Checklist de implementación
- Definición de terminado (DoD)
- Estimación (t-shirt: XS/S/M/L) + justificación breve
- Dependencias (tickets)
- Riesgos
Organízalos por épicas y en orden sugerido de ejecución.

# 8) Pull Requests (OPCIONAL)
SOLO si el repo / estructura sugerida lo permite según @Project.md  .
Si aplica, define una lista de PRs sugeridos:
- PR-###: Título
- Alcance
- Archivos/carpetas afectadas (aprox.)
- Checklist de revisión
Si no aplica o no hay info suficiente, omite por completo esta sección.

AL FINAL
Incluye:
- Lista de “Pendientes por definir (PpD)” con preguntas concretas
- Recomendación de roadmap por fases (MVP → v1 → v2) alineado al backlog
- Resumen de próximos pasos (acción inmediata)

Comienza leyendo @Project.md  , luego @funcionalidad_core.md  , y después revisa @Database  / para validar alineación con la funcionalidad.

Todo esto lo vas a generar dentro de la carpeta @documentation , y el formato que te comparti tendra dentro de esta carpeta el nombre de "readme.md", asi mismo espero que por cada seccion anterior antes comentada hagas carpetas dentro de @documentation con el titulo y el contenido de cada seccion, se muy especifico ya que este será el backlog que usaremos para este proyecto. En las actividades asegurate de colocar si es para PM - FrontEnd - BackEnd - DBA, es decir, especifica quien trabajara esta actividad.

Te comparto el formato: 

## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

### **0.2. Nombre del proyecto:**

### **0.3. Descripción breve del proyecto:**

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**




