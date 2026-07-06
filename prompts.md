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

Actúa como un Senior Product Manager con experiencia en productos digitales de salud, SaaS B2B, definición de MVP, metodologías ágiles y creación de PRDs para desarrollo asistido por IA.

Tu objetivo es ayudarme a generar un PRD claro, profesional y accionable para definir el producto y su primera versión.

Antes de generar el PRD, analiza si existen dudas críticas que impidan definir correctamente el alcance, seguridad, permisos, experiencia principal del usuario o reglas de negocio.

Si existen dudas críticas, primero formula una lista breve y ordenada de preguntas, agrupadas por tema, y espera mis respuestas antes de generar el PRD.

Si no existen dudas críticas, genera el PRD directamente usando únicamente la información disponible.

Si existen dudas no bloqueantes, no detengas el PRD; márcalas como supuestos o preguntas abiertas.

Contexto del producto:

Producto:
Aplicación web para hospital que permita gestionar, subir y consultar historial médico de pacientes de forma simple, segura y organizada.

Objetivo del producto:
Crear una plataforma web donde personal autorizado del hospital pueda consultar perfiles de pacientes, subir archivos médicos, crear usuarios y liberar el perfil del paciente para que este pueda acceder posteriormente a su información médica desde la aplicación.

Usuarios objetivo:

* Pacientes
* Médicos
* Enfermeras / enfermeros
* Administradores

Roles y permisos principales:

Paciente:

* Puede iniciar sesión en la aplicación.
* Puede consultar únicamente su propio perfil médico.
* Puede consultar los archivos médicos asociados a su perfil.
* No puede editar, subir, eliminar o liberar información médica.
* No puede crear usuarios.
* Solo puede acceder a su perfil después de que un médico o administrador lo haya liberado.

Médico:

* Puede iniciar sesión en la aplicación.
* Puede consultar perfiles de pacientes asignados o disponibles según las reglas del hospital.
* Puede subir archivos médicos al perfil del paciente.
* Puede consultar archivos médicos asociados al paciente.
* Puede liberar el perfil del paciente.
* Puede crear usuarios.
* Puede consultar el listado de usuarios creados.
* Puede consultar usuarios con rol de administrador, médico y enfermera/enfermero.
* Al liberar el perfil del paciente, el sistema debe enviar una notificación por correo electrónico al paciente indicando que su perfil ya está disponible para consulta.

Enfermera / enfermero:

* Puede iniciar sesión en la aplicación.
* Puede consultar perfiles de pacientes asignados o disponibles según las reglas del hospital.
* Puede subir archivos médicos al perfil del paciente.
* Puede consultar archivos médicos asociados al paciente.
* No puede liberar el perfil del paciente.
* No puede crear usuarios.

Administrador:

* Puede iniciar sesión en la aplicación.
* Puede realizar todas las acciones disponibles en el sistema.
* Puede consultar perfiles de pacientes asignados o disponibles según las reglas del hospital.
* Puede subir archivos médicos al perfil del paciente.
* Puede consultar archivos médicos asociados al paciente.
* Puede liberar el perfil del paciente.
* Puede crear usuarios.
* Puede consultar el listado de usuarios creados.
* Puede consultar usuarios con rol de administrador, médico y enfermera/enfermero.
* Al liberar el perfil del paciente, el sistema debe enviar una notificación por correo electrónico al paciente indicando que su perfil ya está disponible para consulta.

Problema principal:
Un paciente necesita acceder a su historial médico desde su celular o navegador de forma simple, segura y organizada. El hospital necesita que administradores, médicos y personal de enfermería puedan cargar y consultar información médica de forma controlada, evitando accesos indebidos y asegurando que solo personal autorizado pueda liberar información al paciente.

Restricciones conocidas:

* El producto debe priorizar una versión funcional y usable, evitando funcionalidades innecesarias.
* El sistema debe priorizar seguridad, privacidad y control de acceso por rol.
* El paciente no puede acceder a su perfil hasta que un médico o administrador lo haya liberado.
* Solo el médico y el administrador pueden liberar el perfil del paciente.
* Solo el médico y el administrador pueden crear usuarios.
* Una vez creado un usuario, debe poder consultarse en un listado.
* El listado de usuarios debe permitir consultar usuarios con rol de administrador, médico y enfermera/enfermero.
* Enfermería puede consultar y subir archivos, pero no liberar perfiles ni crear usuarios.
* El paciente únicamente puede consultar su propio perfil.
* Todo el proyecto debe manejarse en un único repositorio tipo monorepo.
* El stack técnico inicial ya está definido y debe considerarse como restricción del proyecto.

Stack técnico definido:

Repositorio:

