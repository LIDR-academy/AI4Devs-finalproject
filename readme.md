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
Adrian Chavarria

### **0.2. Nombre del proyecto:**
quickchat

### **0.3. Descripción breve del proyecto:**
QuickChat es una plataforma de streaming en vivo con chat en tiempo real, al estilo Twitch. Un usuario emite (publisher) y otros usuarios ven y chatean en la sala (subscribers).

### **0.4. URL del proyecto:**
Not yet

### 0.5. URL o archivo comprimido del repositorio
NA

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

Permitir que cualquier usuario comparta una experiencia en vivo de forma inmediata y que otros la vean y participen mediante chat en tiempo real, sin fricción de configuración ni curva de aprendizaje.

- **Valor que aporta:** emitir en directo en pocos clics y consumir streams en vivo con interacción inmediata vía chat.
- **Qué soluciona:** la complejidad de las plataformas de streaming tradicionales (cuentas elaboradas, OBS, configuración previa) para casos de uso casuales o efímeros.
- **Para quién:** creadores ocasionales que quieren transmitir un momento puntual (publishers) y espectadores que quieren ver y conversar en vivo (subscribers).

### **1.2. Características y funcionalidades principales:**

El alcance del producto se limita a cinco funcionalidades; todo lo que no esté en esta lista queda fuera.

1. **Registro e inicio de sesión sin contraseña.** Autenticación mediante magic link (SuperTokens). En el primer login se crea el perfil del usuario.
2. **Listado de streams en vivo.** El usuario ve qué emisiones están activas en este momento. La fuente de verdad es LiveKit, no una tabla en base de datos.
3. **Emitir en directo (go live).** El publisher crea una sala y publica vídeo/audio vía WebRTC al SFU de LiveKit.
4. **Ver un stream en vivo.** El subscriber abre una sala y consume el medio vía WebRTC desde LiveKit.
5. **Chat en tiempo real dentro del stream.** Mensajería efímera estilo Twitch sobre WebSocket, con fan-out vía Valkey pub/sub y una ventana reciente al unirse a la sala. No se persiste el historial.


### **1.3. Diseño y experiencia de usuario:**
Not yet

### **1.4. Instrucciones de instalación:**
Not yet

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

Se sigue el modelo **C4** (System → Containers → Components). Los diagramas están en `architecture/v0.0/`:

- [`01-system.md`](architecture/v0.0/01-system.md) — contexto: QuickChat, sus usuarios y sistemas externos (SuperTokens, Valkey, MongoDB).
- [`02-containers.md`](architecture/v0.0/02-containers.md) — contenedores: Portal (SPA), Streamer, Security, Users, LiveKit SFU.
- [`03-component-user.md`](architecture/v0.0/03-component-user.md) — componentes del contenedor Users.
- [`04-component-streamer.md`](architecture/v0.0/04-component-streamer.md) — componentes del contenedor Streamer (Stream, Rooms, Chats, Auth).
- [`05-component-streamer.md`](architecture/v0.0/05-component-streamer.md) — componentes del contenedor Security (User, Tokens).
- [`06-component-quickchat-portal.md`](architecture/v0.0/06-component-quickchat-portal.md) — componentes del Portal (login, streamings, room).

**Patrón:** conjunto pequeño de **servicios con responsabilidad única** detrás de una SPA. Se eligió para mantener desacoplado el camino de medios en tiempo real (WebRTC + WS) del camino de control/persistencia, y para aislar la emisión de credenciales en un único servicio.

**Beneficios:**
- Solo **Security** emite tokens (sesión + JWT de sala LiveKit): superficie de credenciales mínima.
- El medio **nunca toca los servicios Go**: el navegador habla WebRTC directo con LiveKit; los Go APIs son control-plane.
- **Chat efímero** en Valkey: pub/sub para fan-out, sin escritura a Mongo en el camino de chat.

