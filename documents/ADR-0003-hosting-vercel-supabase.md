# ADR-0003 — Hosting en Vercel + Supabase (sustituye a ADR-0001 §5)

- **Estado:** Aceptado y **desplegado**. Sustituye la decisión de hosting de
  `ADR-0001` §5 (VM única en Oracle Cloud Free Tier), que **nunca llegó a
  ejecutarse**. El resto de `ADR-0001` (capas, framework, API, scheduler) sigue
  vigente.
- **Fecha:** 2026-08-22 (despliegue verificado el 2026-08-21/22).
- **Decisores:** Xavier Vergés (owner).
- **URL pública:** **https://clickoteca.vercel.app**

> Este ADR registra **dónde y cómo corre** la aplicación. El *qué* del dominio no
> cambia: el esquema, las reglas de cola y la máquina de estados son las mismas.

---

## Contexto

`ADR-0001` §5 decidió una **VM única** (Oracle Ampere free) con Caddy, Postgres en
`localhost` y systemd. La decisión era coherente —mismo origen a coste 0— pero
arrastraba dos cargas que el propio ADR anotaba como negativas: **ops propio**
(TLS, parches de SO, firewall, backups por `pg_dump`) y el **riesgo de
reclamación** de la instancia *always-free* si queda ociosa. En un proyecto
académico con fecha de entrega, ambas compiten con el trabajo de producto.

**Vercel + Supabase** conserva el coste 0 y el mismo origen, y cambia el ops propio
por las restricciones de una plataforma *serverless*. El despliegue destapó **tres
supuestos** que `ADR-0001` §5 daba por resueltos y allí no lo están:

1. **No hay Postgres en `localhost`** → hace falta una base gestionada, su
   `DATABASE_URL`, `prisma migrate deploy` y la semilla.
2. **No hay proceso de vida larga** para el scheduler → hace falta un disparador
   por HTTP.
3. **`@node-rs/argon2` es un binario nativo** que podría fallar en *runtime* y no
   en *build* (no falló, pero era el riesgo a comprobar).

Lo que **no** era problema: no se escribe en disco —las imágenes del catálogo son
URLs de Rebrickable, no ficheros locales— y `proxy.ts` corre en runtime Node en
Next 16, así que Prisma en el *proxy* funciona.

---

## Decisión

### 1. Plataforma: Vercel (plan Hobby)

El proyecto de Vercel apunta al repositorio del curso,
`xaviverges/AI4Devs-finalproject-xvm`, con **Production Branch = `MVP-Fase-1`**
(por defecto Vercel despliega *Production* desde `main`, que aquí es el andamiaje
del curso). Cada `push` a esa rama despliega. TLS, dominio y CDN los pone la
plataforma: no hay reverse proxy propio, ni systemd, ni firewall que administrar.

**El modo `output: "standalone"` se desactiva en Vercel.** En ese modo Next se
lleva el trazado de ficheros a `.next/standalone/` y deja de emitir
`.next/next-server.js.nft.json`, que es justo el fichero que abre el paso
`onBuildComplete` de Vercel: el build compila entero, genera las páginas y muere al
final con un `ENOENT` que no menciona "standalone" por ningún lado. Lo decide
`process.env.VERCEL` en `next.config.ts`; en local y en el E2E se sigue construyendo
el paquete autónomo. El script de build es `prisma generate && next build`, porque
`src/generated/prisma` no está versionado.

### 2. Base de datos: Supabase Postgres (solo como Postgres)

Se usa **exclusivamente como base relacional**: ni Auth, ni Storage, ni RLS. La
**Data API de Supabase está desactivada**, porque las tablas que crea Prisma nacen
**sin RLS** y quedarían legibles con la *anon key*, que es pública por diseño.

**Dos URLs, no una** (`ADR-0001` asumía una):

| Variable | Destino | Quién la usa |
|---|---|---|
| `DATABASE_URL` | **Pooler de transacción**, `:6543`, con `uselibpqcompat=true` | La aplicación en runtime |
| `DIRECT_URL` | Conexión de **sesión**, `:5432` | El CLI de Prisma (`migrate deploy`), **solo en el `.env` local** |