* Único repositorio tipo monorepo.
* Carpeta separada para frontend.
* Carpeta separada para backend.
* docker-compose.yml en la raíz del repositorio.
* .env.example.
* README.md con instrucciones claras de instalación y ejecución.

Frontend:

* Next.js.
* React.
* TypeScript.
* Tailwind CSS.
* React Hook Form para manejo de formularios.
* Zod para validaciones.
* fetch como cliente HTTP.
* TanStack Query para manejo de datos del backend, caché, loading, errores e invalidación de consultas.
* Zustand para estado global local simple.
* Redux Toolkit solo si se requiere estado global complejo.

Backend:

* Python.
* Django.
* Django REST Framework.
* Django CORS Headers.
* Autenticación con JWT.
* Sesiones solo si el caso lo requiere.
* Documentación de API con Swagger/OpenAPI usando drf-spectacular.

Base de datos y entorno local:

* PostgreSQL.
* Docker Compose para levantar PostgreSQL en desarrollo.
* Volúmenes persistentes para conservar datos.
* Variables de entorno para credenciales y configuración.
* pgAdmin o Adminer como herramienta visual opcional para administrar la base de datos.

El PRD debe incluir:

1. Resumen ejecutivo.
2. Problema a resolver.
3. Objetivos del producto.
4. Usuarios objetivo y stakeholders.
5. Alcance del producto.
6. Funcionalidades principales.
7. Roles, permisos y reglas de negocio.
8. User stories resumidas en formato:
   “Como [usuario], quiero [acción], para [beneficio]”.
9. Requisitos funcionales.
10. Requisitos técnicos generales basados en el stack definido.
11. Requisitos de seguridad y privacidad.
12. Métricas de éxito.
13. Riesgos potenciales.
14. Criterios de aceptación generales.
15. Non-goals / fuera de alcance.
16. Supuestos realizados.
17. Preguntas abiertas.

Consideraciones importantes:

* No modifiques los .md que existen.
* No generes todavía historias de usuario detalladas con criterios de aceptación específicos.
* No generes tareas técnicas.
* No conviertas el PRD en un documento de arquitectura técnica.
* No inventes funcionalidades avanzadas si no son necesarias para la primera versión.
* Usa el stack técnico definido como restricción inicial del proyecto.
* No propongas tecnologías alternativas salvo que exista una razón justificada.
* Cuando haya incertidumbre, márcala como supuesto o pregunta abierta.
* No conviertas supuestos críticos en decisiones finales.
* Si una decisión afecta alcance, seguridad, privacidad, arquitectura, permisos, costos, cumplimiento legal o experiencia principal del usuario, trátala como duda crítica y pregúntala antes de generar el PRD.
* Si no queda claro si los médicos pueden crear cualquier tipo de usuario o solo ciertos tipos, trátalo como pregunta abierta.
* Si no queda claro si el listado de usuarios incluye pacientes además de administrador, médico y enfermera/enfermero, trátalo como pregunta abierta.
* Si no queda claro si los usuarios pueden editarse, desactivarse o eliminarse después de ser creados, trátalo como pregunta abierta y no lo asumas como parte del alcance.
* El documento debe estar enfocado en producto, alcance, reglas de negocio y requisitos.
* Redacta el PRD de forma clara, profesional y accionable para que después pueda usarse como base para crear épicas, historias de usuario y tareas técnicas.

**Prompt 2:**

Con base en el PRD generado previamente y las siguientes respuestas a las preguntas abiertas, refactoriza el PRD para generar una versión final más clara, consistente y accionable.

Respuestas a preguntas abiertas:
1. Reglas de acceso a pacientes (médicos y enfermería)
¿Cuál es la regla de acceso para el MVP?
Respuesta: Todo el personal clínico ve todos los pacientes del hospital

Si aplica asignación: ¿quién asigna pacientes a médicos/enfermería y en qué momento del flujo?
Respuesta: No aplica por lo comentado anteriormente, nuestra App solo hace que un Médico/Admin pueda dar de alta a un paciente y este puede ser consultado por cualquier personal.

2. Flujo de alta del paciente (perfil, usuario y liberación)
¿Cómo se da de alta un paciente en el MVP?
Primero se crea el perfil médico (datos + archivos) y después el usuario con rol paciente, esto únicamente lo puede hacer un Médico y/o Administrador, nota, cuando se libera un usuario por un Médico este debe de crear el rol paciente mencionado, se debe de crear un usuario tipo "paciente " en la BD y a su vez notificar al paciente por correo con usuario y contraseña

