## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Documentación completa](#8-documentación-completa)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
OMAR ALCANTARA AVILES
### **0.2. Nombre del proyecto:**
UNLOKD
### **0.3. Descripción breve del proyecto:**
Aplicación de Mensajería Condicionada

Aplicación de mensajería instantánea que permite compartir contenido de texto y multimedia bajo condiciones personalizables de visualización, con foco en privacidad recreativa, anticipación y entretenimiento.

### **0.4. URL del proyecto:**

### 0.5. URL o archivo comprimido del repositorio

https://github.com/OMAKALQANTARA/AI4Devs-finalproject

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

#### ¿Qué es?

Una aplicación de mensajería instantánea que transforma la comunicación cotidiana en experiencias interactivas y memorables mediante un sistema de condiciones personalizables para visualizar contenido. A diferencia de las apps tradicionales donde los mensajes se entregan y leen inmediatamente, esta plataforma permite al remitente establecer requisitos específicos que el destinatario debe cumplir para acceder al contenido: resolver acertijos, esperar hasta una fecha determinada, ingresar contraseñas, usar autenticación biométrica o completar desafíos personalizados.

#### ¿Qué valor aporta?

* Gamificación de la comunicación privada
* Convierte mensajes ordinarios en experiencias participativas que generan anticipación, curiosidad y entretenimiento.
* Momentos memorables y personalizados, permite crear comunicaciones que van más allá del texto plano: invitaciones sorpresa que se revelan en el momento exacto del evento, confesiones románticas protegidas por acertijos significativos, regalos digitales con desafíos divertidos, o cápsulas del tiempo que se abren en fechas futuras importantes.
* Control creativo sobre la privacidad, ofrece capas adicionales de privacidad más allá del cifrado tradicional, donde el remitente decide exactamente cuándo, cómo y bajo qué circunstancias su contenido será accesible. Combina seguridad técnica con creatividad personal.
* Diferenciación del ruido digital, en un ecosistema saturado de notificaciones instantáneas y mensajes efímeros, esta app crea comunicaciones que demandan atención intencional y generan valor emocional duradero, contrastando con el consumo pasivo de mensajería masiva.

#### ¿Qué problema soluciona?

* Fatiga de mensajería instantánea.
* Las plataformas actuales priorizan velocidad sobre experiencia. Los usuarios reciben cientos de mensajes diarios que se pierden en el ruido. Esta app soluciona la "invisibilidad" de mensajes importantes al añadir intencionalidad y contexto que captura atención genuina.
* Ausencia de opciones recreativas en mensajería
* WhatsApp, Telegram y Signal están optimizados para comunicación funcional o empresarial. No existe una plataforma dedicada específicamente al entretenimiento interpersonal y la gamificación de relaciones personales. Este producto llena ese vacío de mercado.
* Limitaciones de mensajes autodestructivos actuales
* Apps como Snapchat, Confide o chats secretos de Telegram ofrecen mensajes que desaparecen, pero carecen de opciones creativas de desbloqueo. Solo permiten temporización básica sin personalización ni elementos lúdicos, limitando casos de uso recreativos.
* Falta de herramientas para sorpresas digitales
* Actualmente no existen soluciones dedicadas para crear sorpresas digitales sofisticadas (invitaciones reveladoras, cacerías del tesoro virtuales, regalos con condiciones). Los usuarios improvisan con múltiples apps o pierden la espontaneidad

#### ¿Para quién es este producto?

##### Audiencia primaria
**Jóvenes adultos (18-35 años) socialmente activos**
- Usuarios que valoran experiencias novedosas en comunicación digital
- Personas que organizan eventos sociales (cumpleaños, reuniones, propuestas románticas)
- Early adopters de tecnología con disposición a probar apps innovadoras
- Usuarios con círculos sociales cerrados (5-20 contactos frecuentes) donde mensajes personalizados tienen alto valor

**Parejas y relaciones románticas**
- Parejas que buscan mantener comunicación creativa y sorpresiva
- Usuarios que envían mensajes con carga emocional significativa (confesiones, aniversarios, reconciliaciones)
- Personas en relaciones a distancia buscando formas innovadoras de mantener conexión

##### Audiencia secundaria

**Familias y grupos de amigos cercanos**
- Padres creando experiencias lúdicas para hijos (cacerías del tesoro familiares, recompensas condicionadas)
- Grupos de amigos que organizan juegos, desafíos o competencias sociales
- Comunidades pequeñas (clubes, equipos deportivos) con tradiciones internas

**Organizadores de eventos**
- Planificadores de fiestas sorpresa con necesidad de coordinación secreta
- Organizadores de actividades recreativas (escape rooms caseros, murder mysteries)
- Coordinadores de propuestas de matrimonio o eventos únicos

##### Casos de uso específicos

1. **Invitación sorpresa temporizada**: Enviar invitación de fiesta que solo se revela 2 horas antes del evento
2. **Regalo de cumpleaños con acertijo**: Mensaje con ubicación del regalo real, protegido por adivinanza personalizada
3. **Confesión romántica gradual**: Serie de mensajes que se desbloquean secuencialmente respondiendo preguntas sobre la relación
4. **Cápsula del tiempo familiar**: Mensaje grupal programado para abrirse en aniversario familiar futuro
5. **Desafío entre amigos**: Competencia donde cada participante debe resolver acertijos para leer mensajes del grupo

##### Perfil psicográfico

Usuarios que:
- Priorizan calidad sobre cantidad en comunicaciones personales
- Disfrutan elementos de juego y sorpresa en interacciones sociales
- Valoran privacidad pero no desde perspectiva paranoica, sino creativa
- Buscan formas de destacar en fechas especiales o momentos importantes
- Tienen disposición a invertir tiempo en crear experiencias significativas para otros

### **1.2. Características y funcionalidades principales:**

#### 1. Funcionalidades core (MVP 1–5)

Autenticación y perfiles
- Registro con email y contraseña.
- Perfil de usuario con nombre y foto.
- Gestión de contactos importados desde la agenda del teléfono.
- Estados de presencia: en linea, fuera de linea.
- Sistema de bloqueo y reporte de usuarios para seguridad básica.

##### Mensajería básica

- Chat 1‑a‑1 en tiempo real usando conexiones tipo WebSocket.
- Envío de mensajes de texto enriquecido.
- Soporte multimedia: imágenes, mensajes de voz y videos cortos.
- Indicadores de estado: enviado, entregado, desifrando, intentos, revelado.
- Notificaciones push para mensajes nuevos.
- Chats grupales hasta 5 participantes (primera etapa).

##### Sistema de condiciones de visualización (diferenciador)

Condiciones básicas:

- Visualización única: el mensaje se elimina automáticamente tras ser leído una vez.
- Programación temporal: el destinatario solo puede ver el contenido en una fecha y hora específicas.
- Contraseña numérica: código de 4 dígitos para desbloquear el mensaje, con límite de 3 intentos.

#### Condiciones avanzadas (MVP 6-9):

- Cuestionario interactivo: pregunta de opción múltiple que debe responderse correctamente.
- Autenticación biométrica: desbloqueo con huella digital o Face ID (cuando el dispositivo lo soporte).
- Captcha personalizado: puzzle visual simple que debe resolverse.
- Condiciones combinadas: permitir 2–3 condiciones simultáneas (por ejemplo, tiempo + contraseña + biometría).

##### Experiencia de usuario diferenciada

- Previsualización difuminada de contenido bloqueado para generar curiosidad.
- Contador regresivo visual para mensajes con condición temporal.
- Notificación cuando un mensaje programado se desbloquea.
- Indicador del tipo de condición sin revelar el contenido.
- Historial de mensajes desbloqueados con estadísticas personales.

#### 2. Funcionalidades complementarias (futuras)

##### Gamificación y engagement

- Plantillas prediseñadas para casos de uso comunes: invitaciones sorpresa, regalos virtuales, confesiones románticas, desafíos entre amigos.
- Banco de acertijos y trivia predefinidos, organizados por dificultad.
- Sistema de logros por desbloquear mensajes complejos o resolver acertijos.
- Modo “cacería del tesoro digital” con mensajes secuenciales donde cada uno desbloquea el siguiente.
- Creador visual de acertijos con interfaz de arrastrar y soltar.

##### Social y viralidad

- Sistema de invitaciones para compartir la app vía WhatsApp/SMS cuando un contacto aún no está registrado.
- Canales públicos opcionales para compartir desafíos comunitarios.
- Marketplace de plantillas de condiciones creadas por usuarios.
- Integración con redes sociales para compartir logros (sin exponer contenido privado).

#### Seguridad y privacidad

- Cifrado end‑to‑end para todas las comunicaciones.
- Mecanismos contra capturas de pantalla (watermarks, restricciones en plataformas que lo permitan).
- Validación en servidor para verificar el cumplimiento de condiciones antes de mostrar contenido.
- Almacenamiento temporal de contenido multimedia con eliminación automática tras visualización.
- Modo incógnito sin historial de mensajes en el dispositivo.



### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

Diagrama: [`High Level Architecture Diagram`](documentation/diagrams/HighLevelArchitectureDiagram.png)

UNLOKD se implementa como un backend monolítico modular que expone una API HTTP/REST, complementado con servicios especializados para tiempo real (WebSocket), gestión de multimedia y envío de notificaciones push. Los clientes principales son la aplicación móvil y/o web, que consumen la API y se conectan a un canal de tiempo real para la sincronización de mensajes y estados.

La arquitectura sigue un patrón en capas (presentación/API, aplicación, dominio, infraestructura) y una organización modular por dominio: autenticación, usuarios, mensajería, motor de condiciones, estadísticas, multimedia y notificaciones. Esta organización permite aislar la lógica de negocio en módulos coherentes, manteniendo el backend como un único artefacto desplegable.

#### Patrón predefinido y justificación

El sistema sigue una arquitectura en capas con módulos alineados al dominio (estilo Domain-Oriented / Modular Monolith), apoyada en servicios especializados para capacidades transversales y de alto volumen (tiempo real, multimedia, notificaciones). Esta combinación permite mantener la cohesión del dominio en un solo código base, a la vez que se desacoplan los componentes que típicamente requieren escalado independiente.
​
Esta arquitectura se eligió porque el proyecto se encuentra en fase MVP, con un equipo reducido y una fuerte necesidad de iterar rápido sobre la experiencia de mensajería condicionada. Una solución de microservicios completos incrementaría de forma significativa la complejidad operativa (orquestación, observabilidad distribuida, comunicación entre servicios) sin aportar beneficios proporcionales en esta etapa.

#### Beneficios
Facilita el desarrollo rápido del MVP al concentrar la lógica de negocio en un único backend, reduciendo la coordinación entre servicios y despliegues.​

Mantiene una separación clara entre capas (API, aplicación, dominio, infraestructura), lo que favorece la mantenibilidad, las pruebas y la incorporación de nuevas funcionalidades de mensajería y condiciones.
​
Permite escalar de forma dirigida los componentes con mayor demanda (canal WebSocket, procesamiento multimedia, workers de notificaciones) sin necesidad de fragmentar el modelo de dominio.

#### Sacrificios y déficits
El backend monolítico se escala de manera más “gruesa” (réplicas completas) en lugar de escalar únicamente partes específicas de la lógica de negocio.
​
A medida que el producto crezca en usuarios, tráfico y complejidad, será recomendable extraer algunos módulos (por ejemplo, mensajería o motor de condiciones) a servicios independientes para mantener tiempos de despliegue y claridad del código.
​
La frontera entre el backend central y los servicios especializados debe definirse con cuidado para evitar acoplamientos innecesarios y futuros refactors costosos.




### **2.2. Descripción de componentes principales:**

A alto nivel, los componentes son:

* Clientes
    - App móvil UNLOKD
    - Aplicación web UNLOKD

* Backend monolítico modular
    - Módulo API / HTTP: expone endpoints REST/JSON para gestión de usuarios, chats, mensajes y condiciones
    - Capa de aplicación: coordina casos de uso como crear mensajes condicionados, desbloquear contenido y actualizar estados.
    - Módulos de dominio:
        Autenticación y usuarios.
        Mensajería (chats 1‑a‑1 y grupos pequeños).
        Motor de condiciones de visualización.
        Estadísticas e historial.
    - Capa de infraestructura: repositorios hacia la base de datos principal, integración con colas, servicios externos y almacenamiento.