- **Por qué el pooler de transacción y no el de sesión:** en modo sesión cada
  cliente retiene una conexión de servidor, así que el techo de clientes *es*
  `pool_size` (15). Con cinco instancias de función se llenaba y la aplicación
  devolvía `EMAXCONNSESSION`. En modo transacción esas 15 conexiones de servidor se
  **multiplexan** entre cientos de clientes.
- **Por qué las migraciones no pasan por el pooler:** necesitan una sesión estable
  para tomar el *advisory lock* y ejecutar DDL. `prisma.config.ts` prefiere
  `DIRECT_URL` si existe y cae a `DATABASE_URL` si no.
- **Por qué `uselibpqcompat=true`:** `pg` v8.16+ interpreta `sslmode=require` como
  `verify-full`, y el certificado del pooler de Supabase encadena a una raíz que
  Node no trae de serie → *"self-signed certificate in certificate chain"*. El
  parámetro devuelve a `require` su significado de libpq (cifrar sin verificar) y
  es la forma que sobrevive al cambio anunciado para `pg` v9. Alternativa estricta:
  la CA de Supabase con `verify-full` y `sslrootcert`.
- **`DATABASE_POOL_MAX=1`** en el despliegue. En *serverless* hay **un pool por
  instancia viva**, y el techo no lo marca la concurrencia de peticiones sino
  `DATABASE_POOL_MAX` × instancias vivas: con 3, unas 67 instancias agotan el
  límite de 200 conexiones del pooler. Peor aún, **una instancia congelada no
  ejecuta temporizadores**, así que el `idleTimeoutMillis` de `pg` nunca cierra la
  conexión ociosa y el hueco queda tomado hasta que Vercel recicla la instancia
  (un redespliegue las destruye y libera todo de golpe: es la palanca de
  emergencia). Con 1, además, los `Promise.all` de las pantallas se serializan
  solos.

Las variables `STORAGE_*` que crea la integración de Supabase **no las lee el
código**: acoplarían el proyecto a los nombres de una integración de Vercel, y el
mismo código tiene que arrancar también en local. `DATABASE_URL` se crea a mano
copiando el valor de la del pooler.

### 3. Trabajos periódicos: cron por HTTP

No hay proceso de vida larga, así que el scheduler no puede correr como en local.
`GET /api/cron/:job` ejecuta **los mismos trabajos**: el *qué* vive en
`src/use-cases/scheduler/jobs.ts` y lo comparten el proceso `scheduler/` y el
endpoint, así que no pueden divergir. Lo que cambia es quién mira el reloj.

- **Candado:** `Authorization: Bearer $CRON_SECRET`, comparado con
  `timingSafeEqual` y **cerrado por defecto**: sin `CRON_SECRET` el endpoint
  responde **404** y no ejecuta nada.
- **`vercel.json` declara los dos crons** (`offers` y `retention`). Tres cosas que
  no son obvias: el cron de Vercel va en **UTC** (10:00 de Madrid = 08:00 UTC en
  verano, 09:00 en invierno); el **plan Hobby** admite dos crons y **solo diarios**
  —una expresión más frecuente **hace fallar el despliegue**, no lo degrada— y los
  dispara en cualquier momento dentro de la hora; y la entrega es *best effort*.
- **Precio aceptado:** la caducidad de ofertas se vuelve **imprecisa** —una ventana
  de 48 h puede cerrarse casi un día tarde—. El dominio no se rompe (todo se decide
  por marcas de tiempo, no por contadores) y los dos trabajos son de
  **reconciliación**, así que una ejecución perdida se cura en la siguiente y una
  repetida no duplica nada salvo, como mucho, un recordatorio. Se recupera con plan
  de pago (`*/5 * * * *`) o disparando el endpoint desde fuera.
- **No hay guardarraíl contra el solape** —el flag en memoria del scheduler no
  sirve cuando cada invocación es un proceso distinto—: lo sostiene el CAS del
  cierre de oferta.

### 4. Lo que se conserva de `ADR-0001`

- **Mismo origen.** Front y `/api` salen del mismo despliegue: sin CORS y con
  cookie de sesión *first-party* (`ADR-0002` sigue íntegro; `Secure` sale de
  `NODE_ENV`).
- **Imágenes** del catálogo: `<img>` a URLs de Rebrickable, no `next/image` ni
  filesystem → no hace falta almacenamiento de objetos.
