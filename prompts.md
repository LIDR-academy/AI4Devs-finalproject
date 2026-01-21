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
Eres un ingeniero y arquitecto full-stack senior. Quiero que construyas un MVP llamado **“CitaYa”**, una aplicación web para la reserva de citas médicas.

A continuación se presenta el Documento de Especificación Funcional (FSD):

**OBJETIVO**
Permitir a los pacientes buscar médicos, reservar citas, recibir correos de confirmación y calificar a los médicos.
Los médicos pueden gestionar su agenda, verificar sus credenciales, recibir notificaciones y ver sus calificaciones.
El sistema debe manejar autenticación, notificaciones, geolocalización y almacenamiento de datos.

**ACTORES**

* Paciente
* Médico
* Administrador del sistema / Automatización
ß
**DENTRO DEL ALCANCE (IN-SCOPE)**

* Autenticación con roles (médico/paciente)
* Flujo de verificación de médicos
* Búsqueda por especialidad + disponibilidad
* Reserva de citas con bloqueo de horarios
* Correos de confirmación
* Notificaciones push
* Geolocalización de médicos + mapa de médicos cercanos
* Calificaciones posteriores a las citas
* Panel del médico con agenda + reseñas

**FUERA DEL ALCANCE (POST-MVP)**

* Consulta por video
* Aplicación móvil nativa
* Cupones/promociones
* Recomendaciones con IA
* Pagos

**FLUJOS CLAVE**
Paciente: abrir → permitir ubicación → ver mapa → elegir médico → seleccionar horario →  confirmación → calificar
Médico: registrarse → subir credenciales → verificación → publicar disponibilidad → notificaciones → atender → revisar comentarios


**TAREA #1**

1. Resumir todos los requisitos, identificar módulos y listar todos los recorridos de usuario.
2. Detectar detalles faltantes o ambiguos y plantear preguntas de aclaración.
3. Proponer una arquitectura de alto nivel (frontend/backend/base de datos/integraciones).
4. **NO** escribir código todavía.
5. Alinea la respuesta a las secciones que te enumero a continuacion del fichero @readme.md 
5.1. Descripción general del producto

**Prompt 2:**
Te contesto las preguntas por aclarar y vuelve a generar la respuesta en base a las mismas:
1. Autenticacion: Por ahora solamente email/contrasenna
2. La validacion al inicio la hacen los ADMIN, solamente es requerida la cedula profecional del medico en formato de imagen o PDF, sin SLA de revision
3. Si se permite reprogramar y cancelar, sin politicas de tiempo limite y penalidades por ahora, sin maximo de citas activas por pasiente
4. Zona horario de Ciudad de Mexico, duracion estandar de citas
5. 30 minutos antes de la cita y solamente push web por ahora
6. Calificaciones del 1 al 5 con un texto obligatorio y con moderacion
7. Radio de busqueda de 5KM ajustable por el usuario con fallback de busqueda por CP
8. Soporte para ingles y espannol, proponme el nivel WCAG necesario
9. Proponme los requisitos de Seguridad
10. Proponme las politicas de cumplimiento de necesidades legales
11. Email: SendGrid, Mapas: Google Maps, PUSH: web push
12. Si, es necesario dashboards basicos como los que me propones

**Prompt 3:**
Quiero asegurarme que entendiste de que va el proyecto. 

Me lo puedes explicar?

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Actua como un project manager experto en la definicion de Arquitecturas de sistemas de citas.

Lee el fichero @readme.md en las secciones:
1. Descripción general del producto
1.1 Objetivo
1.2 Características y funcionalidades principales

Proponme una arquitectura para el MVP CitaYa

Hazme todas las preguntas necesarias antes de comenzar

**Prompt 2:**
1. Pacientes: 10 nuevos cada mes, Doctores: 4 nuevos cada mes, inicialmente 1 Consulta por minuto, Proponme el SLA de respuesta objetivo
2. Proponme un stack moderno y facilmente escalable. Sin restricciones de lenguaje, framework o proveedor
3. GDPR
4. Google Maps tal cual y basta con consulta a API de Maps
5. Solamente email y contrasenna para el MVP con recaptcha, con gestion de sessiones y una duracion media
6. No tenemos domino remitente ni clave, si se aceptan VAPID y service worker
7. oft lock con expiración y basta con una unica BD
8. El pasiente y el doctor solamente pueden tener una cita a la vez, con 1 hora para la reprogramacion de la cita por parte del paciente.
9. Si, 100% manual para el mvp
10. batch diario sin exportar datos
11. Desde el inicio con i18n
12. Infra as Code requerida, GitHub Actions
13. optimizar costo con más autogestión
14. logging estructurado + métricas + trazas en MVP, proponme una herramienta

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