* Servicio de tiempo real
    - Gateway WebSocket que gestiona conexiones en tiempo real para entrega de mensajes, estados y eventos de desbloqueo.

* Servicio de multimedia
    - Worker/API multimedia responsable de procesar y gestionar contenido de imágenes, audio y video.
​   - Almacenamiento de archivos (por ejemplo, S3/Cloud Storage) para guardar medios de forma segura.

* Servicio de notificaciones
    - Worker de notificaciones que escucha eventos de dominio (nuevo mensaje, mensaje desbloqueado, etc.).
    - Integración con proveedores push (FCM, APNs) para enviar notificaciones a dispositivos móviles.

* Almacenes de datos
    - Base de datos principal relacional para usuarios, chats, mensajes y condiciones.
    - Cache/cola para sesiones, eventos en tiempo real y tareas asíncronas.

#### Tabla de tecnologías

| Componente                   | Tecnología elegida                          | Justificación                                                                                       |
|-----------------------------|---------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Lenguaje backend            | **TypeScript/JavaScript** sobre Node.js    | Ecosistema amplio y buen soporte para tiempo real y APIs.    |
| Framework backend           | **NestJS** (sobre Express/Fastify)         | Arquitectura modular, inyección de dependencias y WebSockets integrados; ideal para monolito modular.  |
| API HTTP/REST               | NestJS Controllers + JSON                   | Estándar para apps móviles/web; fácil de versionar y documentar.                           |
| Tiempo real (WebSocket)     | NestJS WebSockets + Socket.IO o WS nativo  | Integración directa con el backend; rooms y eventos útiles para chat y estados de mensaje.  |
| Capa dominio/aplicación     | Módulos NestJS por dominio                  | Encaja con arquitectura en capas y modular monolith (auth, usuarios, mensajes, condiciones).  |
| Base de datos principal     | **MySQL**                                   | Suficiente para chat inicial y escalable con réplicas/cluster.        |
| ORM / acceso a datos        | **Prisma** o **TypeORM**                   | Tipado fuerte en TypeScript, migraciones y modelo claro de entidades.                      |
| Cache y cola de jobs        | **Redis**                                   | Cache, Pub/Sub y colas (BullMQ) para notificaciones y tareas asíncronas.                   |
| Servicio de multimedia      | Node.js (módulo/worker NestJS) + S3 compat | Reusa stack JS; S3/Backblaze/Wasabi ofrecen almacenamiento barato y URLs temporales seguras.  |
| Storage de archivos         | S3 compatible (Backblaze/Wasabi/MinIO)     | Bajo coste por GB, redundancia y acceso HTTP firmado.                                      |
| Servicio de notificaciones  | Worker Node.js + FCM / APNs                 | FCM estándar para Android/Web y APNs para iOS; desacoplado mediante eventos.               |
| Frontend web                | **React** (SPA) + HTML/CSS/Bootstrap       | Ecosistema maduro de componentes UI.                         |
| App móvil                   | **React Native** o PWA sobre SPA           | Reduce mantenimiento de múltiples stacks.  |
| Autenticación               | JWT + cookies/headers                       | Sencillo en NestJS y compatible con SPA y apps móviles.                                    |
| Infraestructura/hosting     | Node.js + MySQL + Redis en VPS con Docker  | VPS económico + contenedores simplifica despliegue y reduce coste fijo.                    |
| Observabilidad básica       | Logs estructurados + health checks         | Suficiente para MVP; ampliable más adelante con métricas y dashboards.                     |



### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

La estructura del proyecto sigue una arquitectura **modular en capas** basada en NestJS, donde cada módulo agrupa lógica de aplicación y dominio para un subdominio específico (auth, usuarios, mensajería, condiciones, etc.), apoyado por una capa de infraestructura común (acceso a datos, integración con Redis, almacenamiento de archivos). El objetivo es mantener alta cohesión dentro de cada módulo y bajo acoplamiento entre ellos, facilitando la evolución futura hacia servicios más independientes si el producto crece.

A continuación se describe una estructura de ficheros propuesta para el repositorio principal del backend:
```
unlokd-backend/
├─ src/
│ ├─ app.module.ts
│ ├─ main.ts
│ ├─ config/
│ │ ├─ configuration.ts
│ │ └─ env/
│ ├─ common/
│ │ ├─ decorators/
│ │ ├─ filters/
│ │ ├─ interceptors/
│ │ └─ utils/
│ ├─ modules/
│ │ ├─ auth/
│ │ │ ├─ auth.module.ts
│ │ │ ├─ auth.controller.ts
│ │ │ ├─ auth.service.ts
│ │ │ └─ dto/
│ │ ├─ users/
│ │ │ ├─ users.module.ts
│ │ │ ├─ users.controller.ts
│ │ │ ├─ users.service.ts
│ │ │ └─ entities/
│ │ ├─ chats/
│ │ │ ├─ chats.module.ts
│ │ │ ├─ chats.controller.ts
│ │ │ ├─ chats.service.ts
│ │ │ └─ entities/
│ │ ├─ messages/
│ │ │ ├─ messages.module.ts
│ │ │ ├─ messages.controller.ts
│ │ │ ├─ messages.service.ts
│ │ │ └─ entities/
│ │ ├─ conditions/
│ │ │ ├─ conditions.module.ts
│ │ │ ├─ conditions.service.ts
│ │ │ └─ entities/
│ │ ├─ realtime/
│ │ │ ├─ realtime.module.ts
│ │ │ ├─ realtime.gateway.ts
│ │ │ └─ events/
│ │ ├─ media/
│ │ │ ├─ media.module.ts
│ │ │ ├─ media.controller.ts
│ │ │ ├─ media.service.ts
│ │ │ └─ adapters/
│ │ ├─ notifications/
│ │ │ ├─ notifications.module.ts
│ │ │ ├─ notifications.service.ts
│ │ │ └─ workers/
│ │ └─ stats/
│ │ ├─ stats.module.ts
│ │ ├─ stats.service.ts
│ │ └─ entities/
│ ├─ infrastructure/
│ │ ├─ database/
│ │ │ ├─ prisma/ (o typeorm/)
│ │ │ ├─ migrations/
│ │ │ └─ seeds/
│ │ ├─ redis/
│ │ ├─ storage/
│ │ └─ messaging/ (colas/jobs)
│ └─ interfaces/
│ └─ http/ (DTOs compartidos, contratos)
├─ test/
├─ prisma/ o ormconfig/ (según ORM)
├─ docker/
│ ├─ Dockerfile
│ └─ docker-compose.yml
├─ package.json
└─ README.md
```

#### Propósito de las carpetas principales

- `src/`  
  Contiene todo el código de aplicación y dominio del backend UNLOKD; es el núcleo del monolito modular.

- `src/config/`  
  Centraliza la configuración (variables de entorno, parámetros de conexión, flags de características) para mantener el código desacoplado de detalles de entorno.

- `src/common/`  
  Incluye utilidades compartidas como decoradores, filtros de excepciones, interceptores y funciones auxiliares, que se reutilizan en distintos módulos sin introducir dependencias de dominio.

- `src/modules/`  
  Implementa el patrón **modular monolith**: cada subcarpeta representa un módulo alineado a un subdominio funcional (auth, usuarios, chats, mensajes, condiciones, multimedia, tiempo real, notificaciones, estadísticas).
  - `auth/`: lógica de registro, login, emisión/validación de JWT.  
  - `users/`: gestión de perfiles de usuario y contactos.  
  - `chats/`: creación y gestión de chats 1‑a‑1 y grupos pequeños.  
  - `messages/`: envío, almacenamiento y estados de mensajes.  
  - `conditions/`: motor de condiciones de visualización (tiempo, contraseña, acertijos, etc.).  
  - `realtime/`: gateway WebSocket para comunicación en tiempo real.  
  - `media/`: subida, gestión y acceso controlado a contenido multimedia.  
  - `notifications/`: envío de notificaciones push a través de FCM/APNs.  
  - `stats/`: generación de estadísticas simples de uso y mensajes desbloqueados.

- `src/infrastructure/`  
  Implementa la capa de infraestructura de la arquitectura en capas: acceso a base de datos (MySQL mediante Prisma/TypeORM), configuración de Redis, adaptadores de almacenamiento de archivos (S3 compatible) y colas de mensajería para jobs asíncronos.

- `src/interfaces/`  
  Define contratos de entrada/salida (DTOs HTTP, interfaces compartidas) que sirven como frontera entre el mundo externo (API REST/WebSocket) y la lógica de aplicación.

- `prisma/` o `ormconfig/`  
  Contiene el esquema del ORM, migraciones y configuración de conexión con MySQL, alineado con el modelo de datos definido en el proyecto.

- `docker/`  
  Archivos relacionados con la contenerización y despliegue (Dockerfile, docker-compose.yml), que permiten levantar backend, MySQL, Redis y otros servicios de soporte con un único comando.

- `test/`  
  Pruebas unitarias y de integración asociadas a los módulos principales, organizadas de forma paralela a la estructura de `src/`.

Esta estructura obedece a un patrón de **arquitectura en capas** con organización modular por dominio (modular monolith), que encaja con la arquitectura descrita en el punto 2.1 y con el stack elegido (NestJS + MySQL + Redis).


### **2.4. Infraestructura y despliegue**

Diagrama: [`Diagrama de Infraestructura`](documentation/diagrams/infraestructure.png)

La infraestructura de UNLOKD está pensada para minimizar costes y complejidad, manteniendo a la vez soporte para tiempo real y almacenamiento de contenido multimedia. El backend monolítico modular, la base de datos MySQL, Redis y el almacenamiento de archivos se despliegan sobre un entorno Docker en un servidor (VPS) y pueden escalar progresivamente según crezca el uso.

#### Infraestructura del proyecto

A alto nivel, la infraestructura se compone de:

- **Cliente**  
  - App web (SPA) y/o app móvil que se conectan al backend vía HTTPS y WebSocket seguro (WSS).

- **Capa de aplicación**  
  - Contenedor Docker con el backend Node.js/NestJS (API REST + WebSocket gateway + módulos de dominio).
  - Workers de notificaciones y multimedia que comparten el mismo código base pero se ejecutan como procesos separados.

- **Servicios de soporte**  
  - Base de datos **MySQL** para persistencia de usuarios, chats, mensajes y condiciones. 
  - **Redis** como cache, Pub/Sub y backend de colas de jobs (notificaciones, procesado multimedia).
  - Almacenamiento de archivos S3‑compatible (por ejemplo, Backblaze/Wasabi/MinIO) para contenido multimedia.

- **Infraestructura de red y seguridad**  
  - Balanceador / reverse proxy (por ejemplo, Nginx o Traefik) terminando TLS y redirigiendo tráfico HTTP(S) y WebSocket hacia el backend.  
  - Certificados TLS gestionados (por ejemplo, Let’s Encrypt) para exponer la aplicación de forma segura.

#### Proceso de despliegue

El proceso de despliegue está orientado a simplicidad y repetibilidad utilizando Docker y un VPS:

1. **Construcción de contenedores**  
   - Se definen `Dockerfile` para el backend (API + WebSocket) y para los workers (notificaciones, multimedia), así como un `docker-compose.yml` que describe MySQL, Redis y el almacenamiento local/S3 si aplica.
   - En local o en un pipeline CI se ejecuta `docker build` para generar las imágenes de backend y workers.

2. **Provisionamiento de infraestructura**  
   - Se crea un VPS en un proveedor de bajo coste (por ejemplo Hetzner, Contabo, DigitalOcean, Render/Railway con soporte Docker) y se instala Docker y docker-compose.
   - Se configuran DNS y el reverse proxy (Nginx/Traefik) para apuntar el dominio público hacia el VPS y obtener certificados TLS (Let’s Encrypt).

3. **Despliegue de servicios**  
   - Se copia el archivo `docker-compose.yml` y los ficheros de configuración necesarios al servidor (o se utiliza un pipeline CI/CD para hacerlo automáticamente).
   - Se levantan los servicios con `docker-compose up -d`, iniciando contenedores para: backend NestJS, MySQL, Redis, workers y reverse proxy si se define en el mismo stack.

