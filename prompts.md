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

**Prompt 1:*tengo en mente un programa para gestión de taller mecánico, web app. donde el usuario será empleado del taller, puede tener rol de administrador o de mecánico. Tendrá que iniciar sesión. El administrador puede crear usuarios o darlos de baja. El administrador y mecánico podrán registrar nuevos clientes, nuevos autos.  Se debe llevar registro de los vehículos, diagnósticos, reparaciones y mantenimientos. Cuando un vehículo ingresa, se le debe crear una lista de tareas, la cual podría incrementar según avancen las revisiones, por ejemplo el vehículo ingresa por un sonido y se registra la tarea de revisión, pero durante la revisión se pueden registrar otras tareas como cambio de partes, ajustes, etc. Al finalizar cada tarea se podrá registrar el costo de esa tarea para el cliente. Cuando se finalicen todas las tareas, el administrador podrá visualizar en un form los vehículos listos para contactar al dueño. Esa vista tendrá las columnas de placa, modelo, propietario y monto por pagar. Si selecciona el vehículo podrá ver las tareas realizadas y el costo por cada una. como experto en desarrollo de software dame un archivo markdown con una breve descripción del software, su valor añadido, explicación de las principales funcionalidades, para que apartir de él, en otra iteracción una IA pueda darme artefactos como PRD, proponer arquitectura, dar modelos de datos e historias de usuarios.*

**Prompt 2:*deseables: Poder marcar en la vista de listos para contactar cuando ya se hizo el contacto para el cliente (con fecha y hora). Que una vez que se haya contactado se envíe un email al cliente con copia al administrador del taller. Otro deseable es que un vehículo que ha se haya registrado en el pasado y que cambie de propietario, se pueda actualizar al nuevo propietario. Modifica profesionalmente el md entregado, para que en la sección de futuras versiones tenga estas funcionalidades.*

**Prompt 3:*Otro deseable, el administrador podrá tener una lista de vehículos próximos a dar mantenimiento, como un recordatorio. De la cual, pueda enviar un correo a toda la lista, o a vehículos seleccionados, invitando al propietario a sacar su cita para la visita. Para aquellos vehiculos que tengan más de 6 meses de no venir al taller. El admistrador podrá marcar los vehículos que desee como "no volver a recordar" para que dejen de aparecer en la lista.*

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:*Actua como arquitecto de software senior, dado el proyecto actual, cual sería la arquitectura adecuada para su implementación?*

**Prompt 2:*actualiza en @readme.md  la sección 2.1, 2.2 y 2.3 según lo que me has mencionado.*

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:*
Quiero que realices la Descripción de componentes principales para el proyecto **MecaTrack**.

## Objetivo
Escribe una sección técnica, clara y bien estructurada que describa los componentes principales del sistema a nivel de arquitectura, tomando como base las historias de usuario, el alcance del MVP y las decisiones arquitectónicas previstas.

## Contexto del proyecto
MecaTrack es una aplicación web para la gestión operativa de un taller mecánico. El producto debe cubrir funcionalidades como:
- autenticación de usuarios
- gestión de usuarios
- registro y búsqueda de clientes
- registro y búsqueda de vehículos
- creación de órdenes de trabajo
- gestión de tareas dentro de la orden
- registro de diagnósticos y reparaciones
- panel de vehículos listos para entrega
- historial de vehículos y clientes

## Instrucciones
1. Basa la redacción en:
   - historias de usuario
   - criterios de aceptación
   - alcance del MVP
   - decisiones arquitectónicas definidas para el sistema
2. Describe al menos estos componentes:
   - **Frontend**
   - **Backend**
   - **Base de datos**
   - **Autenticación y autorización**
   - **Integraciones externas o componentes previstos para futuras versiones**, si aplica
3. Para cada componente, explica:
   - su responsabilidad principal
   - la tecnología utilizada o prevista
   - los elementos funcionales que abarca dentro del sistema
4. Si resulta útil, incluye una tabla con:
   - componente
   - tecnología
   - responsabilidad
   - alcance