- **Esquema, dominio y capas** intactos: Postgres es Postgres.

### 5. Credenciales de la instancia desplegada

La semilla usa **un único hash para todas las cuentas**, así que `SEED_PASSWORD` no
es "la clave del admin" sino una **llave maestra del entorno**: quien la tenga entra
también como operador y como administrador. Por eso el `readme.md` documenta
`clickoteca` como contraseña **del entorno local** y las credenciales del despliegue
se entregan **por el canal del curso**.

---

## Alternativas consideradas

| Alternativa | Por qué se descarta |
|---|---|
| **VM única Oracle free** (`ADR-0001` §5) | Ops propio (TLS, parches, firewall, backups) y riesgo de reclamación de la instancia *always-free*; en un MVP con fecha de entrega, ambos compiten con el trabajo de producto. Sigue siendo un destino válido: el paquete autónomo se construye fuera de Vercel. |
| **Pooler de sesión de Supabase (`:5432`) para el runtime** | Cada cliente retiene una conexión de servidor → `EMAXCONNSESSION` con `pool_size: 15` en cuanto hay varias instancias de función. |
| **Postgres gestionado en Neon** | Equivalente en forma (pooler + conexión directa); Supabase llega ya integrado desde el panel de Vercel y con la base en la misma región. |
| **Cliente JS de Supabase / Auth / Storage / RLS** | Duplicaría la capa de acceso a datos que ya da Prisma y la sesión que ya da `ADR-0002`. Se usa solo el Postgres. |
| **Repositorio `xaviverges/clickoteca` creado por Vercel** | No es un fork: un único commit "Initial commit", **sin ancestro común**, con el árbol anterior a los arreglos del despliegue. Dos repos sin ancestro común no se sincronizan sin *force-push*, y la historia del entregable —la que nombra `readme.md` §0.5— es justo lo que hay que conservar. Vercel apunta al repo del curso; ese otro queda archivado. |

---

## Consecuencias

**Positivas**
- **Cero ops:** TLS, CDN, parches y disponibilidad los pone la plataforma; los
  backups, Supabase.
- **Despliegue por `git push`** a `MVP-Fase-1`, con *preview* por rama.
- **Coste 0** y sin riesgo de que un proveedor reclame la instancia por ociosa.
- Mismo origen y cookie *first-party* **sin cambios** en `ADR-0002`.

**Negativas / trade-offs**
- **Crons diarios** en el plan Hobby → caducidad de ofertas imprecisa (ver §3).
- **Presupuesto de conexiones**, que en la VM no existía: `DATABASE_POOL_MAX`,
  instancias congeladas que retienen su hueco y fan-out de `Promise.all` por
  pantalla. `listManaged` va en un `prisma.$transaction([...])` y el catálogo del
  back-office encadena sus consultas por eso; **el patrón sigue vivo en el resto de
  la app** (el portal abre seis consultas a la vez) y es el sitio donde mirar si
  reaparece.
- **La base deja de estar en `localhost`:** cada consulta paga red. Medido contra
  el despliegue, páginas calientes en ~260–290 ms, dominadas por la latencia, con
  Vercel y Supabase en la misma región.
- **Dos proveedores** en lugar de uno, y dos superficies de configuración
  (variables de Vercel, integración de Supabase). `vercel env pull` **no baja** el
  valor real de los secretos de una integración: llegan como `[SENSITIVE]`, así que
  comparar dos de esas variables no prueba nada y la única forma fiable de validar
  una credencial es **intentar conectar**.
- **Diagnóstico más opaco:** el `digest` de error de Next es `stringHash(mensaje +
  stack)` y **no es reversible**; el mensaje solo sale de
  `vercel logs --level error --since <t>`.

---

## Referencias

- `ADR-0001` §4 (scheduler) y §5 (hosting sustituido), `ADR-0002` (sesión y errores).
- `documents/C4-architecture.md` §2 (nivel de contenedores).
- `readme.md` §2.4 (infraestructura y despliegue).
- `vercel.json`, `next.config.ts`, `prisma.config.ts`, `src/db/prisma.ts`,
  `app/api/cron/[job]/route.ts`, `.env.example`.