4. **Migraciones y semillas de datos**  
   - Una vez que MySQL está en marcha, se ejecutan las migraciones del ORM (Prisma/TypeORM) desde el contenedor backend o desde un job específico para crear el esquema de base de datos.
   - Opcionalmente se ejecutan semillas de datos iniciales (usuarios de prueba, chats de demo) para facilitar QA o demos.

5. **Actualizaciones y despliegues continuos**  
   - Para nuevas versiones, el pipeline construye nuevas imágenes, las sube a un registry (o las copia al servidor) y ejecuta una secuencia de `docker-compose pull` y `docker-compose up -d` para hacer rolling update del backend y workers.
   - Las migraciones se ejecutan como parte del despliegue, asegurando que la base de datos esté en el estado esperado antes de servir tráfico.

6. **Monitorización básica**  
   - Se exponen endpoints de health check (por ejemplo, `/health`) desde el backend para que el reverse proxy o el orquestador puedan verificar el estado de la aplicación.
   - Inicialmente se usan logs estructurados y métricas simples (CPU/RAM del VPS) y se deja espacio para incorporar herramientas más avanzadas (Prometheus/Grafana) si el tráfico crece.


### **2.5. Seguridad**

Las prácticas de seguridad clave para UNLOKD deben enfocarse en autenticación robusta, cifrado, protección de tiempo real, endurecimiento de la API y protección de datos en reposo y en tránsito.

#### Autenticación y gestión de tokens
* Uso de JWT firmados con algoritmo robusto (HS256/RS256) y claves seguras, con expiraciones cortas para access tokens.
​* Almacenamiento de tokens en cookies HttpOnly y Secure (cuando aplique web) o en storage seguro en móvil, para mitigar robo vía XSS.
​* Validación de JWT en cada petición y en el handshake de WebSocket, rechazando tokens caducados o manipulados.
​
Ejemplo: cookie segura en login web.
```
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
});

```

#### Cifrado y transporte seguro
* Enforzar HTTPS y WSS en todo el tráfico de cliente a servidor para evitar ataques Man‑in‑the‑Middle.
​* Cifrado de contenidos sensibles de mensajes a nivel de servidor con algoritmos modernos (por ejemplo, AES‑256) antes de almacenarlos, especialmente si se evoluciona hacia modelos de privacidad más fuertes.
​* Gestión segura de claves (variables de entorno, vault; nunca en el código fuente).
​
Ejemplo: WebSockets solo sobre WSS.
```
wss://api.unlokd.app/realtime
```

#### Seguridad en WebSockets y tiempo real
* Autenticación estricta en el handshake de WebSocket usando JWT y validando el origen (Origin header) para evitar secuestro de WebSocket entre sitios.
​* Uso exclusivo de wss://, validación y sanitización de todos los mensajes entrantes, y límites de tamaño/frecuencia para prevenir abuso y DoS.
​* Cierre proactivo de conexiones inactivas o sospechosas, y control de rooms/canales para que un usuario solo reciba mensajes de chats autorizados.
​
Ejemplo: verificación de token al conectar.
```
@WebSocketGateway()
export class RealtimeGateway {
  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    // validar JWT y userId antes de aceptar la conexión
  }
}
```

#### Endurecimiento de la API y del backend
* Validación y sanitización de entrada en todos los endpoints (DTOs, pipes) para evitar SQLi, XSS y payloads malformados.
​* Uso de consultas parametrizadas a la base de datos (ORM) y reglas de autorización por recurso (solo el dueño puede leer cierto mensaje, solo miembros del chat pueden acceder al hilo).
​* Rate‑limiting en login, intentos de desbloqueo de mensajes y endpoints críticos para reducir fuerza bruta o abuso.
​
Ejemplo: limitar intentos de desbloqueo por mensaje/usuario usando Redis.
```
clave: unlock:{messageId}:{userId} → contador de intentos
```

#### Protección de datos en reposo y privacidad
* Configuración segura de MySQL (acceso restringido por red, credenciales fuertes, backups cifrados).
​* Almacenamiento de multimedia en S3/compatibles usando URLs firmadas de corta duración y políticas que impidan acceso público directo.
​* Minimizar metadatos almacenados y retención de datos (por ejemplo, eliminación de contenido tras lectura cuando se use “visualización única”).
​
Ejemplo: URL firmada temporal para una imagen de mensaje.
```
https://storage.example.com/object-key?X-Amz-Expires=300&X-Amz-Signature=...
```

#### Monitorización, logs y pruebas de seguridad
* Registro estructurado de eventos de seguridad: logins, fallos de autenticación, intentos de desbloqueo fallidos, cambios sensibles de configuración.
​* Integración de análisis de dependencias (SCA) y escaneo de vulnerabilidades en el pipeline de CI (npm audit, herramientas de seguridad).
​* Ejecución periódica de pruebas de seguridad (OWASP Top 10 para web/API y guías de WebSocket security) y revisión de configuración de TLS/certificados.

### **2.6. Tests**

La estrategia de pruebas para UNLOKD combina tests unitarios, de integración y end‑to‑end (E2E), aprovechando el ecosistema de NestJS (Jest y @nestjs/testing) y una base de datos MySQL aislada para entornos de test.

#### Tipos de pruebas

* Tests unitarios
    Objetivo: validar la lógica de dominio (agregados, value objects, servicios de dominio) sin dependencias externas.
    Herramientas: Jest + @nestjs/testing, dobles de prueba para repositorios e integraciones (mocks/stubs).
    Alcance:
        Reglas de desbloqueo de mensajes (condiciones de tiempo, contraseña, acertijos).
        Cálculo de estados (pendiente, desbloqueado, expirado).
        Reglas de intentos máximos, bloqueo tras múltiples fallos.
* Tests de integración
    Objetivo: validar que módulos NestJS se integran correctamente con MySQL, Redis y otros servicios internos.
    Herramientas: Jest + módulo Nest de testing, contenedores Docker de MySQL/Redis para entorno de test (p. ej. docker‑compose.test.yml).
    Alcance:
        Creación de mensajes condicionados y persistencia correcta en la base de datos.
        Flujo de notificaciones (evento → publicación en Redis → worker).
        Upload de multimedia y generación de URL segura en el servicio de media.
* Tests E2E (end‑to‑end)
    Objetivo: validar flujos completos desde el punto de vista del usuario, atravesando la API y, en algunos casos, la capa de WebSocket.
    Herramientas: Jest E2E + supertest para HTTP, cliente WebSocket de test (socket.io‑client o ws) y un entorno de backend levantado específicamente para pruebas (NestJS en modo test + MySQL/Redis de test).
    Alcance:
        Registro/login de usuario → obtención de token → creación de chat.
        Envío de mensaje condicionado → recepción en otro cliente vía WebSocket → intento de desbloqueo.
        Escenarios de error (condición incorrecta, límite de intentos cruzado, mensajes expirados).

#### Estructura de tests
```
unlokd-backend/
├─ test/
│  ├─ unit/
│  │  ├─ domain/
│  │  │  ├─ conditional-message.aggregate.spec.ts
│  │  │  └─ password-condition.vo.spec.ts
│  │  └─ services/
│  │     └─ unlock-message.service.spec.ts
│  ├─ integration/
│  │  ├─ messages.repository.spec.ts
│  │  ├─ notifications.worker.spec.ts
│  │  └─ media.service.spec.ts
│  └─ e2e/
│     ├─ auth.e2e-spec.ts
│     ├─ messaging-basic.e2e-spec.ts
│     └─ conditional-unlock.e2e-spec.ts
```

`test/unit`: pruebas puras de lógica de dominio y servicios sin tocar red ni base de datos.
`test/integration`: pruebas con módulo Nest cargado parcialmente y conectando a MySQL/Redis de test.
`test/e2e`: flujos completos a través de HTTP/WebSocket, idealmente sobre una base de datos efímera.

#### Estrategia para pruebas E2E
    
* Levantar el backend NestJS en modo test (por ejemplo, usando Test.createTestingModule o ejecutando una instancia real con variables de entorno de test).
* Utilizar una base de datos MySQL dedicada al entorno de test, refrescada antes de cada suite (migraciones + truncado de tablas) para garantizar independencia entre casos de prueba.
​* Simular múltiples usuarios/clients:
    Cliente A (emisor): registra, inicia sesión, crea chat, envía mensaje condicionado.
    Cliente B (receptor): conecta vía WebSocket, recibe notificación, intenta desbloquear el mensaje con diferentes entradas.
* Verificar:
    Que el mensaje aparece bloqueado inicialmente.
    Que el intento de desbloqueo incorrecto incrementa contador y devuelve error.
    Que el intento correcto cambia el estado en la base de datos y envía el contenido (o la URL segura).

#### Ejemplo de flujo E2E (resumido):
1. POST /auth/register → usuario A y B registrados.
2. POST /auth/login → obtener JWT de A y B.
3. Cliente B abre conexión WebSocket autenticada con su token.
4. Cliente A hace POST /messages con una condición de contraseña.
5. Cliente B recibe evento de “nuevo mensaje” por WebSocket.
6. Cliente B envía intento de desbloqueo erróneo → API devuelve error.
7. Cliente B envía contraseña correcta → API devuelve contenido, se verifica estado UNLOCKED en DB.

#### Automatización y CI
* Integrar la ejecución de npm test (unit + integration) y npm run test:e2e en el pipeline de CI para cada PR.
* Usar contenedores efímeros de MySQL y Redis en el pipeline para replicar el entorno local, asegurando que la suite sea reproducible.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

[`Diagrama de Base de Datos`](documentation/diagrams/databaseDiagram.png)

### **3.2. Descripción de entidades principales:**

A continuación se describen las entidades con atributos, tipos y restricciones, siguiendo buenas prácticas para MySQL (tipos adecuados, índices por acceso, claves externas explícitas).
​

#### Tabla USERS
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL): identificador interno del usuario.
* ```email``` (varchar(100), NOT NULL, UNIQUE): correo usado para login y comunicación.
* ```username``` (varchar(50), NOT NULL, UNIQUE): alias público dentro de la aplicación.
* ```password_hash``` (varchar(255), NOT NULL): hash seguro de la contraseña (p.ej. bcrypt/argon2), nunca texto plano.
* ```display_name``` (varchar(255), NOT NULL): nombre mostrado en la UI.
* ```avatar_url``` (varchar(255), NULL): URL al avatar del usuario.
* ```created_at / updated_at``` (datetime, NOT NULL): sellos de auditoría.
* ```last_login_at``` (datetime, NULL): último acceso.
* ```is_active``` (tinyint(1), NOT NULL, default 1): permite desactivar cuentas sin borrarlas.

*Relaciones:*
* 1:N con ```CHATS``` (creador).
* 1:N con ```MESSAGES``` (emisor).
* 1:N con ```CHAT_MEMBERS```, ```CONTACTS```, ```NOTIFICATION_TOKENS```, ```MESSAGE_UNLOCK_ATTEMPTS```, ```MESSAGE_READ_EVENTS```.

#### Tabla CONTACTS
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL).
* ```owner_user_id``` (bigint, FK → USERS.id, NOT NULL): usuario dueño de la lista de contactos.
* ```contact_user_id``` (bigint, FK → USERS.id, NOT NULL): usuario agregado como contacto.
* ```alias``` (varchar(50), NULL): nombre personalizado del contacto.
* ```created_at``` (datetime, NOT NULL).

*Restricciones:*
* UNIQUE _(owner_user_id, contact_user_id)_ para evitar duplicados.

*Relaciones:*
* Cada usuario puede tener muchos contactos; modela relaciones asimétricas (no implica reciprocidad automática).

#### Tabla CHATS
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL).
* ```public_id``` (varchar(36), NOT NULL, UNIQUE): UUID expuesto hacia clientes.
* ```type``` (enum('DIRECT','GROUP'), NOT NULL): tipo de chat.
* ```title``` (varchar(255), NULL): nombre del grupo; NULL o derivado en chats directos.
* ```created_by``` (bigint, FK → USERS.id, NOT NULL): usuario que creó el chat.
* ```created_at / updated_at``` (datetime, NOT NULL).