5. Si aplica, incluye una tabla adicional con los módulos funcionales del backend alineados con las historias de usuario.
6. Usa lenguaje técnico, claro y apropiado para documentación académica/profesional.


## Pistas del contenido esperado
La sección puede contemplar componentes como:
- un **frontend web** para uso interno del taller
- un **backend API REST** para centralizar la lógica de negocio
- una **base de datos relacional** para usuarios, clientes, vehículos, órdenes de trabajo y tareas
- un mecanismo de **autenticación y control de acceso por roles**
- componentes previstos para futuras extensiones, como notificaciones o recordatorios

## Formato esperado

Usa subtítulos y tablas cuando aporten claridad, por ejemplo:
- Frontend (capa de presentación)
- Backend (capa de aplicación)
- Base de datos
- Autenticación y autorización
- Integraciones externas o futuras extensiones

## Restricciones
- No conviertas la sección en una lista de tareas.
- No repitas literalmente las historias de usuario.
- No inventes detalles innecesarios que no aporten a la comprensión de los componentes principales.

*

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:*
Genera la **descripción de alto nivel del proyecto y la estructura de ficheros** para el proyecto **MecaTrack**

## Objetivo
Producir una sección técnica, clara y bien organizada que explique cómo está estructurado el proyecto a nivel general, cuáles son sus partes principales y cómo se distribuyen los archivos y carpetas más relevantes dentro del repositorio.

## Contexto del proyecto
MecaTrack es una aplicación web para la gestión operativa de un taller mecánico. El sistema contempla funcionalidades como:
- autenticación de usuarios
- gestión de usuarios
- registro y búsqueda de clientes
- registro y búsqueda de vehículos
- creación de órdenes de trabajo
- gestión de tareas
- registro de diagnósticos y reparaciones
- panel de vehículos listos para entrega
- historial de vehículos y clientes

## Instrucciones
1. Explica a alto nivel cómo está organizado el proyecto dentro del repositorio.
2. Describe las principales carpetas y su propósito dentro de la solución.
3. Incluye una representación estructurada del árbol de directorios con las rutas más importantes del proyecto.
4. Después del árbol, agrega una tabla breve que explique el propósito de las rutas principales.
5. Mantén el foco en los elementos que realmente ayudan a entender la organización del proyecto.
6. Usa lenguaje técnico, claro y adecuado para documentación académica o profesional.
7. Mantén consistencia con el resto del `readme.md`.

## Contenido esperado
La salida debe cubrir, cuando aplique:
- carpeta raíz del proyecto
- aplicaciones principales
- backend
- frontend
- carpetas de código fuente
- módulos o features principales
- archivos de configuración relevantes
- archivos de documentación relevantes
- organización general del repositorio

## Formato esperado


La estructura puede incluir:
- un párrafo introductorio
- un bloque de árbol de directorios
- una tabla con rutas y propósitos
- un breve cierre explicando por qué esta organización favorece el desarrollo del sistema*

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:*
Genera la sección **Infraestructura y despliegue** para el proyecto **MecaTrack**, en un formato listo para incluir en el `readme.md`, basándote en la implementación real del proyecto y en su configuración actual de despliegue.

## Objetivo
Producir una sección técnica, clara y bien estructurada que describa cómo está desplegado el sistema, qué componentes de infraestructura participan, cómo se comunican entre sí y cuál es el proceso actual de despliegue.

## Instrucciones
1. Basa la redacción en la configuración real del proyecto y en los archivos existentes de despliegue.
2. Describe la infraestructura actual del sistema, incluyendo como mínimo:
   - frontend
   - backend
   - base de datos
   - contenedores o servicios involucrados
   - red o flujo de comunicación entre componentes
3. Explica cómo se realiza el despliegue actualmente:
   - desde qué archivo o mecanismo se levanta el sistema
   - qué servicios se construyen
   - qué servicios se exponen al host
   - qué variables o configuraciones relevantes intervienen
4. Incluye un diagrama simple, preferiblemente en Mermaid, que represente la relación entre navegador, frontend, backend y base de datos.
5. Si existe separación entre entorno de desarrollo y entorno productivo, indícalo claramente.
6. Explica el flujo real de arranque del sistema, por ejemplo:
   - construcción de imágenes
   - inicialización de la base de datos
   - aplicación de migraciones
   - seed de datos
   - arranque de la API y frontend
