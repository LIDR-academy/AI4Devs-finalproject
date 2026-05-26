# SupportHub — Documento de Producto
> Versión 0.2  
> Estado: En elaboración

---

## 1. Descripción del Producto

### ¿Qué es SupportHub?

SupportHub es un **portal web de soporte al cliente** diseñado para consultoras de software que gestionan incidencias y peticiones de sus clientes a través de Jira internamente, pero carecen de un canal estructurado y transparente hacia el cliente final.

SupportHub actúa como **capa de experiencia de cliente sobre Jira**: el equipo técnico sigue trabajando en Jira como siempre, mientras que el cliente dispone de un portal propio donde crear tickets, hacer seguimiento en tiempo real y comunicarse con el equipo, eliminando por completo la dependencia del email y el WhatsApp como canal de soporte.

---

### Valor Añadido

| Problema actual | Cómo lo resuelve SupportHub |
|---|---|
| El cliente no tiene visibilidad de sus tickets | Portal propio con estado actualizado en tiempo real |
| Comunicación dispersa por email y WhatsApp | Canal centralizado: todo ocurre en el portal |
| Persona "puente" que traduce emails a Jira manualmente | Integración directa: el ticket se crea en Jira automáticamente |
| El cliente pregunta constantemente el estado | Notificaciones automáticas por email ante cualquier cambio |
| Tickets perdidos u olvidados sin respuesta | Registro centralizado, trazable y auditable |
| Sin métricas de soporte | Dashboard con KPIs básicos para el administrador |

---

### Ventajas Competitivas

- **Sin fricción para el equipo técnico**: no cambia el flujo interno, Jira sigue siendo la fuente de verdad.
- **Desarrollado a medida**: sin costes de licenciamiento por usuario (Zendesk, Freshdesk, Jira Service Management).
- **Propiedad total del producto**: adaptable a las necesidades específicas de la consultora sin depender de terceros.
- **Despliegue en AWS**: escalable, seguro y alineado con infraestructura cloud moderna. (Para el proyecto de Master se puede desplegar de manera local con Docker, solo usaría servicios como S3 y SES de AWS).
- **Base para evolución con IA**: arquitectura preparada para incorporar clasificación automática, triaje inteligente y sugerencias de respuesta en versiones futuras.

---

## 2. Funcionalidades Principales

### Módulo 1 — Portal del Cliente

Interfaz web accesible para los usuarios finales del cliente: personas que reportan, consultan y hacen seguimiento de sus incidencias.

| # | Funcionalidad | Descripción |
|---|---|---|
| 1.1 | Registro e inicio de sesión | Acceso mediante invitación enviada por el administrador. Login seguro con email y contraseña. |
| 1.2 | Creación de tickets | Formulario para reportar incidencias: título, descripción, tipo, prioridad y adjuntos. |
| 1.3 | Adjuntos en tickets y comentarios | Soporte para subir archivos (capturas de pantalla, logs, documentos) almacenados en Amazon S3. |
| 1.4 | Listado de tickets | Vista de todos los tickets del cliente con estado actual, leído directamente desde Jira en cada petición. |
| 1.5 | Detalle del ticket | Visualización del hilo completo: descripción, comentarios del equipo y archivos adjuntos — todos leídos desde Jira. |
| 1.6 | Comentarios en ticket | El cliente puede agregar comentarios; se escriben directamente en Jira vía API y se muestran al leer desde Jira. |
| 1.7 | Notificaciones por email | El cliente recibe un email cuando el equipo comenta o cambia el estado de su ticket, con enlace directo al portal. |

---

### Módulo 2 — Panel Administrativo

Interfaz restringida para administradores de la consultora. Permite gestionar el acceso de clientes y obtener visibilidad del uso del portal.

| # | Funcionalidad | Descripción |
|---|---|---|
| 2.1 | Gestión de usuarios cliente | Crear, editar, activar y desactivar cuentas de usuarios del portal. |
| 2.2 | Envío de invitaciones | Envío de email de invitación con enlace de activación de cuenta. |
| 2.3 | Asociación usuario ↔ proyecto Jira | Vincular cada usuario (o empresa cliente) con su proyecto o board correspondiente en Jira. |
| 2.4 | Dashboard de métricas | Resumen visual: tickets creados, abiertos/cerrados, tiempo medio de respuesta, actividad por cliente. |

---

### Módulo 3 — Integración con Jira

**Jira es la base de datos de tickets.** SupportHub actúa como capa de experiencia: lee y escribe directamente en Jira vía API REST. No existe copia local de títulos, descripciones, estados ni comentarios — Jira es la única fuente de verdad para el contenido de los tickets. SupportHub solo almacena un registro mínimo `Ticket` (`Id`, `JiraIssueKey`, `ClientId`, `CreatedAt`) para enlazar la identidad del portal con los datos de Jira.

| # | Funcionalidad | Descripción |
|---|---|---|
| 3.1 | Creación de tickets en Jira | Cuando el cliente crea un ticket en el portal, se crea en tiempo real en el proyecto Jira del cliente correspondiente. Si Jira falla, el cliente recibe el error y no se guarda nada localmente. |
| 3.2 | Consulta de estado y detalle | El estado, descripción y prioridad del ticket se leen directamente desde Jira en cada petición — no hay caché ni copia local. |
| 3.3 | Comentarios bidireccionales | Los comentarios del cliente se escriben en Jira vía API; los comentarios del equipo en Jira se leen directamente desde Jira. |
| 3.4 | Webhook de Jira (notificaciones) | Jira notifica a SupportHub ante cambios de estado o nuevos comentarios. SupportHub genera una notificación al cliente (in-app y/o email) pero no sincroniza datos localmente. |

---

## 3. Modelo de Negocio — Lean Canvas

| Bloque | Contenido |
|---|---|
| **🔴 Problema** | 1. Clientes sin visibilidad de sus incidencias · 2. Comunicación fragmentada por email/WhatsApp · 3. Persona "puente" que carga tickets manualmente en Jira · 4. Sin métricas de soporte |
| **🟡 Solución** | Portal web donde el cliente crea tickets, hace seguimiento y se comunica con el equipo. Integración automática con Jira. Notificaciones por email. Adjuntos via S3. |
| **⭐ Propuesta de Valor Única** | *"Tu equipo en Jira. Tu cliente en SupportHub."* El cliente tiene visibilidad total sobre sus incidencias sin que el equipo cambie su flujo de trabajo. |
| **🏆 Ventaja Injusta** | Desarrollado a medida sin coste de licencias. Propiedad total del código. Integración nativa con Jira existente. Arquitectura preparada para IA en v2. |
| **👥 Segmentos de Clientes** | Consultoras de software con clientes que tienen soporte técnico contratado. Fase 1: uso interno. Fase 2: otras consultoras del mercado. |
| **📊 Métricas Clave** | Tickets creados por portal vs email · Tiempo medio de primera respuesta · % reducción de emails de seguimiento · Satisfacción del cliente (CSAT) |
| **📣 Canales** | Despliegue interno en la consultora. |
| **💰 Costes** | Desarrollo inicial · Infraestructura AWS · Mantenimiento y evolución del producto |

---

*Documento vivo — se actualizará progresivamente a lo largo del proyecto.*
