# V1 Quickstart

## Objetivo

Esta guía resume los pasos mínimos para instalar, ejecutar y validar la `v1` del proyecto.

La `v1` cubre únicamente `T-01` a `T-05`:

- autenticación base;
- perfiles y roles;
- creación de clientes;
- visibilidad de clientes por asignación;
- creación de proveedores.

## Pasos rápidos

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local` a partir de [.env.local.example](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/.env.local.example).

3. Completa al menos estas variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
DEMO_ADMIN_ID="uuid-admin"
DEMO_PARTNER_ID="uuid-partner"
DEMO_SELLER_ID="uuid-seller"
```

4. Genera Prisma y sincroniza el esquema:

```bash
npx prisma generate
npx prisma db push
```

5. Crea en Supabase Auth tres usuarios demo y usa sus UUID reales en `.env.local`.

6. Ejecuta el seed:

```bash
npm run seed
```

7. Arranca la aplicación:

```bash
npm run dev
```

8. Abre:

```bash
http://localhost:3000
```

## Qué validar

1. El login funciona en `/login`.
2. Un vendedor puede crear un cliente en `/clients/new`.
3. Ese cliente aparece en `/clients` solo para usuarios con permiso.
4. Un admin o partner puede crear un proveedor en `/suppliers/new`.
5. `npm run lint` y `npm run build` terminan sin errores.

## Documentación completa

Para el detalle técnico completo revisa:

- [docs/v1-technical-guide.md](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/docs/v1-technical-guide.md)
- [docs/mvp-validation-checklist.md](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/docs/mvp-validation-checklist.md)
- [docs/mvp-backlog.md](c:/Users/jppa_/Documents/0-Courses/AI4Devs/ProyectoFinal/AI4Devs-finalproject-jpp/docs/mvp-backlog.md)