7. Si hay consideraciones operativas importantes, inclúyelas, por ejemplo:
   - persistencia de datos en volúmenes
   - puertos expuestos
   - dependencias entre contenedores
   - restricciones o advertencias de despliegue
8. Usa lenguaje técnico, claro y apropiado para documentación académica/profesional.
9. Mantén consistencia con el resto del `readme.md`.

## Contenido esperado
La sección debe reflejar la infraestructura realmente usada en el proyecto, por ejemplo:
- despliegue con Docker Compose
- contenedor de PostgreSQL
- contenedor de API
- contenedor de frontend
- puertos publicados
- volumen persistente para la base de datos
- flujo de comunicación web → api → base de datos

## Formato esperado
Actualiza el readme.md en la sección: **2.4. Infraestructura y despliegue**

La salida debe incluir, en este orden cuando sea útil:
1. un párrafo introductorio
2. un diagrama de infraestructura en Mermaid
3. una explicación breve de cada componente de infraestructura
4. una explicación del proceso de despliegue actual
5. una lista breve de consideraciones operativas o decisiones relevantes

## Restricciones
- No inventes infraestructura que no exista en el proyecto.
- No describas un despliegue idealizado si no corresponde al estado real.
- No conviertas la sección en una guía paso a paso de instalación detallada; debe centrarse en arquitectura de despliegue e infraestructura.
- No uses placeholders vacíos.
- No repitas secciones ya cubiertas como modelo de datos o descripción funcional del sistema.
- No agregues servicios externos que no estén realmente integrados.
*

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:*
Genera la sección **Seguridad** para el proyecto **MecaTrack**, en un formato listo para incluir en el `readme.md`, basándote en la implementación real del proyecto y en su configuración actual.

## Objetivo
Producir una sección técnica, clara y bien estructurada que describa las principales prácticas, mecanismos y decisiones de seguridad implementadas en el sistema, explicando cómo protegen el acceso, los datos y las operaciones sensibles.

## Instrucciones
1. Basa la redacción en la implementación real del proyecto y en su configuración actual.
2. Describe las prácticas de seguridad actualmente presentes en el sistema, incluyendo como mínimo:
   - autenticación
   - autorización
   - manejo de contraseñas
   - gestión de sesión
   - protección de rutas y endpoints
   - validación de entrada
   - control de intentos de acceso o rate limiting
3. Explica, cuando aplique:
   - qué mecanismo se usa
   - qué protege
   - cómo se aplica dentro del sistema
4. Si existen diferencias relevantes entre frontend y backend en materia de seguridad, indícalas claramente.
5. Si hay limitaciones, compensaciones o aspectos que están resueltos parcialmente, menciónalos de forma honesta.
6. Usa lenguaje técnico, claro y apropiado para documentación académica/profesional.
7. Mantén consistencia con el resto del `readme.md`.

## Contenido esperado
La sección debe reflejar la seguridad realmente usada en el proyecto, por ejemplo:
- autenticación con JWT
- refresh token
- cookie `httpOnly`
- hash de contraseñas con bcrypt
- autorización por roles
- guards en backend
- protección de rutas en frontend
- validación con DTOs y pipes
- rate limiting en login
- manejo de cuentas inactivas
- tratamiento de errores de autenticación y autorización

## Formato esperado
Actualiza el `readme.md` en la sección: **2.5. Seguridad**

La salida debe incluir, cuando sea útil:
1. un párrafo introductorio
2. una tabla o subsecciones con los mecanismos principales de seguridad
3. una breve explicación de cómo se combinan backend y frontend para proteger el sistema
4. una breve lista de limitaciones o consideraciones actuales

## Restricciones
- No inventes controles de seguridad que no existan en el proyecto.
- No describas medidas ideales si no corresponden al estado real.
- No conviertas la sección en una guía teórica general sobre seguridad.
- No uses placeholders vacíos.
- No repitas contenido funcional ya cubierto en otras secciones salvo cuando sea necesario para explicar una decisión de seguridad.
- No agregues herramientas o servicios externos que no estén realmente integrados.