*Relaciones:*
* 1:N con CHAT_MEMBERS.
* 1:N con MESSAGES.

#### Tabla CHAT_MEMBERS
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL).
* ```chat_id``` (bigint, FK → CHATS.id, NOT NULL).
* ```user_id``` (bigint, FK → USERS.id, NOT NULL).
* ```role``` (enum('OWNER','ADMIN','MEMBER'), NOT NULL): rol dentro del chat.
* ```joined_at``` (datetime, NOT NULL).
* ```last_read_at``` (datetime, NULL): última vez que el usuario leyó el chat.

*Restricciones:*
* UNIQUE _(chat_id, user_id)_ para evitar miembros duplicados.

*Relaciones:*
* N:M entre USERS y CHATS.

#### Tabla MESSAGES
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL).
* ```public_id``` (varchar(36), NOT NULL, UNIQUE): UUID para exponer a clientes.
* ```chat_id``` (bigint, FK → CHATS.id, NOT NULL): chat al que pertenece el mensaje.
* ```sender_id``` (bigint, FK → USERS.id, NOT NULL): emisor.
* ```content_type``` (enum('TEXT','IMAGE','AUDIO','VIDEO'), NOT NULL): tipo de contenido.
* ```content_text``` (text, NULL): cuerpo del mensaje cuando es texto.
* ```media_id``` (bigint, FK → MEDIA_OBJECTS.id, NULL): referencia a contenido multimedia, si aplica.
* ```visibility_type``` (enum('PLAIN','CONDITIONAL'), NOT NULL): indica si el mensaje está condicionado.
* ```status``` (enum('PENDING','UNLOCKED','EXPIRED','FAILED'), NOT NULL): estado del mensaje.
* ```created_at / updated_at``` (datetime, NOT NULL).
* ```unlocked_at``` (datetime, NULL): cuándo fue desbloqueado (si aplica).
* ```expires_at``` (datetime, NULL): cuándo deja de ser accesible (para mensajes temporales).

*Índices:*
* INDEX _(chat_id, created_at)_ para listar mensajes de un chat en orden temporal.

*Relaciones:*
* 1:1 con ```MESSAGE_CONDITIONS``` (solo si visibility_type = 'CONDITIONAL').
* 1:N con ```MESSAGE_UNLOCK_ATTEMPTS```.
* 1:N con ```MESSAGE_READ_EVENTS```.
* 0:1 con ```MEDIA_OBJECTS```.

#### Tabla MESSAGE_CONDITIONS
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL).
* ```message_id``` (bigint, FK → MESSAGES.id, NOT NULL, UNIQUE): relación 1:1.
* ```condition_type``` (enum('TIME','PASSWORD','QUIZ','BIOMETRIC','CAPTCHA','COMBINED'), NOT NULL): tipo principal de condición.
* ```available_from``` (datetime, NULL): fecha/hora a partir de la cual se puede desbloquear (para condiciones temporales).
* ```password_hash``` (varchar(255), NULL): hash de contraseña numérica o alfanumérica.
* ```max_attempts``` (int, NULL): límite de intentos de desbloqueo.
* ```quiz_question``` (text, NULL): pregunta para condición tipo quiz.
* ```quiz_correct_answer``` (varchar(255), NULL): respuesta correcta (puede moverse a hash si se requiere).
* ```config``` (json, NULL): configuración adicional (por ejemplo, combinación de varias condiciones).
* ```created_at / updated_at``` (datetime, NOT NULL).

*Relaciones:*
* Modela el Value Object / agregado de condición asociado a un mensaje.

#### Tabla MESSAGE_UNLOCK_ATTEMPTS
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL).
* ```message_id``` (bigint, FK → MESSAGES.id, NOT NULL).
* ```user_id``` (bigint, FK → USERS.id, NOT NULL).
* ```attempted_at``` (datetime, NOT NULL).
* ```result``` (enum('SUCCESS','FAILURE'), NOT NULL).
* ```failure_reason``` (varchar(255), NULL): opcional, detalla causa de fallo (p. ej. contraseña incorrecta, límite de intentos, expirado).

*Índices:*
* INDEX _(message_id, user_id)_ para consultas por mensaje y usuario.

*Uso:* 
* Permite auditar intentos de desbloqueo, aplicar lógicas de bloqueo y estadísticas de dificultad de las condiciones.

#### Tabla MESSAGE_READ_EVENTS
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL).
* ```message_id``` (bigint, FK → MESSAGES.id, NOT NULL).
* ```user_id``` (bigint, FK → USERS.id, NOT NULL).
* ```read_at``` (datetime, NOT NULL).

*Índices:*
* INDEX _(message_id, user_id)_ para saber si un usuario leyó un mensaje.

*Uso:*
* Soporta indicadores de leído y estadísticas personales (cuántos mensajes ha desbloqueado/consultado un usuario).

#### Tabla MEDIA_OBJECTS
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL).
* ```public_id``` (varchar(36), NOT NULL, UNIQUE): UUID expuesto al cliente.
* ```storage_key``` (varchar(255), NOT NULL): ruta/clave en el almacenamiento S3‑compatible.
* ```mime_type``` (varchar(50), NOT NULL): tipo de contenido (image/jpeg, audio/mpeg, etc.).
* ```size_bytes``` (bigint, NOT NULL).
* ```encryption_type``` (varchar(20), NULL): tipo de cifrado aplicado (ej. AES‑256‑GCM).
* ```created_at``` (datetime, NOT NULL).
* ```expires_at``` (datetime, NULL): fecha de eliminación programada para contenido temporal.

*Relaciones:*
Referenciada por ```MESSAGES.media_id```.

#### Tabla NOTIFICATION_TOKENS
* ```id``` (bigint, PK, AUTO_INCREMENT, NOT NULL).
* ```user_id``` (bigint, FK → USERS.id, NOT NULL).
* ```token``` (varchar(255), NOT NULL, UNIQUE): token de FCM/APNs.
* ```platform``` (enum('ANDROID','IOS','WEB'), NOT NULL).
* ```created_at``` (datetime, NOT NULL).
* ```last_used_at``` (datetime, NULL): último envío.

*Uso:*
* Gestiona múltiples dispositivos por usuario y permite invalidar tokens obsoletos.

---

## 4. Especificación de la API

### Endpoint 1: Registrar Usuario

**Descripción:** Permite a un usuario nuevo crear una cuenta en UNLOKD proporcionando email y contraseña. El sistema valida el formato del email, hashea la contraseña con bcrypt y genera un username único. No requiere autenticación previa.

**Especificación OpenAPI:**

```yaml
paths:
  /api/v1/auth/register:
    post:
      summary: Registrar nuevo usuario
      operationId: registerUser
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
                - passwordConfirm
              properties:
                email:
                  type: string
                  format: email
                  description: Email del usuario (será único en el sistema)
                  example: "usuario@example.com"
                password:
                  type: string
                  minLength: 8
                  description: Contraseña (mínimo 8 caracteres)
                  example: "Password123!"
                passwordConfirm:
                  type: string
                  minLength: 8
                  description: Confirmación de contraseña (debe coincidir con password)
                  example: "Password123!"
      responses:
        "201":
          description: Usuario registrado exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  userId:
                    type: string
                    format: uuid
                    description: ID único del usuario creado
                  username:
                    type: string
                    description: Username generado automáticamente
                  email:
                    type: string
                    format: email
                    description: Email del usuario
                  message:
                    type: string
                    description: Mensaje de confirmación
        "400":
          description: Datos inválidos (email inválido, contraseñas no coinciden, etc.)
          content:
            application/json:
              schema:
                type: object
                properties:
                  statusCode:
                    type: integer
                    example: 400
                  message:
                    type: string
                    example: "Email inválido o contraseñas no coinciden"
                  error:
                    type: string
                    example: "Bad Request"
        "409":
          description: El email ya está registrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  statusCode:
                    type: integer
                    example: 409
                  message:
                    type: string
                    example: "Este email ya está registrado"
                  error:
                    type: string
                    example: "Conflict"
        "429":
          description: Demasiados intentos de registro (rate limiting)
```

**Ejemplo de petición:**

```http
POST /api/v1/auth/register HTTP/1.1
Host: api.unlokd.app
Content-Type: application/json

{
  "email": "maria.garcia@example.com",
  "password": "MiPassword2025!",
  "passwordConfirm": "MiPassword2025!"
}
```

**Ejemplo de respuesta exitosa:**

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "maria.garcia",
  "email": "maria.garcia@example.com",
  "message": "Registro exitoso"
}
```

---

### Endpoint 2: Enviar Mensaje de Texto Simple

**Descripción:** Permite a un usuario autenticado enviar un mensaje de texto simple (sin condiciones de desbloqueo) en un chat del cual es miembro. El mensaje se entrega inmediatamente a todos los participantes y se propaga vía WebSocket en tiempo real.

**Especificación OpenAPI:**

```yaml
paths:
  /api/v1/messages:
    post:
      summary: Enviar mensaje de texto
      operationId: createMessage
      tags:
        - Messages
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - chatId
                - contentType
                - contentText
                - visibilityType
              properties:
                chatId:
                  type: string
                  format: uuid
                  description: ID del chat donde se enviará el mensaje
                  example: "b5a4c4f4-5df9-4c7c-9d2d-1e1a90a0f111"
                contentType:
                  type: string
                  enum: [TEXT]
                  description: Tipo de contenido del mensaje
                  example: "TEXT"
                contentText:
                  type: string
                  minLength: 1
                  maxLength: 5000
                  description: Contenido del mensaje de texto
                  example: "Hola, ¿cómo estás?"
                visibilityType:
                  type: string
                  enum: [PLAIN]
                  description: Tipo de visibilidad (PLAIN para mensaje simple)
                  example: "PLAIN"
      responses:
        "201":
          description: Mensaje creado y enviado exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  messageId:
                    type: string
                    format: uuid
                    description: ID único del mensaje
                  chatId:
                    type: string
                    format: uuid
                    description: ID del chat
                  sender:
                    type: object
                    properties:
                      userId:
                        type: string
                        format: uuid
                      username:
                        type: string
                      displayName:
                        type: string
                      avatarUrl:
                        type: string
                        format: uri
                  contentType:
                    type: string
                    enum: [TEXT]
                  contentText:
                    type: string
                  visibilityType:
                    type: string
                    enum: [PLAIN]
                  status:
                    type: string
                    enum: [UNLOCKED]
                  createdAt:
                    type: string
                    format: date-time
        "400":
          description: Datos inválidos (texto vacío, muy largo, etc.)
        "401":
          description: No autenticado (JWT inválido o expirado)
        "403":
          description: Usuario no es miembro del chat
        "404":
          description: Chat no encontrado
```

**Ejemplo de petición:**

```http
POST /api/v1/messages HTTP/1.1
Host: api.unlokd.app
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "chatId": "b5a4c4f4-5df9-4c7c-9d2d-1e1a90a0f111",
  "contentType": "TEXT",
  "contentText": "Hola, ¿cómo estás? ¿Nos vemos hoy?",
  "visibilityType": "PLAIN"
}
```

**Ejemplo de respuesta exitosa:**

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "messageId": "9b8a2d8e-5d0f-4a78-9418-b31f0c7f6af0",
  "chatId": "b5a4c4f4-5df9-4c7c-9d2d-1e1a90a0f111",
  "sender": {
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "username": "maria.garcia",
    "displayName": "María García",
    "avatarUrl": "https://storage.unlokd.app/avatars/a1b2c3d4.jpg"
  },
  "contentType": "TEXT",
  "contentText": "Hola, ¿cómo estás? ¿Nos vemos hoy?",
  "visibilityType": "PLAIN",
  "status": "UNLOCKED",
  "createdAt": "2025-01-20T10:30:15Z"
}
```

---

### Endpoint 3: Desbloquear Mensaje Condicionado

**Descripción:** Permite a un usuario receptor intentar desbloquear un mensaje condicionado proporcionando los datos requeridos según el tipo de condición (contraseña, respuesta a quiz, o confirmación para mensajes temporizados). El sistema valida la condición en el backend y registra cada intento.

