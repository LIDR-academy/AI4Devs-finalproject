# Guía Técnica v1

## Objetivo

Este documento describe cómo instalar, ejecutar y validar la versión `v1` del proyecto.

La `v1` corresponde al corte funcional definido en [docs/mvp-backlog.md](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/docs/mvp-backlog.md) y queda limitada a los tickets `T-01` a `T-05`.

## Alcance funcional de la v1

La versión `v1` incluye:

- autenticación base con Supabase Auth;
- resolución del usuario actual y control de usuario activo/inactivo;
- modelo de datos inicial con perfiles, clientes, asignaciones y proveedores;
- creación de clientes;
- visibilidad de clientes según rol y asignación;
- creación de proveedores para usuarios autorizados.

La `v1` no debe validarse contra productos, órdenes ni flujos posteriores del backlog.

## Requisitos previos

Necesitas lo siguiente antes de iniciar:

- Node.js `20` o superior.
- npm instalado.
- un proyecto de Supabase con Auth habilitado.
- una base de datos PostgreSQL accesible desde Prisma.
- acceso al repositorio local.

## Estructura relevante de la v1

Los archivos principales para esta versión son:

- [package.json](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/package.json)
- [prisma/schema.prisma](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/prisma/schema.prisma)
- [prisma/seed.ts](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/prisma/seed.ts)
- [.env.local.example](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/.env.local.example)
- [src/app/login/page.tsx](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/src/app/login/page.tsx)
- [src/app/clients/page.tsx](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/src/app/clients/page.tsx)
- [src/app/clients/new/page.tsx](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/src/app/clients/new/page.tsx)
- [src/app/suppliers/page.tsx](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/src/app/suppliers/page.tsx)
- [src/app/suppliers/new/page.tsx](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/src/app/suppliers/new/page.tsx)

## Variables de entorno

1. Crea un archivo `.env.local` a partir de [.env.local.example](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/.env.local.example).
2. Completa estas variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

DEMO_ADMIN_ID="uuid-del-usuario-admin-en-supabase-auth"
DEMO_PARTNER_ID="uuid-del-usuario-partner-en-supabase-auth"
DEMO_SELLER_ID="uuid-del-usuario-seller-en-supabase-auth"
```

## Instalación local

Desde la raíz del proyecto ejecuta:

```bash
npm install
```

Después genera el cliente Prisma:

```bash
npx prisma generate
```

## Inicialización de la base de datos

Como esta versión no incluye todavía una carpeta de migraciones versionadas, la forma más directa de levantar el esquema es:

```bash
npx prisma db push
```

Si quieres crear la primera migración local en lugar de usar `db push`, puedes ejecutar:

```bash
npx prisma migrate dev --name init_v1
```

## Preparación de usuarios demo

La aplicación resuelve el perfil interno a partir del `id` del usuario autenticado en Supabase Auth. Eso implica que primero debes crear los usuarios en Supabase Auth y luego usar esos UUID en `.env.local`.

Usuarios mínimos recomendados:

1. un usuario `ADMIN`;
2. un usuario `PARTNER`;
3. un usuario `SELLER`.

Proceso recomendado:

1. Crea los tres usuarios en Supabase Auth con email y contraseña.
2. Copia el `UUID` real de cada usuario desde Supabase.
3. Pega esos UUID en `DEMO_ADMIN_ID`, `DEMO_PARTNER_ID` y `DEMO_SELLER_ID` dentro de `.env.local`.
4. Ejecuta el seed para crear los perfiles internos:

```bash
npm run seed
```

## Qué hace el seed en la v1

El script [prisma/seed.ts](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/prisma/seed.ts):

- crea o actualiza los perfiles internos para `ADMIN`, `PARTNER` y `SELLER`;
- deja esos perfiles activos;
- inserta proveedores demo;
- inserta productos demo.

Aunque el seed crea productos de ejemplo, la validación de la `v1` debe centrarse solo en T-01 a T-05.

## Ejecución local

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación quedará disponible en:

```bash
http://localhost:3000
```

## Rutas principales a validar en la v1

- `/login`
- `/`
- `/clients`
- `/clients/new`
- `/suppliers`
- `/suppliers/new`

## Flujo recomendado de validación funcional

### Validación de autenticación

1. Abre `/login`.
2. Inicia sesión con un usuario existente en Supabase Auth.
3. Verifica que el panel principal cargue.
4. Cambia `is_active` del perfil a `false` en `user_profiles`.
5. Intenta volver a entrar y verifica que el acceso operativo quede bloqueado.

### Validación de clientes

1. Inicia sesión con el usuario vendedor.
2. Abre `/clients/new`.
3. Crea un cliente con datos mínimos.
4. Verifica que el cliente aparezca en `/clients`.
5. Verifica que el detalle del cliente cargue correctamente.

### Validación de visibilidad por asignación

1. Crea un cliente desde el usuario vendedor `A`.
2. Inicia sesión con otro usuario sin asignación al cliente.
3. Intenta abrir `/clients` y el detalle directo por URL.
4. Verifica que ese usuario no vea el cliente o no pueda abrirlo si no tiene permisos.
5. Inicia sesión con `ADMIN` o `PARTNER` y verifica que sí pueda verlo.

### Validación de proveedores

1. Inicia sesión con `ADMIN` o `PARTNER`.
2. Abre `/suppliers/new`.
3. Crea un proveedor.
4. Verifica que aparezca en `/suppliers`.
5. Inicia sesión con `SELLER` y confirma que no puede gestionar proveedores.

## Validación técnica mínima

Ejecuta estos comandos desde la raíz del proyecto:

```bash
npx prisma generate
npm run lint
npm run build
```

El resultado esperado es que los tres comandos terminen sin errores.

## Limitaciones conocidas de la v1

- La `v1` no incluye todavía productos como flujo funcional validable, aunque el esquema y el seed ya los contemplan.
- La `v1` no incluye creación de órdenes, alertas por múltiples proveedores ni permisos transversales completos.
- La inicialización recomendada usa `prisma db push` porque aún no existe un historial de migraciones consolidado en el repositorio.

## Criterio de aceptación de instalación

La instalación local de la `v1` se considera correcta si:

- el proyecto instala dependencias sin errores;
- Prisma genera cliente y sincroniza esquema;
- los usuarios de Supabase Auth pueden vincularse a `user_profiles` mediante el seed;
- la aplicación arranca en local;
- y la validación funcional de T-01 a T-05 se puede ejecutar de principio a fin.