*

**Prompt 2:*

Actúa como un **auditor senior de ciberseguridad de aplicaciones web**, con experiencia en revisión de código, arquitectura, despliegue, autenticación, autorización, seguridad de APIs, contenedores Docker, bases de datos y hardening de entornos productivos.
Quiero que realices una **auditoría de seguridad técnica** del sistema **MecaTrack**, basándote en el código, la configuración, la documentación y la infraestructura disponible en el repositorio.
## Objetivo
Identificar vulnerabilidades, malas prácticas, configuraciones inseguras, riesgos arquitectónicos y debilidades operativas en el sistema, priorizando hallazgos reales y accionables.
## Alcance de la auditoría
Revisa, como mínimo, estas áreas:
1. **Autenticación**
   - login
   - gestión de sesiones
   - JWT
   - refresh tokens
   - expiración de tokens
   - revocación de sesiones
   - mensajes de error sensibles
   - protección contra brute force
2. **Autorización**
   - control de acceso por roles
   - validación de permisos en backend
   - protección de rutas en frontend
   - posibilidad de escalamiento horizontal de privilegios
   - acceso indebido a recursos de otros usuarios o roles
3. **Validación y sanitización**
   - validación de inputs
   - DTOs
   - pipes
   - protección contra payloads inesperados
   - riesgo de inyección
   - manejo de parámetros, query strings y body
4. **API y backend**
   - endpoints sensibles
   - exposición de datos internos
   - manejo de errores
   - filtrado de información sensible
   - consistencia entre frontend y backend
   - riesgos de lógica de negocio
5. **Frontend**
   - exposición de datos sensibles
   - almacenamiento de tokens
   - protección de rutas
   - comportamiento frente a sesión expirada
   - fuga de información a través de UI o cliente HTTP
6. **Base de datos**
   - seguridad de acceso
   - migraciones
   - seeds
   - scripts administrativos
   - integridad referencial
   - riesgos por datos de prueba, limpieza de datos o scripts peligrosos
7. **Configuración y secretos**
   - uso de `.env`
   - secretos hardcodeados
   - defaults inseguros
   - claves JWT
   - credenciales en documentación o scripts
   - fugas accidentales en README, logs o archivos auxiliares
8. **Infraestructura y despliegue**
   - Dockerfiles
   - docker-compose
   - puertos expuestos
   - separación entre entornos
   - hardening de contenedores
   - persistencia de datos
   - riesgos derivados del despliegue local/productivo
9. **Logging y manejo de errores**
   - exposición de información sensible en logs
   - errores demasiado verbosos
   - trazas útiles para atacantes
   - consistencia de respuestas `401`, `403`, `404`, `409`, `500`
10. **Dependencias y superficie de ataque**
   - dependencias críticas
   - librerías de autenticación
   - librerías de red o parsing
   - posibles riesgos de supply chain si son visibles en el proyecto
## Criterios de evaluación
Usa como referencia:
- **OWASP Top 10**
- **OWASP ASVS** (nivel práctico, no formal)
- buenas prácticas de seguridad para:
  - NestJS
  - Next.js
  - JWT
  - PostgreSQL
  - Docker
  - aplicaciones internas con roles