**Sacrificios:**
- Tres servicios Go es generoso para el alcance; podrían colapsarse en un único binario.
- El chat efímero implica que al recargar se pierde el historial fuera de la ventana cacheada (asumido, modelo Twitch).
- Despliegue en una sola instancia EC2 = SPOF; aceptable para el final project (ver §2.4).


### **2.2. Descripción de componentes principales:**

**Contenedores propios:**

- **QuickChat Portal** `[TypeScript + Vite + VanJS]` — SPA. Componentes internos: `login` (autentica vía Security), `streamings` (lista salas vivas vía Streamer) y `room` (publica/consume WebRTC contra LiveKit + chat WS contra Streamer).
- **Streamer** `[Go API]` — dueño de salas y chat. Componentes: `Stream` (cablea intención publish/subscribe hacia LiveKit), `Rooms` (crea/elimina/lista salas; metadatos en Valkey), `Chats` (WebSocket de chat, mensajes vía Valkey) y `Auth` (cliente que pide tokens a Security; **no firma tokens**).
- **Security** `[Go API]` — única autoridad emisora de credenciales. Componentes: `User` (genera magic link vía SuperTokens SDK y dispara la creación de usuario en primer login) y `Tokens` (firma JWT de sala LiveKit; publisher con `canPublish`, subscriber con `canSubscribe`).
- **Users** `[Go API]` — recibe el comando "crear usuario" desde Security y persiste el registro en MongoDB. Solo creación, ni edición ni borrado.

**Sistemas externos:**

- **LiveKit SFU** — servidor WebRTC autoalojado. Recibe el stream del publisher y lo distribuye a los subscribers. Fuente de verdad de "qué está en vivo".
- **SuperTokens** — proveedor de autenticación passwordless (magic link).
- **Valkey** — store caliente: pub/sub del chat, lista capada de mensajes recientes por sala y metadatos efímeros de sala.
- **MongoDB** — store durable. Solo guarda el registro de usuario.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Patrón:** monorepo con un servicio por carpeta. Cada servicio Go y el Portal son independientemente construibles. Refleja la separación de responsabilidades de la arquitectura (medios, control de salas/chat, credenciales, persistencia de usuario).

```
quickchat/
  portal/                 # SPA: Vite + VanJS + TS
    src/
      components/         # login, streamings, room
      api.ts              # fetch de tokens, listado de streams
      main.ts
    vite.config.ts
  services/
    streamer/             # Go: stream, rooms, chats, auth (cliente de tokens)
    security/             # Go: user (SuperTokens), tokens (JWT LiveKit)
    users/                # Go: creación de usuario -> MongoDB
  deploy/
    docker-compose.yml    # livekit, valkey, mongo, los 3 Go APIs, caddy
    Caddyfile
    livekit.yaml
  docs/
    c4/                   # diagramas C4
  PROJECT.md
```

**Notas de diseño:**
- `portal/` agrupa los componentes TS por feature (login, streamings, room), no por tipo de archivo.
- `services/` contiene un binario Go por contenedor; cada uno es desplegable de forma independiente.
- El código de chat dentro de `streamer/` se mantiene **sin dependencias directas** del código de rooms/tokens, para poder extraerlo a su propio contenedor si el chat necesita escalar por separado.
- `deploy/` aísla la configuración de infraestructura; el resto del repo no conoce detalles de despliegue.

### **2.4. Infraestructura y despliegue**

**Topología:** una sola instancia EC2 (optimizada en memoria, p. ej. `r7g`/`c7g` Graviton). Todos los contenedores corren bajo `docker-compose`. Caddy termina TLS y enruta hacia el Portal y los Go APIs.

```
                         Internet
                            |
                    +---------------+
                    |   Caddy       |   TLS (HTTPS/WSS)
                    +---------------+
                            |
        +------------+------+------+--------------+
        |            |             |              |
   +---------+  +---------+  +---------+   +-------------+
   | Portal  |  | Streamer|  | Security|   |   Users     |
   | (static)|  | (Go)    |  | (Go)    |   |   (Go)      |
   +---------+  +---------+  +---------+   +-------------+
                     |            |              |
                     v            v              v
                +---------+  +-----------+   +---------+
                | Valkey  |  |SuperTokens|   | MongoDB |
                +---------+  +-----------+   +---------+

                +-----------------------------+
                |        LiveKit SFU           |   WebRTC (puertos abajo)
                +-----------------------------+
                       ^
                       | media (publishers/subscribers, directo desde el navegador)
                       |
                  navegadores
```