**Especificación OpenAPI:**

```yaml
paths:
  /api/v1/messages/{messageId}/unlock:
    post:
      summary: Intentar desbloquear mensaje condicionado
      operationId: unlockMessage
      tags:
        - Messages
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: messageId
          required: true
          schema:
            type: string
            format: uuid
          description: ID del mensaje a desbloquear
          example: "9b8a2d8e-5d0f-4a78-9418-b31f0c7f6af0"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                password:
                  type: string
                  description: PIN de 4 dígitos (para condición PASSWORD)
                  example: "1234"
                quizAnswer:
                  type: string
                  description: Respuesta a la pregunta (para condición QUIZ)
                  example: "Madrid"
                clientTime:
                  type: string
                  format: date-time
                  description: Timestamp del cliente (para condición TIME)
                  example: "2025-12-31T20:00:00Z"
      responses:
        "200":
          description: Respuesta del intento de desbloqueo
          content:
            application/json:
              schema:
                oneOf:
                  - type: object
                    title: Desbloqueo exitoso
                    properties:
                      success:
                        type: boolean
                        example: true
                      status:
                        type: string
                        enum: [UNLOCKED]
                        example: "UNLOCKED"
                      content:
                        type: object
                        properties:
                          contentType:
                            type: string
                            enum: [TEXT, IMAGE, AUDIO, VIDEO]
                          text:
                            type: string
                            nullable: true
                          mediaUrl:
                            type: string
                            format: uri
                            nullable: true
                  - type: object
                    title: Desbloqueo fallido
                    properties:
                      success:
                        type: boolean
                        example: false
                      status:
                        type: string
                        enum: [PENDING]
                        example: "PENDING"
                      reason:
                        type: string
                        enum: [INVALID_PASSWORD, INCORRECT_ANSWER, TOO_EARLY, LIMIT_REACHED]
                        example: "INVALID_PASSWORD"
                      attemptsLeft:
                        type: integer
                        minimum: 0
                        example: 2
                      message:
                        type: string
                        example: "PIN incorrecto. Te quedan 2 intentos"
        "400":
          description: Datos inválidos en el request
        "401":
          description: No autenticado
        "403":
          description: Usuario no es miembro del chat o es el emisor del mensaje
        "404":
          description: Mensaje no encontrado
        "429":
          description: Demasiados intentos (rate limiting)
```

**Ejemplo de petición (condición PASSWORD):**

```http
POST /api/v1/messages/9b8a2d8e-5d0f-4a78-9418-b31f0c7f6af0/unlock HTTP/1.1
Host: api.unlokd.app
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "password": "1234"
}
```

**Ejemplo de respuesta exitosa:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "status": "UNLOCKED",
  "content": {
    "contentType": "TEXT",
    "text": "¡Felicidades! La fiesta sorpresa es en el rooftop a las 9 PM 🎉",
    "mediaUrl": null
  }
}
```

**Ejemplo de respuesta fallida:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": false,
  "status": "PENDING",
  "reason": "INVALID_PASSWORD",
  "attemptsLeft": 2,
  "message": "PIN incorrecto. Te quedan 2 intentos"
}
```


---

## 5. Historias de Usuario

### HU-001: Registro de Usuario con Email y Contraseña

**Como** usuario nuevo sin cuenta en UNLOKD,
**quiero** registrarme proporcionando mi email y contraseña,
**para que** pueda crear mi cuenta y acceder a la aplicación de mensajería condicionada.

#### Criterios de Aceptación

- [ ] El sistema debe permitir ingresar un email válido en un formulario de registro
- [ ] El sistema debe validar que el email tenga formato correcto (contiene @ y dominio válido)
- [ ] El sistema debe permitir ingresar una contraseña con mínimo 8 caracteres
- [ ] El sistema debe solicitar confirmar la contraseña para evitar errores de tipeo
- [ ] El sistema debe validar que ambas contraseñas coinciden antes de enviar
- [ ] El sistema debe mostrar indicador visual de fortaleza de contraseña en tiempo real
- [ ] El sistema debe mostrar mensaje de error claro si el email ya está registrado
- [ ] El sistema debe hashear la contraseña con bcrypt antes de almacenarla (nunca texto plano)
- [ ] El sistema debe generar automáticamente un username único basado en el email
- [ ] El sistema debe crear el registro en la tabla USERS con is_active = 1
- [ ] El sistema debe mostrar mensaje de éxito tras registro exitoso
- [ ] El sistema debe redirigir automáticamente a la pantalla de login tras registro exitoso
- [ ] El sistema debe completar el registro en menos de 2 segundos

#### Notas Adicionales

- Para el MVP no se requiere verificación de email por correo electrónico
- El username se genera automáticamente tomando la parte antes de @ del email
- Si el username ya existe, se agrega sufijo numérico secuencial (ej: usuario, usuario2, usuario3)
- Implementar rate limiting: máximo 5 intentos de registro por IP por minuto
- La contraseña debe almacenarse con bcrypt factor 10 o superior
- Considerar agregar captcha si se detecta abuso en el futuro

#### Historias de Usuario Relacionadas

- HU-002: Login de usuario y obtención de JWT (siguiente paso tras registro)
- HU-003: Actualizar perfil de usuario (permite personalizar información post-registro)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/auth/register`

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "passwordConfirm": "contraseña123"
}
```

**Response:**
```json
{
  "userId": "uuid-...",
  "username": "usuario",
  "email": "usuario@example.com",
  "message": "Registro exitoso"
}
```

**Módulos NestJS:**
- `src/modules/auth/` (auth.controller.ts, auth.service.ts)
- `src/modules/users/` (users.service.ts, users.repository.ts)

**Tablas DB:**
- USERS (id, email, username, password_hash, display_name, is_active, created_at)

**Validaciones (class-validator):**
- `@IsEmail()` para email
- `@MinLength(8)` para password
- `@Matches()` para confirmar contraseñas coinciden
- Validación personalizada para email único en la base de datos

**Tests:**
- **Unitarios**: 
  - Validación de formato de email
  - Validación de longitud de contraseña
  - Generación correcta de username
  - Hash de contraseña con bcrypt
- **Integración**:
  - Creación exitosa de usuario en DB
  - Rechazo de email duplicado
  - Manejo de errores de conexión a DB
- **E2E**:
  - Flujo completo de registro exitoso
  - Intento de registro con email duplicado
  - Contraseñas que no coinciden
  - Email con formato inválido

**Prioridad:** P0 - Blocker (Sprint 1)
**Estimación:** 3 Story Points
**Caso de Uso Relacionado:** UC-001 - Registrar Cuenta


### HU-005: Enviar Mensaje de Texto Simple en Chat

**Como** usuario autenticado y miembro de un chat,
**quiero** enviar un mensaje de texto simple (sin condiciones),
**para que** pueda comunicarme de forma básica antes de usar funcionalidades condicionadas.

#### Criterios de Aceptación

- [ ] El sistema debe permitir escribir texto en el campo de mensaje del chat
- [ ] El sistema debe permitir enviar mensaje presionando botón "Enviar" o Enter
- [ ] El sistema debe validar que el texto no esté vacío (mínimo 1 carácter)
- [ ] El sistema debe validar que el texto no supere 5000 caracteres
- [ ] El sistema debe crear el mensaje con visibility_type = 'PLAIN' y status = 'UNLOCKED'
- [ ] El sistema debe asociar el mensaje al chat y al usuario emisor
- [ ] El sistema debe enviar el mensaje vía WebSocket a todos los miembros del chat online
- [ ] El sistema debe mostrar el mensaje inmediatamente en el timeline del emisor
- [ ] El sistema debe mostrar indicadores de estado: enviado, entregado
- [ ] El sistema debe limpiar el campo de texto tras envío exitoso
- [ ] Los demás miembros del chat deben recibir el mensaje en tiempo real (si están online)
- [ ] Si un miembro está offline, debe recibir notificación push
- [ ] El envío debe completarse en menos de 300ms

#### Notas Adicionales

- Esta es la funcionalidad base de mensajería, sin condiciones de desbloqueo
- Los mensajes PLAIN se muestran inmediatamente a todos sin restricciones
- Los saltos de línea se permiten (máximo 50 líneas)
- Se debe sanitizar el contenido para prevenir XSS
- El timestamp del mensaje se toma del servidor (no del cliente) para consistencia
- Los mensajes se almacenan permanentemente (no son efímeros)

#### Historias de Usuario Relacionadas

- HU-004: Crear chat 1-a-1 (requisito previo)
- HU-006: Ver timeline de mensajes (para visualizar mensajes enviados)
- HU-007: Enviar mensaje con condición temporal (versión avanzada de esta historia)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/messages`

**Request Body:**
```json
{
  "chatId": "chat-uuid",
  "contentType": "TEXT",
  "contentText": "Hola, ¿cómo estás?",
  "visibilityType": "PLAIN"
}
```

**Response:**
```json
{
  "messageId": "message-uuid",
  "chatId": "chat-uuid",
  "sender": {
    "userId": "user-uuid",
    "username": "usuario",
    "displayName": "Usuario",
    "avatarUrl": "..."
  },
  "contentType": "TEXT",
  "contentText": "Hola, ¿cómo estás?",
  "visibilityType": "PLAIN",
  "status": "UNLOCKED",
  "createdAt": "2025-01-20T10:30:00Z"
}
```

**WebSocket Event (enviado a miembros del chat):**
```json
{
  "event": "newMessage",
  "data": {
    "messageId": "message-uuid",
    "chatId": "chat-uuid",
    "sender": {...},
    "contentType": "TEXT",
    "contentText": "Hola, ¿cómo estás?",
    "createdAt": "2025-01-20T10:30:00Z"
  }
}
```

**Módulos NestJS:**
- `src/modules/messages/` (messages.controller.ts, messages.service.ts, messages.repository.ts)
- `src/modules/realtime/` (realtime.gateway.ts para WebSocket)
- `src/modules/notifications/` (para notificar usuarios offline)

**Tablas DB:**
- MESSAGES (id, public_id, chat_id, sender_id, content_type='TEXT', content_text, visibility_type='PLAIN', status='UNLOCKED', created_at)

**Validaciones:**
- `@MinLength(1)` `@MaxLength(5000)` para contentText
- `@IsEnum(ContentType)` para contentType
- `@IsEnum(VisibilityType)` para visibilityType
- Validar que el usuario es miembro del chat
- Sanitizar HTML para prevenir XSS

**Tests:**
- **Unitarios**:
  - Validación de longitud de texto
  - Sanitización de contenido
  - Generación de public_id único
- **Integración**:
  - Creación exitosa de mensaje en DB
  - Verificación de permisos del usuario
  - Emisión de evento WebSocket
- **E2E**:
  - Flujo completo de envío de mensaje
  - Recepción en tiempo real por otro usuario
  - Intento de envío en chat donde no es miembro (debe fallar)
  - Envío de mensaje vacío (debe fallar)
  - Envío de mensaje muy largo (debe fallar)

**Prioridad:** P0 - Blocker (Sprint 2)
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** Parte del flujo de mensajería básica


### HU-009: Intentar Desbloquear Mensaje Condicionado

**Como** usuario receptor de un mensaje condicionado,
**quiero** intentar desbloquearlo proporcionando los datos requeridos (contraseña, respuesta, esperando el tiempo),
**para que** pueda acceder al contenido bloqueado si cumplo correctamente las condiciones definidas por el emisor.

#### Criterios de Aceptación

- [ ] El sistema debe mostrar modal/pantalla de desbloqueo al hacer tap en mensaje bloqueado
- [ ] El modal debe mostrar el tipo de condición y qué se requiere:
  - TIME: contador regresivo y botón "Desbloquear" (habilitado solo si llegó la hora)
  - PASSWORD: campo para ingresar PIN de 4 dígitos
  - QUIZ: pregunta y campo para respuesta
- [ ] El sistema debe validar los datos ingresados antes de enviar
- [ ] El sistema debe verificar que la condición se cumple en el backend:
  - TIME: available_from <= NOW()
  - PASSWORD: bcrypt.compare(input, password_hash)
  - QUIZ: input == correct_answer (case-insensitive, trim)
- [ ] Si el desbloqueo es exitoso:
  - El sistema debe registrar intento SUCCESS en MESSAGE_UNLOCK_ATTEMPTS
  - El sistema debe cambiar mensaje a status='UNLOCKED'
  - El sistema debe actualizar unlocked_at con timestamp actual
  - El sistema debe mostrar el contenido completo del mensaje
  - El sistema debe reproducir animación celebratoria
  - El sistema debe notificar al emisor vía WebSocket
- [ ] Si el desbloqueo falla:
  - El sistema debe registrar intento FAILURE con failure_reason
  - El sistema debe decrementar intentos restantes (si aplica)
  - El sistema debe mostrar mensaje claro: "PIN incorrecto. Te quedan X intentos"
  - El sistema debe permitir reintentar si quedan intentos
- [ ] Si se alcanza max_attempts:
  - El sistema debe cambiar mensaje a status='FAILED'
  - El sistema debe mostrar "Límite alcanzado. No puedes desbloquear este mensaje"
  - El sistema debe notificar al emisor
- [ ] El sistema debe implementar rate limiting: máximo 10 intentos por minuto por usuario
- [ ] El sistema debe validar que el usuario es miembro del chat
- [ ] El sistema debe validar que el usuario NO es el emisor
- [ ] La validación debe completarse en menos de 500ms

#### Notas Adicionales

- NUNCA enviar password_hash ni quiz_correct_answer al cliente
- Validar TODAS las condiciones en el backend (no confiar en el cliente)
- Usar bcrypt.compare() para contraseñas (timing-attack resistant)
- Registrar todos los intentos para auditoría y estadísticas
- Un mensaje en estado FAILED no puede desbloquearse nunca
- Un mensaje desbloqueado (UNLOCKED) permanece así (no se puede "re-bloquear")
- Para mensajes con visualización única, tras desbloqueo se elimina automáticamente (futuro)

#### Historias de Usuario Relacionadas

- HU-007: Enviar mensaje temporal (el receptor desbloquea cuando llega la hora)
- HU-008: Enviar mensaje con contraseña (el receptor ingresa el PIN)
- HU-012: Ver previsualización bloqueada (visualización previa al desbloqueo)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/messages/{messageId}/unlock`