## Instrucciones de trabajo
1. Basa tu análisis **solo en lo que realmente exista** en el proyecto.
2. **No inventes vulnerabilidades**. Si algo no puede confirmarse, márcalo como **riesgo potencial** o **supuesto**.
3. Prioriza hallazgos con evidencia concreta.
4. Señala tanto problemas técnicos como problemas de diseño u operación.
5. Si detectas algo correcto o bien implementado, también menciónalo brevemente.
6. No modifiques archivos ni ejecutes acciones destructivas.
7. Si necesitas asumir algo, dilo explícitamente.
## Formato de salida
Entrega el resultado con esta estructura:
### 1. Resumen ejecutivo
- nivel general de seguridad del sistema
- principales riesgos
- nivel de urgencia general
### 2. Hallazgos
Para cada hallazgo incluye:
- **Título**
- **Severidad** (`Crítica`, `Alta`, `Media`, `Baja`, `Informativa`)
- **Área afectada**
- **Descripción**
- **Evidencia** (archivo, configuración, módulo, endpoint o flujo)
- **Impacto**
- **Escenario de explotación o fallo**
- **Recomendación concreta de remediación**
### 3. Buenas prácticas ya presentes
- enumera controles ya implementados correctamente
### 4. Riesgos operativos / de despliegue
- problemas relacionados con entornos, Docker, puertos, datos reales vs pruebas, acceso a BD, etc.
### 5. Acciones prioritarias
- lista corta de correcciones inmediatas en orden de prioridad
### 6. Riesgo residual
- qué riesgos seguirían existiendo aunque se apliquen las correcciones principales
## Reglas de calidad
- Ordena los hallazgos por severidad.
- Sé preciso, técnico y accionable.
- Evita explicaciones genéricas.
- No hagas un checklist vacío: quiero una auditoría real, no teoría.
- Si no encuentras una vulnerabilidad crítica, dilo claramente.
- Si una práctica es aceptable para un entorno interno pero no para producción endurecida, indícalo.
Empieza la auditoría ahora.
*

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:*
Genera la sección **Tests** para el proyecto **MecaTrack**, en un formato listo para incluir en el `readme.md`, basándote en la implementación real del proyecto y en su configuración actual de pruebas.

## Objetivo
Producir una sección técnica, clara y bien estructurada que describa qué tipos de pruebas existen en el proyecto, qué partes del sistema cubren, cómo se organizan y qué nivel de confianza aportan al funcionamiento del MVP.

## Instrucciones
1. Basa la redacción en la implementación real del proyecto y en los archivos actuales de testing.
2. Describe las pruebas actualmente presentes en el sistema, incluyendo como mínimo:
   - pruebas unitarias
   - pruebas end-to-end del backend
   - pruebas end-to-end del frontend
3. Explica, cuando aplique:
   - qué herramienta se usa
   - qué capa del sistema cubre
   - qué flujos o comportamientos valida
   - cómo se ejecutan esas pruebas dentro del proyecto
4. Si hay separación entre pruebas del backend y del frontend, indícalo claramente.
5. Si existen limitaciones, cobertura parcial o áreas aún no cubiertas, menciónalas de forma honesta.
6. Usa lenguaje técnico, claro y apropiado para documentación académica/profesional.
7. Mantén consistencia con el resto del `readme.md`.

## Contenido esperado
La sección debe reflejar el esquema de pruebas realmente usado en el proyecto, por ejemplo:
- pruebas unitarias con Jest
- pruebas e2e del backend
- pruebas Playwright para frontend
- validación de autenticación
- validación de usuarios, clientes, vehículos, órdenes de trabajo, tareas, entrega e historial
- pruebas de flujos completos relevantes para el MVP

## Formato esperado
Actualiza el `readme.md` en la sección: **2.6. Tests**

La salida debe incluir, cuando sea útil:
1. un párrafo introductorio
2. una tabla o subsecciones con los tipos principales de prueba
3. una breve explicación de qué cubre cada nivel de testing
4. una breve lista de limitaciones o consideraciones actuales
5. como aplicar pruebas de regresión para validar que nuevas funcionalidades no dañen lo existente.

## Restricciones
- No inventes suites de pruebas que no existan en el proyecto.
- No describas una cobertura idealizada si no corresponde al estado real.
- No conviertas la sección en un tutorial detallado de ejecución paso a paso.
- No uses placeholders vacíos.
- No repitas funcionalidades del sistema salvo cuando sea necesario para explicar la cobertura de pruebas.
- No agregues herramientas de testing que no estén realmente integradas.

*

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:*basado en las historias de usuario mejoradas. Por favor construye el modelo de datos y su diagrama en codigo de mermaid.*

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:*
Genera la sección **Especificación de la API** para el proyecto **MecaTrack**, en un formato listo para incluir en el `readme.md`, basándote en la implementación real del backend y en los archivos OpenAPI existentes del proyecto.

