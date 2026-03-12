> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


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
```markdown
Quiero diseñar un software para instituciones educativas de primera infancia, con niños de 0 a 5 años, que opciones conoces en el mercado?
```

**Prompt 2:**
```markdown
Me interesa que el MVP se enfoque en dos features: registro de asistencias y registro de incidentes, entendiendo por incidente un hecho relevante, no necesariamente negativo
```

**Prompt 3:**
```markdown
# Tarea 

Con toda la información que tienes crea un documento PRD sobre el producto que contenga: 
- Título con el tipo de documento y el nombre del producto 
- Índice para navegar por el documento 
- Breve descripción del producto 
- Valor agregado y ventajas competitivas de acuerdo a las features que tendrá el MVP y en comparación con las soluciones actuales 
- Descripción general de las principales funcionalidades 

# Entregable 
Documento en formato markdown
```

---

## 2. Arquitectura del Sistema

**Prompt 1:**
```markdown
# Rol
Eres un Arquitecto de software senior especializado en software educativos y con gran experiencia en:

- Patrones de diseño de arquitecturas.
- Distribución de componentes.
- Integración de sistemas externos.
- Patrones de comunicación.

# Requerimientos
- Usa una infraestructura de costo 0.
- La arquitectura debe satisfacer los siguientes requerimientos no funcionales:
    - Simplicidad.
    - Escalabilidad.
    - Mantenibilidad.
    - Seguridad.

# Instrucciones de diseño
- Crea una **arquitectura de alto nivel** para KinderTrack.
- Usa las **mejores prácticas**, **frameworks** y **herramientas**. Prioriza las alternativas gratuitas y de código abierto.
- Considera **toda la información que tienes hasta el momento**, incluyendo el documento de producto PRD y el **data model** de KinderTrack.

# Entregables (en artefactos separados)
- **Descripción general del diseño de la arquitectura** incluyendo:
  - Descripción de componentes principales: Describe los componentes más importantes, incluyendo la tecnología utilizada.
  - Descripción de alto nivel del proyecto y estructura de ficheros: Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.
  - Infraestructura y despliegue: Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se seguirá.
  - Seguridad: Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede
  - Tests: Describe brevemente las estrategias de testing a utilizar

- **Diagrama del sistema en formato plantuml** que represente los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.

**Verifica la sintaxis plantuml** y asegúrate de **corregir cualquier error que pueda ocurrir**.
```

**Prompt 2:**
```markdown
es posible desarrollar la aplicación web con Flutter?
```

**Prompt 3:**
```markdown
Algunas aclaraciones importantes para tu documento:
- Quiero que el proyecto se estructure siguiendo DDD. Además, en el detalle de estructura de archivos no indicaste la carpeta de tests para el backend. Recuerda que debe haber tests de backend y frontend.
- El desarrollo debe hacerse siguiendo la metodología TDD.
- Como ORM prefiero utilizar Prisma.
```

---

### 3. Modelo de Datos

**Prompt 1:**
```markdown
Actúa como un Database Engineer senior con gran experiencia en software educativos. Indentifica la entidades del sistema
```

**Prompt 2:**
```markdown
# Tarea
- Crea un documento con el análisis del modelo de datos de KinderTrack que contenga
  - Título del documento
  - Índice para navegar por el documento
  - Descripción de entidades principales (sección 1). Por cada entidad:
    - Descripción breve de la entidad
    - Nombre y tipo de datos de cada atributo, así como descripción en casos no obvios
    - Claves primarias y foráneas.
    - Relaciones y tipo de relación con cardinalidad
    - Restricciones (unique, not null, etc)
  - Diagrama ER del modelo de datos en format mermaid con el máximo nivel de detalle, indicando claves primarias, claves foráneas, relaciones, etc. (sección 2)

# Entregable
Documento en formato markdown

# Notas
Verifica que todas las relaciones mencionadas en la sección "Descripción de entidades principales" se reflejen en el diagrama generado
```

**Prompt 3:**
```markdown
Sigue habiendo errores de sintaxis. Empecemos denuevo, consulta por documentación oficial sobre sintaxis del formato mermaid y luego vuelve a generar el diagrama revisando antes su sintaxis
```

---

### 4. Especificación de la API

**Prompt 1:**
```markdown
Describe los endpoints principales (un máximo de 3) en formato OpenAPI. Además añade un ejemplo de petición y de respuesta
```

---

### 5. Historias de Usuario

**Prompt 1:**
```markdown
# Rol
Actúa como un Product Manager senior con gran experiencia en proyectos de software educativos

# Tarea
Dados el objetivo del producto KinderTrack y sus funcionalidades principales en 
prd.md, define las user stories necesarias para desarrollar las funcionalidades principales del MVP siguiendo las buenas prácticas y ejemplos indicados en user-story.md.
 
# Entregable
Documento markdown en docs/user-stories/user-stories.md
```

**Prompt 2:**
```markdown
Para tus user stories no has indicado las secciones *Tareas* ni *Historias relacionadas*
```

**Prompt 3:**
```markdown
# Rol
Actúa como un Software Architect y Tech Lead, con gran experiencia en proyectos de software educativos, y especialista en Flutter y Typescript

# Task
- Lee y analiza los documentos #file:prd.md , #file:arquitectura.md , #file:data-model.md .
- Lee y analiza cada user story.
- Para cada user story que esté dentro del alcance del MVP enumera:
  - requerimentos técnicos
  - riesgos potenciales

# Entregable
Documento markdown con el análisis técnico de las user stories en el archivo docs/user-stories/user-stories-tech.md
```

---

### 6. Tickets de Trabajo

**Prompt 1:**
```markdown
# Rol
Eres un Software Architect y Tech Lead con gran experiencia en proyectos de software educativos y especialista en Flutter y Typescript.

# Tarea
1. Debes leer y mantener en contexto los siguientes documentos #file:user-stories.md y #file:user-stories-tech.md . Asegúrate de leer los dos documentos antes de avanzar al siguiente punto.
2. Por cada seccion de las user stories, define los tickets necesarios para desarrollar el MVP. Intenta separar entre tickets de frontend, tickets de backend, tickets de base de datos, etc.

# Entregables
Por cada sección un documento markdown con los tickets correspondientes en docs/tickets/ticket-{seccion}.md
```

**Prompt 2:**
```markdown
Se ha eliminado la user story "US-015" en #file:user-stories.md debido a que no forma parte del scope del MVP, con lo cual debes actualizar el documento de tickets #file:ticket-reportes-seguridad.md en consecuencia
```

**Prompt 3:**
```markdown
Quita el ticket "TICKET-014-BE-02" del archivo #file:ticket-reportes-seguridad.md ya que no responde a una funcionalidad mencionada en las #file:user-stories.md. Además quita cualquier referencia a dicho ticket y actualiza las estimaciones y puntos teniendo en cuenta que se quita un ticket.
```

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