¿Puede existir un perfil médico sin usuario de acceso (hasta que médico/admin lo cree y lo libere)?
Si, se puede crear un perfil médico de un usuario y no tener acceso, hasta que se libera al usuario por el Médico / Administrador es cuando se crea el acceso del mismo con un perfil tipo "paciente"

¿La liberación es un acto irreversible en el MVP, o debe poder revocarse (bloquear de nuevo el acceso del paciente)?
Si, liberar un paciente es un acto que no puede revertirse

Al liberar, ¿el paciente ya debe tener cuenta de usuario creada, o la liberación también dispara/ incluye la creación de credenciales?
Cuando un usuario se libera se debe de crear un perfil tipo "paciente" y a su vez enviar un correo con usuario y contraseña para que pueda ingresar al portal

3. Contenido del perfil médico
¿Qué incluye el “perfil médico” en el MVP?
A) y C) , osea Solo datos básicos del paciente (nombre, identificador, contacto, etc.) + archivos adjuntos y Estructura clínica más detallada (antecedentes, diagnósticos, notas, etc.) Aqui puedes agregas solamente la estructura clínica más común no tanto a detalle
¿Qué campos mínimos debe tener el perfil?
conjunto básico: nombre, identificador hospitalario, email, fecha de nacimiento, la estructura clínica mencionada anteriormente puede ir opcional

4. Archivos médicos
¿Qué tipos de archivo debe soportar el MVP? únicamente PDFs
¿Hay requisitos de tamaño máximo o cantidad de archivos por paciente para la primera versión?
No hay limite de cantidad de archivos, sin embargo el tamaño Máximo es de 50mb

5. Seguridad, privacidad y cumplimiento
¿El producto debe alinearse con algún marco normativo concreto? (p. ej. LFPDPPP México, NOM-024, HIPAA, GDPR, otro, o solo “buenas prácticas de seguridad” para MVP académico)
El producto debe seguir buenas prácticas de seguridad y privacidad, tomando como referencia la LFPDPPP de México porque manejará datos sensibles de salud.
Esto se usará para definir controles mínimos como autenticación, permisos por rol, protección de archivos médicos y restricciones sobre quién puede consultar, subir o liberar información del paciente.
La NOM-024 puede considerarse solo como referencia general, no como cumplimiento obligatorio para esta primera versión.

¿Se requiere auditoría de accesos en el MVP (quién consultó qué perfil/archivo y cuándo), o queda fuera de alcance inicial?
Si, se requiere auditoria

6. Alcance institucional
¿El MVP es para un único hospital (una instancia) o debe contemplar varios hospitales en la misma plataforma? Es para un único Hospital

- Tipos de usuario que puede crear un médico:
Solo pacientes
- Si el listado de usuarios incluye pacientes además de admin/médico/enfermería:
Debe haber dos apartados separados:
*Un listado general de pacientes.
*Un listado de staff interno, que incluya únicamente médicos, administradores y enfermeras/enfermeros.
Los pacientes no deben mezclarse en el listado de staff interno.

- Si los usuarios pueden editarse, desactivarse o eliminarse después de crearse: 
Si el paciente no ha sido liberado puede editarse, incluyendo la subida de sus archivos, si el usuario es liberado no se podrá editar

Objetivo de este paso:
Actualizar el PRD usando únicamente las respuestas proporcionadas, resolviendo dudas previamente abiertas y ajustando el documento sin cambiar innecesariamente su alcance.

Reglas:

* Mantén la estructura original del PRD.
* Conserva el enfoque del producto, alcance, reglas de negocio y requisitos.
* Actualiza supuestos que ya hayan sido confirmados por las respuestas.
* Elimina preguntas abiertas que ya hayan sido respondidas.
* Conserva como preguntas abiertas los puntos que aún no estén definidos.
* No agregues funcionalidades nuevas fuera de las respuestas proporcionadas.
* No inventes decisiones que no estén explícitamente confirmadas.
* No conviertas supuestos críticos en decisiones finales si las respuestas no los aclaran completamente.
* Si una respuesta es ambigua o incompleta, refleja esa ambigüedad como supuesto o pregunta abierta.
* Mantén fuera de alcance las funcionalidades que no pertenezcan a la primera versión, solo si aplica.
* No generes historias de usuario detalladas con criterios de aceptación específicos.
* No generes tareas técnicas.
* No conviertas el PRD en un documento de arquitectura técnica.
* Respeta el stack técnico definido previamente, salvo que las respuestas indiquen un cambio explícito.
* Mejora redacción, claridad y consistencia del PRD sin alterar el objetivo original del producto.

Resultado esperado:
Entrega una versión final refinada del PRD, lista para ser usada como base para crear épicas, historias de usuario y tareas técnicas en pasos posteriores.


---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