## Objetivo
Producir una sección técnica, clara y bien estructurada que documente los endpoints principales de la API del sistema, mostrando de forma resumida qué operaciones expone el backend, qué propósito cumplen y cómo se usan dentro del MVP.

## Instrucciones
1. Basa la redacción en la implementación real del backend y en la especificación OpenAPI disponible en el proyecto.
2. Selecciona y documenta los **endpoints principales**, priorizando aquellos que mejor representen el flujo central del sistema.
3. La selección debe reflejar el alcance del MVP y cubrir, en la medida de lo posible, operaciones relevantes como:
   - autenticación
   - gestión de usuarios
   - clientes o vehículos
   - órdenes de trabajo
   - tareas o entrega
   - historial
4. Si el enunciado o la estructura del `readme.md` sugiere un máximo de 3 endpoints principales, condensa la explicación para destacar los más representativos, pero puedes mencionar que el proyecto dispone de especificaciones adicionales por dominio.
5. Para cada endpoint documentado, explica:
   - método HTTP
   - ruta
   - propósito
   - rol o contexto de uso
   - ejemplo de request, si aplica
   - ejemplo de response, si aplica
6. Si existen varios archivos OpenAPI por dominio, menciónalos explícitamente como referencia complementaria.
7. Usa lenguaje técnico, claro y apropiado para documentación académica/profesional.
8. Mantén consistencia con el resto del `readme.md`.

## Contenido esperado
La sección debe reflejar la API realmente disponible en el proyecto, por ejemplo:
- endpoints de autenticación
- endpoints de usuarios
- endpoints de clientes o vehículos
- endpoints de órdenes de trabajo
- endpoints de tareas o notas técnicas
- endpoints de entrega
- endpoints de historial

También debe dejar claro que existen especificaciones OpenAPI separadas por dominio, si ese es el caso.

## Formato esperado
Actualiza el `readme.md` en la sección: **4. Especificación de la API**

La salida debe incluir, cuando sea útil:
1. un párrafo introductorio
2. una tabla breve con los archivos OpenAPI disponibles por dominio
3. la documentación resumida de los endpoints principales
4. ejemplos de request/response para los endpoints seleccionados
5. una nota breve sobre cómo esta API soporta el flujo del MVP

## Restricciones
- No inventes endpoints que no existan en el proyecto.
- No describas contratos ideales si no corresponden a la implementación real.
- No conviertas la sección en un volcado completo de OpenAPI; debe ser una síntesis útil para el `readme.md`.
- No uses placeholders vacíos.
- No repitas el modelo de datos salvo cuando sea necesario para explicar request/response.
- No agregues servicios o rutas externas que no estén realmente integradas.

Entrega únicamente el bloque final redactado para esa sección.
*

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:* Se pide a Claude: Basado en el archivo readme.md ahora seria generar las US
¿Cómo querés generar las US?
P: ¿Cómo querés generar las US?
R: Que Claude las genere ahora mismo leyendo tu README*

**Prompt 2:*aplicación de comando /enrich-us + US-.md para todas las US*

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:*
#Creación de tickets de backend a partir US

/plan-backend-ticket US-001-autenticacion.md
/plan-backend-ticket @us/US-002-gestion-usuarios.md 
/plan-backend-ticket @us/US-003-registro-clientes.md 
/plan-backend-ticket @us/US-004-registro-vehiculos.md
/plan-backend-ticket @us/US-005-ordenes-trabajo.md
/plan-backend-ticket para US-006
/plan-backend-ticket para US-007
/plan-backend-ticket para US-008
/plan-backend-ticket para US-009
*

**Prompt 2:*
/plan-frontend-ticket @us/US-001-autenticacion.md 
/plan-frontend-ticket para US-002-gestion-usuarios
/plan-frontend-ticket para US-003-registro-clientes
/plan-frontend-ticket para US-004-registro-vehiculos
/plan-frontend-ticket para US-005-ordenes-trabajo
/plan-frontend-ticket @us/US-006-gestion-tareas.md 
/plan-frontend-ticket @us/US-007-diagnosticos-reparaciones.md 
/plan-frontend-ticket @us/US-008-panel-entrega.md 
/plan-frontend-ticket para @us/US-009-historial.md 
*