Revisa los ficheros @readme.md y @documentation/ARQUITECTURA_MVP.md y analiza si todo esta acorde al MVP que vamos a implementar.

Luego de revisar los ficheros hazme las preguntas sobre la informacion que no te quede claro respecto a la descripcion de los componentes principales

**Prompt 2:**

1. Puede ser opcional el uso de CDN
2. Prefiero comenzar con una sola instancia de MySQL y anadir replicas despues
3. Podemos comenzar con una instancia de cada una y luego escalamos
4. Los workers corren en el mismo VPS
5. GitHub Container Registry y desplegamos por ssh
6. despliegue simple con downtime mínimo
7. script de monitoreo con /health expuesto
8. Prefiero comenzar con monitoreo basico y luego annadir Grafana
9. Discord con error 500, DB Caida y disco lleno
10. Solamente permisos restrictivos con LUKS solo para directorios
11. Ambas cosas con si
12. TypeORM
13. Con CI/CD con un plan para rollback
14. Necesitamos generar las keys de VAPID y los workers implementados en fase posterior
15. Batch diario es suficiente y priorizamos graficos y tablas

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
Realiza el mismo procedimiento respecto a la descripcion de alto nivel del proyecto y la Estructura de ficheros

**Prompt 2:**
1. Si incluimos la carpeta aunque se implemente despues
2. En un fichero .env
3. Prefiero en carpetas separas: scripts/monitoring/ y scripts/deployment/
4. prefiero backend/migrations/1234567890-MigrationName.ts y backend/migrations/rollback/1234567890-MigrationName.rollback.sql
5. creamos monitoring/basic/ para scripts y monitoring/advanced/ para Prometheus/Grafana/Loki?
6. La eliminamos por ahora
7. Solamente la del Repositorio
8. Solamente documentamos el proceso
9. En workers/src/batch
10. Mantenemos la estructura
**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
Haz el mismo proceso con respecto a la Infraestructura y despliegue
**Prompt 2:**
1. Si tenemos un entorno de stagging que esta en el mismo VPS
2. Se reconstruye desde un tag anterior, se mantiene 5 versiones disponibles
3. Se ejecutan automaticamente
4. Cada 5 minutos y solamente alertan en el deploy
5. Cron Job
6.  Se debe documentar el proceso paso a paso
7. Un solo docker-compose.prod.yml
8. Se almacenan en .env encriptados
9. Si se ejecutan con CRON cada 5 minutos para cada uno
10. Se configura manualmetne
11. Se ejecuta automaticamente, el proveedor garantiza que no falle la renovacion
12. Solamente se guardan localmente por rotacion
**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**
Realiza el mismo proceso sobre la segurdad ahora
**Prompt 2:**
1. AES, solamente el administrador del VPS tiene acceso a las llaves
2. Se configuran despues y solamente para el directorio /storage/uploads/
3. Encriptacion a nivel de aplicacion y se encripta solamene la cedula
4. Los backups se envian a almacenamiento externo
5. Por endoint y redis no almacena los contadores
6. 0.0-1.0, solamente en el registro/login
7. produccion y stagging, si se permite el subdominio stagging
8. En Redis y se generan por session
9. Archivo separado con retencion de 1 semana
10. quién, qué, cuándo, IP y se aditan todas las acciones
11. Solamente se permiten los necesarios
12. Se cambia el puerto por defecto y se configura el fail2ban
14. Todos los secrets estan en github actions
15. Todas las preguntas son: si
16. Despues de 1 anno 
**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**
Por ultimo, realiza el mismo proceso ahora para los Tests
**Prompt 2:**
1. Jest con Cypress
2. Bases de datos separadas con un contenedor docker MySQL
4. Solamente funcionales
5. Si, se deben incluir test de seguridad
6. Se generan datos dinamicamente
7. Se deben testear las migraciones y los scripts de rollback
8. Solamente en el PR y los test E2E tambien en cada PR
9. Se deben testear los cron jobs
10. Se mockean completamente
11. No se testean
12. No se testena los endpoint
13. Se testean las validaciones de tipos MIME, extensiones y tamaño
**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**
Actua como un disennador de bases de datos experto en sistemas de citas medicas online