**Puertos y red:**
- `443/tcp` (Caddy) — HTTPS/WSS para Portal y APIs.
- LiveKit: `7880` (API/WS, detrás de Caddy), `7881/tcp` + `50000-60000/udp` (medios), `3478/udp` (TURN embebido). `rtc.use_external_ip: true` para que ICE anuncie la IP pública (gotcha clásico "funciona en local, falla en EC2").
- Valkey con `--network host` para evitar latencia de NAT en el camino caliente del chat.

**Proceso de despliegue:**
1. Build de imágenes (Portal estático + 3 binarios Go).
2. `docker compose up -d` en la instancia EC2 con `deploy/docker-compose.yml`.
3. Caddy levanta automáticamente con certificados (Let's Encrypt).

**Camino de escalado (no construido):** mover Valkey a ElastiCache; cascada de SFUs LiveKit detrás del API de salas; extraer el WS de chat a su propio servicio con pub/sub sharded (`SPUBLISH`/`SSUBSCRIBE`) por sala — los canales se nombran por `roomId` desde el día 1 para que la migración sea trivial.

### **2.5. Seguridad**

- **Emisión centralizada de credenciales.** Solo el contenedor **Security** firma JWT. Ni Streamer ni Users emiten tokens por su cuenta — eso reduce la superficie a un único componente auditable. Ejemplo: cuando un publisher quiere ir en vivo, Streamer **pide** a Security el token; nunca lo genera.
- **Tokens con scope mínimo (principle of least privilege).** Los JWT de sala LiveKit se emiten con permisos diferenciados: publisher con `canPublish`, subscriber con `canSubscribe` únicamente. Esto es lo único que impide que un espectador se ponga a emitir.
- **Autenticación passwordless (magic link).** No se almacenan contraseñas. SuperTokens gestiona la emisión y verificación de magic links, eliminando toda la clase de vulnerabilidades de password storage (hashes débiles, reuse, leaks).
- **Rate limiting en el gateway de chat.** Token bucket por usuario y por sala en Valkey, aplicado en `Streamer/Chats` **antes** de que el mensaje llegue al pub/sub. Evita flood y abuso del fan-out.
- **TLS extremo a extremo.** Caddy termina HTTPS y WSS delante de todos los servicios públicos. WebRTC también requiere contexto seguro en el navegador.
- **TURN embebido en LiveKit.** Necesario para el ~10–15 % de espectadores detrás de NAT simétricos; sin él esos usuarios no podrían recibir el medio.

### **2.6. Tests**

Tres niveles, escogidos para cubrir lo crítico sin inflar la suite:

- **Unitarios:**
  - *Minteo de tokens en `Security/Tokens`:* se verifica que el JWT de publisher incluye `canPublish` y el de subscriber **no**, evitando regresiones que abran la puerta a emisiones no autorizadas.
  - *Capping de mensajes en `Streamer/Chats`:* la lista capada de Valkey se trunca correctamente a la ventana definida (~100–200 entradas) tras inserciones masivas.

- **Integración:**
  - *Camino "crear usuario en primer login"*: Security → Users → MongoDB. Se valida que solo se inserta una vez por identidad de SuperTokens (idempotencia).
  - *Round-trip "crear sala → emitir token"*: Streamer crea una sala en LiveKit y pide a Security un token válido para esa sala; se comprueba que el token es aceptado por LiveKit.

- **E2E (manual, aceptable para el alcance del proyecto):** en un navegador se inicia una emisión; en un segundo navegador se entra a la sala, se ve el vídeo y se chatea. Verifica el camino completo (auth → token → WebRTC → WS de chat).

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