**Request Body (para PASSWORD):**
```json
{
  "password": "1234"
}
```

**Request Body (para QUIZ):**
```json
{
  "quizAnswer": "Respuesta correcta"
}
```

**Request Body (para TIME):**
```json
{
  "clientTime": "2025-12-31T20:00:00Z"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "status": "UNLOCKED",
  "content": {
    "contentType": "TEXT",
    "text": "La fiesta es en el rooftop a las 9 PM 😏",
    "mediaUrl": null
  }
}
```

**Response (falla):**
```json
{
  "success": false,
  "status": "PENDING",
  "reason": "INVALID_PASSWORD",
  "attemptsLeft": 2,
  "message": "PIN incorrecto. Te quedan 2 intentos"
}
```

**Módulos NestJS:**
- `src/modules/messages/` (unlock-message.service.ts)
- `src/modules/conditions/` (condition-strategy.interface.ts, time-condition.strategy.ts, password-condition.strategy.ts, quiz-condition.strategy.ts)

**Tablas DB:**
- MESSAGES (actualizar status y unlocked_at si éxito)
- MESSAGE_CONDITIONS (para obtener la condición)
- MESSAGE_UNLOCK_ATTEMPTS (registrar cada intento)

**Patrón de Diseño:**
- **Strategy Pattern** para validación de condiciones:
  - `ConditionStrategy` interface
  - `TimeConditionStrategy`
  - `PasswordConditionStrategy`
  - `QuizConditionStrategy`

**Validaciones:**
- Usuario es miembro del chat (403 si no)
- Usuario NO es el emisor (emisor siempre ve todo)
- Mensaje existe y es CONDITIONAL
- No se alcanzó max_attempts (si aplica)
- Rate limiting: máximo 10 intentos/min/usuario

**Tests:**
- **Unitarios**:
  - Lógica de cada ConditionStrategy
  - Comparación segura de contraseñas (bcrypt)
  - Contador de intentos restantes
- **Integración**:
  - Registro correcto de intentos en DB
  - Actualización de status a UNLOCKED/FAILED
  - Notificación WebSocket al emisor
- **E2E**:
  - Desbloqueo exitoso con PIN correcto
  - Desbloqueo fallido con PIN incorrecto
  - Alcanzar límite de intentos (status=FAILED)
  - Desbloqueo de mensaje TIME cuando llega la hora
  - Intento antes de tiempo (TIME) debe fallar
  - Usuario no miembro intenta desbloquear (403)

**Prioridad:** P1 - High (Sprint 3) - DIFERENCIADOR CLAVE
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** UC-009 - Intentar Desbloquear Mensaje Condicionado


---

## 6. Tickets de Trabajo

---

### Ticket 1: Backend - UNLOKD-002

##### [UNLOKD-002] Implementar Módulo de Autenticación (Registro + Login + JWT)

**Tipo**
- [x] Feature

**Épica**
EPIC-1: Fundación - Autenticación y Usuarios

**Prioridad**
- [x] P0 - Blocker

**Sprint**
Sprint 1 (06/01 - 19/01)

**Estimación**
Story Points: 8

**Descripción**
Implementar el módulo de autenticación completo que permita a usuarios registrarse con email/contraseña y hacer login obteniendo un JWT válido. Incluye hash seguro de contraseñas con bcrypt, validación de credenciales, rate limiting y guards de protección.

**Historia de Usuario Relacionada**
- HU-001: Registro de usuario
- HU-002: Login de usuario y obtención de JWT

**Caso de Uso Relacionado**
- UC-001: Registrar Cuenta
- UC-002: Iniciar Sesión

**Criterios de Aceptación**
- [ ] Endpoint `POST /api/v1/auth/register` implementado y funcional
- [ ] Endpoint `POST /api/v1/auth/login` implementado y funcional
- [ ] Validación de email formato correcto con `class-validator`
- [ ] Hash de contraseña con bcrypt factor 10+ antes de almacenar
- [ ] Generación de JWT con payload `{userId, email, username}` y expiración 24h
- [ ] JwtAuthGuard implementado para proteger rutas autenticadas
- [ ] JwtStrategy configurada para validar JWT en requests
- [ ] Rate limiting: máximo 5 intentos login por IP cada 15min (Redis)
- [ ] Mensajes de error genéricos ("Credenciales inválidas") para no revelar qué falló
- [ ] Tests unitarios con cobertura > 80%
- [ ] Tests E2E del flujo completo registro → login

**Tareas Técnicas**
- [ ] Crear módulo `auth/` con controller, service
- [ ] Implementar `register(email, password)` en AuthService
- [ ] Implementar `login(email, password)` en AuthService
- [ ] Configurar JwtModule con secret y expiración
- [ ] Crear JwtStrategy para Passport
- [ ] Crear JwtAuthGuard usando `@nestjs/passport`
- [ ] Implementar rate limiting con Redis (clave: `login:attempts:{ip}`)
- [ ] Crear DTOs: RegisterDto, LoginDto, AuthResponseDto
- [ ] Agregar validaciones con `class-validator`
- [ ] Escribir tests unitarios (AuthService)
- [ ] Escribir tests E2E (auth.e2e-spec.ts)

**Dependencias**
- UNLOKD-001: Setup proyecto

**Definición de Done (DoD)**
- [ ] Código implementado y funcional
- [ ] Tests unitarios escritos y pasando (cobertura > 80%)
- [ ] Tests E2E escritos y pasando
- [ ] Code review aprobado por al menos 1 reviewer
- [ ] Sin linter errors ni warnings críticos
- [ ] Documentación actualizada (README, comentarios código)
- [ ] Merge a rama `develop` exitoso

**Endpoints API**
- POST `/api/v1/auth/register` → `{userId, username, email}`
- POST `/api/v1/auth/login` → `{accessToken, user: {id, email, username}}`

**Tablas DB**
- USERS (usado por UsersRepository)

**Consideraciones Técnicas**

**Módulos NestJS**
- `src/modules/auth/` (auth.module.ts, auth.controller.ts, auth.service.ts)
- `src/common/guards/` (jwt-auth.guard.ts)
- `src/common/strategies/` (jwt.strategy.ts)

**Principios SOLID**
- **SRP**: AuthService solo maneja lógica de autenticación, UsersService maneja usuarios
- **DIP**: Inyección de dependencias de UsersService y JwtService en AuthService
- **OCP**: Strategy pattern con Passport permite agregar nuevas estrategias de auth

**Patrones de Diseño**
- **Strategy Pattern**: Passport strategies para diferentes métodos de autenticación
- **Repository Pattern**: UsersRepository abstrae acceso a datos

**Tests**

```typescript
// Unit test ejemplo
describe('AuthService', () => {
  it('should hash password before storing', async () => {
    const password = 'test123';
    const hash = await authService.hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });

  it('should generate valid JWT on login', async () => {
    const user = { id: '123', email: 'test@example.com', username: 'test' };
    const token = await authService.login(user);
    expect(token.accessToken).toBeDefined();
    const decoded = jwt.verify(token.accessToken, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(user.id);
  });
});

// E2E test ejemplo
describe('Auth E2E', () => {
  it('POST /auth/register should create user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.userId).toBeDefined();
        expect(res.body.email).toBe('test@example.com');
      });
  });

  it('POST /auth/login should return JWT', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });
});
```

**Notas**
- Usar variables de entorno para JWT_SECRET (nunca hardcodear)
- Implementar refresh tokens en versiones futuras
- Considerar agregar OAuth (Google, Facebook) en post-MVP
- Documentar endpoints con Swagger/OpenAPI

**Labels**
`auth`, `backend`, `nestjs`, `jwt`, `sprint-1`, `p0-blocker`

---

### Ticket 2: Frontend - UNLOKD-019

##### [UNLOKD-019] Implementar Previsualización Difuminada en Frontend

**Tipo**
- [x] Feature

**Épica**
EPIC-4: Multimedia, Notificaciones y UX

**Prioridad**
- [x] P1 - High

**Sprint**
Sprint 4 (17/02 - 02/03)

**Estimación**
Story Points: 5

**Descripción**
Implementar componentes React para mostrar mensajes bloqueados con estilos visuales atractivos, iconografía consistente, efecto blur en contenido multimedia, e indicadores claros según el tipo de condición (TIME, PASSWORD, QUIZ). La UI debe generar curiosidad y anticipación sin frustrar al usuario.

**Historia de Usuario Relacionada**
- HU-012: Ver previsualización difuminada de mensaje bloqueado

**Caso de Uso Relacionado**
- UC-012: Ver Previsualización Bloqueada

**Criterios de Aceptación**
- [ ] Componente `<LockedMessagePreview />` implementado y funcional
- [ ] Estilos visuales distintivos (gradiente, borde especial, icono 🔒 prominente)
- [ ] Efecto blur CSS para multimedia (filter: blur(20px))
- [ ] Indicadores específicos por tipo de condición:
  - TIME: "🔒 Bloqueado hasta DD/MM/YYYY HH:MM" + contador regresivo
  - PASSWORD: "🔒 Protegido con contraseña (X intentos restantes)"
  - QUIZ: "❓ Responde la pregunta para desbloquear"
- [ ] Botón "Desbloquear" con estados habilitado/deshabilitado según condición
- [ ] Animaciones sutiles que llamen la atención sin molestar
- [ ] Diseño responsive (móvil, tablet, desktop)
- [ ] Accesible (soporte para lectores de pantalla, navegación por teclado)
- [ ] Soporte para modo claro y modo oscuro
- [ ] Tests de componentes con Jest + React Testing Library

**Tareas Técnicas**
- [ ] Crear componente `LockedMessagePreview.tsx` en `src/components/messages/`
- [ ] Crear estilos CSS/SCSS con gradientes y blur en `LockedMessagePreview.module.css`
- [ ] Implementar renderizado condicional según `conditionType` (TIME, PASSWORD, QUIZ)
- [ ] Crear sub-componentes:
  - `<TimeConditionIndicator />` con contador regresivo
  - `<PasswordConditionIndicator />` con intentos restantes
  - `<QuizConditionIndicator />` con icono de pregunta