-Analiza los ficheros @readme.md y @documentation/ARQUITECTURA_MVP.md 
-Proponme un diagrama entidad-relacion normalizado en formato mermaid
-Utiliza todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas

Antes de comenzar hazme todas las preguntas necesarias para confirmar que vas por el camino correcto
**Prompt 2:**
1. Un medico puede tener mas de una especialidad y se maneja en una tabla intermedia. Las especialidades son un catalogo fijo gestionado por los administradores
2. Son configurables por medico y se crean automaticamente desde horarios de trabajo, son plantillas reutilizables
3. Las resennas estan vinculadas a ya cita, no se puede generar una sin una cita confirmada, se puede dejar una por cita
4. La regla correcta es que solamente una cita activa en el mismo tiempo por paciente y se consideran activa ambos estados
5. Si se guarda historial de cambios y un appointment_history
6. Puede tener multiples documentos y se guardan sus metadatos
7. Se necesita la tabla y no se guarda el historial de email/push enviados
8. Solo JWT sin persistencia y los administradores son usuarios con role=admin
9. Se usara la informacion de la direccion de los doctores, debe ser obligatorio que introduzca su CP como parte del registro y se almacena las coordenadas geocodificadas de direcciones de médicos
10. Se necesita la tabla
11. Se implementa en todas las entidades principales y se necesita el campo deleted_at solo en las entidades principales
12. Directamente en la hora CDMX

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**
Actua como un arquitecto de software experto en el disenno de APIs escalables y funcionales

Analiza el fichero @readme.md y @documentation/ARQUITECTURA_MVP.md 

-Proponme una especificacion del API del MVP de CitaYa
-Hazlo en formato OpenAPI
-Annade un ejemplo de peticion y respuesta para mayor claridad

Antes de comenzar hazme todas las preguntas necesarias para saber que vas por el camino correcto
**Prompt 2:**
1. Una especificacion mas completa del MVP
2. Incluye todos los de paciente/medico
3. /api/v1 estructurado por recursos
4. Si, documenta JWT y pon ejemplo de header
5. Solamente para los principales e incluye los caso de error que me mencionas
6. Version 3.1
7. Solamente los campos relevantes por endpoint
**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**
Actua como un project manager experto sistemas de citas medicas online

Analiza los ficheros @readme.md @documentation/ARQUITECTURA_MVP.md @api-specification.yaml 

-Generame 7 historias de usuarios (Dame la posiblidad de escoger de 10 posibles opciones)
-Las historias deben tener criterios de aceptacion claros

Hazme todas las preguntas necesarias antes de comenzarr para saber que vas por el camino correcto
**Prompt 2:**
1. Funcionalidades criticas: Autenticacion, Registro, Busqueda de Doctor, Generacion de Cita, Validacion de Doctor, Review despues de la cita, Dashboards. Solamente cubre las funcionalidades documentadas
2. Usuario final con flujos end-to-end
3. Nivel detallado
4. Debe enfocarse en Paciente y Medico, pero al menos una debe ser de Admin
5. Formato estandard
6. Deben cubrir diferentes areas que permitan un flujo completo del usuario, debe estar representado el proceso de busqueda y reserva de cita

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**
Actua como un project manager expero en la documentacion de tickets de trabajo en sistemas de Citas Medicas Online

Analiza el fichero @documentation/HISTORIAS_USUARIO.md @api-specification.yaml @documentation/ARQUITECTURA_MVP.md y @readme.md 

-Genera los tickets de trabajo para todas las HU documentadas en @documentation/HISTORIAS_USUARIO.md 
-Crear carpetas para cada una de las HU
-Separa los tickets de trabajo en frontend, backend y Base de Datos
-Da todo el detalle requerido para desarrollar la tarea de inicio a fin
-Ten en cuenta las buenas practicas al respecto

Hazme todas las preguntas necesarias antes de comenzar
**Prompt 2:**
1. Archivos .md. Incluye toda la informacion necesaria para desarrollar la tarea de principio a fin
2. Una carpeta por HU con subcarpetas
3. Incluye pasos tecnicos detallados
4. Asigna prioridades y estimaciones
5. Si, marga dependencias entre los tickets
6. Incluye todos los criterios de aceptacion
7. Incluye los tickets de testing por cada HU
8. Usa la nomenclatura que me propones
**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
