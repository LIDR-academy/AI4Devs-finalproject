# MVP Validation Checklist

## Objetivo

Esta guía sirve para validar la `v1` del proyecto antes de continuar con nuevas historias.

La validación queda limitada al alcance `T-01` a `T-05`.

## Preparación

1. Configurar `.env.local` a partir de `.env.local.example`.
2. Ejecutar `npm install`.
3. Ejecutar `npx prisma generate`.
4. Ejecutar `npx prisma db push` o la migración local equivalente.
5. Crear en Supabase Auth los usuarios demo.
6. Copiar sus UUID reales a `DEMO_ADMIN_ID`, `DEMO_PARTNER_ID` y `DEMO_SELLER_ID` dentro de `.env.local`.
7. Ejecutar `npm run seed`.

## Validación funcional

### T-01 Autenticación, perfiles y roles

1. Iniciar sesión con un usuario activo.
2. Verificar que el panel principal cargue.
3. Desactivar un perfil en `user_profiles`.
4. Confirmar que el usuario desactivado ya no accede al panel.

### T-03 y T-04 Clientes y visibilidad

1. Iniciar sesión como vendedor.
2. Crear un cliente desde `/clients/new`.
3. Verificar que el cliente figure en `/clients`.
4. Iniciar sesión con otro vendedor o usuario sin asignación.
5. Confirmar que no puede abrir el detalle del cliente por URL directa.

### T-05 Proveedores

1. Iniciar sesión como administrador o partner.
2. Crear un proveedor desde `/suppliers/new`.
3. Confirmar que aparece en `/suppliers`.

### Criterio de cierre funcional

1. Un usuario activo puede iniciar sesión.
2. Un vendedor puede crear un cliente.
3. Ese vendedor ve el cliente en su listado.
4. Un usuario no asignado no puede abrir ese detalle si no tiene permisos globales.
5. Un administrador o partner puede crear un proveedor y verlo en el listado.

## Cierre técnico

1. Ejecutar `npm run lint`.
2. Ejecutar `npm run build`.
3. Registrar cualquier incidencia antes de ampliar el backlog.