- [ ] Implementar animaciones CSS (@keyframes para pulse, attention)
- [ ] Integrar con timeline de mensajes (`MessageList.tsx`)
- [ ] Agregar props TypeScript con interfaces:
  - `message: Message`
  - `conditionType: ConditionType`
  - `conditionData: ConditionData`
  - `onUnlockClick: () => void`
- [ ] Escribir tests de componente (render, interacción, estados)
- [ ] Validar accesibilidad con axe-core
- [ ] Validar responsive en diferentes viewports

**Dependencias**
- UNLOKD-007: Módulo de mensajes (backend debe retornar preview data)
- UNLOKD-012: Condición TIME (para integrar countdown)

**Definición de Done (DoD)**
- [ ] Componente implementado y funcional
- [ ] Estilos aplicados y responsive verificado
- [ ] Tests unitarios pasando
- [ ] Code review aprobado
- [ ] Sin warnings de accesibilidad
- [ ] Documentación de componente actualizada (Storybook o comentarios)
- [ ] Merge a rama `develop`

**Consideraciones Técnicas**

**Componentes React**

```typescript
// LockedMessagePreview.tsx
interface LockedMessagePreviewProps {
  message: Message;
  conditionType: 'TIME' | 'PASSWORD' | 'QUIZ';
  conditionData: {
    availableFrom?: string;
    attemptsLeft?: number;
    maxAttempts?: number;
  };
  onUnlockClick: () => void;
}

export const LockedMessagePreview: React.FC<LockedMessagePreviewProps> = ({
  message,
  conditionType,
  conditionData,
  onUnlockClick
}) => {
  return (
    <div className={styles.lockedMessage}>
      <div className={styles.lockIconContainer}>
        <LockIcon className={styles.lockIcon} />
      </div>
      
      {conditionType === 'TIME' && (
        <TimeConditionIndicator availableFrom={conditionData.availableFrom} />
      )}
      
      {conditionType === 'PASSWORD' && (
        <PasswordConditionIndicator 
          attemptsLeft={conditionData.attemptsLeft}
          maxAttempts={conditionData.maxAttempts}
        />
      )}
      
      {message.hasMedia && (
        <BlurredThumbnail src={message.thumbnailUrl} />
      )}
      
      <button 
        className={styles.unlockButton}
        onClick={onUnlockClick}
        disabled={!canUnlock(conditionType, conditionData)}
      >
        Desbloquear
      </button>
    </div>
  );
};
```

**Estilos CSS**

```css
/* LockedMessagePreview.module.css */
.lockedMessage {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  animation: subtle-pulse 2s infinite;
}

.lockIcon {
  font-size: 48px;
  animation: lock-shake 0.5s ease-in-out;
}

.blurredThumbnail {
  filter: blur(20px);
  opacity: 0.7;
  transition: filter 0.3s ease;
}

@keyframes subtle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes lock-shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .lockedMessage {
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    border-color: #4a5568;
  }
}
```

**Tests**

```typescript
// LockedMessagePreview.test.tsx
describe('LockedMessagePreview', () => {
  it('renders TIME condition with countdown', () => {
    const message = { id: '1', hasMedia: false };
    const props = {
      message,
      conditionType: 'TIME' as const,
      conditionData: { availableFrom: '2025-12-31T20:00:00Z' },
      onUnlockClick: jest.fn()
    };
    
    render(<LockedMessagePreview {...props} />);
    
    expect(screen.getByText(/Bloqueado hasta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Desbloquear/i })).toBeDisabled();
  });

  it('renders PASSWORD condition with attempts left', () => {
    const props = {
      message: { id: '1', hasMedia: false },
      conditionType: 'PASSWORD' as const,
      conditionData: { attemptsLeft: 2, maxAttempts: 3 },
      onUnlockClick: jest.fn()
    };
    
    render(<LockedMessagePreview {...props} />);
    
    expect(screen.getByText(/2 intentos restantes/i)).toBeInTheDocument();
  });

  it('calls onUnlockClick when button clicked', () => {
    const onUnlockClick = jest.fn();
    const props = {
      message: { id: '1', hasMedia: false },
      conditionType: 'TIME' as const,
      conditionData: { availableFrom: '2020-01-01T00:00:00Z' }, // pasado
      onUnlockClick
    };
    
    render(<LockedMessagePreview {...props} />);
    
    const button = screen.getByRole('button', { name: /Desbloquear/i });
    fireEvent.click(button);
    
    expect(onUnlockClick).toHaveBeenCalledTimes(1);
  });
});
```

**Principios de Diseño**
- **Atomic Design**: Componentes pequeños y reutilizables
- **Composición**: Sub-componentes especializados por tipo de condición
- **Accesibilidad**: ARIA labels, navegación por teclado, contrast ratio WCAG AA

**Notas**
- Usar CSS Modules o Styled Components para estilos scoped
- Considerar agregar Storybook para documentar variantes del componente
- Las animaciones deben respetar `prefers-reduced-motion`
- El blur debe aplicarse en el cliente, no cargar imagen completa del backend

**Labels**
`frontend`, `react`, `ui`, `ux`, `sprint-4`, `p1-high`

---

### Ticket 3: Base de Datos - UNLOKD-004

##### [UNLOKD-004] Crear Migraciones de Base de Datos (USERS, CONTACTS)

**Tipo**
- [x] Feature

**Épica**
EPIC-1: Fundación - Autenticación y Usuarios

**Prioridad**
- [x] P0 - Blocker

**Sprint**
Sprint 1 (06/01 - 19/01)

**Estimación**
Story Points: 2

**Descripción**
Crear el esquema Prisma completo para las tablas USERS y CONTACTS, generar las migraciones correspondientes y ejecutarlas en la base de datos MySQL. Incluye índices para optimización de consultas frecuentes y constraints para integridad referencial.

**Caso de Uso Relacionado**
- UC-001: Registrar Cuenta
- UC-002: Iniciar Sesión
- UC-003: Gestionar Perfil
- UC-004: Añadir Contacto

**Criterios de Aceptación**
- [ ] Esquema Prisma `schema.prisma` definido con modelos User y Contact
- [ ] Migración generada exitosamente con `npx prisma migrate dev`
- [ ] Tablas creadas en MySQL con todos los campos según diseño del modelo de datos
- [ ] Índices creados correctamente:
  - USERS(email) → UNIQUE
  - USERS(username) → UNIQUE
  - CONTACTS(owner_user_id, contact_user_id) → UNIQUE compuesto
- [ ] Foreign keys configuradas con ON DELETE CASCADE apropiado
- [ ] Seeds opcionales para datos de prueba implementados
- [ ] Documentación del esquema actualizada
- [ ] Migración ejecutada en MySQL local sin errores

**Tareas Técnicas**
- [ ] Definir modelo `User` en `prisma/schema.prisma` con todos los campos:
  - id, email, username, password_hash
  - display_name, avatar_url, presence_status
  - is_active, created_at, updated_at, last_login_at
- [ ] Definir modelo `Contact` en `prisma/schema.prisma`:
  - id, owner_user_id, contact_user_id, alias, created_at
- [ ] Configurar relaciones entre modelos
- [ ] Agregar índices y constraints (@@unique, @@index)
- [ ] Generar migración: `npx prisma migrate dev --name init_users_contacts`
- [ ] Ejecutar migración en MySQL local
- [ ] Verificar tablas creadas con `SHOW TABLES` y `DESCRIBE`
- [ ] Crear archivo `prisma/seed.ts` con datos de prueba (3-5 usuarios, algunos contactos)
- [ ] Actualizar `package.json` con script `"prisma:seed": "ts-node prisma/seed.ts"`
- [ ] Ejecutar seeds: `npm run prisma:seed`
- [ ] Documentar esquema en README o wiki del proyecto

**Dependencias**
- UNLOKD-001: Setup proyecto (MySQL debe estar configurado y corriendo)

**Definición de Done (DoD)**
- [ ] Archivos de migración generados en `prisma/migrations/`
- [ ] Tablas existen en MySQL con estructura correcta
- [ ] Índices verificados con `SHOW INDEX FROM users`
- [ ] Seeds ejecutados exitosamente
- [ ] Comando `npx prisma studio` abre interfaz visual correctamente
- [ ] Documentación actualizada
- [ ] Code review aprobado
- [ ] Merge a rama `develop`

**Esquema Prisma Completo**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            BigInt    @id @default(autoincrement())
  email         String    @unique @db.VarChar(100)
  username      String    @unique @db.VarChar(50)
  password_hash String    @db.VarChar(255)
  display_name  String    @db.VarChar(255)
  avatar_url    String?   @db.VarChar(255)
  presence_status String? @db.VarChar(20) @default("offline")
  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  last_login_at DateTime?

  // Relaciones
  chatsCreated  Chat[]    @relation("ChatCreator")
  chatMembers   ChatMember[]
  messagesSent  Message[] @relation("MessageSender")
  contactsOwned Contact[] @relation("ContactOwner")
  contactsOf    Contact[] @relation("ContactUser")

  @@map("users")
  @@index([email])
  @@index([username])
}

model Contact {
  id              BigInt   @id @default(autoincrement())
  owner_user_id   BigInt
  contact_user_id BigInt
  alias           String?  @db.VarChar(50)
  created_at      DateTime @default(now())

  // Relaciones
  owner   User @relation("ContactOwner", fields: [owner_user_id], references: [id], onDelete: Cascade)
  contact User @relation("ContactUser", fields: [contact_user_id], references: [id], onDelete: Cascade)

  @@unique([owner_user_id, contact_user_id])
  @@map("contacts")
  @@index([owner_user_id])
  @@index([contact_user_id])
}
```

**Script de Seeds**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds...');

  // Crear usuarios de prueba
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        username: 'alice',
        password_hash: await bcrypt.hash('password123', 10),
        display_name: 'Alice Johnson',
        is_active: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        username: 'bob',
        password_hash: await bcrypt.hash('password123', 10),
        display_name: 'Bob Smith',
        is_active: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        username: 'charlie',
        password_hash: await bcrypt.hash('password123', 10),
        display_name: 'Charlie Brown',
        is_active: true,
      },
    }),
  ]);

  console.log(`✅ Creados ${users.length} usuarios`);

  // Crear contactos de prueba
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        owner_user_id: users[0].id,
        contact_user_id: users[1].id,
        alias: 'Bobby',
      },
    }),
    prisma.contact.create({
      data: {
        owner_user_id: users[0].id,
        contact_user_id: users[2].id,
      },
    }),
    prisma.contact.create({
      data: {
        owner_user_id: users[1].id,
        contact_user_id: users[0].id,
        alias: 'Ali',
      },
    }),
  ]);

  console.log(`✅ Creados ${contacts.length} contactos`);
  console.log('🎉 Seeds completados exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Comandos Útiles**

```bash
# Generar migración
npx prisma migrate dev --name init_users_contacts

# Ver estado de migraciones
npx prisma migrate status

# Ejecutar seeds
npm run prisma:seed

# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Generar cliente Prisma tras cambios
npx prisma generate

# Resetear base de datos (CUIDADO: borra datos)
npx prisma migrate reset
```

**Tablas DB Creadas**

**USERS (11 campos)**
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `email` VARCHAR(100) UNIQUE NOT NULL
- `username` VARCHAR(50) UNIQUE NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `display_name` VARCHAR(255) NOT NULL
- `avatar_url` VARCHAR(255) NULL
- `presence_status` VARCHAR(20) DEFAULT 'offline'
- `is_active` BOOLEAN DEFAULT TRUE
- `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP
- `last_login_at` DATETIME NULL

**CONTACTS (5 campos)**
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `owner_user_id` BIGINT NOT NULL (FK → USERS.id)
- `contact_user_id` BIGINT NOT NULL (FK → USERS.id)
- `alias` VARCHAR(50) NULL
- `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

**Verificación Post-Migración**

```sql
-- Verificar tablas creadas
SHOW TABLES;

-- Ver estructura de USERS
DESCRIBE users;

-- Ver índices en USERS
SHOW INDEX FROM users;

-- Ver constraints de CONTACTS
SHOW CREATE TABLE contacts;