**Prompt 3:*
Genera la sección **Tickets de Trabajo** para el proyecto **MecaTrack**, en un formato listo para incluir en el `readme.md`, basándote en la implementación real del proyecto, en las historias de usuario existentes y en los artefactos técnicos ya presentes en el repositorio.

## Objetivo
Producir una sección técnica, clara y bien estructurada que documente **3 tickets de trabajo principales del desarrollo**: uno de **backend**, uno de **frontend** y uno de **base de datos**, con el nivel de detalle suficiente para que otro desarrollador pueda ejecutar cada tarea de inicio a fin siguiendo buenas prácticas.

## Instrucciones
1. Basa la redacción en:
   - la implementación real del proyecto
   - las historias de usuario del repositorio
   - los planes técnicos existentes
   - los archivos y módulos realmente presentes en la solución
2. Selecciona **3 tickets representativos del desarrollo**, distribuidos así:
   - **1 ticket de backend**
   - **1 ticket de frontend**
   - **1 ticket de base de datos**
3. Los tickets elegidos deben corresponder a funcionalidades importantes del MVP ya implementado, por ejemplo:
   - autenticación
   - gestión de usuarios
   - clientes o vehículos
   - órdenes de trabajo
   - tareas y notas técnicas
   - panel de entrega
   - historial
4. Para cada ticket, documenta como mínimo:
   - título del ticket
   - tipo (`Backend`, `Frontend`, `Database`)
   - contexto o problema
   - objetivo
   - alcance
   - fuera de alcance, si aplica
   - requisitos funcionales y técnicos
   - criterios de aceptación
   - componentes, módulos o archivos impactados
   - plan de implementación a alto nivel
   - estrategia de pruebas
   - dependencias, riesgos o consideraciones
5. Mantén el enfoque en tickets que realmente reflejen trabajo importante realizado en el proyecto, no ejemplos genéricos.
6. Si el proyecto ya tiene un ticket parcialmente documentado en el `readme.md`, puedes conservar la idea pero debes unificar el nivel de detalle con los otros dos.
7. Usa lenguaje técnico, claro y apropiado para documentación académica/profesional.
8. Mantén consistencia con el resto del `readme.md`.

## Contenido esperado
La sección debe dejar claro:
- qué problema resolvía cada ticket
- qué parte del sistema tocaba
- qué cambios requería
- cómo debía validarse
- por qué fue relevante dentro del desarrollo del MVP

## Formato esperado
Actualiza el `readme.md` en la sección: **6. Tickets de Trabajo**

La salida debe incluir:
1. una breve introducción a la sección
2. **Ticket 1 — Backend**
3. **Ticket 2 — Frontend**
4. **Ticket 3 — Base de datos**
5. cada ticket con suficiente detalle operativo para servir como especificación de trabajo

## Estructura sugerida para cada ticket
Puedes usar una estructura como esta para cada uno:

- **Título**
- **Tipo**
- **Objetivo**
- **Contexto**
- **Alcance**
- **Fuera de alcance**
- **Requisitos**
- **Criterios de aceptación**
- **Implementación propuesta o realizada**
- **Archivos / módulos implicados**
- **Plan de pruebas**
- **Riesgos / dependencias**

## Restricciones
- No inventes tickets que no correspondan al trabajo real del proyecto.
- No describas tareas ideales si no se relacionan con funcionalidades existentes.
- No conviertas los tickets en simples resúmenes funcionales; deben sentirse como tickets técnicos ejecutables.
- No uses placeholders vacíos.
- No agregues herramientas, módulos o flujos que no estén realmente integrados en el proyecto.
- No hagas los tickets demasiado breves; cada uno debe tener suficiente detalle para desarrollo, validación y revisión.

Entrega únicamente el bloque final redactado para esa sección.
*

---

### 7. Pull Requests

**Prompt 1:*https://github.com/LIDR-academy/AI4Devs-finalproject/pull/198*

**Prompt 2:**

**Prompt 3:**