-- Verificar datos de seeds
SELECT id, email, username, display_name FROM users;
SELECT * FROM contacts;
```

**Consideraciones Técnicas**

**Optimización**
- Índices en columnas de búsqueda frecuente (email, username)
- Índice compuesto único en CONTACTS previene duplicados
- ON DELETE CASCADE en foreign keys para limpieza automática

**Seguridad**
- password_hash nunca expuesto en queries de lectura
- is_active permite soft delete de usuarios
- Foreign keys aseguran integridad referencial

**Escalabilidad**
- BIGINT para IDs soporta hasta 9.2 quintillones de registros
- created_at/updated_at automáticos con triggers de MySQL

**Notas**
- DATABASE_URL debe estar en `.env` (nunca en código)
- Usar `prisma migrate deploy` en producción (no `dev`)
- Backups de base de datos antes de migraciones en producción
- Considerar índice en `last_login_at` si se filtra frecuentemente

**Labels**
`database`, `prisma`, `migrations`, `mysql`, `sprint-1`, `p0-blocker`

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

---

## 8. Documentación Completa

Este README contiene únicamente 3 ejemplos de cada sección (API, User Stories, Tickets) según lo requerido. La documentación completa del proyecto UNLOKD se encuentra organizada en el directorio `documentation/` con la siguiente estructura:

### 📋 Casos de Uso (12 documentos)

Documentación detallada de los casos de uso CORE del MVP con diagramas PlantUML:

#### Módulo Autenticación
- [`UC-001: Registrar Cuenta`](documentation/use_cases/UC-001-registrar-cuenta.md)
- [`UC-002: Iniciar Sesión`](documentation/use_cases/UC-002-iniciar-sesion.md)

#### Módulo Usuarios y Contactos
- [`UC-003: Gestionar Perfil`](documentation/use_cases/UC-003-gestionar-perfil.md)
- [`UC-004: Añadir Contacto`](documentation/use_cases/UC-004-añadir-contacto.md)

#### Módulo Chats
- [`UC-005: Crear Chat 1-a-1`](documentation/use_cases/UC-005-crear-chat-uno-a-uno.md)
- [`UC-006: Ver Historial de Mensajes`](documentation/use_cases/UC-006-ver-historial-mensajes.md)

#### Módulo Mensajería Condicionada (CORE DIFERENCIADOR)
- [`UC-007: Enviar Mensaje con Condición Temporal`](documentation/use_cases/UC-007-enviar-mensaje-temporal.md)
- [`UC-008: Enviar Mensaje con Contraseña`](documentation/use_cases/UC-008-enviar-mensaje-contraseña.md)
- [`UC-009: Intentar Desbloquear Mensaje Condicionado`](documentation/use_cases/UC-009-desbloquear-mensaje.md)
- [`UC-010: Recibir Notificación de Mensaje Nuevo`](documentation/use_cases/UC-010-recibir-notificacion.md)

#### Módulo Multimedia
- [`UC-011: Subir Contenido Multimedia`](documentation/use_cases/UC-011-subir-multimedia.md)
- [`UC-012: Ver Previsualización Bloqueada`](documentation/use_cases/UC-012-ver-previsualizacion-bloqueada.md)

---

### 👥 Historias de Usuario (15 documentos)

Historias de usuario priorizadas organizadas por sprint:

#### Sprint 1 - Fundación (P0)
- [`HU-001: Registro de usuario con email y contraseña`](documentation/user_stories/HU-001-registro-usuario.md)
- [`HU-002: Login de usuario y obtención de JWT`](documentation/user_stories/HU-002-login-usuario.md)
- [`HU-003: Actualizar perfil de usuario (nombre, avatar)`](documentation/user_stories/HU-003-actualizar-perfil.md)

#### Sprint 2 - Mensajería Básica (P0)
- [`HU-004: Crear chat 1-a-1 con un contacto`](documentation/user_stories/HU-004-crear-chat-uno-a-uno.md)
- [`HU-005: Enviar mensaje de texto simple en chat`](documentation/user_stories/HU-005-enviar-mensaje-texto.md)
- [`HU-006: Ver timeline de mensajes de un chat (paginado)`](documentation/user_stories/HU-006-ver-timeline-mensajes.md)

#### Sprint 3 - Motor de Condiciones (P1 - CORE DIFERENCIADOR)
- [`HU-007: Enviar mensaje con condición temporal`](documentation/user_stories/HU-007-mensaje-temporal.md)
- [`HU-008: Enviar mensaje con contraseña de 4 dígitos`](documentation/user_stories/HU-008-mensaje-contraseña.md)
- [`HU-009: Intentar desbloquear mensaje condicionado`](documentation/user_stories/HU-009-desbloquear-mensaje.md)
- [`HU-010: Recibir notificación push de mensaje nuevo`](documentation/user_stories/HU-010-notificacion-push.md)

#### Sprint 4 - Multimedia y UX (P1)
- [`HU-011: Subir imagen/video para enviar en mensaje`](documentation/user_stories/HU-011-subir-multimedia.md)
- [`HU-012: Ver previsualización difuminada de mensaje bloqueado`](documentation/user_stories/HU-012-previsualizacion-bloqueada.md)
- [`HU-013: Ver contador regresivo para mensaje temporizado`](documentation/user_stories/HU-013-contador-regresivo.md)

#### Backlog Priorizado (P2)
- [`HU-014: Enviar mensaje con quiz (pregunta + respuesta)`](documentation/user_stories/HU-014-mensaje-quiz.md)
- [`HU-015: Ver historial de mensajes desbloqueados (estadísticas)`](documentation/user_stories/HU-015-historial-desbloqueados.md)

---

### 🎫 Tickets de Trabajo (20 documentos)

Tickets en formato Jira organizados en 4 épicas:

#### EPIC-1: Fundación - Autenticación y Usuarios (Sprint 1)
- [`UNLOKD-001: Setup proyecto NestJS + MySQL + Redis con Docker`](documentation/tickets/UNLOKD-001-setup-proyecto.md) - 5 pts
- [`UNLOKD-002: Implementar módulo de autenticación`](documentation/tickets/UNLOKD-002-modulo-auth.md) - 8 pts
- [`UNLOKD-003: Implementar módulo de usuarios y perfiles`](documentation/tickets/UNLOKD-003-modulo-users.md) - 5 pts
- [`UNLOKD-004: Crear migraciones de BD (USERS, CONTACTS)`](documentation/tickets/UNLOKD-004-migraciones-users.md) - 2 pts
- [`UNLOKD-005: Tests E2E de autenticación`](documentation/tickets/UNLOKD-005-tests-e2e-auth.md) - 1 pt

#### EPIC-2: Mensajería Básica (Sprint 2)
- [`UNLOKD-006: Implementar módulo de chats`](documentation/tickets/UNLOKD-006-modulo-chats.md) - 5 pts
- [`UNLOKD-007: Implementar módulo de mensajes`](documentation/tickets/UNLOKD-007-modulo-messages.md) - 5 pts
- [`UNLOKD-008: Implementar WebSocket gateway`](documentation/tickets/UNLOKD-008-websocket-gateway.md) - 8 pts
- [`UNLOKD-009: Crear migraciones (CHATS, MESSAGES)`](documentation/tickets/UNLOKD-009-migraciones-messages.md) - 2 pts
- [`UNLOKD-010: Tests E2E de mensajería`](documentation/tickets/UNLOKD-010-tests-e2e-mensajeria.md) - 1 pt

#### EPIC-3: Motor de Condiciones (Sprint 3) - DIFERENCIADOR CLAVE
- [`UNLOKD-011: Arquitectura del motor de condiciones (Strategy Pattern)`](documentation/tickets/UNLOKD-011-arquitectura-motor-condiciones.md) - 5 pts
- [`UNLOKD-012: Implementar condición TIME`](documentation/tickets/UNLOKD-012-condicion-time.md) - 5 pts
- [`UNLOKD-013: Implementar condición PASSWORD`](documentation/tickets/UNLOKD-013-condicion-password.md) - 8 pts
- [`UNLOKD-014: Implementar servicio de desbloqueo`](documentation/tickets/UNLOKD-014-servicio-desbloqueo.md) - 5 pts
- [`UNLOKD-015: Crear migraciones (CONDITIONS, UNLOCK_ATTEMPTS)`](documentation/tickets/UNLOKD-015-migraciones-conditions.md) - 2 pts
- [`UNLOKD-016: Tests del motor de condiciones`](documentation/tickets/UNLOKD-016-tests-motor-condiciones.md) - 1 pt

#### EPIC-4: Multimedia, Notificaciones y UX (Sprint 4)
- [`UNLOKD-017: Implementar módulo de multimedia (S3)`](documentation/tickets/UNLOKD-017-modulo-multimedia.md) - 8 pts
- [`UNLOKD-018: Implementar worker de notificaciones push`](documentation/tickets/UNLOKD-018-worker-notificaciones.md) - 5 pts
- [`UNLOKD-019: Implementar previsualización difuminada frontend`](documentation/tickets/UNLOKD-019-ui-previsualizacion.md) - 5 pts
- [`UNLOKD-020: Implementar contador regresivo visual`](documentation/tickets/UNLOKD-020-contador-regresivo.md) - 3 pts

**Total MVP**: 89 Story Points

---

### 📅 Planificación de Sprints

Documentos de planificación del MVP (8 semanas, 4 sprints):

- [`Definición de Épicas`](documentation/planning/epicas.md) - 4 épicas principales con objetivos, criterios de éxito y riesgos
- [`Sprint Planning`](documentation/planning/sprint-planning.md) - Roadmap completo, objetivos por sprint, ceremonias, métricas
- [`Backlog Priorizado`](documentation/planning/backlog-priorizado.md) - Backlog completo con prioridades P0-P3, matriz valor/esfuerzo

**Roadmap del MVP**:
- **Sprint 1** (06/01 - 19/01): Fundación - Autenticación y Usuarios
- **Sprint 2** (20/01 - 02/02): Mensajería Básica
- **Sprint 3** (03/02 - 16/02): Motor de Condiciones (DIFERENCIADOR CLAVE ⭐)
- **Sprint 4** (17/02 - 02/03): Multimedia, Notificaciones y UX

---

### 📂 Estructura del Directorio de Documentación

```
documentation/
├── use_cases/          # 12 casos de uso con diagramas PlantUML
│   ├── UC-001-registrar-cuenta.md
│   ├── UC-002-iniciar-sesion.md
│   └── ... (10 más)
│
├── user_stories/       # 15 historias de usuario priorizadas
│   ├── HU-001-registro-usuario.md
│   ├── HU-002-login-usuario.md
│   └── ... (13 más)
│
├── tickets/           # 20 tickets en formato Jira
│   ├── UNLOKD-001-setup-proyecto.md
│   ├── UNLOKD-002-modulo-auth.md
│   └── ... (18 más)
│
└── planning/          # Documentos de planificación
    ├── epicas.md
    ├── sprint-planning.md
    └── backlog-priorizado.md
```

---

### 🎯 Cómo Usar Esta Documentación

1. **Para entender el producto**: Lee la sección 1 de este README (Descripción general)
2. **Para arquitectura técnica**: Lee la sección 2 (Arquitectura del sistema)
3. **Para casos de uso detallados**: Consulta [`documentation/use_cases/`](documentation/use_cases/)
4. **Para planificación de desarrollo**: Consulta [`documentation/planning/`](documentation/planning/)
5. **Para implementación específica**: Consulta los tickets en [`documentation/tickets/`](documentation/tickets/)
6. **Para historias de usuario**: Consulta [`documentation/user_stories/`](documentation/user_stories/)

---

### ⚠️ Notas Importantes

- **Este README contiene solo 3 ejemplos** de cada sección según lo requerido por el formato del proyecto
- **La documentación completa** (12 casos de uso, 15 historias, 20 tickets) está en el directorio `documentation/`
- **El Sprint 3 es el más crítico** del MVP ya que implementa el diferenciador clave de UNLOKD (motor de condiciones)
- **Prioridad P0 (Blocker)**: Sprints 1 y 2 - Base del sistema
- **Prioridad P1 (High)**: Sprints 3 y 4 - Diferenciador y UX
